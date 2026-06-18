// Input validation middleware and utilities
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const otpRegex = /^\d{6}$/;

exports.validateEmail = (email) => {
  if (!email) return false;
  return emailRegex.test(email.trim());
};

exports.validateOtp = (code) => {
  if (!code) return false;
  return otpRegex.test(code.trim()) && code.trim().length === 6;
};

exports.validatePhone = (phone) => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[\s()-]/g, '');
  return phoneRegex.test(cleanPhone);
};

exports.sanitizeString = (str) => {
  if (!str) return '';
  // Remove HTML/script tags and special characters that could cause injection
  return str.replace(/[<>\"'&]/g, '').trim();
};

exports.validatePassword = (password) => {
  if (!password) return false;
  // Minimum 8 characters
  if (password.length < 8) return false;
  // At least one uppercase, one lowercase, one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumber;
};
