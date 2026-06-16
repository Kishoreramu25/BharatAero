const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res, next) => {
  try {
    const bookingDetails = {
      pilotId: req.body.pilotId,
      pilotName: req.body.pilotName,
      date: req.body.date,
      duration: req.body.duration,
      location: req.body.location,
      totalFee: req.body.totalFee
    };

    const newBooking = await bookingService.bookPilot(bookingDetails);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    next(error);
  }
};

exports.listBookings = async (req, res, next) => {
  try {
    // In a real application, you would filter by the authenticated user's ID:
    // const userId = req.user.id;
    const bookings = await bookingService.getAllBookings();

    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};
