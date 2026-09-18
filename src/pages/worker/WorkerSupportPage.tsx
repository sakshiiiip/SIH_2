import React from 'react';
import { SupportPanel } from '../../components/worker/SupportPanel';
import { HeadphonesIcon, MessageSquare, Phone, FileText } from 'lucide-react';

// ==================================================================
// PERSON 5 INTEGRATION POINT
// This entire page is a placeholder for Person 5's Human Agent
// Support module. The SupportPanel component inside is the entry
// point. Replace SupportPanel's internals with the real support
// system when Person 5 builds the backend.
// ==================================================================
export const WorkerSupportPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#292824] tracking-tight flex items-center gap-2">
          <HeadphonesIcon className="w-6 h-6 text-[#324F66]" />
          Worker Support
        </h1>
        <p className="text-xs text-[#77736B] mt-1">
          Get help from human agents for job issues, payments, and account queries
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <MessageSquare className="w-5 h-5 text-[#537895]" />, label: 'Chat Support', sub: 'Avg 3 min' },
          { icon: <Phone className="w-5 h-5 text-[#6E8B67]" />, label: 'Call Support', sub: 'Toll-free' },
          { icon: <FileText className="w-5 h-5 text-[#7A6A8E]" />, label: 'FAQs', sub: '50+ articles' },
        ].map(({ icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center">
            {icon}
            <span className="text-xs font-bold text-[#292824]">{label}</span>
            <span className="text-[10px] text-[#77736B]">{sub}</span>
          </div>
        ))}
      </div>

      {/* Support panel */}
      <SupportPanel />

      {/* FAQs placeholder */}
      <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#324F66]">Frequently Asked Questions</h3>
        {[
          'How do I accept or decline a job request?',
          'What happens if I miss a job?',
          'How is my 70% payout calculated?',
          'How do I report a problem during a job?',
          'How do I update my availability?',
          'How long does KYC verification take?',
        ].map((faq) => (
          <button
            key={faq}
            type="button"
            onClick={() => alert(`FAQ: ${faq}\n\nFull FAQ system will be available with Person 5's support module.`)}
            className="w-full text-left flex items-center justify-between px-3 py-2.5 bg-[#F3EEE4] hover:bg-[#EBE4D6] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] transition-colors cursor-pointer"
          >
            <span>{faq}</span>
            <span className="text-[#77736B] ml-2 shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  );
};
