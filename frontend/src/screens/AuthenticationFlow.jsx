import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/AuthenticationFlow.css';

export const AuthenticationFlow = () => {
  const { setIsLoggedIn, setUserRole } = useContext(AppContext);
  const [step, setStep] = useState('role-selection');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  // ═══════════════════════════════════════════════════════════════════════════
  // OTP Timer
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Lockout Timer
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTimer === 0 && isLocked) {
      setIsLocked(false);
    }
  }, [lockoutTimer, isLocked]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSWORD STRENGTH VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  const validatePassword = async (pwd) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/validate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });

      const data = await response.json();
      if (data.success) {
        setPasswordStrength(data);
      }
    } catch (error) {
      console.error('Password validation error:', error);
    }
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (pwd.length > 0) {
      validatePassword(pwd);
    } else {
      setPasswordStrength(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK EMAIL EXISTS
  // ═══════════════════════════════════════════════════════════════════════════

  const checkEmailExists = async (emailToCheck) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck })
      });

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REQUEST OTP
  // ═══════════════════════════════════════════════════════════════════════════

  const handleRequestOTP = async () => {
    setErrors({});
    setLoading(true);

    try {
      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrors({ email: 'Invalid email format' });
        setLoading(false);
        return;
      }

      // Check if account exists for signup
      if (step === 'email-verification') {
        const exists = await checkEmailExists(email);
        if (exists) {
          setErrors({ email: 'Account already exists. Please login or use forgot password.' });
          setLoading(false);
          return;
        }
      }

      // Request OTP
      const response = await fetch('http://localhost:5000/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          channel: 'email'
        })
      });

      const data = await response.json();

      if (data.success) {
        setOtpTimer(30); // 30 seconds timer
        setOtpAttempts(0);
        setStep('otp-verification');
      } else {
        setErrors({ otp: data.error?.message || 'Failed to send OTP' });
      }
    } catch (error) {
      setErrors({ otp: 'Failed to request OTP' });
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFY OTP
  // ═══════════════════════════════════════════════════════════════════════════

  const handleVerifyOTP = async () => {
    if (isLocked) {
      setErrors({ otp: `Account locked. Try again in ${lockoutTimer} seconds.` });
      return;
    }

    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, channel: 'email' })
      });

      const data = await response.json();

      if (data.success) {
        setVerificationToken(data.verificationToken);
        setStep('password-setup');
      } else {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);

        if (data.error.locked) {
          setIsLocked(true);
          setLockoutTimer(600); // 10 minutes
          setErrors({ otp: 'Too many failed attempts. Locked for 10 minutes.' });
        } else {
          setErrors({ otp: data.error.message });
        }
      }
    } catch (error) {
      setErrors({ otp: 'Failed to verify OTP' });
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETE REGISTRATION
  // ═══════════════════════════════════════════════════════════════════════════

  const handleRegister = async () => {
    setErrors({});

    if (!password || password.length < 12) {
      setErrors({ password: 'Password must be at least 12 characters' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (!passwordStrength || passwordStrength.strength !== 'Strong') {
      setErrors({ password: 'Password does not meet security requirements' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password,
          verificationToken,
          userRole: 'pilot'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token
        await SecureStorage.set({
          key: 'bharataero_auth_token',
          value: data.token
        });

        setIsLoggedIn(true);
        // Navigate to dashboard
      } else {
        setErrors({ general: data.error?.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSWORD STRENGTH INDICATOR
  // ═══════════════════════════════════════════════════════════════════════════

  const renderPasswordStrength = () => {
    if (!passwordStrength) return null;

    const strengthColor = {
      'Weak': '#FF3B30',
      'Medium': '#FF9500',
      'Strong': '#34C759'
    };

    return (
      <div className="password-strength-container">
        <div className="strength-bar">
          <div
            className="strength-fill"
            style={{
              width: `${passwordStrength.score}%`,
              backgroundColor: strengthColor[passwordStrength.strength]
            }}
          />
        </div>
        <span className="strength-label" style={{ color: strengthColor[passwordStrength.strength] }}>
          {passwordStrength.strength}
        </span>
        
        <div className="strength-requirements">
          {passwordStrength.metrics.length >= 12 && <span className="req-ok">✓ 12+ characters</span>}
          {passwordStrength.metrics.uppercase && <span className="req-ok">✓ Uppercase</span>}
          {passwordStrength.metrics.lowercase && <span className="req-ok">✓ Lowercase</span>}
          {passwordStrength.metrics.numbers && <span className="req-ok">✓ Numbers</span>}
          {passwordStrength.metrics.special && <span className="req-ok">✓ Special chars</span>}
        </div>

        {passwordStrength.feedback.length > 0 && (
          <div className="feedback">
            {passwordStrength.feedback.map((msg, i) => (
              <p key={i}>• {msg}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OTP SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === 'otp-verification') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit code to {email}</p>

          <div className="timer-display">
            <span className={otpTimer > 0 ? 'active' : 'expired'}>
              ⏱️ {otpTimer > 0 ? otpTimer : 'Code expired'}
            </span>
          </div>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            placeholder="000000"
            maxLength="6"
            className="otp-input"
            disabled={isLocked || otpTimer === 0}
          />

          {errors.otp && <span className="error">{errors.otp}</span>}

          {otpAttempts > 0 && otpAttempts < 5 && (
            <p className="attempts">Attempts remaining: {5 - otpAttempts}</p>
          )}

          <button
            onClick={handleVerifyOTP}
            disabled={loading || isLocked || otpTimer === 0 || otp.length !== 6}
            className="btn-primary"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {otpTimer === 0 && !isLocked && (
            <button onClick={handleRequestOTP} className="btn-link">
              Resend OTP
            </button>
          )}

          {lockoutTimer > 0 && (
            <p className="lockout-message">
              Locked until: {Math.floor(lockoutTimer / 60)}m {lockoutTimer % 60}s
            </p>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSWORD SETUP SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === 'password-setup') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Your Password</h2>
          <p>Password must be strong with mixed characters</p>

          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter password"
            className="input-field"
          />

          {renderPasswordStrength()}

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="input-field"
          />

          {errors.password && <span className="error">{errors.password}</span>}
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

          <button
            onClick={handleRegister}
            disabled={loading || !passwordStrength || passwordStrength.strength !== 'Strong' || password !== confirmPassword}
            className="btn-primary"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMAIL VERIFICATION SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="input-field"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="input-field"
        />

        {errors.email && <span className="error">{errors.email}</span>}

        <button
          onClick={handleRequestOTP}
          disabled={loading || !email}
          className="btn-primary"
        >
          {loading ? 'Sending OTP...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AuthenticationFlow;
