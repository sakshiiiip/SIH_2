import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  CheckCircle2,
  List,
  Search,
  SlidersHorizontal,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Layers,
  Zap,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  ExternalLink,
  Filter,
  ChevronsUpDown,
} from 'lucide-react';
import { workerEarningsService } from '../../container';
import type {
  PendingPayment,
  CompletedPayment,
  WorkerEarningsTransaction,
  EarningsHistoryFilter,
  EarningsDisbursementStatus,
  EarningsTransactionType,
} from '../../types/workerEarnings.types';

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

const fmtRelDate = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return fmtDate(iso);
};

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: EarningsDisbursementStatus }) {
  const { t } = useTranslation();
  const map: Record<EarningsDisbursementStatus, { label: string; cls: string; dot: string }> = {
    PENDING: {
      label: t('worker.earningsDashboard.awaitingPayout', 'Awaiting Payout'),
      cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]',
      dot: 'bg-[#B37055] animate-pulse',
    },
    PROCESSING: {
      label: t('worker.earningsDashboard.processing', 'Processing'),
      cls: 'bg-[#E4EDF4] text-[#324F66] border-[#B8CBDD]',
      dot: 'bg-[#537895] animate-pulse',
    },
    COMPLETED: {
      label: t('worker.earningsDashboard.credited', 'Credited'),
      cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]',
      dot: 'bg-[#6E8B67]',
    },
    FAILED: {
      label: t('worker.earningsDashboard.failed', 'Failed'),
      cls: 'bg-[#FAEBEB] text-[#632727] border-[#F4D7D7]',
      dot: 'bg-[#B86B6B]',
    },
    ON_HOLD: {
      label: t('worker.earningsDashboard.onHold', 'On Hold'),
      cls: 'bg-[#EFEBF4] text-[#3D314C] border-[#DFD8E8]',
      dot: 'bg-[#7A6A8E]',
    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Transaction type icon ───────────────────────────────────────────────────

function TxnIcon({ type }: { type: EarningsTransactionType }) {
  const map: Record<EarningsTransactionType, { icon: React.ReactNode; bg: string }> = {
    JOB_PAYMENT: { icon: <Briefcase className="w-3.5 h-3.5 text-[#537895]" />, bg: 'bg-[#E4EDF4]' },
    GROUP_BOOKING_SHARE: { icon: <Layers className="w-3.5 h-3.5 text-[#7A6A8E]" />, bg: 'bg-[#EFEBF4]' },
    BONUS: { icon: <Zap className="w-3.5 h-3.5 text-[#B37055]" />, bg: 'bg-[#FAEDE8]' },
    DEDUCTION: { icon: <ArrowDownLeft className="w-3.5 h-3.5 text-[#B86B6B]" />, bg: 'bg-[#FAEBEB]' },
    REFUND: { icon: <ArrowUpRight className="w-3.5 h-3.5 text-[#6E8B67]" />, bg: 'bg-[#E6ECE4]' },
    ADVANCE: { icon: <Wallet className="w-3.5 h-3.5 text-[#6E8B67]" />, bg: 'bg-[#E6ECE4]' },
  };
  const { icon, bg } = map[type];
  return (
    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</span>
  );
}

// ─── Shared empty state ───────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, sub }: { icon: React.FC<{ className?: string }>; title: string; sub: string }) {
  return (
    <div className="py-12 flex flex-col items-center gap-3 text-center">
      <Icon className="w-8 h-8 text-[#BCB7AD]" />
      <p className="text-sm font-semibold text-[#292824]">{title}</p>
      <p className="text-xs text-[#9A958B] max-w-[240px]">{sub}</p>
    </div>
  );
}

// ─── Pending payments tab ─────────────────────────────────────────────────────

function PendingTab({ workerId }: { workerId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    workerEarningsService
      .getPendingPayments(workerId)
      .then(setItems)
      .catch(() => setError(t('worker.earningsDashboard.loadErrorPending', 'Could not load pending payments.')))
      .finally(() => setLoading(false));
  }, [workerId, t]);

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#E8E4DB] rounded-2xl" />)}
    </div>
  );

  if (error) return (
    <div className="py-8 text-center text-sm text-[#80432E]">
      <AlertCircle className="w-6 h-6 mx-auto mb-2" />{error}
    </div>
  );

  if (items.length === 0) return (
    <EmptyState
      icon={Clock}
      title={t('worker.earningsDashboard.noPendingPayments', 'No pending payments')}
      sub={t('worker.earningsDashboard.allEarningsDisbursed', 'All your earnings have been disbursed.')}
    />
  );

  const onHold = items.filter((p) => p.status === 'ON_HOLD');
  const active = items.filter((p) => p.status !== 'ON_HOLD');

  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <section>
          <h3 className="text-[11px] font-bold text-[#364A32] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#6E8B67]" /> {t('worker.earningsDashboard.awaitingDisbursement', 'Awaiting Disbursement')}
          </h3>
          <div className="space-y-2">
            {active.map((p) => (
              <div key={p.id} className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl hover:border-[#D8CFBE] hover:shadow-card transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-[#292824] leading-snug">{p.bookingDescription}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#77736B]">
                      <span>{t('worker.earningsDashboard.completed', 'Completed')}: <span className="font-mono text-[#292824]">{fmtDate(p.jobCompletedAt)}</span></span>
                      <span className="w-px h-3 bg-[#E8E2D5]" />
                      <span>{t('worker.earningsDashboard.expectedRelease', 'Expected release')}: <span className="font-mono font-semibold text-[#292824]">{fmtDate(p.expectedDisbursementDate)}</span></span>
                    </div>
                    {p.bookingId && (
                      <p className="text-[11px] text-[#9A958B] font-mono">{t('worker.earningsDashboard.ref', 'Ref')}: {p.bookingId}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="text-base font-bold font-mono text-[#292824]">₹{fmt(p.expectedNetAmount)}</p>
                    {p.expectedDeductions > 0 && (
                      <p className="text-[11px] text-[#9A958B] font-mono">{t('worker.earningsDashboard.gross', 'gross')} ₹{fmt(p.grossAmount)}</p>
                    )}
                    <StatusChip status={p.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {onHold.length > 0 && (
        <section>
          <h3 className="text-[11px] font-bold text-[#504161] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#7A6A8E]" /> {t('worker.earningsDashboard.heldPayments', 'Held Payments')}
          </h3>
          <div className="space-y-2">
            {onHold.map((p) => (
              <div key={p.id} className="p-4 bg-[#EFEBF4]/60 border border-[#DFD8E8] rounded-2xl space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3D314C] leading-snug">{p.bookingDescription}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-base font-bold font-mono text-[#3D314C]">₹{fmt(p.grossAmount)}</p>
                    <StatusChip status={p.status} />
                  </div>
                </div>
                {p.holdReason && (
                  <div className="flex items-start gap-1.5 text-[11px] text-[#504161] bg-[#DFD8E8]/60 rounded-xl px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{p.holdReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Completed payments tab ───────────────────────────────────────────────────

function CompletedTab({ workerId }: { workerId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<CompletedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    workerEarningsService
      .getCompletedPayments(workerId)
      .then(setItems)
      .catch(() => setError(t('worker.earningsDashboard.loadErrorCompleted', 'Could not load completed payments.')))
      .finally(() => setLoading(false));
  }, [workerId, t]);

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-[#E8E4DB] rounded-2xl" />)}
    </div>
  );

  if (error) return (
    <div className="py-8 text-center text-sm text-[#80432E]">
      <AlertCircle className="w-6 h-6 mx-auto mb-2" />{error}
    </div>
  );

  if (items.length === 0) return (
    <EmptyState
      icon={CheckCircle2}
      title={t('worker.earningsDashboard.noCompletedPayments', 'No completed payments yet')}
      sub={t('worker.earningsDashboard.paidOutHint', 'Paid-out earnings will appear here.')}
    />
  );

  const totalCredited = items.reduce((s, p) => s + p.netAmountDisbursed, 0);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between p-3 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl">
        <span className="text-xs font-semibold text-[#364A32]">
          {items.length} {t('worker.earningsDashboard.payments', 'payments')} · {t('worker.earningsDashboard.totalCredited', 'Total Credited')}
        </span>
        <span className="text-sm font-bold font-mono text-[#2A3927]">₹{fmt(totalCredited)}</span>
      </div>

      <div className="divide-y divide-[#F0EDE6] rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] overflow-hidden">
        {items.map((p) => {
          const isDeduction = p.netAmountDisbursed < 0;
          return (
            <div key={p.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#FAF7F2] transition-colors">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isDeduction ? 'bg-[#FAEBEB]' : 'bg-[#E6ECE4]'}`}>
                {isDeduction
                  ? <ArrowDownLeft className="w-3.5 h-3.5 text-[#B86B6B]" />
                  : <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
                }
              </span>
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-[#292824] leading-snug truncate">{p.bookingDescription}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#77736B]">
                  <span className="font-mono">{p.disbursementMethod.replace('_', ' ')}</span>
                  <span className="w-px h-3 bg-[#E8E2D5]" />
                  <span className="font-mono">{p.disbursementReference}</span>
                  {p.externalTransactionId && (
                    <>
                      <span className="w-px h-3 bg-[#E8E2D5]" />
                      <span className="font-mono text-[#9A958B]">{p.externalTransactionId}</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#9A958B]">{fmtDateTime(p.disbursedAt)}</p>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <p className={`text-sm font-bold font-mono ${isDeduction ? 'text-[#B86B6B]' : 'text-[#2A3927]'}`}>
                  {isDeduction ? '-' : '+'}₹{fmt(Math.abs(p.netAmountDisbursed))}
                </p>
                {p.deductionsApplied > 0 && (
                  <p className="text-[11px] text-[#9A958B] font-mono">
                    -{fmt(p.deductionsApplied)} {t('worker.earningsDashboard.deducted', 'deducted')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Transaction history tab ──────────────────────────────────────────────────

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'JOB_PAYMENT', label: 'Job Payments' },
  { value: 'GROUP_BOOKING_SHARE', label: 'Group Booking' },
  { value: 'BONUS', label: 'Bonus' },
  { value: 'DEDUCTION', label: 'Deduction' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'ADVANCE', label: 'Advance' },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Credited' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'FAILED', label: 'Failed' },
];

function HistoryTab({ workerId }: { workerId: string }) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<WorkerEarningsTransaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalNet, setTotalNet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const typeOptions: { value: string; label: string }[] = [
    { value: '', label: t('worker.earningsDashboard.allTypes', 'All Types') },
    { value: 'JOB_PAYMENT', label: t('worker.earningsDashboard.jobPayments', 'Job Payments') },
    { value: 'GROUP_BOOKING_SHARE', label: t('worker.earningsDashboard.groupBookingShare', 'Group Booking') },
    { value: 'BONUS', label: t('worker.earningsDashboard.bonus', 'Bonus') },
    { value: 'DEDUCTION', label: t('worker.earningsDashboard.deductions', 'Deduction') },
    { value: 'REFUND', label: t('worker.earningsDashboard.refund', 'Refund') },
    { value: 'ADVANCE', label: t('worker.earningsDashboard.advance', 'Advance') },
  ];

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: t('worker.earningsDashboard.allStatuses', 'All Statuses') },
    { value: 'PENDING', label: t('worker.earningsDashboard.pending', 'Pending') },
    { value: 'PROCESSING', label: t('worker.earningsDashboard.processing', 'Processing') },
    { value: 'COMPLETED', label: t('worker.earningsDashboard.credited', 'Credited') },
    { value: 'ON_HOLD', label: t('worker.earningsDashboard.onHold', 'On Hold') },
    { value: 'FAILED', label: t('worker.earningsDashboard.failed', 'Failed') },
  ];

  // filter state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchHistory = useCallback(
    async (p: number, q: string) => {
      setLoading(true);
      setError(null);
      try {
        const filter: EarningsHistoryFilter = {
          workerId,
          page: p,
          pageSize,
          sortBy: 'occurredAt',
          sortOrder,
          ...(q && { searchQuery: q }),
          ...(filterType && { type: filterType as EarningsTransactionType }),
          ...(filterStatus && { status: filterStatus as EarningsDisbursementStatus }),
          ...(fromDate && { fromDate }),
          ...(toDate && { toDate }),
        };
        const result = await workerEarningsService.getTransactionHistory(filter);
        setTransactions(result.transactions);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
        setTotalNet(result.totalNetInPeriod);
      } catch {
        setError(t('worker.earningsDashboard.loadErrorHistory', 'Failed to load transaction history.'));
      } finally {
        setLoading(false);
      }
    },
    [workerId, filterType, filterStatus, fromDate, toDate, sortOrder, t],
  );

  useEffect(() => {
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchHistory(1, search), 250);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search, filterType, filterStatus, fromDate, toDate, sortOrder]);

  useEffect(() => {
    fetchHistory(page, search);
  }, [page]);

  const hasFilters = !!(filterType || filterStatus || fromDate || toDate);

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setFromDate('');
    setToDate('');
    setSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A958B]" />
            <input
              type="text"
              placeholder={t('worker.earningsDashboard.searchTransactions', 'Search transactions…')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] placeholder-[#BCB7AD] focus:outline-none focus:border-[#537895] focus:ring-1 focus:ring-[#537895]/30 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[#9A958B]" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
              showFilters || hasFilters
                ? 'bg-[#537895] text-white border-[#537895]'
                : 'bg-[#FCF9F3] border-[#E8E2D5] text-[#77736B] hover:border-[#537895] hover:text-[#537895]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{t('worker.earningsDashboard.filters', 'Filters')}</span>
            {hasFilters && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-[11px] font-bold flex items-center justify-center">
                {[filterType, filterStatus, fromDate, toDate].filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] text-sm text-[#77736B] hover:border-[#537895] hover:text-[#537895] transition-all cursor-pointer"
            title={sortOrder === 'desc' ? t('worker.earningsDashboard.newestFirst', 'Newest first') : t('worker.earningsDashboard.oldestFirst', 'Oldest first')}
          >
            <ChevronsUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="p-3.5 bg-[#F3EEE4] border border-[#E8E2D5] rounded-2xl space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-[#77736B] block mb-1">{t('worker.earningsDashboard.type', 'Type')}</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:border-[#537895] cursor-pointer"
                >
                  {typeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#77736B] block mb-1">{t('worker.earningsDashboard.status', 'Status')}</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:border-[#537895] cursor-pointer"
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#77736B] block mb-1">{t('worker.earningsDashboard.fromDate', 'From Date')}</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:border-[#537895]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#77736B] block mb-1">{t('worker.earningsDashboard.toDate', 'To Date')}</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:border-[#537895]"
                />
              </div>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-[#B37055] hover:text-[#80432E] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> {t('worker.earningsDashboard.clearFilters', 'Clear all filters')}
              </button>
            )}
          </div>
        )}

        {/* Active filter pills */}
        {hasFilters && !showFilters && (
          <div className="flex flex-wrap gap-1.5">
            {filterType && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4EDF4] text-[#324F66] text-[11px] font-semibold border border-[#B8CBDD]">
                <Filter className="w-3 h-3" />
                {typeOptions.find((o) => o.value === filterType)?.label}
                <button type="button" onClick={() => setFilterType('')} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterStatus && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4EDF4] text-[#324F66] text-[11px] font-semibold border border-[#B8CBDD]">
                <Filter className="w-3 h-3" />
                {statusOptions.find((o) => o.value === filterStatus)?.label}
                <button type="button" onClick={() => setFilterStatus('')} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {fromDate && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4EDF4] text-[#324F66] text-[11px] font-semibold border border-[#B8CBDD]">
                {t('worker.earningsDashboard.from', 'From')} {fromDate}
                <button type="button" onClick={() => setFromDate('')} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {toDate && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4EDF4] text-[#324F66] text-[11px] font-semibold border border-[#B8CBDD]">
                {t('worker.earningsDashboard.to', 'To')} {toDate}
                <button type="button" onClick={() => setToDate('')} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Result meta */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-[#77736B]">
          <span>
            {totalCount} {t('worker.earningsDashboard.transactions', 'transactions')} {search ? `${t('worker.earningsDashboard.matching', 'matching')} "${search}"` : ''}
          </span>
          <span className="font-mono font-semibold text-[#292824]">
            {t('worker.earningsDashboard.net', 'Net')}: ₹{fmt(totalNet)}
          </span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[72px] bg-[#E8E4DB] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-[#80432E]">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />{error}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={List}
          title={t('worker.earningsDashboard.noTransactions', 'No transactions found')}
          sub={t('worker.earningsDashboard.adjustFilters', 'Try adjusting your filters or search term.')}
        />
      ) : (
        <div className="divide-y divide-[#F0EDE6] rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] overflow-hidden">
          {transactions.map((txn) => {
            const isNeg = txn.netAmount < 0;
            return (
              <div
                key={txn.id}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#FAF7F2] transition-colors"
              >
                <TxnIcon type={txn.type} />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-[#292824] leading-snug line-clamp-2">{txn.description}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#9A958B]">
                    <span>{fmtRelDate(txn.occurredAt)}</span>
                    {txn.bookingId && (
                      <>
                        <span className="w-px h-3 bg-[#E8E2D5]" />
                        <span className="font-mono flex items-center gap-0.5">
                          <ExternalLink className="w-2.5 h-2.5" /> {txn.bookingId}
                        </span>
                      </>
                    )}
                    {txn.deductions.length > 0 && (
                      <>
                        <span className="w-px h-3 bg-[#E8E2D5]" />
                        <span className="text-[#B37055]">
                          -{fmt(txn.deductions.reduce((s, d) => s + d.amount, 0))} {txn.deductions.map((d) => d.label).join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className={`text-sm font-bold font-mono ${isNeg ? 'text-[#B86B6B]' : 'text-[#2A3927]'}`}>
                    {isNeg ? '-' : '+'}₹{fmt(Math.abs(txn.netAmount))}
                  </p>
                  <StatusChip status={txn.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] text-sm text-[#77736B] hover:border-[#537895] hover:text-[#537895] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> {t('common.prev', 'Prev')}
          </button>

          <span className="text-xs text-[#77736B] font-mono">
            {t('common.page', 'Page')} {page} {t('common.of', 'of')} {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] text-sm text-[#77736B] hover:border-[#537895] hover:text-[#537895] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('common.next', 'Next')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

type PaymentTab = 'pending' | 'completed' | 'history';

interface PaymentHistoryProps {
  workerId?: string;
  defaultTab?: PaymentTab;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  workerId = 'w_rahul',
  defaultTab = 'pending',
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<PaymentTab>(defaultTab);

  const tabs: { id: PaymentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'pending', label: t('worker.earningsDashboard.pending', 'Pending'), icon: <Clock className="w-4 h-4" /> },
    { id: 'completed', label: t('worker.earningsDashboard.credited', 'Credited'), icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'history', label: t('worker.earningsDashboard.history', 'History'), icon: <List className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Tab nav */}
      <div className="flex items-center gap-1 bg-[#F3EEE4] rounded-2xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-[#292824] shadow-subtle'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'pending' && <PendingTab workerId={workerId} />}
        {activeTab === 'completed' && <CompletedTab workerId={workerId} />}
        {activeTab === 'history' && <HistoryTab workerId={workerId} />}
      </div>
    </div>
  );
};
