import React from 'react';

import BottomNav from '../components/BottomNav';

import { useApp } from '../context/AppContext';
import { SecureStorage } from '../utils/SecureStorage';

import { 

  ArrowLeft, ShieldAlert, User, Lock, Key, Bell, 

  Globe, Sun, Moon, Shield, FileText, LifeBuoy, LogOut, X, Search

} from 'lucide-react';



const countryCodes = [

  { code: '+91', flag: 'Ã°ÂÂÂ®Ã°ÂÂÂ³', label: 'India' },

  { code: '+1', flag: 'Ã°ÂÂÂºÃ°ÂÂÂ¸', label: 'USA' },

  { code: '+44', flag: 'Ã°ÂÂÂ¬Ã°ÂÂÂ§', label: 'UK' },

  { code: '+971', flag: 'Ã°ÂÂÂ¦Ã°ÂÂÂª', label: 'UAE' },

  { code: '+65', flag: 'Ã°ÂÂÂ¸Ã°ÂÂÂ¬', label: 'Singapore' },

  { code: '+61', flag: 'Ã°ÂÂÂ¦Ã°ÂÂÂº', label: 'Australia' }

];



const indianLanguages = [

  { name: 'English', nativeName: 'English', region: 'Global / India' },

  { name: 'Hindi', nativeName: 'Ã Â¤Â¹Ã Â¤Â¿Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â¦Ã Â¥Â', region: 'North India' },

  { name: 'Bengali', nativeName: 'Ã Â¦Â¬Ã Â¦Â¾Ã Â¦ÂÃ Â¦Â²Ã Â¦Â¾', region: 'East India / West Bengal' },

  { name: 'Marathi', nativeName: 'Ã Â¤Â®Ã Â¤Â°Ã Â¤Â¾Ã Â¤Â Ã Â¥Â', region: 'West India / Maharashtra' },

  { name: 'Telugu', nativeName: 'Ã Â°Â¤Ã Â±ÂÃ Â°Â²Ã Â±ÂÃ Â°ÂÃ Â±Â', region: 'South India / Andhra Pradesh & Telangana' },

  { name: 'Tamil', nativeName: 'Ã Â®Â¤Ã Â®Â®Ã Â®Â¿Ã Â®Â´Ã Â¯Â', region: 'South India / Tamil Nadu' },

  { name: 'Gujarati', nativeName: 'Ã ÂªÂÃ Â«ÂÃ ÂªÂÃ ÂªÂ°Ã ÂªÂ¾Ã ÂªÂ¤Ã Â«Â', region: 'West India / Gujarat' },

  { name: 'Urdu', nativeName: 'ÃÂ§ÃÂ±ÃÂ¯ÃÂ', region: 'Pan-India' },

  { name: 'Kannada', nativeName: 'Ã Â²ÂÃ Â²Â¨Ã Â³ÂÃ Â²Â¨Ã Â²Â¡', region: 'South India / Karnataka' },

  { name: 'Odia', nativeName: 'Ã Â¬ÂÃ Â¬Â¡Ã Â¬Â¼Ã Â¬Â¿Ã Â¬Â', region: 'East India / Odisha' },

  { name: 'Malayalam', nativeName: 'Ã Â´Â®Ã Â´Â²Ã Â´Â¯Ã Â´Â¾Ã Â´Â³Ã Â´Â', region: 'South India / Kerala' },

  { name: 'Punjabi', nativeName: 'Ã Â¨ÂªÃ Â©Â°Ã Â¨ÂÃ Â¨Â¾Ã Â¨Â¬Ã Â©Â', region: 'North India / Punjab' },

  { name: 'Assamese', nativeName: 'Ã Â¦ÂÃ Â¦Â¸Ã Â¦Â®Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¼Ã Â¦Â¾', region: 'Northeast India / Assam' },

  { name: 'Maithili', nativeName: 'Ã Â¤Â®Ã Â¥ÂÃ Â¤Â¥Ã Â¤Â¿Ã Â¤Â²Ã Â¥Â', region: 'East India / Bihar' },

  { name: 'Santali', nativeName: 'Ã¡Â±Â¥Ã¡Â±ÂÃ¡Â±Â±Ã¡Â±ÂÃ¡Â±ÂÃ¡Â±Â²Ã¡Â±Â¤', region: 'East India / Jharkhand & Odisha' },

  { name: 'Kashmiri', nativeName: 'Ã Â¤ÂÃ Â¥ÂÃ Â¤Â¶Ã Â¥ÂÃ Â¤Â° / ÃÂÃ Â¥ÂÃ Â¤Â¶Ã Â¥ÂÃ Â¤Â°', region: 'North India / Jammu & Kashmir' },

  { name: 'Nepali', nativeName: 'Ã Â¤Â¨Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â¾Ã Â¤Â²Ã Â¥Â', region: 'North India / Sikkim & West Bengal' },

  { name: 'Gondi', nativeName: 'Ã Â¤ÂÃ Â¥ÂÃ Â¤ÂÃ Â¤Â¡Ã Â¥Â', region: 'Central India' },

  { name: 'Konkani', nativeName: 'Ã Â¤ÂÃ Â¥ÂÃ Â¤ÂÃ Â¤ÂÃ Â¤Â£Ã Â¥Â', region: 'West India / Goa' },

  { name: 'Dogri', nativeName: 'Ã Â¤Â¡Ã Â¥ÂÃ Â¤ÂÃ Â¤Â°Ã Â¥Â', region: 'North India / Jammu & Kashmir' },

  { name: 'Manipuri', nativeName: 'à¦®à§à¦¤à§à¦²à§à¦¨à§ / à¦®à§à¦¤à¦¿à¦à¦²à§à¦¨', region: 'Northeast India / Manipur' },
  { name: 'Bodo', nativeName: 'à¤¬à¤¡à¤¼à¥', region: 'Northeast India / Assam' },
  { name: 'Sanskrit', nativeName: 'à¤¸à¤à¤¸à¥à¤à¥à¤¤à¤®à¥', region: 'Pan-India / Classical' },
  { name: 'Sindhi', nativeName: 'à¤¸à¤¿à¤¨à¥à¤§à¥', region: 'Pan-India' }
];

export default function SettingsScreen() {

  const { 

    theme, setTheme, userRole, 

    logout, navigate, activeTab, registeredUser, setRegisteredUser,

    sendResendEmail, selectedLanguage, setSelectedLanguage, autoOpenProfileModal, setAutoOpenProfileModal, t

  } = useApp();



  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  const [isSelectingLanguage, setIsSelectingLanguage] = React.useState(false);

  const [languageSearchQuery, setLanguageSearchQuery] = React.useState('');

  const [showToast, setShowToast] = React.useState(false);

  const [toastTitle, setToastTitle] = React.useState('');

  const [toastMessage, setToastMessage] = React.useState('');

  const [contactName, setContactName] = React.useState('');

  const [contactEmail, setContactEmail] = React.useState('');

  const [contactQuery, setContactQuery] = React.useState('');



  // Advanced Profile States

  const [isEditingAdvancedProfile, setIsEditingAdvancedProfile] = React.useState(false);

  const [editAdvName, setEditAdvName] = React.useState('');

  const [editAdvBio, setEditAdvBio] = React.useState('');

  const [editAdvDob, setEditAdvDob] = React.useState('');

  const [editAdvInsta, setEditAdvInsta] = React.useState('');

  const [editAdvLinkedin, setEditAdvLinkedin] = React.useState('');

  const [editAdvOther, setEditAdvOther] = React.useState('');

  const [editAdvProfilePic, setEditAdvProfilePic] = React.useState('');

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

    setEditEmail(registeredUser?.email || '');

    

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

    const originalEmail = registeredUser?.email || '';
    const originalPhone = registeredUser?.phone || (userRole === 'pilot' ? '+91 98765 43210' : '+91 87654 32109');
    const editPhone = (selectedCountryCode + ' ' + editPhoneBody.trim()).trim();
    const emailChanged = editEmail.trim().toLowerCase() !== originalEmail.toLowerCase();
    const phoneChanged = editPhone !== originalPhone;

    if (emailChanged || phoneChanged) {
      setIsSendingOtp(true);
      setIsVerifyingOtp(true);
      setEnteredOtp('');

      if (phoneChanged) {
        const targetPhone = editPhone;
        try {
          const isWeb = typeof window !== 'undefined' && window.location.hostname === 'localhost';
          const url = isWeb ? '/api/send-otp' : 'http://localhost:5000/api/send-otp';

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: targetPhone })
          });

          if (response.ok) {
            setOtpSuccessMsg(`OTP sent to ${targetPhone}.`);
          } else {
            throw new Error("Twilio request failed");
          }
        } catch (err) {
          console.warn("Failed to send Twilio SMS:", err);
          setOtpSuccessMsg('Failed to send verification SMS. Simulated OTP sent!');
          setShowOtpHint(true);
        } finally {
          setIsSendingOtp(false);
        }
      } else {
        const targetEmail = editEmail.trim();
        try {
          await sendResendEmail(targetEmail, null, editName || 'User');
          setOtpSuccessMsg('A 6-digit verification code has been sent to your email.');
          setShowOtpHint(false);
        } catch (err) {
          console.warn("Failed to send profile update OTP via Resend:", err);
          setOtpSuccessMsg('Failed to send verification email. Simulated OTP sent!');
          setShowOtpHint(true);
        } finally {
          setIsSendingOtp(false);
        }
      }
    } else {
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



  const handleVerifyOtpAndSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpErrorMsg('');

    const originalEmail = registeredUser?.email || '';
    const originalPhone = registeredUser?.phone || (userRole === 'pilot' ? '+91 98765 43210' : '+91 87654 32109');
    const editPhone = (selectedCountryCode + ' ' + editPhoneBody.trim()).trim();
    const emailChanged = editEmail.trim().toLowerCase() !== originalEmail.toLowerCase();
    const phoneChanged = editPhone !== originalPhone;

    try {
      const isWeb = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const url = isWeb ? '/api/verify-otp' : 'http://localhost:5000/api/verify-otp';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailChanged ? editEmail.trim() : undefined,
          phone: phoneChanged ? editPhone : undefined,
          code: enteredOtp
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error((resData.error && resData.error.message) || resData.message || 'Incorrect verification code. Please check and try again.');
      }

      if (resData.token) {
        await SecureStorage.set({ key: 'bharataero_auth_token', value: resData.token });
      }

      setRegisteredUser({
        ...registeredUser,
        name: editName,
        email: editEmail,
        phone: editPhone,
        id: editId
      });
      setIsVerifyingOtp(false);
      setIsEditingProfile(false);
    } catch (err) {
      setOtpErrorMsg(err.message || 'Incorrect verification code. Please check and try again.');
    }
  };



  const handleLogout = () => {

    logout();

  };





  const handleBack = () => {

    if (userRole === 'pilot') {

      navigate('pilot_dashboard', 'home');

    } else {

      navigate('client_dashboard', 'home');

    }

  };



  const handleContactSubmit = (e) => {

    if (e && e.preventDefault) e.preventDefault();

    console.log("Contact form submitted:", { contactName, contactEmail, contactQuery });

    

    // Clear form

    setContactName('');

    setContactEmail('');

    setContactQuery('');

    

    // Show success toast

    setToastTitle(t('Message Sent'));

    setToastMessage(t('Query Sent Successfully!'));

    setShowToast(true);

    setTimeout(() => {

      setShowToast(false);

    }, 2500);

  };



  const handleOpenAdvancedProfile = () => {

    setEditAdvName(registeredUser?.name || (userRole === 'pilot' ? 'Alex Mercer' : 'Sarah Jenkins'));

    setEditAdvBio(registeredUser?.bio || '');

    setEditAdvDob(registeredUser?.dob || '');

    setEditAdvInsta(registeredUser?.instagramUrl || '');

    setEditAdvLinkedin(registeredUser?.linkedinUrl || '');

    setEditAdvOther(registeredUser?.otherUrl || '');

    setEditAdvProfilePic(registeredUser?.profilePic || '');

    setIsEditingAdvancedProfile(true);

  };



  // Auto-trigger advanced profile modal if navigated from top bar click

  React.useEffect(() => {

    if (autoOpenProfileModal) {

      handleOpenAdvancedProfile();

      setAutoOpenProfileModal(false);

    }

  }, [autoOpenProfileModal]);







  const handleSaveAdvancedProfile = (e) => {

    if (e && e.preventDefault) e.preventDefault();

    setRegisteredUser({

      ...registeredUser,

      name: editAdvName,

      bio: editAdvBio,

      dob: editAdvDob,

      instagramUrl: editAdvInsta,

      linkedinUrl: editAdvLinkedin,

      otherUrl: editAdvOther,

      profilePic: editAdvProfilePic

    });

    setIsEditingAdvancedProfile(false);

    

    // Show success toast

    setToastTitle(t('Profile Updated'));

    setToastMessage(t('Your details have been saved'));

    setShowToast(true);

    setTimeout(() => {

      setShowToast(false);

    }, 2500);

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

        <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">{t('Account Settings')}</span>

      </header>



      {/* Main Content */}

      <main className="flex-grow px-5 pt-4 space-y-6 overflow-y-auto no-scrollbar">

        

        {/* Profile Card Header */}

        <section 

          onClick={handleOpenAdvancedProfile}

          className="bg-white rounded-none border border-[#b7c6c2]/60 p-5 shadow-sm flex items-center gap-4 hover:bg-neutral-50/40 cursor-pointer transition-colors duration-200"

          title="Click to edit profile bio, photo and links"

        >

          <div className="w-16 h-16 rounded-none overflow-hidden border-2 border-[#ca0013] shrink-0">

            <img 

              alt="Profile Pic" 

              className="w-full h-full object-cover" 

              src={registeredUser?.profilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I"}

            />

          </div>

          <div className="flex-1 min-w-0">

            <h2 className="text-base font-headline font-black text-[#000201] truncate">

              {registeredUser?.name || (userRole === 'pilot' ? 'Alex Mercer' : 'Sarah Jenkins')}

            </h2>

            <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider mt-0.5">

              {userRole === 'pilot' ? 'Certified UAV Pilot' : 'Mission Commander'}

            </p>

            {registeredUser?.bio && (

              <p className="text-[10px] text-[#747874] line-clamp-1 italic mt-1">

                {registeredUser.bio}

              </p>

            )}

            <div className="mt-2 flex flex-wrap gap-2">

              <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-[#ca0013] rounded-none text-[9px] font-bold">

                <span className="material-symbols-outlined text-[12px] mr-0.5">verified</span>

                Premium Member

              </span>

            </div>

          </div>

        </section>



        {/* Profile & Security Section */}

        <section className="space-y-2">

          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">{t('Personal Information')}</h3>

          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">

            <div 

              onClick={handleOpenEditProfile}

              className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer"

            >

              <div className="flex items-center gap-3">

                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><User size={16} /></div>

                <div>

                  <p className="text-xs font-bold text-[#000201]">{t('Personal Information')}</p>

                  <p className="text-[10px] text-[#747874]">{t('Manage your name, email, and ID')}</p>

                </div>

              </div>

            </div>

            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer">

              <div className="flex items-center gap-3">

                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><Lock size={16} /></div>

                <div>

                  <p className="text-xs font-bold text-[#000201]">{t('Change Security PIN')}</p>

                  <p className="text-[10px] text-[#747874]">{t('Update passcode access codes')}</p>

                </div>

              </div>

            </div>

          </div>

        </section>



        {/* Preferences Section */}

        <section className="space-y-2">

          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">{t('Preferences')}</h3>

          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">

            {/* Language */}

            <div 

              onClick={() => {

                setIsSelectingLanguage(true);

                setLanguageSearchQuery('');

              }}

              className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer transition-colors"

            >

              <div className="flex items-center gap-3">

                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><Globe size={16} /></div>

                <div>

                  <p className="text-xs font-bold text-[#000201]">{t('Region Language')}</p>

                  <p className="text-[10px] text-[#747874]">{selectedLanguage}</p>

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

                  <p className="text-xs font-bold text-[#000201]">{t('Interface Theme')}</p>

                  <p className="text-[10px] text-[#747874]">{isDark ? `${t('Dark')} Mode` : `${t('Light')} Mode`}</p>

                </div>

              </div>

              

              <div className="flex bg-neutral-100 p-0.5 rounded-none border border-neutral-200">

                <button 

                  onClick={() => setTheme('light')}

                  className={`px-3 py-1 rounded-none text-[10px] font-bold ${

                    !isDark ? 'bg-white text-[#000201] shadow-sm' : 'text-neutral-500'

                  }`}

                >

                  {t('Light')}

                </button>

                <button 

                  onClick={() => setTheme('dark')}

                  className={`px-3 py-1 rounded-none text-[10px] font-bold ${

                    isDark ? 'bg-white text-[#000201] shadow-sm' : 'text-neutral-500'

                  }`}

                >

                  {t('Dark')}

                </button>

              </div>

            </div>

          </div>

        </section>



        {/* Legal & Support */}

        <section className="space-y-2">

          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">{t('Legal & Support')}</h3>

          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">

            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer" onClick={() => navigate('about')}>

              <div className="flex items-center gap-3">

                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><Shield size={16} /></div>

                <p className="text-xs font-bold text-[#000201]">{t('Privacy Protocols')}</p>

              </div>

            </div>

            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer" onClick={() => navigate('about')}>

              <div className="flex items-center gap-3">

                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><FileText size={16} /></div>

                <p className="text-xs font-bold text-[#000201]">{t('Terms of Flight')}</p>

              </div>

            </div>

          </div>

        </section>



        {/* Contact Us Section */}

        <section className="space-y-2 animate-fade-in">

          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">{t('Contact Us')}</h3>

          <div className="bg-white rounded-none border border-[#b7c6c2]/60 p-5 shadow-sm">

            <form onSubmit={handleContactSubmit} className="space-y-4">

              <div className="space-y-1">

                <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                  {t('Full Name')}

                </label>

                <input

                  type="text"

                  required

                  value={contactName}

                  onChange={(e) => setContactName(e.target.value)}

                  className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"

                  placeholder={t('Full Name')}

                />

              </div>



              <div className="space-y-1">

                <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                  {t('Email Address')}

                </label>

                <input

                  type="email"

                  required

                  value={contactEmail}

                  onChange={(e) => setContactEmail(e.target.value)}

                  className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"

                  placeholder={t('Email Address')}

                />

              </div>



              <div className="space-y-1">

                <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                  {t('Query')}

                </label>

                <textarea

                  required

                  rows={3}

                  value={contactQuery}

                  onChange={(e) => setContactQuery(e.target.value)}

                  className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium resize-none"

                  placeholder={t('Enter your query here...')}

                />

              </div>



              <button

                type="submit"

                className="w-full bg-[#ca0013] hover:bg-[#b00010] text-white font-headline font-bold text-xs py-3.5 rounded-none uppercase tracking-wider transition-colors cursor-pointer"

              >

                {t('Submit Query')}

              </button>

            </form>

          </div>

        </section>



        {/* Social Links Section */}

        <section className="flex justify-center items-center gap-6 py-2">

          <a 

            href="https://www.instagram.com" 

            target="_blank" 

            rel="noopener noreferrer"

            className="w-10 h-10 flex items-center justify-center bg-white border border-[#b7c6c2]/60 hover:border-[#ca0013] text-[#000201] hover:text-[#ca0013] shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer rounded-none"

            title="Instagram"

          >

            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>

              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>

              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>

            </svg>

          </a>

          <a 

            href="https://www.linkedin.com/company/misd-automation/" 

            target="_blank" 

            rel="noopener noreferrer"

            className="w-10 h-10 flex items-center justify-center bg-white border border-[#b7c6c2]/60 hover:border-[#ca0013] text-[#000201] hover:text-[#ca0013] shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer rounded-none"

            title="LinkedIn"

          >

            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>

              <rect x="2" y="9" width="4" height="12"></rect>

              <circle cx="4" cy="4" r="2"></circle>

            </svg>

          </a>

          <a 

            href="https://misdautomation.in/" 

            target="_blank" 

            rel="noopener noreferrer"

            className="w-10 h-10 flex items-center justify-center bg-white border border-[#b7c6c2]/60 hover:border-[#ca0013] text-[#000201] hover:text-[#ca0013] shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer rounded-none"

            title="Website"

          >

            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <circle cx="12" cy="12" r="10"></circle>

              <line x1="2" y1="12" x2="22" y2="12"></line>

              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>

            </svg>

          </a>

        </section>



        {/* Logout button */}

        <section className="pt-2">

          <button 

            type="button"

            onClick={handleLogout}

            className="w-full bg-white border border-[#ca0013] text-[#ca0013] font-headline font-bold text-xs py-4 rounded-none hover:bg-red-50 uppercase tracking-wider flex items-center justify-center gap-1.5"

          >

            <LogOut size={14} />

            <span>{t('End Flight Session')}</span>

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



      {/* Language Selection Modal */}

      {isSelectingLanguage && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">

          <div className="bg-white w-full max-w-[480px] h-[80vh] flex flex-col justify-between rounded-none shadow-2xl border-t border-neutral-200 animate-slide-up relative">

            

            {/* Header */}

            <header className="flex justify-between items-center px-5 py-4 border-b border-[#b7c6c2]/20 shrink-0">

              <span className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">

                {t('Select Regional Language')}

              </span>

              <button 

                onClick={() => setIsSelectingLanguage(false)}

                className="w-8 h-8 flex items-center justify-center rounded-none bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"

              >

                <X size={16} />

              </button>

            </header>



            {/* Language Search Bar & List Body */}

            <div className="flex-grow flex flex-col overflow-hidden p-5 space-y-4">

              {/* Search Bar - first! */}

              <div className="flex items-center gap-3 border border-neutral-200 bg-neutral-50 rounded-none px-4 py-3 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-50 transition-all duration-300 shrink-0">

                <Search size={16} className="text-neutral-400 shrink-0" />

                <input

                  type="text"

                  value={languageSearchQuery}

                  onChange={(e) => setLanguageSearchQuery(e.target.value)}

                  placeholder={t('Search language')}

                  className="flex-grow bg-transparent border-0 text-xs text-[#1b1c1b] focus:outline-none placeholder-neutral-400 p-0"

                />

                {languageSearchQuery && (

                  <button 

                    onClick={() => setLanguageSearchQuery('')}

                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"

                  >

                    <X size={14} />

                  </button>

                )}

              </div>



              {/* Scrollable Language List */}

              <div className="flex-grow overflow-y-auto no-scrollbar space-y-2 pb-4">

                {indianLanguages.filter(lang => 

                  lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase()) || 

                  lang.nativeName.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||

                  lang.region.toLowerCase().includes(languageSearchQuery.toLowerCase())

                ).length > 0 ? (

                  indianLanguages.filter(lang => 

                    lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase()) || 

                    lang.nativeName.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||

                    lang.region.toLowerCase().includes(languageSearchQuery.toLowerCase())

                  ).map((lang) => {

                    const isSelectedExact = selectedLanguage === lang.name || selectedLanguage === `${lang.name} (${lang.nativeName})`;

                    return (

                      <div

                        key={lang.name}

                        onClick={() => {

                          setSelectedLanguage(`${lang.name} (${lang.nativeName})`);

                          setIsSelectingLanguage(false);

                          setToastTitle(t('Language Updated'));

                          setToastMessage(t('Language Saved Successfully!'));

                          setShowToast(true);

                          setTimeout(() => {

                            setShowToast(false);

                          }, 2500);

                        }}

                        className={`flex items-center justify-between p-3.5 border transition-all duration-200 cursor-pointer ${

                          isSelectedExact

                            ? 'border-[#ca0013] bg-red-50/40 text-[#ca0013] font-bold'

                            : 'border-neutral-200/60 hover:bg-neutral-50 text-neutral-800'

                        }`}

                      >

                        <div className="flex-grow">

                          <div className="flex items-baseline gap-2">

                            <span className="text-xs font-bold">{lang.name}</span>

                            <span className={`text-[10px] ${isSelectedExact ? 'text-[#ca0013]/70' : 'text-neutral-400'}`}>

                              {lang.nativeName}

                            </span>

                          </div>

                          <p className={`text-[9px] mt-0.5 ${isSelectedExact ? 'text-[#ca0013]/60' : 'text-neutral-400'}`}>

                            {lang.region}

                          </p>

                        </div>

                        {isSelectedExact && (

                          <span className="material-symbols-outlined text-[18px] text-[#ca0013]">check_circle</span>

                        )}

                      </div>

                    );

                  })

                ) : (

                  <div className="text-center py-10 space-y-2">

                    <p className="text-xs text-neutral-400 font-bold">No matching languages found</p>

                    <p className="text-[10px] text-neutral-400">Try searching for another Indian language.</p>

                  </div>

                )}

              </div>

            </div>



          </div>

        </div>

      )}



      {/* Edit Advanced Profile Modal */}

      {isEditingAdvancedProfile && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">

          <div className="bg-white w-full max-w-[480px] h-[90vh] flex flex-col justify-between rounded-none shadow-2xl border-t border-neutral-200 animate-slide-up relative">

            

            {/* Header */}

            <header className="flex justify-between items-center px-5 py-4 border-b border-[#b7c6c2]/20 shrink-0">

              <span className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">

                {t('Edit Advanced Profile')}

              </span>

              <button 

                onClick={() => setIsEditingAdvancedProfile(false)}

                className="w-8 h-8 flex items-center justify-center rounded-none bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"

              >

                <X size={16} />

              </button>

            </header>



            {/* Scrollable Form Body */}

            <div className="flex-grow overflow-y-auto no-scrollbar p-5">

              <form onSubmit={handleSaveAdvancedProfile} className="space-y-4">

                

                

                {/* Profile Picture Display (Static) */}

                <div className="flex flex-col items-center justify-center py-3 space-y-2">

                  <div className="w-20 h-20 rounded-none overflow-hidden border-2 border-[#ca0013] bg-neutral-100 flex items-center justify-center shadow-md">

                    <img 

                      src={editAdvProfilePic || "https://lh3.googleusercontent.com/aida-public/AB6AXuCV47DaBxqfxLcnTdUs7O5G3JIsjwPauCvXb65mPkf4w3sSOMK7Mfswubt2peFwRUMXRVl07aCOLepPbM9ushB06_TJ5uPbDBsFUwlNT1lYkE9jGHGAHwk2jH4uAMz6E7G5dj6tFhl6hXdDBxLcTGO-pSjbL6CvN4q5FhRXUkyVWXWpnFXbUlH2P4GLVzV9kTDTFeWcNJsMNL6qquQ2AG7Oycppt7oubV1ijhJwK45HmpNE8LwCj2Tu38x-q0t8w2LixMRMl9mfH-I"}

                      alt="Profile Picture"

                      className="w-full h-full object-cover"

                    />

                  </div>

                  {/* DEV Auto-Fill Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditAdvName("Alex Mercer");
                      setEditAdvBio("Certified UAV Drone Pilot with 5+ years of experience in agricultural surveying, thermal inspection, and high-resolution orthomosaic mapping.");
                      setEditAdvDob("1994-05-12");
                      setEditAdvInsta("https://instagram.com/alex_mercer_uav");
                      setEditAdvLinkedin("https://linkedin.com/company/misd-automation");
                      setEditAdvOther("https://misdautomation.in");
                    }}
                    className="mt-1 px-3 py-1.5 text-[9px] font-headline font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-none border border-neutral-300 dark:border-neutral-700 cursor-pointer transition-colors"
                  >
                    🛠️ DEV Auto-Fill
                  </button>

                </div>



                {/* Name */}

                <div className="space-y-1">

                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                    {t('Full Name')}

                  </label>

                  <input

                    type="text"

                    required

                    value={editAdvName}

                    onChange={(e) => setEditAdvName(e.target.value)}

                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"

                    placeholder={t('Full Name')}

                  />

                </div>



                {/* Bio */}

                <div className="space-y-1">

                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                    {t('Bio')}

                  </label>

                  <textarea

                    rows={3}

                    value={editAdvBio}

                    onChange={(e) => setEditAdvBio(e.target.value)}

                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium resize-none"

                    placeholder={t('Tell us about yourself...')}

                  />

                </div>



                {/* Date of Birth */}

                <div className="space-y-1">

                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                    {t('Date of Birth')}

                  </label>

                  <input

                    type="date"

                    value={editAdvDob}

                    onChange={(e) => setEditAdvDob(e.target.value)}

                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"

                  />

                </div>



                {/* Instagram URL */}

                <div className="space-y-1">

                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                    {t('Instagram Profile URL')}

                  </label>

                  <input

                    type="text"

                    value={editAdvInsta}

                    onChange={(e) => setEditAdvInsta(e.target.value)}

                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"

                    placeholder="e.g. https://instagram.com/username"

                  />

                </div>



                {/* LinkedIn URL */}

                <div className="space-y-1">

                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                    {t('LinkedIn Profile URL')}

                  </label>

                  <input

                    type="text"

                    value={editAdvLinkedin}

                    onChange={(e) => setEditAdvLinkedin(e.target.value)}

                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"

                    placeholder="e.g. https://linkedin.com/in/username"

                  />

                </div>



                {/* Other Website URL */}

                <div className="space-y-1">

                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">

                    {t('Website URL')}

                  </label>

                  <input

                    type="text"

                    value={editAdvOther}

                    onChange={(e) => setEditAdvOther(e.target.value)}

                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"

                    placeholder="e.g. https://example.com"

                  />

                </div>



                {/* Footer Buttons */}

                <div className="pt-2 flex gap-3">

                  <button

                    type="button"

                    onClick={() => setIsEditingAdvancedProfile(false)}

                    className="flex-1 py-3.5 text-xs font-bold text-[#747874] bg-neutral-100 hover:bg-neutral-200 transition-colors uppercase tracking-wider rounded-none text-center"

                  >

                    {t('Cancel')}

                  </button>

                  <button

                    type="submit"

                    className="flex-1 py-3.5 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] transition-colors uppercase tracking-wider rounded-none text-center"

                  >

                    {t('Save Changes')}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}



      {/* Toast Alert */}

      <div 

        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-[#121316] to-[#0a0a0b] text-white border-l-4 border-[#ca0013] shadow-2xl transition-all duration-500 ease-out transform ${

          showToast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'

        }`}

      >

        <span className="material-symbols-outlined text-[18px] text-[#ca0013]">verified</span>

        <div className="flex flex-col">

          <span className="text-[10px] font-headline font-black uppercase tracking-wider text-white">{toastTitle}</span>

          <span className="text-[9px] font-body text-neutral-400 mt-0.5">{toastMessage}</span>

        </div>

      </div>



      {/* Bottom Nav Bar (Shared routing logic based on active role) */}

      <BottomNav />

    </div>

  );

}
