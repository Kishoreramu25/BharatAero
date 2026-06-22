const db = require('../config/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const hashPassword = (password) => {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, hashedPassword) => {
  try {
    const [salt, storedHash] = hashedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
  } catch (error) {
    return false;
  }
};

const generateSecureOTP = () => {
  const randomBytes = crypto.randomBytes(3);
  const otp = (randomBytes.readUIntBE(0, 3) % 1000000).toString().padStart(6, '0');
  console.log(`\n\n🎯 DEVELOPMENT MODE - OTP FOR EMAIL: ${otp}\n\n`);
  return otp;
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
};

const validatePasswordStrength = (password) => {
  const metrics = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  return Object.values(metrics).every(Boolean);
};

const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    const response = await resend.emails.send({
      from: 'BharatAero <onboarding@resend.dev>',
      to: email,
      subject: 'Your BharatAero Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to BharatAero, ${name}! 🚁</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #007AFF; color: white; padding: 20px; border-radius: 8px; text-align: center; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
          <p style="color: #666;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">BharatAero - Drone Services Platform</p>
        </div>
      `
    });
    return (response.id || (response.data && response.data.id)) ? true : false;
  } catch (error) {
    console.error('[Email] Send error:', error);
    return false;
  }
};

const saveOTP = async (email, otp, purpose) => {
  await db.query(
    "INSERT INTO otp_verification (email, otp_code, purpose, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')",
    [email, otp, purpose]
  );
};

const verifyAndMarkOTP = async (email, otp, purpose) => {
  const result = await db.query(
    'SELECT * FROM otp_verification WHERE email = $1 AND otp_code = $2 AND purpose = $3 AND is_verified = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [email, otp, purpose]
  );
  if (result.rows.length === 0) return false;
  
  await db.query('UPDATE otp_verification SET is_verified = TRUE, verified_at = NOW() WHERE id = $1', [result.rows[0].id]);
  return true;
};

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION FLOW
// ═══════════════════════════════════════════════════════════════════════════

exports.registerInit = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({ success: false, error: { message: 'Password is too weak. Needs 8+ chars, upper, lower, number, and special char.' } });
    }

    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ success: false, error: { message: 'Email already registered.' } });
    }

    const otp = generateSecureOTP();
    await saveOTP(email, otp, 'signup');
    await sendOTPEmail(email, otp, name);

    res.json({ success: true, message: 'OTP sent to email.', session_id: email });
  } catch (error) {
    console.error('Register Init Error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};

exports.registerVerify = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    const isValid = await verifyAndMarkOTP(email, otp, 'signup');
    if (!isValid) return res.status(400).json({ success: false, error: { message: 'Invalid or expired OTP.' } });

    const hashedPassword = hashPassword(password);

    const result = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id, email: user.email, role: 'client' });

    res.json({ success: true, user, token, message: 'Account created successfully.' });
  } catch (error) {
    console.error('Register Verify Error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN FLOW
// ═══════════════════════════════════════════════════════════════════════════

exports.loginInit = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT id, name, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: { message: 'Invalid email or password.' } });
    }

    const otp = generateSecureOTP();
    await saveOTP(email, otp, 'login');
    await sendOTPEmail(email, otp, user.name);

    res.json({ success: true, message: 'OTP sent to email.', session_id: email });
  } catch (error) {
    console.error('Login Init Error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};

exports.loginVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const isValid = await verifyAndMarkOTP(email, otp, 'login');
    if (!isValid) return res.status(400).json({ success: false, error: { message: 'Invalid or expired OTP.' } });

    const result = await db.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    await db.query(
      'INSERT INTO login_history (user_id, ip_address, device_info) VALUES ($1, $2, $3)',
      [user.id, req.ip, req.headers['user-agent']]
    );

    const token = generateToken({ userId: user.id, email: user.email, role: 'client' });
    res.json({ success: true, user, token, message: 'Login successful.' });
  } catch (error) {
    console.error('Login Verify Error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PASSWORD RESET FLOW
// ═══════════════════════════════════════════════════════════════════════════

exports.passwordForgot = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Don't reveal account existence
      return res.json({ success: true, message: 'If the email exists, an OTP has been sent.' });
    }

    const otp = generateSecureOTP();
    await saveOTP(email, otp, 'reset');
    await sendOTPEmail(email, otp, result.rows[0].name);

    res.json({ success: true, message: 'OTP sent to email.' });
  } catch (error) {
    console.error('Password Forgot Error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};

exports.passwordVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await verifyAndMarkOTP(email, otp, 'reset');
    if (!isValid) return res.status(400).json({ success: false, error: { message: 'Invalid or expired OTP.' } });

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store temporarily in Redis or DB. For simplicity, sign it as JWT.
    const token = jwt.sign({ email, type: 'reset' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });

    res.json({ success: true, reset_token: token });
  } catch (error) {
    console.error('Password Verify Error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    const { reset_token, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, error: { message: 'Passwords do not match.' } });
    }

    if (!validatePasswordStrength(new_password)) {
      return res.status(400).json({ success: false, error: { message: 'Password is too weak.' } });
    }

    const decoded = jwt.verify(reset_token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.type !== 'reset') throw new Error('Invalid token type');

    const hashedPassword = hashPassword(new_password);
    const result = await db.query('UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id', [hashedPassword, decoded.email]);

    await db.query('INSERT INTO password_reset_history (user_id) VALUES ($1)', [result.rows[0].id]);

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error('Password Reset Error:', error);
    res.status(400).json({ success: false, error: { message: 'Invalid or expired reset session.' } });
  }
};