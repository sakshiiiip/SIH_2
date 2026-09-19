import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronLeft,
  AlertCircle,
  Building2,
  User,
  HardHat,
  Layers,
  Lock,
  Unlock,
  Phone,
  MapPin,
  RefreshCw,
  CreditCard,
  CircleDollarSign,
  Percent,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Smartphone,
  Building,
  Wallet,
  Star,
  Zap,
  X,
} from 'lucide-react';
import { groupBookingService } from '../../container';
import type {
  GroupBooking,
  GroupBookingStatus,
  CostSplitStrategy,
  ParticipantStatus,
  ParticipantPaymentMethod,
} from '../../types/groupBooking.types';

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${period}`;
};

const makeTxnId = () =>
  `TXN_${Math.floor(800000 + Math.random() * 199999)}`;

// ─── Status chips ─────────────────────────────────────────────────────────────

function BookingStatusBadge({ status }: { status: GroupBookingStatus }) {
  const cfg: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    OPEN:         { label: 'Open – Accepting Participants',   cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]', icon: <Unlock      className="w-3.5 h-3.5" /> },
    LOCKED:       { label: 'Locked – Cost Split Finalised',  cls: 'bg-[#EFEBF4] text-[#504161] border-[#DFD8E8]', icon: <Lock        className="w-3.5 h-3.5" /> },
    CONFIRMED:    { label: 'Confirmed – Worker Assigned',    cls: 'bg-[#E4EDF4] text-[#324F66] border-[#B8CBDD]', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    IN_PROGRESS:  { label: 'Work In Progress',               cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]', icon: <HardHat    className="w-3.5 h-3.5" /> },
    COMPLETED:    { label: 'Work Completed',                 cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    INVOICED:     { label: 'Invoice Sent',                   cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]', icon: <CreditCard  className="w-3.5 h-3.5" /> },
    PAID:         { label: 'Fully Paid',                     cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    PARTIALLY_PAID:{ label: 'Partially Paid',               cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]', icon: <CircleDollarSign className="w-3.5 h-3.5" /> },
    DRAFT:        { label: 'Draft',                          cls: 'bg-[#F3EEE4] text-[#77736B] border-[#E8E2D5]', icon: <Clock       className="w-3.5 h-3.5" /> },
    CANCELLED:    { label: 'Cancelled',                      cls: 'bg-[#FAEBEB] text-[#632727] border-[#F4D7D7]', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  };
  const s = cfg[status] ?? cfg.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

function ParticipantStatusChip({ status }: { status: ParticipantStatus }) {
  const cfg: Record<ParticipantStatus, { cls: string; dot: string }> = {
    PENDING:         { cls: 'text-[#77736B]', dot: 'bg-[#9A958B]' },
    CONFIRMED:       { cls: 'text-[#364A32]', dot: 'bg-[#6E8B67]' },
    OPT_OUT:         { cls: 'text-[#9A958B]', dot: 'bg-[#BCB7AD]' },
    REMOVED:         { cls: 'text-[#632727]', dot: 'bg-[#B86B6B]' },
    INVOICED:        { cls: 'text-[#80432E]', dot: 'bg-[#B37055]' },
    PAID:            { cls: 'text-[#364A32]', dot: 'bg-[#6E8B67]' },
    PAYMENT_FAILED:  { cls: 'text-[#632727]', dot: 'bg-[#B86B6B] animate-pulse' },
  };
  const s = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status.replace('_', ' ')}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-32 bg-[#E8E4DB] rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#E8E4DB] rounded-2xl" />)}
      </div>
      <div className="h-64 bg-[#E8E4DB] rounded-3xl" />
    </div>
  );
}

// ─── Split strategy badge ─────────────────────────────────────────────────────

function SplitStrategyBadge({ strategy }: { strategy: CostSplitStrategy }) {
  const cfg = {
    EQUAL:        { label: 'Equal Split',             cls: 'bg-[#E4EDF4] text-[#324F66] border-[#B8CBDD]' },
    PROPORTIONAL: { label: 'Proportional (by area)',  cls: 'bg-[#EFEBF4] text-[#504161] border-[#DFD8E8]' },
    CUSTOM:       { label: 'Custom Amounts',           cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]' },
  };
  const s = cfg[strategy];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      <Layers className="w-3 h-3" />{s.label}
    </span>
  );
}

// ─── Progress timeline ────────────────────────────────────────────────────────

const LIFECYCLE: GroupBookingStatus[] = [
  'OPEN', 'LOCKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID',
];

function LifecycleTimeline({ current }: { current: GroupBookingStatus }) {
  const idx = LIFECYCLE.indexOf(current);
  if (idx === -1) return null;
  const labels: Record<GroupBookingStatus, string> = {
    OPEN: 'Open', LOCKED: 'Locked', CONFIRMED: 'Confirmed', IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed', INVOICED: 'Invoiced', PAID: 'Paid',
    DRAFT: 'Draft', PARTIALLY_PAID: 'Partial', CANCELLED: 'Cancelled',
  };
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {LIFECYCLE.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[11px] font-bold transition-all ${
                done   ? 'bg-[#6E8B67] border-[#6E8B67] text-white'
                : active ? 'bg-white border-[#6E8B67] text-[#364A32]'
                         : 'bg-[#FCF9F3] border-[#E8E2D5] text-[#BCB7AD]'
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                active ? 'text-[#364A32]' : done ? 'text-[#6E8B67]' : 'text-[#BCB7AD]'
              }`}>
                {labels[s]}
              </span>
            </div>
            {i < LIFECYCLE.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 min-w-[12px] ${done ? 'bg-[#6E8B67]' : 'bg-[#E8E2D5]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE MOCK PAYMENT GATEWAY MODAL
// Opens directly from the "Pay Now" button — no routing dependency.
// ═══════════════════════════════════════════════════════════════════════════════

type GatewayPhase = 'select' | 'processing' | 'receipt';
type GatewayMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'COOPERATIVE_WALLET';

const UPI_APPS = [
  { id: 'gpay',    label: 'Google Pay', emoji: '🔵' },
  { id: 'phonepe', label: 'PhonePe',   emoji: '🟣' },
  { id: 'paytm',   label: 'Paytm',     emoji: '🔷' },
  { id: 'bhim',    label: 'BHIM',      emoji: '🏛️' },
];

const NET_BANKS = [
  { id: 'sbi',   label: 'SBI' },
  { id: 'hdfc',  label: 'HDFC Bank' },
  { id: 'icici', label: 'ICICI Bank' },
  { id: 'axis',  label: 'Axis Bank' },
  { id: 'kotak', label: 'Kotak Bank' },
];

interface GatewayModalProps {
  amount: number;
  invoiceNumber: string;
  customerName: string;
  /** Called once the receipt screen is dismissed — carries the confirmed TXN id */
  onPaid: (txnId: string, method: ParticipantPaymentMethod) => void;
  onClose: () => void;
}

function GatewayModal({ amount, invoiceNumber, customerName, onPaid, onClose }: GatewayModalProps) {
  const [phase, setPhase]               = useState<GatewayPhase>('select');
  const [method, setMethod]             = useState<GatewayMethod>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId]               = useState('');
  const [cardNum, setCardNum]           = useState('');
  const [cardExpiry, setCardExpiry]     = useState('');
  const [cardCvv, setCardCvv]           = useState('');
  const [cardName, setCardName]         = useState('');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [processingMsg, setProcessingMsg] = useState('Connecting to bank…');
  const [txnId, setTxnId]               = useState('');

  const formatCard   = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const methodLabel: Record<GatewayMethod, string> = {
    UPI: UPI_APPS.find(a => a.id === selectedUpiApp)?.label ?? 'UPI',
    CARD: 'Credit / Debit Card',
    NET_BANKING: NET_BANKS.find(b => b.id === selectedBank)?.label ?? 'Net Banking',
    COOPERATIVE_WALLET: 'Cooperative Wallet',
  };

  const methodPayMap: Record<GatewayMethod, ParticipantPaymentMethod> = {
    UPI: 'UPI', CARD: 'CARD', NET_BANKING: 'NET_BANKING', COOPERATIVE_WALLET: 'COOPERATIVE_WALLET',
  };

  const startProcessing = () => {
    setPhase('processing');
    const msgs = ['Connecting to bank…', 'Authenticating credentials…', 'Processing with gateway…', 'Verifying transaction…'];
    let i = 0;
    const iv = setInterval(() => { i++; if (i < msgs.length) setProcessingMsg(msgs[i]); }, 375);
    const id = makeTxnId();
    setTimeout(() => { clearInterval(iv); setTxnId(id); setPhase('receipt'); }, 1500);
  };

  const inputCls = 'w-full px-3.5 py-3 bg-white border border-[#D8D4CB] rounded-xl text-sm text-[#1A1916] placeholder-[#BCBAB5] focus:outline-none focus:border-[#537895] focus:ring-2 focus:ring-[#537895]/20 transition-all font-mono';
  const labelCls = 'block text-[11px] font-bold text-[#5C574F] uppercase tracking-wider mb-1.5';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Secure Payment Gateway"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={phase === 'processing' ? undefined : (phase === 'receipt' ? undefined : onClose)}
      />

      {/* Modal sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-[#FAF8F4] sm:rounded-3xl rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[94vh]">

        {/* ── Header bar ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1E2D1B] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#6E8B67] flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">Secure Payment Gateway</p>
              <p className="text-[#A8B9A3] text-[10px] font-mono">256-bit encrypted · Cooperative-grade</p>
            </div>
          </div>
          {phase !== 'processing' && (
            <button
              type="button"
              onClick={phase === 'receipt' ? () => onPaid(txnId, methodPayMap[method]) : onClose}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={phase === 'receipt' ? 'Close' : 'Cancel'}
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* ── Amount pill ──────────────────────────────────────────── */}
        {phase !== 'receipt' && (
          <div className="px-5 pt-4 shrink-0">
            <div className="flex items-center justify-between p-3.5 bg-white border border-[#E8E2D5] rounded-2xl shadow-subtle">
              <div>
                <p className="text-[10px] font-bold text-[#77736B] uppercase tracking-wider">Invoice</p>
                <p className="text-sm font-bold text-[#292824] mt-0.5">{invoiceNumber}</p>
                <p className="text-[11px] text-[#9A958B]">{customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#77736B] uppercase tracking-wider">Amount</p>
                <p className="text-2xl font-bold font-mono text-[#292824]">₹{fmt(amount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Scrollable body ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* ═══ SELECT phase ════════════════════════════════════════ */}
          {phase === 'select' && (
            <>
              {/* Method tabs */}
              <div className="flex items-center gap-1 bg-[#EDEBE4] p-1 rounded-xl">
                {(['UPI', 'CARD', 'NET_BANKING', 'COOPERATIVE_WALLET'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${method === m ? 'bg-white text-[#292824] shadow-subtle' : 'text-[#77736B] hover:text-[#292824]'}`}
                  >
                    {m === 'NET_BANKING' ? 'NetBank' : m === 'COOPERATIVE_WALLET' ? 'Wallet' : m}
                  </button>
                ))}
              </div>

              {/* UPI */}
              {method === 'UPI' && (
                <div className="space-y-3">
                  <p className={labelCls}>Select UPI App</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedUpiApp === app.id ? 'border-[#6E8B67] bg-[#E6ECE4]' : 'border-[#E8E2D5] bg-white hover:bg-[#F8F5EE]'}`}
                      >
                        <span className="text-xl leading-none">{app.emoji}</span>
                        <span className={`text-xs font-bold ${selectedUpiApp === app.id ? 'text-[#364A32]' : 'text-[#292824]'}`}>{app.label}</span>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className={labelCls}>Or enter UPI ID</label>
                    <input type="text" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}

              {/* Card */}
              {method === 'CARD' && (
                <div className="space-y-3">
                  {/* Visual card preview */}
                  <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[#2A3927] via-[#364A32] to-[#537895] p-4 shadow-float select-none">
                    <div className="absolute top-3 right-4 flex">
                      <div className="w-6 h-4 rounded-sm bg-yellow-400/80" />
                      <div className="w-6 h-4 rounded-sm bg-orange-500/70 -ml-2" />
                    </div>
                    <p className="font-mono text-white/90 text-base tracking-[0.12em] mt-6 truncate">
                      {cardNum || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs font-bold text-white/80 truncate max-w-[120px]">{cardName || 'YOUR NAME'}</p>
                      <p className="text-xs font-bold text-white/80">{cardExpiry || 'MM/YY'}</p>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" value={cardNum} onChange={(e) => setCardNum(formatCard(e.target.value))} maxLength={19} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelCls}>Expiry</label>
                      <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>CVV</label>
                      <input type="password" placeholder="•••" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Name on Card</label>
                    <input type="text" placeholder="As printed on card" value={cardName} onChange={(e) => setCardName(e.target.value)} className={`${inputCls} font-sans`} />
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {method === 'NET_BANKING' && (
                <div className="space-y-2">
                  <p className={labelCls}>Select your bank</p>
                  {NET_BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${selectedBank === bank.id ? 'border-[#6E8B67] bg-[#E6ECE4] text-[#364A32]' : 'border-[#E8E2D5] bg-white text-[#292824] hover:bg-[#F8F5EE]'}`}
                    >
                      <span>{bank.label}</span>
                      {selectedBank === bank.id && <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />}
                    </button>
                  ))}
                  <div className="p-3 bg-[#E4EDF4]/60 border border-[#B8CBDD] rounded-xl text-[11px] text-[#324F66] flex items-start gap-1.5">
                    <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>You will be authenticated via your bank's secure portal.</span>
                  </div>
                </div>
              )}

              {/* Cooperative Wallet */}
              {method === 'COOPERATIVE_WALLET' && (
                <div className="p-4 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl space-y-1.5">
                  <p className="text-sm font-bold text-[#2A3927]">Cooperative Wallet</p>
                  <p className="text-xs text-[#364A32]">Payment will be deducted from your society wallet balance. No gateway fee. Instant settlement.</p>
                </div>
              )}
            </>
          )}

          {/* ═══ PROCESSING phase ════════════════════════════════════ */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#E8E2D5" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#6E8B67" strokeWidth="6"
                    strokeDasharray="80 140" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-[#6E8B67]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-bold text-[#292824]">Processing Payment with Bank…</p>
                <p className="text-sm text-[#537895] font-medium animate-pulse">{processingMsg}</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#6E8B67] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-[11px] text-[#9A958B] max-w-[200px]">
                Do not press Back or refresh while processing.
              </p>
            </div>
          )}

          {/* ═══ RECEIPT phase ═══════════════════════════════════════ */}
          {phase === 'receipt' && (
            <div className="flex flex-col items-center gap-5 py-4 text-center animate-fade-in">
              {/* Success icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#E6ECE4] flex items-center justify-center shadow-card border-4 border-[#6E8B67]">
                  <CheckCircle2 className="w-10 h-10 text-[#6E8B67]" />
                </div>
                <Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>

              <div>
                <p className="text-xl font-bold text-[#292824]">Payment Successful!</p>
                <p className="text-sm text-[#77736B] mt-0.5">Your share has been settled. 🎉</p>
              </div>

              {/* Tearable receipt card */}
              <div className="w-full bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-subtle text-left">
                <div className="px-5 pt-5 pb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#77736B]">Amount Paid</span>
                    <span className="font-bold font-mono text-[#364A32] text-base">₹{fmt(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#77736B]">Method</span>
                    <span className="font-semibold text-[#292824]">{methodLabel[method]}</span>
                  </div>
                </div>
                {/* Dashed tear line */}
                <div className="relative">
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#FAF8F4]" />
                  <div className="border-t-2 border-dashed border-[#E8E2D5] mx-4" />
                  <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#FAF8F4]" />
                </div>
                <div className="px-5 pt-4 pb-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider">Transaction ID</span>
                    <span className="text-xs font-mono font-bold text-[#292824] bg-[#F3EEE4] px-2.5 py-1 rounded-lg border border-[#E8E2D5]">
                      {txnId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#9A958B]">Status</span>
                    <span className="flex items-center gap-1 font-bold text-[#364A32]">
                      <span className="w-2 h-2 rounded-full bg-[#6E8B67]" />SUCCESS
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#9A958B]">Timestamp</span>
                    <span className="font-mono text-[#292824]">
                      {new Date().toLocaleString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cooperative transparency note */}
              <div className="w-full p-3.5 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl flex items-start gap-2.5 text-xs text-[#364A32] text-left">
                <HeartHandshake className="w-4 h-4 shrink-0 mt-0.5 text-[#6E8B67]" />
                <p>Worker livelihood (70%) · Society fund (20%) · Emergency pool (10%). Zero platform profiteering.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer CTA ───────────────────────────────────────────── */}
        {phase !== 'processing' && (
          <div className="px-5 py-4 border-t border-[#E8E2D5] bg-[#FAF8F4] shrink-0">
            {phase === 'receipt' ? (
              <button
                type="button"
                onClick={() => onPaid(txnId, methodPayMap[method])}
                className="w-full py-3.5 rounded-2xl bg-[#6E8B67] hover:bg-[#587352] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done — Update Booking Status
              </button>
            ) : (
              <button
                type="button"
                id="gateway-pay-btn"
                onClick={startProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2A3927] to-[#445D3E] hover:from-[#1E2D1B] hover:to-[#364A32] text-white font-bold shadow-float transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.99]"
              >
                <ShieldCheck className="w-5 h-5" />
                Pay ₹{fmt(amount)} Securely
              </button>
            )}
            {phase === 'select' && (
              <p className="text-center text-[10px] text-[#9A958B] mt-2 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                256-bit SSL · PCI-DSS compliant · No card data stored
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GroupBookingDetailsProps {
  groupBookingId: string;
  currentUserId?: string;
  onBack: () => void;
  /**
   * Optional — kept for backward-compat with CustomerPaymentContainer.
   * When provided it is called AFTER the gateway receipt is dismissed,
   * allowing the container to navigate to the full InvoicePaymentFlow view.
   * When omitted, the inline GatewayModal handles everything locally.
   */
  onPayMyShare?: (invoiceId: string, participantId: string) => void;
}

export const GroupBookingDetails: React.FC<GroupBookingDetailsProps> = ({
  groupBookingId,
  currentUserId = 'user_demo',
  onBack,
  onPayMyShare,
}) => {
  const [booking, setBooking]         = useState<GroupBooking | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // ── Gateway modal state ─────────────────────────────────────────
  const [showGateway, setShowGateway] = useState(false);
  const [confirming, setConfirming]   = useState(false);
  const [payError, setPayError]       = useState<string | null>(null);
  const [paidTxnId, setPaidTxnId]     = useState('');
  const [paidSuccess, setPaidSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gb = await groupBookingService.getDetailView(groupBookingId);
      setBooking(gb.booking);
    } catch {
      setError('Unable to load group booking details.');
    } finally {
      setLoading(false);
    }
  }, [groupBookingId]);

  useEffect(() => { load(); }, [load]);

  /**
   * Called by GatewayModal once the user dismisses the receipt screen.
   * Calls the service to confirm, then refreshes the booking data.
   */
  const handleGatewayPaid = async (txnId: string, method: ParticipantPaymentMethod) => {
    if (!booking) return;
    const myParticipation = booking.participants.find((p) => p.userId === currentUserId);
    if (!myParticipation?.invoiceId) return;

    setShowGateway(false);
    setConfirming(true);
    setPayError(null);
    try {
      const payment = await groupBookingService.initiatePayment({
        groupBookingId,
        participantId: myParticipation.id,
        invoiceId: myParticipation.invoiceId,
        paymentMethod: method,
      });
      await groupBookingService.simulatePaymentSuccess(payment.id, txnId);
      setPaidTxnId(txnId);
      setPaidSuccess(true);
      // Refresh booking data so participant status updates to PAID
      await load();
      // Also fire container callback if provided (for navigation)
      if (onPayMyShare && myParticipation.invoiceId) {
        onPayMyShare(myParticipation.invoiceId, myParticipation.id);
      }
    } catch {
      setPayError('Payment confirmation failed. Please contact support.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (error || !booking) {
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-[#B86B6B]" />
        <p className="text-sm text-[#80432E]">{error ?? 'Booking not found.'}</p>
        <button type="button" onClick={load} className="text-xs font-bold text-[#537895] hover:underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const myParticipation = booking.participants.find((p) => p.userId === currentUserId);
  const activeParticipants = booking.participants.filter(
    (p) => !['OPT_OUT', 'REMOVED'].includes(p.status),
  );
  const paidCount  = booking.participants.filter((p) => p.status === 'PAID').length;
  const totalCount = activeParticipants.length;
  const paidPct    = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  /**
   * Show the "Pay Now" CTA whenever the booking is INVOICED and the participant
   * still needs to pay — OR always show it in INVOICED/PARTIALLY_PAID state so
   * users can always trigger the gateway (useful while mock data lacks an invoiceId).
   */
  const canPay =
    myParticipation &&
    ['INVOICED', 'PARTIALLY_PAID', 'COMPLETED'].includes(booking.status) &&
    !['PAID', 'OPT_OUT', 'REMOVED'].includes(myParticipation.status);

  const myShare = myParticipation?.assignedCostShare
    ?? (booking.costSplit.discountedTotal > 0 && totalCount > 0
      ? Math.round(booking.costSplit.discountedTotal / Math.max(totalCount, 1))
      : 0);

  // Invoice number for gateway display (fallback to booking ref)
  const invoiceNumber = myParticipation?.invoiceId
    ? `INV-${myParticipation.invoiceId.slice(-6).toUpperCase()}`
    : `INV-${booking.referenceNumber}`;

  return (
    <>
      <div className="space-y-5 animate-fade-in">
        {/* ── Back + header ──────────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] flex items-center justify-center hover:bg-[#F3EEE4] transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <ChevronLeft className="w-4 h-4 text-[#77736B]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#77736B] font-mono">{booking.referenceNumber}</span>
              <BookingStatusBadge status={booking.status} />
            </div>
            <h2 className="text-lg font-bold text-[#292824] leading-snug">{booking.serviceCategory}</h2>
            <p className="text-xs text-[#77736B] mt-0.5">{booking.description}</p>
          </div>
          <button type="button" onClick={load} className="w-8 h-8 rounded-xl bg-[#FCF9F3] border border-[#E8E2D5] flex items-center justify-center hover:bg-[#F3EEE4] transition-colors cursor-pointer shrink-0">
            <RefreshCw className="w-3.5 h-3.5 text-[#77736B]" />
          </button>
        </div>

        {/* ── Pay My Share CTA ─────────────────────────────────────── */}
        {paidSuccess ? (
          <div className="p-4 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#6E8B67] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#2A3927]">Payment Confirmed!</p>
              <p className="text-xs text-[#445D3E] font-mono">{paidTxnId}</p>
            </div>
          </div>
        ) : canPay ? (
          <div className="p-4 bg-gradient-to-r from-[#E6ECE4] to-[#F3F7FA] border border-[#CFDDD0] rounded-2xl flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#2A3927]">Invoice Ready — Pay Your Share</p>
              <p className="text-xs text-[#445D3E] mt-0.5">
                Your share: <span className="font-bold font-mono">₹{fmt(myShare)}</span>
              </p>
              {payError && (
                <p className="text-[11px] text-[#80432E] mt-0.5">{payError}</p>
              )}
            </div>
            <button
              id="pay-my-share-btn"
              type="button"
              onClick={() => {
                setPayError(null);
                setShowGateway(true);
              }}
              disabled={confirming}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98] shrink-0 disabled:opacity-60"
            >
              {confirming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <>Pay Now <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        ) : null}

        {/* ── Lifecycle timeline ─────────────────────────────────────── */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
          <p className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider mb-3">Booking Progress</p>
          <LifecycleTimeline current={booking.status} />
        </div>

        {/* ── Quick stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] shadow-subtle space-y-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#77736B]">
              <Users className="w-3.5 h-3.5 text-[#537895]" /> Participants
            </span>
            <p className="text-lg font-bold font-mono text-[#292824]">{totalCount}</p>
            <p className="text-[11px] text-[#9A958B]">of max {booking.maximumParticipants}</p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] shadow-subtle space-y-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#77736B]">
              <Percent className="w-3.5 h-3.5 text-[#6E8B67]" /> Discount
            </span>
            <p className="text-lg font-bold font-mono text-[#364A32]">{booking.costSplit.groupDiscountPercent}%</p>
            <p className="text-[11px] text-[#587352]">group saving</p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] shadow-subtle space-y-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#77736B]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" /> Paid
            </span>
            <p className="text-lg font-bold font-mono text-[#292824]">{paidCount}/{totalCount}</p>
            <p className="text-[11px] text-[#9A958B]">{paidPct}% settled</p>
          </div>
        </div>

        {/* ── Cost breakdown ─────────────────────────────────────────── */}
        <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#292824] flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-[#537895]" />
              Cost Breakdown
            </h3>
            <SplitStrategyBadge strategy={booking.costSplit.strategy} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#77736B]">
              <span>Total Service Cost</span>
              <span className="font-mono">₹{fmt(booking.costSplit.totalGroupCost)}</span>
            </div>
            <div className="flex justify-between text-[#445D3E]">
              <span>Group Discount ({booking.costSplit.groupDiscountPercent}%)</span>
              <span className="font-mono font-semibold">−₹{fmt(booking.costSplit.totalGroupCost - booking.costSplit.discountedTotal)}</span>
            </div>
            <div className="flex justify-between text-[#292824] font-bold border-t border-[#E8E2D5] pt-2">
              <span>Discounted Total</span>
              <span className="font-mono">₹{fmt(booking.costSplit.discountedTotal)}</span>
            </div>
            {myParticipation?.assignedCostShare != null && (
              <div className="flex justify-between text-[#364A32] font-bold bg-[#E6ECE4] rounded-xl px-3 py-2 border border-[#CFDDD0]">
                <span>Your Share</span>
                <span className="font-mono">₹{fmt(myParticipation.assignedCostShare)}</span>
              </div>
            )}
          </div>

          {booking.costSplit.allocations.length > 0 && (
            <div className="pt-3 border-t border-[#E8E2D5] space-y-2.5">
              <p className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider">Individual Allocations</p>
              {booking.costSplit.allocations.map((alloc) => {
                const pct = booking.costSplit.discountedTotal > 0
                  ? (alloc.finalShare / booking.costSplit.discountedTotal) * 100
                  : 0;
                const isMe = alloc.userId === currentUserId;
                return (
                  <div key={alloc.participantId} className={`space-y-1 p-2.5 rounded-xl ${isMe ? 'bg-[#E6ECE4] border border-[#CFDDD0]' : ''}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${isMe ? 'text-[#364A32] font-bold' : 'text-[#292824]'}`}>
                        {alloc.customerName} ({alloc.flatNumber}){isMe && ' · You'}
                      </span>
                      <span className="font-mono font-bold text-[#292824]">₹{fmt(alloc.finalShare)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#E8E2D5] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isMe ? 'bg-[#6E8B67]' : 'bg-[#B8CBDD]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Participants list ─────────────────────────────────────── */}
        <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#292824] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#537895]" />
              Participants ({activeParticipants.length})
            </h3>
            <span className="text-[11px] text-[#9A958B]">{paidCount} paid · {totalCount - paidCount} pending</span>
          </div>
          <div className="divide-y divide-[#F0EDE6]">
            {activeParticipants.map((p) => {
              const isMe = p.userId === currentUserId;
              return (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${isMe ? 'bg-[#E6ECE4] text-[#364A32]' : 'bg-[#F3EEE4] text-[#524E47]'}`}>
                    {p.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isMe ? 'text-[#364A32]' : 'text-[#292824]'} truncate`}>
                      {p.customerName}{isMe && ' (You)'}
                    </p>
                    <p className="text-[11px] text-[#9A958B]">
                      {p.flatNumber}{p.tower ? `, ${p.tower}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    {p.assignedCostShare != null && (
                      <p className="text-xs font-bold font-mono text-[#292824]">₹{fmt(p.assignedCostShare)}</p>
                    )}
                    <ParticipantStatusChip status={p.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Worker assignments ─────────────────────────────────────── */}
        {booking.workerAssignments.length > 0 && (
          <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-[#292824] flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-[#537895]" />
              Worker Assignments
            </h3>
            {booking.workerAssignments.map((w) => (
              <div key={w.id} className="flex items-start gap-3 p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-[#E4EDF4] flex items-center justify-center shrink-0">
                  <HardHat className="w-4 h-4 text-[#537895]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#292824]">{w.workerName}</p>
                  <p className="text-[11px] text-[#77736B]">{w.workerProfession}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#9A958B] mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{w.workerPhone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{w.assignedFlats.join(', ')}</span>
                  </div>
                </div>
                {w.arrivalOtpVerified && (
                  <CheckCircle2 className="w-4 h-4 text-[#6E8B67] shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Schedule ─────────────────────────────────────────────── */}
        <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
          <h3 className="text-xs font-bold text-[#77736B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-[#9A958B]">Preferred Date</p>
              <p className="font-semibold text-[#292824]">{fmtDate(booking.schedule.preferredDate)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9A958B]">Time Window</p>
              <p className="font-semibold text-[#292824]">
                {fmtTime(booking.schedule.preferredTimeStart)} – {fmtTime(booking.schedule.preferredTimeEnd)}
              </p>
            </div>
            {booking.schedule.confirmedDate && (
              <>
                <div>
                  <p className="text-[11px] text-[#6E8B67] font-semibold">Confirmed Date ✓</p>
                  <p className="font-bold text-[#364A32]">{fmtDate(booking.schedule.confirmedDate)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6E8B67] font-semibold">Confirmed Time ✓</p>
                  <p className="font-bold text-[#364A32]">
                    {fmtTime(booking.schedule.confirmedTimeStart ?? booking.schedule.preferredTimeStart)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Organiser info ─────────────────────────────────────────── */}
        <div className="p-4 bg-[#F3EEE4] border border-[#E8E2D5] rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E6ECE4] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#445D3E]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#292824]">Organised by {booking.organiserName}</p>
            <p className="text-[11px] text-[#77736B]">
              {booking.organiserFlatNumber} · {booking.societyName}
            </p>
            <p className="text-[11px] text-[#77736B] flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />{booking.organiserPhone}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          GATEWAY MODAL — always mounted in the fragment so it is
          never ejected by a state change in the parent.
      ══════════════════════════════════════════════════════════════ */}
      {showGateway && (
        <GatewayModal
          amount={myShare}
          invoiceNumber={invoiceNumber}
          customerName={myParticipation?.customerName ?? 'You'}
          onClose={() => setShowGateway(false)}
          onPaid={handleGatewayPaid}
        />
      )}

      {/* Post-gateway confirming overlay */}
      {confirming && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 bg-[#FAF8F4] rounded-3xl px-10 py-10 shadow-float">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#E8E2D5" strokeWidth="5" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#6E8B67" strokeWidth="5"
                  strokeDasharray="55 110" strokeLinecap="round" />
              </svg>
              <ShieldCheck className="absolute inset-0 m-auto w-6 h-6 text-[#6E8B67]" />
            </div>
            <p className="text-sm font-semibold text-[#292824]">Confirming payment…</p>
            <p className="text-xs text-[#9A958B]">Updating your booking status to PAID</p>
          </div>
        </div>
      )}
    </>
  );
};
