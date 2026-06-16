const { Pool } = require('pg');
require('dotenv').config();

// Pool configuration parsing environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bharataero',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Pool connection test helper
pool.on('connect', () => {
  console.log('[Database] New database client connected to pool');
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected pool client error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
