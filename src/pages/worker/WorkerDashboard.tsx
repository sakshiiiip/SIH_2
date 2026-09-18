import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { WorkerJobExecutionModal } from './WorkerJobExecutionModal';
import { WorkerSOSModal } from './WorkerSOSModal';
import { Modal } from '../../components/common/Modal';
import { WorkerOnboarding } from './WorkerOnboarding';
import { JobRequestCard } from '../../components/worker/JobRequestCard';
import { BreakSelector } from '../../components/worker/BreakSelector';
import { StatsCard } from '../../components/worker/StatsCard';
import { SupportPanel } from '../../components/worker/SupportPanel';
import {
  MOCK_JOB_REQUESTS,
  MOCK_DEMAND_AREAS,
  WorkerJobRequest,
} from '../../data/workerMockData';
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
  Bell,
  Star,
  Briefcase,
  TrendingUp,
  Vote,
  Map,
  HeadphonesIcon,
} from 'lucide-react';

interface WorkerDashboardProps {
  onOpenToolBank: () => void;
  onOpenEmergencyAid?: () => void;
  onOpenVerification?: () => void;
  onOpenCommunity?: () => void;
  onOpenMyWork?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenEarnings?: () => void;
  onOpenSupport?: () => void;
  onOpenJobs?: () => void;
}

type AvailabilityStatus = 'online' | 'break' | 'offline';

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  onOpenToolBank,
  onOpenEmergencyAid,
  onOpenVerification,
  onOpenCommunity,
  onOpenMyWork,
  onOpenNotifications,
  onOpenProfile,
  onOpenEarnings,
  onOpenSupport,
  onOpenJobs,
}) => {
  const {
    currentUser,
    workers,
    bookings,
    communityMessages,
    acceptBookingByWorker,
    rejectBookingByWorker,
    toggleWorkerAvailability,
    notifications,
    showToast,
  } = useCooperativeStore();

  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers[0];

  const [selectedBookingForExecution, setSelectedBookingForExecution] = useState<Booking | null>(null);
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSupportPanel, setShowSupportPanel] = useState(false);

  // Availability state (extends store's online/offline with break)
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    currentWorker.availability === 'online' ? 'online' : 'offline'
  );
  const [breakEndsAt, setBreakEndsAt] = useState<Date | null>(null);
  const [breakLabel, setBreakLabel] = useState('On Break');
  const [showBreakSelector, setShowBreakSelector] = useState(false);

  // Mock job requests state
  const [mockJobRequests, setMockJobRequests] = useState<WorkerJobRequest[]>(MOCK_JOB_REQUESTS);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  // Store-sourced data
  const pendingIncomingBooking = bookings.find(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      b.state === 'PENDING_WORKER_ACCEPTANCE'
  );

  const activeJob = bookings.find(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      ['CONFIRMED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.state)
  );

  const myCompletedJobs = bookings.filter(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const upcomingJobs = bookings.filter(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      b.state === 'CONFIRMED'
  );

  const isSOSActiveState = activeJob && ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(activeJob.state);
  const isAvailable = availabilityStatus === 'online';
  const isOnBreak = availabilityStatus === 'break';
  const primarySkill = currentWorker.skills[0] || 'General Maintenance';
  const unreadCount = notifications.filter((n) => !n.read && (n.recipientRole === 'worker' || n.recipientRole === 'all')).length;

  const guildDiscussions = communityMessages
    .filter((m) => m.channelId.includes('guild') || m.channelId === 'soc_announcements')
    .slice(0, 2);

  // Availability toggle handlers
  const handleSetAvailable = () => {
    setAvailabilityStatus('online');
    setShowBreakSelector(false);
    setBreakEndsAt(null);
    if (currentWorker.availability !== 'online') toggleWorkerAvailability(currentWorker.id);
    showToast({ title: '🟢 You are now Online', message: 'New job requests will be dispatched to you.', type: 'success' });
  };

  const handleSetOffline = () => {
    setAvailabilityStatus('offline');
    setShowBreakSelector(false);
    setBreakEndsAt(null);
    if (currentWorker.availability === 'online') toggleWorkerAvailability(currentWorker.id);
    showToast({ title: '🔴 You are now Offline', message: 'You will not receive new job requests.', type: 'warning' });
  };

  const handleStartBreak = (breakType: string, durationMinutes: number) => {
    setAvailabilityStatus('break');
    setShowBreakSelector(false);
    const label = breakType === 'short' ? 'Short Break' : breakType === 'lunch' ? 'Lunch Break' : 'Custom Break';
    setBreakLabel(label);
    if (durationMinutes > 0) {
      const ends = new Date(Date.now() + durationMinutes * 60 * 1000);
      setBreakEndsAt(ends);
    } else {
      setBreakEndsAt(null);
    }
    showToast({ title: `🟡 ${label} Started`, message: `You are temporarily unavailable for ${durationMinutes} min.`, type: 'info' });
  };

  const handleResumeWork = () => {
    setAvailabilityStatus('online');
    setBreakEndsAt(null);
    showToast({ title: '🟢 Welcome back!', message: 'You are now available for new job assignments.', type: 'success' });
  };

  // Mock job accept/decline
  const handleAcceptMockJob = (jobId: string) => {
    setProcessingJobId(jobId);
    setTimeout(() => {
      setMockJobRequests((prev) => prev.filter((j) => j.jobId !== jobId));
      setProcessingJobId(null);
      showToast({ title: '✅ Job Accepted!', message: 'Customer has been notified. Job added to Upcoming.', type: 'success' });
    }, 800);
  };

  const handleDeclineMockJob = (jobId: string) => {
    setMockJobRequests((prev) => prev.filter((j) => j.jobId !== jobId));
    showToast({ title: 'Job Declined', message: 'Request passed to next available specialist.', type: 'warning' });
  };

  // Availability status indicator
  const availabilityIndicator = {
    online: { color: 'bg-[#6E8B67]', label: '🟢 Available', textColor: 'text-[#364A32]' },
    break:  { color: 'bg-[#E8A07A] animate-pulse', label: '🟡 On Break', textColor: 'text-[#80432E]' },
    offline:{ color: 'bg-[#B86B6B]', label: '🔴 Not Available', textColor: 'text-[#632727]' },
  }[availabilityStatus];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* ============================================================ */}
      {/* 1. HEADER — Worker Profile, Availability, Notifications     */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onOpenProfile} className="cursor-pointer shrink-0">
            <img
              src={currentWorker.avatar}
              alt={currentWorker.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#B8CBDD] shadow-xs hover:border-[#537895] transition-colors"
            />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292824] leading-tight flex items-center gap-2">
              <span>Good day, {currentWorker.name.split(' ')[0]}</span>
              <span className="text-xl">👋</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#77736B] mt-0.5 flex-wrap">
              <span className="font-semibold text-[#324F66]">{primarySkill}</span>
              <span>·</span>
              <span>{currentWorker.societyName || 'Green Residency'}</span>
              <span>·</span>
              <span className={`font-bold ${availabilityIndicator.textColor}`}>{availabilityIndicator.label}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl bg-[#FCF9F3] border border-[#E8E2D5] hover:bg-[#F3EEE4] transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 text-[#524E47]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C93B2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Availability toggle */}
          <div className="flex items-center gap-1 bg-[#FCF9F3] border border-[#E8E2D5] p-1 rounded-2xl">
            <button
              type="button"
              onClick={handleSetAvailable}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isAvailable
                  ? 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] shadow-xs'
                  : 'text-[#77736B] hover:text-[#292824]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#6E8B67] animate-pulse' : 'bg-[#CFDDD0]'}`} />
              Available
            </button>
            <button
              type="button"
              onClick={() => setShowBreakSelector(!showBreakSelector)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isOnBreak
                  ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F4DCD3] shadow-xs'
                  : 'text-[#77736B] hover:text-[#292824]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnBreak ? 'bg-[#E8A07A] animate-pulse' : 'bg-[#F4DCD3]'}`} />
              Break
            </button>
            <button
              type="button"
              onClick={handleSetOffline}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                !isAvailable && !isOnBreak
                  ? 'bg-[#FAEBEB] text-[#632727] border border-[#F4D7D7] shadow-xs'
                  : 'text-[#77736B] hover:text-[#292824]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${!isAvailable && !isOnBreak ? 'bg-[#B86B6B]' : 'bg-[#F4D7D7]'}`} />
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Break selector / break status */}
      {(showBreakSelector || isOnBreak) && (
        <BreakSelector
          isOnBreak={isOnBreak}
          breakLabel={breakLabel}
          breakEndsAt={breakEndsAt}
          onStartBreak={handleStartBreak}
          onResumeWork={handleResumeWork}
        />
      )}

      {/* ============================================================ */}
      {/* 2. SUMMARY STATS CARDS                                       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          label="Today's Jobs"
          value={myCompletedJobs.length + (activeJob ? 1 : 0)}
          subLabel={activeJob ? '1 active now' : 'All completed'}
          accent="blue"
          icon={<Briefcase className="w-4 h-4 text-[#537895]" />}
        />
        <StatsCard
          label="Upcoming Jobs"
          value={upcomingJobs.length + 2}
          subLabel="Next: Tomorrow"
          accent="neutral"
          icon={<Clock className="w-4 h-4 text-[#77736B]" />}
        />
        <StatsCard
          label="Today's Earnings"
          value={activeJob ? `₹${activeJob.pricing.workerShare}` : '₹550'}
          subLabel="70% net share"
          accent="green"
          icon={<DollarSign className="w-4 h-4 text-[#6E8B67]" />}
        />
        <StatsCard
          label="My Rating"
          value={`${currentWorker.rating} ★`}
          subLabel={`${currentWorker.totalReviews} reviews`}
          accent="orange"
          icon={<Star className="w-4 h-4 text-[#B37055]" />}
        />
      </div>

      {/* ============================================================ */}
      {/* 3. NEW JOB REQUESTS (from store + mock)                      */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#537895]" />
            <span>New Job Requests</span>
            {(pendingIncomingBooking ? 1 : 0) + mockJobRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#C93B2B] text-white text-[10px] font-bold rounded-full">
                {(pendingIncomingBooking ? 1 : 0) + mockJobRequests.length}
              </span>
            )}
          </h2>
          {onOpenJobs && (
            <button type="button" onClick={onOpenJobs} className="text-xs font-bold text-[#537895] hover:underline cursor-pointer">
              All jobs →
            </button>
          )}
        </div>

        {/* Incoming from store (real booking) */}
        {pendingIncomingBooking && (
          <div className="p-4 bg-[#FAEDE8] border-2 border-[#E98074] rounded-2xl shadow-card space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#80432E] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#80432E]" />
                New Job Request Assigned
              </span>
              <span className="text-xs text-[#80432E] font-bold animate-pulse">Expires in 2 min</span>
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
                    showToast({ title: 'Job Declined', message: 'Request passed to next available specialist.', type: 'warning' });
                  }}
                  className="px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#80432E] border border-[#E8E2D5] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    acceptBookingByWorker(pendingIncomingBooking.id, currentWorker.id);
                    showToast({ title: 'Job Confirmed!', message: 'Customer notified. Please proceed to navigate.', type: 'success' });
                  }}
                  className="px-5 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Accept Job (₹{pendingIncomingBooking.pricing.workerShare})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mock new job requests (AI allocation placeholders) */}
        {mockJobRequests.map((job) => (
          <JobRequestCard
            key={job.jobId}
            job={job}
            onAccept={handleAcceptMockJob}
            onDecline={handleDeclineMockJob}
            isProcessing={processingJobId === job.jobId}
          />
        ))}

        {!pendingIncomingBooking && mockJobRequests.length === 0 && (
          <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-[#6E8B67] mx-auto" />
            <span className="text-xs font-semibold text-[#292824] block">No pending requests</span>
            <p className="text-xs text-[#77736B]">
              {isAvailable
                ? 'Maintain online status to receive automatic nearby dispatches.'
                : 'Switch to Available to receive new job requests.'}
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. CURRENT ACTIVE JOB                                        */}
      {/* ============================================================ */}
      {activeJob && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
            <HardHat className="w-4 h-4 text-[#537895]" />
            Current Active Job
          </h2>
          <div className="p-4 sm:p-5 bg-[#FCF9F3] border-2 border-[#B8CBDD] rounded-2xl shadow-card space-y-3 relative">
            {isSOSActiveState && (
              <button
                type="button"
                onClick={() => setSosJob(activeJob)}
                className="absolute top-3 right-3 px-2.5 py-1 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] border border-[#F3C5B8] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
                SOS
              </button>
            )}
            <div className="flex items-center justify-between pr-16 sm:pr-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EFEBF4] text-[#3D314C] border border-[#DFD8E8] animate-pulse">
                  In Progress
                </span>
                <span className="text-xs text-[#77736B] font-mono">#{activeJob.id}</span>
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
                    {activeJob.customerAddress}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#537895]" />
                    State: <strong className="text-[#292824]">{activeJob.state}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForExecution(activeJob)}
                className="px-4 py-2.5 bg-[#537895] hover:bg-[#41637E] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                Execute Job →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. QUICK ACTIONS                                              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'My Jobs', icon: <Briefcase className="w-5 h-5" />, action: onOpenJobs ?? onOpenMyWork, color: 'text-[#324F66]', bg: 'hover:bg-[#E4EDF4]' },
          { label: 'Earnings', icon: <TrendingUp className="w-5 h-5" />, action: onOpenEarnings, color: 'text-[#364A32]', bg: 'hover:bg-[#E6ECE4]' },
          { label: 'Notifications', icon: <Bell className="w-5 h-5" />, action: onOpenNotifications, color: 'text-[#80432E]', bg: 'hover:bg-[#FAEDE8]' },
          { label: 'My Profile', icon: <User className="w-5 h-5" />, action: onOpenProfile, color: 'text-[#3D314C]', bg: 'hover:bg-[#EFEBF4]' },
        ].map(({ label, icon, action, color, bg }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`flex flex-col items-center gap-2 p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl ${bg} transition-colors cursor-pointer ${color}`}
          >
            {icon}
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 6. EARNINGS & VERIFICATION SUMMARY                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Earnings Card — Integration point for Person 3 */}
        <div
          onClick={onOpenEarnings}
          className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3 cursor-pointer hover:border-[#CFDDD0] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#6E8B67]" />
              Earnings
            </span>
            <Badge variant="coop" size="sm"><span className="font-mono">70%</span> Net Share</Badge>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-[#292824]">₹2,450</span>
            <span className="text-xs text-[#77736B] ml-2">this week</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E2D5] text-xs">
            <div>
              <span className="text-[10px] text-[#77736B] block">Today</span>
              <strong className="text-[#292824]">₹550</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#77736B] block">This Month</span>
              <strong className="text-[#292824]">₹9,800</strong>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-xs font-bold text-[#537895] flex items-center gap-1">
              View Earnings <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Verification Card — Integration point for Person 4 */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#537895]" />
              Verification Status
            </span>
            <Badge variant="verified" size="sm">VERIFIED ✓</Badge>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] text-[#292824]">
            {['Identity', 'Membership', 'Skills', 'Certificates', 'Assessment', 'Society'].map((item) => (
              <span key={item} className="flex items-center gap-1 text-[#364A32] font-semibold">
                <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
                {item}
              </span>
            ))}
          </div>
          <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
            <span className="text-[11px] text-[#77736B]">Tier 6 Certified</span>
            <button
              type="button"
              onClick={() => setShowVerificationModal(true)}
              className="text-xs font-bold text-[#537895] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              View Verification <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. AI PLACEHOLDERS — Demand Heatmap & Worker Voting          */}
      {/* (Person 5 integration points)                                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Demand Heatmap — Person 5 placeholder */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">
              <Map className="w-4 h-4 text-[#6E8B67]" />
              Demand Near You
            </h2>
            {/* TODO (Person 5): Replace badge text with live demand count */}
            <Badge variant="coop" size="sm">AI Powered</Badge>
          </div>
          {/* TODO (Person 5): Replace this list with the actual Predictive Demand Heatmap widget */}
          <div className="space-y-2">
            {MOCK_DEMAND_AREAS.map((area) => (
              <div key={area.area} className="flex items-center justify-between p-2 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-[#292824]">{area.area}</span>
                  <span className="text-[10px] text-[#77736B] block">{area.serviceType}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    area.demandLevel === 'high' ? 'bg-[#FAEDE8] text-[#80432E]' :
                    area.demandLevel === 'medium' ? 'bg-[#EFEBF4] text-[#3D314C]' :
                    'bg-[#E6ECE4] text-[#364A32]'
                  }`}>
                    {area.demandLevel.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-[#77736B] block mt-0.5">{area.distance}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#9A958B] italic">Powered by predictive demand model — full heatmap coming soon.</p>
        </div>

        {/* Worker Voting — Person 5 placeholder */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">
              <Vote className="w-4 h-4 text-[#6E8B67]" />
              Worker Voting
            </h2>
            <Badge variant="verified" size="sm">Cooperative</Badge>
          </div>
          {/* TODO (Person 5): Replace this section with the actual Worker Voting module */}
          <div className="space-y-2">
            <div className="p-3 bg-[#E6ECE4] border border-[#CFDDD0] rounded-xl">
              <p className="text-xs font-bold text-[#364A32]">📋 Active Vote: Monthly Work Schedule Policy</p>
              <p className="text-[10px] text-[#527048] mt-0.5">Ends in 3 days · 14 members have voted</p>
            </div>
            <div className="p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl">
              <p className="text-xs font-bold text-[#292824]">📋 Upcoming: Tool Bank Budget Allocation</p>
              <p className="text-[10px] text-[#77736B] mt-0.5">Starts Sep 22</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => showToast({ title: 'Coming Soon', message: 'Worker Voting module will be available shortly.', type: 'info' })}
            className="w-full px-4 py-2.5 bg-[#292824] hover:bg-[#383530] text-[#FAF7F2] text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            Open Voting Dashboard →
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. COMMUNITY & TOOL BANK SHORTCUTS                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#537895]" />
              My Professional Community
            </h2>
            {onOpenCommunity && (
              <button type="button" onClick={onOpenCommunity} className="text-xs font-bold text-[#537895] hover:underline cursor-pointer">
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

        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#80432E] flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#80432E]" />
                Cooperative Tool Bank
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

      {/* ============================================================ */}
      {/* 9. HUMAN SUPPORT ENTRY POINT (Person 5 integration)         */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between p-4 bg-[#E4EDF4] border border-[#B8CBDD] rounded-2xl">
        <div className="flex items-center gap-3">
          <HeadphonesIcon className="w-6 h-6 text-[#324F66] shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#292824]">Need Help?</p>
            <p className="text-xs text-[#537895]">Human agents available 7 AM – 10 PM IST</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSupportPanel(!showSupportPanel)}
          className="px-4 py-2 bg-[#324F66] hover:bg-[#263D50] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
        >
          Contact Support
        </button>
      </div>

      {showSupportPanel && (
        <SupportPanel onClose={() => setShowSupportPanel(false)} />
      )}

      {/* ============================================================ */}
      {/* MODALS                                                        */}
      {/* ============================================================ */}
      {selectedBookingForExecution && (
        <WorkerJobExecutionModal
          booking={selectedBookingForExecution}
          isOpen={selectedBookingForExecution !== null}
          onClose={() => setSelectedBookingForExecution(null)}
        />
      )}

      {sosJob && (
        <WorkerSOSModal
          job={sosJob}
          isOpen={sosJob !== null}
          onClose={() => setSosJob(null)}
        />
      )}

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
