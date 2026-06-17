import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, Play, Map, Timer, ShieldCheck, 
  Compass, Plus, ClipboardList, User, ArrowRight
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ClientDashboard() {
  const { setCurrentScreen, activeTab, navigate, bookings, pilotsList, setSelectedPilot, registeredUser, setAutoOpenProfileModal, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Agriculture', 'Surveillance', 'Cinema', 'Logistics'];
  
  // Calculate active bookings count dynamically without demo offset
  const activeMissionsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const flightHours = completedCount > 0 ? (completedCount * 3).toLocaleString() : '0';
  const fleetStatus = bookings.length > 0 ? "Optimal" : "Standby";

  const handleLaunch = () => {
    navigate('browse_pilots', 'explore');
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[60px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex justify-between items-center px-5 h-[72px] border-b border-[#b7c6c2]/15 z-40">
        <div 
          onClick={() => {
            setAutoOpenProfileModal(true);
            navigate('settings', 'settings');
          }}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85"
          title="Click to edit profile bio, photo and links"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ca0013] shrink-0">
            <img 
              alt="Commander Profile" 
              className="w-full h-full object-cover" 
              src={registeredUser?.profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuDGrwU0dTkzQisGLCQ3Z3mps07VaFQJKjagxF4FcDioG-eju5wXCHSsa_pGmDiFpofHEfWoN-nQk-ICp7MsX9ZoQ3_o2RFgBa9Cho1JEefTaxQcMOCyn9Vk2fY0jj5-iUlld6EMuBuT8R2Uc-7cTMaMd5kjV8YbWblNVAmBrx-APuvW1_rOm9AbAB4a-n1nAcDTmXh7nTuroxKoZpqFJoaCI72CuCKhMPo1a0wBO4I1r0apSp4EPzn-40NI1kgkEESaJOT4fufcyJk"}
            />
          </div>
          <span className="text-xl font-headline font-black text-[#000201] tracking-tight">{registeredUser?.name || 'MISD Automation'}</span>
        </div>
        <button 
          onClick={() => navigate('notifications')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors relative"
        >
          <Bell size={18} className="text-[#000201]" />
          {bookings.length > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ca0013]"></span>
          )}
        </button>
      </header>
 
       {/* Main Content Dashboard */}
       <main className="flex-1 px-5 pt-4 space-y-6 overflow-y-auto no-scrollbar">
         {/* Greetings */}
         <section 
           onClick={() => {
             setAutoOpenProfileModal(true);
             navigate('settings', 'settings');
           }}
           className="animate-fade-in cursor-pointer hover:opacity-85"
           title="Click to edit profile"
         >
           <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-[#ca0013] mb-1">{t('Client Dashboard')}</p>
           <h1 className="text-2xl font-headline font-black text-[#000201]">{t('Welcome back')}, <span className="underline decoration-dotted decoration-[#ca0013]">{registeredUser?.name || 'Commander'}</span></h1>
         </section>

        {/* Category Pills Selector */}
        <section className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-headline font-bold text-xs tracking-wider transition-all ${
                selectedCategory === cat 
                ? 'bg-[#000201] text-white' 
                : 'bg-white border border-[#b7c6c2]/25 text-[#444844] hover:bg-neutral-50'
              }`}
            >
              {cat === 'All' ? 'All Operations' : cat}
            </button>
          ))}
        </section>

        {/* Bento Dashboard Grid */}
        <section className="grid grid-cols-1 gap-4">
          
          {/* Active Missions Card */}
          <div className="bg-white rounded-2xl border border-[#b7c6c2]/25 p-5 flex flex-col justify-between shadow-[0_12px_24px_rgba(23,30,25,0.04)] min-h-[220px] relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-[#ca0013] rounded-full text-[9px] font-bold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 bg-[#ca0013] rounded-full animate-pulse"></span>
                Live Operations
              </span>
              <h2 className="text-5xl font-headline font-black text-[#000201] leading-none mb-1">{activeMissionsCount}</h2>
              <p className="text-xs font-bold text-[#444844]">Active Missions & Surveillance</p>
            </div>
            
            <div className="mt-4 relative z-10 flex gap-2">
              <button 
                onClick={handleLaunch}
                className="flex-1 bg-[#ca0013] text-white py-3 px-4 rounded-xl font-headline font-bold text-xs hover:opacity-95 active:scale-95 transition-all text-center uppercase tracking-wider shadow-sm"
              >
                Launch Mission
              </button>
              <button 
                onClick={() => navigate('about')}
                className="bg-white border border-[#b7c6c2]/25 text-[#000201] py-3 px-4 rounded-xl font-headline font-bold text-xs hover:bg-neutral-50 transition-all uppercase tracking-wider"
              >
                View Status
              </button>
            </div>
            
            <span className="material-symbols-outlined text-[120px] text-neutral-100 absolute -right-6 -bottom-6 opacity-30 select-none">rocket_launch</span>
          </div>

          {/* Metric Columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Flight Hours Card */}
            <div className="bg-white rounded-2xl border border-[#b7c6c2]/25 p-4 flex flex-col justify-between min-h-[120px] shadow-[0_12px_24px_rgba(23,30,25,0.03)]">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-red-50 text-[#ca0013]">
                  <Timer size={18} />
                </div>
                {completedCount > 0 && (
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">+12%</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-headline font-black text-[#000201]">{flightHours}</h3>
                <p className="text-[10px] font-headline font-bold text-[#444844] uppercase tracking-wider">Flight Hours</p>
              </div>
            </div>

            {/* Fleet Status Card */}
            <div className="bg-[#171e19] rounded-2xl p-4 flex flex-col justify-between min-h-[120px] text-white shadow-[0_12px_24px_rgba(23,30,25,0.06)]">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-neutral-800 text-primary">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Secure</span>
              </div>
              <div>
                <h3 className="text-lg font-headline font-black text-white">{fleetStatus}</h3>
                <p className="text-[10px] font-headline font-bold text-neutral-400 uppercase tracking-wider">Fleet Quality</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Pilots Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">Nearby Pilots</h2>
              <p className="text-xs text-[#747874]">Available for collaborative swarm missions</p>
            </div>
            <button 
              onClick={() => navigate('browse_pilots', 'explore')}
              className="text-[#ca0013] font-headline font-bold text-xs flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {pilotsList.slice(0, 2).map((pilot) => (
              <div 
                key={pilot.id}
                className="bg-white rounded-xl border border-[#b7c6c2]/25 p-3.5 flex items-center gap-3 shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer" 
                onClick={() => {
                  setSelectedPilot(pilot);
                  navigate('pilot_profile');
                }}
              >
                <img 
                  alt={pilot.name} 
                  className="w-12 h-12 rounded-lg object-cover" 
                  src={pilot.image}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline font-bold text-sm text-[#000201] truncate">{pilot.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-[#444844] uppercase">{pilot.role}</span>
                    <span className="text-[9px] font-bold text-[#ca0013] uppercase flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">location_on</span> {pilot.location.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
