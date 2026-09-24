import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Layers,
  Briefcase,
  Zap,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { workerEarningsService } from '../../container';
import type { WeeklyEarningsBreakdown, MonthlyEarningsBreakdown } from '../../types/workerEarnings.types';

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CATEGORY_COLORS: Record<string, string> = {
  'Plumbing – Installation': '#537895',
  'Plumbing – Repairs': '#6E8B67',
  'Group Booking Share': '#7A6A8E',
  Bonus: '#B37055',
};

const getColor = (cat: string, idx: number) => {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  const palette = ['#537895', '#6E8B67', '#7A6A8E', '#B37055', '#945973', '#B86B6B'];
  return palette[idx % palette.length];
};

// ─── sub-components ──────────────────────────────────────────────────────────

/** A single animated vertical bar for the 7-day chart */
function WeekBar({
  day,
  value,
  maxValue,
  isToday,
}: {
  day: string;
  value: number;
  maxValue: number;
  isToday: boolean;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <span
        className="text-[11px] font-mono text-[#77736B] truncate"
        title={`₹${fmt(value)}`}
      >
        {value > 0 ? `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}` : ''}
      </span>
      <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
        <div
          className={`w-full max-w-[32px] rounded-t-lg transition-all duration-700 ease-out ${
            isToday
              ? 'bg-gradient-to-t from-[#445D3E] to-[#6E8B67]'
              : value > 0
              ? 'bg-gradient-to-t from-[#B8CBDD] to-[#537895]/70'
              : 'bg-[#E8E2D5]'
          }`}
          style={{ height: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-semibold ${
          isToday ? 'text-[#445D3E]' : 'text-[#9A958B]'
        }`}
      >
        {day}
      </span>
      {isToday && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#6E8B67]" />
      )}
    </div>
  );
}

/** Horizontal bar for category breakdown */
function CategoryBar({
  label,
  amount,
  jobCount,
  maxAmount,
  color,
}: {
  label: string;
  amount: number;
  jobCount: number;
  maxAmount: number;
  color: string;
}) {
  const { t } = useTranslation();
  const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#292824] font-medium truncate max-w-[55%]">{label}</span>
        <div className="text-right shrink-0">
          <span className="font-bold font-mono text-[#292824]">₹{fmt(amount)}</span>
          <span className="text-[11px] text-[#9A958B] ml-1.5">· {jobCount} {t('worker.earningsDashboard.jobs', 'jobs')}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#E8E2D5] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Mini stat badge */
function StatBadge({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 space-y-1 border ${
        accent
          ? 'bg-[#E6ECE4] border-[#CFDDD0]'
          : 'bg-[#FCF9F3] border-[#E8E2D5]'
      } shadow-subtle`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77736B]">{label}</span>
      <p className="text-xl font-bold font-mono text-[#292824] leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-[#9A958B]">{sub}</p>}
    </div>
  );
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function BreakdownSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-40 bg-[#E8E4DB] rounded-xl" />
      <div className="h-52 bg-[#E8E4DB] rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-[#E8E4DB] rounded-2xl" />
        <div className="h-20 bg-[#E8E4DB] rounded-2xl" />
      </div>
      <div className="h-48 bg-[#E8E4DB] rounded-3xl" />
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

interface EarningsBreakdownProps {
  workerId?: string;
}

type ActiveView = 'weekly' | 'monthly';

export const EarningsBreakdown: React.FC<EarningsBreakdownProps> = ({
  workerId = 'w_rahul',
}) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<ActiveView>('weekly');
  const [weekData, setWeekData] = useState<WeeklyEarningsBreakdown | null>(null);
  const [monthData, setMonthData] = useState<MonthlyEarningsBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // month-nav state
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const now = new Date();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const [week, month] = await Promise.all([
        workerEarningsService.getWeeklyBreakdown(workerId),
        workerEarningsService.getMonthlyBreakdown(
          workerId,
          targetDate.getMonth() + 1,
          targetDate.getFullYear(),
        ),
      ]);
      setWeekData(week);
      setMonthData(month);
    } catch {
      setError(t('worker.earningsDashboard.loadErrorBreakdown', 'Failed to load earnings breakdown.'));
    } finally {
      setLoading(false);
    }
  }, [workerId, monthOffset, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <BreakdownSkeleton />;
  if (error || !weekData || !monthData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-[#B86B6B]" />
        <p className="text-sm text-[#80432E] font-medium">{error ?? t('worker.earningsDashboard.noData', 'No data.')}</p>
        <button type="button" onClick={loadData} className="text-xs font-bold text-[#537895] hover:underline cursor-pointer">
          {t('worker.earningsDashboard.retry', 'Retry')}
        </button>
      </div>
    );
  }

  // ── Weekly chart data ────────────────────────────────────────────────
  // Build a full 7-day array aligned Mon–Sun
  const today = new Date().toISOString().slice(0, 10);
  const weekDayNetMap: Record<string, number> = {};
  weekData.dailyBreakdown.forEach((d) => {
    weekDayNetMap[d.date] = d.totalNet;
  });

  // Generate dates for Mon → Sun of the displayed week
  const weekStart = new Date(weekData.weekStartDate + 'T00:00:00');
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    return {
      day: DAY_LABELS[i],
      date: dateStr,
      value: weekDayNetMap[dateStr] ?? 0,
      isToday: dateStr === today,
    };
  });

  const weekMaxValue = Math.max(...weekBars.map((b) => b.value), 1);
  const weekGrowth = weekData.totalNet > 0 ? '+' : '';
  const isPositiveWeek = weekData.totalNet > 0;

  // ── Monthly breakdown ─────────────────────────────────────────────
  const catMax = monthData.topCategories.length > 0
    ? Math.max(...monthData.topCategories.map((c) => c.amount))
    : 1;

  const netVsGross =
    monthData.totalGross > 0
      ? Math.round(((monthData.totalGross - monthData.totalNet) / monthData.totalGross) * 100)
      : 0;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── View toggle ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-[#F3EEE4] rounded-2xl p-1 self-start w-full max-w-xs">
        {(['weekly', 'monthly'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setActiveView(v)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeView === v
                ? 'bg-white text-[#292824] shadow-subtle'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            {v === 'weekly' ? t('worker.earningsDashboard.thisWeek', 'This Week') : t('worker.earningsDashboard.monthly', 'Monthly')}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          WEEKLY VIEW
      ══════════════════════════════════════════════════════════ */}
      {activeView === 'weekly' && (
        <>
          {/* Week header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#292824]">
                {t('worker.earningsDashboard.weekNumber', {
                  week: weekData.weekNumber,
                  year: weekData.year,
                  defaultValue: 'Week {{week}}, {{year}}',
                })}
              </h2>
              <p className="text-xs text-[#77736B] mt-0.5">
                {new Date(weekData.weekStartDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short',
                })} – {new Date(weekData.weekEndDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold font-mono">
              {isPositiveWeek ? (
                <TrendingUp className="w-4 h-4 text-[#6E8B67]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#B86B6B]" />
              )}
              <span className={isPositiveWeek ? 'text-[#364A32]' : 'text-[#632727]'}>
                {weekGrowth}₹{fmt(weekData.totalNet)}
              </span>
            </div>
          </div>

          {/* 7-day bar chart */}
          <div className="rounded-3xl bg-[#FCF9F3] border border-[#E8E2D5] p-5 shadow-subtle">
            <div className="flex items-end gap-2">
              {weekBars.map((b) => (
                <WeekBar
                  key={b.date}
                  day={b.day}
                  value={b.value}
                  maxValue={weekMaxValue}
                  isToday={b.isToday}
                />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E8E2D5] grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-[11px] text-[#77736B] block mb-0.5">{t('worker.earningsDashboard.netEarned', 'Net Earned')}</span>
                <span className="font-bold font-mono text-[#292824]">₹{fmt(weekData.totalNet)}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#77736B] block mb-0.5">{t('worker.earningsDashboard.deductions', 'Deductions')}</span>
                <span className="font-bold font-mono text-[#B86B6B]">
                  {weekData.totalDeductions > 0 ? `₹${fmt(weekData.totalDeductions)}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#77736B] block mb-0.5">{t('worker.earningsDashboard.jobsDone', 'Jobs Done')}</span>
                <span className="font-bold font-mono text-[#292824]">{weekData.jobsCompleted}</span>
              </div>
            </div>
          </div>

          {/* Weekly stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBadge
              label={t('worker.earningsDashboard.bestDay', 'Best Day')}
              value={weekBars.reduce((a, b) => (b.value > a.value ? b : a), weekBars[0]).day}
              sub={`₹${fmt(Math.max(...weekBars.map((b) => b.value)))}`}
              accent
            />
            <StatBadge
              label={t('worker.earningsDashboard.activeDays', 'Active Days')}
              value={`${weekBars.filter((b) => b.value > 0).length}/7`}
              sub={t('worker.earningsDashboard.daysWithEarnings', 'days with earnings')}
            />
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          MONTHLY VIEW
      ══════════════════════════════════════════════════════════ */}
      {activeView === 'monthly' && (
        <>
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMonthOffset((o) => o + 1)}
                className="w-8 h-8 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] flex items-center justify-center hover:bg-[#F3EEE4] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#77736B]" />
              </button>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#537895]" />
                <h2 className="text-base font-bold text-[#292824]">{monthData.monthLabel}</h2>
              </div>
              <button
                type="button"
                onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                disabled={monthOffset === 0}
                className="w-8 h-8 rounded-xl border border-[#E8E2D5] bg-[#FCF9F3] flex items-center justify-center hover:bg-[#F3EEE4] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-[#77736B]" />
              </button>
            </div>
            <span className="text-xs text-[#9A958B]">{monthData.jobsCompleted} {t('worker.earningsDashboard.jobs', 'jobs')}</span>
          </div>

          {/* Monthly hero stats */}
          <div className="rounded-3xl bg-gradient-to-br from-[#E4EDF4] to-[#F3F7FA] border border-[#B8CBDD] p-5 shadow-subtle">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-[#537895] uppercase tracking-wider">{t('worker.earningsDashboard.gross', 'Gross')}</span>
                <p className="text-2xl font-bold font-mono text-[#263D50] mt-0.5">₹{fmt(monthData.totalGross)}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#6E8B67] uppercase tracking-wider">{t('worker.earningsDashboard.net', 'Net')}</span>
                <p className="text-2xl font-bold font-mono text-[#2A3927] mt-0.5">₹{fmt(monthData.totalNet)}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#B37055] uppercase tracking-wider">{t('worker.earningsDashboard.deductions', 'Deductions')}</span>
                <p className="text-2xl font-bold font-mono text-[#643222] mt-0.5">
                  {monthData.totalDeductions > 0 ? `₹${fmt(monthData.totalDeductions)}` : '—'}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider">{t('worker.earningsDashboard.retention', 'Retention')}</span>
                <p className="text-2xl font-bold font-mono text-[#292824] mt-0.5">
                  {(100 - netVsGross).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Gross vs Net visual bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#537895]">
                <span>{t('worker.earningsDashboard.retentionLabel', 'Gross → Net retention')}</span>
                <span className="font-mono">{(100 - netVsGross).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#537895] to-[#6E8B67] transition-all duration-700"
                  style={{ width: `${100 - netVsGross}%` }}
                />
              </div>
            </div>
          </div>

          {/* Deduction breakdown mini-visual */}
          {monthData.totalDeductions > 0 && (
            <div className="rounded-2xl bg-[#FAEDE8] border border-[#F4DCD3] p-4">
              <p className="text-xs font-bold text-[#80432E] uppercase tracking-wider mb-2">
                {t('worker.earningsDashboard.deductionsApplied', 'Deductions Applied')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#80432E]">{t('worker.earningsDashboard.tdsPenalties', 'TDS & Penalties')}</span>
                <span className="text-sm font-bold font-mono text-[#643222]">
                  ₹{fmt(monthData.totalDeductions)}
                </span>
              </div>
            </div>
          )}

          {/* Top income categories */}
          {monthData.topCategories.length > 0 && (
            <div className="rounded-3xl bg-[#FCF9F3] border border-[#E8E2D5] p-5 shadow-subtle space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#537895]" />
                <h3 className="text-sm font-bold text-[#292824]">{t('worker.earningsDashboard.topCategories', 'Top Income Categories')}</h3>
              </div>

              <div className="space-y-4">
                {monthData.topCategories.map((cat, idx) => (
                  <CategoryBar
                    key={cat.category}
                    label={cat.category}
                    amount={cat.amount}
                    jobCount={cat.jobCount}
                    maxAmount={catMax}
                    color={getColor(cat.category, idx)}
                  />
                ))}
              </div>

              {/* Category legend */}
              <div className="pt-2 border-t border-[#E8E2D5] flex flex-wrap gap-3">
                {monthData.topCategories.map((cat, idx) => (
                  <span key={cat.category} className="flex items-center gap-1.5 text-[11px] text-[#77736B]">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: getColor(cat.category, idx) }}
                    />
                    {cat.category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Monthly quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatBadge
              label={t('worker.earningsDashboard.jobsCompleted', 'Jobs Completed')}
              value={`${monthData.jobsCompleted}`}
              sub={t('worker.earningsDashboard.thisMonth', 'this month')}
              accent
            />
            <StatBadge
              label={t('worker.earningsDashboard.avgPerJob', 'Avg / Job')}
              value={
                monthData.jobsCompleted > 0
                  ? `₹${fmt(Math.round(monthData.totalNet / monthData.jobsCompleted))}`
                  : '—'
              }
              sub={t('worker.earningsDashboard.netPerJob', 'net per job')}
            />
          </div>

          {/* Type mix legend */}
          <div className="rounded-2xl bg-[#FCF9F3] border border-[#E8E2D5] p-4 flex flex-wrap gap-4">
            {[
              { icon: <Briefcase className="w-3.5 h-3.5 text-[#537895]" />, label: t('worker.earningsDashboard.jobPayments', 'Job Payments'), bg: 'bg-[#E4EDF4]' },
              { icon: <Layers className="w-3.5 h-3.5 text-[#7A6A8E]" />, label: t('worker.earningsDashboard.groupBookingShare', 'Group Booking Share'), bg: 'bg-[#EFEBF4]' },
              { icon: <Zap className="w-3.5 h-3.5 text-[#B37055]" />, label: t('worker.earningsDashboard.bonus', 'Bonus'), bg: 'bg-[#FAEDE8]' },
              { icon: <Wallet className="w-3.5 h-3.5 text-[#6E8B67]" />, label: t('worker.earningsDashboard.advanceRefund', 'Advance / Refund'), bg: 'bg-[#E6ECE4]' },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-[#77736B]">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${item.bg}`}>
                  {item.icon}
                </span>
                {item.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
