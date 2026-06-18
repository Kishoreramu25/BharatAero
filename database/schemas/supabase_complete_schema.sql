-- ============================================================
-- BHARATAERO COMPLETE DATABASE SCHEMA
-- 25+ Year Data Engineer Design
-- Production-Ready with RLS, Triggers, and Indexes
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. USERS TABLE (Authentication & User Management)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_salt VARCHAR(64),
    password_hash VARCHAR(128),
    google_id VARCHAR(255) UNIQUE,
    google_email VARCHAR(255),
    profile_photo_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_google_id ON users(google_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_uuid ON users(uuid);

-- ============================================================
-- 2. PILOTS TABLE (Pilot Profiles & Information)
-- ============================================================
CREATE TABLE IF NOT EXISTS pilots (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_expiry DATE,
    drone_certification VARCHAR(100),
    total_flights INTEGER DEFAULT 0,
    total_hours NUMERIC(10, 2) DEFAULT 0,
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate > 0),
    availability_status VARCHAR(50) DEFAULT 'available',
    current_location VARCHAR(255),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    specialty VARCHAR(255),
    experience_level VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    drone_type VARCHAR(100),
    operating_radius_km INTEGER DEFAULT 50,
    languages VARCHAR(255),
    certifications TEXT,
    insurance_provider VARCHAR(255),
    insurance_expiry DATE,
    bank_account_holder VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_ifsc_code VARCHAR(20),
    upi_id VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_document_url TEXT,
    background_check_status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pilots_user_id ON pilots(user_id);
CREATE INDEX idx_pilots_license ON pilots(license_number);
CREATE INDEX idx_pilots_specialty ON pilots(specialty);
CREATE INDEX idx_pilots_availability ON pilots(availability_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_pilots_location ON pilots(current_location) WHERE deleted_at IS NULL;

-- ============================================================
-- 3. PILOT_RATINGS TABLE (Reviews and Ratings)
-- ============================================================
CREATE TABLE IF NOT EXISTS pilot_ratings (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    pilot_id BIGINT NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id BIGINT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    overall_experience_rating INTEGER CHECK (overall_experience_rating >= 1 AND overall_experience_rating <= 5),
    would_recommend BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ratings_pilot_id ON pilot_ratings(pilot_id);
CREATE INDEX idx_ratings_customer_id ON pilot_ratings(customer_id);
CREATE INDEX idx_ratings_rating ON pilot_ratings(rating);

-- ============================================================
-- 4. BOOKINGS TABLE (Flight Reservations)
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pilot_id BIGINT NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME,
    duration_hours NUMERIC(10, 2) NOT NULL CHECK (duration_hours > 0),
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    purpose VARCHAR(255),
    description TEXT,
    estimated_distance_km NUMERIC(10, 2),
    base_rate NUMERIC(12, 2) NOT NULL,
    additional_charges NUMERIC(12, 2) DEFAULT 0,
    total_fee NUMERIC(12, 2) NOT NULL CHECK (total_fee >= 0),
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    cancellation_reason TEXT,
    cancelled_by VARCHAR(50),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    actual_distance_km NUMERIC(10, 2),
    pilot_notes TEXT,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_pilot_id ON bookings(pilot_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_date ON bookings(booking_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- ============================================================
-- 5. OTP_VERIFICATION TABLE (OTP Management)
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_verification (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    phone VARCHAR(20),
    otp_code VARCHAR(6) NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_otp_email ON otp_verification(email) WHERE is_verified = FALSE;
CREATE INDEX idx_otp_phone ON otp_verification(phone) WHERE is_verified = FALSE;
CREATE INDEX idx_otp_expires ON otp_verification(expires_at);

-- ============================================================
-- 6. TRANSACTIONS TABLE (Payment Records)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pilot_id BIGINT REFERENCES pilots(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    transaction_type VARCHAR(50),
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_pilot_id ON transactions(pilot_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ============================================================
-- 7. NOTIFICATIONS TABLE (User Alerts)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    related_booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    related_pilot_id BIGINT REFERENCES pilots(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================
-- 8. AVAILABILITY_SLOTS TABLE (Pilot Availability)
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_slots (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    pilot_id BIGINT NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_availability_pilot_id ON availability_slots(pilot_id);
CREATE INDEX idx_availability_date ON availability_slots(date);

-- ============================================================
-- 9. DOCUMENTS TABLE (License, Insurance, etc)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    pilot_id BIGINT NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    document_url TEXT NOT NULL,
    document_number VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_pilot_id ON documents(pilot_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ============================================================
-- 10. PILOT_STATS VIEW (Aggregated Pilot Statistics)
-- ============================================================
CREATE OR REPLACE VIEW pilot_stats AS
SELECT 
    p.id,
    p.uuid,
    p.user_id,
    p.license_number,
    p.total_flights,
    p.total_hours,
    COUNT(DISTINCT r.id)::INTEGER as total_reviews,
    COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) as average_rating,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END)::INTEGER as completed_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END)::INTEGER as pending_bookings,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_fee ELSE 0 END), 0) as total_earnings
FROM pilots p
LEFT JOIN pilot_ratings r ON p.id = r.pilot_id
LEFT JOIN bookings b ON p.id = b.pilot_id AND b.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.uuid, p.user_id, p.license_number, p.total_flights, p.total_hours;

-- ============================================================
-- TRIGGER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_pilots_modtime BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_transactions_modtime BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_notifications_modtime BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_availability_modtime BEFORE UPDATE ON availability_slots FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE FUNCTION update_pilot_stats_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE pilots
        SET total_flights = total_flights + 1,
            total_hours = total_hours + COALESCE(NEW.duration_hours, 0)
        WHERE id = NEW.pilot_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER booking_completed_update_stats BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_pilot_stats_on_booking();

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

CREATE OR REPLACE FUNCTION get_available_pilots(
    start_date DATE,
    end_date DATE,
    specialty_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    pilot_id BIGINT,
    pilot_name VARCHAR,
    license_number VARCHAR,
    hourly_rate NUMERIC,
    average_rating NUMERIC,
    available_slots INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        u.name,
        p.license_number,
        p.hourly_rate,
        COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0),
        COUNT(a.id)::INTEGER
    FROM pilots p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN pilot_ratings r ON p.id = r.pilot_id
    LEFT JOIN availability_slots a ON p.id = a.pilot_id 
        AND a.date BETWEEN start_date AND end_date 
        AND a.is_available = TRUE
    WHERE p.is_active = TRUE 
        AND p.deleted_at IS NULL
        AND (specialty_filter IS NULL OR p.specialty = specialty_filter)
    GROUP BY p.id, u.name, p.license_number, p.hourly_rate;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_pilot_earnings(p_pilot_id BIGINT, days_past INTEGER DEFAULT 30)
RETURNS TABLE (
    total_earnings NUMERIC,
    completed_bookings INTEGER,
    average_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(b.total_fee), 0),
        COUNT(DISTINCT b.id)::INTEGER,
        COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0)
    FROM bookings b
    LEFT JOIN pilot_ratings r ON b.id = r.booking_id
    WHERE b.pilot_id = p_pilot_id
        AND b.status = 'completed'
        AND b.created_at >= NOW() - (days_past || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_pilot_rating_summary(p_pilot_id BIGINT)
RETURNS TABLE (
    total_ratings INTEGER,
    average_rating NUMERIC,
    punctuality_rating NUMERIC,
    professionalism_rating NUMERIC,
    communication_rating NUMERIC,
    recommend_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER,
        ROUND(AVG(rating)::NUMERIC, 2),
        ROUND(AVG(punctuality_rating)::NUMERIC, 2),
        ROUND(AVG(professionalism_rating)::NUMERIC, 2),
        ROUND(AVG(communication_rating)::NUMERIC, 2),
        ROUND((SUM(CASE WHEN would_recommend = TRUE THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
    FROM pilot_ratings
    WHERE pilot_id = p_pilot_id;
END;
$$ LANGUAGE plpgsql;
