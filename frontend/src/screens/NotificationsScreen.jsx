import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Bell, BellRing, CheckCircle, AlertTriangle, BadgeDollarSign, Mail } from 'lucide-react';

export default function NotificationsScreen() {
  const { notifications, setNotifications, navigate, userRole } = useApp();

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

  const getIcon = (title) => {
    if (title.includes('Flight') || title.includes('Booking')) {
      return <BellRing size={18} className="text-[#ca0013]" />;
    } else if (title.includes('Payout') || title.includes('Earnings')) {
      return <BadgeDollarSign size={18} className="text-emerald-600" />;
    } else if (title.includes('Message')) {
      return <Mail size={18} className="text-blue-500" />;
    }
    return <AlertTriangle size={18} className="text-amber-500" />;
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
              className="text-xs font-headline font-bold text-[#ca0013] hover:underline"
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
              className={`bg-white rounded-none border p-4 shadow-sm flex gap-3.5 ${
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
                <p className="text-[11px] text-[#444844] mt-1 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-16 text-[#747874] text-xs font-body">
              No recent notifications found.
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
