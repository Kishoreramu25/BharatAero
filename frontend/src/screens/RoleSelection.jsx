import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Check } from 'lucide-react';

export default function RoleSelection() {
  const { setCurrentScreen, userRole, setUserRole, t } = useApp();
  const [selected, setSelected] = useState(userRole);

  const handleContinue = () => {
    if (selected) {
      setUserRole(selected);
      setCurrentScreen('login');
    }
  };

  return (
    <div className="light flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full p-6 relative select-none">
      
      {/* Decorative background grid elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundSize: '30px 30px',
        backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)'
      }}></div>

      {/* Top Header */}
      <header className="flex justify-between items-center py-2 z-10">
        <button 
          onClick={() => setCurrentScreen('onboarding')}
          className="w-10 h-10 flex items-center justify-center rounded-none bg-white border border-[#b7c6c2]/25 shadow-sm text-primary"
        >
          <ArrowLeft size={18} className="text-[#000201]" />
        </button>
        <span className="text-[#000201] font-black text-lg font-headline">Bharat System</span>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center gap-6 my-4 z-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-headline font-black text-2xl text-[#171e19] leading-tight mb-1">
            {t('How will you use Bharat Aero?')}
          </h1>
          <p className="text-[#444844] font-body text-xs">
            {t('Select your primary role to customize your experience.')}
          </p>
        </div>

        {/* Role Options */}
        <div className="flex flex-col gap-4">
          
          {/* Client Role Card */}
          <div 
            onClick={() => setSelected('client')}
            className={`group relative cursor-pointer rounded-none border flex flex-col overflow-hidden shadow-sm ${
              selected === 'client' 
              ? 'border-[#ca0013] bg-white ring-1 ring-[#ca0013]/25' 
              : 'border-[#b7c6c2]/60 bg-white hover:border-neutral-300'
            }`}
          >
            {/* Image Banner */}
            <div className="h-32 w-full overflow-hidden bg-neutral-200 relative">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXjE2_9Uj6PCnGnvdW5Q8zY9BV0Qxwf7QmWw-aGYicheZpA2m_pa3f3Q65QmAoF5gpxZym31kIU2G86FlrBzfPr_juQAMN7eC3fePY2WmPZC2pUBa0jX7gEh32mqyOSUo5U8ltGykRtIJZEBuLrozJcgJDaa_2NUOklTBnM4QxzLotyYT2qGZfG8ZjCQ1IS8Cjw3JRcSdDX805l3QqgyPizHnn7NdkyOo1PRgXNHuFfTIyPbrTLlU4njxjVTYdrZ-b9p9H18RAgUw" 
                alt="Client survey drone"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
              
              {/* Selection Check Square */}
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-none border flex items-center justify-center shadow-sm ${
                selected === 'client' 
                ? 'bg-[#ca0013] border-[#ca0013]' 
                : 'border-[#b7c6c2] bg-white/80 backdrop-blur-sm'
              }`}>
                <Check size={12} className={`text-white ${selected === 'client' ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
            
            {/* Text details */}
            <div className="p-4 flex flex-col justify-center">
              <h2 className="text-base font-headline font-black text-[#000201] mb-1">
                {t('I Need Drone Services')}
              </h2>
              <p className="text-[#747874] text-xs leading-relaxed">
                Hire professional pilots for aerial photography, inspections, mapping, or agricultural monitoring with enterprise-grade security.
              </p>
            </div>
          </div>

          {/* Pilot Role Card */}
          <div 
            onClick={() => setSelected('pilot')}
            className={`group relative cursor-pointer rounded-none border flex flex-col overflow-hidden shadow-sm ${
              selected === 'pilot' 
              ? 'border-[#ca0013] bg-white ring-1 ring-[#ca0013]/25' 
              : 'border-[#b7c6c2]/60 bg-white hover:border-neutral-300'
            }`}
          >
            {/* Image Banner */}
            <div className="h-32 w-full overflow-hidden bg-neutral-200 relative">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSxb1o191CQhouUKX0ug1lyvA_JO6PmmHOQUN03n13IfRLG4_kjk3p_Ak76_oxirai8RCafODohv7tqhmLMa_n5_5RHe0PKjXafnHoK9i48_y1SHsw_6SF71RIgYQPzJ27w2eHp0-ydAre_bAWOjFbJymtZz0kCNS5400OX6p9cZl8-A6DPwCKzEJd5FZMAR9hQUAqbeFgQCCQwx0SrJq3sRx5wXFyK-SjhC9Dm1JRJdRferfYftQDnKDCI8UiSUJ55Ri8tlGTxeg" 
                alt="Pilot remote controller"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
              
              {/* Selection Check Square */}
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-none border flex items-center justify-center shadow-sm ${
                selected === 'pilot' 
                ? 'bg-[#ca0013] border-[#ca0013]' 
                : 'border-[#b7c6c2] bg-white/80 backdrop-blur-sm'
              }`}>
                <Check size={12} className={`text-white ${selected === 'pilot' ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
            
            {/* Text details */}
            <div className="p-4 flex flex-col justify-center">
              <h2 className="text-base font-headline font-black text-[#000201] mb-1">
                {t('I Am a Drone Pilot')}
              </h2>
              <p className="text-[#747874] text-xs leading-relaxed">
                Find high-value flight missions, manage your fleet, and access automated flight planning tools for professional operations.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer CTA */}
      <footer className="w-full flex flex-col items-center gap-3 mt-4 z-10">
        <button 
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-4 rounded-none font-headline font-bold text-base tracking-wider uppercase ${
            selected 
            ? 'bg-[#ca0013] text-white shadow-md cursor-pointer' 
            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {t('Continue')}
        </button>
        <p className="text-[10px] font-headline font-bold uppercase text-[#747874] tracking-widest">Step 1 of 3</p>
      </footer>
    </div>
  );
}
