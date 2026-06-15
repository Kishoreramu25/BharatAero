import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function OnboardingCarousel() {
  const { setCurrentScreen } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "National Recognition",
      desc: "National recognition for innovation and development, affirming MISD's position as a leader in autonomous robotics and precision engineering.",
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
    <div className="light flex-1 flex flex-col justify-between bg-background text-on-background h-full relative overflow-hidden select-none">
      
      {/* Top Action Bar */}
      <div className="absolute top-6 left-0 w-full px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="text-[#000201] font-black text-xl font-headline">MISD</span>
          <span className="text-[#444844] font-body opacity-60 text-sm">DronePilot</span>
        </div>
        <button 
          onClick={() => setCurrentScreen('role_selection')}
          className="bg-[#b7c6c2]/20 hover:bg-[#b7c6c2]/35 text-[#1b1c1b] font-headline text-[10px] font-bold px-4 py-2 rounded-none uppercase tracking-wider"
        >
          Skip
        </button>
      </div>

      {/* Slide Carousel Track */}
      <div className="flex-1 flex flex-col">
        {/* Carousel slide container */}
        <div className="relative w-full h-[55%] overflow-hidden bg-neutral-200">
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 w-full h-full`}
              style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
            >
              <img 
                className="w-full h-full object-cover" 
                src={slide.image} 
                alt={slide.title} 
              />
              {/* Fade bottom shadow */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#eeebe3]"></div>
            </div>
          ))}
        </div>

        {/* Slide Info Section */}
        <div className="flex-grow flex flex-col justify-end px-6 pb-6 pt-2">
          <div className="bg-white border border-[#b7c6c2]/60 rounded-none p-8 flex flex-col gap-3 min-h-[200px] shadow-sm relative z-10">
            <h2 className="text-2xl font-headline font-black text-[#000201] tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-[#444844] font-body text-sm leading-relaxed">
              {slides[currentSlide].desc}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full px-6 pb-6 flex flex-col gap-4 relative z-10">
        
        {/* Slide Indicators */}
        <div className="flex justify-center items-center gap-2.5">
          {slides.map((_, index) => (
            <div 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 cursor-pointer ${
                index === currentSlide 
                ? 'w-6 bg-[#ca0013]' 
                : 'w-2 bg-[#dcd9d8]'
              }`}
            ></div>
          ))}
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={handleNext}
          className="w-full bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-base hover:opacity-95 uppercase tracking-wider"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>

        <p className="text-center text-[10px] text-[#747874] font-bold uppercase tracking-widest">
          Proudly Made In India
        </p>
      </div>
    </div>
  );
}
