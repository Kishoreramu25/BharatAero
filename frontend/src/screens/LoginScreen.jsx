import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Lock, CheckCircle, AlertTriangle, Mail, Eye, EyeOff, User } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';

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
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Unverified Email State
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timerId = setTimeout(() => {
      setResendTimer(resendTimer - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [resendTimer]);

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Google accounts are inherently verified
      handleSuccessfulLogin({
        name: user.displayName || 'Google User',
        email: user.email,
        uid: user.uid
      });
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    }
  };

  const handleSuccessfulLogin = (userData) => {
    setIsLoggedIn(true);
    setRegisteredUser(userData);
    
    if (userRole === 'pilot') {
      setCurrentScreen('pilot_dashboard');
    } else {
      setCurrentScreen('client_dashboard');
    }
  };

  const handleResendVerification = async () => {
    try {
      if (!auth.currentUser) return;
      await sendEmailVerification(auth.currentUser);
      setSuccessMsg('Verification email resent! Please check your inbox (and spam folder).');
      setResendTimer(60);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification email.');
    }
  };

  const handleAuthSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setShowResendVerification(false);

    if (authMode === 'signup') {
      if (!name.trim()) return setErrorMsg('Please enter your full name.');
      if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');
      if (!iAgree) return setErrorMsg('You must agree to the Terms.');
      
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Send the verification email immediately
        await sendEmailVerification(userCredential.user);
        
        // Do NOT log them in. Tell them to check email.
        setSuccessMsg(`Account created successfully! A verification link has been sent to ${email.trim()}. Please verify your email before signing in.`);
        setAuthMode('signin');
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setErrorMsg(err.message || 'Failed to create account.');
      } finally {
        setLoading(false);
      }
      
    } else {
      // For Sign In
      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        
        // Check if their email is verified!
        if (!userCredential.user.emailVerified) {
          setErrorMsg('Your email address is not verified yet. Please check your inbox for the verification link.');
          setShowResendVerification(true);
          return; // Stop the login process
        }

        // They are verified, let them in!
        handleSuccessfulLogin({
          name: userCredential.user.displayName || 'User',
          email: userCredential.user.email,
          uid: userCredential.user.uid
        });
      } catch (err) {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
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
          onClick={() => setCurrentScreen('role_selection')}
          className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-[#1b1c1b] cursor-pointer transition-all duration-200 hover:-translate-x-0.5 z-10 shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <main className="flex-grow px-5 -mt-10 mb-6 z-10 relative">
        <div className="bg-white border border-neutral-100 rounded-3xl shadow-xl shadow-neutral-950/[0.03] p-6 space-y-6 flex flex-col">

          {!loading && (
            <div className="bg-neutral-50 p-1 rounded-full flex border border-neutral-200/50">
              <button 
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMsg(''); setSuccessMsg(''); setShowResendVerification(false); }}
                className={`flex-grow py-3 px-4 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  authMode === 'signin' ? 'bg-[#ca0013] text-white shadow-md font-black transform scale-[1.01]' : 'text-neutral-500 bg-transparent hover:bg-neutral-100'
                }`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); setShowResendVerification(false); }}
                className={`flex-grow py-3 px-4 rounded-full text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  authMode === 'signup' ? 'bg-[#ca0013] text-white shadow-md font-black transform scale-[1.01]' : 'text-neutral-500 bg-transparent hover:bg-neutral-100'
                }`}
              >
                Create Account
              </button>
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
                  {showResendVerification && (
                    <button
                      type="button"
                      onClick={() => {
                        const domain = email.split('@')[1];
                        let mailLink = 'https://mail.google.com/';
                        if (domain) {
                          if (domain.includes('yahoo')) mailLink = 'https://mail.yahoo.com/';
                          else if (domain.includes('outlook') || domain.includes('hotmail')) mailLink = 'https://outlook.live.com/';
                        }
                        window.open(mailLink, '_blank');
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider py-2 px-3 rounded-lg w-full transition-colors bg-[#ca0013] text-white hover:bg-[#a3000b] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Mail size={14} />
                      Open Email App
                    </button>
                  )}
                </div>
              )}

              {authMode === 'signup' && (
                <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013]">
                  <User size={16} className="text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required={authMode === 'signup'}
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013]">
                <Mail size={16} className="text-neutral-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013]">
                <Lock size={16} className="text-neutral-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {authMode === 'signup' && (
                <div className="flex items-center gap-3 border border-neutral-200/60 bg-neutral-50/35 rounded-2xl px-4 py-3 focus-within:border-[#ca0013]">
                  <Lock size={16} className="text-neutral-400 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none"
                  />
                </div>
              )}

              {authMode === 'signup' && (
                <div className="flex items-start gap-3 pt-1">
                  <input 
                    type="checkbox" 
                    id="agreeProtocols" 
                    checked={iAgree}
                    onChange={(e) => setIAgree(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-red-200 text-[#ca0013]"
                  />
                  <label htmlFor="agreeProtocols" className="text-[10px] text-[#747874] leading-tight">
                    I agree to the Terms and Conditions and Privacy Policy.
                  </label>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button 
                  type="submit"
                  className="uiverse-btn bg-gradient-to-r from-[#ca0013] to-[#a3000b] text-white shadow-md active:scale-[0.99] border-0"
                >
                  <span className="btn-text">
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </span>
                </button>
              </div>

            </form>
          )}

          {!loading && (
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

        {!loading && (
          <div className="mt-4 text-center space-y-3">
            <button 
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setRegisteredUser({ name: 'Dev User', email: 'dev@example.com' });
                setCurrentScreen(userRole === 'pilot' ? 'pilot_dashboard' : 'client_dashboard');
              }}
              className="inline-block text-[10px] font-body text-neutral-300 hover:text-[#ca0013] bg-transparent border-0"
            >
              [Dev Bypass]
            </button>
          </div>
        )}

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
