import React from 'react';

import BottomNav from '../components/BottomNav';

import { useApp } from '../context/AppContext';
import { SecureStorage } from '../utils/SecureStorage';
import { deleteUserAccount, getSafeErrorMessage, updateUserProfile, uploadProfilePicture } from '../supabaseQueries';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Dialog } from '@capacitor/dialog';

import { 

  ArrowLeft, ShieldAlert, User, Lock, Key, Bell, 

  Globe, Sun, Moon, Shield, FileText, LifeBuoy, LogOut, X, Search, Camera as CameraIcon
} from 'lucide-react';



const countryCodes = [
  { code: '+91', flag: '🇮🇳', label: 'India' },
  { code: '+1', flag: '🇺🇸', label: 'USA' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+971', flag: '🇦🇪', label: 'UAE' },
  { code: '+65', flag: '🇸🇬', label: 'Singapore' },
  { code: '+61', flag: '🇦🇺', label: 'Australia' }
];



const indianLanguages = [
  { name: 'English', nativeName: 'English', region: 'Global / India' },
  { name: 'Hindi', nativeName: 'हिन्दी', region: 'North India' },
  { name: 'Bengali', nativeName: 'বাংলা', region: 'East India / West Bengal' },
  { name: 'Marathi', nativeName: 'मराठी', region: 'West India / Maharashtra' },
  { name: 'Telugu', nativeName: 'తెలుగు', region: 'South India / Andhra Pradesh & Telangana' },
  { name: 'Tamil', nativeName: 'தமிழ்', region: 'South India / Tamil Nadu' },
  { name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'West India / Gujarat' },
  { name: 'Urdu', nativeName: 'اردو', region: 'Pan-India' },
  { name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'South India / Karnataka' },
  { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'East India / Odisha' },
  { name: 'Malayalam', nativeName: 'മലയാളം', region: 'South India / Kerala' },
  { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'North India / Punjab' },
  { name: 'Assamese', nativeName: 'অসমীয়া', region: 'Northeast India / Assam' },
  { name: 'Maithili', nativeName: 'मैथिली', region: 'East India / Bihar' },
  { name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'East India / Jharkhand & Odisha' },
  { name: 'Kashmiri', nativeName: 'कॉशुर / كأشُر', region: 'North India / Jammu & Kashmir' },
  { name: 'Nepali', nativeName: 'नेपाली', region: 'North India / Sikkim & West Bengal' },
  { name: 'Gondi', nativeName: 'गोंडी', region: 'Central India' },
  { name: 'Konkani', nativeName: 'कोंकणी', region: 'West India / Goa' },
  { name: 'Dogri', nativeName: 'डोगरी', region: 'North India / Jammu & Kashmir' },
  { name: 'Manipuri', nativeName: 'মৈতৈলোন / মীতৈলোন', region: 'Northeast India / Manipur' },
  { name: 'Bodo', nativeName: 'बड़ो', region: 'Northeast India / Assam' },
  { name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Pan-India / Classical' },
  { name: 'Sindhi', nativeName: 'सिन्धी', region: 'Pan-India' }
];

const STANDARD_DRONES = [
  "DJI Mavic 3 Enterprise (Thermal)",
  "DJI Agras T40 / T50 (Agriculture)",
  "DJI Matrice 300 / 350 RTK (Mapping/Survey)",
  "DJI Inspire 3 / Custom Cinematic FPV",
  "DJI Matrice 30T (Weatherproof Thermal)",
  "DJI FlyCart 30 (Delivery/Logistics)",
  "Skydio X10 (Autonomous Survey)",
  "Autel Robotics EVO II Dual 640T (Thermal)",
  "Custom Hexacopter (Heavy Lift Payload)",
  "Custom Fixed-Wing (Long Range Mapping)"
];

export default function SettingsScreen() {

  const { 

    theme, setTheme, userRole, 

    logout, navigate, activeTab, registeredUser, setRegisteredUser,

    sendResendEmail, selectedLanguage, setSelectedLanguage, autoOpenProfileModal, setAutoOpenProfileModal, t

  } = useApp();

  const isPilot = userRole === 'pilot' || registeredUser?.role === 'pilot';



  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [changeMode, setChangeMode] = React.useState('none');

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

  const [editAdvPrice, setEditAdvPrice] = React.useState(150);

  const [editAdvLocation, setEditAdvLocation] = React.useState('');

  const [editAdvSpecialty, setEditAdvSpecialty] = React.useState('');

  const [editAdvDroneModel, setEditAdvDroneModel] = React.useState('');
  const [selectedDroneSelect, setSelectedDroneSelect] = React.useState('DJI Mavic 3 Enterprise (Thermal)');
  const [customDroneInput, setCustomDroneInput] = React.useState('');

  const [editAdvName, setEditAdvName] = React.useState('');

  const [editAdvBio, setEditAdvBio] = React.useState('');

  const [editAdvDob, setEditAdvDob] = React.useState('');

  const [editAdvInsta, setEditAdvInsta] = React.useState('');

  const [editAdvLinkedin, setEditAdvLinkedin] = React.useState('');

  const [editAdvOther, setEditAdvOther] = React.useState('');

  const [editAdvProfilePic, setEditAdvProfilePic] = React.useState('');
  const [isUploadingPic, setIsUploadingPic] = React.useState(false);

// Helper to compress image base64 before upload
const compressImageBase64 = (base64Str, format = 'jpeg') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/${format};base64,${base64Str}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed WebP
      const dataUrl = canvas.toDataURL('image/webp', 0.8);
      const base64Output = dataUrl.split(',')[1];
      resolve({ base64: base64Output, format: 'webp' });
    };
    img.onerror = (err) => reject(err);
  });
};

  const handlePickProfileImage = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Prompts user to pick from Gallery or take Photo
      });

      if (image.base64String) {
        setIsUploadingPic(true);
        // Compress base64 to WebP on the client side
        const compressed = await compressImageBase64(image.base64String, image.format || 'jpeg');
        const extension = compressed.format;
        
        // Upload compressed image to Supabase bucket
        const publicUrl = await uploadProfilePicture(registeredUser.id, compressed.base64, extension);
        
        // Update local state instantly so UI shows new image
        setEditAdvProfilePic(publicUrl);
        await Dialog.alert({
          title: 'Upload Successful',
          message: 'Profile picture uploaded!'
        });
      }
    } catch (err) {
      console.error("Failed to pick/upload image:", err);
      // Capacitor throws an error if user cancels the picker, so we can ignore it or show alert if it's a real error
      if (err.message && !err.message.includes('User cancelled')) {
        alert("Failed to upload image. Please try again.");
      }
    } finally {
      setIsUploadingPic(false);
    }
  };

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

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [mfaEnabled, setMfaEnabled] = React.useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm("WARNING: This will permanently delete your account, bookings, and all associated data under GDPR Right to be Forgotten. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Delete from Supabase
      if (registeredUser?.id) {
        await deleteUserAccount(registeredUser.id);
      }
      
      const { supabase } = await import('../supabase');
      await supabase.auth.signOut();
      
      alert("Your account and all associated data have been permanently deleted.");
      logout();
    } catch (err) {
      console.error("GDPR Deletion Error:", err);
      alert(err.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMfaToggle = () => {
    if (!mfaEnabled) {
      alert("Multi-Factor Authentication (SMS) requires Supabase Twilio integration. This will be implemented in a future update.");
    }
    setMfaEnabled(!mfaEnabled);
  };



  const handleOpenEditProfile = () => {

    setEditName(registeredUser?.name || (isPilot ? 'Alex Mercer' : 'Sarah Jenkins'));

    setEditEmail(registeredUser?.email || '');

    

    // Parse saved phone number

    const savedPhone = (registeredUser?.phone || (isPilot ? '+91 98765 43210' : '+91 87654 32109')).trim();

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

    setEditId(registeredUser?.id || (isPilot ? 'PILOT-UA-4091' : 'CLIENT-BA-8821'));

    setChangeMode('none');
    setIsEditingProfile(true);

    setIsVerifyingOtp(false);

    setOtpErrorMsg('');

    setOtpSuccessMsg('');

  };



  const handleRequestEmailOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpErrorMsg('');
    setOtpSuccessMsg('');
    
    const originalEmail = registeredUser?.email || '';
    const targetEmail = editEmail.trim();
    if (targetEmail.toLowerCase() === originalEmail.toLowerCase()) {
      setOtpErrorMsg('New email must be different from current email.');
      return;
    }
    
    setIsSendingOtp(true);
    setIsVerifyingOtp(true);
    setEnteredOtp('');
    
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
  };

  const handleRequestPhoneOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpErrorMsg('');
    setOtpSuccessMsg('');
    
    const originalPhone = registeredUser?.phone || (isPilot ? '+91 98765 43210' : '+91 87654 32109');
    const editPhone = (selectedCountryCode + ' ' + editPhoneBody.trim()).trim();
    if (editPhone === originalPhone) {
      setOtpErrorMsg('New phone number must be different from current phone number.');
      return;
    }
    
    setIsSendingOtp(true);
    setIsVerifyingOtp(true);
    setEnteredOtp('');
    
    try {
      const isWeb = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const url = isWeb ? '/api/send-otp' : 'http://localhost:5000/api/send-otp';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: editPhone })
      });

      if (response.ok) {
        setOtpSuccessMsg(`OTP sent to ${editPhone}.`);
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
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const nameChanged = editName !== (registeredUser?.name || '');
    if (nameChanged) {
      try {
        if (registeredUser?.id) {
          await updateUserProfile(registeredUser.id, {
            name: editName
          });
        }
      } catch (err) {
        console.warn("Failed to update name in Supabase:", err);
      }
    }

    setRegisteredUser({
      ...registeredUser,
      name: editName,
      id: editId
    });
    setIsEditingProfile(false);
  };

  const handleVerifyOtpAndSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpErrorMsg('');

    const editPhone = (selectedCountryCode + ' ' + editPhoneBody.trim()).trim();

    // Frontend bypass for simulated OTP local testing
    if (showOtpHint) {
      if (enteredOtp === '123456') {
        try {
          if (registeredUser?.id) {
            await updateUserProfile(registeredUser.id, {
              email: changeMode === 'email' ? editEmail.trim() : undefined,
              phone: changeMode === 'phone' ? editPhone : undefined
            });
          }
        } catch (err) {
          console.warn("Failed to update Supabase directly:", err);
        }

        setRegisteredUser({
          ...registeredUser,
          email: changeMode === 'email' ? editEmail.trim() : registeredUser.email,
          phone: changeMode === 'phone' ? editPhone : registeredUser.phone
        });

        setIsVerifyingOtp(false);
        setIsEditingProfile(false);
        setChangeMode('none');

        await Dialog.alert({
          title: t('Profile Updated'),
          message: t('Your details have been saved successfully!')
        });
        return;
      } else {
        setOtpErrorMsg('Incorrect verification code. Please enter 123456.');
        return;
      }
    }

    try {
      const isWeb = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const url = isWeb ? '/api/verify-otp' : 'http://localhost:5000/api/verify-otp';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: changeMode === 'email' ? editEmail.trim() : undefined,
          phone: changeMode === 'phone' ? editPhone : undefined,
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
        email: changeMode === 'email' ? editEmail.trim() : registeredUser.email,
        phone: changeMode === 'phone' ? editPhone : registeredUser.phone,
        id: editId
      });
      setIsVerifyingOtp(false);
      setIsEditingProfile(false);
      setChangeMode('none');
    } catch (err) {
      setOtpErrorMsg(err.message || 'Incorrect verification code. Please check and try again.');
    }
  };



  const handleLogout = () => {

    logout();

  };





  const handleBack = () => {

    if (isPilot) {

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

    setEditAdvName(registeredUser?.name || (isPilot ? 'Alex Mercer' : 'Sarah Jenkins'));

    setEditAdvBio(registeredUser?.bio || '');

    setEditAdvDob(registeredUser?.dob || '');

    setEditAdvInsta(registeredUser?.instagram_url || registeredUser?.instagramUrl || '');

    setEditAdvLinkedin(registeredUser?.linkedin_url || registeredUser?.linkedinUrl || '');

    setEditAdvOther(registeredUser?.other_url || registeredUser?.otherUrl || '');

    setEditAdvProfilePic(registeredUser?.profile_pic_url || registeredUser?.profilePic || '');

    setEditAdvPrice(registeredUser?.price || 150);

    setEditAdvLocation(registeredUser?.location || '');

    setEditAdvSpecialty(registeredUser?.specialty || '');

    setEditAdvDroneModel(registeredUser?.drone_model || '');

    setIsEditingAdvancedProfile(true);

  };



  // Auto-trigger advanced profile modal if navigated from top bar click

  React.useEffect(() => {

    if (autoOpenProfileModal) {

      handleOpenAdvancedProfile();

      setAutoOpenProfileModal(false);

    }

  }, [autoOpenProfileModal]);







  const handleSaveAdvancedProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      // 1. Update in Supabase
      if (registeredUser?.id) {
        await updateUserProfile(registeredUser.id, {
          name: editAdvName,
          bio: editAdvBio,
          dob: editAdvDob,
          instagram_url: editAdvInsta,
          linkedin_url: editAdvLinkedin,
          other_url: editAdvOther,
          profile_pic_url: editAdvProfilePic,
          price: isPilot ? Number(editAdvPrice) : undefined,
          location: isPilot ? editAdvLocation : undefined,
          specialty: isPilot ? editAdvSpecialty : undefined,
          drone_model: isPilot ? (selectedDroneSelect === 'Other' ? customDroneInput.trim() : selectedDroneSelect) : undefined
        });
      }

      // 2. Update local state
      setRegisteredUser({
        ...registeredUser,
        name: editAdvName,
        bio: editAdvBio,
        dob: editAdvDob,
        instagramUrl: editAdvInsta,
        instagram_url: editAdvInsta,
        linkedinUrl: editAdvLinkedin,
        linkedin_url: editAdvLinkedin,
        otherUrl: editAdvOther,
        other_url: editAdvOther,
        profile_pic_url: editAdvProfilePic,
        profilePic: editAdvProfilePic,
        price: isPilot ? Number(editAdvPrice) : registeredUser.price,
        location: isPilot ? editAdvLocation : registeredUser.location,
        specialty: isPilot ? editAdvSpecialty : registeredUser.specialty,
        drone_model: isPilot ? (selectedDroneSelect === 'Other' ? customDroneInput.trim() : selectedDroneSelect) : registeredUser.drone_model
      });

      setIsEditingAdvancedProfile(false);

      // Show success dialog
      await Dialog.alert({
        title: t('Profile Updated'),
        message: t('Your details have been saved successfully!')
      });
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to save profile. Please check your connection.");
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

          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ca0013] shrink-0 bg-neutral-100 flex items-center justify-center text-[#000201]">
            {registeredUser?.profile_pic_url || registeredUser?.profilePic ? (
              <img 
                alt="Profile Pic" 
                className="w-full h-full object-cover rounded-full" 
                src={registeredUser.profile_pic_url || registeredUser.profilePic}
              />
            ) : (
              <span className="text-xl font-black font-headline uppercase">
                {registeredUser?.name ? registeredUser.name.charAt(0) : 'U'}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">

            <h2 className="text-base font-headline font-black text-[#000201] truncate">

              {registeredUser?.name || (isPilot ? 'Alex Mercer' : 'Sarah Jenkins')}

            </h2>

            <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider mt-0.5">

              {isPilot ? 'Certified UAV Pilot' : 'Mission Commander'}

            </p>

            {registeredUser?.bio && (

              <p className="text-[10px] text-[#747874] line-clamp-1 italic mt-1">

                {registeredUser.bio}

              </p>

            )}



          </div>

        </section>



        {/* Profile & Security Section */}

        <section className="space-y-2">

          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">{t('Personal Details')}</h3>

          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">

            <div 

              onClick={handleOpenEditProfile}

              className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer"

            >

              <div className="flex items-center gap-3">

                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><User size={16} /></div>

                <div>

                  <p className="text-xs font-bold text-[#000201]">{t('Change Personal Details')}</p>

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

            href="https://www.linkedin.com/company/bharataero/" 

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

            href="https://bharataero.in/" 

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



        {/* Security & Data (GDPR) */}
        <section className="space-y-2 mt-4">
          <h3 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">{t('Security & Data (GDPR)')}</h3>
          
          <div className="bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm overflow-hidden divide-y divide-[#b7c6c2]/10">
            {/* MFA Toggle */}
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={handleMfaToggle}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-neutral-100 text-[#000201]"><ShieldAlert size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-[#000201]">{t('Two-Factor Authentication')}</p>
                  <p className="text-[10px] text-[#747874]">{t('Secure your account with SMS OTP')}</p>
                </div>
              </div>
              
              <div className={`w-10 h-5 rounded-full relative transition-colors ${mfaEnabled ? 'bg-[#ca0013]' : 'bg-neutral-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${mfaEnabled ? 'left-5.5 right-0.5 translate-x-5' : 'left-0.5'}`}></div>
              </div>
            </div>

            {/* GDPR Right to be forgotten */}
            <div className="flex items-center justify-between p-4 hover:bg-red-50 cursor-pointer" onClick={handleDeleteAccount}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-none bg-red-100 text-[#ca0013]"><X size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-[#ca0013]">{t('Delete My Account & Data')}</p>
                  <p className="text-[10px] text-[#ca0013]/70">{t('Permanently remove all your data (GDPR)')}</p>
                </div>
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

                {isVerifyingOtp ? 'Verify Security Code' : t('Edit Personal Details')}

              </span>

              <button 

                onClick={() => setIsEditingProfile(false)}

                className="w-8 h-8 flex items-center justify-center rounded-none bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500"

              >

                <X size={16} />

              </button>

            </header>



            {/* Body */}
            {changeMode === 'none' && (
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

                {/* Email Address Display */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-grow text-xs p-3 bg-neutral-50 border border-[#b7c6c2]/30 text-neutral-500 font-medium select-text">
                      {registeredUser?.email || 'Not verified'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChangeMode('email');
                        setEditEmail(registeredUser?.email || '');
                        setIsVerifyingOtp(false);
                        setOtpErrorMsg('');
                        setOtpSuccessMsg('');
                      }}
                      className="px-4 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] uppercase tracking-wider rounded-none transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Phone Number Display */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-grow text-xs p-3 bg-neutral-50 border border-[#b7c6c2]/30 text-neutral-500 font-medium select-text">
                      {registeredUser?.phone || 'Not verified'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChangeMode('phone');
                        setIsVerifyingOtp(false);
                        setOtpErrorMsg('');
                        setOtpSuccessMsg('');
                      }}
                      className="px-4 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] uppercase tracking-wider rounded-none transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Identification ID */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                    {isPilot ? 'Pilot License / UAV ID' : 'Client Organization ID'}
                  </label>
                  <input
                    type="text"
                    value={editId}
                    onChange={(e) => setEditId(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                    placeholder={isPilot ? 'e.g. PILOT-UA-4091' : 'e.g. CLIENT-BA-8821'}
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

            {changeMode === 'email' && (
              <form onSubmit={isVerifyingOtp ? handleVerifyOtpAndSave : handleRequestEmailOtp} className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-headline font-black text-[#000201] uppercase tracking-wider">
                    {isVerifyingOtp ? 'Verify New Email' : 'Change Email Address'}
                  </h4>
                  <p className="text-xs text-[#747874]">
                    {isVerifyingOtp 
                      ? `We sent a 6-digit verification code to ${editEmail.trim()}. Please enter it below.`
                      : 'Enter your new email address. A verification code will be sent to it.'}
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

                {!isVerifyingOtp ? (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                      placeholder="e.g. newemail@domain.com"
                    />
                  </div>
                ) : (
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
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1.5 animate-pulse">
                        Please enter the simulated code: 123456
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isVerifyingOtp) {
                        setIsVerifyingOtp(false);
                      } else {
                        setChangeMode('none');
                      }
                    }}
                    className="flex-1 py-3 text-xs font-bold text-[#747874] bg-neutral-100 hover:bg-neutral-200 transition-colors uppercase tracking-wider rounded-none text-center"
                  >
                    {isVerifyingOtp ? 'Back' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="flex-1 py-3 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] transition-colors uppercase tracking-wider rounded-none text-center disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending...' : isVerifyingOtp ? 'Verify & Update' : 'Send Code'}
                  </button>
                </div>
              </form>
            )}

            {changeMode === 'phone' && (
              <form onSubmit={isVerifyingOtp ? handleVerifyOtpAndSave : handleRequestPhoneOtp} className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-headline font-black text-[#000201] uppercase tracking-wider">
                    {isVerifyingOtp ? 'Verify New Phone' : 'Change Phone Number'}
                  </h4>
                  <p className="text-xs text-[#747874]">
                    {isVerifyingOtp 
                      ? `We sent a 6-digit SMS code to ${selectedCountryCode} ${editPhoneBody}. Please enter it below.`
                      : 'Enter your new phone number. A verification SMS will be sent via Twilio.'}
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

                {!isVerifyingOtp ? (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                      New Phone Number
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
                        placeholder="e.g. 98765 43210"
                      />
                    </div>
                  </div>
                ) : (
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
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1.5 animate-pulse">
                        Please enter the simulated code: 123456
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isVerifyingOtp) {
                        setIsVerifyingOtp(false);
                      } else {
                        setChangeMode('none');
                      }
                    }}
                    className="flex-1 py-3 text-xs font-bold text-[#747874] bg-neutral-100 hover:bg-neutral-200 transition-colors uppercase tracking-wider rounded-none text-center"
                  >
                    {isVerifyingOtp ? 'Back' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="flex-1 py-3 text-xs font-bold text-white bg-[#ca0013] hover:bg-[#b00010] transition-colors uppercase tracking-wider rounded-none text-center disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending...' : isVerifyingOtp ? 'Verify & Update' : 'Send Code'}
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

                        onClick={async () => {

                          setSelectedLanguage(`${lang.name} (${lang.nativeName})`);

                          setIsSelectingLanguage(false);

                          await Dialog.alert({
                            title: t('Language Updated'),
                            message: t('Language Saved Successfully!')
                          });

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

                

                

                {/* Profile Picture Display (Interactive) */}
                <div className="flex flex-col items-center justify-center py-3 space-y-2">
                  <button
                    type="button"
                    onClick={handlePickProfileImage}
                    disabled={isUploadingPic}
                    className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#ca0013] bg-neutral-100 flex items-center justify-center shadow-md group cursor-pointer text-[#000201]"
                  >
                    {editAdvProfilePic ? (
                      <img 
                        src={editAdvProfilePic}
                        alt="Profile Picture"
                        className={`w-full h-full object-cover rounded-full transition-opacity ${isUploadingPic ? 'opacity-50' : 'group-hover:opacity-80'}`}
                      />
                    ) : (
                      <span className="text-3xl font-black font-headline uppercase">
                        {registeredUser?.name ? registeredUser.name.charAt(0) : 'U'}
                      </span>
                    )}
                    
                    {/* Hover Overlay for Picking Image */}
                    {!isUploadingPic && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CameraIcon className="text-white" size={28} />
                      </div>
                    )}

                    {/* Uploading Spinner */}
                    {isUploadingPic && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">
                    {isUploadingPic ? 'Uploading...' : 'Tap to change photo'}
                  </span>

                  {/* DEV Auto-Fill Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditAdvName("Alex Mercer");
                      setEditAdvBio("Certified UAV Drone Pilot with 5+ years of experience in agricultural surveying, thermal inspection, and high-resolution orthomosaic mapping.");
                      setEditAdvDob("1994-05-12");
                      setEditAdvInsta("https://instagram.com/alex_mercer_uav");
                      setEditAdvLinkedin("https://linkedin.com/company/bharataero");
                      setEditAdvOther("https://bharataero.in");
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

                {isPilot && (
                  <>
                    {/* Mission Cost */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                        {t('Mission Cost (₹)')}
                      </label>
                      <input
                        type="number"
                        value={editAdvPrice}
                        onChange={(e) => setEditAdvPrice(e.target.value)}
                        className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                        placeholder="e.g. 150"
                      />
                    </div>

                    {/* Deploy Base / Location */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                        {t('Deploy Base (Location)')}
                      </label>
                      <input
                        type="text"
                        value={editAdvLocation}
                        onChange={(e) => setEditAdvLocation(e.target.value)}
                        className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                        placeholder="e.g. Available Nationwide"
                      />
                    </div>

                    {/* Specialty Focus */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                        {t('Specialty Focus')}
                      </label>
                      <input
                        type="text"
                        value={editAdvSpecialty}
                        onChange={(e) => setEditAdvSpecialty(e.target.value)}
                        className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                        placeholder="e.g. Certified Drone Operator"
                      />
                    </div>

                    {/* UAV Platform / Drone Model */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                        {t('UAV Platform (Drone Model)')}
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDroneSelect}
                          onChange={(e) => {
                            setSelectedDroneSelect(e.target.value);
                            if (e.target.value !== 'Other') {
                              setCustomDroneInput('');
                            }
                          }}
                          className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium appearance-none pr-10 cursor-pointer"
                        >
                          {STANDARD_DRONES.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          <option value="Other">Other (Specify below...)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>

                    {/* Custom Drone input */}
                    {selectedDroneSelect === 'Other' && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="block text-[10px] font-bold text-[#747874] uppercase tracking-wider">
                          {t('Specify Custom Drone Model')}
                        </label>
                        <input
                          type="text"
                          value={customDroneInput}
                          onChange={(e) => setCustomDroneInput(e.target.value)}
                          className="w-full text-xs p-3 bg-white border border-[#b7c6c2]/60 rounded-none focus:outline-none focus:border-[#ca0013] text-[#000201] font-medium"
                          placeholder="e.g. DJI Phantom 4 RTK"
                          required={selectedDroneSelect === 'Other'}
                        />
                      </div>
                    )}
                  </>
                )}

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



      {/* Minimal Toast Alert */}
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 bg-neutral-800/95 backdrop-blur-md text-white rounded-full shadow-lg transition-all duration-300 ease-out transform ${
          showToast ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[16px] text-green-400">check_circle</span>
        <span className="text-[11px] font-medium font-body tracking-wide">{toastMessage || toastTitle}</span>
      </div>



      {/* Bottom Nav Bar (Shared routing logic based on active role) */}

      <BottomNav />

    </div>

  );

}
