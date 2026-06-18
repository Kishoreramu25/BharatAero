// ============================================================
// BHARATAERO - SUPABASE INTEGRATION MODULE
// 25+ Year Data Engineer - Production Quality
// ============================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://ujecqxyphgeurhclitwb.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'sb_publishable_jKZJC-AvjoDq2OKy5YSyBQ_kJsIoSHH'
);

// ============================================================
// 1. USER MANAGEMENT
// ============================================================

// Register new user
exports.registerUser = async (email, name, phone, passwordSalt, passwordHash) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email: email.toLowerCase().trim(),
                name: name.trim(),
                phone: phone || null,
                password_salt: passwordSalt,
                password_hash: passwordHash,
                is_verified: false,
                is_active: true
            }])
            .select();
        
        if (error) throw error;
        return { success: true, user: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get user by email
exports.getUserByEmail = async (email) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();
        
        if (error) return null;
        return data;
    } catch (err) {
        return null;
    }
};

// Update user profile
exports.updateUserProfile = async (userId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select();
        
        if (error) throw error;
        return { success: true, user: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// ============================================================
// 2. PILOT MANAGEMENT
// ============================================================

// Create pilot profile
exports.createPilotProfile = async (userId, pilotData) => {
    try {
        const { data, error } = await supabase
            .from('pilots')
            .insert([{
                user_id: userId,
                license_number: pilotData.license_number,
                license_expiry: pilotData.license_expiry,
                hourly_rate: pilotData.hourly_rate,
                specialty: pilotData.specialty,
                experience_level: pilotData.experience_level,
                drone_type: pilotData.drone_type,
                languages: pilotData.languages,
                bio: pilotData.bio,
                is_verified: false
            }])
            .select();
        
        if (error) throw error;
        return { success: true, pilot: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get pilot profile with stats
exports.getPilotWithStats = async (pilotId) => {
    try {
        const { data, error } = await supabase
            .from('pilot_stats')
            .select('*')
            .eq('id', pilotId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (err) {
        return null;
    }
};

// Get all available pilots
exports.getAvailablePilots = async (startDate, endDate, specialty = null) => {
    try {
        const { data, error } = await supabase
            .rpc('get_available_pilots', {
                start_date: startDate,
                end_date: endDate,
                specialty_filter: specialty
            });
        
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error fetching available pilots:', err);
        return [];
    }
};

// Update pilot availability
exports.updatePilotAvailability = async (pilotId, status, location, latitude, longitude) => {
    try {
        const { data, error } = await supabase
            .from('pilots')
            .update({
                availability_status: status,
                current_location: location,
                latitude: latitude,
                longitude: longitude
            })
            .eq('id', pilotId)
            .select();
        
        if (error) throw error;
        return { success: true, pilot: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// ============================================================
// 3. BOOKING MANAGEMENT
// ============================================================

// Create booking
exports.createBooking = async (customerId, pilotId, bookingData) => {
    try {
        const totalFee = bookingData.base_rate * bookingData.duration_hours;
        
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                customer_id: customerId,
                pilot_id: pilotId,
                booking_date: bookingData.booking_date,
                booking_time: bookingData.booking_time || null,
                duration_hours: bookingData.duration_hours,
                location: bookingData.location,
                latitude: bookingData.latitude || null,
                longitude: bookingData.longitude || null,
                purpose: bookingData.purpose,
                description: bookingData.description || null,
                base_rate: bookingData.base_rate,
                additional_charges: bookingData.additional_charges || 0,
                total_fee: totalFee,
                status: 'pending',
                payment_status: 'pending'
            }])
            .select();
        
        if (error) throw error;
        return { success: true, booking: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get user bookings
exports.getUserBookings = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, pilots(*, users(name, email)), users!customer_id(name, email)')
            .eq('customer_id', userId)
            .order('booking_date', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (err) {
        return [];
    }
};

// Update booking status
exports.updateBookingStatus = async (bookingId, status, notes = null) => {
    try {
        const updateData = { status };
        if (status === 'in_progress') {
            updateData.actual_start_time = new Date().toISOString();
        } else if (status === 'completed') {
            updateData.actual_end_time = new Date().toISOString();
        }
        if (notes && status === 'completed') {
            updateData.pilot_notes = notes;
        }
        
        const { data, error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId)
            .select();
        
        if (error) throw error;
        return { success: true, booking: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// ============================================================
// 4. RATING & REVIEW MANAGEMENT
// ============================================================

// Save pilot rating
exports.savePilotRating = async (pilotId, customerId, bookingId, ratingData) => {
    try {
        const { data, error } = await supabase
            .from('pilot_ratings')
            .insert([{
                pilot_id: pilotId,
                customer_id: customerId,
                booking_id: bookingId,
                rating: ratingData.rating,
                review_text: ratingData.review_text || null,
                punctuality_rating: ratingData.punctuality_rating || null,
                professionalism_rating: ratingData.professionalism_rating || null,
                communication_rating: ratingData.communication_rating || null,
                overall_experience_rating: ratingData.overall_experience_rating || null,
                would_recommend: ratingData.would_recommend || true
            }])
            .select();
        
        if (error) throw error;
        return { success: true, rating: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get pilot rating summary
exports.getPilotRatingSummary = async (pilotId) => {
    try {
        const { data, error } = await supabase
            .rpc('get_pilot_rating_summary', { p_pilot_id: pilotId });
        
        if (error) throw error;
        return data[0];
    } catch (err) {
        return null;
    }
};

// Get pilot ratings/reviews
exports.getPilotRatings = async (pilotId, limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('pilot_ratings')
            .select('*, users!customer_id(name, profile_photo_url)')
            .eq('pilot_id', pilotId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    } catch (err) {
        return [];
    }
};

// ============================================================
// 5. OTP MANAGEMENT
// ============================================================

// Store OTP
exports.storeOTP = async (email, phone, otpCode) => {
    try {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        const { data, error } = await supabase
            .from('otp_verification')
            .insert([{
                email: email || null,
                phone: phone || null,
                otp_code: otpCode,
                expires_at: expiresAt.toISOString(),
                is_verified: false
            }])
            .select();
        
        if (error) throw error;
        return { success: true, otp_id: data[0].id };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Verify OTP
exports.verifyOTP = async (email, phone, otpCode) => {
    try {
        const query = supabase
            .from('otp_verification')
            .select('*')
            .eq('otp_code', otpCode)
            .eq('is_verified', false)
            .gt('expires_at', new Date().toISOString());
        
        if (email) query.eq('email', email.toLowerCase());
        if (phone) query.eq('phone', phone);
        
        const { data, error } = await query.single();
        
        if (error || !data) {
            return { success: false, message: 'Invalid or expired OTP' };
        }
        
        // Mark as verified
        const { error: updateError } = await supabase
            .from('otp_verification')
            .update({ is_verified: true, verified_at: new Date().toISOString() })
            .eq('id', data.id);
        
        if (updateError) throw updateError;
        return { success: true, message: 'OTP verified successfully' };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// ============================================================
// 6. TRANSACTION MANAGEMENT
// ============================================================

// Create transaction
exports.createTransaction = async (bookingId, userId, pilotId, amount, transactionData) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                booking_id: bookingId,
                user_id: userId,
                pilot_id: pilotId,
                amount: amount,
                currency: 'INR',
                transaction_type: transactionData.type,
                payment_method: transactionData.payment_method,
                payment_gateway: transactionData.gateway || 'razorpay',
                transaction_id: transactionData.transaction_id,
                status: transactionData.status || 'pending',
                description: transactionData.description || null,
                metadata: transactionData.metadata || {}
            }])
            .select();
        
        if (error) throw error;
        return { success: true, transaction: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get user transactions
exports.getUserTransactions = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (err) {
        return [];
    }
};

// Get pilot earnings
exports.getPilotEarnings = async (pilotId, daysPast = 30) => {
    try {
        const { data, error } = await supabase
            .rpc('get_pilot_earnings', {
                p_pilot_id: pilotId,
                days_past: daysPast
            });
        
        if (error) throw error;
        return data[0];
    } catch (err) {
        return null;
    }
};

// ============================================================
// 7. NOTIFICATION MANAGEMENT
// ============================================================

// Create notification
exports.createNotification = async (userId, title, message, type, metadata = {}) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                title: title,
                message: message,
                notification_type: type,
                metadata: metadata
            }])
            .select();
        
        if (error) throw error;
        return { success: true, notification: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get user notifications
exports.getUserNotifications = async (userId, limit = 20) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    } catch (err) {
        return [];
    }
};

// Mark notification as read
exports.markNotificationAsRead = async (notificationId) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId)
            .select();
        
        if (error) throw error;
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// ============================================================
// 8. AVAILABILITY MANAGEMENT
// ============================================================

// Add availability slot
exports.addAvailabilitySlot = async (pilotId, date, startTime, endTime) => {
    try {
        const { data, error } = await supabase
            .from('availability_slots')
            .insert([{
                pilot_id: pilotId,
                date: date,
                start_time: startTime,
                end_time: endTime,
                is_available: true
            }])
            .select();
        
        if (error) throw error;
        return { success: true, slot: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get pilot availability
exports.getPilotAvailability = async (pilotId, fromDate, toDate) => {
    try {
        const { data, error } = await supabase
            .from('availability_slots')
            .select('*')
            .eq('pilot_id', pilotId)
            .eq('is_available', true)
            .gte('date', fromDate)
            .lte('date', toDate)
            .order('date');
        
        if (error) throw error;
        return data;
    } catch (err) {
        return [];
    }
};

// ============================================================
// 9. DOCUMENT MANAGEMENT
// ============================================================

// Upload document
exports.uploadDocument = async (pilotId, docType, docUrl, docNumber, expiryDate) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .insert([{
                pilot_id: pilotId,
                document_type: docType,
                document_url: docUrl,
                document_number: docNumber || null,
                expiry_date: expiryDate || null,
                is_verified: false
            }])
            .select();
        
        if (error) throw error;
        return { success: true, document: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Get pilot documents
exports.getPilotDocuments = async (pilotId) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('pilot_id', pilotId);
        
        if (error) throw error;
        return data;
    } catch (err) {
        return [];
    }
};

module.exports = {
    supabase,
    // Export all functions
    registerUser: exports.registerUser,
    getUserByEmail: exports.getUserByEmail,
    updateUserProfile: exports.updateUserProfile,
    createPilotProfile: exports.createPilotProfile,
    getPilotWithStats: exports.getPilotWithStats,
    getAvailablePilots: exports.getAvailablePilots,
    updatePilotAvailability: exports.updatePilotAvailability,
    createBooking: exports.createBooking,
    getUserBookings: exports.getUserBookings,
    updateBookingStatus: exports.updateBookingStatus,
    savePilotRating: exports.savePilotRating,
    getPilotRatingSummary: exports.getPilotRatingSummary,
    getPilotRatings: exports.getPilotRatings,
    storeOTP: exports.storeOTP,
    verifyOTP: exports.verifyOTP,
    createTransaction: exports.createTransaction,
    getUserTransactions: exports.getUserTransactions,
    getPilotEarnings: exports.getPilotEarnings,
    createNotification: exports.createNotification,
    getUserNotifications: exports.getUserNotifications,
    markNotificationAsRead: exports.markNotificationAsRead,
    addAvailabilitySlot: exports.addAvailabilitySlot,
    getPilotAvailability: exports.getPilotAvailability,
    uploadDocument: exports.uploadDocument,
    getPilotDocuments: exports.getPilotDocuments
};
