// useBharatAero.ts
// Custom React Hooks for BharatAero Database Operations
// Import these in your screens/components

import { useEffect, useState, useCallback } from 'react';
// @ts-ignore
import { useApp } from './context/AppContext';
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

// Module-level caches for immediate loading of dashboard components across screens
let memoizedPendingBookings: Booking[] = [];
const memoizedPilotEarnings: Record<string, any> = {};

// ============================================================================
// USER HOOKS
// ============================================================================

/**
 * Hook: Fetch current user profile
 * Usage: const { user, loading, error } = useCurrentUser(userId);
 */
export const useCurrentUser = (userId: string | null) => {
  const { registeredUser, setRegisteredUser } = useApp() || {};
  
  // Use cached user if it matches the requested userId
  const isCurrentUser = registeredUser && (registeredUser.id === userId || registeredUser.uid === userId);
  const cachedUser = isCurrentUser ? registeredUser : null;

  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(cachedUser ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (cachedUser) {
      setUser(cachedUser);
    }

    const fetchUser = async () => {
      try {
        const userData = await getCurrentUserProfile(userId);
        setUser(userData);
        if (userData && isCurrentUser && setRegisteredUser) {
          setRegisteredUser(userData);
        }
        setError(null);
      } catch (err) {
        if (!cachedUser) {
          setError(err instanceof Error ? err.message : 'Failed to fetch user');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, cachedUser, isCurrentUser, setRegisteredUser]);

  return { user, loading, error };
};

/**
 * Hook: Fetch pilot earnings
 * Usage: const { earnings, loading, error } = usePilotEarnings(pilotId);
 */
export const usePilotEarnings = (pilotId: string | null) => {
  const cacheKey = pilotId || 'none';
  const cached = memoizedPilotEarnings[cacheKey];

  const [earnings, setEarnings] = useState(cached || {
    total: 0,
    bookingCount: 0,
    averagePerBooking: 0,
  });
  const [loading, setLoading] = useState(cached ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pilotId) {
      setLoading(false);
      return;
    }

    const fetchEarnings = async () => {
      try {
        const earningsData = await getPilotEarnings(pilotId);
        setEarnings(earningsData);
        memoizedPilotEarnings[cacheKey] = earningsData;
        setError(null);
      } catch (err) {
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [pilotId, cacheKey, cached]);

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
  const { bookings: cachedBookings, setBookings: setContextBookings } = useApp() || {};
  const initialBookings = cachedBookings || [];

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loading, setLoading] = useState(initialBookings.length > 0 ? false : true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (showLoading = false) => {
    if (!clientId) return;
    try {
      if (showLoading) setLoading(true);
      const data = await fetchClientBookings(clientId);
      setBookings(data);
      if (setContextBookings) {
        setContextBookings(data);
      }
      setError(null);
    } catch (err) {
      if (initialBookings.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      }
    } finally {
      setLoading(false);
    }
  }, [clientId, setContextBookings, initialBookings.length]);

  useEffect(() => {
    if (cachedBookings && cachedBookings.length > 0) {
      setBookings(cachedBookings);
    }
    refetch(cachedBookings && cachedBookings.length > 0 ? false : true);
  }, [clientId, refetch]);

  return { bookings, loading, error, refetch };
};

/**
 * Hook: Fetch pilot's bookings
 * Usage: const { bookings, loading, error } = usePilotBookings(pilotId);
 */
export const usePilotBookings = (pilotId: string | null) => {
  const { bookings: cachedBookings, setBookings: setContextBookings } = useApp() || {};
  const initialBookings = cachedBookings || [];

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loading, setLoading] = useState(initialBookings.length > 0 ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pilotId) {
      setLoading(false);
      return;
    }

    if (cachedBookings && cachedBookings.length > 0) {
      setBookings(cachedBookings);
    }

    const fetchBookings = async () => {
      try {
        const data = await getPilotBookings(pilotId);
        setBookings(data);
        if (setContextBookings) {
          setContextBookings(data);
        }
        setError(null);
      } catch (err) {
        if (initialBookings.length === 0) {
          setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [pilotId, cachedBookings, setContextBookings, initialBookings.length]);

  return { bookings, loading, error };
};

/**
 * Hook: Fetch pending (available) bookings for pilots
 * Usage: const { bookings, loading, error } = usePendingBookings();
 */
export const usePendingBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(memoizedPendingBookings);
  const [loading, setLoading] = useState(memoizedPendingBookings.length > 0 ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getPendingBookings();
        setBookings(data);
        memoizedPendingBookings = data;
        setError(null);
      } catch (err) {
        if (memoizedPendingBookings.length === 0) {
          setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

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
  const { notifications } = useApp() || {};
  const cachedCount = notifications ? notifications.filter((n: any) => !n.read && !n.is_read).length : 0;

  const [count, setCount] = useState(cachedCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      try {
        const unreadCount = await getUnreadNotificationCount(userId);
        setCount(unreadCount);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchCount();

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
