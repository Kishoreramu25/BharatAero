import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, Plus, Calendar, Search, User, 
  ArrowRight, MessageSquare, Clock, Star, Phone
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ClientDashboard() {
  const { navigate, registeredUser, setAutoOpenProfileModal, bookings } = useApp();
  
  const activeBookings = bookings?.filter(b => b.status === 'Confirmed' || b.status === 'Pending').slice(0, 3) || [];

  const quickLinks = [
    { name: 'Updates', icon: <Bell size={20} />, action: () => navigate('notifications') },
    { name: 'New Booking', icon: <Plus size={20} />, action: () => navigate('book_pilot') },
    { name: 'My Bookings', icon: <Calendar size={20} />, action: () => navigate('my_bookings', 'bookings') },
    { name: 'Browse Pilots', icon: <Search size={20} />, action: () => navigate('browse_pilots', 'explore') },
    { name: 'Profile', icon: <User size={20} />, action: () => { setAutoOpenProfileModal(true); navigate('settings', 'settings'); } },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white text-[#000201] h-full pb-[80px] overflow-hidden select-none font-body">
      
      {/* MINIMAL HEADER - No borders or shadows */}
      <header className="flex justify-between items-center px-6 pt-10 pb-4 bg-white sticky top-0 z-40">
        <div>
          <p className="text-xs text-[#747874] font-bold uppercase tracking-wider mb-1">Welcome back,</p>
          <h1 className="text-3xl font-black font-headline tracking-tight text-[#000201] truncate max-w-[200px]">
            {registeredUser?.name || 'Commander'}
          </h1>
        </div>
        <div 
          className="w-14 h-14 overflow-hidden cursor-pointer"
          onClick={() => {
            setAutoOpenProfileModal(true);
            navigate('settings', 'settings');
          }}
        >
          <img 
            alt="Profile" 
            className="w-full h-full object-cover rounded-full" 
            src={registeredUser?.profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuDGrwU0dTkzQisGLCQ3Z3mps07VaFQJKjagxF4FcDioG-eju5wXCHSsa_pGmDiFpofHEfWoN-nQk-ICp7MsX9ZoQ3_o2RFgBa9Cho1JEefTaxQcMOCyn9Vk2fY0jj5-iUlld6EMuBuT8R2Uc-7cTMaMd5kjV8YbWblNVAmBrx-APuvW1_rOm9AbAB4a-n1nAcDTmXh7nTuroxKoZpqFJoaCI72CuCKhMPo1a0wBO4I1r0apSp4EPzn-40NI1kgkEESaJOT4fufcyJk"}
          />
        </div>
      </header>
 
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-6">
        
        <h2 className="text-xl font-black font-headline text-[#000201] mb-6 tracking-tight">Ready for your next project?</h2>

        {/* QUICK LINKS - Single Overall Sharp Box */}
        <section className="mb-8 mt-2">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(202,0,19,0.1)] overflow-x-auto no-scrollbar gap-4">
            {quickLinks.map((link, i) => (
              <div 
                key={i}
                onClick={link?.action}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-[60px]"
              >
                <div className="text-[#ca0013] mb-1">
                  {link.icon}
                </div>
                <span className="text-[11px] font-bold text-[#000201] text-center whitespace-nowrap">{link.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* STATS - Single Overall Sharp Box with Cross Grid */}
        <section className="mb-12">
          <div className="bg-white border border-gray-200 rounded-none shadow-[2px_2px_0px_0px_rgba(202,0,19,0.1)]">
            <div className="grid grid-cols-2">
              <div className="flex flex-col p-6 border-r border-b border-gray-100">
                <p className="text-[11px] text-[#ca0013] font-bold uppercase tracking-widest mb-1">Active Bookings</p>
                <p className="text-4xl font-black font-headline text-[#000201] mb-1">3</p>
                <p className="text-[11px] text-[#747874] font-medium">All on schedule</p>
              </div>
              
              <div className="flex flex-col p-6 border-b border-gray-100">
                <p className="text-[11px] text-[#747874] font-bold uppercase tracking-widest mb-1">Total Spent</p>
                <p className="text-3xl font-black font-headline text-[#000201] mb-1 mt-1">₹48k</p>
                <p className="text-[11px] text-[#747874] font-medium">Last 90 days</p>
              </div>

              <div className="flex flex-col p-6 border-r border-gray-100">
                <p className="text-[11px] text-[#747874] font-bold uppercase tracking-widest mb-1">Pilots Booked</p>
                <p className="text-4xl font-black font-headline text-[#000201] mb-1">12</p>
                <p className="text-[11px] text-[#747874] font-medium">Trusted partners</p>
              </div>

              <div className="flex flex-col p-6">
                <p className="text-[11px] text-[#747874] font-bold uppercase tracking-widest mb-1">Avg Rating</p>
                <p className="text-4xl font-black font-headline text-[#000201] mb-1">4.8<span className="text-2xl text-yellow-400 ml-1">★</span></p>
                <p className="text-[11px] text-[#747874] font-medium">Your reviews</p>
              </div>
            </div>
          </div>
        </section>

        {/* UPCOMING BOOKINGS - Single Overall Sharp Box */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-xl font-black font-headline text-[#000201] tracking-tight">Upcoming Bookings</h3>
            <button 
              onClick={() => navigate('my_bookings', 'bookings')}
              className="text-[13px] font-bold text-[#ca0013] flex items-center gap-1 hover:underline uppercase tracking-wider"
            >
              View all
            </button>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-none shadow-[2px_2px_0px_0px_rgba(202,0,19,0.1)] flex flex-col">
            
            {activeBookings.length > 0 ? (
              activeBookings.map((bkg, index) => (
                <div key={bkg.id} className={index !== activeBookings.length - 1 ? "pb-5 border-b border-gray-100 mb-5" : ""}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-[#ca0013] font-bold uppercase tracking-wider mb-1">
                        {bkg.date} • {bkg.timeSlot.split(' ')[0]}
                      </p>
                      <h4 className="font-black font-headline text-[#000201] text-lg truncate max-w-[200px]">
                        {bkg.type || 'Mission'}
                      </h4>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#747874] font-medium mb-5 truncate max-w-[250px]">
                    {bkg.location} • with {bkg.pilotName !== 'Unassigned' ? bkg.pilotName : 'Pending Pilot'}
                  </p>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate('my_bookings', 'bookings')}
                      className="flex-1 bg-transparent border border-[#000201] text-[#000201] py-3 text-[13px] font-bold active:scale-95 transition-transform hover:bg-gray-50"
                    >
                      Details
                    </button>
                    {bkg.status === 'Confirmed' ? (
                      <button className="flex-1 bg-[#ca0013] text-white py-3 text-[13px] font-bold active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-sm hover:bg-red-700">
                        <Phone size={16} /> Call
                      </button>
                    ) : (
                      <button disabled className="flex-1 bg-neutral-50 border border-neutral-200 text-neutral-400 py-3 text-[13px] font-bold flex justify-center items-center gap-2 shadow-sm cursor-not-allowed">
                        <Clock size={16} /> Awaiting Pilot
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#747874] text-sm font-medium">
                No upcoming bookings right now.
              </div>
            )}

          </div>
        </section>

      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
