import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function OnboardingCarousel() {
  const { setCurrentScreen, t } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "National Recognition",
      desc: "National recognition for innovation and development, affirming Bharat Aero's position as a leader in autonomous robotics and precision engineering.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvnmvEKDjKbvPfrdMrJBfZXpeggFF-517U3vv4ze4qjc_7XrOXU6BO7kc0iv6CfrN_6bGqHWnw-J_B3QVKaVrGEUHb9FFurb0YZZGlww_HzTH1wQxPjt-r7BxabxGjbXafNkvP_tnlncV03xAxfDR7AyhvqN44G3H3gR3v09NzQngu5of-FZOngxu8DAHxHTcOEKtqlfl1vraNm71bg5cUA0AlmGUdMUnYDzQhK110lHpqm30GPbU_-ZbQoCHBcWH5Dw6skQa93yY"
    },
    {
      title: "Real-time Surveillance",
      desc: "Advanced monitoring solutions for infrastructure, security, and large-scale industrial projects with expert pilots.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB27CXi2vNk2wo4hvXfwgA7KkjW0qw-bipb9OMJ14Dt3wyHyHnj2GmzC4ufDjJBNsg9AedVTqds72uyh8tlek3r39LIoBH8GId-XDzCzoAqxe_u-ssub9fpAPkQZQbzpmOGt-N5D8tDwORobtVPhVpujyVzfKnP4q8J56Cau8Lf6VqovjkerZfovP4l0ge78ZWhw1ET4vaStaz17OhfPnGc--fSvyPfr-_IUpMFsStlx3FKeFYHYB5BhQImckcWVj6YD1QvBK4tiMc"
    },
    {
      title: "Precision UAV Flight Ops",
      desc: "Plan and track complex missions with high-fidelity telemetry, instant airspace clearance, and full automation integrations.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXjE2_9Uj6PCnGnvdW5Q8zY9BV0Qxwf7QmWw-aGYicheZpA2m_pa3f3Q65QmAoF5gpxZym31kIU2G86FlrBzfPr_juQAMN7eC3fePY2WmPZC2pUBa0jX7gEh32mqyOSUo5U8ltGykRtIJZEBuLrozJcgJDaa_2NUOklTBnM4QxzLotyYT2qGZfG8ZjCQ1IS8Cjw3JRcSdDX805l3QqgyPizHnn7NdkyOo1PRgXNHuFfTIyPbrTLlU4njxjVTYdrZ-b9p9H18RAgUw"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Go to role selection
      setCurrentScreen('role_selection');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#0d0e12] text-[#1b1c1b] dark:text-[#dce5dc] h-full min-h-screen min-h-[100dvh] relative overflow-hidden select-none">
      
      {/* Top Action Bar */}
      <div className="absolute top-6 left-0 w-full px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="text-[#000201] dark:text-white font-black text-xl font-headline">Bharat</span>
          <span className="text-[#444844] dark:text-neutral-400 font-body opacity-80 text-sm">Aero</span>
        </div>
        <button 
          onClick={() => setCurrentScreen('role_selection')}
          className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#1b1c1b] dark:text-white font-headline text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors"
        >
          {t('Skip')}
        </button>
      </div>

      {/* Slide Carousel Track */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div 
          className="flex-1 flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className="w-full flex-shrink-0 flex flex-col h-full justify-between"
            >
              {/* Carousel slide image container */}
              <div className="relative w-full h-[52vh] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <img 
                  className="w-full h-full object-cover" 
                  src={slide.image} 
                  alt={slide.title} 
                />
                {/* Fade bottom shadow seamlessly into background */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white dark:to-[#0d0e12]"></div>
              </div>

              {/* Slide Info Section */}
              <div className="flex-grow flex flex-col justify-center px-6 py-2">
                <div className="bg-neutral-50/90 dark:bg-[#16171d] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col gap-2.5 shadow-sm relative z-10">
                  <h2 className="text-2xl font-headline font-black text-[#000201] dark:text-white tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-[#444844] dark:text-neutral-400 font-body text-sm leading-relaxed">
                    {slide.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full px-6 pb-8 pt-3 flex flex-col gap-4 relative z-10 bg-white dark:bg-[#0d0e12]">
        
        {/* Slide Indicators */}
        <div className="flex justify-center items-center gap-2.5">
          {slides.map((_, index) => (
            <div 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentSlide 
                ? 'w-6 bg-[#ca0013]' 
                : 'w-2 bg-neutral-300 dark:bg-neutral-700'
              }`}
            ></div>
          ))}
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={handleNext}
          className="w-full bg-[#ca0013] text-white py-4 rounded-xl font-headline font-bold text-base hover:bg-[#b00010] active:scale-[0.99] transition-all uppercase tracking-wider shadow-lg shadow-[#ca0013]/20"
        >
          {currentSlide === slides.length - 1 ? t('Get Started') : t('Next')}
        </button>

        <p className="text-center text-[10px] text-[#747874] dark:text-neutral-500 font-bold uppercase tracking-widest">
          {t('Made in India')}
        </p>
      </div>
    </div>
  );
}
