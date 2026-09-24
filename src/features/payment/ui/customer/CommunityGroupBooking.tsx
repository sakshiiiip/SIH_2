import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Calendar,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Percent,
  Building2,
  Wrench,
  Zap,
  Hammer,
  Tv,
  Bug,
  Trees,
  Paintbrush,
  X,
  Info,
  Clock,
  UserCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { groupBookingService } from '../../container';
import type { GroupBookingSummaryCard, CostSplitStrategy, GroupBookingStatus } from '../../types/groupBooking.types';
import type { CreateGroupBookingInput } from '../../repositories/IGroupBookingRepository';

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const SERVICE_CATEGORIES = [
  { name: 'Plumbing', icon: Wrench, color: 'bg-[#E6ECE4]', text: 'text-[#445D3E]' },
  { name: 'Electrical', icon: Zap, color: 'bg-[#FAEDE8]', text: 'text-[#80432E]' },
  { name: 'Deep Cleaning', icon: Sparkles, color: 'bg-[#E4EDF4]', text: 'text-[#324F66]' },
  { name: 'Carpentry', icon: Hammer, color: 'bg-[#FAEDE8]', text: 'text-[#80432E]' },
  { name: 'Painting', icon: Paintbrush, color: 'bg-[#EFEBF4]', text: 'text-[#504161]' },
  { name: 'Appliance Repairs', icon: Tv, color: 'bg-[#E4EDF4]', text: 'text-[#324F66]' },
  { name: 'Pest Control', icon: Bug, color: 'bg-[#FAEDE8]', text: 'text-[#80432E]' },
  { name: 'Gardening', icon: Trees, color: 'bg-[#E6ECE4]', text: 'text-[#445D3E]' },
];

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: GroupBookingStatus }) {
  const { t } = useTranslation();
  const cfg: Record<string, { label: string; cls: string; dot: string }> = {
    OPEN: { label: t('groupBooking.status.open', 'Open'), cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]', dot: 'bg-[#6E8B67] animate-pulse' },
    LOCKED: { label: t('groupBooking.status.locked', 'Locked'), cls: 'bg-[#EFEBF4] text-[#504161] border-[#DFD8E8]', dot: 'bg-[#7A6A8E]' },
    CONFIRMED: { label: t('groupBooking.status.confirmed', 'Confirmed'), cls: 'bg-[#E4EDF4] text-[#324F66] border-[#B8CBDD]', dot: 'bg-[#537895]' },
    IN_PROGRESS: { label: t('groupBooking.status.inProgress', 'In Progress'), cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]', dot: 'bg-[#B37055] animate-pulse' },
    COMPLETED: { label: t('groupBooking.status.completed', 'Completed'), cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]', dot: 'bg-[#6E8B67]' },
    INVOICED: { label: t('groupBooking.status.invoiced', 'Invoiced'), cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]', dot: 'bg-[#B37055]' },
    PAID: { label: t('groupBooking.status.paid', 'Paid'), cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]', dot: 'bg-[#6E8B67]' },
    PARTIALLY_PAID: { label: t('groupBooking.status.partiallyPaid', 'Partial'), cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]', dot: 'bg-[#B37055]' },
    DRAFT: { label: t('groupBooking.status.draft', 'Draft'), cls: 'bg-[#F3EEE4] text-[#77736B] border-[#E8E2D5]', dot: 'bg-[#9A958B]' },
    CANCELLED: { label: t('groupBooking.status.cancelled', 'Cancelled'), cls: 'bg-[#FAEBEB] text-[#632727] border-[#F4D7D7]', dot: 'bg-[#B86B6B]' },
  };
  const s = cfg[status] ?? cfg.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: GroupBookingSummaryCard;
  currentUserId: string;
  currentUserName: string;
  currentUserPhone: string;
  currentUserFlat: string;
  onViewDetails: (id: string) => void;
  onJoined: () => void;
}

function BookingCard({
  booking,
  currentUserId,
  currentUserName,
  currentUserPhone,
  currentUserFlat,
  onViewDetails,
  onJoined,
}: BookingCardProps) {
  const { t } = useTranslation();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const capacity = booking.totalParticipants;
  const confirmed = booking.confirmedParticipants;
  const pct = capacity > 0 ? Math.min((confirmed / capacity) * 100, 100) : 0;
  const spotsLeft = Math.max(0, capacity - confirmed);
  const isOpen = booking.status === 'OPEN';

  const handleJoin = async () => {
    if (joining || joined || !isOpen) return;
    setJoining(true);
    try {
      await groupBookingService.joinBooking({
        groupBookingId: booking.id,
        userId: currentUserId,
        customerName: currentUserName,
        customerPhone: currentUserPhone,
        flatNumber: currentUserFlat,
      });
      setJoined(true);
      onJoined();
    } catch {
      // silently fail in demo
    } finally {
      setJoining(false);
    }
  };

  const catCfg = SERVICE_CATEGORIES.find((c) => c.name.toLowerCase().includes(booking.serviceCategory.toLowerCase()));

  return (
    <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-card flex flex-col gap-4 hover:border-[#D8CFBE] hover:shadow-float transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${catCfg?.color ?? 'bg-[#E4EDF4]'}`}>
            {catCfg ? <catCfg.icon className={`w-4.5 h-4.5 ${catCfg.text}`} /> : <Wrench className="w-4.5 h-4.5 text-[#537895]" />}
          </span>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${catCfg?.text ?? 'text-[#324F66]'}`}>
              {booking.serviceCategory}
            </p>
            <p className="text-[11px] text-[#9A958B] font-mono mt-0.5">{booking.referenceNumber}</p>
          </div>
        </div>
        <StatusChip status={booking.status} />
      </div>

      {/* Society + description */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#77736B] mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>{booking.societyName}</span>
        </div>
        <p className="text-sm font-semibold text-[#292824] leading-snug">
          {t('groupBooking.organisedBy', 'Organised by')} <span className="font-bold">{booking.organiserName}</span>
          <span className="text-[#9A958B] font-normal"> ({booking.organiserFlatNumber})</span>
        </p>
      </div>

      {/* Participant progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-[#77736B]">
            <Users className="w-3.5 h-3.5" />
            <span>{t('groupBooking.joinedCount', { count: confirmed, defaultValue: `${confirmed} joined` })}</span>
          </span>
          <span className="text-[#9A958B]">
            {spotsLeft > 0
              ? (spotsLeft === 1
                  ? t('groupBooking.spotsLeftOne', '1 spot left')
                  : t('groupBooking.spotsLeft', { count: spotsLeft, defaultValue: `${spotsLeft} spots left` }))
              : t('groupBooking.full', 'Full')}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#E8E2D5] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6E8B67] to-[#8DA387] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Cost + date */}
      <div className="flex items-center justify-between text-xs border-t border-[#E8E2D5] pt-3">
        <div className="space-y-0.5">
          <p className="text-[#77736B]">{t('groupBooking.yourShareEst', 'Your share (est.)')}</p>
          <p className="font-bold font-mono text-[#292824] text-sm">
            {booking.userCostShare
              ? `₹${fmt(booking.userCostShare)}`
              : `₹${fmt(Math.round(booking.totalGroupCost / Math.max(confirmed, 1)))}`}
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-[#77736B]">{t('groupBooking.preferredDate', 'Preferred date')}</p>
          <p className="font-semibold text-[#292824] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#537895]" />
            {fmtDate(booking.preferredDate)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(booking.id)}
          className="flex-1 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] text-xs font-semibold text-[#524E47] hover:bg-[#F3EEE4] hover:border-[#D8CFBE] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {t('groupBooking.detailsBtn', 'Details')} <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {isOpen && (
          <button
            type="button"
            onClick={joined ? undefined : handleJoin}
            disabled={joining}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              joined
                ? 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] cursor-default'
                : 'bg-[#6E8B67] hover:bg-[#587352] text-white shadow-xs active:scale-[0.98]'
            }`}
          >
            {joining ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : joined ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> {t('groupBooking.joinedBtn', 'Joined')}</>
            ) : (
              <>{t('groupBooking.joinGroupBtn', 'Join Group')}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Create booking modal ─────────────────────────────────────────────────────

interface CreateModalProps {
  currentUserId: string;
  currentUserName: string;
  currentUserPhone: string;
  currentUserFlat: string;
  societyId: string;
  societyName: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}

function CreateModal({
  currentUserId,
  currentUserName,
  currentUserPhone,
  currentUserFlat,
  societyId,
  societyName,
  onClose,
  onCreated,
}: CreateModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState('');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [minP, setMinP] = useState(3);
  const [maxP, setMaxP] = useState(10);
  const [strategy, setStrategy] = useState<CostSplitStrategy>('EQUAL');
  const [estimatedCost, setEstimatedCost] = useState(3000);
  const [discount, setDiscount] = useState(20);
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('09:00');
  const [timeEnd, setTimeEnd] = useState('17:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!category || !problemType || !description || !date) {
      setError(t('groupBooking.validationError', 'Please fill in all required fields.'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const input: CreateGroupBookingInput = {
        organiserId: currentUserId,
        organiserName: currentUserName,
        organiserPhone: currentUserPhone,
        organiserFlatNumber: currentUserFlat,
        societyId,
        societyName,
        serviceCategory: category,
        problemType,
        description,
        urgencyTier: 'STANDARD',
        minimumParticipants: minP,
        maximumParticipants: maxP,
        preferredDate: date,
        preferredTimeStart: timeStart,
        preferredTimeEnd: timeEnd,
        costSplitStrategy: strategy,
        estimatedTotalCost: estimatedCost,
        groupDiscountPercent: discount,
      };
      const gb = await groupBookingService.createAndPublish(input);
      onCreated(gb.id);
    } catch {
      setError('Failed to create group booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] placeholder-[#BCB7AD] focus:outline-none focus:border-[#537895] focus:ring-1 focus:ring-[#537895]/30 transition-all';
  const labelCls = 'block text-[11px] font-bold text-[#77736B] uppercase tracking-wider mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#FCF9F3] rounded-3xl shadow-float overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E2D5]">
          <div>
            <h2 className="text-lg font-bold text-[#292824]">Start Group Booking</h2>
            <p className="text-xs text-[#77736B] mt-0.5">Invite neighbours to save together</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-[#F3EEE4] flex items-center justify-center text-[#77736B] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${step === s ? 'bg-[#6E8B67] text-white' : step > s ? 'bg-[#E6ECE4] text-[#445D3E]' : 'bg-[#E8E2D5] text-[#9A958B]'}`}>{s}</div>
              <span className={`text-[11px] font-semibold ${step === s ? 'text-[#292824]' : 'text-[#9A958B]'}`}>{s === 1 ? 'Service Details' : 'Participants & Cost'}</span>
              {s < 2 && <div className="flex-1 h-px bg-[#E8E2D5]" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <>
              <div>
                <label className={labelCls}>Service Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCategory(c.name)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${category === c.name ? 'border-[#6E8B67] bg-[#E6ECE4] text-[#364A32]' : 'border-[#E8E2D5] bg-[#FCF9F3] text-[#524E47] hover:bg-[#F3EEE4]'}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${c.color}`}>
                          <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                        </span>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>Specific Issue / Problem Type *</label>
                <input type="text" className={inputCls} placeholder="e.g. Annual pipe inspection, AC deep clean…" value={problemType} onChange={(e) => setProblemType(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Describe the service needed for all participating households…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Preferred Date *</label>
                <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Time From</label>
                  <input type="time" className={inputCls} value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Time To</label>
                  <input type="time" className={inputCls} value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Min Participants</label>
                  <input type="number" min={2} max={maxP} className={inputCls} value={minP} onChange={(e) => setMinP(Number(e.target.value))} />
                </div>
                <div>
                  <label className={labelCls}>Max Participants</label>
                  <input type="number" min={minP} max={50} className={inputCls} value={maxP} onChange={(e) => setMaxP(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Estimated Total Cost (₹)</label>
                <input type="number" className={inputCls} value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value))} />
                <p className="text-[11px] text-[#77736B] mt-1">
                  Est. per participant: ~₹{fmt(Math.round(estimatedCost / Math.max(minP, 1)))}
                </p>
              </div>

              <div>
                <label className={labelCls}>Group Discount (%)</label>
                <input type="number" min={0} max={40} className={inputCls} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>

              <div>
                <label className={labelCls}>Cost Split Strategy</label>
                <div className="space-y-2">
                  {([
                    { v: 'EQUAL', label: 'Equal Split', sub: 'Everyone pays the same amount' },
                    { v: 'PROPORTIONAL', label: 'Proportional (by area)', sub: 'Based on flat sq.ft.' },
                    { v: 'CUSTOM', label: 'Custom Amounts', sub: 'Organiser sets each share' },
                  ] as const).map(({ v, label, sub }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setStrategy(v)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${strategy === v ? 'border-[#6E8B67] bg-[#E6ECE4]' : 'border-[#E8E2D5] bg-[#FCF9F3] hover:bg-[#F3EEE4]'}`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${strategy === v ? 'border-[#6E8B67] bg-[#6E8B67]' : 'border-[#BCB7AD]'}`} />
                      <div>
                        <p className={`text-xs font-bold ${strategy === v ? 'text-[#364A32]' : 'text-[#292824]'}`}>{label}</p>
                        <p className="text-[11px] text-[#77736B]">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-[#F3EEE4] border border-[#E8E2D5] rounded-2xl space-y-1.5 text-xs">
                <p className="font-bold text-[#292824] mb-2">Booking Summary</p>
                <div className="flex justify-between"><span className="text-[#77736B]">Service</span><span className="font-semibold text-[#292824]">{category || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#77736B]">Date</span><span className="font-semibold text-[#292824]">{date ? fmtDate(date) : '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#77736B]">Participants</span><span className="font-semibold text-[#292824]">{minP}–{maxP} households</span></div>
                <div className="flex justify-between"><span className="text-[#77736B]">Group discount</span><span className="font-bold text-[#445D3E]">{discount}% OFF</span></div>
                <div className="flex justify-between border-t border-[#E8E2D5] pt-1.5 mt-1.5">
                  <span className="text-[#77736B]">Discounted total</span>
                  <span className="font-bold font-mono text-[#292824]">₹{fmt(Math.round(estimatedCost * (1 - discount / 100)))}</span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-[#FAEDE8] border border-[#F4DCD3] rounded-xl text-xs text-[#80432E]">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] text-sm font-semibold text-[#77736B] hover:bg-[#F3EEE4] transition-all cursor-pointer flex items-center gap-1.5"
          >
            {step === 1 ? (
              t('common.cancel', 'Cancel')
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span>{t('groupBooking.back', 'Back')}</span>
              </>
            )}
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={() => {
                if (!category || !problemType || !description || !date) {
                  setError(t('groupBooking.validationError', 'Please complete all fields before continuing.'));
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#6E8B67] hover:bg-[#587352] text-white text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              {t('groupBooking.next', 'Next →')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#6E8B67] hover:bg-[#587352] text-white text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {submitting ? t('groupBooking.creating', 'Creating…') : t('groupBooking.createBtn', 'Create Group Booking')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

interface CommunityGroupBookingProps {
  currentUserId?: string;
  currentUserName?: string;
  currentUserPhone?: string;
  currentUserFlat?: string;
  societyId?: string;
  societyName?: string;
  onViewDetails: (groupBookingId: string) => void;
}

export const CommunityGroupBooking: React.FC<CommunityGroupBookingProps> = ({
  currentUserId = 'user_demo',
  currentUserName = 'Demo User',
  currentUserPhone = '+91 99999 00000',
  currentUserFlat = 'A-101',
  societyId = 'soc_green',
  societyName = 'Green Residency',
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<GroupBookingSummaryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await groupBookingService.getMyGroupBookings(currentUserId, {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      // Also load open bookings from society
      const open = await groupBookingService.getMyGroupBookings(currentUserId, {
        status: ['OPEN', 'LOCKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID'],
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      // Merge and deduplicate
      const seen = new Set<string>();
      const merged: GroupBookingSummaryCard[] = [];
      for (const b of [...result.groupBookings, ...open.groupBookings]) {
        if (!seen.has(b.id)) { seen.add(b.id); merged.push(b); }
      }
      setBookings(merged);
    } catch {
      setError(t('groupBooking.loadError', 'Unable to load group bookings.'));
    } finally {
      setLoading(false);
    }
  }, [currentUserId, t]);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) =>
    filterStatus === 'all' ? true : b.status === filterStatus,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E6ECE4] text-[#445D3E] border border-[#CFDDD0]">
              {societyName}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#292824]">{t('groupBooking.title', 'Community Group Bookings')}</h2>
          <p className="text-xs text-[#77736B] mt-0.5">
            {t('groupBooking.subtitle', 'Book together with neighbours and unlock up to 20% group discounts.')}
          </p>
        </div>
        <button
          type="button"
          id="create-group-booking-btn"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-sm font-bold rounded-2xl shadow-xs transition-all cursor-pointer active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('groupBooking.startGroupBooking', 'Start Group Booking')}
        </button>
      </div>

      {/* ── How it works strip ──────────────────────────────────────── */}
      <div className="p-4 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
          <Percent className="w-4.5 h-4.5 text-[#445D3E]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#2A3927] mb-0.5">{t('groupBooking.howItWorksTitle', 'How Group Bookings Save You Money')}</p>
          <p className="text-[11px] text-[#364A32] leading-relaxed">
            {t('groupBooking.howItWorksDesc', 'When multiple households book the same service on the same day, the cooperative worker eliminates travel overhead. You get a direct 20% discount and the worker earns uninterrupted bulk wages — everyone wins.')}
          </p>
        </div>
      </div>

      {/* ── Status filter ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              filterStatus === s
                ? 'bg-[#292824] text-[#FAF7F2] border-[#292824]'
                : 'bg-[#FCF9F3] text-[#77736B] border-[#E8E2D5] hover:bg-[#F3EEE4]'
            }`}
          >
            {s === 'all'
              ? t('groupBooking.filterAll', { count: bookings.length, defaultValue: `All (${bookings.length})` })
              : s === 'OPEN'
              ? t('groupBooking.filterOpen', 'Open')
              : s === 'IN_PROGRESS'
              ? t('groupBooking.filterInProgress', 'In Progress')
              : t('groupBooking.filterCompleted', 'Completed')}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-[#E8E4DB] rounded-3xl" />)}
        </div>
      ) : error ? (
        <div className="py-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-[#B86B6B]" />
          <p className="text-sm text-[#80432E] font-medium">{error}</p>
          <button type="button" onClick={load} className="text-xs font-bold text-[#537895] hover:underline cursor-pointer">{t('groupBooking.retry', 'Retry')}</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E6ECE4] flex items-center justify-center">
            <Users className="w-7 h-7 text-[#6E8B67]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#292824]">{t('groupBooking.noBookings', 'No group bookings yet')}</p>
            <p className="text-xs text-[#9A958B] mt-1">{t('groupBooking.noBookingsSub', 'Be the first to start one for your society!')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-sm font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            + {t('groupBooking.startGroupBooking', 'Start Group Booking')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserPhone={currentUserPhone}
              currentUserFlat={currentUserFlat}
              onViewDetails={onViewDetails}
              onJoined={load}
            />
          ))}
        </div>
      )}

      {/* ── Create modal ──────────────────────────────────────────── */}
      {showCreate && (
        <CreateModal
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserPhone={currentUserPhone}
          currentUserFlat={currentUserFlat}
          societyId={societyId}
          societyName={societyName}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            load();
            onViewDetails(id);
          }}
        />
      )}
    </div>
  );
};
