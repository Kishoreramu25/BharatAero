import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Bell, Check, X, Calendar, MapPin, Clock, Star, TrendingUp } from 'lucide-react';

export default function PilotDashboard() {
  const { 
    bookings, setBookings, 
    navigate, activeTab, registeredUser,
    acceptBooking, setAutoOpenProfileModal, t, getCompletedEarnings
  } = useApp();

  const [selectedReq, setSelectedReq] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [pilotNameInput, setPilotNameInput] = useState('');
  const [pilotPhoneInput, setPilotPhoneInput] = useState('');

  // Filter pending bookings
  const pendingRequests = bookings.filter(b => b.status === 'Pending');

  // Filter reviews for the logged-in pilot
  const currentPilotName = registeredUser?.name || 'Alex Mercer';
  const myReviews = bookings.filter(b => b.status === 'Completed' && b.rating && (b.pilotName === currentPilotName));
  const completedMissions = bookings.filter(b => b.status === 'Completed' && (b.pilotName === currentPilotName));
  
  // Calculate average rating
  const avgRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, rev) => sum + rev.rating, 0) / myReviews.length).toFixed(1)
    : '0.0';

  const totalEarnings = getCompletedEarnings();

  const handleDecline = (id) => {
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: 'Declined' } : b)
    );
    setSelectedReq(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-[#000201] h-full pb-[80px] overflow-hidden select-none font-body">
      
      {/* Top Header */}
      <header className="bg-white px-6 py-5 flex justify-between items-center z-40">
        <div>
          <h1 className="text-sm font-bold text-[#ca0013] uppercase tracking-wider mb-1">
            {t('Operator Dashboard')}
          </h1>
          <h1 className="text-3xl font-black font-headline text-[#000201] tracking-tight leading-none">
            {registeredUser?.name || 'Alex Mercer'}
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
            className="w-full h-full object-cover rounded-none" 
            src={registeredUser?.profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I"}
          />
        </div>
      </header>
 
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-6">
        
        {/* STATS - Single Overall Sharp Box with Cross Grid */}
        <section className="mb-8">
          <div className="bg-white border border-gray-200 rounded-none shadow-[2px_2px_0px_0px_rgba(202,0,19,0.1)]">
            <div className="grid grid-cols-2">
              <div className="flex flex-col p-5 border-r border-b border-gray-100">
                <p className="text-[10px] text-[#ca0013] font-bold uppercase tracking-widest mb-1">Available Missions</p>
                <p className="text-3xl font-black font-headline text-[#000201] mb-1">{pendingRequests.length}</p>
                <p className="text-[10px] text-[#747874] font-medium">Open for enrollment</p>
              </div>
              
              <div className="flex flex-col p-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigate('earnings', 'earnings')}>
                <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">Total Earnings</p>
                <p className="text-3xl font-black font-headline text-[#ca0013] mb-1">₹{totalEarnings.toLocaleString()}</p>
                <p className="text-[10px] text-[#ca0013] font-bold uppercase tracking-wider flex items-center gap-1">View Wallet <TrendingUp size={10} /></p>
              </div>

              <div className="flex flex-col p-5 border-r border-gray-100">
                <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">Completed</p>
                <p className="text-3xl font-black font-headline text-[#000201] mb-1">{completedMissions.length}</p>
                <p className="text-[10px] text-[#747874] font-medium">Total missions</p>
              </div>

              <div className="flex flex-col p-5">
                <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">Avg Rating</p>
                <p className="text-3xl font-black font-headline text-[#000201] mb-1">{avgRating}<span className="text-xl text-yellow-400 ml-1">★</span></p>
                <p className="text-[10px] text-[#747874] font-medium">From {myReviews.length} reviews</p>
              </div>
            </div>
          </div>
        </section>

        {/* INCOMING REQUESTS - Single Overall Sharp Box */}
        <section className="mb-8">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-xl font-black font-headline text-[#000201] tracking-tight">Mission Board</h3>
            <span className="text-[13px] font-bold text-[#ca0013] uppercase tracking-wider">
              {pendingRequests.length} Available
            </span>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-none shadow-[2px_2px_0px_0px_rgba(202,0,19,0.1)] flex flex-col">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req, index) => (
                <div key={req.id} className={index !== pendingRequests.length - 1 ? "pb-5 border-b border-gray-100 mb-5" : ""}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-[#ca0013] font-bold uppercase tracking-wider mb-1">
                        {req.date} • {req.timeSlot.split(' ')[0]}
                      </p>
                      <h4 className="font-black font-headline text-[#000201] text-lg truncate max-w-[200px]">
                        {req.title || req.type}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black font-headline text-[#ca0013]">₹{req.price}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#747874] font-medium mb-5 truncate max-w-[250px]">
                    {req.location.split(',')[0]} • Requires {req.droneModel || 'Any'}
                  </p>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleDecline(req.id)}
                      className="flex-1 bg-transparent border border-[#000201] text-[#000201] py-3 text-[13px] font-bold active:scale-95 transition-transform hover:bg-gray-50"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedReq(req);
                        setPilotNameInput(registeredUser?.name || 'Alex Mercer');
                        setPilotPhoneInput('');
                        setIsAccepting(false);
                      }}
                      className="flex-1 bg-[#ca0013] text-white py-3 text-[13px] font-bold active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-sm hover:bg-red-700"
                    >
                      View & Accept
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#747874] text-sm font-medium">
                No available missions on the board right now.
              </div>
            )}
          </div>
        </section>

        {/* CLIENT REVIEWS - Single Overall Sharp Box */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-xl font-black font-headline text-[#000201] tracking-tight">Recent Feedback</h3>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-none shadow-[2px_2px_0px_0px_rgba(202,0,19,0.1)] flex flex-col">
            {myReviews.length > 0 ? (
              myReviews.map((rev, index) => (
                <div key={rev.id} className={index !== myReviews.length - 1 ? "pb-4 border-b border-gray-100 mb-4" : ""}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-0.5 text-yellow-500 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rev.rating ? 'text-amber-500' : 'text-neutral-200'}>★</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#747874] uppercase tracking-wider">{rev.date}</span>
                  </div>
                  <p className="text-sm text-[#000201] italic leading-relaxed font-medium">"{rev.reviewText}"</p>
                  <p className="text-[10px] font-bold text-[#ca0013] uppercase tracking-wider mt-2">Mission: {rev.type}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#747874] text-sm font-medium">
                Complete a mission to start earning ratings.
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Full Details & Acceptance Popup Modal (Unchanged styling for logic preservation) */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-[480px] h-[90vh] flex flex-col justify-between rounded-t-none shadow-2xl border-t-2 border-[#ca0013] animate-slide-up relative">
            
            {/* Modal Header */}
            <header className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
              <span className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">
                {isAccepting ? 'Confirm Acceptance' : 'Mission Details'}
              </span>
              <button 
                onClick={() => {
                  setSelectedReq(null);
                  setIsAccepting(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-none bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"
              >
                <X size={16} />
              </button>
            </header>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {!isAccepting ? (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-neutral-100 rounded-none text-[10px] font-bold text-[#ca0013] uppercase tracking-wider">
                      {selectedReq.type}
                    </span>
                    <h3 className="text-2xl font-headline font-black text-[#000201] leading-tight pt-2">
                      {selectedReq.title || selectedReq.type}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-b border-gray-200 py-6 text-sm">
                    <div>
                      <span className="block text-[9px] font-bold text-[#747874] uppercase tracking-wider">Flight Schedule</span>
                      <p className="font-black text-[#000201] mt-1">{selectedReq.date}</p>
                      <p className="text-[11px] text-neutral-500 font-bold mt-0.5">{selectedReq.timeSlot}</p>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-[#747874] uppercase tracking-wider">Payout</span>
                      <p className="font-black text-[#ca0013] mt-1 text-xl">₹{selectedReq.price}</p>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-[#747874] uppercase tracking-wider">Est. Time</span>
                      <p className="font-black text-[#000201] mt-1">{selectedReq.duration ? `${selectedReq.duration} Hours` : '3 Hours'}</p>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-[#747874] uppercase tracking-wider">Zone</span>
                      <p className="font-black text-[#000201] mt-1 truncate">{selectedReq.location}</p>
                    </div>
                    <div className="col-span-2 border-t border-gray-100 pt-4">
                      <span className="block text-[9px] font-bold text-[#747874] uppercase tracking-wider">Required Platform</span>
                      <p className="font-black text-[#000201] mt-1">{selectedReq.droneModel || 'DJI Mavic 3 Enterprise'}</p>
                    </div>
                  </div>

                  {selectedReq.description && (
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-[#747874] uppercase tracking-wider">Scope of Work</span>
                      <p className="text-sm text-[#000201] leading-relaxed whitespace-pre-wrap font-body bg-neutral-50 p-4 border border-gray-200 rounded-none">
                        {selectedReq.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#ca0013] uppercase tracking-wider">Final Step</span>
                    <h3 className="text-xl font-headline font-black text-[#000201]">Operator Verification</h3>
                    <p className="text-sm text-[#747874] font-medium">Provide details to confirm this assignment.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#000201] uppercase tracking-wider">
                      Pilot Full Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Alex Mercer"
                      value={pilotNameInput}
                      onChange={(e) => setPilotNameInput(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-4 py-4 text-sm outline-none text-[#000201] placeholder-neutral-400 rounded-none focus:border-[#ca0013] transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#000201] uppercase tracking-wider">
                      Contact Phone
                    </label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98765 43210"
                      value={pilotPhoneInput}
                      onChange={(e) => setPilotPhoneInput(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-4 py-4 text-sm outline-none text-[#000201] placeholder-neutral-400 rounded-none focus:border-[#ca0013] transition-colors"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <footer className="p-6 border-t border-gray-200 bg-white flex gap-3">
              {!isAccepting ? (
                <>
                  <button 
                    onClick={() => {
                      setPilotNameInput(registeredUser?.name || 'Alex Mercer');
                      setPilotPhoneInput('');
                      setIsAccepting(true);
                    }}
                    className="flex-1 bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Accept Mission
                  </button>
                  <button 
                    onClick={() => handleDecline(selectedReq.id)}
                    className="flex-1 bg-transparent border border-[#000201] text-[#000201] py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Decline
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      if (!pilotNameInput.trim() || !pilotPhoneInput.trim()) {
                        alert("Please fill in both name and phone number fields.");
                        return;
                      }
                      acceptBooking(selectedReq.id, pilotNameInput.trim(), pilotPhoneInput.trim(), {
                        name: pilotNameInput.trim(),
                        phone: pilotPhoneInput.trim(),
                        email: registeredUser?.email || '',
                        bio: registeredUser?.bio || 'Professional Drone Pilot and UAV Specialist.',
                        dob: registeredUser?.dob || '',
                        instagramUrl: registeredUser?.instagramUrl || '',
                        linkedinUrl: registeredUser?.linkedinUrl || '',
                        otherUrl: registeredUser?.otherUrl || '',
                        profilePic: registeredUser?.profilePic || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I'
                      });
                      setSelectedReq(null);
                      setIsAccepting(false);
                    }}
                    className="flex-[2] bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Confirm & Accept
                  </button>
                  <button 
                    onClick={() => setIsAccepting(false)}
                    className="flex-1 bg-transparent border border-[#000201] text-[#000201] py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </>
              )}
            </footer>

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
