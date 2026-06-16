const express = require('express');
const router = express.Router();

const pilotController = require('../controllers/pilotController');
const bookingController = require('../controllers/bookingController');
const validate = require('../middleware/validate');

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
router.get('/pilots', validate(pilotQuerySchema), pilotController.listPilots);
router.get('/pilots/:id', pilotController.getPilotDetails);

router.post('/bookings', validate(bookingSchema), bookingController.createBooking);
router.get('/bookings', bookingController.listBookings);

module.exports = router;
