import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Bell, Check, X } from 'lucide-react';

export default function PilotDashboard() {
  const { 
    bookings, setBookings, 
    navigate, activeTab, registeredUser,
    acceptBooking, setAutoOpenProfileModal, t
  } = useApp();

  const [selectedReq, setSelectedReq] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [pilotNameInput, setPilotNameInput] = useState('');
  const [pilotPhoneInput, setPilotPhoneInput] = useState('');

  // Filter pending bookings (these act as incoming requests for the pilot)
  const pendingRequests = bookings.filter(b => b.status === 'Pending');

  // Filter reviews for the logged-in pilot
  const currentPilotName = registeredUser?.name || 'Alex Mercer';
  const myReviews = bookings.filter(b => b.status === 'Completed' && b.rating && (b.pilotName === currentPilotName));

  const handleDecline = (id) => {
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: 'Declined' } : b)
    );
    setSelectedReq(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[60px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex justify-between items-center px-5 h-[72px] border-b border-[#b7c6c2]/15 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none overflow-hidden flex items-center justify-center bg-[#121316] p-1 border border-neutral-800/40">
            <img 
              alt="BharatAero Logo" 
              className="w-full h-full object-contain" 
              src="/logo.webp"
            />
          </div>
          <span className="text-base font-headline font-black text-[#000201] tracking-tight">BharatAero</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('notifications')}
            className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-neutral-100 transition-colors"
          >
            <Bell size={18} className="text-[#000201]" />
          </button>
          <div 
            onClick={() => {
              setAutoOpenProfileModal(true);
              navigate('settings', 'settings');
            }}
            className="w-8 h-8 rounded-none overflow-hidden border border-[#ca0013] cursor-pointer shrink-0"
            title="Click to edit profile bio, photo and links"
          >
            <img 
              alt="Pilot Profile" 
              className="w-full h-full object-cover" 
              src={registeredUser?.profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I"}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow px-5 pt-4 space-y-6 overflow-y-auto no-scrollbar pb-6">

        {/* Pending Flight Requests Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <div 
              onClick={() => {
                setAutoOpenProfileModal(true);
                navigate('settings', 'settings');
              }}
              className="cursor-pointer hover:opacity-85"
              title="Click to edit profile"
            >
              <h2 className="text-xs font-headline font-bold uppercase tracking-wider text-[#000201]">{t('Pilot Dashboard')}</h2>
              <p className="text-xs text-[#747874]">{t('Welcome back')}, <span className="underline decoration-dotted decoration-[#ca0013] font-bold text-[#000201]">{registeredUser?.name || 'Operator'}</span></p>
            </div>
          </div>

          <div className="flex flex-col gap-3" id="request-grid">
            {pendingRequests.map((req) => (
              <div 
                key={req.id}
                onClick={() => {
                  setSelectedReq(req);
                  setPilotNameInput(registeredUser?.name || 'Alex Mercer');
                  setPilotPhoneInput('');
                  setIsAccepting(false);
                }}
                className="bg-white rounded-none border border-[#b7c6c2]/60 p-4 shadow-sm hover:border-[#ca0013] transition-colors cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-none text-[8px] font-bold text-[#ca0013] uppercase tracking-wider">
                    {req.type}
                  </span>
                  <h4 className="font-headline font-black text-xs text-[#000201] leading-tight mt-1.5">
                    {req.title || req.type}
                  </h4>
                  <p className="text-[9px] text-[#747874] mt-1 font-semibold">
                    Schedule: {req.date} • Zone: {req.location.split(',')[0]}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-headline font-black text-[#ca0013]">₹{req.price}</span>
                  <span className="block text-[8px] text-[#747874] uppercase font-bold mt-1">TAP TO VIEW</span>
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

        {/* Client Reviews Section */}
        <section className="space-y-3 pt-4 border-t border-[#b7c6c2]/20">
          <div>
            <h2 className="text-xs font-headline font-bold uppercase tracking-wider text-[#000201]">My Reviews</h2>
            <p className="text-xs text-[#747874]">Feedback from completed flight operations</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {myReviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-none border border-[#b7c6c2]/60 p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    {/* Stars indicator */}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xs ${i < rev.rating ? 'text-amber-500' : 'text-neutral-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#000201]">{rev.rating} / 5</span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400">{rev.id}</span>
                </div>
                <p className="text-xs font-body text-[#444844] italic">"{rev.reviewText}"</p>
                <div className="flex justify-between items-center text-[9px] text-[#747874] uppercase font-bold pt-1 border-t border-neutral-100">
                  <span>Operation: {rev.type}</span>
                  <span>Date: {rev.date}</span>
                </div>
              </div>
            ))}

            {myReviews.length === 0 && (
              <div className="py-8 border border-dashed border-[#b7c6c2]/30 rounded-none flex flex-col items-center justify-center text-[#747874] opacity-80 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#000201]">No Reviews Yet</p>
                <p className="text-[9px] mt-0.5">Complete flight missions to receive client ratings.</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Full Details & Acceptance Popup Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-[480px] h-[90vh] flex flex-col justify-between rounded-t-3xl shadow-2xl border-t border-neutral-200 animate-slide-up relative">
            
            {/* Modal Header */}
            <header className="flex justify-between items-center px-5 py-4 border-b border-[#b7c6c2]/20">
              <span className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">
                {isAccepting ? 'Accept Mission Request' : 'Mission Details'}
              </span>
              <button 
                onClick={() => {
                  setSelectedReq(null);
                  setIsAccepting(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"
              >
                <X size={16} />
              </button>
            </header>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              {!isAccepting ? (
                /* Full details display */
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 bg-neutral-100 rounded-none text-[9px] font-bold text-[#ca0013] uppercase tracking-wider">
                      {selectedReq.type}
                    </span>
                    <h3 className="text-lg font-headline font-black text-[#000201] leading-tight">
                      {selectedReq.title || selectedReq.type}
                    </h3>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-t border-b border-[#b7c6c2]/25 py-4 text-xs">
                    <div>
                      <span className="block text-[8px] font-bold text-[#747874] uppercase tracking-wider">Flight Schedule</span>
                      <p className="font-black text-[#000201] mt-0.5">{selectedReq.date}</p>
                      <p className="text-[10px] text-neutral-500 font-semibold">{selectedReq.timeSlot}</p>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-[#747874] uppercase tracking-wider">Estimated Payout</span>
                      <p className="font-black text-[#ca0013] mt-0.5 text-sm">₹{selectedReq.price}</p>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-[#747874] uppercase tracking-wider">Est. Flight Time</span>
                      <p className="font-black text-[#000201] mt-0.5">{selectedReq.duration ? `${selectedReq.duration} Hours` : '3 Hours'}</p>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-[#747874] uppercase tracking-wider">Flight Zone</span>
                      <p className="font-black text-[#000201] mt-0.5 truncate">{selectedReq.location}</p>
                    </div>
                    <div className="col-span-2 border-t border-[#b7c6c2]/10 pt-3">
                      <span className="block text-[8px] font-bold text-[#747874] uppercase tracking-wider">Required Platform</span>
                      <p className="font-black text-[#000201] mt-0.5">{selectedReq.droneModel}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[8px] font-bold text-[#747874] uppercase tracking-wider">Required Certifications</span>
                      <p className="font-black text-[#000201] mt-0.5">{selectedReq.certifications}</p>
                    </div>
                    {selectedReq.hazards && selectedReq.hazards !== 'None' && (
                      <div className="col-span-2 border-t border-red-100/50 pt-3">
                        <span className="block text-[8px] font-bold text-amber-600 uppercase tracking-wider">Site Hazards & Airspace obstacles</span>
                        <p className="font-black text-amber-700 mt-0.5">{selectedReq.hazards}</p>
                      </div>
                    )}
                  </div>

                  {/* Scope of Work */}
                  {selectedReq.description && (
                    <div className="space-y-1.5">
                      <span className="block text-[8px] font-bold text-[#747874] uppercase tracking-wider">Scope of Work</span>
                      <p className="text-xs text-[#444844] leading-relaxed whitespace-pre-wrap font-body bg-neutral-50 p-4 border border-neutral-100">
                        {selectedReq.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Acceptance input form */
                <div className="space-y-5 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#ca0013] uppercase tracking-wider">Step 2 of 2</span>
                    <h3 className="text-base font-headline font-black text-[#000201]">Operator Credentials</h3>
                    <p className="text-xs text-[#747874]">Provide your name and contact details to accept this mission request.</p>
                  </div>

                  {/* Accept Name Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                      Pilot Full Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Alex Mercer"
                      value={pilotNameInput}
                      onChange={(e) => setPilotNameInput(e.target.value)}
                      className="w-full bg-white border border-[#b7c6c2]/60 px-4 py-3 text-xs outline-none text-[#1b1c1b] placeholder-neutral-400 rounded-none focus:border-[#ca0013] transition-colors"
                      required
                    />
                  </div>

                  {/* Accept Phone Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                      Contact Phone Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98765 43210"
                      value={pilotPhoneInput}
                      onChange={(e) => setPilotPhoneInput(e.target.value)}
                      className="w-full bg-white border border-[#b7c6c2]/60 px-4 py-3 text-xs outline-none text-[#1b1c1b] placeholder-neutral-400 rounded-none focus:border-[#ca0013] transition-colors"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <footer className="p-5 border-t border-[#b7c6c2]/20 bg-neutral-50 flex gap-3.5">
              {!isAccepting ? (
                <>
                  <button 
                    onClick={() => {
                      setPilotNameInput(registeredUser?.name || 'Alex Mercer');
                      setPilotPhoneInput('');
                      setIsAccepting(true);
                    }}
                    className="flex-1 bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Accept Mission
                  </button>
                  <button 
                    onClick={() => handleDecline(selectedReq.id)}
                    className="flex-1 bg-white border border-[#b7c6c2]/35 text-[#000201] py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-neutral-50 transition-colors"
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
                    className="flex-grow bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Confirm & Accept
                  </button>
                  <button 
                    onClick={() => setIsAccepting(false)}
                    className="px-6 bg-white border border-[#b7c6c2]/35 text-[#000201] py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    Back
                  </button>
                </>
              )}
            </footer>

          </div>
        </div>
      )}

      {/* Pilot Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
