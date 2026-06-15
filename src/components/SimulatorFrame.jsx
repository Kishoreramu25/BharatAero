import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, UserSquare2, Sliders, Moon, Sun } from 'lucide-react';

// Import screens
import OnboardingCarousel from '../screens/OnboardingCarousel';
import RoleSelection from '../screens/RoleSelection';
import LoginScreen from '../screens/LoginScreen';
import ClientDashboard from '../screens/ClientDashboard';
import BrowsePilots from '../screens/BrowsePilots';
import PilotProfile from '../screens/PilotProfile';
import BookPilot from '../screens/BookPilot';
import BookingConfirmed from '../screens/BookingConfirmed';
import MyBookings from '../screens/MyBookings';
import PilotDashboard from '../screens/PilotDashboard';
import EarningsOverview from '../screens/EarningsOverview';
import AvailabilityManagement from '../screens/AvailabilityManagement';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutScreen from '../screens/AboutScreen';

export default function SimulatorFrame() {
  const { 
    currentScreen, setCurrentScreen, 
    userRole, setUserRole, 
    isLoggedIn, setIsLoggedIn, 
    theme, setTheme,
    setBookings,
    setNotifications,
    setRegisteredUser,
    setSelectedPilot,
    setAvailability
  } = useApp();

  const [showDevMenu, setShowDevMenu] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const resetSimulator = () => {
    setCurrentScreen('onboarding');
    setUserRole(null);
    setIsLoggedIn(false);
    setBookings([]);
    setNotifications([]);
    setRegisteredUser({ email: '', password: '' });
    setSelectedPilot(null);
    setAvailability([
      { day: 'Monday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
      { day: 'Tuesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
      { day: 'Wednesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
      { day: 'Thursday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
      { day: 'Friday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
      { day: 'Saturday', status: 'On Call', hours: '10:00 AM - 04:00 PM', checked: false },
      { day: 'Sunday', status: 'Unavailable', hours: 'Rest Day', checked: false }
    ]);
    setShowDevMenu(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
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
      default: return <OnboardingCarousel />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eeebe3] dark:bg-[#0d1510] flex justify-center text-[#1b1c1b] dark:text-[#dce5dc] relative transition-colors duration-300">
      
      {/* Background decoration blur bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px]"></div>
      </div>

      {/* 
        Sleek Centered Mobile Viewport 
        Note: Using style transform 'translate(0, 0)' is a standard CSS containment rule. 
        It forces all children positioned as 'fixed' to align relative to this wrapper container 
        rather than the browser window, making the interface completely mobile-friendly on desktop!
      */}
      <div 
        className="w-full max-w-[480px] h-screen bg-background text-on-background shadow-2xl border-x border-[#b7c6c2]/45 dark:border-[#3c4a41]/55 flex flex-col relative z-10 overflow-hidden"
        style={{ transform: 'translate(0, 0)' }}
      >
        {React.cloneElement(renderScreen(), { key: `${currentScreen}-${reloadKey}` })}
        
        {/* Floating Reload Page Button */}
        <button 
          onClick={() => setReloadKey(prev => prev + 1)}
          className="absolute bottom-20 right-4 z-50 w-9 h-9 rounded-full bg-white/80 dark:bg-[#131f17]/85 backdrop-blur-md border border-[#b7c6c2]/60 dark:border-[#3c4a41]/60 shadow-md text-[#000201] dark:text-[#dce5dc] hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Reload Page"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Floating Developer Tools Pill */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-headline select-none">
        {showDevMenu && (
          <div className="bg-neutral-900/90 text-white rounded-2xl p-4 shadow-xl border border-neutral-800 flex flex-col gap-2.5 min-w-[180px] backdrop-blur-md animate-fade-in">
            <h4 className="text-[10px] font-bold tracking-widest text-[#ca0013] uppercase border-b border-neutral-800 pb-1.5 mb-1">Dev Simulator Tools</h4>
            
            {/* Toggle Theme */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left"
            >
              {theme === 'dark' ? <Sun size={14} className="text-primary" /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Use Light UI' : 'Use Dark UI'}</span>
            </button>

            {/* Toggle Role */}
            <button 
              onClick={() => {
                const nextRole = userRole === 'client' ? 'pilot' : 'client';
                setUserRole(nextRole);
                setCurrentScreen(nextRole === 'client' ? 'client_dashboard' : 'pilot_dashboard');
              }}
              className="flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors text-left"
            >
              <UserSquare2 size={14} />
              <span>Switch to {userRole === 'client' ? 'Pilot' : 'Client'}</span>
            </button>

            {/* Reset State */}
            <button 
              onClick={resetSimulator}
              className="flex items-center gap-2 text-xs font-semibold hover:text-[#ca0013] transition-colors text-left"
            >
              <RotateCcw size={14} />
              <span>Reset Simulator</span>
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <button 
          onClick={() => setShowDevMenu(!showDevMenu)}
          className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg border border-neutral-800 active:scale-95 transition-all"
          title="Toggle Controls"
        >
          <Sliders size={16} />
        </button>
      </div>

    </div>
  );
}
