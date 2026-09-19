import React, { useEffect, useState, useCallback } from 'react';
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  HeartHandshake,
  Lock,
  X,
  Wifi,
  Zap,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { groupBookingService } from '../../container';
import type {
  ParticipantInvoice,
  ParticipantPaymentRecord,
  ParticipantPaymentMethod,
} from '../../types/groupBooking.types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

/** Deterministic-looking but randomised mock TXN ID */
const makeTxnId = () =>
  `TXN_${Math.floor(800000 + Math.random() * 199999)}`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function InvoiceSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 bg-[#E8E4DB] rounded-xl" />
      <div className="h-52 bg-[#E8E4DB] rounded-3xl" />
      <div className="h-32 bg-[#E8E4DB] rounded-3xl" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK PAYMENT GATEWAY MODAL
// ═══════════════════════════════════════════════════════════════════════════════

type GatewayPhase = 'select' | 'inputs' | 'processing' | 'receipt';

type UpiApp = { id: string; label: string; color: string; emoji: string };
const UPI_APPS: UpiApp[] = [
  { id: 'gpay',    label: 'Google Pay', color: 'bg-white border-[#4285F4]',  emoji: '🔵' },
  { id: 'phonepe', label: 'PhonePe',    color: 'bg-white border-[#5F259F]',  emoji: '🟣' },
  { id: 'paytm',   label: 'Paytm',      color: 'bg-white border-[#00BAF2]',  emoji: '🔷' },
  { id: 'bhim',    label: 'BHIM',        color: 'bg-white border-[#0B2C6B]',  emoji: '🏛️' },
];

type NetBank = { id: string; label: string };
const NET_BANKS: NetBank[] = [
  { id: 'sbi',    label: 'SBI' },
  { id: 'hdfc',   label: 'HDFC Bank' },
  { id: 'icici',  label: 'ICICI Bank' },
  { id: 'axis',   label: 'Axis Bank' },
  { id: 'kotak',  label: 'Kotak Bank' },
  { id: 'pnb',    label: 'Punjab National Bank' },
];

interface GatewayModalProps {
  amount: number;
  invoiceNumber: string;
  customerName: string;
  onClose: () => void;
  onPaid: (txnId: string, method: ParticipantPaymentMethod, methodLabel: string) => void;
}

function GatewayModal({ amount, invoiceNumber, customerName, onClose, onPaid }: GatewayModalProps) {
  // top-level method
  type GMethod = 'UPI' | 'CARD' | 'NET_BANKING';
  const [method, setMethod] = useState<GMethod>('UPI');
  const [phase, setPhase] = useState<GatewayPhase>('select');

  // UPI
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [upiId, setUpiId] = useState('');

  // Card
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Net Banking
  const [selectedBank, setSelectedBank] = useState('sbi');

  // Receipt
  const [txnId, setTxnId] = useState('');
  const [processingMsg, setProcessingMsg] = useState('Connecting to bank…');

  /* ── helpers ── */
  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  /* ── processing animation ── */
  const startProcessing = () => {
    setPhase('processing');
    const msgs = [
      'Connecting to bank…',
      'Authenticating credentials…',
      'Processing with gateway…',
      'Verifying transaction…',
    ];
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      if (i < msgs.length) setProcessingMsg(msgs[i]);
    }, 380);
    const id = makeTxnId();
    setTimeout(() => {
      clearInterval(iv);
      setTxnId(id);
      setPhase('receipt');
    }, 1500);
  };

  const methodPayMap: Record<GMethod, ParticipantPaymentMethod> = {
    UPI: 'UPI',
    CARD: 'CARD',
    NET_BANKING: 'NET_BANKING',
  };
  const methodLabel: Record<GMethod, string> = {
    UPI: selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'phonepe' ? 'PhonePe' : selectedUpiApp === 'paytm' ? 'Paytm' : 'BHIM UPI',
    CARD: 'Credit / Debit Card',
    NET_BANKING: NET_BANKS.find((b) => b.id === selectedBank)?.label ?? 'Net Banking',
  };

  const inputCls =
    'w-full px-3.5 py-3 bg-white border border-[#D8D4CB] rounded-xl text-sm text-[#1A1916] placeholder-[#BCBAB5] focus:outline-none focus:border-[#537895] focus:ring-2 focus:ring-[#537895]/20 transition-all font-mono';
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
        onClick={phase === 'receipt' ? undefined : onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-[#FAF8F4] sm:rounded-3xl rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[94vh]">

        {/* ── Gateway header bar ──────────────────────────────────── */}
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
              onClick={phase === 'receipt' ? () => { onPaid(txnId, methodPayMap[method], methodLabel[method]); } : onClose}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={phase === 'receipt' ? 'Close' : 'Cancel'}
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* ── Amount pill ──────────────────────────────────────────── */}
        {phase !== 'receipt' && (
          <div className="px-5 pt-4 pb-0 shrink-0">
            <div className="flex items-center justify-between p-3.5 bg-white border border-[#E8E2D5] rounded-2xl shadow-subtle">
              <div>
                <p className="text-[10px] font-bold text-[#77736B] uppercase tracking-wider">Paying for</p>
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

          {/* ═══ PHASE: SELECT ════════════════════════════════════════ */}
          {phase === 'select' && (
            <>
              {/* Method tabs */}
              <div className="flex items-center gap-1.5 bg-[#EDEBE4] p-1 rounded-xl">
                {(['UPI', 'CARD', 'NET_BANKING'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${method === m ? 'bg-white text-[#292824] shadow-subtle' : 'text-[#77736B] hover:text-[#292824]'}`}
                  >
                    {m === 'NET_BANKING' ? 'Net Bank' : m}
                  </button>
                ))}
              </div>

              {/* UPI app grid */}
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
                    <label className={labelCls}>Or enter UPI ID directly</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* Card fields */}
              {method === 'CARD' && (
                <div className="space-y-3">
                  {/* Visual card preview */}
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-[#2A3927] via-[#364A32] to-[#537895] p-5 shadow-float select-none">
                    <div className="absolute top-3 right-4 flex items-center gap-1">
                      <div className="w-6 h-4 rounded-sm bg-yellow-400/80" />
                      <div className="w-6 h-4 rounded-sm bg-orange-500/70 -ml-2" />
                    </div>
                    <Wifi className="w-5 h-5 text-white/40 rotate-90 absolute top-4 left-5" />
                    <p className="font-mono text-white/90 text-lg tracking-[0.15em] mt-8 truncate">
                      {cardNum || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-[9px] text-white/50 uppercase">Card Holder</p>
                        <p className="text-xs font-bold text-white/80 truncate max-w-[130px]">{cardName || 'YOUR NAME'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/50 uppercase">Expires</p>
                        <p className="text-xs font-bold text-white/80">{cardExpiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNum}
                      onChange={(e) => setCardNum(formatCard(e.target.value))}
                      maxLength={19}
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelCls}>Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Name on Card</label>
                    <input
                      type="text"
                      placeholder="As printed on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className={`${inputCls} font-sans`}
                    />
                  </div>
                </div>
              )}

              {/* Net banking bank list */}
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
                  <div className="mt-2 p-3 bg-[#E4EDF4]/60 border border-[#B8CBDD] rounded-xl text-[11px] text-[#324F66] flex items-start gap-1.5">
                    <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>You will be redirected to your bank's secure authentication portal after clicking Pay.</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ PHASE: PROCESSING ════════════════════════════════════ */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
              {/* Spinning ring */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none" stroke="#E8E2D5" strokeWidth="6"
                  />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none" stroke="#6E8B67" strokeWidth="6"
                    strokeDasharray="80 140"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-[#6E8B67]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-base font-bold text-[#292824]">Processing Payment…</p>
                <p className="text-sm text-[#537895] font-medium animate-pulse">{processingMsg}</p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#6E8B67]"
                    style={{ animationDelay: `${i * 0.15}s`, animation: 'pulse 1s ease-in-out infinite' }}
                  />
                ))}
              </div>

              <p className="text-[11px] text-[#9A958B] max-w-[220px]">
                Please do not press Back or refresh while your payment is being processed.
              </p>
            </div>
          )}

          {/* ═══ PHASE: RECEIPT ══════════════════════════════════════ */}
          {phase === 'receipt' && (
            <div className="flex flex-col items-center gap-5 py-4 text-center animate-fade-in">
              {/* Animated success icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#E6ECE4] flex items-center justify-center shadow-card border-4 border-[#6E8B67]">
                  <CheckCircle2 className="w-10 h-10 text-[#6E8B67]" />
                </div>
                {/* orbiting star */}
                <Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>

              <div>
                <p className="text-xl font-bold text-[#292824]">Payment Successful!</p>
                <p className="text-sm text-[#77736B] mt-0.5">Your share has been settled. 🎉</p>
              </div>

              {/* Receipt card */}
              <div className="w-full bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-subtle text-left">
                {/* Dashed divider top */}
                <div className="px-5 pt-5 pb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#77736B]">Amount Paid</span>
                    <span className="font-bold font-mono text-[#364A32] text-base">₹{fmt(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#77736B]">Method</span>
                    <span className="font-semibold text-[#292824]">{methodLabel[method]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#77736B]">Invoice</span>
                    <span className="font-mono text-[#292824]">{invoiceNumber}</span>
                  </div>
                </div>

                {/* Dashed middle row */}
                <div className="relative my-0">
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
                      <span className="w-2 h-2 rounded-full bg-[#6E8B67]" />
                      SUCCESS
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

              {/* Cooperative note */}
              <div className="w-full p-3.5 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl flex items-start gap-2.5 text-xs text-[#364A32] text-left">
                <HeartHandshake className="w-4 h-4 shrink-0 mt-0.5 text-[#6E8B67]" />
                <p>
                  Your payment is split transparently — worker livelihood (70%), society fund (20%), cooperative emergency pool (10%). Zero platform profiteering.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer button ────────────────────────────────────────── */}
        {phase !== 'processing' && (
          <div className="px-5 py-4 border-t border-[#E8E2D5] bg-[#FAF8F4] shrink-0">
            {phase === 'receipt' ? (
              <button
                type="button"
                onClick={() => onPaid(txnId, methodPayMap[method], methodLabel[method])}
                className="w-full py-3.5 rounded-2xl bg-[#6E8B67] hover:bg-[#587352] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done — View Booking
              </button>
            ) : (
              <button
                type="button"
                onClick={startProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2A3927] to-[#445D3E] hover:from-[#1E2D1B] hover:to-[#364A32] text-white font-bold shadow-float transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.99]"
              >
                <ShieldCheck className="w-5 h-5" />
                Pay ₹{fmt(amount)} Securely
              </button>
            )}

            {phase === 'select' && (
              <p className="text-center text-[10px] text-[#9A958B] mt-2.5 flex items-center justify-center gap-1">
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
// PAYMENT METHODS (top-level selection in the flow, before gateway opens)
// ═══════════════════════════════════════════════════════════════════════════════

interface PaymentMethodOption {
  id: ParticipantPaymentMethod;
  label: string;
  sub: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  { id: 'UPI',                label: 'UPI',                   sub: 'Google Pay, PhonePe, BHIM, Paytm', icon: <Smartphone className="w-5 h-5" />, popular: true },
  { id: 'CARD',               label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, RuPay',           icon: <CreditCard className="w-5 h-5" /> },
  { id: 'NET_BANKING',        label: 'Net Banking',           sub: 'All major Indian banks',            icon: <Building   className="w-5 h-5" /> },
  { id: 'COOPERATIVE_WALLET', label: 'Cooperative Wallet',    sub: 'Your society wallet balance',       icon: <Wallet     className="w-5 h-5" /> },
];

// ─── page-level step enum ─────────────────────────────────────────────────────
type PayStep = 'invoice' | 'method' | 'confirm' | 'success' | 'failed';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface InvoicePaymentFlowProps {
  invoiceId: string;
  participantId: string;
  groupBookingId: string;
  currentUserId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const InvoicePaymentFlow: React.FC<InvoicePaymentFlowProps> = ({
  invoiceId,
  participantId,
  groupBookingId,
  currentUserId = 'user_demo',
  onBack,
  onSuccess,
}) => {
  const [step, setStep] = useState<PayStep>('invoice');
  const [invoice, setInvoice] = useState<ParticipantInvoice | null>(null);
  const [paymentRecord, setPaymentRecord] = useState<ParticipantPaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ParticipantPaymentMethod>('UPI');

  // Gateway modal state
  const [showGateway, setShowGateway] = useState(false);
  const [paidTxnId, setPaidTxnId] = useState('');
  const [paidMethodLabel, setPaidMethodLabel] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inv = await groupBookingService.getMyInvoice(invoiceId);
      setInvoice(inv);
    } catch {
      setError('Unable to load invoice.');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { load(); }, [load]);

  /** Called by GatewayModal once the receipt phase is dismissed */
  const handleGatewayPaid = async (txnId: string, method: ParticipantPaymentMethod, methodLabel: string) => {
    setShowGateway(false);
    setConfirming(true);
    setError(null);
    try {
      const payment = await groupBookingService.initiatePayment({
        groupBookingId,
        participantId,
        invoiceId,
        paymentMethod: method,
      });
      const confirmed = await groupBookingService.simulatePaymentSuccess(payment.id, txnId);
      setPaymentRecord(confirmed);
      setPaidTxnId(txnId);
      setPaidMethodLabel(methodLabel);
      setStep('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#6E8B67', '#A8B9A3', '#537895', '#B8CBDD', '#FAF7F2'],
      });
    } catch {
      setStep('failed');
      setError('Payment gateway confirmation failed. Please contact support.');
    } finally {
      setConfirming(false);
    }
  };

  // ── Loading / error ───────────────────────────────────────────────
  if (loading) return <InvoiceSkeleton />;
  if (!invoice) {
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-[#B86B6B]" />
        <p className="text-sm text-[#80432E]">{error ?? 'Invoice not found.'}</p>
        <button type="button" onClick={load} className="text-xs font-bold text-[#537895] hover:underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const amountDue = invoice.totalDue - invoice.amountPaid;

  // ── Success screen ─────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-6 py-8 animate-fade-in text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#E6ECE4] border-4 border-[#6E8B67] flex items-center justify-center shadow-card">
          <CheckCircle2 className="w-10 h-10 text-[#6E8B67]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#292824]">Payment Confirmed!</h2>
          <p className="text-sm text-[#77736B]">Your share has been settled. ✅</p>
        </div>
        <div className="w-full max-w-sm bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-subtle text-sm">
          <div className="px-5 pt-5 pb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-[#77736B]">Invoice</span>
              <span className="font-mono font-semibold text-[#292824]">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77736B]">Amount Paid</span>
              <span className="font-bold font-mono text-[#364A32] text-base">₹{fmt(amountDue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77736B]">Method</span>
              <span className="font-semibold text-[#292824]">{paidMethodLabel || PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}</span>
            </div>
          </div>
          {/* Dashed divider */}
          <div className="relative">
            <div className="absolute -left-2 w-5 h-5 rounded-full bg-[#F8F4EC]" />
            <div className="border-t-2 border-dashed border-[#E8E2D5] mx-3" />
            <div className="absolute -right-2 w-5 h-5 rounded-full bg-[#F8F4EC]" />
          </div>
          <div className="px-5 pt-4 pb-5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[#9A958B] text-[11px] uppercase tracking-wider font-bold">Transaction ID</span>
              <span className="text-xs font-mono font-bold bg-[#F3EEE4] text-[#292824] px-2.5 py-1 rounded-lg border border-[#E8E2D5]">
                {paidTxnId || paymentRecord?.gatewayTransactionId || 'TXN_984102'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#9A958B]">Status</span>
              <span className="flex items-center gap-1 font-bold text-[#364A32]">
                <span className="w-2 h-2 rounded-full bg-[#6E8B67]" /> SUCCESS
              </span>
            </div>
          </div>
        </div>
        <div className="w-full max-w-sm p-3.5 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl flex items-start gap-2.5 text-xs text-[#364A32]">
          <HeartHandshake className="w-4 h-4 shrink-0 mt-0.5 text-[#6E8B67]" />
          <p>Your payment is split transparently — worker livelihood, society fund, and cooperative emergency pool. Zero platform profiteering.</p>
        </div>
        <button type="button" onClick={onSuccess} className="w-full max-w-sm py-3 rounded-2xl bg-[#6E8B67] hover:bg-[#587352] text-white font-bold shadow-xs transition-all cursor-pointer">
          View Group Booking →
        </button>
      </div>
    );
  }

  // ── Failed screen ──────────────────────────────────────────────────
  if (step === 'failed') {
    return (
      <div className="flex flex-col items-center gap-6 py-8 animate-fade-in text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#FAEBEB] border-4 border-[#B86B6B] flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-[#B86B6B]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#292824]">Payment Failed</h2>
          <p className="text-sm text-[#77736B] mt-1">{error ?? 'Something went wrong.'}</p>
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <button type="button" onClick={onBack}
            className="flex-1 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] text-sm font-semibold text-[#77736B] hover:bg-[#F3EEE4] transition-all cursor-pointer">
            Back
          </button>
          <button type="button" onClick={() => { setStep('confirm'); setError(null); }}
            className="flex-1 py-2.5 rounded-xl bg-[#6E8B67] hover:bg-[#587352] text-white text-sm font-bold shadow-xs transition-all cursor-pointer">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // MAIN FLOW (invoice → method → confirm → [gateway modal opens])
  // ════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="space-y-5 animate-fade-in">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={step === 'invoice' ? onBack : () => setStep(step === 'confirm' ? 'method' : 'invoice')}
            className="w-8 h-8 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] flex items-center justify-center hover:bg-[#F3EEE4] transition-colors cursor-pointer shrink-0">
            <ChevronLeft className="w-4 h-4 text-[#77736B]" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#292824]">
              {step === 'invoice' ? 'Your Invoice' : step === 'method' ? 'Payment Method' : 'Review & Confirm'}
            </h2>
            <p className="text-xs text-[#77736B] font-mono">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* ── Step indicator ──────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {(['invoice', 'method', 'confirm'] as const).map((s, i) => {
            const labels = { invoice: 'Invoice', method: 'Method', confirm: 'Confirm' };
            const stepOrder = ['invoice', 'method', 'confirm'];
            const done = stepOrder.indexOf(step) > i;
            const active = step === s;
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${done ? 'bg-[#6E8B67] text-white' : active ? 'bg-white border-2 border-[#6E8B67] text-[#364A32]' : 'bg-[#E8E2D5] text-[#9A958B]'}`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-semibold hidden sm:inline ${active ? 'text-[#292824]' : 'text-[#9A958B]'}`}>{labels[s]}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${done ? 'bg-[#6E8B67]' : 'bg-[#E8E2D5]'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════
            STEP 1: Invoice Details
        ════════════════════════════════════════════════════════════ */}
        {step === 'invoice' && (
          <>
            <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-subtle space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#77736B] uppercase tracking-wider">Bill To</p>
                  <p className="text-base font-bold text-[#292824] mt-1">{invoice.customerName}</p>
                  <p className="text-xs text-[#77736B]">{invoice.flatNumber} · {invoice.societyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#77736B] uppercase tracking-wider">Due Date</p>
                  <p className="text-sm font-bold text-[#80432E] mt-1">{fmtDate(invoice.dueDate)}</p>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden">
                <div className="px-4 py-2 bg-[#F3EEE4] grid grid-cols-12 gap-2 text-[10px] font-bold text-[#77736B] uppercase tracking-wider">
                  <span className="col-span-6">Description</span>
                  <span className="col-span-2 text-right">Qty</span>
                  <span className="col-span-2 text-right">Rate</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>
                {invoice.lineItems.map((item, idx) => (
                  <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2 text-sm border-t border-[#E8E2D5]">
                    <span className="col-span-6 text-[#292824] font-medium">{item.description}</span>
                    <span className="col-span-2 text-right text-[#77736B]">{item.quantity}</span>
                    <span className="col-span-2 text-right text-[#77736B] font-mono">₹{fmt(item.unitRate)}</span>
                    <span className="col-span-2 text-right font-mono font-semibold text-[#292824]">₹{fmt(item.amount)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#77736B]">
                  <span>Subtotal</span><span className="font-mono">₹{fmt(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#77736B]">
                  <span>GST ({invoice.taxRatePercent}%)</span><span className="font-mono">₹{fmt(invoice.taxAmount)}</span>
                </div>
                {invoice.amountPaid > 0 && (
                  <div className="flex justify-between text-[#445D3E]">
                    <span>Amount Paid</span><span className="font-mono">−₹{fmt(invoice.amountPaid)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#292824] border-t border-[#E8E2D5] pt-2">
                  <span className="text-base">Amount Due</span>
                  <span className="font-mono text-xl">₹{fmt(amountDue)}</span>
                </div>
              </div>

              {invoice.notes && (
                <div className="p-3 bg-[#F3EEE4] rounded-xl text-xs text-[#77736B]">
                  <p className="font-bold text-[#292824] mb-0.5">Notes</p>
                  <p>{invoice.notes}</p>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl flex items-start gap-2.5 text-xs text-[#364A32]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#6E8B67]" />
              <p>100% transparent. Your payment goes directly to: worker livelihood (70%), society maintenance fund (20%), and cooperative emergency tool pool (10%). Zero platform profiteering.</p>
            </div>

            <button type="button" onClick={() => setStep('method')}
              className="w-full py-3.5 rounded-2xl bg-[#6E8B67] hover:bg-[#587352] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]">
              Proceed to Pay ₹{fmt(amountDue)} <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 2: Select Payment Method
        ════════════════════════════════════════════════════════════ */}
        {step === 'method' && (
          <>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${selectedMethod === m.id ? 'border-[#6E8B67] bg-[#E6ECE4] shadow-card' : 'border-[#E8E2D5] bg-[#FCF9F3] hover:bg-[#F3EEE4] hover:border-[#D8CFBE]'}`}>
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedMethod === m.id ? 'bg-[#6E8B67] text-white' : 'bg-[#F3EEE4] text-[#77736B]'}`}>
                    {m.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${selectedMethod === m.id ? 'text-[#364A32]' : 'text-[#292824]'}`}>{m.label}</p>
                      {m.popular && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FAEDE8] text-[#80432E] border border-[#F4DCD3]">Popular</span>}
                    </div>
                    <p className="text-[11px] text-[#9A958B] mt-0.5">{m.sub}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${selectedMethod === m.id ? 'border-[#6E8B67] bg-[#6E8B67]' : 'border-[#BCB7AD]'}`} />
                </button>
              ))}
            </div>

            {selectedMethod === 'COOPERATIVE_WALLET' && (
              <div className="p-4 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl text-xs text-[#364A32] animate-fade-in">
                <p className="font-bold text-[#2A3927] mb-1">Cooperative Wallet</p>
                <p>Payment will be deducted from your society wallet balance. No gateway fee. Instant settlement.</p>
              </div>
            )}

            <button type="button" onClick={() => setStep('confirm')}
              className="w-full py-3.5 rounded-2xl bg-[#6E8B67] hover:bg-[#587352] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2">
              Review Payment <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 3: Confirm — opens gateway modal on click
        ════════════════════════════════════════════════════════════ */}
        {step === 'confirm' && (
          <>
            {/* Dark summary card */}
            <div className="p-5 bg-gradient-to-br from-[#2A3927] to-[#445D3E] rounded-3xl shadow-float text-white space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#A8B9A3]">Payment Summary</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[#A8B9A3] text-sm">{invoice.customerName}</p>
                  <p className="text-[#A8B9A3] text-xs">{invoice.flatNumber} · {invoice.societyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold font-mono">₹{fmt(amountDue)}</p>
                  <p className="text-[#A8B9A3] text-xs mt-0.5">Total Due</p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[#A8B9A3]">Invoice</p>
                  <p className="font-mono font-semibold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-[#A8B9A3]">Method</p>
                  <p className="font-semibold">{PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}</p>
                </div>
              </div>
            </div>

            {/* Transparent allocation bars */}
            <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3 text-sm">
              <p className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider">Where Your Money Goes</p>
              {[
                { label: 'Worker Direct Payout',        pct: 70, color: 'bg-[#6E8B67]', textColor: 'text-[#364A32]' },
                { label: 'Society Maintenance Fund',     pct: 20, color: 'bg-[#B8CBDD]', textColor: 'text-[#324F66]' },
                { label: 'Cooperative Emergency Pool',   pct: 10, color: 'bg-[#DFD8E8]', textColor: 'text-[#504161]' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#292824]">{item.label} ({item.pct}%)</span>
                    <span className={`font-mono font-bold ${item.textColor}`}>₹{fmt(Math.round(amountDue * item.pct / 100))}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#E8E2D5] overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-[#FAEBEB] border border-[#F4D7D7] rounded-xl text-xs text-[#632727]">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* Opens gateway modal for ALL payment methods */}
            <button
              id="open-payment-gateway-btn"
              type="button"
              onClick={() => setShowGateway(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2A3927] to-[#445D3E] hover:from-[#1E2D1B] hover:to-[#364A32] text-white font-bold shadow-float transition-all cursor-pointer flex items-center justify-center gap-2.5 text-base active:scale-[0.99]"
            >
              <ShieldCheck className="w-5 h-5" />
              Open Secure Gateway — Pay ₹{fmt(amountDue)}
            </button>

            <p className="text-center text-[11px] text-[#9A958B]">
              Secured by cooperative-grade encryption · No data stored externally
            </p>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOCK PAYMENT GATEWAY MODAL
          Rendered at the top level of the fragment so it is NEVER
          unmounted by the confirming/success state changes above.
      ══════════════════════════════════════════════════════════════ */}
      {showGateway && invoice && (
        <GatewayModal
          amount={amountDue}
          invoiceNumber={invoice.invoiceNumber}
          customerName={invoice.customerName}
          onClose={() => setShowGateway(false)}
          onPaid={handleGatewayPaid}
        />
      )}

      {/* Post-gateway confirming overlay — rendered OVER the page without
          unmounting the modal fragment, so no state race occurs */}
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
            <p className="text-xs text-[#9A958B]">Updating your booking status</p>
          </div>
        </div>
      )}
    </>
  );
};
