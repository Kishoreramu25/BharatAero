import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { perfMonitor } from '../utils/perfMonitor';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const sendResendEmail = async (toEmail, otpCode, recipientName) => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend API key is missing");
  }

  const payload = {
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Your Bharat Aero OTP Verification Code',
    html: `
      <div style="font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 10px; margin: 0; min-height: 100%;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          
          <!-- Premium Dark Banner Header -->
          <div style="background: linear-gradient(135deg, #121316 0%, #0a0a0b 100%); padding: 35px 20px; text-align: center; border-bottom: 3px solid #ca0013;">
            <!-- Logo Container -->
            <div style="display: inline-block; margin-bottom: 15px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" style="display: block; margin: 0 auto;">
                <path d="M12 28C12 16.9543 20.9543 8 32 8C43.0457 8 52 16.9543 52 28" stroke="#FF9933" stroke-width="4" stroke-linecap="round"/>
                <path d="M56 28C56 41.2548 45.2548 52 32 52C18.7452 52 8 41.2548 8 28" stroke="#128807" stroke-width="4" stroke-linecap="round"/>
                <circle cx="32" cy="28" r="8" stroke="#000080" stroke-width="1.5"/>
                <circle cx="32" cy="28" r="2" fill="#000080"/>
                <line x1="32" y1="20" x2="32" y2="36" stroke="#000080" stroke-width="0.75"/>
                <line x1="24" y1="28" x2="40" y2="28" stroke="#000080" stroke-width="0.75"/>
                <line x1="26.34" y1="22.34" x2="37.66" y2="33.66" stroke="#000080" stroke-width="0.75"/>
                <line x1="26.34" y1="33.66" x2="37.66" y2="22.34" stroke="#000080" stroke-width="0.75"/>
                <path d="M18 38H46" stroke="#FF9933" stroke-width="3" stroke-linecap="round"/>
                <path d="M22 42H42" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
                <path d="M26 46H38" stroke="#128807" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
            <!-- Logo Typography -->
            <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin: 0; font-family: sans-serif;">
              <span style="color: #ffffff;">Bharat</span> <span style="color: #128807;">Aero</span>
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
              Drone Flight Operations
            </div>
          </div>

          <!-- Email Content Body -->
          <div style="padding: 40px 30px; background-color: #ffffff; text-align: left;">
            <h3 style="font-size: 15px; color: #1f2937; margin-top: 0; margin-bottom: 12px; font-weight: 700; font-family: sans-serif;">
              Hello ${recipientName},
            </h3>
            <p style="font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Please verify your identity using the verification code below to confirm changes to your Bharat Aero account profile:
            </p>

            <!-- OTP Card Pamphlet Style -->
            <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 1px solid #e5e7eb; border-left: 5px solid #ca0013; border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 30px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
              <span style="font-size: 10px; font-weight: 800; color: #ca0013; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px;">Security Passcode</span>
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #111827; font-family: 'Courier New', Courier, monospace; text-shadow: 1px 1px 1px rgba(0,0,0,0.05); display: inline-block; padding-left: 8px;">
                ${otpCode}
              </div>
              <span style="font-size: 11px; color: #6b7280; display: block; margin-top: 12px; font-weight: 500;">Valid for 10 minutes only</span>
            </div>

            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #f3f4f6; padding-top: 20px;">
              If you did not request this OTP, please disregard this transmission or contact Bharat Aero support immediately.
            </p>
          </div>

          <!-- Pamphlet Footer -->
          <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #f3f4f6;">
            <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">
              <span>Safe & Secure</span>
              <span style="color: #ca0013; font-size: 12px; margin: 0 4px;">•</span>
              <span>Proudly Made in India</span>
            </div>
            <p style="font-size: 9px; color: #d1d5db; margin: 8px 0 0 0;">
              © 2026 Bharat Aero Autonomous Systems. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `
  };

  // 1. Try local Vite dev proxy first (handles CORS bypass automatically)
  try {
    const response = await fetch('/api-resend/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) return true;
    
    // If not 2xx, log error
    const errText = await response.text();
    console.warn("Dev proxy returned error status, checking fallback...", errText);
  } catch (e) {
    console.warn("Dev proxy connection failed, trying direct API call...", e);
  }

  // 2. Direct API call fallback
  const directResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!directResponse.ok) {
    const errorData = await directResponse.json();
    throw new Error(errorData.message || `Resend Error Status: ${directResponse.status}`);
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
  const [registeredUser, setRegisteredUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bharataero_registered_user');
      return saved ? JSON.parse(saved) : { name: '', email: '', password: '', phone: '', id: '' };
    } catch (e) {
      console.warn("Failed to load registeredUser from localStorage:", e);
      return { name: '', email: '', password: '', phone: '', id: '' };
    }
  });
  const [selectedPilot, setSelectedPilot] = useState(null);

  // Shared Data States
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('bharataero_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to load bookings from localStorage:", e);
      return [];
    }
  });

  const [availability, setAvailability] = useState([
    { day: 'Monday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Tuesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Wednesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Thursday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Friday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Saturday', status: 'On Call', hours: '10:00 AM - 04:00 PM', checked: false },
    { day: 'Sunday', status: 'Unavailable', hours: 'Rest Day', checked: false }
  ]);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('bharataero_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to load notifications from localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bharataero_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.warn("Failed to save bookings to localStorage:", e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('bharataero_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn("Failed to save notifications to localStorage:", e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('bharataero_registered_user', JSON.stringify(registeredUser));
    } catch (e) {
      console.warn("Failed to save registeredUser to localStorage:", e);
    }
  }, [registeredUser]);

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
  const acceptBooking = (bookingId, pilotName, pilotPhone) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { 
        ...b, 
        status: 'Confirmed', 
        pilotName, 
        pilotPhone,
        pilotImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEar_up8KhgESF_MeXQRJ0PqL3eqb64LpZpvQFx7OmZhkkKKd3x0d4lPv6S2lPVb_hyLCWGb0jlqOGNsy4BosH7adSDS9EaDCtGXEDDeDijf4953yN7FUkdDIeJIpmE4kArH9Q-WxEALZ8XzQWvSBph7_HKHRyot2VpNGidEV8-sXwwj059lp-Zg_mRt-fuA3KFSDFoebuwC96dF9AZgyuki-JClbEjCcBHEDrznPBkpyNVVTDi4o_VwPGj0dgvVx7_VlfNV8N6U4' 
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
    const checkGoogleRedirect = async () => {
      const hash = window.location.hash;
      const isCallbackPath = window.location.pathname === '/auth/callback';
      const hasAccessToken = hash && hash.includes('access_token');

      if (isCallbackPath || hasAccessToken) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          // Clean up the URL: reset path to / and strip out hash details
          window.history.replaceState({}, document.title, '/');
          
          try {
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

              // Switch to the role-specific dashboard based on current role selection state (or default to client)
              setUserRole(prev => {
                const role = prev || 'client';
                setCurrentScreen(role === 'pilot' ? 'pilot_dashboard' : 'client_dashboard');
                return role;
              });
            } else {
              console.error('Failed to fetch userinfo from Google redirected callback');
            }
          } catch (err) {
            console.error('Error fetching Google userinfo on redirected callback:', err);
          }
        }
      }
    };

    checkGoogleRedirect();
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
        selectedPilot,
        setSelectedPilot,
        sendResendEmail,
        transitionTimerRef
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
