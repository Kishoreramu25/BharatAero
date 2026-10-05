import React, { lazy, Suspense } from 'react';
import { useApp } from '../context/AppContext';
import { prefetchScreen } from '../hooks/useRouterPrefetch';

// Lazy load screens
const OnboardingCarousel = lazy(() => import('../screens/OnboardingCarousel'));
const RoleSelection = lazy(() => import('../screens/RoleSelection'));
const LoginScreen = lazy(() => import('../screens/LoginScreen'));
const ClientDashboard = lazy(() => import('../screens/ClientDashboard'));
const BrowsePilots = lazy(() => import('../screens/BrowsePilots'));
const PilotProfile = lazy(() => import('../screens/PilotProfile'));
const BookPilot = lazy(() => import('../screens/BookPilot'));
const BookingConfirmed = lazy(() => import('../screens/BookingConfirmed'));
const MyBookings = lazy(() => import('../screens/MyBookings'));
const PilotDashboard = lazy(() => import('../screens/PilotDashboard'));
const EarningsOverview = lazy(() => import('../screens/EarningsOverview'));
const AvailabilityManagement = lazy(() => import('../screens/AvailabilityManagement'));
const SettingsScreen = lazy(() => import('../screens/SettingsScreen'));
const NotificationsScreen = lazy(() => import('../screens/NotificationsScreen'));
const AboutScreen = lazy(() => import('../screens/AboutScreen'));
const PrivacyPolicy = lazy(() => import('../screens/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../screens/TermsOfService'));

// Loading spinner fallback component
const ScreenLoader = () => (
  <div className="flex-grow flex items-center justify-center bg-white dark:bg-background h-full">
    <div className="w-6 h-6 border-2 border-neutral-200 border-t-[#ca0013] rounded-full animate-spin"></div>
  </div>
);

export default function SimulatorFrame() {
  const { currentScreen, transitionTimerRef } = useApp();

  // Stop route transition timer on render/mount
  React.useEffect(() => {
    if (transitionTimerRef && transitionTimerRef.current) {
      transitionTimerRef.current.end();
      transitionTimerRef.current = null;
    }
  }, [currentScreen, transitionTimerRef]);

  // On mount, prefetch next likely screens (role selection, login) to speed up initial clicks
  React.useEffect(() => {
    prefetchScreen('role_selection');
    prefetchScreen('login');
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading': return <ScreenLoader />;
      case 'onboarding': return <OnboardingCarousel />;
      case 'role_selection': return <RoleSelection />;
      case 'login': return <LoginScreen />;
      case 'client_dashboard': return <ClientDashboard />;
      case 'browse_pilots': return <BrowsePilots />;
      case 'pilot_profile': return <PilotProfile />;
      case 'book_pilot': return <BookPilot />;
      case 'booking_confirmed': return <BookingConfirmed />;
      case 'my_bookings': return <MyBookings />;
      case 'pilot_dashboard': return <PilotDashboard />;
      case 'earnings': return <EarningsOverview />;
      case 'availability': return <AvailabilityManagement />;
      case 'settings': return <SettingsScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'about': return <AboutScreen />;
      case 'privacy': return <PrivacyPolicy />;
      case 'terms': return <TermsOfService />;
      default: return <OnboardingCarousel />;
    }
  };

  // Screen classification for desktop responsiveness
  const isDashboardOrListing = [
    'client_dashboard',
    'pilot_dashboard',
    'browse_pilots',
    'pilot_profile',
    'book_pilot',
    'booking_confirmed',
    'my_bookings',
    'earnings',
    'availability',
    'settings',
    'notifications',
    'about',
    'privacy',
    'terms'
  ].includes(currentScreen);

  const responsiveMaxWidth = isDashboardOrListing
    ? 'md:max-w-4xl lg:max-w-5xl xl:max-w-6xl'
    : 'md:max-w-xl lg:max-w-2xl';

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#f4f2ee] dark:bg-[#080a0e] flex justify-center text-[#1b1c1b] dark:text-[#dce5dc] relative transition-colors duration-300 overflow-x-hidden">
      
      {/* Background decoration blur bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px]"></div>
      </div>

      {/* 
        Responsive App Viewport:
        - Mobile (< md): 100% full-screen native mobile experience without side borders or gaps
        - Desktop (>= md): Gracefully expands to wide dashboard or clean centered portal with full vertical reach
      */}
      <div 
        className={`w-full ${responsiveMaxWidth} min-h-screen min-h-[100dvh] bg-white dark:bg-[#0d0e12] text-on-background shadow-none md:shadow-2xl md:border-x border-neutral-200 dark:border-neutral-800/80 flex flex-col relative z-10 overflow-hidden`}
        style={{ transform: 'translate(0, 0)' }}
      >
        <Suspense fallback={<ScreenLoader />}>
          {renderScreen()}
        </Suspense>
      </div>

    </div>
  );
}
