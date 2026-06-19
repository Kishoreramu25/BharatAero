// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE-GRADE AUTHENTICATION CONTROLLER
// OTP + Password Strength + Account Verification + Recovery
// ═══════════════════════════════════════════════════════════════════════════

const crypto = require('crypto');
const { Resend } = require('resend');
const twilio = require('twilio');
const { generateToken } = require('../utils/jwt');
const redisClient = require('../config/redis');

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ═══════════════════════════════════════════════════════════════════════════
// PASSWORD STRENGTH VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════

const validatePasswordStrength = (password) => {
  const metrics = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password),
  };

  // Calculate strength score
  let score = 0;
  if (metrics.length) score += 20;
  if (password.length >= 16) score += 10;
  if (metrics.uppercase) score += 20;
  if (metrics.lowercase) score += 20;
  if (metrics.numbers) score += 15;
  if (metrics.special) score += 15;

  // Determine strength level
  let strength = 'Weak';
  if (score >= 70 && metrics.length && metrics.uppercase && metrics.lowercase && metrics.numbers && metrics.special) {
    strength = 'Strong';
  } else if (score >= 50) {
    strength = 'Medium';
  }

  return {
    score: Math.min(score, 100),
    strength,
    metrics,
    feedback: generatePasswordFeedback(metrics, password.length)
  };
};

const generatePasswordFeedback = (metrics, length) => {
  const feedback = [];
  if (length < 12) feedback.push('Use at least 12 characters');
  if (!metrics.uppercase) feedback.push('Add uppercase letters (A-Z)');
  if (!metrics.lowercase) feedback.push('Add lowercase letters (a-z)');
  if (!metrics.numbers) feedback.push('Add numbers (0-9)');
  if (!metrics.special) feedback.push('Add special characters (!@#$%^&*)');
  return feedback;
};

// ═══════════════════════════════════════════════════════════════════════════
// PASSWORD HASHING & VERIFICATION
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

// ═══════════════════════════════════════════════════════════════════════════
// OTP GENERATION & MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const generateSecureOTP = () => {
  // Generate cryptographically secure 6-digit OTP
  const randomBytes = crypto.randomBytes(3);
  const otp = (randomBytes.readUIntBE(0, 3) % 1000000).toString().padStart(6, '0');
  return otp;
};

const storeOTP = async (identifier, otp, channel = 'email') => {
  const redisKey = `otp:${identifier}:${channel}`;
  const expiryKey = `otp_expiry:${identifier}:${channel}`;
  const attemptsKey = `otp_attempts:${identifier}:${channel}`;
  
  try {
    // Store OTP with 10-minute expiry
    await redisClient.setex(redisKey, 600, otp);
    await redisClient.setex(expiryKey, 600, Date.now() + 600000);
    
    // Initialize attempts if not exists
    const attempts = await redisClient.get(attemptsKey);
    if (!attempts) {
      await redisClient.setex(attemptsKey, 3600, '0'); // 1-hour window
    }
    
    return true;
  } catch (error) {
    console.error('[OTP] Storage error:', error);
    return false;
  }
};

const verifyOTPWithRateLimit = async (identifier, otp, channel = 'email') => {
  const redisKey = `otp:${identifier}:${channel}`;
  const attemptsKey = `otp_attempts:${identifier}:${channel}`;
  const lockoutKey = `otp_lockout:${identifier}:${channel}`;
  
  try {
    // Check if locked out
    const lockout = await redisClient.get(lockoutKey);
    if (lockout) {
      return {
        success: false,
        error: 'Too many failed attempts. Please try again after 10 minutes.',
        remainingTime: await redisClient.ttl(lockoutKey)
      };
    }
    
    // Get stored OTP
    const storedOTP = await redisClient.get(redisKey);
    if (!storedOTP) {
      return {
        success: false,
        error: 'OTP expired. Please request a new one.'
      };
    }
    
    // Get attempts count
    let attempts = parseInt(await redisClient.get(attemptsKey) || '0');
    
    // Timing-safe comparison
    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(Buffer.from(storedOTP), Buffer.from(otp.trim()));
    } catch {
      isValid = false;
    }
    
    if (!isValid) {
      attempts++;
      
      // After 5 failed attempts, lock for 10 minutes
      if (attempts >= 5) {
        await redisClient.setex(lockoutKey, 600, '1');
        await redisClient.del(attemptsKey);
        return {
          success: false,
          error: 'Too many failed attempts. Try again in 10 minutes.',
          locked: true,
          remainingTime: 600
        };
      }
      
      await redisClient.setex(attemptsKey, 3600, attempts.toString());
      return {
        success: false,
        error: `Wrong OTP. ${5 - attempts} attempts remaining.`,
        remainingAttempts: 5 - attempts
      };
    }
    
    // Success - clean up
    await redisClient.del(redisKey);
    await redisClient.del(attemptsKey);
    await redisClient.del(lockoutKey);
    
    return { success: true };
  } catch (error) {
    console.error('[OTP] Verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SENDING VIA RESEND
// ═══════════════════════════════════════════════════════════════════════════

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
    
    return response.id ? true : false;
  } catch (error) {
    console.error('[Email] Send error:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SMS SENDING VIA TWILIO
// ═══════════════════════════════════════════════════════════════════════════

const sendOTPSMS = async (phone, otp) => {
  try {
    const message = await twilioClient.messages.create({
      body: `Your BharatAero verification code is: ${otp}. Valid for 10 minutes. Never share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    return message.sid ? true : false;
  } catch (error) {
    console.error('[SMS] Send error:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CHECK IF ACCOUNT EXISTS
// ═══════════════════════════════════════════════════════════════════════════

const checkAccountExists = async (email) => {
  try {
    // In real implementation, query your database
    const existingUser = await new Promise((resolve) => {
      // Mock check - replace with actual DB query
      setTimeout(() => resolve(null), 100);
    });
    
    return !!existingUser;
  } catch (error) {
    console.error('[Account] Check error:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid email format' }
      });
    }
    
    const exists = await checkAccountExists(email);
    
    return res.status(200).json({
      success: true,
      exists,
      message: exists ? 'Account exists' : 'Account available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Email check failed' }
    });
  }
};

exports.requestOTP = async (req, res) => {
  try {
    const { email, phone, name, channel = 'email' } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email or phone number required' }
      });
    }
    
    const identifier = email || phone;
    const rateLimit Key = `otp_rate:${identifier}`;
    
    // Rate limit: 3 requests per minute
    const requestCount = await redisClient.incr(rateLimit Key);
    if (requestCount === 1) {
      await redisClient.expire(rateLimit Key, 60);
    }
    
    if (requestCount > 3) {
      return res.status(429).json({
        success: false,
        error: { message: 'Too many OTP requests. Try again in 1 minute.' }
      });
    }
    
    // Generate and store OTP
    const otp = generateSecureOTP();
    const stored = await storeOTP(identifier, otp, channel);
    
    if (!stored) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to generate OTP' }
      });
    }
    
    // Send OTP
    let sent = false;
    if (channel === 'email' && email) {
      sent = await sendOTPEmail(email, otp, name || 'User');
    } else if (channel === 'sms' && phone) {
      sent = await sendOTPSMS(phone, otp);
    }
    
    if (!sent) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to send OTP. Please try again.' }
      });
    }
    
    res.status(200).json({
      success: true,
      message: `OTP sent to ${channel === 'email' ? email : phone}`,
      expiresIn: 600,
      channel
    });
  } catch (error) {
    console.error('[OTP Request] Error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'OTP request failed' }
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, phone, code, channel = 'email' } = req.body;
    
    if (!code || code.trim().length !== 6 || isNaN(Number(code))) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid OTP format. Must be 6 digits.' }
      });
    }
    
    const identifier = email || phone;
    const result = await verifyOTPWithRateLimit(identifier, code, channel);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.error,
          locked: result.locked || false,
          remainingAttempts: result.remainingAttempts
        }
      });
    }
    
    // Store verification token for next step (password setup)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await redisClient.setex(`verify_token:${identifier}`, 600, verificationToken);
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verificationToken,
      nextStep: 'setup_password'
    });
  } catch (error) {
    console.error('[OTP Verify] Error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'OTP verification failed' }
    });
  }
};

exports.validatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 8 characters' }
      });
    }
    
    const strength = validatePasswordStrength(password);
    
    res.status(200).json({
      success: true,
      strength: strength.strength,
      score: strength.score,
      metrics: strength.metrics,
      feedback: strength.feedback,
      isAcceptable: strength.strength === 'Strong'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Password validation failed' }
    });
  }
};

exports.completeRegistration = async (req, res) => {
  try {
    const { email, phone, password, verificationToken, name, userRole } = req.body;
    
    const identifier = email || phone;
    
    // Verify token
    const token = await redisClient.get(`verify_token:${identifier}`);
    if (!token || token !== verificationToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired verification token' }
      });
    }
    
    // Validate password strength
    const strength = validatePasswordStrength(password);
    if (strength.strength !== 'Strong') {
      return res.status(400).json({
        success: false,
        error: { message: 'Password does not meet security requirements' }
      });
    }
    
    // Check if account already exists
    const exists = await checkAccountExists(email);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: { message: 'Account already exists. Please login or use forgot password.' }
      });
    }
    
    // Hash password
    const hashedPassword = hashPassword(password);
    
    // Create user (in real implementation)
    const user = {
      id: crypto.randomUUID(),
      email,
      phone,
      name,
      userRole,
      password_hash: hashedPassword,
      created_at: new Date(),
      verified_at: new Date()
    };
    
    // Generate JWT token
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.userRole
    });
    
    // Clean up verification token
    await redisClient.del(`verify_token:${identifier}`);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userRole
      },
      token: jwtToken,
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('[Registration] Error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' }
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid email format' }
      });
    }
    
    // Check if account exists
    const exists = await checkAccountExists(email);
    if (!exists) {
      // For security, don't reveal if account exists
      return res.status(200).json({
        success: true,
        message: 'If account exists, password reset link has been sent'
      });
    }
    
    // Generate and send OTP
    const otp = generateSecureOTP();
    await storeOTP(email, otp, 'password_reset');
    await sendOTPEmail(email, otp, 'User');
    
    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      expiresIn: 600
    });
  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process password reset' }
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    
    if (!code || code.trim().length !== 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid OTP format' }
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Passwords do not match' }
      });
    }
    
    // Verify OTP
    const result = await verifyOTPWithRateLimit(email, code, 'password_reset');
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { message: result.error }
      });
    }
    
    // Validate new password strength
    const strength = validatePasswordStrength(newPassword);
    if (strength.strength !== 'Strong') {
      return res.status(400).json({
        success: false,
        error: { message: 'Password does not meet security requirements' }
      });
    }
    
    // Hash and update password (in real implementation)
    const hashedPassword = hashPassword(newPassword);
    
    // Update in database
    // await User.update({ password_hash: hashedPassword }, { where: { email } });
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('[Reset Password] Error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Password reset failed' }
    });
  }
};

