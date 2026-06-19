const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const pilotController = require('../controllers/pilotController');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Rate limiting: 3 requests per minute per identifier (email/phone/IP)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: {
    success: false,
    error: { message: 'Too many OTP requests. Please wait a minute before requesting another code.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req.body.email || req.body.phone || req.ip).toString().trim().toLowerCase();
  }
});

// Schema definitions for route validations
const bookingSchema = {
  pilotId: { required: true, type: 'number' },
  pilotName: { required: true, type: 'string' },
  date: { required: true, type: 'string' },
  duration: { required: true, type: 'string' },
  location: { required: true, type: 'string' },
  totalFee: { required: true, type: 'number' }
};

const pilotQuerySchema = {
  specialty: { required: false, type: 'string' },
  location: { required: false, type: 'string' }
};

// Route definitions mapped to controllers
router.get('/pilots', auth, validate(pilotQuerySchema), pilotController.listPilots);
router.get('/pilots/:id', auth, pilotController.getPilotDetails);

router.post('/bookings', auth, validate(bookingSchema), bookingController.createBooking);
router.get('/bookings', auth, bookingController.listBookings);

// Secure OTP & Registration Routes
router.post('/register', authController.register);
router.post('/send-otp', otpLimiter, authController.requestOtp);
router.post('/request-otp', otpLimiter, authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
