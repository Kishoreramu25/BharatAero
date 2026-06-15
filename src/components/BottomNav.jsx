import React from 'react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { navigate, activeTab, userRole } = useApp();

  if (userRole === 'pilot') {
    return (
      <nav className="absolute bottom-0 left-0 right-0 h-[60px] bg-[#000201] flex justify-around items-center z-30 select-none border-t border-[#b7c6c2]/10">
        <button 
          onClick={() => navigate('pilot_dashboard', 'home')}
          className={`flex-1 h-full flex items-center justify-center transition-colors ${
            activeTab === 'home' 
            ? 'bg-[#ca0013] text-white' 
            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
        </button>
        
        <button 
          onClick={() => navigate('earnings', 'earnings')}
          className={`flex-1 h-full flex items-center justify-center transition-colors ${
            activeTab === 'earnings' 
            ? 'bg-[#ca0013] text-white' 
            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">payments</span>
        </button>

        <button 
          onClick={() => navigate('availability', 'availability')}
          className={`flex-1 h-full flex items-center justify-center transition-colors ${
            activeTab === 'availability' 
            ? 'bg-[#ca0013] text-white' 
            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
        </button>

        <button 
          onClick={() => navigate('settings', 'settings')}
          className={`flex-1 h-full flex items-center justify-center transition-colors ${
            activeTab === 'settings' 
            ? 'bg-[#ca0013] text-white' 
            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </nav>
    );
  }

  // Default: Client Bottom Nav
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[60px] bg-[#000201] flex justify-around items-center z-30 select-none border-t border-[#b7c6c2]/10">
      <button 
        onClick={() => navigate('client_dashboard', 'home')}
        className={`flex-1 h-full flex items-center justify-center transition-colors ${
          activeTab === 'home' 
          ? 'bg-[#ca0013] text-white' 
          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">home</span>
      </button>
      <button 
        onClick={() => navigate('browse_pilots', 'explore')}
        className={`flex-1 h-full flex items-center justify-center transition-colors ${
          activeTab === 'explore' 
          ? 'bg-[#ca0013] text-white' 
          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">explore</span>
      </button>
      <button 
        onClick={() => navigate('book_pilot', 'book')}
        className={`flex-1 h-full flex items-center justify-center transition-colors ${
          activeTab === 'book' 
          ? 'bg-[#ca0013] text-white' 
          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
      </button>
      <button 
        onClick={() => navigate('my_bookings', 'bookings')}
        className={`flex-1 h-full flex items-center justify-center transition-colors ${
          activeTab === 'bookings' 
          ? 'bg-[#ca0013] text-white' 
          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">assignment</span>
      </button>
      <button 
        onClick={() => navigate('settings', 'settings')}
        className={`flex-1 h-full flex items-center justify-center transition-colors ${
          activeTab === 'settings' 
          ? 'bg-[#ca0013] text-white' 
          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
      </button>
    </nav>
  );
}
