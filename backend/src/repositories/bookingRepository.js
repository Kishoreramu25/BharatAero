const db = require('../config/db');

// In-memory array for session fallback caching
const MOCK_BOOKINGS = [];

exports.saveBooking = async (details) => {
  try {
    const sql = `
      INSERT INTO bookings (pilot_id, pilot_name, booking_date, duration_hours, location, total_fee, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const params = [
      details.pilotId,
      details.pilotName,
      details.date,
      parseInt(details.duration, 10),
      details.location,
      details.totalFee
    ];
    
    const result = await db.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.warn('[Database Warning] SQL query failed, saving booking to in-memory session. Error:', error.message);
    
    const newBooking = {
      id: MOCK_BOOKINGS.length + 1,
      pilot_id: details.pilotId,
      pilot_name: details.pilotName,
      booking_date: details.date,
      duration_hours: parseInt(details.duration, 10),
      location: details.location,
      total_fee: details.totalFee,
      created_at: new Date()
    };
    
    MOCK_BOOKINGS.push(newBooking);
    return newBooking;
  }
};

exports.findBookings = async () => {
  try {
    const result = await db.query('SELECT * FROM bookings ORDER BY booking_date DESC');
    return result.rows;
  } catch (error) {
    console.warn('[Database Warning] SQL query failed, retrieving bookings from in-memory session. Error:', error.message);
    return [...MOCK_BOOKINGS].sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
  }
};
