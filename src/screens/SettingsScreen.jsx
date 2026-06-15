import React from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, ShieldAlert, User, Lock, Key, Bell, 
  Globe, Sun, Moon, Shield, FileText, LifeBuoy, LogOut 
} from 'lucide-react';

export default function SettingsScreen() {
  const { 
    theme, setTheme, userRole, 
    setIsLoggedIn, navigate, activeTab, registeredUser 
  } = useApp();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('role_selection');
  };

  const handleBack = () => {
    if (userRole === 'pilot') {
      navigate('pilot_dashboard', 'home');
    } else {
      navigate('client_dashboard', 'home');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[60px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex items-center px-4 h-[64px] border-b border-[#b7c6c2]/15 z-40">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-neutral-100"
        >
          <ArrowLeft size={18} className="text-[#000201]" />
        </button>
        <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">Account Settings</span>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-5 pt-4 space-y-6 overflow-y-auto no-scrollbar">
        
        {/* Profile Card Header */}
        <section className="bg-white rounded-none border border-[#b7c6c2]/60 p-5 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-none overflow-hidden border-2 border-[#ca0013]">
            <img 
              alt="Alex Mercer Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-headline font-black text-[#000201] truncate">
              {registeredUser?.name || (userRole === 'pilot' ? 'Alex Mercer' : 'Sarah Jenkins')}
            </h2>
            <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider mt-0.5">
              {userRole === 'pilot' ? 'Certified UAV Pilot' : 'Mission Commander'}
            </p>
            <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-red-50 text-[#ca0013] rounded-none text-[9px] font-bold">
              <span className="material-symbols-outlined text-[12px] mr-0.5">verified</span>
              Premium Member
            </div>
          </div>
        </section>

        {/* Profile & Security Section */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">Profile & Security</h3>
          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">
            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><User size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-[#000201]">Personal Information</p>
                  <p className="text-[10px] text-[#747874]">Manage your name, email, and ID</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><Lock size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-[#000201]">Change Security PIN</p>
                  <p className="text-[10px] text-[#747874]">Update passcode access codes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">Preferences</h3>
          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><Bell size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-[#000201]">Push Alerts</p>
                  <p className="text-[10px] text-[#747874]">Mission status updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox"/>
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-none after:h-4 after:w-4 peer-checked:bg-[#ca0013]"></div>
              </label>
            </div>
            
            {/* Language */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><Globe size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-[#000201]">Region Language</p>
                  <p className="text-[10px] text-[#747874]">English (US)</p>
                </div>
              </div>
            </div>

            {/* Dark Mode Switcher */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]">
                  {isDark ? <Moon size={16} /> : <Sun size={16} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#000201]">Interface Theme</p>
                  <p className="text-[10px] text-[#747874]">{isDark ? 'Dark Mode Active' : 'Light Mode Active'}</p>
                </div>
              </div>
              
              <div className="flex bg-neutral-100 p-0.5 rounded-none border border-neutral-200">
                <button 
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-none text-[10px] font-bold ${
                    !isDark ? 'bg-white text-[#000201] shadow-sm' : 'text-neutral-500'
                  }`}
                >
                  Light
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-none text-[10px] font-bold ${
                    isDark ? 'bg-white text-[#000201] shadow-sm' : 'text-neutral-500'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Legal & Support */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">Legal & Support</h3>
          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">
            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer" onClick={() => navigate('about')}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><Shield size={16} /></div>
                <p className="text-xs font-bold text-[#000201]">Privacy Protocols</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer" onClick={() => navigate('about')}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><FileText size={16} /></div>
                <p className="text-xs font-bold text-[#000201]">Terms of Flight</p>
              </div>
            </div>
          </div>
        </section>

        {/* Logout button */}
        <section className="pt-2">
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full bg-white border border-[#ca0013] text-[#ca0013] font-headline font-bold text-xs py-4 rounded-none hover:bg-red-50 uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} />
            <span>End Flight Session</span>
          </button>
          <p className="text-center text-[#747874] text-[9px] font-bold uppercase tracking-widest mt-4">
            App Version 2.4.0 (Build 892)
          </p>
        </section>
      </main>

      {/* Bottom Nav Bar (Shared routing logic based on active role) */}
      <BottomNav />
    </div>
  );
}