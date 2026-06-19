const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true
});

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => (req.body.email || req.body.phone || req.ip).toString().toLowerCase()
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || req.ip
});

// Public auth routes
router.post('/check-email', generalLimiter, authController.checkEmailExists);
router.post('/request-otp', otpLimiter, authController.requestOTP);
router.post('/verify-otp', otpLimiter, authController.verifyOTP);
router.post('/validate-password', generalLimiter, authController.validatePassword);
router.post('/register', generalLimiter, authController.completeRegistration);

// Password recovery routes
router.post('/forgot-password', loginLimiter, authController.forgotPassword);
router.post('/reset-password', otpLimiter, authController.resetPassword);

module.exports = router;
