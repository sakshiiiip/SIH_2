import React, { useState } from 'react';
import { MOCK_EARNINGS } from '../../data/workerMockData';
import { Badge } from '../../components/common/Badge';
import { StatsCard } from '../../components/worker/StatsCard';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  BarChart2,
  AlertCircle,
} from 'lucide-react';

type EarningsPeriod = 'today' | 'week' | 'month';

// ==================================================================
// PERSON 3 INTEGRATION POINT
// All values in this page use MOCK_EARNINGS from workerMockData.ts.
// When Person 3's payment/earnings API is ready, replace the import
// with a real API call and map to the same EarningsData interface.
// ==================================================================
export const WorkerEarningsPage: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<EarningsPeriod>('week');
  const [showAllPayments, setShowAllPayments] = useState(false);

  const earnings = MOCK_EARNINGS; // Replace with real API data (Person 3)

  const PERIOD_DATA = {
    today: { label: 'Today',     amount: earnings.todayEarnings,   jobs: earnings.todayJobsCount },
    week:  { label: 'This Week', amount: earnings.weeklyEarnings,  jobs: earnings.weeklyJobsCount },
    month: { label: 'This Month',amount: earnings.monthlyEarnings, jobs: earnings.monthlyJobsCount },
  };

  const current = PERIOD_DATA[activePeriod];
  const displayedPayments = showAllPayments
    ? earnings.recentPayments
    : earnings.recentPayments.slice(0, 4);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#292824] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#6E8B67]" />
            My Earnings
          </h1>
          <p className="text-xs text-[#77736B] mt-1">
            Your 70% cooperative worker share — real-time data powered by Person 3's payment module
          </p>
        </div>
        <Badge variant="coop" size="md"><span className="font-mono">70%</span> Share</Badge>
      </div>

      {/* Period toggle */}
      <div className="flex items-center gap-2 bg-[#F3EEE4] p-1 rounded-2xl">
        {(['today', 'week', 'month'] as EarningsPeriod[]).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setActivePeriod(period)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              activePeriod === period
                ? 'bg-white text-[#292824] shadow-xs border border-[#E8E2D5]'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            {PERIOD_DATA[period].label}
          </button>
        ))}
      </div>

      {/* Main earnings display */}
      <div className="p-6 bg-[#EEF3EC] border border-[#CFDDD0] rounded-2xl shadow-card text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#527048]">{current.label}'s Net Earnings</span>
        <div className="text-5xl font-extrabold font-mono text-[#2A3927] mt-1">
          ₹{current.amount.toLocaleString('en-IN')}
        </div>
        <p className="text-sm text-[#527048]">
          {current.jobs} job{current.jobs !== 1 ? 's' : ''} completed · 70% of total charges
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          label="Pending Payout"
          value={`₹${earnings.pendingAmount}`}
          subLabel={`${earnings.pendingJobsCount} job(s) in progress`}
          accent="orange"
          icon={<Clock className="w-4 h-4 text-[#80432E]" />}
        />
        <StatsCard
          label="Total Lifetime"
          value={`₹${earnings.totalLifetimeEarnings.toLocaleString('en-IN')}`}
          subLabel="All-time earnings"
          accent="green"
          icon={<BarChart2 className="w-4 h-4 text-[#6E8B67]" />}
        />
      </div>

      {/* Cooperative split explanation */}
      <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-[#6E8B67]" />
          Cooperative Revenue Split
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Your Share (Worker)', percent: 70, color: 'bg-[#6E8B67]', textColor: 'text-[#364A32]' },
            { label: 'Society Share',       percent: 5,  color: 'bg-[#537895]', textColor: 'text-[#324F66]' },
            { label: 'Cooperative Fund',    percent: 25, color: 'bg-[#7A6A8E]', textColor: 'text-[#3D314C]' },
          ].map(({ label, percent, color, textColor }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={`font-semibold ${textColor}`}>{label}</span>
                <span className="font-bold font-mono">{percent}%</span>
              </div>
              <div className="h-2 bg-[#F3EEE4] rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent payments */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#537895]" />
          Recent Payments
        </h3>
        <div className="space-y-2">
          {displayedPayments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  p.status === 'paid' ? 'bg-[#E6ECE4]' : 'bg-[#FAEDE8]'
                }`}>
                  {p.status === 'paid'
                    ? <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />
                    : <Clock className="w-4 h-4 text-[#80432E]" />
                  }
                </div>
                <div>
                  <span className="text-xs font-bold text-[#292824] block">{p.serviceType}</span>
                  <span className="text-[10px] text-[#77736B]">#{p.jobId} · {p.date}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-[#292824] block">₹{p.amount}</span>
                <span className={`text-[10px] font-bold ${p.status === 'paid' ? 'text-[#6E8B67]' : 'text-[#80432E]'}`}>
                  {p.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {earnings.recentPayments.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAllPayments(!showAllPayments)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#537895] hover:underline cursor-pointer"
          >
            {showAllPayments ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Show All {earnings.recentPayments.length} Payments</>
            )}
          </button>
        )}
      </div>

      {/* Person 3 Integration Banner */}
      <div className="flex items-start gap-3 p-4 bg-[#E4EDF4] border border-[#B8CBDD] rounded-2xl">
        <AlertCircle className="w-5 h-5 text-[#324F66] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-[#324F66]">Payment & Earnings Backend</p>
          <p className="text-[10px] text-[#537895] mt-0.5">
            This page shows mock earnings data. Person 3 will integrate the real payment system here.
            API endpoint: <span className="font-mono">/api/worker/earnings</span>
          </p>
        </div>
      </div>
    </div>
  );
};
