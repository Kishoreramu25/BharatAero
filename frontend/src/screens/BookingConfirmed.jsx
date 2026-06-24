import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, ClipboardCheck, ArrowRight, ShieldCheck, Download } from 'lucide-react';

export default function BookingConfirmed() {
  const { navigate, bookings } = useApp();
  
  // Get the most recent booking
  const latestBooking = bookings[0] || {
    id: 'BKG-4091',
    pilotName: 'Alex Mercer',
    date: '2026-06-18',
    timeSlot: '09:00 AM - 12:00 PM',
    type: 'Agricultural Survey',
    price: 650,
    location: 'Sector-4 Agritech Fields'
  };

  const handleDownloadInvoice = () => {
    const applicantNumber = latestBooking.id || `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceHTML = `
      <html>
        <head>
          <title>Mission Invoice - ${applicantNumber}</title>
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
            .price-box { background-color: #f9fafb; padding: 20px; text-align: right; border: 1px solid #e5e7eb; border-left: 4px solid #ca0013; }
            .price-label { font-size: 12px; font-weight: bold; color: #747874; text-transform: uppercase; letter-spacing: 1px; }
            .price-value { font-size: 24px; font-weight: 900; color: #ca0013; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo">BHARATAERO</h1>
            <p class="sub-logo">UAV Mission Dispatch & Escrow</p>
          </div>
          
          <div class="invoice-title">Official Mission Receipt</div>
          
          <div class="details-grid">
            <div class="detail-box">
              <div class="label">Applicant / Broadcast Number</div>
              <p class="value">${applicantNumber}</p>
            </div>
            <div class="detail-box">
              <div class="label">Mission Date</div>
              <p class="value">${latestBooking.date || 'TBD'}</p>
            </div>
            
            <div class="detail-box full-width">
              <div class="label">Mission Title</div>
              <p class="value">${latestBooking.title || latestBooking.type || 'Custom Flight Mission'}</p>
            </div>
            
            <div class="detail-box">
              <div class="label">Category / Type</div>
              <p class="value">${latestBooking.type || 'N/A'}</p>
            </div>
            <div class="detail-box">
              <div class="label">Time Schedule</div>
              <p class="value">${latestBooking.timeSlot || 'N/A'}</p>
            </div>
            
            <div class="detail-box full-width">
              <div class="label">Location Zone</div>
              <p class="value">${latestBooking.location || 'N/A'}</p>
            </div>

            <div class="detail-box full-width">
              <div class="label">Equipment Requested</div>
              <p class="value">${latestBooking.droneModel || 'Any capable UAV'}</p>
            </div>
          </div>
          
          <div class="price-box">
            <div class="price-label">Total Estimated Budget (INR)</div>
            <div class="price-value">₹${latestBooking.price || 0}</div>
          </div>
          
          <div class="footer">
            <p>This is a system-generated document and does not require a physical signature.</p>
            <p>For support, contact dispatch@bharataero.in</p>
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
    <div className="flex-1 flex flex-col justify-between bg-white text-[#1b1c1b] h-full p-6 select-none relative">
      
      {/* Spacer Header */}
      <div className="h-6"></div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center items-center text-center space-y-6">
        
        {/* Animated Check Circle */}
        <div className="relative">
          <div className="w-20 h-20 rounded-none bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
            <Check size={36} className="text-emerald-600 stroke-[3]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-none bg-primary flex items-center justify-center border border-white">
            <ShieldCheck size={12} className="text-on-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-headline font-black text-[#000201] tracking-tight">
            Booking Confirmed
          </h1>
          <p className="text-xs text-[#747874] max-w-xs mx-auto">
            Your flight mission request has been secure-broadcasted to the operator. Clearances are being verified.
          </p>
        </div>

        {/* Dynamic Detail Card */}
        <div className="w-full bg-white rounded-none border border-[#b7c6c2]/60 p-5 shadow-sm text-left space-y-3.5">
          <div className="flex justify-between items-center pb-2.5 border-b border-[#b7c6c2]/10">
            <span className="text-[10px] font-headline font-bold text-[#747874] uppercase">Broadcast Code</span>
            <span className="text-xs font-mono font-bold text-[#000201]">{latestBooking.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Mission Title</p>
              <p className="text-xs font-bold text-[#000201] mt-0.5 truncate">{latestBooking.title || latestBooking.type}</p>
            </div>
            <div>
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Operator</p>
              <p className="text-xs font-bold text-amber-600 mt-0.5">
                {latestBooking.pilotName === 'Unassigned' ? 'Awaiting Pilot' : latestBooking.pilotName}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Category</p>
              <p className="text-xs font-bold text-[#000201] mt-0.5 truncate">{latestBooking.type}</p>
            </div>
            <div>
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Schedule</p>
              <p className="text-xs font-bold text-[#000201] mt-0.5">{latestBooking.date}</p>
            </div>
            <div>
              <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Budget Est.</p>
              <p className="text-xs font-bold text-[#ca0013] mt-0.5">₹{latestBooking.price}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#b7c6c2]/10">
            <p className="text-[9px] font-headline font-bold text-[#747874] uppercase">Location Zone</p>
            <p className="text-xs text-[#444844] mt-0.5">{latestBooking.location}</p>
          </div>
        </div>

      </main>

      {/* Action Buttons Footer */}
      <footer className="w-full flex flex-col gap-3 mt-6">
        <button 
          onClick={handleDownloadInvoice}
          className="w-full bg-neutral-900 text-white py-4 rounded-none font-headline font-bold text-xs hover:bg-neutral-800 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <span>Download PDF Receipt</span>
          <Download size={14} />
        </button>

        <button 
          onClick={() => navigate('my_bookings', 'bookings')}
          className="w-full bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs hover:opacity-95 tracking-wider uppercase flex items-center justify-center gap-1.5"
        >
          <span>Track Mission logs</span>
          <ClipboardCheck size={14} />
        </button>

        <button 
          onClick={() => navigate('client_dashboard', 'home')}
          className="w-full bg-white border border-[#b7c6c2]/25 text-[#000201] py-4 rounded-none font-headline font-bold text-xs hover:bg-neutral-50 uppercase tracking-wider"
        >
          Return to Console
        </button>
      </footer>
    </div>
  );
}
