// BharatAero - Typed Supabase Database Queries
// Use this in your React/React Native app

import { supabase } from './supabase'; // Adjusted import to match our actual file

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'client' | 'pilot';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type AvailabilityStatus = 'Active' | 'On Call' | 'Unavailable';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface User {
  id: string; // Auth UID
  email: string;
  name: string | null;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  dob: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  other_url: string | null;
  profile_pic_url: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  pilot_id: string | null;
  type: string;
  location: string;
  date: string;
  time_slot: string | null;
  status: BookingStatus;
  price: number;
  rating: number | null;
  review_text: string | null;
  title: string | null;
  duration: number | null;
  drone_model: string | null;
  hazards: string | null;
  description: string | null;
  certifications: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  read: boolean;
  created_at: string;
}

export interface Availability {
  id: string;
  pilot_id: string;
  day_of_week: DayOfWeek;
  status: AvailabilityStatus;
  hours: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// USERS QUERIES
// ============================================================================

/**
 * Upsert user after Supabase Auth signup
 * Used in: LoginScreen
 */
export const upsertUser = async (
  authUid: string,
  email: string,
  name: string,
  role: UserRole = 'client',
  profilePicUrl?: string
) => {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: authUid,
        email,
        name,
        role,
        profile_pic_url: profilePicUrl || null,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as User;
};


/**
 * Get all pilots for directory
 * Used in: BrowsePilots
 */
export const getAllPilots = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'pilot');

  if (error) throw error;
  return data as User[];
};

/**
 * Get single pilot profile with availability
 * Used in: PilotProfile
 */
export const getPilotProfile = async (pilotId: string) => {
  const { data: pilot, error: pilotError } = await supabase
    .from('users')
    .select('*')
    .eq('id', pilotId)
    .single();

  if (pilotError) throw pilotError;

  const { data: availability, error: availError } = await supabase
    .from('availability')
    .select('*')
    .eq('pilot_id', pilotId)
    .eq('status', 'Active');

  if (availError) throw availError;

  return {
    pilot: pilot as User,
    availability: availability as Availability[],
  };
};

/**
 * Get current user profile by email
 * Used in: LoginScreen to handle Google users
 */
export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data as User | null;
};

/**
 * Get current user profile
 * Used in: App initialization, SettingsScreen
 */
export const getCurrentUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User;
};

/**
 * Update user profile
 * Used in: SettingsScreen, EditProfileScreen
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>>
) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
};

/**
 * Upload a profile picture to Supabase storage
 * Used in: SettingsScreen
 */
export const uploadProfilePicture = async (userId: string, base64Data: string, fileExtension: string = 'jpeg') => {
  try {
    // Determine content type based on base64 prefix if present, or fallback
    let actualBase64 = base64Data;
    let mimeType = `image/${fileExtension}`;
    
    if (base64Data.includes('data:image')) {
      const parts = base64Data.split(',');
      mimeType = parts[0].split(':')[1].split(';')[0];
      actualBase64 = parts[1];
    }

    // Convert base64 to byte array
    const byteCharacters = atob(actualBase64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: mimeType });
    const fileName = `${userId}-${Date.now()}.${mimeType.split('/')[1] || fileExtension}`;
    
    // Upload to 'profile' bucket
    const { data, error } = await supabase.storage
      .from('profile')
      .upload(fileName, blob, {
        contentType: mimeType,
        upsert: true
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('profile')
      .getPublicUrl(fileName);
      
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Storage upload error:", err);
    throw err;
  }
};

/**
 * Add credits to user wallet
 * Used in: Payment processing
 */
export const addCredits = async (userId: string, amount: number) => {
  const { data: user } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  const newCredits = (user?.credits || 0) + amount;

  const { data, error } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
};

// ============================================================================
// BOOKINGS QUERIES
// ============================================================================

/**
 * Create new booking
 * Used in: BookPilot screen
 */
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

/**
 * Get all bookings for a client (with real-time)
 * Used in: ClientDashboard
 */
export const subscribeToClientBookings = (
  clientId: string,
  callback: (bookings: Booking[]) => void
) => {
  const subscription = supabase
    .from('bookings')
    .on('*', (payload) => {
      // Fetch updated data
      fetchClientBookings(clientId).then(callback);
    })
    .subscribe();

  return subscription; // Store for cleanup
};

export const fetchClientBookings = async (clientId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Booking[];
};

/**
 * Get pending bookings (available jobs for pilots)
 * Used in: PilotDashboard - Available Jobs
 */
export const getPendingBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Booking[];
};

/**
 * Get pilot's active bookings
 * Used in: PilotDashboard - My Jobs
 */
export const getPilotBookings = async (pilotId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('pilot_id', pilotId)
    .neq('status', 'Cancelled')
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Booking[];
};

/**
 * Pilot accepts a booking
 * Used in: Available jobs screen (accept button)
 */
export const acceptBooking = async (bookingId: string, pilotId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      pilot_id: pilotId,
      status: 'Confirmed',
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;

  // Create notification for client
  const booking = data as Booking;
  await createNotification(booking.client_id, 'Booking Accepted', 'A pilot has accepted your booking');

  return data as Booking;
};

/**
 * Complete a booking
 * Used in: Booking details screen (Mark as Completed button)
 */
export const completeBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'Completed' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

/**
 * Add rating and review to completed booking
 * Used in: RatingScreen (after booking completion)
 */
export const rateBooking = async (
  bookingId: string,
  rating: number,
  reviewText?: string
) => {
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const { data, error } = await supabase
    .from('bookings')
    .update({
      rating,
      review_text: reviewText || null,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

/**
 * Cancel a booking
 * Used in: MyBookings screen (Cancel button)
 */
export const cancelBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'Cancelled' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

/**
 * Get pilot earnings (total from completed bookings)
 * Used in: EarningsOverview, WalletScreen
 */
export const getPilotEarnings = async (pilotId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('price')
    .eq('pilot_id', pilotId)
    .eq('status', 'Completed');

  if (error) throw error;

  const total = (data as Booking[]).reduce((sum, booking) => sum + booking.price, 0);
  return {
    total,
    bookingCount: data?.length || 0,
    averagePerBooking: data && data.length > 0 ? total / data.length : 0,
  };
};

/**
 * Get booking details with client/pilot info
 * Used in: BookingDetails screen
 */
export const getBookingDetails = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data as Booking;
};

// ============================================================================
// NOTIFICATIONS QUERIES
// ============================================================================

/**
 * Get all notifications for user
 * Used in: NotificationsScreen
 */
export const getUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Notification[];
};

/**
 * Mark notification as read
 * Used in: NotificationsScreen (click to open)
 */
export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
};

/**
 * Get unread notification count
 * Used in: Bell icon badge on Dashboard
 */
export const getUnreadNotificationCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
};

/**
 * Subscribe to real-time notifications
 * Used in: Dashboard real-time updates
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  const subscription = supabase
    .from(`notifications`)
    .on('INSERT', (payload) => {
      if (payload.new.user_id === userId) {
        callback(payload.new as Notification);
      }
    })
    .subscribe();

  return subscription;
};

/**
 * Create notification (internal use, usually server-side)
 * Used in: Booking events, system alerts
 */
export const createNotification = async (
  userId: string,
  title: string,
  description: string
) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      description,
      read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
};

/**
 * Delete notification
 * Used in: Clear notifications
 */
export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
};

// ============================================================================
// AVAILABILITY QUERIES
// ============================================================================

/**
 * Get pilot's availability schedule
 * Used in: PilotProfile, AvailabilityManagement
 */
export const getPilotAvailability = async (pilotId: string) => {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('pilot_id', pilotId);

  if (error) throw error;
  return data as Availability[];
};

/**
 * UPSERT pilot availability (create or update)
 * Used in: AvailabilityManagement screen
 */
export const updatePilotAvailability = async (
  pilotId: string,
  dayOfWeek: DayOfWeek,
  status: AvailabilityStatus,
  hours?: string
) => {
  const { data, error } = await supabase
    .from('availability')
    .upsert(
      {
        pilot_id: pilotId,
        day_of_week: dayOfWeek,
        status,
        hours: hours || null,
      },
      { onConflict: 'pilot_id,day_of_week' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as Availability;
};

/**
 * Get active pilots for a specific day
 * Used in: Booking date selection filter
 */
export const getAvailablePilotsForDay = async (dayOfWeek: DayOfWeek) => {
  const { data, error } = await supabase
    .from('availability')
    .select('pilot:pilot_id(id, name, profile_pic_url)')
    .eq('day_of_week', dayOfWeek)
    .eq('status', 'Active');

  if (error) throw error;
  return data as any[]; // Returns pilot objects
};

/**
 * Delete availability slot
 * Used in: Removing a day from schedule
 */
export const removeAvailabilitySlot = async (availabilityId: string) => {
  const { error } = await supabase
    .from('availability')
    .delete()
    .eq('id', availabilityId);

  if (error) throw error;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Search pilots by name or bio
 * Used in: BrowsePilots search feature
 */
export const searchPilots = async (query: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'pilot')
    .or(`name.ilike.%${query}%, bio.ilike.%${query}%`);

  if (error) throw error;
  return data as User[];
};

/**
 * Get top-rated pilots
 * Used in: Featured pilots, recommendations
 */
export const getTopRatedPilots = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('pilot_id')
    .eq('status', 'Completed')
    .not('rating', 'is', null)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const pilotIds = (data as Booking[]).map((b) => b.pilot_id).filter(Boolean);
  const uniquePilotIds = [...new Set(pilotIds)];

  const { data: pilots, error: pilotError } = await supabase
    .from('users')
    .select('*')
    .in('id', uniquePilotIds as string[]);

  if (pilotError) throw pilotError;
  return pilots as User[];
};

/**
 * Filter bookings by status and date range
 * Used in: Advanced filtering, analytics
 */
export const filterBookings = async (
  filters: {
    status?: BookingStatus;
    startDate?: string;
    endDate?: string;
    minPrice?: number;
    maxPrice?: number;
  }
) => {
  let query = supabase.from('bookings').select('*');

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.startDate) query = query.gte('date', filters.startDate);
  if (filters.endDate) query = query.lte('date', filters.endDate);
  if (filters.minPrice) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

  const { data, error } = await query;

  if (error) throw error;
  return data as Booking[];
};

// ============================================================================
// SECURITY & GDPR FUNCTIONS
// ============================================================================

/**
 * Hard delete a user's entire account footprint for GDPR Right to be Forgotten.
 */
export const deleteUserAccount = async (userId: string) => {
  try {
    // 1. Delete from users table
    const { error: userError } = await supabase.from('users').delete().eq('id', userId);
    if (userError) throw userError;

    // 2. Delete bookings
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .or(`client_id.eq.${userId},pilot_id.eq.${userId}`);
    if (bookingsError) throw bookingsError;

    // 3. Delete notifications
    const { error: notifError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    if (notifError) throw notifError;

    // 4. Delete availability
    const { error: availError } = await supabase
      .from('availability')
      .delete()
      .eq('pilot_id', userId);
    if (availError) throw availError;

    return { success: true };
  } catch (error: any) {
    console.error('GDPR deletion failed:', error.message);
    throw new Error('Failed to delete user data: ' + error.message);
  }
};

const ERROR_MESSAGES: { [key: string]: string } = {
  'auth/user-not-found': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password': 'Password must be at least 8 characters',
  'auth/invalid-email': 'Invalid email format',
  'auth/user-disabled': 'This account has been disabled',
  'auth/too-many-requests': 'Too many login attempts. Please try again later',
  'NETWORK_ERROR': 'Connection failed. Please check your internet.',
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
};

export const getSafeErrorMessage = (error: any): string => {
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  if (error?.message) {
    if (typeof error.message === 'string' && error.message.trim() === '{}') {
      return JSON.stringify(error);
    }
    const errorKey = Object.keys(ERROR_MESSAGES).find(
      (key) => typeof error.message === 'string' && error.message.toLowerCase().includes(key.toLowerCase())
    );
    if (errorKey) return ERROR_MESSAGES[errorKey];
    return typeof error.message === 'string' ? error.message : JSON.stringify(error.message); 
  }
  return error ? JSON.stringify(error) : ERROR_MESSAGES['UNKNOWN_ERROR'];
};

// ============================================================================
// PHONE AUTH (TWILIO)
// ============================================================================

export const sendPhoneOtp = async (phone: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const sendPhoneChangeOtp = async (phone: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({ phone });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending phone change OTP:', error);
    throw error;
  }
};

export const verifyPhoneChangeOtp = async (phone: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'phone_change',
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error verifying phone change OTP:', error);
    throw error;
  }
};

export const verifyPhoneOtp = async (phone: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// ============================================================================
// EMAIL AUTH (OTP)
// ============================================================================

export const sendEmailOtp = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email OTP:', error);
    throw error;
  }
};

export const verifyEmailOtp = async (email: string, token: string, type: 'signup' | 'magiclink' | 'recovery' | 'email_change' | 'email' = 'email') => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Verify Email OTP Error:', error);
    throw error;
  }
};

export default {
  // Users
  upsertUser,
  getAllPilots,
  getPilotProfile,
  getCurrentUserProfile,
  updateUserProfile,
  addCredits,

  // Bookings
  createBooking,
  subscribeToClientBookings,
  fetchClientBookings,
  getPendingBookings,
  getPilotBookings,
  acceptBooking,
  completeBooking,
  rateBooking,
  cancelBooking,
  getPilotEarnings,
  getBookingDetails,

  // Notifications
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  subscribeToNotifications,
  createNotification,
  deleteNotification,

  // Availability
  getPilotAvailability,
  updatePilotAvailability,
  getAvailablePilotsForDay,
  removeAvailabilitySlot,

  // Utilities
  searchPilots,
  getTopRatedPilots,
  filterBookings,
  
  // Security
  deleteUserAccount,
  getSafeErrorMessage,

  // Phone Auth
  sendPhoneOtp,
  verifyPhoneOtp,
  verifyEmailOtp,
};
