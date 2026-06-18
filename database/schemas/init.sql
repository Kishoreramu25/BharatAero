-- Production Database Initialization Schema for BharatAero
-- Target DB: PostgreSQL 14+

-- Enable standard UUID generator extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Standard Trigger Function to update modification timestamps automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

---------------------------------------------------------
-- TABLE: pilots
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pilots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.00),
    trips INTEGER DEFAULT 0 CHECK (trips >= 0),
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate > 0),
    specialty VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(512),
    experience VARCHAR(50),
    license_number VARCHAR(100) UNIQUE,
    availability_status VARCHAR(50) DEFAULT 'Immediate',
    drone_type VARCHAR(150),
    bio TEXT,
    recent_completed_trips INTEGER DEFAULT 0,
    fuel_consumption VARCHAR(50),
    average_speed VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER update_pilots_modtime 
    BEFORE UPDATE ON pilots 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_column();

-- Core performance indexes for queries & filters
CREATE INDEX IF NOT EXISTS idx_pilots_location ON pilots(location) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pilots_specialty ON pilots(specialty) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pilots_rating ON pilots(rating DESC) WHERE deleted_at IS NULL;

---------------------------------------------------------
-- TABLE: users (Authentication & User Management)
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_salt VARCHAR(64),
    password_hash VARCHAR(128),
    google_id VARCHAR(255) UNIQUE,
    google_email VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_column();

-- Performance indexes for user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE deleted_at IS NULL;

---------------------------------------------------------
-- TABLE: bookings
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE RESTRICT,
    pilot_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
    location VARCHAR(255) NOT NULL,
    total_fee NUMERIC(12, 2) NOT NULL CHECK (total_fee >= 0),
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER update_bookings_modtime 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_column();

-- Indexes for mapping bookings history
CREATE INDEX IF NOT EXISTS idx_bookings_pilot_id ON bookings(pilot_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date) WHERE deleted_at IS NULL;
