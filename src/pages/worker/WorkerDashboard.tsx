import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { WorkerJobExecutionModal } from './WorkerJobExecutionModal';
import { WorkerSOSModal } from './WorkerSOSModal';
import { Modal } from '../../components/common/Modal';
import { WorkerOnboarding } from './WorkerOnboarding';
import {
  HardHat,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  ChevronRight,
  ShieldAlert,
  Wrench,
  DollarSign,
  User,
  Users,
} from 'lucide-react';

interface WorkerDashboardProps {
  onOpenToolBank: () => void;
  onOpenEmergencyAid?: () => void;
  onOpenVerification?: () => void;
  onOpenCommunity?: () => void;
  onOpenMyWork?: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  onOpenToolBank,
  onOpenEmergencyAid,
  onOpenVerification,
  onOpenCommunity,
  onOpenMyWork,
}) => {
  const {
    currentUser,
    workers,
    bookings,
    communityMessages,
    acceptBookingByWorker,
    rejectBookingByWorker,
    toggleWorkerAvailability,
    showToast,
  } = useCooperativeStore();

  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers[0];

  const [selectedBookingForExecution, setSelectedBookingForExecution] = useState<Booking | null>(null);
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Incoming booking waiting for worker confirmation
  const pendingIncomingBooking = bookings.find(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      b.state === 'PENDING_WORKER_ACCEPTANCE'
  );

  // Next active job
  const activeJob = bookings.find(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      ['CONFIRMED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.state)
  );

  // Recent completed jobs for this worker
  const myCompletedJobs = bookings.filter(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const isSOSActiveState = activeJob && ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(activeJob.state);

  const isAvailable = currentWorker.availability === 'online';

  // Worker trade filter for guild
  const primarySkill = currentWorker.skills[0] || 'General Maintenance';

  const guildDiscussions = communityMessages
    .filter((m) => m.channelId.includes('guild') || m.channelId === 'soc_announcements')
    .slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: GREETING & DUTY TOGGLE ("Am I available?") */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-3">
          <img
            src={currentWorker.avatar}
            alt={currentWorker.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-[#B8CBDD] shadow-xs"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292824] leading-tight flex items-center gap-2">
              <span>Good day, {currentWorker.name.split(' ')[0]}</span>
              <span className="text-xl">👋</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#77736B] mt-0.5">
              <span className="font-semibold text-[#324F66]">{primarySkill}</span>
              <span>·</span>
              <span>{currentWorker.societyName || 'Green Residency'}</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-2 bg-[#FCF9F3] border border-[#E8E2D5] p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => toggleWorkerAvailability(currentWorker.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isAvailable
                ? 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] shadow-xs'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#6E8B67] animate-pulse" />
            <span>● On Duty</span>
          </button>
          <button
            type="button"
            onClick={() => toggleWorkerAvailability(currentWorker.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isAvailable
                ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] shadow-xs'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <span>Offline</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WHAT JOBS DO I HAVE? (TODAY'S WORK & PENDING DISPATCH) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
            <HardHat className="w-4 h-4 text-[#537895]" />
            <span>Today's Work</span>
          </h2>
          {onOpenMyWork && (
            <button
              type="button"
              onClick={onOpenMyWork}
              className="text-xs font-bold text-[#537895] hover:underline cursor-pointer"
            >
              View all work →
            </button>
          )}
        </div>

        {/* INCOMING PENDING JOB ACCEPTANCE MODAL/BANNER */}
        {pendingIncomingBooking && (
          <div className="p-4 bg-[#FAEDE8] border-2 border-[#E98074] rounded-2xl shadow-card space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#80432E] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#80432E]" />
                <span>New Job Request Assigned</span>
              </span>
              <span className="text-xs text-[#80432E] font-bold">Expires in 2 min</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-[#292824]">
                  {pendingIncomingBooking.serviceCategory} — {pendingIncomingBooking.problemType}
                </h3>
                <p className="text-xs text-[#77736B] mt-0.5">
                  Resident: <strong className="text-[#292824]">{pendingIncomingBooking.customerName}</strong> ({pendingIncomingBooking.customerAddress})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    rejectBookingByWorker(pendingIncomingBooking.id, currentWorker.id);
                    showToast({
                      title: 'Job Declined',
                      message: 'Request passed to next available specialist.',
                      type: 'warning',
                    });
                  }}
                  className="px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#80432E] border border-[#E8E2D5] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    acceptBookingByWorker(pendingIncomingBooking.id, currentWorker.id);
                    showToast({
                      title: 'Job Confirmed!',
                      message: 'Customer notified. Please proceed to navigate.',
                      type: 'success',
                    });
                  }}
                  className="px-5 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Accept Job (₹{pendingIncomingBooking.pricing.workerShare})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE / NEXT JOB CARD */}
        {activeJob ? (
          <div className="p-4 sm:p-5 bg-[#FCF9F3] border-2 border-[#B8CBDD] rounded-2xl shadow-card space-y-3 relative">
            {/* Top-right SOS button during active job */}
            {isSOSActiveState && (
              <button
                type="button"
                onClick={() => setSosJob(activeJob)}
                className="absolute top-3 right-3 px-2.5 py-1 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] border border-[#F3C5B8] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Emergency Support during active job"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
                <span>SOS</span>
              </button>
            )}

            <div className="flex items-center justify-between pr-16 sm:pr-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD]">
                  Next Active Job
                </span>
                <span className="text-xs text-[#77736B] font-mono">Booking #{activeJob.id}</span>
              </div>
              <span className="text-xs font-semibold text-[#6E8B67] font-mono">Net: ₹{activeJob.pricing.workerShare}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#292824]">
                  {activeJob.serviceCategory} — {activeJob.problemType}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#77736B]">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#537895]" />
                    <strong className="text-[#292824]">{activeJob.customerName}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#537895]" />
                    <span>{activeJob.customerAddress}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#537895]" />
                    <span>State: <strong className="text-[#292824]">{activeJob.state}</strong></span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForExecution(activeJob)}
                  className="px-4 py-2.5 bg-[#537895] hover:bg-[#41637E] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Execute Job →</span>
                </button>
              </div>
            </div>
          </div>
        ) : !pendingIncomingBooking ? (
          <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
            <span className="text-xs font-semibold text-[#292824] block">You're all caught up!</span>
            <p className="text-xs text-[#77736B]">
              No active job in progress right now. Maintain online status to receive automatic nearby dispatches.
            </p>
          </div>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* 3. EARNINGS & 4. VERIFICATION CARDS (SIDE-BY-SIDE SUMMARY) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Earnings Card */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#6E8B67]" />
              <span>Earnings</span>
            </span>
            <Badge variant="coop" size="sm"><span className="font-mono">70%</span> Net Share</Badge>
          </div>

          <div>
            <span className="text-2xl font-bold font-mono text-[#292824]">₹2,450</span>
            <span className="text-xs text-[#77736B] ml-2">this week</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E2D5] text-xs">
            <div>
              <span className="text-[10px] text-[#77736B] block">Today's Jobs</span>
              <strong className="text-[#292824]">2 Completed</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#77736B] block">Lifetime Payout</span>
              <strong className="text-[#292824]">₹{currentWorker.completedJobs * 420}</strong>
            </div>
          </div>
        </div>

        {/* Verification Card (Simplified with progressive disclosure) */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#537895]" />
              <span>Verification Status</span>
            </span>
            <Badge variant="verified" size="sm">VERIFIED WORKER ✓</Badge>
          </div>

          {/* Quick checklist of the 6 items */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] text-[#292824]">
            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" /> Identity
            </span>
            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" /> Membership
            </span>
            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" /> Skills
            </span>
            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" /> Certificates
            </span>
            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" /> Assessment
            </span>
            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" /> Society
            </span>
          </div>

          <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
            <span className="text-[11px] text-[#77736B]">Tier 6 Certified</span>
            <button
              type="button"
              onClick={() => setShowVerificationModal(true)}
              className="text-xs font-bold text-[#537895] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View Verification</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MY PROFESSIONAL COMMUNITY & TOOL BANK SHORTCUTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Professional Community */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#537895]" />
              <span>My Professional Community</span>
            </h2>
            {onOpenCommunity && (
              <button
                type="button"
                onClick={onOpenCommunity}
                className="text-xs font-bold text-[#537895] hover:underline cursor-pointer"
              >
                Open Guild →
              </button>
            )}
          </div>

          <div className="space-y-2">
            {guildDiscussions.map((msg) => (
              <div
                key={msg.id}
                onClick={onOpenCommunity}
                className="p-2.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl cursor-pointer text-xs space-y-1 hover:bg-[#F3EEE4] transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-[#77736B]">
                  <span className="font-bold text-[#324F66]">{msg.authorName} ({msg.authorProfession || 'Specialist'})</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="text-[#292824] line-clamp-1">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cooperative Tool Bank Shortcut */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#80432E] flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#80432E]" />
                <span>Cooperative Tool Bank</span>
              </h2>
              <Badge variant="pending" size="sm">Zero-cost Loan</Badge>
            </div>
            <p className="text-xs text-[#77736B]">
              Borrow industrial tools (thermal cameras, high-pressure washers, rotary hammers) directly from the society depot.
            </p>
          </div>

          <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
            <span className="text-[11px] text-[#77736B]">Available in {currentWorker.societyName || 'Green Residency'}</span>
            <button
              type="button"
              onClick={onOpenToolBank}
              className="px-3 py-1.5 bg-[#B37055] hover:bg-[#9C583E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Access Tool Bank →
            </button>
          </div>
        </div>
      </div>

      {/* JOB EXECUTION MODAL */}
      {selectedBookingForExecution && (
        <WorkerJobExecutionModal
          booking={selectedBookingForExecution}
          isOpen={selectedBookingForExecution !== null}
          onClose={() => setSelectedBookingForExecution(null)}
        />
      )}

      {/* WORKER ACTIVE JOB SOS MODAL */}
      {sosJob && (
        <WorkerSOSModal
          job={sosJob}
          isOpen={sosJob !== null}
          onClose={() => setSosJob(null)}
        />
      )}

      {/* FULL 6-TIER VERIFICATION MODAL */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title="Worker Verification Certificate"
        subtitle="Verified 6-Tier Trust Pipeline"
        maxWidth="lg"
      >
        <WorkerOnboarding />
      </Modal>
    </div>
  );
};
