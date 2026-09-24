import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone, ChevronDown, ChevronUp, HeadphonesIcon, Clock } from 'lucide-react';

interface SupportPanelProps {
  onClose?: () => void;
  compact?: boolean; // true = floating button variant
}

export const SupportPanel: React.FC<SupportPanelProps> = ({ onClose, compact = false }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(!compact);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setMessageSent(true);
    setMessageText('');
  };

  if (compact && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#537895] hover:bg-[#41637E] text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
      >
        <HeadphonesIcon className="w-4 h-4" />
        {t('worker.support.talkToAgent', 'Talk to Human Agent')}
      </button>
    );
  }

  const QUICK_TOPICS = [
    { key: 'topicJobAcceptance', text: t('worker.support.topicJobAcceptance', '❓ Job acceptance issue') },
    { key: 'topicPayment', text: t('worker.support.topicPayment', '💰 Payment not received') },
    { key: 'topicExecution', text: t('worker.support.topicExecution', '🛠️ Job execution problem') },
    { key: 'topicKyc', text: t('worker.support.topicKyc', '📋 Account / KYC issue') },
    { key: 'topicEmergency', text: t('worker.support.topicEmergency', '🚨 Emergency situation') },
  ];

  return (
    <div className="bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#324F66] text-white">
        <div className="flex items-center gap-2">
          <HeadphonesIcon className="w-4 h-4" />
          <span className="text-sm font-bold">{t('worker.support.humanAgentTitle', 'Human Agent Support')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-[#A8D0E6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6DE89A] animate-pulse" />
            {t('worker.support.agentsOnline', 'Agents Online')}
          </span>
          {compact && (
            <button type="button" onClick={() => setExpanded(false)} className="text-white/70 hover:text-white cursor-pointer">
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="text-white/70 hover:text-white cursor-pointer text-lg leading-none">
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status banner */}
        <div className="flex items-center gap-2 p-3 bg-[#E4EDF4] border border-[#B8CBDD] rounded-xl">
          <Clock className="w-4 h-4 text-[#324F66] shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#324F66]">{t('worker.support.avgWait', 'Average wait: ~3 minutes')}</p>
            <p className="text-[10px] text-[#537895]">{t('worker.support.agentsAvailableHours', 'Human agents available 7 AM – 10 PM IST')}</p>
          </div>
        </div>

        {/* Quick options */}
        <div>
          <p className="text-xs font-bold text-[#77736B] mb-2 uppercase tracking-wider">{t('worker.support.quickHelpTopics', 'Quick Help Topics')}</p>
          <div className="space-y-1.5">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.key}
                type="button"
                onClick={() => setMessageText(topic.text)}
                className="w-full text-left px-3 py-2 bg-[#F3EEE4] hover:bg-[#EBE4D6] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] transition-colors cursor-pointer"
              >
                {topic.text}
              </button>
            ))}
          </div>
        </div>

        {/* Mock chat display */}
        <div className="bg-white border border-[#E8E2D5] rounded-xl p-3 min-h-[80px] space-y-2">
          <p className="text-[11px] text-[#9A958B] text-center">{t('worker.support.chatSubtext', 'Chat with a human agent below')}</p>
          {messageSent && (
            <>
              <div className="flex justify-end">
                <div className="bg-[#537895] text-white px-3 py-1.5 rounded-xl rounded-br-sm text-xs max-w-[80%]">
                  {messageText || 'Your message'}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-[#F3EEE4] text-[#292824] px-3 py-1.5 rounded-xl rounded-bl-sm text-xs max-w-[80%]">
                  🤝 {t('worker.support.messageSentNotice', 'Your message has been assigned to an active support agent. Live agent will respond momentarily.')}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('worker.support.typeMessagePlaceholder', 'Type your message or query here...')}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            className="flex-1 px-3 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-sm text-[#292824] placeholder-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#537895]"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="px-4 py-2.5 bg-[#537895] hover:bg-[#41637E] text-white rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
            title={t('worker.support.sendMessage', 'Send Message')}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Call support */}
        <div className="flex items-center gap-3 p-3 bg-[#EEF3EC] border border-[#CFDDD0] rounded-xl">
          <Phone className="w-4 h-4 text-[#6E8B67] shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#364A32]">{t('worker.support.preferCall', 'Prefer a call?')}</p>
            <p className="text-[10px] text-[#527048]">{t('worker.support.callSupportDirect', 'Call Cooperative Support (Toll-Free)')}</p>
          </div>
          <button
            type="button"
            onClick={() => alert('Calling support line…')}
            className="ml-auto px-3 py-1.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            {t('worker.support.callSupport', 'Call Support')}
          </button>
        </div>
      </div>
    </div>
  );
};
