import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Star, MapPin, Shield, CheckCircle, Mail } from 'lucide-react';

export default function PilotProfile() {
  const { navigate, pilotsList, selectedPilot } = useApp();
  
  // Use selectedPilot, fallback to first pilot
  const pilot = selectedPilot || pilotsList[0];

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[72px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex items-center px-4 h-[64px] border-b border-[#b7c6c2]/15 z-40">
        <button 
          onClick={() => navigate('browse_pilots')}
          className="w-10 h-10 flex items-center justify-center rounded-none bg-white border border-[#b7c6c2]/25 shadow-sm text-primary"
        >
          <ArrowLeft size={18} className="text-[#000201]" />
        </button>
        <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">Operator Profile</span>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto no-scrollbar pb-6">
        
        {/* Banner Image */}
        <div className="h-44 w-full relative bg-neutral-200">
          <img 
            src={pilot.bannerImage} 
            alt="Pilot operations banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Profile Card Summary Float */}
        <div className="px-5 -mt-12 relative z-10">
          <div className="bg-white rounded-none border border-[#b7c6c2]/25 p-5 shadow-[0_15px_30px_rgba(23,30,25,0.05)]">
            <div className="flex gap-4">
              <img 
                src={pilot.image} 
                alt={pilot.name} 
                className="w-16 h-16 rounded-none object-cover border-2 border-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-headline font-black text-[#000201] truncate">{pilot.name}</h2>
                <p className="text-xs font-body text-[#747874] mt-0.5">{pilot.role}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Star size={12} fill="#d97706" className="stroke-[#d97706]" />
                  <span className="text-xs font-bold text-[#000201]">{pilot.rating}</span>
                  <span className="text-xs text-[#747874]">({pilot.reviews} flights)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#b7c6c2]/15 mt-4 pt-4 text-center">
              <div>
                <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider">Mission Cost</p>
                <p className="text-base font-headline font-black text-[#ca0013] mt-0.5">${pilot.price}</p>
              </div>
              <div className="border-l border-[#b7c6c2]/15">
                <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider">Deploy Base</p>
                <p className="text-[11px] font-bold text-[#000201] mt-1.5 truncate flex items-center justify-center gap-0.5">
                  <MapPin size={10} className="text-[#ca0013]" /> {pilot.location.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detail specs panels */}
        <div className="px-5 mt-6 space-y-5">
          {/* About Specialization */}
          <div className="space-y-2">
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-[#000201]">Core Capabilities</h3>
            <div className="bg-white rounded-none border border-[#b7c6c2]/20 p-4 space-y-3 shadow-sm">
              <div>
                <p className="text-[10px] font-headline font-bold text-[#747874] uppercase">Specialty Focus</p>
                <p className="text-xs font-body text-[#444844] mt-1">{pilot.specialty}</p>
              </div>
              <div className="border-t border-[#b7c6c2]/10 pt-3">
                <p className="text-[10px] font-headline font-bold text-[#747874] uppercase">UAV Platform</p>
                <p className="text-xs font-body text-[#444844] mt-1">{pilot.drone}</p>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-[#000201]">Clearance & Credentials</h3>
            <div className="bg-white rounded-none border border-[#b7c6c2]/20 p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-emerald-50 text-emerald-600">
                  <Shield size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-headline font-bold text-[#000201]">FAA Part 107 Licensed</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Verified Active Clearance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-[#b7c6c2]/10 pt-3">
                <div className="p-2 rounded-none bg-red-50 text-[#ca0013]">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-headline font-bold text-[#000201]">Thermal & Multispectral Certified</h4>
                  <p className="text-[10px] text-[#ca0013] font-bold uppercase tracking-wider mt-0.5">DGCA Swarm Standard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating CTA Footer Actions */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#b7c6c2]/25 py-3 px-4 flex shadow-lg z-30 select-none items-center justify-between h-[72px]">
        <button 
          onClick={() => navigate('book_pilot', 'book')}
          className="w-full bg-[#ca0013] text-white py-3.5 px-6 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center"
        >
          Book Flight Mission
        </button>
      </footer>
    </div>
  );
}
