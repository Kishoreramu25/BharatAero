const bookingRepository = require('../repositories/bookingRepository');

exports.bookPilot = async (bookingDetails) => {
  // Business logic: check date constraints
  const bookingDate = new Date(bookingDetails.date);
  const now = new Date();
  
  if (bookingDate < now) {
    const err = new Error('Cannot schedule a pilot booking in the past');
    err.status = 400;
    throw err;
  }

  // Business logic: enforce minimum durations
  const durHours = parseInt(bookingDetails.duration, 10);
  if (isNaN(durHours) || durHours <= 0) {
    const err = new Error('Duration must be greater than zero hours');
    err.status = 400;
    throw err;
  }

  return await bookingRepository.saveBooking(bookingDetails);
};

exports.getAllBookings = async () => {
  return await bookingRepository.findBookings();
};
