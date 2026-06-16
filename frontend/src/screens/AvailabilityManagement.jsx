import React from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Calendar, Save, Check } from 'lucide-react';

export default function AvailabilityManagement() {
  const { availability, setAvailability, navigate, activeTab } = useApp();

  const handleToggle = (day) => {
    setAvailability(prev => 
      prev.map(item => {
        if (item.day === day) {
          const nextChecked = !item.checked;
          return {
            ...item,
            checked: nextChecked,
            status: nextChecked ? 'Active' : 'Unavailable',
            hours: nextChecked ? '08:00 AM - 06:00 PM' : 'Rest Day'
          };
        }
        return item;
      })
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    navigate('pilot_dashboard');
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
        <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">Deploy Schedule</span>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-5 pt-4 space-y-4 overflow-y-auto no-scrollbar">
        <div>
          <h2 className="text-sm font-headline font-black text-[#000201] uppercase tracking-wider">Weekly Deploy availability</h2>
          <p className="text-xs text-[#747874]">Set times you are open to receive UAV mission broadcasts.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pb-6">
          
          {/* Days List */}
          <div className="flex flex-col gap-3">
            {availability.map((item) => (
              <div 
                key={item.day}
                className={`bg-white rounded-none border p-3.5 flex justify-between items-center ${
                  item.checked 
                  ? 'border-[#ca0013]/60 shadow-sm' 
                  : 'border-[#b7c6c2]/60 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                   {/* Custom Checkbox */}
                  <div 
                    onClick={() => handleToggle(item.day)}
                    className={`w-5 h-5 rounded-none border flex items-center justify-center cursor-pointer ${
                      item.checked 
                      ? 'bg-[#ca0013] border-[#ca0013]' 
                      : 'border-[#b7c6c2] bg-white'
                    }`}
                  >
                    <Check size={12} className={`text-white ${item.checked ? 'opacity-100' : 'opacity-0'}`} />
                  </div>

                  <div>
                    <h4 className="text-xs font-headline font-black text-[#000201]">{item.day}</h4>
                    <p className="text-[10px] text-[#747874] mt-0.5">{item.hours}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider ${
                  item.checked 
                  ? 'bg-red-50 text-[#ca0013]' 
                  : 'bg-neutral-100 text-[#444844]'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button 
            type="submit"
            className="w-full bg-[#ca0013] text-white py-4 rounded-none font-headline font-bold text-xs hover:opacity-95 tracking-wider uppercase flex items-center justify-center gap-1.5"
          >
            <span>Save Deploy Schedule</span>
            <Save size={14} />
          </button>
        </form>
      </main>

      {/* Pilot Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}