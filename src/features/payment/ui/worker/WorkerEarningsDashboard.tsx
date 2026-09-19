import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Briefcase,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  RefreshCw,
  Star,
  Wallet,
  ChevronRight,
  Zap,
  Lock,
} from 'lucide-react';
import { workerEarningsService } from '../../container';
import { WorkerEarningsService } from '../../services/WorkerEarningsService';
import type { EarningsDashboardData } from '../../services/WorkerEarningsService';
import type {
  WorkerEarningsTransaction,
  EarningsDisbursementStatus,
  EarningsTransactionType,
} from '../../types/workerEarnings.types';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// ─── sub-components ──────────────────────────────────────────────────────────

function StatusChip({ status }: { status: EarningsDisbursementStatus }) {
  const map: Record<EarningsDisbursementStatus, { label: string; cls: string; dot: string }> = {
    PENDING: {
      label: 'Awaiting Payout',
      cls: 'bg-[#FAEDE8] text-[#80432E] border-[#F4DCD3]',
      dot: 'bg-[#B37055] animate-pulse',
    },
    PROCESSING: {
      label: 'Processing',
      cls: 'bg-[#E4EDF4] text-[#324F66] border-[#B8CBDD]',
      dot: 'bg-[#537895] animate-pulse',
    },
    COMPLETED: {
      label: 'Credited',
      cls: 'bg-[#E6ECE4] text-[#364A32] border-[#CFDDD0]',
      dot: 'bg-[#6E8B67]',
    },
    FAILED: {
      label: 'Failed',
      cls: 'bg-[#FAEBEB] text-[#632727] border-[#F4D7D7]',
      dot: 'bg-[#B86B6B]',
    },
    ON_HOLD: {
      label: 'On Hold',
      cls: 'bg-[#EFEBF4] text-[#3D314C] border-[#DFD8E8]',
      dot: 'bg-[#7A6A8E]',
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function TxnTypeIcon({ type }: { type: EarningsTransactionType }) {
  const map: Record<EarningsTransactionType, { icon: React.ReactNode; bg: string }> = {
    JOB_PAYMENT: {
      icon: <Briefcase className="w-3.5 h-3.5 text-[#537895]" />,
      bg: 'bg-[#E4EDF4]',
    },
    GROUP_BOOKING_SHARE: {
      icon: <Layers className="w-3.5 h-3.5 text-[#7A6A8E]" />,
      bg: 'bg-[#EFEBF4]',
    },
    BONUS: {
      icon: <Zap className="w-3.5 h-3.5 text-[#B37055]" />,
      bg: 'bg-[#FAEDE8]',
    },
    DEDUCTION: {
      icon: <ArrowDownLeft className="w-3.5 h-3.5 text-[#B86B6B]" />,
      bg: 'bg-[#FAEBEB]',
    },
    REFUND: {
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-[#6E8B67]" />,
      bg: 'bg-[#E6ECE4]',
    },
    ADVANCE: {
      icon: <Wallet className="w-3.5 h-3.5 text-[#6E8B67]" />,
      bg: 'bg-[#E6ECE4]',
    },
  };
  const { icon, bg } = map[type];
  return (
    <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
      {icon}
    </span>
  );
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-40 bg-[#E8E4DB] rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[#E8E4DB] rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-[#E8E4DB] rounded-3xl" />
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

interface WorkerEarningsDashboardProps {
  workerId?: string;
  onViewHistory?: () => void;
  onViewBreakdown?: () => void;
}

export const WorkerEarningsDashboard: React.FC<WorkerEarningsDashboardProps> = ({
  workerId = 'w_rahul',
  onViewHistory,
  onViewBreakdown,
}) => {
  const [data, setData] = useState<EarningsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const d = await workerEarningsService.getDashboardData(workerId);
        setData(d);
      } catch (e) {
        setError('Unable to load earnings data. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [workerId],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-[#B86B6B]" />
        <p className="text-sm text-[#80432E] font-medium">{error ?? 'No data available.'}</p>
        <button
          type="button"
          onClick={() => load()}
          className="text-xs font-bold text-[#537895] hover:underline cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, todaySnapshot, pendingPayments, recentCompleted } = data;
  const onHold = pendingPayments.filter((p) => p.status === 'ON_HOLD');
  const activePending = pendingPayments.filter((p) => p.status !== 'ON_HOLD');

  // Build recent 5 transactions list across both pending + completed sources
  // (use the transactions from todaySnapshot + recent completions)
  const recentTxns: WorkerEarningsTransaction[] = todaySnapshot.transactions.slice(0, 6);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ══════════════════════════════════════════════════════════════════
          HERO CARD — Today's earnings + refresh
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A3927] via-[#364A32] to-[#445D3E] p-6 shadow-float">
        {/* decorative circles */}
        <span className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <span className="pointer-events-none absolute -bottom-14 -left-8 w-56 h-56 rounded-full bg-white/4" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#A8B9A3]">
                Today's Earnings
              </span>
              {todaySnapshot.jobsCompleted > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6E8B67]/30 text-[#CFDDD0] border border-[#6E8B67]/40">
                  {todaySnapshot.jobsCompleted} job{todaySnapshot.jobsCompleted > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-end gap-2">
              <span className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight leading-none">
                ₹{fmt(todaySnapshot.totalNet)}
              </span>
              {todaySnapshot.totalDeductions > 0 && (
                <span className="text-xs text-[#A8B9A3] mb-1 font-mono">
                  (gross ₹{fmt(todaySnapshot.totalGross)})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[#A8B9A3] text-xs">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Week: <strong className="text-white font-mono ml-1">₹{fmt(summary.thisWeekNet)}</strong>
              </span>
              <span className="w-px h-3.5 bg-[#6E8B67]/50" />
              <span className="flex items-center gap-1">
                Month: <strong className="text-white font-mono ml-1">₹{fmt(summary.thisMonthNet)}</strong>
              </span>
            </div>
          </div>

          {/* right side: rating + refresh */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              title="Refresh earnings"
            >
              <RefreshCw
                className={`w-4 h-4 text-[#A8B9A3] ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>

            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 rounded-xl">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="text-white text-sm font-bold font-mono">{summary.averageRating}</span>
              <span className="text-[#A8B9A3] text-[11px]">avg rating</span>
            </div>
          </div>
        </div>

        {/* bottom row: all-time + total jobs */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <span className="text-[11px] text-[#A8B9A3] block">All-time Net</span>
            <span className="text-base font-bold font-mono text-white">
              ₹{fmt(summary.allTimeNet)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#A8B9A3] block">Total Jobs</span>
            <span className="text-base font-bold font-mono text-white">
              {summary.totalJobsCompleted}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#A8B9A3] block">Avg / Job</span>
            <span className="text-base font-bold font-mono text-white">
              ₹{fmt(summary.avgEarningsPerJob)}
            </span>
          </div>
          {onViewBreakdown && (
            <button
              type="button"
              onClick={onViewBreakdown}
              className="ml-auto flex items-center gap-1 text-xs font-bold text-[#A8B9A3] hover:text-white transition-colors cursor-pointer"
            >
              Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          QUICK STAT PILLS — pending / on-hold / completed count
      ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Pending */}
        <div
          className="rounded-2xl p-4 bg-[#FCF9F3] border border-[#E8E2D5] shadow-subtle space-y-1 cursor-pointer hover:border-[#D8CFBE] hover:shadow-card transition-all"
          onClick={onViewHistory}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onViewHistory?.()}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#B37055]" />
            <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider">
              Pending
            </span>
          </span>
          <p className="text-xl font-bold font-mono text-[#292824]">
            ₹{fmt(summary.totalPendingAmount)}
          </p>
          <p className="text-[11px] text-[#9A958B]">
            {summary.pendingPaymentCount} payment{summary.pendingPaymentCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* On Hold */}
        <div className="rounded-2xl p-4 bg-[#EFEBF4] border border-[#DFD8E8] shadow-subtle space-y-1">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#7A6A8E]" />
            <span className="text-[11px] font-semibold text-[#504161] uppercase tracking-wider">
              On Hold
            </span>
          </span>
          <p className="text-xl font-bold font-mono text-[#3D314C]">
            {onHold.length > 0 ? `₹${fmt(onHold.reduce((s, p) => s + p.grossAmount, 0))}` : '—'}
          </p>
          <p className="text-[11px] text-[#7A6A8E]">
            {onHold.length} disputed
          </p>
        </div>

        {/* Completed this month */}
        <div className="rounded-2xl p-4 bg-[#E6ECE4] border border-[#CFDDD0] shadow-subtle space-y-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
            <span className="text-[11px] font-semibold text-[#445D3E] uppercase tracking-wider">
              Credited
            </span>
          </span>
          <p className="text-xl font-bold font-mono text-[#2A3927]">
            {recentCompleted.length > 0
              ? `₹${fmt(recentCompleted.reduce((s, p) => s + p.netAmountDisbursed, 0))}`
              : '—'}
          </p>
          <p className="text-[11px] text-[#587352]">{recentCompleted.length} recent</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PENDING PAYMENTS LIST (active only, max 3)
      ══════════════════════════════════════════════════════════════════ */}
      {activePending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#537895]" />
              Upcoming Payouts
            </h2>
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="text-xs font-bold text-[#537895] hover:underline cursor-pointer"
              >
                View all →
              </button>
            )}
          </div>

          <div className="space-y-2">
            {activePending.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl hover:border-[#D8CFBE] transition-all"
              >
                <span className="w-9 h-9 rounded-xl bg-[#FAEDE8] flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4 text-[#B37055]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#292824] truncate">{p.bookingDescription}</p>
                  <p className="text-[11px] text-[#77736B] mt-0.5">
                    Release: <span className="font-mono font-medium text-[#292824]">{fmtDay(p.expectedDisbursementDate)}</span>
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-sm font-bold font-mono text-[#292824]">₹{fmt(p.expectedNetAmount)}</p>
                  <StatusChip status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TODAY'S TRANSACTION ACTIVITY
      ══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#6E8B67]" />
            Today's Activity
          </h2>
          {onViewHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              className="text-xs font-bold text-[#537895] hover:underline cursor-pointer"
            >
              Full history →
            </button>
          )}
        </div>

        {recentTxns.length === 0 ? (
          <div className="py-10 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] text-center space-y-2">
            <Briefcase className="w-7 h-7 text-[#BCB7AD] mx-auto" />
            <p className="text-sm font-medium text-[#292824]">No activity today</p>
            <p className="text-xs text-[#9A958B]">Completed jobs will appear here once processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDE6] rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] overflow-hidden">
            {recentTxns.map((txn) => {
              const isNegative = txn.netAmount < 0;
              return (
                <div
                  key={txn.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAF7F2] transition-colors"
                >
                  <TxnTypeIcon type={txn.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#292824] truncate leading-snug">
                      {txn.description}
                    </p>
                    <p className="text-[11px] text-[#9A958B] mt-0.5">{fmtDate(txn.occurredAt)}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p
                      className={`text-sm font-bold font-mono ${
                        isNegative ? 'text-[#B86B6B]' : 'text-[#2A3927]'
                      }`}
                    >
                      {isNegative ? '-' : '+'}₹{fmt(Math.abs(txn.netAmount))}
                    </p>
                    <StatusChip status={txn.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          RECENT CREDITED PAYMENTS (last 3)
      ══════════════════════════════════════════════════════════════════ */}
      {recentCompleted.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />
              Recently Credited
            </h2>
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="text-xs font-bold text-[#537895] hover:underline cursor-pointer"
              >
                All payments →
              </button>
            )}
          </div>

          <div className="space-y-2">
            {recentCompleted.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3.5 bg-[#E6ECE4]/40 border border-[#CFDDD0] rounded-2xl"
              >
                <span className="w-9 h-9 rounded-xl bg-[#E6ECE4] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#292824] truncate">{p.bookingDescription}</p>
                  <p className="text-[11px] text-[#77736B] font-mono mt-0.5">
                    via {p.disbursementMethod.replace('_', ' ')} · {p.disbursementReference}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-[#364A32]">
                    ₹{fmt(p.netAmountDisbursed)}
                  </p>
                  <p className="text-[11px] text-[#587352] mt-0.5">{fmtDay(p.disbursedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
