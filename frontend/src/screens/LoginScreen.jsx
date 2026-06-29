import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Lock, CheckCircle, AlertTriangle, Mail, Eye, EyeOff, User } from 'lucide-react';
import { supabase } from '../supabase';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { 
  upsertUser, 
  getUserByEmail, 
  getSafeErrorMessage, 
  sendEmailOtp,
  verifyEmailOtp,
  sendPhoneChangeOtp,
  verifyPhoneChangeOtp
} from '../supabaseQueries';

export default function LoginScreen() {
  const { setCurrentScreen, userRole, setIsLoggedIn, setRegisteredUser, t } = useApp();
  
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup' or 'forgot_password'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [iAgreeTerms, setIAgreeTerms] = useState(false);
  const [iAgreePrivacy, setIAgreePrivacy] = useState(false);

  // Inline Verification States
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');

  // Password Reset States
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetResendTimer, setResetResendTimer] = useState(0);

  // Timers
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (emailResendTimer > 0) {
      const timer = setTimeout(() => setEmailResendTimer(emailResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailResendTimer]);

  useEffect(() => {
    if (phoneResendTimer > 0) {
      const timer = setTimeout(() => setPhoneResendTimer(phoneResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneResendTimer]);

  useEffect(() => {
    if (resetResendTimer > 0) {
      const timer = setTimeout(() => setResetResendTimer(resetResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resetResendTimer]);

  const validateEmail = (emailStr) => {
    const lowerEmail = emailStr.trim().toLowerCase();
    const re = /^[a-z0-9._%+-]+@gmail\.com$/;
    return re.test(lowerEmail);
  };

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  
  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['bg-red-400', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let uid, userName, userEmail;
      
      if (Capacitor.isNativePlatform()) {
        await GoogleSignIn.initialize({
          clientId: '585485498597-229j0qeck6c4m7bdv43cr5pdq117cr7e.apps.googleusercontent.com'
        });
        const result = await GoogleSignIn.signIn();
        
        userName = result.displayName || result.givenName || 'Google User';
        userEmail = result.email;
        
        if (result.idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: result.idToken
          });
          if (error) throw error;
          uid = data.user.id;
        } else {
          throw new Error('No ID token received from Google.');
        }

      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) throw error;
        return;
      }
      
      try {
        const existingUser = await getUserByEmail(userEmail);
        if (!existingUser) {
          await upsertUser(uid, userEmail, userName, userRole || 'client');
        }
      } catch (dbError) {
        console.error("Supabase upsert/fetch error:", dbError);
      }
      
      await handleSuccessfulLogin({ name: userName, email: userEmail, uid });
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setErrorMsg(getSafeErrorMessage(err));
    }
  };

  const handleSuccessfulLogin = async (userData) => {
    try {
      const dbUser = await getUserByEmail(userData.email);
      const fullUser = dbUser || { ...userData, id: userData.uid || userData.id };
      
      setRegisteredUser(fullUser);
      setIsLoggedIn(true);
      
      if (userRole === 'pilot' || (fullUser && fullUser.role === 'pilot')) {
        setCurrentScreen('pilot_dashboard');
      } else {
        setCurrentScreen('client_dashboard');
      }
    } catch (err) {
      console.error("Failed to fetch full profile on login", err);
      setRegisteredUser({ ...userData, id: userData.uid || userData.id });
      setIsLoggedIn(true);
      setCurrentScreen(userRole === 'pilot' ? 'pilot_dashboard' : 'client_dashboard');
    }
  };

  // ------------------------------------------------------------------
  // INLINE VERIFICATION LOGIC
  // ------------------------------------------------------------------

  const handleSendEmailOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!validateEmail(email)) {
      return setErrorMsg('Please enter a valid @gmail.com address before verifying.');
    }
    setLoading(true);
    try {
      await sendEmailOtp(email.trim());
      setSuccessMsg(`Email OTP sent to ${email.trim()}.`);
      setShowEmailOtpInput(true);
      setEmailResendTimer(60);
    } catch (err) {
      setErrorMsg(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!emailOtpCode.trim()) return setErrorMsg('Enter the email OTP.');
    
    setLoading(true);
    try {
      const { data } = await verifyEmailOtp(email.trim(), emailOtpCode.trim(), 'email');
      if (data?.user) {
        setEmailVerified(true);
        setShowEmailOtpInput(false);
        setSuccessMsg('Email verified successfully!');
      }
    } catch (err) {
      setErrorMsg(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!emailVerified) {
      return setErrorMsg('Please verify your email first before verifying your phone.');
    }
    if (!phone.trim()) {
      return setErrorMsg('Please enter your phone number.');
    }
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phone.trim()}`;
      await sendPhoneChangeOtp(fullPhone);
      setSuccessMsg(`Phone OTP sent to ${fullPhone}.`);
      setShowPhoneOtpInput(true);
      setPhoneResendTimer(60);
    } catch (err) {
      setErrorMsg(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!phoneOtpCode.trim()) return setErrorMsg('Enter the phone OTP.');
    
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phone.trim()}`;
      const { data } = await verifyPhoneChangeOtp(fullPhone, phoneOtpCode.trim());
      if (data?.user) {
        setPhoneVerified(true);
        setShowPhoneOtpInput(false);
        setSuccessMsg('Phone verified successfully!');
      }
    } catch (err) {
      setErrorMsg(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // PASSWORD RESET LOGIC
  // ------------------------------------------------------------------

  const handleSendResetOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!validateEmail(email)) return setErrorMsg('Enter a valid @gmail.com address.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSuccessMsg(`Reset OTP sent to ${email.trim()}.`);
      setResetStep(2);
      setResetResendTimer(60);
    } catch (err) {
      setErrorMsg(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!resetOtpCode.trim()) return setErrorMsg('Enter the reset OTP.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: resetOtpCode.trim(),
        type: 'recovery'
      });
      if (error) throw error;
      setSuccessMsg('OTP verified! Enter your new password.');
      setResetStep(3);
    } catch (err) {
      setErrorMsg(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!password) return setErrorMsg('Please enter a new password.');
    if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');
    if (getPasswordStrength(password) < 4) return setErrorMsg('Your password is not strong enough.');
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      
      setSuccessMsg('Password updated successfully! You can now log in.');
      setTimeout(() => switchMode('signin'), 2000);
    } catch (err) {
      setErrorMsg(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // MAIN SUBMIT LOGIC
  // ------------------------------------------------------------------

  const handleAuthSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (authMode === 'forgot_password') {
      if (resetStep === 1) await handleSendResetOtp();
      else if (resetStep === 2) await handleVerifyResetOtp();
      else if (resetStep === 3) await handleUpdatePassword();
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) return setErrorMsg('Please enter your full name.');
      if (!emailVerified) return setErrorMsg('Please verify your email address.');
      if (!phoneVerified) return setErrorMsg('Please verify your phone number.');
      if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');
      if (getPasswordStrength(password) < 4) return setErrorMsg('Your password is not strong enough.');
      if (!iAgreeTerms || !iAgreePrivacy) return setErrorMsg('You must agree to the Terms and Privacy Policy.');
      
      setLoading(true);
      try {
        // User is technically already created and logged in via the Email OTP step.
        // We just need to set their password now.
        const { data, error } = await supabase.auth.updateUser({
          password: password,
          data: {
            name: name.trim(),
            role: userRole || 'client'
          }
        });
        
        if (error) throw error;

        // Upsert into our custom public.users table
        if (data?.user) {
          await upsertUser(
            data.user.id,
            data.user.email,
            name.trim(),
            userRole || 'client',
            `${countryCode}${phone.trim()}`
          );
          
          await handleSuccessfulLogin({
            name: name.trim(),
            email: data.user.email,
            uid: data.user.id
          });
        }
      } catch (err) {
        setErrorMsg(getSafeErrorMessage(err));
      } finally {
        setLoading(false);
      }
      
    } else {
      // SIGN IN
      if (!validateEmail(email)) return setErrorMsg('Enter a valid @gmail.com address.');
      if (!password) return setErrorMsg('Please enter your password.');
      
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });
        
        if (error) {
          throw error;
        }

        await handleSuccessfulLogin({
          name: data.user.user_metadata?.name || 'User',
          email: data.user.email,
          uid: data.user.id
        });
      } catch (err) {
        setErrorMsg(getSafeErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');
    setSuccessMsg('');
    setEmailVerified(false);
    setPhoneVerified(false);
    setShowEmailOtpInput(false);
    setShowPhoneOtpInput(false);
    setEmailOtpCode('');
    setPhoneOtpCode('');
    setEmailResendTimer(0);
    setPhoneResendTimer(0);
    
    setResetStep(1);
    setResetOtpCode('');
    setResetResendTimer(0);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full relative overflow-y-auto no-scrollbar select-none">
      
      {/* Top Banner */}
      <div className="h-[220px] rounded-b-[40px] bg-gradient-to-br from-[#121316] to-[#0a0a0b] border-b border-neutral-800/40 relative flex flex-col justify-center items-center shadow-sm shrink-0 overflow-hidden">
        <img 
          src="/logo.webp" 
          alt="Bharat Aero Logo Banner" 
          className="h-[135px] w-auto object-contain pointer-events-none -mt-5"
        />
        <button 
          onClick={() => {
            if (authMode === 'forgot_password') {
              switchMode('signin');
            } else {
              setCurrentScreen('role_selection');
            }
          }}
          className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-[#1b1c1b] cursor-pointer transition-all duration-200 hover:-translate-x-0.5 z-10 shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <main className="flex-grow px-5 -mt-10 mb-6 z-10 relative">
        <div className="bg-white border border-neutral-100 rounded-3xl shadow-xl shadow-neutral-950/[0.03] p-6 space-y-6 flex flex-col">

          {/* TOGGLES (Hidden during forgot_password) */}
          {!loading && authMode !== 'forgot_password' && (
            <div className="bg-neutral-50 p-1 rounded-full flex border border-neutral-200/50 mb-3">
              <button 
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-grow py-3 px-4 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  authMode === 'signin' ? 'bg-gradient-to-r from-[#ca0013] to-[#a3000b] text-white shadow-md font-black transform scale-[1.01]' : 'text-neutral-500 bg-transparent hover:bg-neutral-100'
                }`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-grow py-3 px-4 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  authMode === 'signup' ? 'bg-gradient-to-r from-[#ca0013] to-[#a3000b] text-white shadow-md font-black transform scale-[1.01]' : 'text-neutral-500 bg-transparent hover:bg-neutral-100'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD HEADER */}
          {authMode === 'forgot_password' && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-headline font-black text-[#ca0013] tracking-wider uppercase mb-1">Reset Password</h2>
              <p className="text-[11px] text-[#747874]">
                {resetStep === 1 && "Enter your email to receive a secure OTP code."}
                {resetStep === 2 && "Enter the 6-digit code sent to your email."}
                {resetStep === 3 && "Create a new strong password for your account."}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-10 h-10 border-4 border-[#ca0013] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-headline font-bold text-[#747874] uppercase tracking-wider">Processing...</p>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {successMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-[#ca0013] text-[11px] text-[#ca0013] rounded-r-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="shrink-0 text-[#ca0013]" />
                    <span className="font-bold">{successMsg}</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border-l-4 border-[#ca0013] text-[11px] text-[#ca0013] rounded-r-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0 text-[#ca0013]" />
                    <span className="font-bold">{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* NAME - Only in Signup */}
              {authMode === 'signup' && (
                <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013]">
                  <User size={16} className="text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400/70"
                  />
                </div>
              )}

              {/* EMAIL - Signup, Signin, and Forgot Password Step 1 & 2 */}
              {(authMode !== 'forgot_password' || resetStep < 3) && (
                <div className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-colors ${emailVerified && authMode === 'signup' ? 'border-green-400 bg-green-50/30' : 'border-neutral-200/60 bg-neutral-50/35 focus-within:border-[#ca0013]'}`}>
                  <Mail size={16} className={emailVerified && authMode === 'signup' ? 'text-green-500' : 'text-neutral-400'} shrink-0 />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    readOnly={(emailVerified && authMode === 'signup') || (authMode === 'forgot_password' && resetStep === 2)}
                    className={`flex-grow bg-transparent border-0 text-xs focus:outline-none placeholder-neutral-400/70 ${emailVerified && authMode === 'signup' ? 'text-green-700 font-bold' : 'text-[#1b1c1b]'}`}
                  />
                  
                  {/* Inline Verification inside Signup */}
                  {authMode === 'signup' && !emailVerified && !showEmailOtpInput && (
                    <button type="button" onClick={handleSendEmailOtp} className="text-[10px] bg-[#ca0013] hover:bg-[#a3000b] text-white px-3 py-1.5 rounded-full font-bold transition-transform active:scale-95 cursor-pointer">
                      Verify
                    </button>
                  )}
                  {authMode === 'signup' && !emailVerified && showEmailOtpInput && (
                    <button 
                      type="button" 
                      onClick={emailResendTimer > 0 ? undefined : handleSendEmailOtp} 
                      className={`text-[10px] px-3 py-1.5 rounded-full font-bold transition-all ${emailResendTimer > 0 ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-[#ca0013] hover:bg-[#a3000b] text-white active:scale-95 cursor-pointer'}`}
                    >
                      {emailResendTimer > 0 ? `Resend (${emailResendTimer}s)` : 'Resend'}
                    </button>
                  )}
                  {authMode === 'signup' && emailVerified && (
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                  )}

                  {/* Reset Password Step 2 (Resend logic) */}
                  {authMode === 'forgot_password' && resetStep === 2 && (
                    <button 
                      type="button" 
                      onClick={resetResendTimer > 0 ? undefined : handleSendResetOtp} 
                      className={`text-[10px] px-3 py-1.5 rounded-full font-bold transition-all ${resetResendTimer > 0 ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-[#ca0013] hover:bg-[#a3000b] text-white active:scale-95 cursor-pointer'}`}
                    >
                      {resetResendTimer > 0 ? `Resend (${resetResendTimer}s)` : 'Resend'}
                    </button>
                  )}
                </div>
              )}

              {/* EMAIL OTP INPUT - Signup */}
              {authMode === 'signup' && showEmailOtpInput && (
                <div className="flex items-center gap-3 border border-[#ca0013]/40 bg-red-50/20 rounded-2xl px-4 py-3">
                  <input
                    type="text"
                    value={emailOtpCode}
                    onChange={(e) => setEmailOtpCode(e.target.value)}
                    placeholder="OTP"
                    maxLength={6}
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none tracking-widest font-mono placeholder-neutral-400/70"
                  />
                  <button type="button" onClick={handleVerifyEmailOtp} className="text-[10px] bg-[#ca0013] text-white px-3 py-1.5 rounded-full font-bold transition-transform active:scale-95 cursor-pointer hover:bg-[#a3000b]">
                    Submit
                  </button>
                </div>
              )}

              {/* RESET PASSWORD OTP INPUT - Forgot Password Step 2 */}
              {authMode === 'forgot_password' && resetStep === 2 && (
                <div className="flex items-center gap-3 border border-[#ca0013]/40 bg-red-50/20 rounded-2xl px-4 py-3">
                  <input
                    type="text"
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value)}
                    placeholder="OTP"
                    maxLength={6}
                    required
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none tracking-widest font-mono placeholder-neutral-400/70"
                  />
                </div>
              )}

              {/* PHONE - Only in Signup */}
              {authMode === 'signup' && (
                <>
                  <div className={`flex items-center gap-2 transition-colors`}>
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={phoneVerified || !emailVerified}
                      className="bg-neutral-50/35 border border-neutral-200/60 rounded-2xl px-2 py-3 text-xs text-[#1b1c1b] focus:outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                    </select>
                    
                    <div className={`flex-1 flex items-center gap-3 border rounded-2xl px-4 py-3 ${phoneVerified ? 'border-green-400 bg-green-50/30' : 'border-neutral-200/60 bg-neutral-50/35 focus-within:border-[#ca0013]'}`}>
                      <span className={`material-symbols-outlined shrink-0 text-[16px] ${phoneVerified ? 'text-green-500' : 'text-neutral-400'}`}>call</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Phone"
                        required
                        readOnly={phoneVerified || !emailVerified}
                        className={`flex-grow bg-transparent border-0 text-xs focus:outline-none placeholder-neutral-400/70 ${phoneVerified ? 'text-green-700 font-bold' : 'text-[#1b1c1b]'} ${!emailVerified ? 'opacity-50' : ''}`}
                      />
                      {emailVerified && !phoneVerified && !showPhoneOtpInput && (
                        <button type="button" onClick={handleSendPhoneOtp} className="text-[10px] bg-[#ca0013] hover:bg-[#a3000b] text-white px-3 py-1.5 rounded-full font-bold transition-transform active:scale-95 cursor-pointer">
                          Verify
                        </button>
                      )}
                      {emailVerified && !phoneVerified && showPhoneOtpInput && (
                        <button 
                          type="button" 
                          onClick={phoneResendTimer > 0 ? undefined : handleSendPhoneOtp} 
                          className={`text-[10px] px-3 py-1.5 rounded-full font-bold transition-all ${phoneResendTimer > 0 ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-[#ca0013] hover:bg-[#a3000b] text-white active:scale-95 cursor-pointer'}`}
                        >
                          {phoneResendTimer > 0 ? `Resend (${phoneResendTimer}s)` : 'Resend'}
                        </button>
                      )}
                      {phoneVerified && (
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* PHONE OTP INPUT */}
                  {showPhoneOtpInput && (
                    <div className="flex items-center gap-3 border border-[#ca0013]/40 bg-red-50/20 rounded-2xl px-4 py-3">
                      <input
                        type="text"
                        value={phoneOtpCode}
                        onChange={(e) => setPhoneOtpCode(e.target.value)}
                        placeholder="OTP"
                        maxLength={6}
                        className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none tracking-widest font-mono placeholder-neutral-400/70"
                      />
                      <button type="button" onClick={handleVerifyPhoneOtp} className="text-[10px] bg-[#ca0013] text-white px-3 py-1.5 rounded-full font-bold transition-transform active:scale-95 cursor-pointer hover:bg-[#a3000b]">
                        Submit
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* PASSWORD - Signup, Signin, Reset Step 3 */}
              {(authMode !== 'forgot_password' || resetStep === 3) && (
                <>
                  <div className={`flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013] ${authMode === 'signup' && (!emailVerified || !phoneVerified) ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Lock size={16} className="text-neutral-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={resetStep === 3 ? "New Password" : "Password"}
                      required
                      className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400/70"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  {((authMode === 'signup' && password.length > 0 && emailVerified && phoneVerified) || (resetStep === 3 && password.length > 0)) && (
                    <div className="flex flex-col gap-1.5 px-2 pt-1 pb-1">
                      <div className="flex gap-1 h-1.5">
                        {[1,2,3,4,5].map((level) => (
                          <div key={level} className={`flex-1 rounded-full ${strengthScore >= level ? strengthColors[strengthScore] : 'bg-neutral-200'}`} />
                        ))}
                      </div>
                      <p className={`text-[10px] font-bold ${strengthScore >= 3 ? 'text-green-600' : 'text-orange-500'}`}>
                        Strength: {strengthLabels[strengthScore]}
                      </p>
                    </div>
                  )}

                  {authMode === 'signin' && (
                    <div className="flex justify-end pt-0.5 pb-1 pr-2">
                      <button 
                        type="button" 
                        onClick={() => switchMode('forgot_password')}
                        className="text-[10px] font-bold text-[#ca0013] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* CONFIRM PASSWORD - Signup and Reset Step 3 */}
              {(authMode === 'signup' || (authMode === 'forgot_password' && resetStep === 3)) && (
                <div className={`flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013] ${(authMode === 'signup' && (!emailVerified || !phoneVerified)) ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Lock size={16} className="text-neutral-400 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400/70"
                  />
                </div>
              )}

              {/* CHECKBOXES - Only in Signup */}
              {authMode === 'signup' && (
                <div className={`flex flex-col gap-2 pt-1 ${(!emailVerified || !phoneVerified) ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="agreeTerms" 
                      checked={iAgreeTerms}
                      onChange={(e) => setIAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-red-200 text-[#ca0013]"
                    />
                    <label htmlFor="agreeTerms" className="text-[10px] text-[#747874] leading-tight">
                      I agree to the <button type="button" onClick={() => setCurrentScreen('terms')} className="text-[#ca0013] font-bold hover:underline">Terms of Service</button>.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="agreePrivacy" 
                      checked={iAgreePrivacy}
                      onChange={(e) => setIAgreePrivacy(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-red-200 text-[#ca0013]"
                    />
                    <label htmlFor="agreePrivacy" className="text-[10px] text-[#747874] leading-tight">
                      I agree to the <button type="button" onClick={() => setCurrentScreen('privacy')} className="text-[#ca0013] font-bold hover:underline">Privacy Policy</button>.
                    </label>
                  </div>
                </div>
              )}

              {/* MAIN SUBMIT BUTTON */}
              <div className="space-y-3 pt-2">
                <button 
                  type="submit"
                  disabled={authMode === 'signup' && (!emailVerified || !phoneVerified)}
                  className="uiverse-btn bg-gradient-to-r from-[#ca0013] to-[#a3000b] text-white shadow-md active:scale-[0.99] border-0 disabled:opacity-50 disabled:active:scale-100"
                >
                  <span className="btn-text">
                    {authMode === 'signin' ? 'Sign In' : 
                     authMode === 'signup' ? 'Create Account' : 
                     (resetStep === 1 ? 'Send OTP' : resetStep === 2 ? 'Verify OTP' : 'Update Password')}
                  </span>
                </button>
              </div>

            </form>
          )}

          {!loading && authMode !== 'forgot_password' && (
            <div className="pt-3 border-t border-red-100/50 space-y-4">
              <p className="text-[10px] font-headline font-bold text-[#ca0013]/60 uppercase tracking-wider text-center">
                Or continue with
              </p>
              
              <div className="flex justify-center">
                <button 
                  type="button"
                  onClick={handleGoogleClick}
                  className="uiverse-btn bg-[#4285F4] text-white shadow-md active:scale-[0.99] border-0"
                >
                  <span className="btn-text flex items-center justify-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48" className="bg-white p-0.5 rounded-full">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v9.09h12.75c-.53 2.64-2.01 4.88-4.27 6.42l6.64 5.15C43.01 36.19 46.5 30.64 46.5 24z"/>
                      <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-6.64-5.15c-1.85 1.24-4.22 1.99-6.85 1.99-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="w-full py-5 border-t border-neutral-100 flex justify-center items-center gap-6 bg-white text-[#747874] z-10 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-black font-headline tracking-widest">
          <Lock size={13} />
          <span>Safe & Secure</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-200"></div>
        <div className="flex items-center gap-1.5 text-[10px] font-black font-headline tracking-widest">
          <span className="material-symbols-outlined text-[14px] font-bold">verified_user</span>
          <span>Made in India</span>
        </div>
      </footer>
    </div>
  );
}
