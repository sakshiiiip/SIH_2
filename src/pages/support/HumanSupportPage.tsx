import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import {
  useSupportStore,
  SupportCategory,
  SupportChannel,
  SupportContextData,
  HUMAN_SUPPORT_AGENTS,
} from '../../store/supportStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  HeadphonesIcon,
  MessageSquare,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  FileText,
  Calendar,
  CreditCard,
  Building2,
  Sparkles,
  Phone,
  RefreshCw,
  Info,
  ShieldAlert,
  Star,
} from 'lucide-react';

interface HumanSupportPageProps {
  onBack?: () => void;
  initialCategory?: SupportCategory;
}

export const HumanSupportPage: React.FC<HumanSupportPageProps> = ({
  onBack,
  initialCategory = 'Booking',
}) => {
  const { t } = useTranslation();
  const { currentUser, bookings, showToast } = useCooperativeStore();
  const {
    tickets,
    activeTicketId,
    setActiveTicketId,
    createTicket,
    sendChatMessage,
    resolveTicket,
    generateWhatsAppLink,
  } = useSupportStore();

  // Active Channel Tab
  const [selectedChannel, setSelectedChannel] = useState<SupportChannel>('CHAT');
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory>(initialCategory);

  // Chat Input State
  const [chatInputText, setChatInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Callback Form State
  const [callbackPhone, setCallbackPhone] = useState(currentUser.phone || '+91 98201 23456');
  const [callbackSlot, setCallbackSlot] = useState('Within 15 minutes (Urgent)');
  const [callbackNotes, setCallbackNotes] = useState('');
  const [callbackSuccessTicketId, setCallbackSuccessTicketId] = useState<string | null>(null);

  // WhatsApp Form State
  const [whatsappNote, setWhatsappNote] = useState('');

  // 1. Gather Auto-Attached Context Data
  const myBookings = useMemo(
    () => bookings.filter((b) => b.customerId === currentUser.id || b.customerPhone === currentUser.phone),
    [bookings, currentUser]
  );

  const activeBooking = useMemo(
    () => myBookings.find((b) => !['PAID', 'RATED', 'CANCELLED'].includes(b.state)) || myBookings[0],
    [myBookings]
  );

  const recentCompletedBooking = useMemo(
    () => myBookings.find((b) => ['COMPLETED', 'PAID', 'RATED'].includes(b.state)),
    [myBookings]
  );

  const contextData: SupportContextData = useMemo(() => {
    return {
      activeBookingId: activeBooking?.id || 'BK-82910',
      serviceCategory: activeBooking?.serviceCategory || 'Plumbing Service',
      problemType: activeBooking?.problemType || 'Main Valve Leakage',
      bookingState: activeBooking?.state || 'IN_PROGRESS',
      recentTransactionId: recentCompletedBooking ? `TXN-${recentCompletedBooking.id.slice(-6)}` : 'TXN-904812',
      transactionAmount: recentCompletedBooking ? recentCompletedBooking.pricing.total : 450,
      transactionStatus: 'ESCROW_SETTLED',
      accountStatus: 'Verified Resident Member',
      societyName: currentUser.societyName || 'Palm Meadows Cooperative',
      customerName: currentUser.name || 'Resident Member',
      customerPhone: currentUser.phone || '+91 98201 23456',
      customerAddress: currentUser.address || 'Flat 402, Tower B',
    };
  }, [activeBooking, recentCompletedBooking, currentUser]);

  // Current active ticket or user's latest open ticket
  const userTickets = useMemo(
    () => tickets.filter((t) => t.userId === currentUser.id || t.userName === currentUser.name),
    [tickets, currentUser]
  );

  const activeTicket = useMemo(() => {
    if (activeTicketId) {
      return tickets.find((t) => t.ticketId === activeTicketId) || null;
    }
    const openTicket = userTickets.find((t) => t.status !== 'RESOLVED' && t.channel === 'CHAT');
    return openTicket || null;
  }, [activeTicketId, tickets, userTickets]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (selectedChannel === 'CHAT' && activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.chatMessages, selectedChannel, activeTicket]);

  // Handle Start Live Chat
  const handleStartLiveChat = (categoryToStart: SupportCategory, starterMessage?: string) => {
    const ticket = createTicket({
      userId: currentUser.id,
      userName: currentUser.name || 'Resident Member',
      userPhone: currentUser.phone,
      category: categoryToStart,
      channel: 'CHAT',
      subject: `${categoryToStart} Live Support Inquiry`,
      description: starterMessage || `Started live chat regarding ${categoryToStart} support.`,
      contextData,
      initialUserMessage: starterMessage,
    });
    setSelectedChannel('CHAT');
    showToast({
      title: 'Support Officer Assigned',
      message: `${ticket.assignedAgent?.name || 'An agent'} is now connected to your session.`,
      type: 'success',
    });
  };

  // Handle Send Chat Message
  const handleSendMessage = () => {
    if (!chatInputText.trim()) return;
    if (!activeTicket) {
      handleStartLiveChat(selectedCategory, chatInputText.trim());
      setChatInputText('');
      return;
    }
    sendChatMessage(activeTicket.ticketId, chatInputText.trim(), 'user');
    setChatInputText('');
  };

  // Handle Submit Callback Request
  const handleSubmitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = createTicket({
      userId: currentUser.id,
      userName: currentUser.name || 'Resident Member',
      userPhone: callbackPhone,
      category: selectedCategory,
      channel: 'CALLBACK',
      subject: `Callback Request: ${selectedCategory}`,
      description: callbackNotes || `Callback requested for ${selectedCategory} during slot: ${callbackSlot}`,
      preferredCallbackSlot: callbackSlot,
      contextData,
    });
    setCallbackSuccessTicketId(ticket.ticketId);
    showToast({
      title: 'Callback Scheduled!',
      message: `Our representative will call you at ${callbackPhone} (${callbackSlot}).`,
      type: 'success',
    });
  };

  // Handle WhatsApp Redirection
  const handleOpenWhatsApp = () => {
    const url = generateWhatsAppLink(contextData, selectedCategory, whatsappNote);
    createTicket({
      userId: currentUser.id,
      userName: currentUser.name || 'Resident Member',
      userPhone: currentUser.phone,
      category: selectedCategory,
      channel: 'WHATSAPP',
      subject: `WhatsApp Inquiry: ${selectedCategory}`,
      description: whatsappNote || `Direct WhatsApp query for ${selectedCategory}.`,
      contextData,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast({
      title: 'Opening WhatsApp',
      message: 'Redirecting to verified Cooperative Support WhatsApp line with pre-filled context.',
      type: 'info',
    });
  };

  // Quick Starter Prompts by Category
  const PROMPT_CHIPS: Record<SupportCategory, string[]> = {
    Booking: [
      t('support.promptBooking1', { defaultValue: 'Worker has not arrived yet' }),
      t('support.promptBooking2', { defaultValue: 'Need to reschedule my booking time' }),
      t('support.promptBooking3', { defaultValue: 'Want to add additional task to job' }),
      t('support.promptBooking4', { defaultValue: 'Cancel this booking without penalty' }),
    ],
    Payment: [
      t('support.promptPayment1', { defaultValue: 'Dispute charges on recent invoice' }),
      t('support.promptPayment2', { defaultValue: 'Payment deducted twice via UPI' }),
      t('support.promptPayment3', { defaultValue: 'Need an official tax receipt' }),
      t('support.promptPayment4', { defaultValue: 'Release escrow payout confirmation' }),
    ],
    Safety: [
      t('support.promptSafety1', { defaultValue: 'Urgent safety / emergency report' }),
      t('support.promptSafety2', { defaultValue: 'Property damage during service' }),
      t('support.promptSafety3', { defaultValue: 'Verify worker ID card & background' }),
      t('support.promptSafety4', { defaultValue: 'Request society manager inspection' }),
    ],
    Account: [
      t('support.promptAccount1', { defaultValue: 'Update society / flat address' }),
      t('support.promptAccount2', { defaultValue: 'Cooperative membership card query' }),
      t('support.promptAccount3', { defaultValue: 'Change registered phone number' }),
      t('support.promptAccount4', { defaultValue: 'View my service history report' }),
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* ── Top Navigation & Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-xl hover:bg-[#F3EEE4] text-[#524E47] transition-colors cursor-pointer"
                title={t('common.back', { defaultValue: 'Go Back' })}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E6ECE4] border border-[#CFDDD0] flex items-center justify-center text-[#445D3E] shadow-xs">
                <HeadphonesIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292824] tracking-tight flex items-center gap-2">
                  {t('support.directHumanSupport', { defaultValue: 'Direct Human Support' })}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] hidden sm:inline-flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    {t('support.zeroAiLoops', { defaultValue: 'Zero AI / Bot Loops' })}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-[#77736B]">
                  {t('support.supportSubtitle', { defaultValue: 'Connect directly with dedicated cooperative officers for instant, personalized resolution.' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Officer Status Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-xs self-start sm:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6E8B67] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#445D3E]" />
          </span>
          <div className="text-left">
            <span className="text-xs font-bold text-[#292824] block leading-tight">{t('support.officersOnline', { defaultValue: '4 Human Officers Online' })}</span>
            <span className="text-[10px] text-[#6E8B67] font-semibold">{t('support.avgReplyTime', { defaultValue: 'Avg reply under 2 mins' })}</span>
          </div>
        </div>
      </div>

      {/* ── Auto-Attached Context Header ── */}
      <Card className="p-4 sm:p-5 bg-[#FAF7F2] border-[#D8D3C8] shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#292824] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#445D3E]" />
            <span>{t('support.autoAttachedContext', { defaultValue: 'Auto-Attached Account Context' })}</span>
          </div>
          <span className="text-[11px] text-[#77736B] flex items-center gap-1 bg-[#F3EEE4] px-2.5 py-1 rounded-lg">
            <Info className="w-3.5 h-3.5 text-[#537895]" />
            {t('support.contextNotice', { defaultValue: 'Your support agent automatically receives these verified IDs' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Active Booking Badge */}
          <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-[#E4EDF4] text-[#324F66] shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">{t('support.activeBooking', { defaultValue: 'Active Booking' })}</span>
              <span className="text-xs font-bold text-[#292824] truncate block">
                #{contextData.activeBookingId} · {contextData.serviceCategory}
              </span>
              <span className="text-[10px] text-[#537895] font-semibold">
                {t('common.status', { defaultValue: 'Status' })}: {contextData.bookingState?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Recent Transaction Badge */}
          <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-[#E6ECE4] text-[#445D3E] shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">{t('support.recentLedgerTxn', { defaultValue: 'Recent Ledger Txn' })}</span>
              <span className="text-xs font-bold text-[#292824] truncate block">
                #{contextData.recentTransactionId} (₹{contextData.transactionAmount})
              </span>
              <span className="text-[10px] text-[#445D3E] font-semibold">
                {t('support.escrowProtected', { defaultValue: 'Escrow Protected & Verified' })}
              </span>
            </div>
          </div>

          {/* Member & Society Badge */}
          <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-[#FAEDE8] text-[#80432E] shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">{t('support.memberVerification', { defaultValue: 'Member Verification' })}</span>
              <span className="text-xs font-bold text-[#292824] truncate block">
                {contextData.societyName}
              </span>
              <span className="text-[10px] text-[#80432E] font-semibold">
                {contextData.customerAddress} · {contextData.accountStatus}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Channel Selector Tabs ── */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedChannel('CHAT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            selectedChannel === 'CHAT'
              ? 'bg-[#292824] text-white shadow-sm'
              : 'bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#524E47] border border-[#E8E2D5]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {t('support.liveInAppChat', { defaultValue: 'Live In-App Chat' })}
          {activeTicket && activeTicket.status !== 'RESOLVED' && (
            <span className="w-2 h-2 rounded-full bg-[#6E8B67] animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedChannel('CALLBACK')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            selectedChannel === 'CALLBACK'
              ? 'bg-[#292824] text-white shadow-sm'
              : 'bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#524E47] border border-[#E8E2D5]'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          {t('support.callbackRequest', { defaultValue: 'One-Tap Callback Request' })}
        </button>

        <button
          type="button"
          onClick={() => setSelectedChannel('WHATSAPP')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            selectedChannel === 'WHATSAPP'
              ? 'bg-[#292824] text-white shadow-sm'
              : 'bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#524E47] border border-[#E8E2D5]'
          }`}
        >
          <ExternalLink className="w-4 h-4 text-[#25D366]" />
          {t('support.whatsappSupport', { defaultValue: 'WhatsApp Support Redirect' })}
        </button>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="space-y-1.5">
        <label className="text-[11px] uppercase font-bold text-[#77736B] tracking-wider block">
          {t('support.selectCategory', { defaultValue: 'Select Issue Category' })}
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {(['Booking', 'Payment', 'Safety', 'Account'] as SupportCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#445D3E] text-white shadow-xs'
                  : 'bg-[#FCF9F3] text-[#524E47] hover:bg-[#F3EEE4] border border-[#E8E2D5]'
              }`}
            >
              {cat === 'Booking' && '🛠️ '}
              {cat === 'Payment' && '💳 '}
              {cat === 'Safety' && '🛡️ '}
              {cat === 'Account' && '👤 '}
              {t(`support.cat_${cat.toLowerCase()}`, { defaultValue: `${cat} Support` })}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHANNEL 1: LIVE IN-APP CHAT ── */}
      {selectedChannel === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="flex flex-col h-[560px] bg-[#FCF9F3] border-[#E8E2D5] shadow-card overflow-hidden">
              {/* Active Agent Chat Header */}
              <div className="p-3.5 sm:p-4 bg-[#292824] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        activeTicket?.assignedAgent?.avatar ||
                        HUMAN_SUPPORT_AGENTS.find((a) => a.specialization === selectedCategory)?.avatar ||
                        HUMAN_SUPPORT_AGENTS[0].avatar
                      }
                      alt="Assigned Agent"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#6E8B67]"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#6E8B67] border-2 border-[#292824]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm">
                        {activeTicket?.assignedAgent?.name ||
                          HUMAN_SUPPORT_AGENTS.find((a) => a.specialization === selectedCategory)?.name ||
                          'Priya Sharma'}
                      </span>
                      <span className="text-[10px] font-semibold bg-[#6E8B67] px-1.5 py-0.2 rounded text-white">
                        Verified Human
                      </span>
                    </div>
                    <span className="text-[11px] text-[#C2B6A0] block">
                      {activeTicket?.assignedAgent?.role || t('support.seniorAdvocate', { defaultValue: 'Senior Customer Advocate' })} · ⭐ 4.98
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTicket && activeTicket.status !== 'RESOLVED' && (
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        resolveTicket(activeTicket.ticketId, 'Customer resolved conversation');
                        showToast({
                          title: t('support.ticketResolvedTitle', { defaultValue: 'Ticket Resolved' }),
                          message: t('support.ticketResolvedMsg', { defaultValue: 'Issue closed successfully.' }),
                          type: 'success',
                        });
                      }}
                      className="text-white hover:bg-white/10 text-xs border border-white/20"
                    >
                      {t('support.markResolved', { defaultValue: 'Mark Resolved' })}
                    </Button>
                  )}
                  {activeTicket && (
                    <span className="font-mono text-[10px] text-white/70 hidden sm:inline">
                      #{activeTicket.ticketId}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]">
                {!activeTicket ? (
                  /* Empty state / Prompt to initiate */
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#E6ECE4] text-[#445D3E] flex items-center justify-center shadow-xs">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h3 className="text-base font-bold text-[#292824]">
                        {t('support.startLiveConversation', { defaultValue: 'Start Live Conversation with a Support Specialist' })}
                      </h3>
                      <p className="text-xs text-[#77736B]">
                        {t('support.startLiveDesc', { defaultValue: 'Click any common topic below or type your message. All booking and payment details will be automatically provided to your specialist.' })}
                      </p>
                    </div>

                    {/* Quick Starters */}
                    <div className="w-full max-w-md space-y-1.5 text-left">
                      <span className="text-[11px] uppercase font-bold text-[#77736B] block">
                        {t('support.quickStartersFor', { defaultValue: 'Quick Starters for {{category}}', category: selectedCategory })}
                      </span>
                      {PROMPT_CHIPS[selectedCategory].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleStartLiveChat(selectedCategory, prompt)}
                          className="w-full px-3 py-2 bg-white hover:bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#292824] flex items-center justify-between transition-colors cursor-pointer text-left"
                        >
                          <span>{prompt}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#77736B]" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Render Active Chat Stream */
                  <>
                    {activeTicket.chatMessages.map((msg) => {
                      if (msg.sender === 'system') {
                        return (
                          <div key={msg.id} className="text-center my-2">
                            <span className="inline-block px-3 py-1 bg-[#E8E2D5] text-[#524E47] text-[11px] font-medium rounded-full">
                              {msg.text}
                            </span>
                          </div>
                        );
                      }

                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className="flex items-center gap-1 text-[10px] text-[#77736B] px-1">
                            <span className="font-semibold">{msg.senderName}</span>
                            <span>· {msg.timestamp}</span>
                          </div>
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isUser
                                ? 'bg-[#445D3E] text-white rounded-tr-xs'
                                : 'bg-[#FCF9F3] text-[#292824] border border-[#E8E2D5] rounded-tl-xs shadow-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-[#FCF9F3] border-t border-[#E8E2D5]">
                {activeTicket?.status === 'RESOLVED' ? (
                  <div className="flex items-center justify-between p-2 bg-[#E6ECE4] rounded-xl text-xs text-[#364A32] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#445D3E]" />
                      {t('support.ticketResolvedBanner', { defaultValue: 'This support ticket has been resolved.' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartLiveChat(selectedCategory)}
                      className="px-2.5 py-1 bg-[#445D3E] text-white rounded-lg hover:bg-[#364A32] transition-colors cursor-pointer"
                    >
                      {t('support.startNewChat', { defaultValue: 'Start New Chat' })}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder={
                        activeTicket
                          ? t('support.replyToAgent', { defaultValue: 'Reply to {{name}}...', name: activeTicket.assignedAgent?.name || 'Support' })
                          : t('support.typeMessageToConnect', { defaultValue: 'Type message to connect with human agent...' })
                      }
                      className="flex-1 px-3.5 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#445D3E]"
                    />
                    <button
                      type="submit"
                      disabled={!chatInputText.trim()}
                      className="px-4 py-2.5 bg-[#445D3E] hover:bg-[#364A32] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('common.send', { defaultValue: 'Send' })}</span>
                    </button>
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Assigned Human Agent Information & Ticket History */}
          <div className="space-y-4">
            {/* Agent Profile Card */}
            <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#77736B] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#445D3E]" />
                {t('support.officerOnDuty', { defaultValue: 'Support Officer on Duty' })}
              </h3>
              <div className="flex items-start gap-3">
                <img
                  src={
                    activeTicket?.assignedAgent?.avatar ||
                    HUMAN_SUPPORT_AGENTS.find((a) => a.specialization === selectedCategory)?.avatar ||
                    HUMAN_SUPPORT_AGENTS[0].avatar
                  }
                  alt="Agent"
                  className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D5]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#292824]">
                    {activeTicket?.assignedAgent?.name ||
                      HUMAN_SUPPORT_AGENTS.find((a) => a.specialization === selectedCategory)?.name ||
                      'Priya Sharma'}
                  </h4>
                  <span className="text-xs text-[#537895] block">
                    {activeTicket?.assignedAgent?.role || t('support.seniorAdvocate', { defaultValue: 'Senior Customer Advocate' })}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-[#77736B]">
                    <Star className="w-3 h-3 text-[#B37055] fill-[#B37055]" />
                    <span className="font-bold text-[#292824]">4.98</span>
                    <span>· {t('support.issuesResolvedCount', { defaultValue: '1,400+ issues resolved' })}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D5] text-[11px] text-[#77736B] space-y-1">
                <p>{t('support.benefitRefunds', { defaultValue: '✓ Authorized to approve direct refunds & rescheduling' })}</p>
                <p>{t('support.benefitManagerContact', { defaultValue: '✓ Direct contact with your Society Cooperative Manager' })}</p>
              </div>
            </Card>

            {/* My Active & Past Support Tickets */}
            <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#77736B] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#537895]" />
                  {t('support.mySupportTickets', { defaultValue: 'My Support Tickets ({{count}})', count: userTickets.length })}
                </h3>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {userTickets.length === 0 ? (
                  <p className="text-xs text-[#77736B] text-center py-4">{t('support.noTicketsRecorded', { defaultValue: 'No tickets recorded yet.' })}</p>
                ) : (
                  userTickets.map((tItem) => (
                    <div
                      key={tItem.ticketId}
                      onClick={() => {
                        setActiveTicketId(tItem.ticketId);
                        setSelectedChannel(tItem.channel);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        activeTicket?.ticketId === tItem.ticketId
                          ? 'border-[#445D3E] bg-[#E6ECE4]'
                          : 'border-[#E8E2D5] bg-[#FAF7F2] hover:bg-[#F3EEE4]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-[#292824]">#{tItem.ticketId}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            tItem.status === 'RESOLVED'
                              ? 'bg-[#CFDDD0] text-[#2A3927]'
                              : 'bg-[#E4EDF4] text-[#1C2C3A]'
                          }`}
                        >
                          {tItem.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#524E47] block truncate font-medium">
                        {tItem.subject}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-[#77736B] mt-1">
                        <span>{t('support.channelLabel', { defaultValue: 'Channel:' })} {tItem.channel}</span>
                        <span>{new Date(tItem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── CHANNEL 2: ONE-TAP CALLBACK REQUEST ── */}
      {selectedChannel === 'CALLBACK' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 bg-[#FCF9F3] border-[#E8E2D5] shadow-card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAEDE8] text-[#80432E] flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#292824]">{t('support.requestCallbackTitle', { defaultValue: 'Request Immediate or Scheduled Callback' })}</h2>
                <p className="text-xs text-[#77736B]">
                  {t('support.requestCallbackSubtitle', { defaultValue: 'Skip holding on the phone line. A specialized support officer will call you directly.' })}
                </p>
              </div>
            </div>

            {callbackSuccessTicketId ? (
              /* Success Confirmation View */
              <div className="p-5 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#445D3E] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#292824]">{t('support.callbackQueuedTitle', { defaultValue: 'Callback Successfully Queued!' })}</h3>
                  <p className="text-xs text-[#364A32]">
                    {t('support.refTicket', { defaultValue: 'Reference Ticket: ' })}<span className="font-mono font-bold">#{callbackSuccessTicketId}</span>
                  </p>
                  <p className="text-xs text-[#524E47]">
                    {t('support.callbackQueuedDetail', {
                      defaultValue: 'Officer {{officer}} will call you at {{phone}} during {{slot}}.',
                      officer: HUMAN_SUPPORT_AGENTS.find((a) => a.specialization === selectedCategory)?.name || 'Priya Sharma',
                      phone: callbackPhone,
                      slot: callbackSlot,
                    })}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setCallbackSuccessTicketId(null);
                    setCallbackNotes('');
                  }}
                  className="mx-auto"
                >
                  {t('support.scheduleAnotherCallback', { defaultValue: 'Schedule Another Callback' })}
                </Button>
              </div>
            ) : (
              /* Callback Submission Form */
              <form onSubmit={handleSubmitCallback} className="space-y-4">
                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#292824] block">
                    {t('support.phoneForCallback', { defaultValue: 'Your Phone Number for Callback' })}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#77736B] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="+91 98201 23456"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#445D3E]"
                    />
                  </div>
                </div>

                {/* Convenient Time Slot Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#292824] block">
                    {t('support.chooseTimeSlot', { defaultValue: 'Choose Convenient Time Slot' })}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      t('support.slot15Min', { defaultValue: 'Within 15 minutes (Urgent)' }),
                      t('support.slotToday3to4', { defaultValue: 'Today 3:00 PM – 4:00 PM' }),
                      t('support.slotToday6to7', { defaultValue: 'Today 6:00 PM – 7:00 PM' }),
                      t('support.slotTomorrowMorning', { defaultValue: 'Tomorrow Morning (10 AM – 11 AM)' }),
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setCallbackSlot(slot)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          callbackSlot === slot
                            ? 'border-[#445D3E] bg-[#E6ECE4] text-[#2A3927]'
                            : 'border-[#E8E2D5] bg-white text-[#524E47] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#537895]" />
                          {slot}
                        </span>
                        {callbackSlot === slot && <CheckCircle2 className="w-4 h-4 text-[#445D3E]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brief Issue Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#292824] block">
                    {t('support.briefNotesOptional', { defaultValue: 'Brief Notes / What should we know? (Optional)' })}
                  </label>
                  <textarea
                    rows={3}
                    value={callbackNotes}
                    onChange={(e) => setCallbackNotes(e.target.value)}
                    placeholder={t('support.notesPlaceholder', { defaultValue: 'e.g. Need to adjust the technician arrival time and discuss pricing breakdown...' })}
                    className="w-full p-3 bg-white border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#445D3E]"
                  />
                </div>

                {/* Auto Attached Summary Alert */}
                <div className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#445D3E] shrink-0" />
                  <span>
                    {t('support.attachedAlert', {
                      defaultValue: 'Booking #{{booking}} and Recent Txn #{{txn}} will be on the agent\'s screen when calling.',
                      booking: contextData.activeBookingId,
                      txn: contextData.recentTransactionId,
                    })}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<PhoneCall className="w-4 h-4" />}
                  className="w-full justify-center py-3"
                >
                  {t('support.confirmCallbackRequest', { defaultValue: 'Confirm Callback Request' })}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* ── CHANNEL 3: WHATSAPP SUPPORT REDIRECT ── */}
      {selectedChannel === 'WHATSAPP' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 bg-[#FCF9F3] border-[#E8E2D5] shadow-card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#25D366] flex items-center justify-center">
                <ExternalLink className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#292824]">{t('support.whatsappSupportTitle', { defaultValue: 'WhatsApp Business Direct Support' })}</h2>
                <p className="text-xs text-[#77736B]">
                  {t('support.whatsappSupportSubtitle', { defaultValue: 'Chat with our verified cooperative support desk right from WhatsApp with pre-filled context.' })}
                </p>
              </div>
            </div>

            {/* Optional Custom Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#292824] block">
                {t('support.addIssueSummaryOptional', { defaultValue: 'Add Issue Summary for WhatsApp Desk (Optional)' })}
              </label>
              <textarea
                rows={2}
                value={whatsappNote}
                onChange={(e) => setWhatsappNote(e.target.value)}
                placeholder={t('support.whatsappPlaceholder', { defaultValue: 'e.g. Please confirm if my plumber has accepted the updated flat address...' })}
                className="w-full p-3 bg-white border border-[#E8E2D5] rounded-xl text-xs sm:text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#25D366]"
              />
            </div>

            {/* Message Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#292824] block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
                {t('support.autoFormattedPreview', { defaultValue: 'Auto-Formatted Message Preview:' })}
              </label>
              <div className="p-4 bg-[#E8F8EE]/50 border border-[#C5ECD2] rounded-xl font-mono text-xs text-[#1E5631] whitespace-pre-wrap leading-relaxed">
                {`*Cooperative Platform Human Support Request*
👤 *Member:* ${contextData.customerName} (${contextData.customerPhone})
🏢 *Society:* ${contextData.societyName} · Verified Resident
📂 *Category:* ${selectedCategory}
📌 *Active Booking ID:* ${contextData.activeBookingId} (${contextData.serviceCategory})
💳 *Recent Transaction:* ${contextData.recentTransactionId} (₹${contextData.transactionAmount})
${whatsappNote ? `\n📝 *Issue Summary:* ${whatsappNote}` : ''}
_Bypassing bot. Requesting human agent connection._`}
              </div>
            </div>

            {/* Launch WhatsApp Button */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20BA5A] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('support.launchWhatsApp', { defaultValue: 'Launch WhatsApp Chat Now' })}</span>
            </button>

            <p className="text-[11px] text-center text-[#77736B]">
              {t('support.verifiedWhatsAppHours', { defaultValue: 'Verified WhatsApp Business Account · Mon – Sun (7:00 AM – 11:00 PM IST)' })}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
