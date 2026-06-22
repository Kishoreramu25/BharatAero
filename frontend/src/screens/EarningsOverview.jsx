import React from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { ArrowLeft, TrendingUp, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function EarningsOverview() {
  const { bookings, getCompletedEarnings, navigate, activeTab } = useApp();

  const totalEarnings = getCompletedEarnings();
  
  // Filter bookings that contribute to earnings
  const completedMissions = bookings.filter(b => b.status === 'Completed' || b.status === 'Confirmed');
  const pendingSum = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').reduce((sum, b) => sum + b.price, 0);
  const nextDepositDate = pendingSum > 0 ? "June 20, 2026" : "N/A";

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full pb-[60px] relative select-none">
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex items-center px-4 h-[64px] border-b border-[#b7c6c2]/15 z-40">
        <button 
          onClick={() => navigate('pilot_dashboard')}
          className="w-10 h-10 flex items-center justify-center rounded-none hover:bg-neutral-100"
        >
          <ArrowLeft size={18} className="text-[#000201]" />
        </button>
        <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">Earnings console</span>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-5 pt-4 space-y-6 overflow-y-auto no-scrollbar">
        
        {/* Earnings Card */}
        <div className="bg-white rounded-none border border-[#b7c6c2]/60 p-5 shadow-sm text-center relative overflow-hidden">
          <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider">Total balance</p>
          <h2 className="text-4xl font-headline font-black text-[#000201] mt-1">${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          
          {totalEarnings > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-xs mt-2.5">
              <TrendingUp size={14} />
              <span>+14.8% growth this month</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#b7c6c2]/10 text-left">
            <div>
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Pending payouts</p>
              <p className="text-sm font-bold text-[#000201] mt-0.5">${pendingSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="border-l border-[#b7c6c2]/15 pl-4">
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Next Deposit</p>
              <p className="text-sm font-bold text-[#000201] mt-0.5">{nextDepositDate}</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions list */}
        <div className="space-y-3">
          <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-[#000201]">Recent Flight Payouts</h3>
          
          <div className="flex flex-col gap-3">
            {completedMissions.map((bkg) => (
              <div 
                key={bkg.id}
                className="bg-white rounded-none border border-[#b7c6c2]/60 p-3.5 flex justify-between items-center shadow-sm"
              >
                <div className="flex gap-3 items-center">
                  <div className="p-2 rounded-none bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-headline font-bold text-[#000201]">{bkg.type}</h4>
                    <p className="text-[9px] text-[#747874] mt-0.5">{bkg.location}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600 font-headline">+${bkg.price}.00</p>
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5 font-mono">{bkg.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Pilot Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
