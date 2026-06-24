import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { ArrowLeft, TrendingUp, Calendar, ArrowUpRight, CheckCircle2, Navigation, Download, X } from 'lucide-react';

export default function EarningsOverview() {
  const { bookings, getCompletedEarnings, navigate, registeredUser } = useApp();
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

  const currentPilotName = registeredUser?.name || 'New Operator';
  const totalEarnings = getCompletedEarnings();
  
  // Filter bookings
  const pastMissions = bookings.filter(b => b.status === 'Completed' && b.pilotName === currentPilotName);
  const activeMissions = bookings.filter(b => b.status === 'Confirmed' && b.pilotName === currentPilotName);
  
  const pendingSum = activeMissions.reduce((sum, b) => sum + b.price, 0);
  const nextDepositDate = pendingSum > 0 ? "Next Friday" : "N/A";

  const handleDownloadInvoice = (mission) => {
    const applicantNumber = mission.id;
    // Platform fee standard deduction
    const platformFee = 100;
    const netPayout = mission.price - platformFee;
    
    const invoiceHTML = `
      <html>
        <head>
          <title>Pilot Remittance Advice - ${applicantNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1b1c1b; margin: 0; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #ca0013; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; color: #ca0013; text-transform: uppercase; }
            .sub-logo { font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #747874; text-transform: uppercase; }
            .invoice-title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .detail-box { border: 1px solid #e5e7eb; padding: 15px; }
            .label { font-size: 10px; font-weight: bold; color: #747874; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .value { font-size: 14px; font-weight: bold; margin: 0; }
            .full-width { grid-column: 1 / -1; }
            .footer { text-align: center; font-size: 10px; color: #747874; margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            .price-box { background-color: #f9fafb; padding: 20px; text-align: right; border: 1px solid #e5e7eb; border-left: 4px solid #ca0013; margin-bottom: 10px; }
            .deduction-box { background-color: #fff1f2; padding: 15px 20px; text-align: right; border: 1px solid #e5e7eb; border-left: 4px solid #9f1239; margin-bottom: 10px; }
            .net-box { background-color: #ecfdf5; padding: 20px; text-align: right; border: 1px solid #e5e7eb; border-left: 4px solid #059669; }
            .price-label { font-size: 12px; font-weight: bold; color: #747874; text-transform: uppercase; letter-spacing: 1px; }
            .price-value { font-size: 20px; font-weight: 900; color: #1b1c1b; margin-top: 5px; }
            .deduct-value { font-size: 16px; font-weight: bold; color: #9f1239; margin-top: 5px; }
            .net-value { font-size: 24px; font-weight: 900; color: #059669; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo">BHARATAERO</h1>
            <p class="sub-logo">Pilot Remittance & Settlement</p>
          </div>
          
          <div class="invoice-title">Mission Payment Breakdown</div>
          
          <div class="details-grid">
            <div class="detail-box">
              <div class="label">Mission ID</div>
              <p class="value">${applicantNumber}</p>
            </div>
            <div class="detail-box">
              <div class="label">Pilot / Operator</div>
              <p class="value">${currentPilotName}</p>
            </div>
            
            <div class="detail-box full-width">
              <div class="label">Mission Title</div>
              <p class="value">${mission.title || mission.type || 'Custom Flight Mission'}</p>
            </div>
            
            <div class="detail-box">
              <div class="label">Date Executed</div>
              <p class="value">${mission.date}</p>
            </div>
            <div class="detail-box">
              <div class="label">Status</div>
              <p class="value">${mission.status}</p>
            </div>
          </div>
          
          <div class="price-box">
            <div class="price-label">Gross Mission Value (INR)</div>
            <div class="price-value">₹${mission.price}</div>
          </div>

          <div class="deduction-box">
            <div class="price-label">BharatAero Platform / Dispatch Fee</div>
            <div class="deduct-value">- ₹${platformFee}</div>
          </div>

          <div class="net-box">
            <div class="price-label">Net Payout to Pilot</div>
            <div class="net-value">₹${netPayout}</div>
          </div>
          
          <div class="footer">
            <p>This statement serves as a formal remittance advice from the BharatAero Escrow System.</p>
            <p>For payout support, contact billing@bharataero.in</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      alert("Please allow popups to download the invoice.");
    }
  };

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
          <p className="text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider">Total Lifetime Earnings</p>
          <h2 className="text-4xl font-headline font-black text-[#000201] mt-1">₹{totalEarnings.toLocaleString('en-IN')}</h2>
          
          {totalEarnings > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-xs mt-2.5">
              <TrendingUp size={14} />
              <span>+14.8% growth this month</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#b7c6c2]/10 text-left">
            <div>
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Pending Escrow</p>
              <p className="text-sm font-bold text-[#000201] mt-0.5">₹{pendingSum.toLocaleString('en-IN')}</p>
            </div>
            <div className="border-l border-[#b7c6c2]/15 pl-4">
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Next Deposit</p>
              <p className="text-sm font-bold text-[#000201] mt-0.5">{nextDepositDate}</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100 rounded-none p-1 shadow-inner border border-neutral-200">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-[10px] font-headline font-bold uppercase tracking-wider text-center transition-colors ${activeTab === 'active' ? 'bg-white text-[#ca0013] shadow-sm border border-neutral-200/50' : 'text-[#747874] hover:text-[#000201]'}`}
          >
            Active Missions ({activeMissions.length})
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 text-[10px] font-headline font-bold uppercase tracking-wider text-center transition-colors ${activeTab === 'past' ? 'bg-white text-[#ca0013] shadow-sm border border-neutral-200/50' : 'text-[#747874] hover:text-[#000201]'}`}
          >
            Past Missions ({pastMissions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="pb-4">
          {activeTab === 'active' ? (
            <div className="flex flex-col gap-3">
              {activeMissions.length > 0 ? activeMissions.map((bkg) => (
                <div 
                  key={bkg.id}
                  onClick={() => setSelectedMission(bkg)}
                  className="bg-white rounded-none border border-[#ca0013]/30 p-3.5 flex justify-between items-center shadow-sm cursor-pointer hover:bg-red-50/30"
                >
                  <div className="flex gap-3 items-center">
                    <div className="p-2 rounded-none bg-red-50 text-[#ca0013]">
                      <Navigation size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-headline font-bold text-[#000201]">{bkg.type}</h4>
                      <p className="text-[9px] text-[#747874] mt-0.5">{bkg.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#000201] font-headline">₹{bkg.price}</p>
                    <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5 font-mono">{bkg.id}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 border border-dashed border-[#b7c6c2] bg-neutral-50">
                  <p className="text-xs font-bold text-[#747874] uppercase tracking-wider">No active missions right now</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pastMissions.length > 0 ? pastMissions.map((bkg) => (
                <div 
                  key={bkg.id}
                  onClick={() => setSelectedMission(bkg)}
                  className="bg-white rounded-none border border-[#b7c6c2]/60 p-3.5 flex justify-between items-center shadow-sm cursor-pointer hover:bg-neutral-50"
                >
                  <div className="flex gap-3 items-center">
                    <div className="p-2 rounded-none bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-headline font-bold text-[#000201]">{bkg.type}</h4>
                      <p className="text-[9px] text-[#747874] mt-0.5">{bkg.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 font-headline">+₹{bkg.price}</p>
                    <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5 font-mono">{bkg.id}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 border border-dashed border-[#b7c6c2] bg-neutral-50">
                  <p className="text-xs font-bold text-[#747874] uppercase tracking-wider">No completed missions yet</p>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Mission Detail & Invoice Modal */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900/40 backdrop-blur-sm justify-end">
          <div className="bg-white w-full h-[80vh] rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            <header className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-black font-headline text-[#000201]">Mission Details</h3>
              <button 
                onClick={() => setSelectedMission(null)}
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="text-center pb-4 border-b border-gray-100">
                <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">{selectedMission.id}</p>
                <h4 className="text-2xl font-black font-headline text-[#ca0013]">₹{selectedMission.price}</h4>
                <span className={`inline-block mt-2 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm ${selectedMission.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedMission.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">Title</p>
                  <p className="text-sm font-bold">{selectedMission.title || selectedMission.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">Location</p>
                  <p className="text-sm font-bold">{selectedMission.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold">{selectedMission.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#747874] font-bold uppercase tracking-widest mb-1">Time</p>
                    <p className="text-sm font-bold">{selectedMission.timeSlot}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border border-gray-200 text-xs text-[#747874]">
                <div className="flex justify-between mb-2">
                  <span>Gross Value</span>
                  <span className="font-bold text-[#000201]">₹{selectedMission.price}</span>
                </div>
                <div className="flex justify-between mb-2 text-red-600">
                  <span>Platform Fee</span>
                  <span className="font-bold">-₹100</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-bold text-[#000201] uppercase">Net Earnings</span>
                  <span className="font-bold text-emerald-600">₹{selectedMission.price - 100}</span>
                </div>
              </div>
            </div>

            <footer className="p-5 border-t border-gray-100 bg-white">
              <button 
                onClick={() => handleDownloadInvoice(selectedMission)}
                className="w-full bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs hover:bg-red-700 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Download Payout Invoice</span>
                <Download size={14} />
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Pilot Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
