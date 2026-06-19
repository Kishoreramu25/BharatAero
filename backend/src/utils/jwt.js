const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bharataero-dev-secret-key-2026-change-in-production-12345678';
const JWT_EXPIRY = '7d';

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  } catch (error) {
    console.error('[JWT] Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error('[JWT] Token verification error:', err.message);
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken, decodeToken, JWT_SECRET };
