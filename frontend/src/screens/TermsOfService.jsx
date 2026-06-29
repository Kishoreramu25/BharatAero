import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const { setCurrentScreen } = useApp();

  return (
    <div className="flex flex-col h-full bg-white text-[#1b1c1b] overflow-y-auto pb-10 select-none">
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <button 
          onClick={() => setCurrentScreen('login')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-[#1b1c1b] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-sm font-headline font-bold text-center absolute left-1/2 -translate-x-1/2 w-[200px]">Terms of Service</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 py-6 space-y-6 text-xs text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing and using BharatAero, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">2. User Responsibilities</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their account credentials. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">3. Booking and Services</h2>
          <p>
            BharatAero connects clients with drone pilots. We facilitate the booking process but are not responsible for the execution of the services. All disputes regarding services must be resolved directly between the client and pilot.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">4. Prohibited Conduct</h2>
          <p>
            You agree not to use the application for any unlawful purpose or in any way that interrupts, damages, or impairs the service provided. Rate limiting is enforced to prevent abuse.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">5. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the application following any changes indicates your acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  );
}
