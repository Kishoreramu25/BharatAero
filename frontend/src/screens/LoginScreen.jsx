import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Lock, CheckCircle, AlertTriangle, Mail, Eye, EyeOff, Key, User } from 'lucide-react';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '../utils/SecureStorage';


export default function LoginScreen() {
  const { setCurrentScreen, userRole, setIsLoggedIn, registeredUser, setRegisteredUser, t } = useApp();
  
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
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState(false); // shake animation trigger

  // Countdown timer effect
  useEffect(() => {
    if (otpTimer <= 0) return;
    const timerId = setTimeout(() => {
      setOtpTimer(otpTimer - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [otpTimer]);

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await GoogleSignIn.signIn();
      console.log('Google Sign-In Success:', result);
      
      setIsLoggedIn(true);
      setRegisteredUser({
        name: result.displayName || result.name || result.givenName || 'Google User',
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

    // Pre-validate credentials format before requesting OTP
    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password);
      
      if (password.length < 12 || !hasUppercase || !hasLowercase || !hasNumbers || !hasSpecial) {
        setErrorMsg('Password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters.');
        return;
      }

      if (!iAgree) {
        setErrorMsg('You must agree to the Terms, Privacy Policy, and data processing consent.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }
    }

    setOtpLoading(true);

    try {
      const isWeb = Capacitor.getPlatform() === 'web';
      const baseUrl = isWeb ? '' : 'http://localhost:5000';

      const initUrl = authMode === 'signup' 
        ? `${baseUrl}/api/auth/register/init` 
        : `${baseUrl}/api/auth/login/init`;
        
      const recipientName = authMode === 'signup' ? name.trim() : 'User';

      const response = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          name: recipientName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data.error && data.error.message) || data.message || 'Failed to send verification code.');
      }
      
      setSuccessMsg('A 6-digit verification code has been sent to your email.');
      setIsOtpSent(true);
      setShowOtpHint(false);
      setEnteredOtp('');
      setOtpError(false);
      setOtpTimer(300); // start 5-minute countdown
    } catch (err) {
      console.warn("Failed to request OTP:", err);
      setErrorMsg(err.message || 'Failed to request OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    setOtpLoading(true);
    try {
      const isWeb = Capacitor.getPlatform() === 'web';
      const baseUrl = isWeb ? '' : 'http://localhost:5000';
      
      const verifyUrl = authMode === 'signup' 
        ? `${baseUrl}/api/auth/register/verify` 
        : `${baseUrl}/api/auth/login/verify`;

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: enteredOtp,
          name: name.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data.error && data.error.message) || data.message || 'Verification failed');
      }

      if (data.token) {
        await SecureStorage.set({ key: 'bharataero_auth_token', value: data.token });
      }
      setRegisteredUser(data.user || { name: name.trim(), email: email.trim() });
      setIsLoggedIn(true);

      if (userRole === 'pilot') {
        setCurrentScreen('pilot_dashboard');
      } else {
        setCurrentScreen('client_dashboard');
      }
    } catch (err) {
      console.warn("OTP verification error:", err);
      setErrorMsg(err.message || 'Incorrect verification code. Please check and try again.');
      // Trigger shake animation on wrong OTP
      setOtpError(true);
      setTimeout(() => setOtpError(false), 600);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full relative overflow-y-auto no-scrollbar select-none">
      
      {/* Top Banner with premium dark background to make white logo elements stand out */}
      <div className="h-[220px] rounded-b-[40px] bg-gradient-to-br from-[#121316] to-[#0a0a0b] border-b border-neutral-800/40 relative flex flex-col justify-center items-center shadow-sm shrink-0 overflow-hidden">
        <img 
          src="/logo.webp" 
          alt="Bharat Aero Logo Banner" 
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
                {t('Sign In')}
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
                {t('Create Account')}
              </button>
            </div>
          )}

          {/* Loader State */}
          {otpLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-10 h-10 border-4 border-[#ca0013] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-headline font-bold text-[#747874] uppercase tracking-wider">{isOtpSent ? t('Verifying OTP...') : t('Sending OTP Email...')}</p>
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
              <div
                style={otpError ? { animation: 'otp-shake 0.5s ease' } : {}}
                className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all duration-300 ${
                  otpError
                    ? 'border-red-500 bg-red-50 ring-2 ring-red-100'
                    : 'border-neutral-200/60 bg-neutral-50/35 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-50'
                }`}
              >
                <Key size={16} className={`shrink-0 ${otpError ? 'text-red-400' : 'text-neutral-400'}`} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, '')); setOtpError(false); setErrorMsg(''); }}
                  placeholder="6-Digit OTP"
                  required
                  autoFocus
                  className="flex-grow bg-transparent border-0 text-center text-lg font-black tracking-[0.4em] text-[#1b1c1b] focus:outline-none placeholder-neutral-400 placeholder:tracking-normal p-0 pl-[0.4em]"
                />
              </div>

              {/* OTP Timer */}
              <div className="flex items-center justify-center gap-1.5">
                {otpTimer > 0 ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#ca0013] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p className="text-[11px] text-[#747874]">
                      Resend available in{' '}
                      <span className="font-black text-[#ca0013]">{otpTimer}s</span>
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-emerald-600 font-bold">✓ You can now request a new code</p>
                )}
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
                    onClick={otpTimer === 0 ? handleAuthSubmit : undefined}
                    disabled={otpTimer > 0}
                    className={`flex-1 py-3 px-4 border rounded-xl text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-300 ${
                      otpTimer > 0
                        ? 'border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed'
                        : 'border-[#ca0013]/30 hover:bg-red-50 text-[#ca0013] cursor-pointer'
                    }`}
                  >
                    {otpTimer > 0 ? `Resend (${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')})` : t('Resend Code')}
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
                    {t('Back to Login')}
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
                    placeholder={t('Full Name')}
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
                  placeholder={t('Email Address')}
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
                  placeholder={t('Password')}
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
                    placeholder={t('Confirm Password')}
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
                    I agree to the <span className="underline cursor-pointer text-[#ca0013] font-bold hover:opacity-85" onClick={() => setCurrentScreen('about')}>Terms and Conditions</span> and <span className="underline cursor-pointer text-[#ca0013] font-bold hover:opacity-85" onClick={() => setCurrentScreen('about')}>Privacy Policy</span>, and consent to the secure processing of my personal data under GDPR.
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button 
                  type="submit"
                  className="uiverse-btn bg-gradient-to-r from-[#ca0013] to-[#a3000b] hover:from-[#b80011] hover:to-[#8c0009] text-white shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/40 active:scale-[0.99] border-0"
                >
                  <span className="btn-text">{authMode === 'signin' ? t('Sign In') : t('Create Account')}</span>
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
                {t('Or continue with')}
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
                    <span>{t('Continue with Google')}</span>
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
          <div className="mt-4 text-center space-y-3">
            <button 
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="block w-full text-xs font-body text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer bg-transparent border-0 font-bold transition-colors duration-200"
            >
              {authMode === 'signin' ? t('New here? Create New Account') : t('Already have an account? Sign in')}
            </button>

            {/* Dev Bypass Button */}
            <button 
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setRegisteredUser({ name: 'Dev User', email: 'dev@example.com' });
                if (userRole === 'pilot') {
                  setCurrentScreen('pilot_dashboard');
                } else {
                  setCurrentScreen('client_dashboard');
                }
              }}
              className="inline-block text-[10px] font-body text-neutral-300 hover:text-[#ca0013] cursor-pointer bg-transparent border-0 transition-colors duration-200"
            >
              [Dev Bypass]
            </button>
          </div>
        )}

      </main>

      {/* Security Badges Footer - Curved layout */}
      <footer className="w-full py-5 border-t border-neutral-100 flex justify-center items-center gap-6 select-none bg-white text-[#747874] z-10 relative shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-black font-headline tracking-widest text-[#747874]">
          <Lock size={13} className="text-[#747874]" />
          <span>{t('Safe & Secure')}</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-200"></div>
        <div className="flex items-center gap-1.5 text-[10px] font-black font-headline tracking-widest text-[#747874]">
          <span className="material-symbols-outlined text-[14px] font-bold text-[#747874]">verified_user</span>
          <span>{t('Made in India')}</span>
        </div>
      </footer>
    </div>
  );
}
