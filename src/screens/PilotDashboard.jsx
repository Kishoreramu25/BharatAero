import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Bell, Trophy, Check, X, ShieldAlert, Timer, Banknote, AlertTriangle, Shield, FileText } from 'lucide-react';

export default function PilotDashboard() {
  const { 
    bookings, setBookings, 
    getCompletedEarnings, navigate, activeTab, registeredUser 
  } = useApp();
  
  const [onlineStatus, setOnlineStatus] = useState('ONLINE'); // 'ONLINE' or 'OFFLINE'

  // Filter pending bookings (these act as incoming requests for the pilot)
  const pendingRequests = bookings.filter(b => b.status === 'Pending');

  const handleAccept = (id) => {
    const pilotName = registeredUser?.name || 'Alex Mercer';
    const pilotImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEar_up8KhgESF_MeXQRJ0PqL3eqb64LpZpvQFx7OmZhkkKKd3x0d4lPv6S2lPVb_hyLCWGb0jlqOGNsy4BosH7adSDS9EaDCtGXEDDeDijf4953yN7FUkdDIeJIpmE4kArH9Q-WxEALZ8XzQWvSBph7_HKHRyot2VpNGidEV8-sXwwj059lp-Zg_mRt-fuA3KFSDFoebuwC96dF9AZgyuki-JClbEjCcBHEDrznPBkpyNVVTDi4o_VwPGj0dgvVx7_VlfNV8N6U4';
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: 'Confirmed', pilotName, pilotImage } : b)
    );
  };

  const handleDecline = (id) => {
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: 'Declined' } : b)
    );
  };

  const earnings = getCompletedEarnings();

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[60px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex justify-between items-center px-5 h-[72px] border-b border-[#b7c6c2]/15 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none overflow-hidden border border-[#b7c6c2]/30">
            <img 
              alt="Pilot Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEar_up8KhgESF_MeXQRJ0PqL3eqb64LpZpvQFx7OmZhkkKKd3x0d4lPv6S2lPVb_hyLCWGb0jlqOGNsy4BosH7adSDS9EaDCtGXEDDeDijf4953yN7FUkdDIeJIpmE4kArH9Q-WxEALZ8XzQWvSBph7_HKHRyot2VpNGidEV8-sXwwj059lp-Zg_mRt-fuA3KFSDFoebuwC96dF9AZgyuki-JClbEjCcBHEDrznPBkpyNVVTDi4o_VwPGj0dgvVx7_VlfNV8N6U4"
            />
          </div>
          <span className="text-base font-headline font-black text-[#000201] tracking-tight">MISD Pilot Ops</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Toggle Slider */}
          <div 
            onClick={() => setOnlineStatus(onlineStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
            className="flex items-center bg-neutral-200 rounded-none p-1 cursor-pointer w-24 relative h-7"
          >
            <div 
              className={`absolute top-0.5 bottom-0.5 w-11 bg-[#ca0013] rounded-none transition-transform duration-300 ${
                onlineStatus === 'ONLINE' ? 'translate-x-0.5' : 'translate-x-[44px]'
              }`}
            ></div>
            <span className={`relative z-10 w-1/2 text-[9px] font-bold text-center ${
              onlineStatus === 'ONLINE' ? 'text-white' : 'text-neutral-500'
            }`}>ON</span>
            <span className={`relative z-10 w-1/2 text-[9px] font-bold text-center ${
              onlineStatus === 'OFFLINE' ? 'text-white' : 'text-neutral-500'
            }`}>OFF</span>
          </div>

          <button 
            onClick={() => navigate('notifications')}
            className="w-8 h-8 flex items-center justify-center rounded-none hover:bg-neutral-100"
          >
            <Bell size={16} className="text-[#000201]" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-5 pt-4 space-y-6 overflow-y-auto no-scrollbar">
        
        {/* Bento Grid Metrics */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Weekly Earnings Card */}
          <div 
            onClick={() => navigate('earnings', 'earnings')}
            className="bg-white rounded-none border border-[#b7c6c2]/60 p-5 flex flex-col justify-between shadow-[0_12px_24px_rgba(23,30,25,0.04)] min-h-[160px] relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/30 rounded-none -mr-12 -mt-12"></div>
            <div>
              <span className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider">Operational Balance</span>
              <h2 className="text-3xl font-headline font-black text-[#000201] mt-1">₹{earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            </div>
            
            <div className="flex items-center justify-between border-t border-[#b7c6c2]/10 mt-3 pt-3">
              <span className="text-[#ca0013] font-bold text-xs">+12.5% vs last week</span>
              <span className="text-[9px] font-bold text-[#747874] uppercase tracking-widest">TAP FOR OVERVIEW</span>
            </div>
          </div>

          {/* Pilot Score Card */}
          <div className="bg-[#171e19] text-white rounded-none p-4 flex justify-between items-center shadow-sm">
            <div className="space-y-1">
              <span className="text-[9px] font-headline font-bold text-neutral-400 uppercase tracking-widest">Pilot Quality Rating</span>
              <h3 className="text-2xl font-headline font-black text-[#44f3a9]">94 / 100</h3>
              <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Top 5% of regional operators</p>
            </div>
            <div className="w-12 h-12 rounded-none border border-neutral-700/50 flex items-center justify-center text-primary bg-neutral-900/40">
              <Trophy size={18} />
            </div>
          </div>
        </div>

        {/* Pending Flight Requests Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xs font-headline font-bold uppercase tracking-wider text-[#000201]">Mission Requests</h2>
              <p className="text-xs text-[#747874]">Broadcasted orders waiting for approval</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5" id="request-grid">
            {pendingRequests.map((req) => (
              <div 
                key={req.id}
                className="bg-white rounded-none border border-[#b7c6c2]/60 p-5 shadow-sm flex flex-col gap-4"
              >
                {/* Header: Title and Category badge */}
                <div className="flex justify-between items-start pb-3 border-b border-neutral-100">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 bg-neutral-100 rounded-none text-[9px] font-bold text-[#ca0013] uppercase tracking-wider">
                      {req.type}
                    </span>
                    <h4 className="font-headline font-black text-sm text-[#000201] leading-tight">
                      {req.title || req.type}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-neutral-400 shrink-0">{req.id}</span>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px] text-[#444844]">
                  <div>
                    <span className="block text-[8px] font-headline font-bold text-[#747874] uppercase tracking-wider">Flight Schedule</span>
                    <p className="font-bold text-[#000201] mt-0.5">{req.date} ({req.timeSlot})</p>
                  </div>
                  <div>
                    <span className="block text-[8px] font-headline font-bold text-[#747874] uppercase tracking-wider">Estimated Payout</span>
                    <p className="font-black text-[#ca0013] mt-0.5">₹{req.price}</p>
                  </div>
                  <div>
                    <span className="block text-[8px] font-headline font-bold text-[#747874] uppercase tracking-wider">Location Zone</span>
                    <p className="font-bold text-[#000201] mt-0.5 truncate">{req.location}</p>
                  </div>
                  <div>
                    <span className="block text-[8px] font-headline font-bold text-[#747874] uppercase tracking-wider">Est. Duration</span>
                    <p className="font-bold text-[#000201] mt-0.5">{req.duration ? `${req.duration} Hours` : '3 Hours'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[8px] font-headline font-bold text-[#747874] uppercase tracking-wider">Required Drone & Payload</span>
                    <p className="font-bold text-[#000201] mt-0.5">{req.droneModel || 'DJI Mavic 3 Enterprise'}</p>
                  </div>
                  {req.certifications && (
                    <div className="col-span-2">
                      <span className="block text-[8px] font-headline font-bold text-[#747874] uppercase tracking-wider">Required Licenses</span>
                      <p className="font-bold text-[#000201] mt-0.5">{req.certifications}</p>
                    </div>
                  )}
                  {req.hazards && req.hazards !== 'None' && (
                    <div className="col-span-2">
                      <span className="block text-[8px] font-headline font-bold text-amber-600 uppercase tracking-wider">Reported Site Hazards</span>
                      <p className="font-bold text-amber-700 mt-0.5">{req.hazards}</p>
                    </div>
                  )}
                </div>

                {/* Scope of Work */}
                {req.description && (
                  <div className="bg-neutral-50 border border-neutral-100 p-3 text-[11px] text-[#444844] space-y-1 rounded-none">
                    <span className="block text-[8px] font-headline font-bold text-[#747874] uppercase tracking-wider">Scope of Work</span>
                    <p className="leading-relaxed font-body whitespace-pre-wrap">{req.description}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-neutral-100">
                  <button 
                    onClick={() => handleAccept(req.id)}
                    className="h-10 bg-[#ca0013] text-white rounded-none font-headline font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 hover:opacity-95 cursor-pointer shadow-sm active:scale-[0.99] border-0"
                  >
                    <Check size={12} />
                    <span>ACCEPT MISSION</span>
                  </button>
                  <button 
                    onClick={() => handleDecline(req.id)}
                    className="h-10 border border-[#b7c6c2]/35 text-[#000201] rounded-none font-headline font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-neutral-50 cursor-pointer active:scale-[0.99]"
                  >
                    <X size={12} />
                    <span>DECLINE</span>
                  </button>
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="py-12 border border-dashed border-[#b7c6c2]/30 rounded-none flex flex-col items-center justify-center text-[#747874] opacity-80 text-center">
                <span className="material-symbols-outlined text-3xl mb-2 text-neutral-400">done_all</span>
                <p className="text-xs font-bold font-headline uppercase tracking-wider text-[#000201]">All caught up!</p>
                <p className="text-[10px] mt-0.5">Ready to receive new UAV flight broadcasts.</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Pilot Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}