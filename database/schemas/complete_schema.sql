-- ═══════════════════════════════════════════════════════════════════════════
-- BharatAero — Complete Production Schema
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Timestamp update function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ═══════════════════════════════════════════════════════════════════════════
-- AUTH USERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_auth_users_email ON auth_users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_auth_users_phone ON auth_users(phone) WHERE deleted_at IS NULL;
CREATE TRIGGER update_auth_users_modtime BEFORE UPDATE ON auth_users FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- PILOTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pilots (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.00),
    trips INTEGER DEFAULT 0 CHECK (trips >= 0),
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate > 0),
    specialty VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(512),
    experience VARCHAR(50),
    license_number VARCHAR(100) UNIQUE,
    license_verified BOOLEAN DEFAULT FALSE,
    availability_status VARCHAR(50) DEFAULT 'Available',
    drone_type VARCHAR(150),
    bio TEXT,
    recent_completed_trips INTEGER DEFAULT 0,
    fuel_consumption VARCHAR(50),
    average_speed VARCHAR(50),
    kyc_status VARCHAR(50) DEFAULT 'pending',
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pilots_user_id ON pilots(user_id);
CREATE INDEX idx_pilots_location ON pilots(location) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_pilots_specialty ON pilots(specialty) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_pilots_rating ON pilots(rating DESC) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_pilots_license ON pilots(license_number);
CREATE TRIGGER update_pilots_modtime BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone_number VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    total_bookings INTEGER DEFAULT 0,
    total_spent NUMERIC(14, 2) DEFAULT 0,
    kyc_status VARCHAR(50) DEFAULT 'pending',
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_city ON clients(city);
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- BOOKINGS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE RESTRICT,
    pilot_id INTEGER REFERENCES pilots(id) ON DELETE RESTRICT,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    location_name VARCHAR(255) NOT NULL,
    location_latitude NUMERIC(10, 8),
    location_longitude NUMERIC(11, 8),
    duration_hours INTEGER NOT NULL,
    description TEXT,
    estimated_fee NUMERIC(12, 2) NOT NULL,
    final_fee NUMERIC(12, 2),
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    booking_status VARCHAR(50) DEFAULT 'confirmed',
    cancellation_reason VARCHAR(500),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refund_status VARCHAR(50),
    refund_amount NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_pilot_id ON bookings(pilot_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- PAYMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE RESTRICT,
    client_id INTEGER REFERENCES clients(id),
    pilot_id INTEGER REFERENCES pilots(id),
    payment_reference VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    settlement_status VARCHAR(50) DEFAULT 'pending',
    settlement_date TIMESTAMP WITH TIME ZONE,
    payout_amount NUMERIC(12, 2),
    platform_fee NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_pilot_id ON payments(pilot_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- RATINGS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pilot_ratings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    pilot_id INTEGER REFERENCES pilots(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    overall_rating NUMERIC(3, 2) NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
    punctuality_rating NUMERIC(3, 2),
    professionalism_rating NUMERIC(3, 2),
    equipment_quality_rating NUMERIC(3, 2),
    communication_rating NUMERIC(3, 2),
    work_quality_rating NUMERIC(3, 2),
    review_text TEXT,
    would_recommend BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pilot_ratings_pilot_id ON pilot_ratings(pilot_id);
CREATE INDEX idx_pilot_ratings_client_id ON pilot_ratings(client_id);
CREATE TRIGGER update_pilot_ratings_modtime BEFORE UPDATE ON pilot_ratings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_booking_id INTEGER REFERENCES bookings(id),
    read_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at) WHERE read_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- MESSAGES TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID REFERENCES auth_users(id),
    receiver_id UUID REFERENCES auth_users(id),
    booking_id INTEGER REFERENCES bookings(id),
    message_text TEXT NOT NULL,
    attachment_url VARCHAR(512),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT LOG TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth_users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════════════════

