import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Lock, CheckCircle, AlertTriangle, Mail, Eye, EyeOff, Key, User } from 'lucide-react';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Capacitor } from '@capacitor/core';

const sendResendEmail = async (toEmail, otpCode, recipientName) => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend API key is missing");
  }

  const payload = {
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Your Bharat Aero OTP Verification Code',
    html: `
      <div style="font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 10px; margin: 0; min-height: 100%;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          
          <!-- Premium Dark Banner Header -->
          <div style="background: linear-gradient(135deg, #121316 0%, #0a0a0b 100%); padding: 35px 20px; text-align: center; border-bottom: 3px solid #ca0013;">
            <!-- Logo Container -->
            <div style="display: inline-block; margin-bottom: 15px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" style="display: block; margin: 0 auto;">
                <path d="M12 28C12 16.9543 20.9543 8 32 8C43.0457 8 52 16.9543 52 28" stroke="#FF9933" stroke-width="4" stroke-linecap="round"/>
                <path d="M56 28C56 41.2548 45.2548 52 32 52C18.7452 52 8 41.2548 8 28" stroke="#128807" stroke-width="4" stroke-linecap="round"/>
                <circle cx="32" cy="28" r="8" stroke="#000080" stroke-width="1.5"/>
                <circle cx="32" cy="28" r="2" fill="#000080"/>
                <line x1="32" y1="20" x2="32" y2="36" stroke="#000080" stroke-width="0.75"/>
                <line x1="24" y1="28" x2="40" y2="28" stroke="#000080" stroke-width="0.75"/>
                <line x1="26.34" y1="22.34" x2="37.66" y2="33.66" stroke="#000080" stroke-width="0.75"/>
                <line x1="26.34" y1="33.66" x2="37.66" y2="22.34" stroke="#000080" stroke-width="0.75"/>
                <path d="M18 38H46" stroke="#FF9933" stroke-width="3" stroke-linecap="round"/>
                <path d="M22 42H42" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
                <path d="M26 46H38" stroke="#128807" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
            <!-- Logo Typography -->
            <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin: 0; font-family: sans-serif;">
              <span style="color: #ffffff;">Bharat</span> <span style="color: #128807;">Aero</span>
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
              Drone Flight Operations
            </div>
          </div>

          <!-- Email Content Body -->
          <div style="padding: 40px 30px; background-color: #ffffff; text-align: left;">
            <h3 style="font-size: 15px; color: #1f2937; margin-top: 0; margin-bottom: 12px; font-weight: 700; font-family: sans-serif;">
              Hello ${recipientName},
            </h3>
            <p style="font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
              Welcome to the secure flight portal of <strong>Bharat Aero</strong>. Please verify your identity using the verification code below to gain access to your drone operations dashboard:
            </p>

            <!-- OTP Card Pamphlet Style -->
            <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 1px solid #e5e7eb; border-left: 5px solid #ca0013; border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 30px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
              <span style="font-size: 10px; font-weight: 800; color: #ca0013; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px;">Security Passcode</span>
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #111827; font-family: 'Courier New', Courier, monospace; text-shadow: 1px 1px 1px rgba(0,0,0,0.05); display: inline-block; padding-left: 8px;">
                ${otpCode}
              </div>
              <span style="font-size: 11px; color: #6b7280; display: block; margin-top: 12px; font-weight: 500;">Valid for 10 minutes only</span>
            </div>

            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #f3f4f6; padding-top: 20px;">
              If you did not request this OTP, please disregard this transmission or contact Bharat Aero support immediately.
            </p>
          </div>

          <!-- Pamphlet Footer -->
          <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #f3f4f6;">
            <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">
              <span>Safe & Secure</span>
              <span style="color: #ca0013; font-size: 12px; margin: 0 4px;">•</span>
              <span>Proudly Made in India</span>
            </div>
            <p style="font-size: 9px; color: #d1d5db; margin: 8px 0 0 0;">
              © 2026 Bharat Aero Autonomous Systems. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `
  };

  // 1. Try local Vite dev proxy first (handles CORS bypass automatically)
  try {
    const response = await fetch('/api-resend/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) return true;
    
    // If not 2xx, log error
    const errText = await response.text();
    console.warn("Dev proxy returned error status, checking fallback...", errText);
  } catch (e) {
    console.warn("Dev proxy connection failed, trying direct API call...", e);
  }

  // 2. Direct API call fallback
  const directResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!directResponse.ok) {
    const errorData = await directResponse.json();
    throw new Error(errorData.message || `Resend Error Status: ${directResponse.status}`);
  }
  return true;
};

export default function LoginScreen() {
  const { setCurrentScreen, userRole, setIsLoggedIn, registeredUser, setRegisteredUser } = useApp();
  
  useEffect(() => {
    const initGoogle = async () => {
      try {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '585485498597-229j0qeck6c4m7bdv43cr5pdq117cr7e.apps.googleusercontent.com';
        await GoogleSignIn.initialize({
          clientId: googleClientId,
        });
      } catch (err) {
        console.warn('Google SDK init warning:', err);
      }
    };
    initGoogle();
  }, []);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [iAgree, setIAgree] = useState(true);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpHint, setShowOtpHint] = useState(false);

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await GoogleSignIn.signIn();
      console.log('Google Sign-In Success:', result);
      
      setIsLoggedIn(true);
      setRegisteredUser({
        name: result.name || result.givenName || 'Google User',
        email: result.email,
        password: 'google-oauth-session'
      });
      
      if (userRole === 'pilot') {
        setCurrentScreen('pilot_dashboard');
      } else {
        setCurrentScreen('client_dashboard');
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setErrorMsg('Google Sign-In failed. Please try again.');
    }
  };

  const handleAuthSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Pre-validate credentials before requesting OTP
    if (authMode === 'signin') {
      const cleanEmail = email.trim().toLowerCase();
      const regEmail = registeredUser.email ? registeredUser.email.toLowerCase() : '';
      
      if (regEmail && cleanEmail === regEmail && password === registeredUser.password) {
        // Valid registered credentials, proceed
      } else if (!regEmail && cleanEmail === 'pilot@misd-automation.com' && password === 'password123') {
        // Fallback default credentials if app context has not registered any user
        setRegisteredUser({ email: 'pilot@misd-automation.com', password: 'password123' });
      } else {
        setErrorMsg('Invalid email or password credentials. (Note: If this is a clean start, please Create Account first.)');
        return;
      }
    } else {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (!iAgree) {
        setErrorMsg('You must agree to the terms and conditions.');
        return;
      }
    }

    // Generate a secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    setOtpLoading(true);

    try {
      console.log(`%c[MISD SECURITY SERVICE] OTP Verification code for ${email} is: ${otpCode}`, "background: #222; color: #ca0013; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;");

      const recipientName = authMode === 'signup' ? name.trim() : (registeredUser.name || 'User');
      await sendResendEmail(email, otpCode, recipientName);
      
      setSuccessMsg('A 6-digit verification code has been sent to your email.');
      setIsOtpSent(true);
      setShowOtpHint(false);
    } catch (err) {
      console.warn("Failed to send real email via Resend:", err);
      setSuccessMsg('Simulated OTP sent! Look at the F12 developer console for the 6-digit code.');
      setIsOtpSent(true);
      setShowOtpHint(true);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Verify entered OTP
    if (enteredOtp === generatedOtp) {
      setIsLoggedIn(true);
      
      if (authMode === 'signup') {
        setRegisteredUser({
          name: name.trim(),
          email: email.trim(),
          password: password
        });
      }

      if (userRole === 'pilot') {
        setCurrentScreen('pilot_dashboard');
      } else {
        setCurrentScreen('client_dashboard');
      }
    } else {
      setErrorMsg('Incorrect verification code. Please check and try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full relative overflow-y-auto no-scrollbar select-none">
      
      {/* Top Banner with premium dark background to make white logo elements stand out */}
      <div className="h-[220px] rounded-b-[40px] bg-gradient-to-br from-[#121316] to-[#0a0a0b] border-b border-neutral-800/40 relative flex flex-col justify-center items-center shadow-sm shrink-0 overflow-hidden">
        <img 
          src="/logo.webp" 
          alt="MISD Logo Banner" 
          className="h-[135px] w-auto object-contain pointer-events-none -mt-5"
        />

        {/* Back Arrow Button */}
        <button 
          onClick={() => setCurrentScreen('role_selection')}
          className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-[#1b1c1b] cursor-pointer transition-all duration-200 hover:-translate-x-0.5 z-10 shadow-sm"
          title="Back to role selection"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Main Form Card - Overlapping top banner */}
      <main className="flex-grow px-5 -mt-10 mb-6 z-10 relative">
        <div className="bg-white border border-neutral-100 rounded-3xl shadow-xl shadow-neutral-950/[0.03] p-6 space-y-6 flex flex-col">
          
          {/* Segmented Auth Selector - Pill-shaped (only show if OTP not sent and not loading) */}
          {!isOtpSent && !otpLoading && (
            <div className="bg-neutral-50 p-1 rounded-full flex border border-neutral-200/50">
              <button 
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-grow py-3 px-4 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  authMode === 'signin' 
                  ? 'bg-[#ca0013] text-white shadow-md font-black transform scale-[1.01]' 
                  : 'text-neutral-500 bg-transparent hover:bg-neutral-100'
                }`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-grow py-3 px-4 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  authMode === 'signup' 
                  ? 'bg-[#ca0013] text-white shadow-md font-black transform scale-[1.01]' 
                  : 'text-neutral-500 bg-transparent hover:bg-neutral-100'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Loader State */}
          {otpLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-10 h-10 border-4 border-[#ca0013] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-headline font-bold text-[#747874] uppercase tracking-wider">Sending OTP Email...</p>
            </div>
          ) : isOtpSent ? (
            /* OTP verification form */
            <form onSubmit={handleOtpVerify} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">Verification Required</h2>
                <p className="text-[11px] text-[#747874] leading-relaxed">
                  We sent a 6-digit OTP code to <strong className="text-[#1b1c1b]">{email}</strong>.
                </p>
              </div>

              {/* Feedback messages */}
              {successMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-[#ca0013] text-[11px] text-[#ca0013] rounded-r-xl flex items-center gap-2">
                  <CheckCircle size={14} className="shrink-0 text-[#ca0013]" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-[#ca0013] text-[11px] text-[#ca0013] rounded-r-xl flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-[#ca0013]" />
                  <span className="font-bold">{errorMsg}</span>
                </div>
              )}

              {/* OTP Input Field */}
              <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-50 transition-all duration-300">
                <Key size={16} className="text-neutral-400 shrink-0" />
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-Digit OTP"
                  required
                  className="flex-grow bg-transparent border-0 text-center text-lg font-black tracking-[0.4em] text-[#1b1c1b] focus:outline-none placeholder-neutral-400 placeholder:tracking-normal p-0 pl-[0.4em]"
                />
              </div>

              {showOtpHint && (
                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200/50 p-2.5 rounded-xl text-center leading-normal">
                  💡 <strong>Simulator Alert:</strong> If you did not receive the email, please check your browser console (F12) for the code.
                </p>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button 
                  type="submit"
                  className="uiverse-btn bg-gradient-to-r from-[#ca0013] to-[#a3000b] hover:from-[#b80011] hover:to-[#8c0009] text-white shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/40 active:scale-[0.99] border-0"
                >
                  <span className="btn-text">Verify & Continue</span>
                  <span className="btn-icon-wrapper bg-white border-[3px] border-[#ca0013] text-[#ca0013]">
                    <svg width="14" height="16" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="1.61321" cy="1.61321" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="1.61321" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="5.5566" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="5.5566" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="9.5" r="1.5" fill="currentColor"></circle>
                      <circle cx="13.9811" cy="9.5" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="13.4434" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="13.4434" r="1.5" fill="currentColor"></circle>
                      <circle cx="1.61321" cy="17.3868" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="17.3868" r="1.5" fill="currentColor"></circle>
                    </svg>
                  </span>
                </button>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={handleAuthSubmit}
                    className="flex-1 py-3 px-4 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-[10px] font-headline font-bold uppercase tracking-wider text-[#747874] cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setEnteredOtp('');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="flex-1 py-3 px-4 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-[10px] font-headline font-bold uppercase tracking-wider text-[#747874] cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Main Form */
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Feedback messages */}
              {successMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-[#ca0013] text-[11px] text-[#ca0013] rounded-r-xl flex items-center gap-2">
                  <CheckCircle size={14} className="shrink-0 text-[#ca0013]" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-[#ca0013] text-[11px] text-[#ca0013] rounded-r-xl flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-[#ca0013]" />
                  <span className="font-bold">{errorMsg}</span>
                </div>
              )}

              {/* Full Name Field (only for signup) */}
              {authMode === 'signup' && (
                <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-50 transition-all duration-300 animate-fade-in">
                  <User size={16} className="text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400 p-0"
                  />
                </div>
              )}

              {/* Email Field with Left Icon */}
              <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-50 transition-all duration-300">
                <Mail size={16} className="text-neutral-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400 p-0"
                />
              </div>

              {/* Password Field with Left Icon and Right Eye Toggle */}
              <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-50 transition-all duration-300">
                <Lock size={16} className="text-neutral-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400 p-0"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-[#ca0013] cursor-pointer focus:outline-none transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirm Password (only for signup) */}
              {authMode === 'signup' && (
                <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-50 transition-all duration-300 animate-fade-in">
                  <Lock size={16} className="text-neutral-400 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400 p-0"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-400 hover:text-[#ca0013] cursor-pointer focus:outline-none transition-colors shrink-0"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {/* Checkbox Agreement (only for signup) */}
              {authMode === 'signup' && (
                <div className="flex items-start gap-3 pt-1 animate-fade-in">
                  <input 
                    type="checkbox" 
                    id="agreeProtocols" 
                    checked={iAgree}
                    onChange={(e) => setIAgree(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-red-200 text-[#ca0013] focus:ring-0 cursor-pointer accent-[#ca0013] bg-white transition-all shrink-0"
                  />
                  <label htmlFor="agreeProtocols" className="text-[10px] text-[#747874] leading-tight select-none">
                    I agree to the <span className="underline cursor-pointer text-[#ca0013] font-bold hover:opacity-85">terms and conditions</span> of flight operations.
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button 
                  type="submit"
                  className="uiverse-btn bg-gradient-to-r from-[#ca0013] to-[#a3000b] hover:from-[#b80011] hover:to-[#8c0009] text-white shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/40 active:scale-[0.99] border-0"
                >
                  <span className="btn-text">{authMode === 'signin' ? 'Sign In' : 'Register'}</span>
                  <span className="btn-icon-wrapper bg-white border-[3px] border-[#ca0013] text-[#ca0013]">
                    <svg width="14" height="16" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="1.61321" cy="1.61321" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="1.61321" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="5.5566" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="5.5566" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="9.5" r="1.5" fill="currentColor"></circle>
                      <circle cx="13.9811" cy="9.5" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="13.4434" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="13.4434" r="1.5" fill="currentColor"></circle>
                      <circle cx="1.61321" cy="17.3868" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="17.3868" r="1.5" fill="currentColor"></circle>
                    </svg>
                  </span>
                </button>
              </div>

            </form>
          )}

          {/* Social Logins - Only if OTP is not sent and not loading */}
          {!isOtpSent && !otpLoading && (
            <div className="pt-3 border-t border-red-100/50 space-y-4">
              <p className="text-[10px] font-headline font-bold text-[#ca0013]/60 uppercase tracking-wider text-center">
                Or continue with
              </p>
              
              <div className="flex justify-center">
                {/* Google login wide pill button */}
                <button 
                  type="button"
                  onClick={handleGoogleClick}
                  className="uiverse-btn bg-[#4285F4] text-white hover:bg-[#357ae8] shadow-md shadow-blue-200 hover:shadow-lg active:scale-[0.99] border-0"
                >
                  <span className="btn-text flex items-center justify-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48" className="shrink-0 bg-white p-0.5 rounded-full">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v9.09h12.75c-.53 2.64-2.01 4.88-4.27 6.42l6.64 5.15C43.01 36.19 46.5 30.64 46.5 24z"/>
                      <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-6.64-5.15c-1.85 1.24-4.22 1.99-6.85 1.99-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </span>
                  <span className="btn-icon-wrapper bg-white border-[3px] border-[#4285F4] text-[#4285F4]">
                    <svg width="14" height="16" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="1.61321" cy="1.61321" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="1.61321" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="5.5566" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="5.5566" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="9.5" r="1.5" fill="currentColor"></circle>
                      <circle cx="13.9811" cy="9.5" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="13.4434" r="1.5" fill="currentColor"></circle>
                      <circle cx="9.85851" cy="13.4434" r="1.5" fill="currentColor"></circle>
                      <circle cx="1.61321" cy="17.3868" r="1.5" fill="currentColor"></circle>
                      <circle cx="5.73583" cy="17.3868" r="1.5" fill="currentColor"></circle>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Toggle Link */}
        {!isOtpSent && !otpLoading && (
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="inline-block text-xs font-body text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer bg-transparent border-0 font-bold transition-colors duration-200"
            >
              {authMode === 'signin' ? 'New here? Create New Account' : 'Already have an account? Sign in'}
            </button>
          </div>
        )}

      </main>

      {/* Security Badges Footer - Curved layout */}
      <footer className="w-full py-5 border-t border-neutral-100 flex justify-center items-center gap-6 select-none bg-white text-[#747874] z-10 relative shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-black font-headline tracking-widest text-[#747874]">
          <Lock size={13} className="text-[#747874]" />
          <span>Safe & Secure</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-200"></div>
        <div className="flex items-center gap-1.5 text-[10px] font-black font-headline tracking-widest text-[#747874]">
          <span className="material-symbols-outlined text-[14px] font-bold text-[#747874]">verified_user</span>
          <span>Made in India</span>
        </div>
      </footer>
    </div>
  );
}
