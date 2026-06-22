import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { ClipboardList, Calendar, MapPin, CheckCircle, Clock, X } from 'lucide-react';

export default function MyBookings() {
  const { bookings, navigate, activeTab, userRole, completeBookingWithReview, theme } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('active'); // 'active' or 'past'

  const [selectedReviewBkg, setSelectedReviewBkg] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedPilotProfile, setSelectedPilotProfile] = useState(null);

  const getPilotProfile = (bkg) => {
    if (bkg.pilotProfile) return bkg.pilotProfile;
    if (bkg.pilotName && bkg.pilotName !== 'Unassigned') {
      return {
        name: bkg.pilotName,
        phone: bkg.pilotPhone || '+91 98765 43210',
        email: registeredUser?.email || '',
        bio: 'Professional Drone Pilot and UAV Specialist.',
        profilePic: bkg.pilotImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I'
      };
    }
    return null;
  };

  const getPilotReviews = (pilotName) => {
    return bookings.filter(b => b.pilotName === pilotName && b.status === 'Completed' && b.rating);
  };

  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Declined');

  const displayBookings = activeSubTab === 'active' ? activeBookings : pastBookings;

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[60px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex justify-between items-center px-5 h-[72px] border-b border-[#b7c6c2]/15 z-40">
        <span className="text-xl font-headline font-black text-[#000201] tracking-tight font-headline">My Bookings</span>
      </header>

      {/* Main Body */}
      <main className="flex-grow px-5 pt-4 space-y-4 overflow-y-auto no-scrollbar">
        
        {/* Toggle Segment Control */}
        <div className="segmented-control-bg p-1 rounded-full flex relative z-10">
          <button 
            type="button"
            onClick={() => setActiveSubTab('active')}
            className={`flex-grow py-2 rounded-full text-xs font-headline font-bold uppercase transition-all ${
              activeSubTab === 'active' 
              ? 'bg-white text-[#000201] shadow-sm' 
              : 'text-[#444844]'
            }`}
          >
            Active Missions ({activeBookings.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveSubTab('past')}
            className={`flex-grow py-2 rounded-full text-xs font-headline font-bold uppercase transition-all ${
              activeSubTab === 'past' 
              ? 'bg-white text-[#000201] shadow-sm' 
              : 'text-[#444844]'
            }`}
          >
            Past Missions ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="flex flex-col gap-3.5">
          {displayBookings.map((bkg) => (
            <div 
              key={bkg.id}
              className="bg-white rounded-2xl border border-[#b7c6c2]/20 p-4 shadow-sm space-y-3"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  {bkg.pilotImage ? (
                    <img 
                      src={bkg.pilotImage} 
                      alt={bkg.pilotName} 
                      className={`w-10 h-10 rounded-lg object-cover ${bkg.pilotName !== 'Unassigned' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      onClick={() => {
                        if (bkg.pilotName !== 'Unassigned') {
                          setSelectedPilotProfile(getPilotProfile(bkg));
                        }
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#ca0013] shrink-0">
                      <span className="material-symbols-outlined text-[20px]">rss_feed</span>
                    </div>
                  )}
                  <div>
                    <h3 
                      className={`text-xs font-headline font-black text-[#000201] dark:text-white ${bkg.pilotName !== 'Unassigned' ? 'cursor-pointer hover:underline' : ''}`}
                      onClick={() => {
                        if (bkg.pilotName !== 'Unassigned') {
                          setSelectedPilotProfile(getPilotProfile(bkg));
                        }
                      }}
                    >
                      {bkg.pilotName === 'Unassigned' ? (bkg.title || 'Broadcast Mission') : bkg.pilotName}
                    </h3>
                    <p className="text-[10px] text-[#747874] mt-0.5">
                      {bkg.pilotName === 'Unassigned' ? `Awaiting Pilot • ${bkg.type}` : bkg.type}
                    </p>
                    {bkg.pilotName !== 'Unassigned' && (
                      <button
                        type="button"
                        onClick={() => setSelectedPilotProfile(getPilotProfile(bkg))}
                        className="text-[9px] font-bold text-[#ca0013] hover:underline uppercase tracking-wider block mt-1.5 cursor-pointer text-left"
                      >
                        View Profile & Reviews
                      </button>
                    )}
                  </div>
                </div>
                {/* Status Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  bkg.status === 'Confirmed' 
                  ? 'bg-emerald-50 text-emerald-600'
                  : bkg.status === 'Pending'
                  ? 'bg-orange-50 text-orange-500'
                  : bkg.status === 'Completed'
                  ? 'bg-neutral-100 text-[#444844]'
                  : 'bg-red-50 text-[#ca0013]'
                }`}>
                  {bkg.status}
                </span>
              </div>

              {/* Middle details */}
              <div className="grid grid-cols-2 gap-3 text-[10px] text-[#444844] pt-2 border-t border-[#b7c6c2]/10">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#ca0013]" />
                  <span>{bkg.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-[#ca0013]" />
                  <span className="truncate">{bkg.timeSlot.split(' ')[0] + ' ' + bkg.timeSlot.split(' ')[1]}</span>
                </div>
              </div>

              {/* Bottom details */}
              <div className="flex justify-between items-center pt-2 border-t border-[#b7c6c2]/10">
                <div className="flex items-center gap-1 text-[9px] text-[#747874] uppercase font-bold">
                  <MapPin size={10} className="text-[#ca0013]" />
                  <span className="truncate max-w-[150px]">{bkg.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-headline font-black text-[#ca0013]">₹{bkg.price}</span>
                </div>
              </div>

              {/* Client Complete & Review Action */}
              {userRole === 'client' && bkg.status === 'Confirmed' && (
                <div className="pt-3 border-t border-[#b7c6c2]/10">
                  <button
                    onClick={() => setSelectedReviewBkg(bkg)}
                    className="w-full bg-[#ca0013] text-white py-2.5 rounded-none font-headline font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer text-center"
                  >
                    Complete & Review Service
                  </button>
                </div>
              )}
            </div>
          ))}

          {displayBookings.length === 0 && (
            <div className="text-center py-16 text-[#747874] text-xs font-body">
              No {activeSubTab} flight missions found.
            </div>
          )}
        </div>

      </main>

      {/* Complete & Leave Review Modal */}
      {selectedReviewBkg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-[480px] flex flex-col justify-between rounded-t-3xl shadow-2xl border-t border-neutral-200 animate-slide-up relative">
            
            {/* Header */}
            <header className="flex justify-between items-center px-5 py-4 border-b border-[#b7c6c2]/20">
              <span className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">
                Complete & Review Mission
              </span>
              <button 
                onClick={() => {
                  setSelectedReviewBkg(null);
                  setRating(5);
                  setReviewText('');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"
              >
                <X size={16} />
              </button>
            </header>

            {/* Body */}
            <div className="p-5 space-y-5">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-neutral-100 rounded-none text-[8px] font-bold text-[#ca0013] uppercase tracking-wider">
                  Operator: {selectedReviewBkg.pilotName}
                </span>
                <h4 className="text-xs font-headline font-black text-[#000201] uppercase tracking-wider mt-1.5">
                  Rate Drone Flight Operations
                </h4>
                <p className="text-xs text-[#747874]">Provide stars and a review for this mission.</p>
              </div>

              {/* Star Rating selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                  Rating
                </label>
                <div className="flex gap-2 justify-center py-2 border border-[#b7c6c2]/60 bg-neutral-50/20 rounded-none">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                    >
                      <span className={star <= rating ? 'text-amber-500' : 'text-neutral-300'}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text Area */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                  Write Your Review
                </label>
                <textarea 
                  placeholder="e.g. Great flight operation, precision spraying was perfect, very professional pilot!"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-[#b7c6c2]/60 px-4 py-3 text-xs outline-none text-[#1b1c1b] resize-none rounded-none focus:border-[#ca0013] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="p-5 border-t border-[#b7c6c2]/20 bg-neutral-50 flex gap-3">
              <button 
                onClick={() => {
                  if (!reviewText.trim()) {
                    alert("Please write a review comment before completing.");
                    return;
                  }
                  completeBookingWithReview(selectedReviewBkg.id, rating, reviewText.trim());
                  setSelectedReviewBkg(null);
                  setRating(5);
                  setReviewText('');
                }}
                className="flex-grow bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:opacity-90 transition-opacity"
              >
                Submit Review & Mark Complete
              </button>
              <button 
                onClick={() => {
                  setSelectedReviewBkg(null);
                  setRating(5);
                  setReviewText('');
                }}
                className="px-6 bg-white border border-[#b7c6c2]/35 text-[#000201] py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* Pilot Profile Detail Modal */}
      {selectedPilotProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#121316] w-full max-w-[480px] flex flex-col justify-between rounded-t-3xl shadow-2xl border-t border-neutral-200 dark:border-neutral-800 animate-slide-up relative">
            
            {/* Header */}
            <header className="flex justify-between items-center px-5 py-4 border-b border-[#b7c6c2]/20 dark:border-neutral-800">
              <span className="text-sm font-headline font-black text-[#000201] dark:text-white uppercase tracking-wider">
                Operator Profile Details
              </span>
              <button 
                onClick={() => setSelectedPilotProfile(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
              >
                <X size={16} />
              </button>
            </header>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
              
              {/* Profile Pic Display */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-24 h-24 rounded-none overflow-hidden border-2 border-[#ca0013] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-lg">
                  <img 
                    src={selectedPilotProfile.profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I"}
                    alt="Pilot Picture"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-headline font-black text-[#000201] dark:text-white">
                    {selectedPilotProfile.name}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/30 text-[#ca0013] dark:text-red-400 rounded-none text-[9px] font-bold uppercase tracking-wider mt-1.5">
                    Certified UAV Pilot
                  </span>
                </div>
              </div>

              {/* Bio Block */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#747874] dark:text-neutral-400 uppercase tracking-wider">
                  Pilot Biography
                </h4>
                <p className="text-xs text-[#444844] dark:text-neutral-300 leading-relaxed italic bg-neutral-50 dark:bg-neutral-900 p-4 border border-[#b7c6c2]/20 dark:border-neutral-800">
                  {selectedPilotProfile.bio || 'Professional Drone Pilot and UAV Specialist.'}
                </p>
              </div>

              {/* Contact Info Table/Grid */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#747874] dark:text-neutral-400 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-[#b7c6c2]/20 dark:border-neutral-800 divide-y divide-[#b7c6c2]/10 dark:divide-neutral-800 text-xs">
                  <div className="flex justify-between p-3.5">
                    <span className="text-[#747874] dark:text-neutral-400 font-medium">Cell Phone:</span>
                    <a href={`tel:${selectedPilotProfile.phone}`} className="font-bold text-[#ca0013] dark:text-red-400 hover:underline">
                      {selectedPilotProfile.phone}
                    </a>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="text-[#747874] dark:text-neutral-400 font-medium">Email / Mail:</span>
                    <a href={`mailto:${selectedPilotProfile.email}`} className="font-bold text-[#000201] dark:text-white hover:underline truncate max-w-[200px]">
                      {selectedPilotProfile.email}
                    </a>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="text-[#747874] dark:text-neutral-400 font-medium">Date of Birth:</span>
                    <span className="font-bold text-[#000201] dark:text-white">
                      {selectedPilotProfile.dob ? selectedPilotProfile.dob : 'Not Specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Channels / Redirect Links */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-[#747874] dark:text-neutral-400 uppercase tracking-wider">
                  Social Channels
                </h4>
                <div className="flex gap-3">
                  {/* Instagram */}
                  <a 
                    href={selectedPilotProfile.instagramUrl ? (selectedPilotProfile.instagramUrl.startsWith('http') ? selectedPilotProfile.instagramUrl : `https://${selectedPilotProfile.instagramUrl}`) : '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`flex-grow flex items-center justify-center gap-2 py-3 border text-xs font-bold transition-colors uppercase tracking-wider text-center ${
                      selectedPilotProfile.instagramUrl 
                      ? 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[#ca0013] dark:text-red-400' 
                      : 'border-neutral-100 dark:border-neutral-900 text-neutral-300 dark:text-neutral-700 pointer-events-none'
                    }`}
                  >
                    <span className="font-headline">Instagram</span>
                  </a>
                  
                  {/* LinkedIn */}
                  <a 
                    href={selectedPilotProfile.linkedinUrl ? (selectedPilotProfile.linkedinUrl.startsWith('http') ? selectedPilotProfile.linkedinUrl : `https://${selectedPilotProfile.linkedinUrl}`) : '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`flex-grow flex items-center justify-center gap-2 py-3 border text-xs font-bold transition-colors uppercase tracking-wider text-center ${
                      selectedPilotProfile.linkedinUrl 
                      ? 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-blue-600 dark:text-blue-400' 
                      : 'border-neutral-100 dark:border-neutral-900 text-neutral-300 dark:text-neutral-700 pointer-events-none'
                    }`}
                  >
                    <span className="font-headline">LinkedIn</span>
                  </a>
                  
                  {/* Website */}
                  <a 
                    href={selectedPilotProfile.otherUrl ? (selectedPilotProfile.otherUrl.startsWith('http') ? selectedPilotProfile.otherUrl : `https://${selectedPilotProfile.otherUrl}`) : '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`flex-grow flex items-center justify-center gap-2 py-3 border text-xs font-bold transition-colors uppercase tracking-wider text-center ${
                      selectedPilotProfile.otherUrl 
                      ? 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-emerald-600 dark:text-emerald-400' 
                      : 'border-neutral-100 dark:border-neutral-900 text-neutral-300 dark:text-neutral-700 pointer-events-none'
                    }`}
                  >
                    <span className="font-headline">Website</span>
                  </a>
                </div>
              </div>

              {/* Pilot Reviews Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-[#747874] dark:text-neutral-400 uppercase tracking-wider pl-1">
                  Client Reviews & Ratings
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                  {getPilotReviews(selectedPilotProfile.name).map((rev) => (
                    <div 
                      key={rev.id} 
                      className="bg-neutral-50 dark:bg-neutral-900 border border-[#b7c6c2]/20 dark:border-neutral-800 p-3 space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-[#ca0013] uppercase tracking-wider">
                          Mission {rev.id} ({rev.type})
                        </span>
                        <div className="flex text-amber-500 text-[10px]">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                          {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                            <span key={i} className="text-neutral-300">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#444844] dark:text-neutral-300 italic leading-relaxed">
                        "{rev.reviewText}"
                      </p>
                    </div>
                  ))}
                  {getPilotReviews(selectedPilotProfile.name).length === 0 && (
                    <p className="text-[11px] text-[#747874] dark:text-neutral-400 italic pl-1">
                      No ratings or reviews submitted yet.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <footer className="p-5 border-t border-[#b7c6c2]/20 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex">
              <button 
                onClick={() => setSelectedPilotProfile(null)}
                className="flex-grow bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:opacity-90 transition-opacity"
              >
                Close Profile
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
