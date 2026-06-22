const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bharataero';
const isSupabase = connectionString.includes('supabase');

const pool = new Pool({
  connectionString,
  ssl: (process.env.NODE_ENV === 'production' || isSupabase) ? {
    rejectUnauthorized: false
  } : false
});

// Pool connection test helper
pool.on('connect', () => {
  console.log('[Database] New database client connected to pool');
  // Auto-bootstrap users table
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(err => {
    console.warn('[Database Warning] Failed to bootstrap users table:', err.message);
  });
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected pool client error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
