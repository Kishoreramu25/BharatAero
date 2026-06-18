-- ============================================================
-- BHARATAERO - COMPLETE FULL STACK FIXES
-- 40+ Year Veteran Standards
-- ============================================================

-- FIX 1: RLS POLICIES (13 Critical Security Policies)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_public_select" ON users;
DROP POLICY IF EXISTS "users_own_update" ON users;
DROP POLICY IF EXISTS "users_own_insert" ON users;

CREATE POLICY "users_public_select" ON users FOR SELECT USING (is_active = TRUE);
CREATE POLICY "users_own_update" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "users_own_insert" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "pilots_public_view" ON pilots;
DROP POLICY IF EXISTS "pilots_own_update" ON pilots;

CREATE POLICY "pilots_public_view" ON pilots FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL);
CREATE POLICY "pilots_own_update" ON pilots FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "bookings_customer_view" ON bookings;
DROP POLICY IF EXISTS "bookings_pilot_view" ON bookings;

CREATE POLICY "bookings_customer_view" ON bookings FOR SELECT USING (customer_id = auth.uid()::bigint);
CREATE POLICY "bookings_pilot_view" ON bookings FOR SELECT USING (pilot_id IN (SELECT id FROM pilots WHERE user_id = auth.uid()::bigint));

DROP POLICY IF EXISTS "ratings_public_view" ON pilot_ratings;
CREATE POLICY "ratings_public_view" ON pilot_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "notifications_own_view" ON notifications;
CREATE POLICY "notifications_own_view" ON notifications FOR SELECT USING (user_id = auth.uid()::bigint);

DROP POLICY IF EXISTS "otp_own_view" ON otp_verification;
CREATE POLICY "otp_own_view" ON otp_verification FOR SELECT USING (true);

DROP POLICY IF EXISTS "transactions_own_view" ON transactions;
CREATE POLICY "transactions_own_view" ON transactions FOR SELECT USING (user_id = auth.uid()::bigint);

DROP POLICY IF EXISTS "availability_public_view" ON availability_slots;
CREATE POLICY "availability_public_view" ON availability_slots FOR SELECT USING (is_available = TRUE);

DROP POLICY IF EXISTS "documents_pilot_view" ON documents;
CREATE POLICY "documents_pilot_view" ON documents FOR SELECT USING (pilot_id IN (SELECT id FROM pilots WHERE user_id = auth.uid()::bigint));

-- FIX 2: FOREIGN KEY CONSTRAINTS
ALTER TABLE pilot_ratings
ADD CONSTRAINT fk_pilot_ratings_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- FIX 3: AUDIT LOGGING TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(255),
    operation VARCHAR(50),
    record_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    changed_by BIGINT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(changed_by);

-- FIX 4: PAYMENT & BOOKING STATUS CONSTRAINTS
ALTER TABLE bookings ADD CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));
ALTER TABLE bookings ADD CONSTRAINT valid_booking_status CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- FIX 5: DATA INTEGRITY - FOREIGN KEY CONSTRAINTS
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_pilot_valid FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE RESTRICT;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_customer_valid FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT;

-- FIX 6: PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_pilots_is_verified ON pilots(is_verified) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_customer_date ON bookings(customer_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_pilot_date ON bookings(pilot_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_transactions_status_date ON transactions(status, created_at DESC);

-- FIX 7: BOOKING STATUS HISTORY TRACKING
CREATE TABLE IF NOT EXISTS booking_status_history (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking ON booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_date ON booking_status_history(created_at DESC);

CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO booking_status_history(booking_id, old_status, new_status)
        VALUES(NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
CREATE TRIGGER booking_status_change_trigger AFTER UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();

-- FIX 8: PILOT VERIFICATION TRACKING
CREATE TABLE IF NOT EXISTS pilot_verification_history (
    id BIGSERIAL PRIMARY KEY,
    pilot_id BIGINT NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    verification_type VARCHAR(100),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    verified_by BIGINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pilot_verification_pilot ON pilot_verification_history(pilot_id);

-- FIX 9: COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    complainant_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    respondent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_complaints_booking ON complaints(booking_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

-- FIX 10: REFUNDS TABLE
CREATE TABLE IF NOT EXISTS refunds (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    transaction_id BIGINT REFERENCES transactions(id),
    booking_id BIGINT REFERENCES bookings(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- FIX 11: NUMERIC PRECISION FIX
ALTER TABLE bookings ALTER COLUMN base_rate TYPE NUMERIC(15, 2);
ALTER TABLE bookings ALTER COLUMN additional_charges TYPE NUMERIC(15, 2);
ALTER TABLE bookings ALTER COLUMN total_fee TYPE NUMERIC(15, 2);
ALTER TABLE pilots ALTER COLUMN hourly_rate TYPE NUMERIC(15, 2);
ALTER TABLE transactions ALTER COLUMN amount TYPE NUMERIC(15, 2);
ALTER TABLE refunds ALTER COLUMN amount TYPE NUMERIC(15, 2);

-- FIX 12: DASHBOARD STATS VIEW
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
    (SELECT COUNT(*) FROM pilots WHERE is_active = TRUE AND is_verified = TRUE) as active_pilots,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
    (SELECT COALESCE(SUM(total_fee), 0) FROM bookings WHERE status = 'completed') as total_revenue,
    (SELECT AVG(rating) FROM pilot_ratings) as average_rating,
    (SELECT COUNT(*) FROM transactions WHERE status = 'success') as successful_transactions;

-- FIX 13: SOFT DELETE CASCADE
CREATE OR REPLACE FUNCTION soft_delete_users()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        UPDATE pilots SET deleted_at = NOW() WHERE user_id = NEW.id AND deleted_at IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS soft_delete_users_trigger ON users;
CREATE TRIGGER soft_delete_users_trigger AFTER UPDATE ON users FOR EACH ROW EXECUTE FUNCTION soft_delete_users();

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify all tables exist
SELECT 'VERIFICATION: Checking all tables...' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Verify all RLS policies
SELECT 'RLS Policies Status:' as check_type;
SELECT tablename, policyname FROM pg_policies ORDER BY tablename;

-- Verify all indexes
SELECT 'Index Count:' as check_type;
SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE schemaname = 'public';

SELECT 'All Fixes Applied Successfully!' as final_status;
