// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE AUTH LOGIC FOR EXISTING LOGIN SCREEN
// Password Strength, OTP Timer, Rate Limiting, Account Verification
// ═══════════════════════════════════════════════════════════════════════════

import { SecureStorage } from './SecureStorage';

const API_BASE = 'http://localhost:5000';

// ═══════════════════════════════════════════════════════════════════════════
// PASSWORD STRENGTH VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export const validatePasswordStrength = (password) => {
  const metrics = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password),
  };

  let score = 0;
  if (metrics.length) score += 20;
  if (password.length >= 16) score += 10;
  if (metrics.uppercase) score += 20;
  if (metrics.lowercase) score += 20;
  if (metrics.numbers) score += 15;
  if (metrics.special) score += 15;

  let strength = 'Weak';
  if (score >= 70 && metrics.length && metrics.uppercase && metrics.lowercase && metrics.numbers && metrics.special) {
    strength = 'Strong';
  } else if (score >= 50) {
    strength = 'Medium';
  }

  const feedback = [];
  if (password.length < 12) feedback.push('Use at least 12 characters');
  if (!metrics.uppercase) feedback.push('Add uppercase letters (A-Z)');
  if (!metrics.lowercase) feedback.push('Add lowercase letters (a-z)');
  if (!metrics.numbers) feedback.push('Add numbers (0-9)');
  if (!metrics.special) feedback.push('Add special characters (!@#$%^&*)');

  return {
    score: Math.min(score, 100),
    strength,
    metrics,
    feedback,
    isAcceptable: strength === 'Strong'
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// OTP TIMER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export const startOTPTimer = (durationSeconds = 30) => {
  return new Promise((resolve) => {
    let remaining = durationSeconds;
    const interval = setInterval(() => {
      remaining--;
      resolve({ remaining, isExpired: remaining <= 0 });
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// OTP REQUEST & VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export const requestOTP = async (email, name = 'User', channel = 'email') => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, channel })
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        expiresIn: data.expiresIn,
        message: data.message
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Failed to send OTP'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to request OTP'
    };
  }
};

export const verifyOTP = async (email, code) => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, channel: 'email' })
    });

    const data = await response.json();

    if (data.success) {
      // Store verification token for next step
      await SecureStorage.set({
        key: 'bharataero_verify_token',
        value: data.verificationToken
      });

      return {
        success: true,
        verificationToken: data.verificationToken
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'OTP verification failed',
        locked: data.error?.locked || false,
        remainingAttempts: data.error?.remainingAttempts,
        remainingTime: data.error?.remainingTime
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'OTP verification failed'
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CHECK IF ACCOUNT EXISTS
// ═══════════════════════════════════════════════════════════════════════════

export const checkAccountExists = async (email) => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    return data.exists || false;
  } catch (error) {
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE REGISTRATION WITH PASSWORD
// ═══════════════════════════════════════════════════════════════════════════

export const completeRegistration = async (email, name, password, userRole = 'pilot') => {
  try {
    const verificationToken = await SecureStorage.get({
      key: 'bharataero_verify_token'
    });

    if (!verificationToken) {
      return {
        success: false,
        error: 'Verification token expired. Please try again.'
      };
    }

    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        password,
        verificationToken,
        userRole
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store JWT token
      await SecureStorage.set({
        key: 'bharataero_auth_token',
        value: data.token
      });

      // Clean up verification token
      await SecureStorage.delete({ key: 'bharataero_verify_token' });

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } else {
      if (data.error?.message.includes('already exists')) {
        return {
          success: false,
          error: 'Account already exists. Please login or use forgot password.',
          accountExists: true
        };
      }
      return {
        success: false,
        error: data.error?.message || 'Registration failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Registration failed'
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD & RESET
// ═══════════════════════════════════════════════════════════════════════════

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    return {
      success: data.success,
      message: data.message || 'Password reset email sent'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to process password reset'
    };
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code,
        newPassword,
        confirmPassword: newPassword
      })
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: 'Password reset successfully. Please login.'
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Password reset failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Password reset failed'
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATE PASSWORD ONLINE
// ═══════════════════════════════════════════════════════════════════════════

export const validatePasswordOnline = async (password) => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/validate-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        strength: data.strength,
        score: data.score,
        metrics: data.metrics,
        feedback: data.feedback,
        isAcceptable: data.isAcceptable
      };
    }
    
    return validatePasswordStrength(password);
  } catch (error) {
    // Fallback to local validation
    return validatePasswordStrength(password);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// OTP TIMER HOOK (for React components)
// ═══════════════════════════════════════════════════════════════════════════

export const useOTPTimer = (initialSeconds = 30) => {
  const [timeLeft, setTimeLeft] = React.useState(initialSeconds);
  const [isExpired, setIsExpired] = React.useState(false);

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isExpired) {
      setIsExpired(true);
    }
  }, [timeLeft, isExpired]);

  const reset = () => {
    setTimeLeft(initialSeconds);
    setIsExpired(false);
  };

  return { timeLeft, isExpired, reset };
};

// ═══════════════════════════════════════════════════════════════════════════
// OTP ATTEMPT TRACKER
// ═══════════════════════════════════════════════════════════════════════════

export const useOTPAttempts = (maxAttempts = 5, lockoutSeconds = 600) => {
  const [attempts, setAttempts] = React.useState(0);
  const [isLocked, setIsLocked] = React.useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = React.useState(0);

  React.useEffect(() => {
    if (lockoutTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLockoutTimeLeft(lockoutTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTimeLeft === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [lockoutTimeLeft, isLocked]);

  const addAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      setIsLocked(true);
      setLockoutTimeLeft(lockoutSeconds);
    }
  };

  const reset = () => {
    setAttempts(0);
    setIsLocked(false);
    setLockoutTimeLeft(0);
  };

  return {
    attempts,
    remainingAttempts: Math.max(0, maxAttempts - attempts),
    isLocked,
    lockoutTimeLeft,
    addAttempt,
    reset
  };
};

