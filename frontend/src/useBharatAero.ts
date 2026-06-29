// useBharatAero.ts
// Custom React Hooks for BharatAero Database Operations
// Import these in your screens/components

import { useEffect, useState, useCallback } from 'react';
import {
  User,
  Booking,
  Notification,
  Availability,
  fetchClientBookings,
  getPilotBookings,
  getPendingBookings,
  getUserNotifications,
  getPilotAvailability,
  subscribeToNotifications,
  subscribeToClientBookings,
  getCurrentUserProfile,
  getPilotEarnings,
  getUnreadNotificationCount,
} from './supabaseQueries';

// ============================================================================
// USER HOOKS
// ============================================================================

/**
 * Hook: Fetch current user profile
 * Usage: const { user, loading, error } = useCurrentUser(userId);
 */
export const useCurrentUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUserProfile(userId);
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};

/**
 * Hook: Fetch pilot earnings
 * Usage: const { earnings, loading, error } = usePilotEarnings(pilotId);
 */
export const usePilotEarnings = (pilotId: string | null) => {
  const [earnings, setEarnings] = useState({
    total: 0,
    bookingCount: 0,
    averagePerBooking: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pilotId) {
      setLoading(false);
      return;
    }

    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const earningsData = await getPilotEarnings(pilotId);
        setEarnings(earningsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [pilotId]);

  return { earnings, loading, error };
};

// ============================================================================
// BOOKING HOOKS
// ============================================================================

/**
 * Hook: Fetch client's bookings
 * Usage: const { bookings, loading, error, refetch } = useClientBookings(clientId);
 */
export const useClientBookings = (clientId: string | null) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await fetchClientBookings(clientId);
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [clientId, refetch]);

  return { bookings, loading, error, refetch };
};

/**
 * Hook: Fetch pilot's bookings
 * Usage: const { bookings, loading, error } = usePilotBookings(pilotId);
 */
export const usePilotBookings = (pilotId: string | null) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pilotId) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getPilotBookings(pilotId);
        setBookings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [pilotId]);

  return { bookings, loading, error };
};

/**
 * Hook: Fetch pending (available) bookings for pilots
 * Usage: const { bookings, loading, error } = usePendingBookings();
 */
export const usePendingBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getPendingBookings();
        setBookings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Refetch every 10 seconds for real-time feel
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  return { bookings, loading, error };
};

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

/**
 * Hook: Fetch user notifications
 * Usage: const { notifications, loading, error, refetch } = useNotifications(userId);
 */
export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getUserNotifications(userId);
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [userId, refetch]);

  return { notifications, loading, error, refetch };
};

/**
 * Hook: Real-time notifications subscription
 * Usage: const newNotification = useRealtimeNotifications(userId);
 */
export const useRealtimeNotifications = (userId: string | null) => {
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!userId) return;

    const subscription = subscribeToNotifications(userId, (notification) => {
      setNewNotification(notification);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return newNotification;
};

/**
 * Hook: Get unread notification count
 * Usage: const { count, loading } = useUnreadNotificationCount(userId);
 */
export const useUnreadNotificationCount = (userId: string | null) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      try {
        setLoading(true);
        const unreadCount = await getUnreadNotificationCount(userId);
        setCount(unreadCount);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Refetch every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return { count, loading };
};

// ============================================================================
// AVAILABILITY HOOKS
// ============================================================================

/**
 * Hook: Fetch pilot availability schedule
 * Usage: const { availability, loading, error } = usePilotAvailability(pilotId);
 */
export const usePilotAvailability = (pilotId: string | null) => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pilotId) {
      setLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const data = await getPilotAvailability(pilotId);
        setAvailability(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [pilotId]);

  return { availability, loading, error };
};

// ============================================================================
// COMBINED DASHBOARD HOOKS
// ============================================================================

/**
 * Hook: Client Dashboard data
 * Usage: const { user, bookings, unreadCount, loading } = useClientDashboard(userId);
 */
export const useClientDashboard = (userId: string | null) => {
  const { user, loading: userLoading } = useCurrentUser(userId);
  const { bookings, loading: bookingsLoading } = useClientBookings(userId);
  const { count: unreadCount } = useUnreadNotificationCount(userId);

  return {
    user,
    bookings,
    unreadCount,
    loading: userLoading || bookingsLoading,
  };
};

/**
 * Hook: Pilot Dashboard data
 * Usage: const { user, myBookings, availableJobs, earnings, loading } = usePilotDashboard(pilotId);
 */
export const usePilotDashboard = (pilotId: string | null) => {
  const { user, loading: userLoading } = useCurrentUser(pilotId);
  const { bookings: myBookings, loading: myBookingsLoading } = usePilotBookings(pilotId);
  const { bookings: availableJobs, loading: jobsLoading } = usePendingBookings();
  const { earnings, loading: earningsLoading } = usePilotEarnings(pilotId);

  return {
    user,
    myBookings,
    availableJobs,
    earnings,
    loading: userLoading || myBookingsLoading || jobsLoading || earningsLoading,
  };
};

/**
 * Hook: Browse Pilots with search
 * Usage: const { pilots, loading } = useBrowsePilots();
 */
export const useBrowsePilots = (searchQuery?: string) => {
  const [pilots, setPilots] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPilots = async () => {
      try {
        setLoading(true);
        // This is a placeholder - you'll need to implement getAllPilots or searchPilots
        // from your supabaseQueries file
        const data = await fetch('/api/pilots').then((r) => r.json());
        setPilots(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pilots');
      } finally {
        setLoading(false);
      }
    };

    fetchPilots();
  }, [searchQuery]);

  return { pilots, loading, error };
};

// ============================================================================
// ASYNC ACTION HOOKS (for forms)
// ============================================================================

/**
 * Hook: Handle booking creation with loading states
 * Usage: const { createBooking, loading, error } = useCreateBooking();
 */
export const useCreateBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (bookingData: any) => {
    try {
      setLoading(true);
      setError(null);
      // Implementation here
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBooking, loading, error };
};

/**
 * Hook: Handle rating submission
 * Usage: const { submitRating, loading, error } = useSubmitRating();
 */
export const useSubmitRating = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRating = useCallback(async (bookingId: string, rating: number, review?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Implementation here
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitRating, loading, error };
};

/**
 * Hook: Handle availability update
 * Usage: const { updateAvailability, loading, error } = useUpdateAvailability();
 */
export const useUpdateAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvailability = useCallback(async (pilotId: string, dayOfWeek: string, status: string, hours?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Implementation here
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateAvailability, loading, error };
};

export default {
  // User hooks
  useCurrentUser,
  usePilotEarnings,

  // Booking hooks
  useClientBookings,
  usePilotBookings,
  usePendingBookings,

  // Notification hooks
  useNotifications,
  useRealtimeNotifications,
  useUnreadNotificationCount,

  // Availability hooks
  usePilotAvailability,

  // Dashboard hooks
  useClientDashboard,
  usePilotDashboard,
  useBrowsePilots,

  // Action hooks
  useCreateBooking,
  useSubmitRating,
  useUpdateAvailability,
};
