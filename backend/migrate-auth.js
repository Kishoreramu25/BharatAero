require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- 1. Add purpose to otp_verification
ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS purpose VARCHAR(20) DEFAULT 'signup';

-- 2. Create login_history
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    device_info TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    login_status VARCHAR(50) DEFAULT 'success'
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);

-- 3. Create password_reset_history
CREATE TABLE IF NOT EXISTS password_reset_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reset_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reset_status VARCHAR(50) DEFAULT 'success'
);

CREATE INDEX IF NOT EXISTS idx_password_reset_history_user_id ON password_reset_history(user_id);
`;

async function runMigration() {
  try {
    console.log('Running auth migration...');
    await pool.query(sql);
    console.log('✅ Auth migration executed successfully!');
  } catch (err) {
    console.error('❌ Error executing migration:', err.message);
  } finally {
    pool.end();
  }
}

runMigration();
