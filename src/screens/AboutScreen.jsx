import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ShieldCheck, Flame, Compass, Cpu, Leaf, Eye, Video } from 'lucide-react';

export default function AboutScreen() {
  const { navigate, userRole } = useApp();

  const handleBack = () => {
    if (userRole === 'pilot') {
      navigate('pilot_dashboard', 'home');
    } else {
      navigate('client_dashboard', 'home');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-6 relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex items-center px-4 h-[64px] border-b border-[#b7c6c2]/15 z-40">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-neutral-100"
        >
          <ArrowLeft size={18} className="text-[#000201]" />
        </button>
        <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">About DronePilot</span>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-5 pt-4 space-y-6 overflow-y-auto no-scrollbar pb-6">
        
        {/* Hero Banner Section */}
        <section className="space-y-3">
          <span className="text-[10px] font-headline font-bold text-[#ca0013] uppercase tracking-wider block">UAV Platform</span>
          <h1 className="text-3xl font-headline font-black text-[#000201] leading-tight tracking-tight">
            Engineered for Precision
          </h1>
          <p className="text-xs text-[#444844] font-body leading-relaxed">
            We redefine flight through mathematical absolute. Our philosophy is rooted in the intersection of organic safety and surgical technological accuracy.
          </p>
          
          <div className="relative rounded-none overflow-hidden border border-[#b7c6c2]/60 shadow-sm h-40 bg-neutral-200">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvh3niNlZ0B46ud-IYdcnnuaGBIo5BluE47jyZ5N-nvmNsPHdq1eoH8LSGFBXGC82aBPQNDRhdmHEvS08VkucfteWXkenMWqTmAtzUPYiTYXTBbL0AVAgwHHDNFxvefMaRyCUO66G5SfzPyGXPuTQ_3VYgcTeii3_KPLpP5DydZSjyBAaQK1nwkMtouF0L0CwxKitOXW5vA9zwpmyaEVUodPhRrXNDs4gPnAi06MgLxduGI9hnNtW9gOcnQQgDQmtDeft8A4mC-jg" 
              alt="Professional Drone"
            />
            <div className="absolute top-2.5 right-2.5 bg-[#ca0013] text-white font-headline font-bold text-[9px] px-2 py-0.5 rounded-none uppercase tracking-wider">
              99.9% Accuracy
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="grid grid-cols-1 gap-3.5">
          <div className="p-4 bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-none bg-red-50 text-[#ca0013]">
              <Cpu size={16} />
            </div>
            <div>
              <h3 className="text-xs font-headline font-black text-[#000201]">Algorithmic Mastery</h3>
              <p className="text-[10px] text-[#444844] mt-1 leading-relaxed">
                Proprietary processing models compute environmental telemetry to maintain sub-millimeter positioning accuracy.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-none border border-[#b7c6c2]/60 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-none bg-emerald-50 text-emerald-600">
              <Leaf size={16} />
            </div>
            <div>
              <h3 className="text-xs font-headline font-black text-[#000201]">Organic Resilience</h3>
              <p className="text-[10px] text-[#444844] mt-1 leading-relaxed">
                Biomimicry inspired wing controls dynamically adjust prop angles to neutralize gusts and severe winds.
              </p>
            </div>
          </div>
        </section>

        {/* Specialized Sectors */}
        <section className="space-y-3">
          <h2 className="text-xs font-headline font-bold uppercase tracking-wider text-[#000201] pl-1">Specialized Sectors</h2>
          
          <div className="grid grid-cols-1 gap-3.5">
            <div className="bg-[#171e19] text-white rounded-none p-4 relative overflow-hidden flex flex-col justify-between min-h-[130px]">
              <div>
                <span className="px-2 py-0.5 bg-[#44f3a9]/10 text-[#44f3a9] font-headline text-[8px] font-bold rounded-none uppercase">Farming</span>
                <h4 className="text-sm font-headline font-bold mt-1 text-[#44f3a9]">Precision Agriculture</h4>
                <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px]">Multispectral mapping which increases farm yield calculations.</p>
              </div>
              <span className="material-symbols-outlined text-[60px] text-neutral-800 absolute -right-3 -bottom-3 opacity-40">agriculture</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-[#000201] text-white rounded-none p-4 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
                <h4 className="text-xs font-headline font-bold text-red-500">Security</h4>
                <p className="text-[9px] text-neutral-400 mt-1">Thermal perimeters & AI tracking.</p>
                <span className="material-symbols-outlined text-[40px] text-neutral-900 absolute -right-2 -bottom-2 opacity-50">security</span>
              </div>
              <div className="bg-[#000201] text-white rounded-none p-4 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
                <h4 className="text-xs font-headline font-bold text-blue-400">DP Cinema</h4>
                <p className="text-[9px] text-neutral-400 mt-1">Stable payload dynamic camera grids.</p>
                <span className="material-symbols-outlined text-[40px] text-neutral-900 absolute -right-2 -bottom-2 opacity-50">videocam</span>
              </div>
            </div>
          </div>
        </section>

        {/* Global Statistics */}
        <section className="bg-[#000201] text-white rounded-none p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-32 h-32 border-[20px] border-white/5 rounded-none"></div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#ca0013]/10 rounded-none rotate-45"></div>

          <ShieldCheck size={28} className="text-[#ca0013] mx-auto stroke-[2]" />
          <h3 className="text-sm font-headline font-black">Airborne Intelligence Standard</h3>
          
          <div className="grid grid-cols-3 gap-2 border-t border-neutral-800/80 pt-4">
            <div>
              <div className="text-sm font-black text-[#ca0013]">150+</div>
              <div className="text-[7px] font-headline font-bold text-neutral-400 uppercase tracking-wider">Patents</div>
            </div>
            <div className="border-l border-neutral-800/85">
              <div className="text-sm font-black text-[#ca0013]">12k</div>
              <div className="text-[7px] font-headline font-bold text-neutral-400 uppercase tracking-wider">Pilots</div>
            </div>
            <div className="border-l border-neutral-800/85">
              <div className="text-sm font-black text-[#ca0013]">0.001s</div>
              <div className="text-[7px] font-headline font-bold text-neutral-400 uppercase tracking-wider">Latency</div>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
