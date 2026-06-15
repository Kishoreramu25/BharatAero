import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Navigation & Auth State
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userRole, setUserRole] = useState(null); // 'client' or 'pilot'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'explore', 'bookings', 'settings' etc.
  const [theme, setTheme] = useState('light');
  const [registeredUser, setRegisteredUser] = useState({ name: '', email: '', password: '' });
  const [selectedPilot, setSelectedPilot] = useState(null);

  // Shared Data States
  const [bookings, setBookings] = useState([]);

  const [availability, setAvailability] = useState([
    { day: 'Monday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Tuesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Wednesday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Thursday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Friday', status: 'Active', hours: '08:00 AM - 06:00 PM', checked: true },
    { day: 'Saturday', status: 'On Call', hours: '10:00 AM - 04:00 PM', checked: false },
    { day: 'Sunday', status: 'Unavailable', hours: 'Rest Day', checked: false }
  ]);

  const [notifications, setNotifications] = useState([]);

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

  // Auto login bypass on #register hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#register') {
        setIsLoggedIn(true);
        setUserRole(prev => {
          const role = prev || 'client'; // Default to client if no role selected
          setCurrentScreen(role === 'pilot' ? 'pilot_dashboard' : 'client_dashboard');
          return role;
        });
      }
    };

    // Run on initial load
    handleHashChange();

    // Listen to hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate utility
  const navigate = (screen, tab = 'home') => {
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
        setSelectedPilot
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
