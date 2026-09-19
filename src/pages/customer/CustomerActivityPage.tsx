import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ActiveJobSOSModal } from './ActiveJobSOSModal';
import { mapBookingStatus } from '../../utils/statusMapper';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  KeyRound,
  ShieldCheck,
  Star,
  ChevronRight,
  Phone,
  CreditCard,
  RotateCw,
  AlertOctagon,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface CustomerActivityPageProps {
  onTrackBooking: (booking: Booking) => void;
  onPayBooking: (booking: Booking) => void;
  onRateBooking: (booking: Booking) => void;
  onRequestNew: () => void;
}

type TabType = 'all' | 'active' | 'completed' | 'issues';

export const CustomerActivityPage: React.FC<CustomerActivityPageProps> = ({
  onTrackBooking,
  onPayBooking,
  onRateBooking,
  onRequestNew,
}) => {
  const { currentUser, bookings } = useCooperativeStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sosJob, setSosJob] = useState<Booking | null>(null);

  const customerBookings = bookings.filter((b) => b.customerId === currentUser.id);

  // Filter lists
  const activeBookings = customerBookings.filter((b) =>
    ['PENDING_WORKER_ACCEPTANCE', 'CONFIRMED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'RE_MATCHING'].includes(b.state)
  );

  const completedBookings = customerBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const qualityBookings = customerBookings.filter((b) =>
    ['QUALITY_ISSUE', 'REVISIT'].includes(b.state)
  );

  // Computed total spent
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'active':
        return activeBookings;
      case 'completed':
        return completedBookings;
      case 'issues':
        return qualityBookings;
      case 'all':
      default:
        return customerBookings;
    }
  };

  const filteredList = getFilteredBookings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#292824]">
            My Service Activity
          </h1>
          <p className="text-xs text-[#77736B] mt-0.5">
            Full history of your cooperative household bookings in {currentUser.societyName || 'Green Residency'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#445D3E] bg-[#E6ECE4] px-3 py-1.5 rounded-xl border border-[#CFDDD0]">
            Total Settled: <span className="font-mono">₹{totalSpent.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Simplified Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E8E2D5] pb-1 text-xs font-bold">
        {[
          { key: 'all', label: 'All Requests', count: customerBookings.length },
          { key: 'active', label: 'Active', count: activeBookings.length },
          { key: 'completed', label: 'Completed', count: completedBookings.length },
          { key: 'issues', label: 'Service Issues', count: qualityBookings.length },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key as any)}
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

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredList.map((b) => {
          const statusInfo = mapBookingStatus(b.state);
          const isSOSApplicable = ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.state);

          return (
            <div
              key={b.id}
              className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
            >
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
                    className="px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
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
          );
        })}

        {filteredList.length === 0 && (
          <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-2">
            <span className="text-xs font-bold text-[#292824] block">No requests found.</span>
            <p className="text-xs text-[#77736B]">You don't have any bookings matching this filter.</p>
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
        <ActiveJobSOSModal
          job={sosJob}
          isOpen={sosJob !== null}
          onClose={() => setSosJob(null)}
        />
      )}
    </div>
  );
};
