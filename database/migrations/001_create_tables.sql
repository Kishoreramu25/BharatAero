-- Migration 001: Create Pilots and Bookings Tables
-- Up

CREATE TABLE IF NOT EXISTS pilots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    trips INTEGER DEFAULT 0,
    hourly_rate NUMERIC(10, 2) NOT NULL,
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

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    pilot_id INTEGER NOT NULL REFERENCES pilots(id),
    pilot_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    duration_hours INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    total_fee NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_pilots_loc_specialty ON pilots(location, specialty) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_date_pilot ON bookings(booking_date, pilot_id) WHERE deleted_at IS NULL;

-- Down
-- DROP INDEX IF EXISTS idx_bookings_date_pilot;
-- DROP INDEX IF EXISTS idx_pilots_loc_specialty;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS pilots;
