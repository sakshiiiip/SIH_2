import React from 'react';
import { useTranslation } from 'react-i18next';
import { SupportPanel } from '../../components/worker/SupportPanel';
import { HeadphonesIcon, MessageSquare, Phone, FileText } from 'lucide-react';

export const WorkerSupportPage: React.FC = () => {
  const { t } = useTranslation();

  const QUICK_STATS = [
    { icon: <MessageSquare className="w-5 h-5 text-[#537895]" />, label: t('worker.support.chatSupport', 'Chat Support'), sub: t('worker.support.chatSub', 'Avg 3 min') },
    { icon: <Phone className="w-5 h-5 text-[#6E8B67]" />, label: t('worker.support.callSupport', 'Call Support'), sub: t('worker.support.callSub', 'Toll-free') },
    { icon: <FileText className="w-5 h-5 text-[#7A6A8E]" />, label: t('worker.support.faqs', 'FAQs'), sub: t('worker.support.faqsSub', '50+ articles') },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#292824] tracking-tight flex items-center gap-2">
          <HeadphonesIcon className="w-6 h-6 text-[#324F66]" />
          {t('worker.support.title', 'Worker Support')}
        </h1>
        <p className="text-xs text-[#77736B] mt-1">
          {t('worker.support.subtitle', 'Get help from human agents for job issues, payments, and account queries')}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {QUICK_STATS.map(({ icon, label, sub }) => (
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#324F66]">{t('worker.support.faqHeader', 'Frequently Asked Questions')}</h3>
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
            onClick={() => alert(`FAQ: ${faq}`)}
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
