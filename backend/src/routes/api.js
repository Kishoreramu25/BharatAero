const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const pilotController = require('../controllers/pilotController');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, error: { message: 'Too many OTP requests.' } },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
  keyGenerator: (req) => {
    const val = req.body.email || 'anonymous';
    return val.toString().trim().toLowerCase();
  }
});

router.get('/pilots', auth, pilotController.listPilots);
router.get('/pilots/:id', auth, pilotController.getPilotDetails);
router.post('/bookings', auth, bookingController.createBooking);
router.get('/bookings', auth, bookingController.listBookings);

// New 2FA Auth Routes
router.post('/auth/register/init', otpLimiter, authController.registerInit);
router.post('/auth/register/verify', authController.registerVerify);

router.post('/auth/login/init', otpLimiter, authController.loginInit);
router.post('/auth/login/verify', authController.loginVerify);

router.post('/auth/password/forgot', otpLimiter, authController.passwordForgot);
router.post('/auth/password/verify', authController.passwordVerify);
router.post('/auth/password/reset', authController.passwordReset);

module.exports = router;