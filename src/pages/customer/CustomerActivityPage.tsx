import React, { useState, useEffect, useCallback } from 'react';
import React, { useState, useEffect, useCallback, useEffect } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ActiveJobSOSModal } from './ActiveJobSOSModal';
import { RevisitRequestModal } from './RevisitRequestModal';
import { mapBookingStatus } from '../../utils/statusMapper';
import {
  CheckCircle2,
  Star,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Coffee,
  Timer,
  Wrench,
} from 'lucide-react';

// ─── Break countdown timer hook ───────────────────────────────────────────────

function useBreakCountdown(breakDetails: Booking['breakDetails']) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!breakDetails) { setRemaining(null); return; }

    const tick = () => {
      const elapsed = (Date.now() - new Date(breakDetails.startedAt).getTime()) / 1000 / 60;
      const rem = Math.max(0, breakDetails.estimatedDurationMins - elapsed);
      setRemaining(rem);
    };

    tick();
    const id = setInterval(tick, 10_000); // refresh every 10 s
    return () => clearInterval(id);
  }, [breakDetails]);

  return remaining;
}

// ─── Break banner component ───────────────────────────────────────────────────

interface BreakBannerProps {
  booking: Booking;
}

function BreakBanner({ booking }: BreakBannerProps) {
  const bd = booking.breakDetails;
  const remaining = useBreakCountdown(bd);

  if (!bd) return null;

  const startTime = new Date(bd.startedAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  const resumeMs   = new Date(bd.startedAt).getTime() + bd.estimatedDurationMins * 60_000;
  const resumeTime = new Date(resumeMs).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const remMins  = remaining !== null ? Math.floor(remaining)       : '--';
  const remSecs  = remaining !== null ? Math.floor((remaining % 1) * 60) : '--';
  const overdue  = remaining !== null && remaining === 0;

  const reasonIcons: Record<string, React.ReactNode> = {
    'Lunch Break':           <Coffee className="w-4 h-4" />,
    'Sourcing Materials':    <Wrench  className="w-4 h-4" />,
    'Sourcing Parts':        <Wrench  className="w-4 h-4" />,
    'Prayer Break':          <Star    className="w-4 h-4" />,
    'Personal Break':        <Coffee  className="w-4 h-4" />,
  };
  const reasonIcon = bd.reason ? (reasonIcons[bd.reason] ?? <Timer className="w-4 h-4" />) : <Timer className="w-4 h-4" />;

  return (
    <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50 shadow-card space-y-3 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-amber-200 flex items-center justify-center shrink-0 text-amber-800">
          <Coffee className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-amber-900 leading-tight">
            Worker is on a Short Break
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            {booking.matchedWorker?.name ?? 'Your specialist'} will resume work shortly
          </p>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          ON BREAK
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-white/70 rounded-xl border border-amber-200">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Started</p>
          <p className="text-xs font-bold text-amber-900 mt-0.5">{startTime}</p>
        </div>
        <div className="p-2 bg-white/70 rounded-xl border border-amber-200">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Est. Resume</p>
          <p className="text-xs font-bold text-amber-900 mt-0.5">{resumeTime}</p>
        </div>
        <div className={`p-2 rounded-xl border ${overdue ? 'bg-red-50 border-red-300' : 'bg-white/70 border-amber-200'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${overdue ? 'text-red-600' : 'text-amber-700'}`}>
            {overdue ? 'Overdue' : 'Remaining'}
          </p>
          <p className={`text-xs font-extrabold font-mono mt-0.5 ${overdue ? 'text-red-700' : 'text-amber-900'}`}>
            {overdue ? '0:00' : `${remMins}:${typeof remSecs === 'number' ? remSecs.toString().padStart(2, '0') : '--'}`}
          </p>
        </div>
      </div>

      {/* Optional reason */}
      {bd.reason && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-100 border border-amber-200 rounded-xl px-3 py-2">
          <span className="text-amber-600">{reasonIcon}</span>
          <span><strong>Reason:</strong> {bd.reason}</span>
        </div>
      )}
    </div>
  );
}

// ─── Props & component ────────────────────────────────────────────────────────

interface CustomerActivityPageProps {
  onTrackBooking: (booking: Booking) => void;
  onPayBooking:   (booking: Booking) => void;
  onRateBooking:  (booking: Booking) => void;
  onRequestNew:   () => void;
}

type TabType = 'all' | 'active' | 'completed' | 'issues' | 'history';
type HistoryFilter = 'all' | 'finished' | 'revisited' | 'cancelled';

export const CustomerActivityPage: React.FC<CustomerActivityPageProps> = ({
  onTrackBooking,
  onPayBooking,
  onRateBooking,
  onRequestNew,
}) => {
  const { currentUser, bookings, confirmCustomerJob } = useCooperativeStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [sosJob, setSosJob]       = useState<Booking | null>(null);
  const [revisitModalJob, setRevisitModalJob] = useState<Booking | null>(null);
  const [sosJob, setSosJob]       = useState<Booking | null>(null);

  const customerBookings = bookings.filter((b) => b.customerId === currentUser.id);

  // Filter lists — include WORKER_ON_BREAK in active
  const activeBookings = customerBookings.filter((b) =>
    ['PENDING_WORKER_ACCEPTANCE', 'CONFIRMED', 'TRAVELLING', 'ARRIVED',
     'IN_PROGRESS', 'WORKER_ON_BREAK', 'RE_MATCHING'].includes(b.state)
  );

  const completedBookings = customerBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const qualityBookings = customerBookings.filter((b) =>
    ['QUALITY_ISSUE', 'REVISIT'].includes(b.state)
  );

  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);

  const getHistoryList = () => {
    switch (historyFilter) {
      case 'finished':
        return historyBookings.filter((b) => COMPLETED_STATES.includes(b.state));
      case 'revisited':
        return historyBookings.filter((b) => REVISIT_STATES.includes(b.state));
      case 'cancelled':
        return historyBookings.filter((b) => b.state === 'CANCELLED');
      default:
        return historyBookings;
    }
  };

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'active':    return activeBookings;
      case 'completed': return completedBookings;
      case 'issues':    return qualityBookings;
      default:          return customerBookings;
    }
  };

  const filteredList = getFilteredBookings();

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All Requests', count: customerBookings.length },
    { key: 'active', label: 'Active', count: activeBookings.length },
    { key: 'completed', label: 'Completed', count: completedBookings.length },
    { key: 'issues', label: 'Service Issues', count: qualityBookings.length },
    { key: 'history', label: 'History', count: historyBookings.length },
  ];

  const historyFilters: { id: HistoryFilter; label: string }[] = [
    { id: 'all', label: 'All History' },
    { id: 'finished', label: 'Finished' },
    { id: 'revisited', label: 'Revisited' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#292824]">
            My Service Activity
          </h1>
          <p className="text-xs text-[#77736B] mt-0.5">
            Full history of your cooperative household bookings in{' '}
            {currentUser.societyName || 'Green Residency'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#445D3E] bg-[#E6ECE4] px-3 py-1.5 rounded-xl border border-[#CFDDD0]">
            Total Settled: <span className="font-mono">₹{totalSpent.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E8E2D5] pb-1 text-xs font-bold">
        {([
          { key: 'all',       label: 'All Requests',   count: customerBookings.length },
          { key: 'active',    label: 'Active',          count: activeBookings.length },
          { key: 'completed', label: 'Completed',       count: completedBookings.length },
          { key: 'issues',    label: 'Service Issues',  count: qualityBookings.length },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-[#E6ECE4] text-[#2A3927] border border-[#CFDDD0] font-extrabold shadow-2xs'
                : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
            }`}
          >
            {t.label} (<span className="font-mono">{t.count}</span>)
          </button>
        ))}
      </div>

      {/* Sub-filter pills when on history tab */}
      {activeTab === 'history' && (
        <div className="flex items-center gap-2 flex-wrap pb-1">
          <span className="text-xs text-[#77736B] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter By:
          </span>
          {historyFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setHistoryFilter(f.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyFilter === f.id
                  ? 'bg-[#445D3E] text-white shadow-xs'
                  : 'bg-[#FCF9F3] border border-[#E8E2D5] text-[#524E47] hover:bg-[#F3EEE4]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredList.map((b) => {
          const statusInfo    = mapBookingStatus(b.state);
          const isOnBreak     = b.state === 'WORKER_ON_BREAK';
          const isSOSApplicable = ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'WORKER_ON_BREAK'].includes(b.state);
          // Disable "Mark Completed" actions while worker is on break
          const actionsDisabled = isOnBreak;

          return (
            <div
              key={b.id}
              className={`bg-[#FCF9F3] border rounded-2xl shadow-card flex flex-col gap-3 relative transition-all ${
                isOnBreak
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-[#E8E2D5]'
              }`}
            >
              {/* Main info row */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusInfo.badgeVariant} dot size="sm">
                      {statusInfo.headline}
                    </Badge>
                    <span className="text-[11px] font-mono text-[#77736B]">#{b.id}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#292824]">
                    {b.serviceCategory} — {b.problemType}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#77736B]">
                    {b.matchedWorker && (
                      <span>Worker: <strong className="text-[#292824]">{b.matchedWorker.name}</strong></span>
                    )}
                    <span>Total: <strong className="text-[#292824] font-mono">₹{b.pricing.total}</strong></span>
                    <span>{b.createdAt || 'Today'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isSOSApplicable && (
                    <button
                      type="button"
                      onClick={() => setSosJob(b)}
                      className="px-2.5 py-1.5 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] border border-[#F3C5B8] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Emergency SOS — always available"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
                      <span>SOS</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onTrackBooking(b)}
                    className="px-3.5 py-2 bg-[#F3EEE4] hover:bg-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {b.state === 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => onPayBooking(b)}
                      disabled={actionsDisabled}
                      className="px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Pay <span className="font-mono">₹{b.pricing.total}</span>
                    </button>
                  )}

                  {b.state === 'PAID' && (
                    <button
                      type="button"
                      onClick={() => onRateBooking(b)}
                      className="px-3.5 py-2 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Rate Service
                    </button>
                  )}
                </div>
              </div>

              {/* ── Break banner — only shown when WORKER_ON_BREAK ── */}
              {isOnBreak && (
                <div className="px-4 pb-4">
                  <BreakBanner booking={b} />
                </div>
              )}
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-2">
            <span className="text-xs font-bold text-[#292824] block">No requests found.</span>
            <p className="text-xs text-[#77736B]">
              You don't have any bookings matching this filter.
            </p>
            <button
              type="button"
              onClick={onRequestNew}
              className="px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-1"
            >
              Request a Service
            </button>
          </div>
        )}
      </div>

      {/* SOS MODAL */}
      {sosJob && (
        <ActiveJobSOSModal job={sosJob} isOpen={sosJob !== null} onClose={() => setSosJob(null)} />
      )}

      {/* REVISIT REQUEST MODAL */}
      {revisitModalJob && (
        <RevisitRequestModal
          booking={revisitModalJob}
          isOpen={revisitModalJob !== null}
          onClose={() => setRevisitModalJob(null)}
        />
      )}
    </div>
  );
};
