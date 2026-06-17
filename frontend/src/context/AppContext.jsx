import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { perfMonitor } from '../utils/perfMonitor';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Capacitor } from '@capacitor/core';
import { getTranslation } from '../utils/translations';
import { SecureStorage } from '../utils/SecureStorage';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const sendResendEmail = async (toEmail, otpCode, recipientName) => {
  const payload = {
    email: toEmail,
    name: recipientName
  };
  
  const isWeb = Capacitor.getPlatform() === 'web';
  const url = isWeb ? '/api/send-otp' : 'http://localhost:5000/api/send-otp';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error((errorData.error && errorData.error.message) || `API Error Status: ${response.status}`);
  }
  return true;
};

export const AppProvider = ({ children }) => {
  // Navigation & Auth State
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userRole, setUserRole] = useState(null); // 'client' or 'pilot'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'explore', 'bookings', 'settings' etc.
  const [theme, setTheme] = useState('light');
  const [registeredUser, setRegisteredUser] = useState({ name: '', email: '', password: '', phone: '', id: '' });
  const [autoOpenProfileModal, setAutoOpenProfileModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedPilot, setSelectedPilot] = useState(null);

  // Shared Data States
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const [availability, setAvailability] = useState([
    { day: 'Monday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Tuesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Wednesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Thursday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Friday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Saturday', status: 'On Call', hours: '10:00 AM - 04:00 PM', checked: false },
    { day: 'Sunday', status: 'Unavailable', hours: 'Rest Day', checked: false }
  ]);

  // Load from SecureStorage on mount
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const savedUser = await SecureStorage.get({ key: 'bharataero_registered_user' });
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser.password) delete parsedUser.password;
          setRegisteredUser(parsedUser);
        }

        const savedLang = await SecureStorage.get({ key: 'bharataero_selected_language' });
        if (savedLang) setSelectedLanguage(savedLang);

        const savedBookings = await SecureStorage.get({ key: 'bharataero_bookings' });
        if (savedBookings) setBookings(JSON.parse(savedBookings));

        const savedNotifications = await SecureStorage.get({ key: 'bharataero_notifications' });
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

        const savedToken = await SecureStorage.get({ key: 'bharataero_auth_token' });
        const savedLoggedIn = await SecureStorage.get({ key: 'bharataero_is_logged_in' });
        const savedRole = await SecureStorage.get({ key: 'bharataero_user_role' });

        if (savedToken && savedLoggedIn === 'true' && savedRole) {
          setIsLoggedIn(true);
          setUserRole(savedRole);
          setCurrentScreen(savedRole === 'pilot' ? 'pilot_dashboard' : 'client_dashboard');
        }
      } catch (e) {
        console.warn("Failed to load from SecureStorage:", e);
      } finally {
        setIsStorageLoaded(true);
      }
    };
    loadStorage();
  }, []);

  // Save to SecureStorage when states change, but ONLY after initial load is complete!
  useEffect(() => {
    if (!isStorageLoaded) return;
    SecureStorage.set({ key: 'bharataero_bookings', value: JSON.stringify(bookings) })
      .catch(e => console.warn("Failed to save bookings to SecureStorage:", e));
  }, [bookings, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    SecureStorage.set({ key: 'bharataero_notifications', value: JSON.stringify(notifications) })
      .catch(e => console.warn("Failed to save notifications to SecureStorage:", e));
  }, [notifications, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    const userToSave = { ...registeredUser };
    if (userToSave.password) delete userToSave.password;
    SecureStorage.set({ key: 'bharataero_registered_user', value: JSON.stringify(userToSave) })
      .catch(e => console.warn("Failed to save registeredUser to SecureStorage:", e));
  }, [registeredUser, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    SecureStorage.set({ key: 'bharataero_selected_language', value: selectedLanguage })
      .catch(e => console.warn("Failed to save selectedLanguage to SecureStorage:", e));
  }, [selectedLanguage, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    SecureStorage.set({ key: 'bharataero_is_logged_in', value: String(isLoggedIn) })
      .catch(e => console.warn("Failed to save isLoggedIn to SecureStorage:", e));
  }, [isLoggedIn, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    if (userRole) {
      SecureStorage.set({ key: 'bharataero_user_role', value: userRole })
        .catch(e => console.warn("Failed to save userRole to SecureStorage:", e));
    } else {
      SecureStorage.remove({ key: 'bharataero_user_role' }).catch(() => {});
    }
  }, [userRole, isStorageLoaded]);


  // Pilots Data (Static references with rating and prices)
  const pilotsList = [
    {
      id: 'p1',
      name: 'Alex Mercer',
      role: 'UAV Survey specialist',
      rating: 4.9,
      reviews: 142,
      price: 650,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I',
      bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXjE2_9Uj6PCnGnvdW5Q8zY9BV0Qxwf7QmWw-aGYicheZpA2m_pa3f3Q65QmAoF5gpxZym31kIU2G86FlrBzfPr_juQAMN7eC3fePY2WmPZC2pUBa0jX7gEh32mqyOSUo5U8ltGykRtIJZEBuLrozJcgJDaa_2NUOklTBnM4QxzLotyYT2qGZfG8ZjCQ1IS8Cjw3JRcSdDX805l3QqgyPizHnn7NdkyOo1PRgXNHuFfTIyPbrTLlU4njxjVTYdrZ-b9p9H18RAgUw',
      specialty: 'Precision Agriculture, Orthomosaic Mapping',
      drone: 'DJI Agras T40 / Phantom 4 RTK',
      experience: '5+ Years Enterprise Flight Operations',
      badges: ['FAA Part 107', 'Top Rated', 'Thermal Cert'],
      location: 'Midwest Agriculture Belt'
    },
    {
      id: 'p2',
      name: 'Sarah Jenkins',
      role: 'Industrial Inspector',
      rating: 4.8,
      reviews: 98,
      price: 890,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSxb1o191CQhouUKX0ug1lyvA_JO6PmmHOQUN03n13IfRLG4_kjk3p_Ak76_oxirai8RCafODohv7tqhmLMa_n5_5RHe0PKjXafnHoK9i48_y1SHsw_6SF71RIgYQPzJ27w2eHp0-ydAre_bAWOjFbJymtZz0kCNS5400OX6p9cZl8-A6DPwCKzEJd5FZMAR9hQUAqbeFgQCCQwx0SrJq3sRx5wXFyK-SjhC9Dm1JRJdRferfYftQDnKDCI8UiSUJ55Ri8tlGTxeg',
      bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSxb1o191CQhouUKX0ug1lyvA_JO6PmmHOQUN03n13IfRLG4_kjk3p_Ak76_oxirai8RCafODohv7tqhmLMa_n5_5RHe0PKjXafnHoK9i48_y1SHsw_6SF71RIgYQPzJ27w2eHp0-ydAre_bAWOjFbJymtZz0kCNS5400OX6p9cZl8-A6DPwCKzEJd5FZMAR9hQUAqbeFgQCCQwx0SrJq3sRx5wXFyK-SjhC9Dm1JRJdRferfYftQDnKDCI8UiSUJ55Ri8tlGTxeg',
      specialty: 'Infrastructure, Wind Turbines, Solar Farms',
      drone: 'DJI Matrice 300 RTK / DJI Inspire 3',
      experience: '4 Years Structural Engineering UAVs',
      badges: ['FAA Part 107', 'Infrared Level II'],
      location: 'Texas Energy Sector'
    }
  ];

  // Helper function to add a booking
  const addBooking = (newBkg) => {
    const bookingId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;
    const freshBkg = {
      id: bookingId,
      status: 'Pending',
      signalStrength: 'Excellent',
      ...newBkg
    };
    setBookings(prev => [freshBkg, ...prev]);

    // Send automated notification
    addNotification({
      title: 'Booking Requested',
      desc: `A new ${newBkg.type} has been requested with ${newBkg.pilotName}.`,
      time: 'Just now'
    });
  };

  // Helper function to accept a booking
  const acceptBooking = (bookingId, pilotName, pilotPhone, pilotProfile = null) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { 
        ...b, 
        status: 'Confirmed', 
        pilotName, 
        pilotPhone,
        pilotImage: pilotProfile?.profilePic || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEar_up8KhgESF_MeXQRJ0PqL3eqb64LpZpvQFx7OmZhkkKKd3x0d4lPv6S2lPVb_hyLCWGb0jlqOGNsy4BosH7adSDS9EaDCtGXEDDeDijf4953yN7FUkdDIeJIpmE4kArH9Q-WxEALZ8XzQWvSBph7_HKHRyot2VpNGidEV8-sXwwj059lp-Zg_mRt-fuA3KFSDFoebuwC96dF9AZgyuki-JClbEjCcBHEDrznPBkpyNVVTDi4o_VwPGj0dgvVx7_VlfNV8N6U4',
        pilotProfile: pilotProfile || {
          name: pilotName,
          phone: pilotPhone,
          email: 'pilot@misd-automation.com',
          bio: 'Professional Drone Pilot and UAV Specialist.',
          profilePic: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I'
        }
      } : b)
    );

    addNotification({
      title: 'Mission Accepted',
      desc: `Pilot ${pilotName} (${pilotPhone}) accepted mission ${bookingId}.`,
      time: 'Just now'
    });
  };

  // Helper function to complete a booking and leave a review
  const completeBookingWithReview = (bookingId, rating, reviewText) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { 
        ...b, 
        status: 'Completed', 
        rating: Number(rating), 
        reviewText 
      } : b)
    );

    addNotification({
      title: 'New Review Received',
      desc: `You received a ${rating}-star review: "${reviewText}"`,
      time: 'Just now'
    });
  };

  // Helper to add notifications
  const addNotification = ({ title, desc, time }) => {
    setNotifications(prev => [
      { id: Date.now(), title, desc, time, read: false },
      ...prev
    ]);
  };

  // Payout / Earnings calculation
  const getCompletedEarnings = () => {
    const completedSum = bookings
      .filter(b => b.status === 'Completed')
      .reduce((sum, b) => sum + b.price, 0);
    return completedSum; // Started from $0.00, clean of demo data
  };

  const t = (key) => getTranslation(selectedLanguage, key);

  // Sync dark class on html tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle Google OAuth Callback in Redirect Flow
  useEffect(() => {
    const initGoogle = async () => {
      // 1. Run Capawesome Google Sign-In setup
      try {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          console.warn('Google Client ID (VITE_GOOGLE_CLIENT_ID) is missing from environment variables.');
        }
        
        const initOptions = {
          clientId: googleClientId || '',
        };
        
        if (Capacitor.getPlatform() === 'web') {
          // Set redirect URL to current page to receive query params
          initOptions.redirectUrl = window.location.href.split(/[?#]/)[0];
        }

        await GoogleSignIn.initialize(initOptions);
        console.log('Google Sign-In plugin initialized successfully.');

        // Handle redirect callback if we are on web and the URL has OAuth params
        if (Capacitor.getPlatform() === 'web') {
          const url = window.location.href;
          if (url.includes('code=') || url.includes('state=')) {
            const result = await GoogleSignIn.handleRedirectCallback();
            console.log('Google Sign-In Success from redirect:', result);
            
            setRegisteredUser({
              name: result.displayName || result.givenName || 'Google User',
              email: result.email,
              password: 'google-oauth-session'
            });
            setIsLoggedIn(true);
            
            setUserRole(prev => {
              const role = prev || 'client';
              setCurrentScreen(role === 'pilot' ? 'pilot_dashboard' : 'client_dashboard');
              return role;
            });
            
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }
      } catch (err) {
        console.warn('Google SDK init/callback warning:', err);
      }

      // 2. Hash-based custom fallback (if any)
      try {
        const hash = window.location.hash;
        const isCallbackPath = window.location.pathname === '/auth/callback';
        const hasAccessToken = hash && hash.includes('access_token');

        if (isCallbackPath || hasAccessToken) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            window.history.replaceState({}, document.title, '/');
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
            if (res.ok) {
              const userInfo = await res.json();
              const googleName = userInfo.name || userInfo.given_name || 'Google User';
              const googleEmail = userInfo.email;

              setRegisteredUser({
                name: googleName,
                email: googleEmail,
                password: ''
              });
              setIsLoggedIn(true);

              setUserRole(prev => {
                const role = prev || 'client';
                setCurrentScreen(role === 'pilot' ? 'pilot_dashboard' : 'client_dashboard');
                return role;
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Google userinfo on hash callback:', err);
      }
    };

    initGoogle();
  }, []);

  const transitionTimerRef = useRef(null);

  // Navigate utility
  const navigate = (screen, tab = 'home') => {
    if (currentScreen !== screen) {
      transitionTimerRef.current = perfMonitor.startRouteTransition(currentScreen, screen);
    }
    setCurrentScreen(screen);
    setActiveTab(tab);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserRole(null);
    try {
      await SecureStorage.remove({ key: 'bharataero_auth_token' });
      await SecureStorage.remove({ key: 'bharataero_is_logged_in' });
      await SecureStorage.remove({ key: 'bharataero_user_role' });
    } catch (e) {
      console.warn("Failed to clean SecureStorage on logout:", e);
    }
    navigate('role_selection');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        userRole,
        setUserRole,
        isLoggedIn,
        setIsLoggedIn,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        bookings,
        setBookings,
        addBooking,
        acceptBooking,
        completeBookingWithReview,
        availability,
        setAvailability,
        notifications,
        setNotifications,
        addNotification,
        getCompletedEarnings,
        pilotsList,
        navigate,
        registeredUser,
        setRegisteredUser,
        autoOpenProfileModal,
        setAutoOpenProfileModal,
        selectedLanguage,
        setSelectedLanguage,
        t,
        selectedPilot,
        setSelectedPilot,
        sendResendEmail,
        logout,
        transitionTimerRef
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
