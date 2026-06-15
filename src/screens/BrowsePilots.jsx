import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Star, Bell, Compass } from 'lucide-react';

export default function BrowsePilots() {
  const { pilotsList, navigate, activeTab, setSelectedPilot } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPilots = pilotsList.filter(pilot => 
    pilot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pilot.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pilot.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[60px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex justify-between items-center px-5 h-[72px] border-b border-[#b7c6c2]/15 z-40">
        <div className="flex items-center gap-3">
          <span className="text-xl font-headline font-black text-[#000201] tracking-tight">Explore Pilots</span>
        </div>
        <button 
          onClick={() => navigate('notifications')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <Bell size={18} className="text-[#000201]" />
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-grow px-5 pt-4 space-y-4 overflow-y-auto no-scrollbar">
        
        {/* Search Bar */}
        <div className="relative flex items-center rounded-full border border-[#b7c6c2]/35 bg-white shadow-sm overflow-hidden px-4 focus-within:border-[#ca0013] transition-all">
          <Search size={16} className="text-[#747874] mr-2" />
          <input 
            type="text" 
            placeholder="Search pilots, specialties, badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-3 text-xs outline-none placeholder:text-neutral-400 font-body text-[#1b1c1b]"
          />
        </div>

        {/* Count */}
        <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider pl-1">
          Showing {filteredPilots.length} Certified Operators Near You
        </p>

        {/* Pilots List */}
        <div className="flex flex-col gap-4">
          {filteredPilots.map((pilot) => (
            <div 
              key={pilot.id}
              onClick={() => {
                setSelectedPilot(pilot);
                navigate('pilot_profile');
              }}
              className="bg-white rounded-2xl border border-[#b7c6c2]/25 overflow-hidden shadow-[0_12px_24px_rgba(23,30,25,0.03)] cursor-pointer hover:border-neutral-300 transition-all flex flex-col"
            >
              {/* Card Banner Image */}
              <div className="h-32 w-full relative bg-neutral-200">
                <img 
                  src={pilot.bannerImage} 
                  alt={`${pilot.name} banner`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-[#ca0013] text-white font-headline font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  ${pilot.price} / Mission
                </div>
              </div>

              {/* Card Contents */}
              <div className="p-4 flex gap-4 relative">
                {/* Profile Pic Floating */}
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white bg-neutral-100 shadow-md -mt-10 relative z-10 flex-shrink-0">
                  <img src={pilot.image} alt={pilot.name} className="w-full h-full object-cover" />
                </div>

                {/* Pilot text details */}
                <div className="flex-1 min-w-0 -mt-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline font-bold text-sm text-[#000201] truncate">{pilot.name}</h3>
                      <p className="text-[10px] font-body text-[#747874] font-medium mt-0.5">{pilot.role}</p>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-0.5 bg-yellow-50 border border-yellow-200/50 rounded px-1.5 py-0.5 text-yellow-700">
                      <Star size={10} fill="#d97706" className="stroke-[#d97706]" />
                      <span className="text-[9px] font-bold">{pilot.rating}</span>
                    </div>
                  </div>

                  {/* Specialty */}
                  <p className="text-xs text-[#444844] mt-2 font-body line-clamp-1">{pilot.specialty}</p>

                  {/* Location info */}
                  <div className="flex items-center gap-1 text-[9px] text-[#747874] uppercase font-bold mt-2.5">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    <span>{pilot.location}</span>
                  </div>

                  {/* Badge tags */}
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {pilot.badges.map((badge, idx) => (
                      <span key={idx} className="bg-neutral-100 text-[#444844] font-headline text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredPilots.length === 0 && (
            <div className="text-center py-12 text-[#747874] text-xs font-body">
              No matching UAV operators found.
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}