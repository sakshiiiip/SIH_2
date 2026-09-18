import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ActiveJobSOSModal } from './ActiveJobSOSModal';
import { RevisitRequestModal } from './RevisitRequestModal';
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
  RotateCcw,
  ImageIcon,
  Check,
  Filter,
} from 'lucide-react';

interface CustomerActivityPageProps {
  onTrackBooking: (booking: Booking) => void;
  onPayBooking: (booking: Booking) => void;
  onRateBooking: (booking: Booking) => void;
  onRequestNew: () => void;
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
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [revisitModalJob, setRevisitModalJob] = useState<Booking | null>(null);

  const customerBookings = bookings.filter((b) => b.customerId === currentUser.id);

  // Filter lists
  const activeBookings = customerBookings.filter((b) =>
    [
      'PENDING_ASSIGNMENT',
      'WORKER_ASSIGNED',
      'PENDING_WORKER_ACCEPTANCE',
      'CONFIRMED',
      'TRAVELLING',
      'ARRIVED',
      'IN_PROGRESS',
      'AWAITING_VERIFICATION',
      'RE_MATCHING',
    ].includes(b.state)
  );

  const completedBookings = customerBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const qualityBookings = customerBookings.filter((b) =>
    ['QUALITY_ISSUE', 'REVISIT', 'REVISIT_REQUESTED', 'REVISIT_SCHEDULED'].includes(b.state)
  );

  const historyBookings = customerBookings.filter((b) =>
    [
      'COMPLETED',
      'PAID',
      'RATED',
      'REVISIT',
      'REVISIT_REQUESTED',
      'REVISIT_SCHEDULED',
      'CANCELLED',
    ].includes(b.state)
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
      case 'history':
        return historyBookings.filter((b) => {
          if (historyFilter === 'finished') return ['COMPLETED', 'PAID', 'RATED'].includes(b.state);
          if (historyFilter === 'revisited') return ['REVISIT', 'REVISIT_REQUESTED', 'REVISIT_SCHEDULED'].includes(b.state);
          if (historyFilter === 'cancelled') return b.state === 'CANCELLED';
          return true;
        });
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

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E8E2D5] pb-1 text-xs font-bold overflow-x-auto no-scrollbar">
        {[
          { key: 'all', label: 'All Requests', count: customerBookings.length },
          { key: 'active', label: 'Active & Verification', count: activeBookings.length },
          { key: 'completed', label: 'Completed', count: completedBookings.length },
          { key: 'issues', label: 'Service Issues', count: qualityBookings.length },
          { key: 'history', label: 'Job History & Filter', count: historyBookings.length },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-[#E6ECE4] text-[#2A3927] border border-[#CFDDD0] font-extrabold shadow-2xs'
                : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
            }`}
          >
            {t.label} (<span className="font-mono">{t.count}</span>)
          </button>
        ))}
      </div>

      {/* Subfilter pills when on history tab */}
      {activeTab === 'history' && (
        <div className="flex items-center gap-2 flex-wrap pb-1">
          <span className="text-xs text-[#77736B] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter By:
          </span>
          {[
            { id: 'all', label: 'All History' },
            { id: 'finished', label: 'Finished' },
            { id: 'revisited', label: 'Revisited' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setHistoryFilter(f.id as HistoryFilter)}
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
          const statusInfo = mapBookingStatus(b.state);
          const isSOSApplicable = ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.state);
          const isAwaitingVerification = b.state === 'AWAITING_VERIFICATION';
          const isRevisitFlow = ['REVISIT_REQUESTED', 'REVISIT_SCHEDULED'].includes(b.state);

          return (
            <div
              key={b.id}
              className={`p-4 bg-[#FCF9F3] border rounded-2xl shadow-card space-y-3 relative transition-all ${
                isAwaitingVerification
                  ? 'border-blue-300 bg-blue-50/30'
                  : isRevisitFlow
                  ? 'border-amber-300 bg-amber-50/30'
                  : b.state === 'CANCELLED'
                  ? 'border-rose-200 opacity-80'
                  : 'border-[#E8E2D5]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={statusInfo.badgeVariant} dot size="sm">
                      {statusInfo.headline}
                    </Badge>
                    <span className="text-[11px] font-mono text-[#77736B]">#{b.id}</span>
                    {b.customerConfirmation && (
                      <span className="text-[10px] font-bold text-[#364A32] bg-[#E6ECE4] border border-[#CFDDD0] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#6E8B67]" />
                        You Confirmed Work
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-[#292824]">
                    {b.serviceCategory} — {b.problemType}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#77736B]">
                    {b.matchedWorker && (
                      <span>
                        Worker: <strong className="text-[#292824]">{b.matchedWorker.name}</strong>
                      </span>
                    )}
                    <span>
                      Total: <strong className="text-[#292824] font-mono">₹{b.pricing.total}</strong>
                    </span>
                    <span>{b.createdAt?.split('T')[0] || 'Today'}</span>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

              {/* AWAITING VERIFICATION / JOB VERIFICATION CARD */}
              {isAwaitingVerification && (
                <div className="p-3.5 bg-white rounded-xl border border-blue-200 space-y-3 animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs text-blue-950">
                      <strong className="block font-bold text-sm text-blue-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Worker has finished! Please inspect & confirm work.
                      </strong>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Compare the before & after evidence photos below. If you're satisfied, confirm below. If not, request a free revisit.
                      </p>
                    </div>
                  </div>

                  {/* Before / After Photo Comparison */}
                  {(b.beforeImage || b.afterImage || (b.workPhotos && b.workPhotos.length > 0)) && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        {b.beforeImage ? (
                          <img
                            src={b.beforeImage}
                            alt="Before Repair"
                            className="w-full h-28 object-cover"
                          />
                        ) : (
                          <div className="w-full h-28 flex flex-col items-center justify-center text-slate-400 text-[10px]">
                            <ImageIcon className="w-5 h-5 mb-1" />
                            No Before Photo
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Before Repair
                        </span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-[#6E8B67] bg-[#F6FAF5]">
                        {b.afterImage || (b.workPhotos && b.workPhotos[0]) ? (
                          <img
                            src={b.afterImage || (b.workPhotos && b.workPhotos[0])}
                            alt="After Repair"
                            className="w-full h-28 object-cover"
                          />
                        ) : (
                          <div className="w-full h-28 flex flex-col items-center justify-center text-slate-400 text-[10px]">
                            <ImageIcon className="w-5 h-5 mb-1" />
                            No After Photo
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-[#445D3E] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          After Repair ✓
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Customer Actions for Verification */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    <div className="text-[11px] text-slate-500">
                      {b.customerConfirmation ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Confirmation recorded. Awaiting Society Manager final approval.
                        </span>
                      ) : (
                        <span>Step 1: Confirm work or request a revisit.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRevisitModalJob(b)}
                        className="px-3 py-1.5 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] border border-[#F3C5B8] text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Revisit</span>
                      </button>

                      {!b.customerConfirmation && (
                        <button
                          type="button"
                          onClick={() => confirmCustomerJob(b.id)}
                          className="px-3.5 py-1.5 bg-[#445D3E] hover:bg-[#33472F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Work Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* REVISIT DETAILS CARD */}
              {b.revisitDetails && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="font-bold flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                      Revisit Information:
                    </strong>
                    <Badge variant="urgent" size="sm">
                      {b.state === 'REVISIT_SCHEDULED' ? 'Scheduled' : 'Pending Manager Review'}
                    </Badge>
                  </div>
                  <p>Reason: "{b.revisitDetails.reason}"</p>
                  {b.revisitDetails.scheduledDate && (
                    <p className="font-semibold text-amber-800">
                      📅 Scheduled Date: {b.revisitDetails.scheduledDate}
                    </p>
                  )}
                </div>
              )}

              {/* CANCELLATION DETAILS */}
              {b.cancellationDetails && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-0.5">
                  <strong className="font-bold block">Cancellation Reason:</strong>
                  <p>
                    Cancelled by {b.cancellationDetails.cancelledBy}: "{b.cancellationDetails.reason}"
                  </p>
                </div>
              )}
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
