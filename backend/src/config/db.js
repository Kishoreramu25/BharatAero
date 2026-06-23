// ═══════════════════════════════════════════════════════════════════════════
// FAKE IN-MEMORY DATABASE (Replaces PostgreSQL completely)
// ═══════════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../local_db.json');

// Initial schema
let data = {
  users: [],
  otp_verification: [],
  authentication_logs: [],
  login_history: [],
  password_reset_history: [],
  pilots: [],
  bookings: [],
  pilot_stats: [],
  pilot_ratings: []
};

// Load existing JSON if available
if (fs.existsSync(DB_FILE)) {
  try {
    data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to load local DB', err);
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let idCounter = 1;

// This mock completely replaces Postgres by intercepting standard SQL queries
// and running them against our local JSON array.
module.exports = {
  query: async (text, params = []) => {
    const q = text.toLowerCase();
    
    // -----------------------------------------
    // USERS TABLE
    // -----------------------------------------
    if (q.includes('insert into users')) {
      // INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role
      const newUser = {
        id: idCounter++,
        name: params[0],
        email: params[1],
        password_hash: params[2],
        role: params[3],
        created_at: new Date().toISOString()
      };
      data.users.push(newUser);
      saveDB();
      return { rows: [newUser] };
    }
    
    if (q.includes('select id from users where email')) {
      const user = data.users.find(u => u.email === params[0]);
      return { rows: user ? [user] : [] };
    }

    if (q.includes('select id, name, password_hash from users where email')) {
      const user = data.users.find(u => u.email === params[0]);
      return { rows: user ? [user] : [] };
    }

    if (q.includes('select id, name, email, role from users where email')) {
      const user = data.users.find(u => u.email === params[0]);
      return { rows: user ? [user] : [] };
    }

    if (q.includes('select id, name from users where email')) {
      const user = data.users.find(u => u.email === params[0]);
      return { rows: user ? [user] : [] };
    }

    if (q.includes('update users set password_hash')) {
      const user = data.users.find(u => u.email === params[1]);
      if (user) {
        user.password_hash = params[0];
        saveDB();
        return { rows: [{ id: user.id }] };
      }
      return { rows: [] };
    }

    // -----------------------------------------
    // OTP VERIFICATION
    // -----------------------------------------
    if (q.includes('insert into otp_verification')) {
      // INSERT INTO otp_verification (email, otp_code, purpose, expires_at)
      const newOtp = {
        id: idCounter++,
        email: params[0],
        otp_code: params[1],
        purpose: params[2],
        expires_at: params[3],
        is_verified: false,
        attempt_count: 0
      };
      data.otp_verification.push(newOtp);
      saveDB();
      return { rows: [newOtp] };
    }

    if (q.includes('select * from otp_verification where email')) {
      // Find latest unverified OTP for email
      const validOtps = data.otp_verification.filter(o => 
        o.email === params[0] && 
        o.purpose === params[1] && 
        !o.is_verified &&
        new Date(o.expires_at) > new Date()
      );
      return { rows: validOtps.length ? [validOtps[validOtps.length - 1]] : [] };
    }

    if (q.includes('update otp_verification set attempt_count')) {
      const otp = data.otp_verification.find(o => o.id === params[0]);
      if (otp) {
        otp.attempt_count += 1;
        saveDB();
      }
      return { rows: [] };
    }

    if (q.includes('update otp_verification set is_verified = true')) {
      const otp = data.otp_verification.find(o => o.id === params[0]);
      if (otp) {
        otp.is_verified = true;
        otp.verified_at = new Date().toISOString();
        saveDB();
      }
      return { rows: [] };
    }

    // -----------------------------------------
    // LOGS
    // -----------------------------------------
    if (q.includes('insert into authentication_logs')) {
      const log = {
        id: idCounter++,
        email: params[0],
        name: params[1],
        role: params[2],
        otp_sent: params[3],
        otp_entered: params[4],
        login_status: params[5],
        login_time: new Date().toISOString()
      };
      data.authentication_logs.push(log);
      saveDB();
      return { rows: [log] };
    }

    if (q.includes('insert into login_history')) {
      data.login_history.push({
        id: idCounter++,
        user_id: params[0],
        ip_address: params[1],
        device_info: params[2],
        login_time: new Date().toISOString()
      });
      saveDB();
      return { rows: [] };
    }

    if (q.includes('insert into password_reset_history')) {
      data.password_reset_history.push({
        id: idCounter++,
        user_id: params[0],
        reset_time: new Date().toISOString()
      });
      saveDB();
      return { rows: [] };
    }

    // -----------------------------------------
    // PILOTS
    // -----------------------------------------
    if (q.includes('select p.id')) {
      // Mock returning pilots list
      return { rows: data.pilots };
    }
    
    // -----------------------------------------
    // BOOKINGS
    // -----------------------------------------
    if (q.includes('insert into bookings')) {
      const newBooking = {
        id: idCounter++,
        pilot_id: params[0],
        pilot_name: params[1],
        booking_date: params[2],
        duration_hours: params[3],
        location: params[4],
        total_fee: params[5],
        status: 'Confirmed'
      };
      data.bookings.push(newBooking);
      saveDB();
      return { rows: [newBooking] };
    }

    if (q.includes('select * from bookings')) {
      return { rows: data.bookings };
    }

    // Fallback for unknown queries
    console.warn('[FakeDB] Unhandled SQL Mock:', text);
    return { rows: [] };
  }
};
