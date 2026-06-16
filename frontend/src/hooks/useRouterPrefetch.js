import { useCallback } from 'react';

// Map of screen identifiers to their dynamic imports
export const screenImports = {
  onboarding: () => import('../screens/OnboardingCarousel'),
  role_selection: () => import('../screens/RoleSelection'),
  login: () => import('../screens/LoginScreen'),
  client_dashboard: () => import('../screens/ClientDashboard'),
  browse_pilots: () => import('../screens/BrowsePilots'),
  pilot_profile: () => import('../screens/PilotProfile'),
  book_pilot: () => import('../screens/BookPilot'),
  booking_confirmed: () => import('../screens/BookingConfirmed'),
  my_bookings: () => import('../screens/MyBookings'),
  pilot_dashboard: () => import('../screens/PilotDashboard'),
  earnings: () => import('../screens/EarningsOverview'),
  availability: () => import('../screens/AvailabilityManagement'),
  settings: () => import('../screens/SettingsScreen'),
  notifications: () => import('../screens/NotificationsScreen'),
  about: () => import('../screens/AboutScreen')
};

// Global helper to trigger a prefetch outside components
export const prefetchScreen = (screenName) => {
  const importFn = screenImports[screenName];
  if (importFn) {
    // Proactively load the chunk into the browser cache
    importFn().catch((err) => {
      console.warn(`[Prefetch] Failed to pre-load screen: ${screenName}`, err);
    });
  }
};

export default function useRouterPrefetch() {
  const prefetch = useCallback((screenName) => {
    prefetchScreen(screenName);
  }, []);

  return prefetch;
}
