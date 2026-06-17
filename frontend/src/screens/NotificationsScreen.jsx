import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Bell, BellRing, CheckCircle, AlertTriangle, BadgeDollarSign, Mail, X } from 'lucide-react';

export default function NotificationsScreen() {
  const { notifications, setNotifications, navigate, userRole } = useApp();
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleBack = () => {
    if (userRole === 'pilot') {
      navigate('pilot_dashboard', 'home');
    } else {
      navigate('client_dashboard', 'home');
    }
  };

  const handleNotificationOpen = (n) => {
    // 1. Mark as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    // 2. Open detail modal
    setSelectedNotification(n);
  };

  const handleNavigateFromNotification = (n) => {
    setSelectedNotification(null);
    const title = n.title.toLowerCase();
    
    if (title.includes('review') || title.includes('payout') || title.includes('earnings')) {
      if (userRole === 'pilot') {
        navigate('earnings', 'earnings');
      } else {
        navigate('client_dashboard', 'home');
      }
    } else if (title.includes('booking') || title.includes('mission') || title.includes('request') || title.includes('accept')) {
      if (userRole === 'pilot') {
        navigate('pilot_dashboard', 'home');
      } else {
        navigate('my_bookings', 'bookings');
      }
    } else {
      // Default fallback
      if (userRole === 'pilot') {
        navigate('pilot_dashboard', 'home');
      } else {
        navigate('client_dashboard', 'home');
      }
    }
  };

  const handleSeedNotifications = () => {
    const seedData = [
      {
        id: 1,
        title: 'New Flight Booking Requested',
        desc: 'A client has requested a crop spraying mission for agricultural fields near Punjab region. Scheduled for tomorrow morning.',
        time: '2 mins ago',
        read: false
      },
      {
        id: 2,
        title: 'Payout Disbursed Successfully',
        desc: 'Your flight payout of ₹12,500 for the industrial wind turbine inspection has been processed and transferred to your bank account.',
        time: '1 hour ago',
        read: false
      },
      {
        id: 3,
        title: 'New Review Received',
        desc: 'Client Sarah Jenkins gave you a 5-star rating: "Fantastic flight operation, very precise mapping data. Highly recommended!"',
        time: 'Yesterday',
        read: true
      }
    ];
    setNotifications(seedData);
  };

  const getIcon = (title) => {
    if (title.includes('Flight') || title.includes('Booking') || title.includes('Mission') || title.includes('Request')) {
      return <BellRing size={18} className="text-[#ca0013]" />;
    } else if (title.includes('Payout') || title.includes('Earnings')) {
      return <BadgeDollarSign size={18} className="text-emerald-600" />;
    } else if (title.includes('Message') || title.includes('Review')) {
      return <Mail size={18} className="text-blue-500" />;
    }
    return <AlertTriangle size={18} className="text-amber-500" />;
  };

  const getActionLabel = (title) => {
    const tLower = title.toLowerCase();
    if (tLower.includes('payout') || tLower.includes('earnings')) {
      return 'View Earnings';
    } else if (tLower.includes('booking') || tLower.includes('mission') || tLower.includes('request') || tLower.includes('accept')) {
      return 'Go to Bookings';
    }
    return 'Go to Dashboard';
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-6 relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex items-center px-4 h-[64px] border-b border-[#b7c6c2]/15 z-40">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-neutral-100"
        >
          <ArrowLeft size={18} className="text-[#000201]" />
        </button>
        <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">System Alerts</span>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-5 pt-4 space-y-4 overflow-y-auto no-scrollbar pb-6">
        
        {/* Header Summary */}
        <div className="flex items-end justify-between pl-1">
          <div>
            <span className="text-[9px] font-headline font-bold text-[#747874] uppercase tracking-wider">Live Feed</span>
            <h2 className="text-lg font-headline font-black text-[#000201]">Recent Notifications</h2>
          </div>
          {notifications.some(n => !n.read) && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs font-headline font-bold text-[#ca0013] hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => handleNotificationOpen(n)}
              className={`bg-white rounded-none border p-4 shadow-sm flex gap-3.5 cursor-pointer hover:bg-neutral-50/50 transition-colors ${
                n.read 
                ? 'border-[#b7c6c2]/60 opacity-75' 
                : 'border-[#ca0013]/60 ring-1 ring-[#ca0013]/5'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-none flex items-center justify-center ${
                  n.read ? 'bg-neutral-100 text-neutral-400' : 'bg-red-50 text-[#ca0013]'
                }`}>
                  {getIcon(n.title)}
                </div>
                {!n.read && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ca0013] rounded-none border-2 border-white"></span>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xs font-headline font-black text-[#000201] truncate">{n.title}</h3>
                  <span className="text-[8px] font-bold text-neutral-400 uppercase flex-shrink-0 mt-0.5">{n.time}</span>
                </div>
                <p className="text-[11px] text-[#444844] mt-1 leading-relaxed line-clamp-2">{n.desc}</p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <p className="text-[#747874] text-xs font-body">No recent notifications found.</p>
              <button
                type="button"
                onClick={handleSeedNotifications}
                className="px-4 py-2 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] uppercase tracking-wider rounded-none cursor-pointer transition-colors"
              >
                🛠️ Seed Dev Notifications
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Notification Detail Overlay Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#121316] w-full max-w-[480px] flex flex-col justify-between rounded-t-3xl shadow-2xl border-t border-neutral-200 dark:border-neutral-800 animate-slide-up relative">
            
            {/* Header */}
            <header className="flex justify-between items-center px-5 py-4 border-b border-[#b7c6c2]/20 dark:border-neutral-800">
              <span className="text-sm font-headline font-black text-[#000201] dark:text-white uppercase tracking-wider">
                Alert Notification Details
              </span>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
              >
                <X size={16} />
              </button>
            </header>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] no-scrollbar">
              
              {/* Large Colored Icon and Title */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-neutral-900 flex items-center justify-center text-[#ca0013]">
                  {getIcon(selectedNotification.title)}
                </div>
                <div>
                  <h3 className="text-base font-headline font-black text-[#000201] dark:text-white">
                    {selectedNotification.title}
                  </h3>
                  <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mt-1">
                    Received: {selectedNotification.time}
                  </span>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#747874] dark:text-neutral-400 uppercase tracking-wider pl-1">
                  Message Description
                </h4>
                <p className="text-xs text-[#444844] dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-900 p-4 border border-[#b7c6c2]/20 dark:border-neutral-800">
                  {selectedNotification.desc}
                </p>
              </div>

            </div>

            {/* Footer buttons */}
            <footer className="p-5 border-t border-[#b7c6c2]/20 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex gap-3">
              <button 
                onClick={() => handleNavigateFromNotification(selectedNotification)}
                className="flex-grow bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:opacity-90 transition-opacity"
              >
                {getActionLabel(selectedNotification.title)}
              </button>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="px-6 bg-white dark:bg-neutral-900 border border-[#b7c6c2]/35 dark:border-neutral-800 text-[#000201] dark:text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Dismiss
              </button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
}
