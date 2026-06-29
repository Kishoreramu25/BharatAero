import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
        <h1 className="text-sm font-headline font-bold text-center absolute left-1/2 -translate-x-1/2 w-[200px]">Privacy Policy</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 py-6 space-y-6 text-xs text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">1. Introduction</h2>
          <p>
            Welcome to BharatAero. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our application.
          </p>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">2. Data Collection (GDPR)</h2>
          <p>
            We collect personal data strictly for providing drone simulation and booking services. You have the right to request access, correction, or deletion (Right to be Forgotten) of your personal data at any time via the Settings screen.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">3. Data Retention</h2>
          <p>
            System logs and non-essential notifications are automatically deleted after 30 days. Accounts inactive for an extended period may be purged in accordance with our data retention policies.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">4. Security</h2>
          <p>
            We employ industry-standard security measures including encryption and secure sessions to protect your information. Your session will automatically timeout after 30 minutes of inactivity for your protection.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#1b1c1b] mb-2">5. Contact Us</h2>
          <p>
            If you have questions about this policy, please contact our Data Protection Officer at privacy@bharataero.com.
          </p>
        </section>
      </div>
    </div>
  );
}
