import React from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, ShieldAlert, User, Lock, Key, Bell, 
  Globe, Sun, Moon, Shield, FileText, LifeBuoy, LogOut, X
} from 'lucide-react';

const countryCodes = [
  { code: '+91', flag: '🇮🇳', label: 'India' },
  { code: '+1', flag: '🇺🇸', label: 'USA' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+971', flag: '🇦🇪', label: 'UAE' },
  { code: '+65', flag: '🇸🇬', label: 'Singapore' },
  { code: '+61', flag: '🇦🇺', label: 'Australia' }
];

export default function SettingsScreen() {
  const { 
    theme, setTheme, userRole, 
    setIsLoggedIn, navigate, activeTab, registeredUser, setRegisteredUser,
    sendResendEmail
  } = useApp();

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [selectedCountryCode, setSelectedCountryCode] = React.useState('+91');
  const [editPhoneBody, setEditPhoneBody] = React.useState('');
  const [editId, setEditId] = React.useState('');

  // OTP Verification States
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false);
  const [generatedOtp, setGeneratedOtp] = React.useState('');
  const [enteredOtp, setEnteredOtp] = React.useState('');
  const [otpErrorMsg, setOtpErrorMsg] = React.useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = React.useState('');
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [showOtpHint, setShowOtpHint] = React.useState(false);

  const handleOpenEditProfile = () => {
    setEditName(registeredUser?.name || (userRole === 'pilot' ? 'Alex Mercer' : 'Sarah Jenkins'));
    setEditEmail(registeredUser?.email || (userRole === 'pilot' ? 'pilot@misd-automation.com' : 'client@misd-automation.com'));
    
    // Parse saved phone number
    const savedPhone = (registeredUser?.phone || (userRole === 'pilot' ? '+91 98765 43210' : '+91 87654 32109')).trim();
    let matchedCode = '+91';
    let phoneBody = savedPhone;

    for (const country of countryCodes) {
      if (savedPhone.startsWith(country.code)) {
        matchedCode = country.code;
        phoneBody = savedPhone.substring(country.code.length).trim();
        break;
      }
    }

    setSelectedCountryCode(matchedCode);
    setEditPhoneBody(phoneBody);
    setEditId(registeredUser?.id || (userRole === 'pilot' ? 'PILOT-UA-4091' : 'CLIENT-MISD-8821'));
    setIsEditingProfile(true);
    setIsVerifyingOtp(false);
    setOtpErrorMsg('');
    setOtpSuccessMsg('');
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpErrorMsg('');
    setOtpSuccessMsg('');

    const originalEmail = registeredUser?.email || (userRole === 'pilot' ? 'pilot@misd-automation.com' : 'client@misd-automation.com');
    const originalPhone = registeredUser?.phone || (userRole === 'pilot' ? '+91 98765 43210' : '+91 87654 32109');
    
    const editPhone = (selectedCountryCode + ' ' + editPhoneBody.trim()).trim();
    
    const emailChanged = editEmail.trim().toLowerCase() !== originalEmail.toLowerCase();
    const phoneChanged = editPhone !== originalPhone;

    if (emailChanged || phoneChanged) {
      // Generate secure 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otpCode);
      setIsSendingOtp(true);
      setIsVerifyingOtp(true);
      setEnteredOtp('');

      if (phoneChanged) {
        // Phone number changed -> Send code to Phone number via Twilio SMS API
        const targetPhone = editPhone;
        const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
        const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
        const twilioPhone = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

        try {
          console.log(`%c[MISD SMS GATEWAY] Dispatching OTP code to ${targetPhone} via Twilio SMS...`, "color: #0284c7; font-weight: bold;");
          
          if (accountSid && authToken && twilioPhone) {
            // Format phone number to E.164 (ensure it starts with country code prefix, e.g. +91)
            let formattedPhone = targetPhone;
            if (!formattedPhone.startsWith('+')) {
              if (formattedPhone.startsWith('0')) {
                formattedPhone = formattedPhone.substring(1);
              }
              if (formattedPhone.length === 10) {
                formattedPhone = '+91' + formattedPhone;
              } else {
                formattedPhone = '+' + formattedPhone;
              }
            }

            const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
            const headers = new Headers();
            headers.set('Authorization', 'Basic ' + btoa(accountSid + ":" + authToken));
            headers.set('Content-Type', 'application/x-www-form-urlencoded');

            const body = new URLSearchParams({
              To: formattedPhone,
              From: twilioPhone,
              Body: `Your Bharat Aero verification code is: ${otpCode}`
            });

            const response = await fetch(url, {
              method: 'POST',
              headers: headers,
              body: body
            });

            if (response.ok) {
              const resData = await response.json();
              console.log(`%c[MISD SMS GATEWAY] SMS successfully sent via Twilio! (OTP: ${otpCode})`, "color: #0284c7; font-weight: bold;", resData);
              setOtpSuccessMsg(`OTP sent to your phone number ${formattedPhone} via Twilio SMS!`);
              setShowOtpHint(false);
            } else {
              const errText = await response.text();
              throw new Error(errText || "Twilio request failed");
            }
          } else {
            // No credentials, run simulator
            console.log(`%c[MISD SMS GATEWAY (Twilio)] OTP Verification code: ${otpCode}`, "background: #121316; color: #0284c7; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;");
            setOtpSuccessMsg(`Twilio credentials missing in .env. Simulated OTP sent! (Look at F12 console or use code below)`);
            setShowOtpHint(true);
          }
        } catch (err) {
          console.warn("Failed to dispatch SMS via Twilio API:", err);
          console.log(`%c[MISD SMS GATEWAY BACKUP] OTP Verification code: ${otpCode}`, "background: #222; color: #ca0013; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;");
          setOtpSuccessMsg(`Failed to send Twilio SMS. (Note: Trial accounts can only send to verified caller IDs). Simulated OTP sent!`);
          setShowOtpHint(true);
        } finally {
          setIsSendingOtp(false);
        }
      } else {
        // Only Email changed -> Send to Email address
        const targetEmail = editEmail.trim();
        try {
          console.log(`%c[MISD PROFILE UPDATE SECURITY] OTP Verification code for ${targetEmail} is: ${otpCode}`, "background: #222; color: #ca0013; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;");

          await sendResendEmail(targetEmail, otpCode, editName || 'User');
          setOtpSuccessMsg('A 6-digit verification code has been sent to your email.');
          setShowOtpHint(false);
        } catch (err) {
          console.warn("Failed to send profile update OTP via Resend:", err);
          setOtpSuccessMsg('Simulated OTP sent! Look at the F12 developer console for the 6-digit code.');
          setShowOtpHint(true);
        } finally {
          setIsSendingOtp(false);
        }
      }
    } else {
      // No email/phone changes, save directly
      setRegisteredUser({
        ...registeredUser,
        name: editName,
        email: editEmail,
        phone: editPhone,
        id: editId
      });
      setIsEditingProfile(false);
    }
  };

  const handleVerifyOtpAndSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpErrorMsg('');

    const editPhone = (selectedCountryCode + ' ' + editPhoneBody.trim()).trim();

    if (enteredOtp === generatedOtp) {
      setRegisteredUser({
        ...registeredUser,
        name: editName,
        email: editEmail,
        phone: editPhone,
        id: editId
      });
      setIsVerifyingOtp(false);
      setIsEditingProfile(false);
    } else {
      setOtpErrorMsg('Incorrect verification code. Please check and try again.');
    }
  };

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
            <div 
              onClick={handleOpenEditProfile}
              className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer"
            >
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

      {/* Edit Personal Information Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-[480px] flex flex-col justify-between rounded-none shadow-2xl border-t border-neutral-200 animate-slide-up relative">
            
            {/* Header */}
            <header className="flex justify-between items-center px-5 py-4 border-b border-[#b7c6c2]/20">
              <span className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">
                {isVerifyingOtp ? 'Verify Security Code' : 'Edit Personal Information'}
              </span>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 flex items-center justify-center rounded-none bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"
              >
                <X size={16} />
              </button>
            </header>

            {/* Body */}
            {isVerifyingOtp ? (
              <form onSubmit={handleVerifyOtpAndSave} className="p-5 space-y-5">
                <div className="space-y-1">
                  <h4 className="text-xs font-headline font-black text-[#000201] uppercase tracking-wider">
                    Confirm Identity
                  </h4>
                  <p className="text-xs text-[#747874]">
                    {(selectedCountryCode + ' ' + editPhoneBody.trim()).trim() !== (registeredUser?.phone || (userRole === 'pilot' ? '+91 98765 43210' : '+91 87654 32109')) ? (
                      <span>We've sent a 6-digit verification code to your new phone number <strong className="text-[#000201]">{selectedCountryCode} {editPhoneBody}</strong> via SMS (using Twilio).</span>
                    ) : (
                      <span>We've sent a 6-digit verification code to <strong className="text-[#000201]">{editEmail}</strong> to confirm changes to your email address.</span>
                    )}
                  </p>
                </div>

                {otpSuccessMsg && (
                  <div className="p-3 bg-neutral-50 text-emerald-800 text-[11px] font-bold border border-emerald-600/20 uppercase tracking-wide">
                    {otpSuccessMsg}
                  </div>
                )}

                {otpErrorMsg && (
                  <div className="p-3 bg-red-50 text-[#ca0013] text-[11px] font-bold border border-[#ca0013]/20 uppercase tracking-wide">
                    {otpErrorMsg}
                  </div>
                )}

                {/* OTP Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-lg tracking-[8px] p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-black font-mono"
                    placeholder="000000"
                  />
                  {showOtpHint && (
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1.5">
                      Please check the browser developer console (F12) for the code.
                    </p>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVerifyingOtp(false)}
                    className="flex-1 py-3 text-xs font-bold text-[#747874] bg-neutral-100 hover:bg-neutral-200 transition-colors uppercase tracking-wider rounded-none text-center"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] transition-colors uppercase tracking-wider rounded-none text-center"
                  >
                    Verify & Save
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-headline font-black text-[#000201] uppercase tracking-wider">
                    Update Account Details
                  </h4>
                  <p className="text-xs text-[#747874]">Modify your name, email, phone number, and identification codes.</p>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone Number with Country Code Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="flex select-none">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="text-xs p-3 bg-white border border-[#b7c6c2]/60 border-r-0 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-bold cursor-pointer w-[95px] h-[42px] appearance-none"
                      style={{
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23111\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '12px',
                        paddingRight: '22px'
                      }}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      value={editPhoneBody}
                      onChange={(e) => setEditPhoneBody(e.target.value.replace(/[^\d\s-]/g, ''))}
                      className="flex-grow text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium h-[42px]"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>

                {/* Identification ID */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    {userRole === 'pilot' ? 'Pilot License / UAV ID' : 'Client Organization ID'}
                  </label>
                  <input
                    type="text"
                    value={editId}
                    onChange={(e) => setEditId(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                    placeholder={userRole === 'pilot' ? 'e.g. PILOT-UA-4091' : 'e.g. CLIENT-MISD-8821'}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-3 text-xs font-bold text-[#747874] bg-neutral-100 hover:bg-neutral-200 transition-colors uppercase tracking-wider rounded-none text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] transition-colors uppercase tracking-wider rounded-none text-center"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav Bar (Shared routing logic based on active role) */}
      <BottomNav />
    </div>
  );
}