import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { CooperativeMap } from '../../components/common/Map/CooperativeMap';
import { Booking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { WorkerJobExecutionModal } from './WorkerJobExecutionModal';
import { WorkerSOSModal } from './WorkerSOSModal';
import { Modal } from '../../components/common/Modal';
import { BreakSelector } from '../../components/worker/BreakSelector';
import { isWorkerSkillMatching } from '../../utils/matchingEngine';
import {
  MOCK_JOB_REQUESTS,
  MOCK_UPCOMING_JOBS,
  MOCK_DEMAND_AREAS,
  WorkerJobRequest,
} from '../../data/workerMockData';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Zap,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Star,
  Map,
  Crosshair,
  Radio,
  Navigation,
} from 'lucide-react';

interface WorkerDashboardProps {
  onOpenToolBank?: () => void;
  onOpenEmergencyAid?: () => void;
  onOpenVerification?: () => void;
  onOpenCommunity?: () => void;
  onOpenMyWork: () => void;
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
    acceptBookingByWorker,
    rejectBookingByWorker,
    toggleWorkerAvailability,
    showToast,
  } = useCooperativeStore();

  const { workerTracking, toggleWorkerLocationSharing, currentAddress, currentCoordinates } = useGeolocation();

  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers[0];

  const [selectedBookingForExecution, setSelectedBookingForExecution] = useState<Booking | null>(null);
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [showDemandHeatmapModal, setShowDemandHeatmapModal] = useState(false);

  // Availability state
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    currentWorker.availability === 'online' ? 'online' : 'offline'
  );
  const [breakEndsAt, setBreakEndsAt] = useState<Date | null>(null);
  const [breakLabel, setBreakLabel] = useState('On Break');
  const [showBreakSelector, setShowBreakSelector] = useState(false);

  // Mock new job requests filtered strictly by worker trade
  const [mockJobRequests, setMockJobRequests] = useState<WorkerJobRequest[]>(MOCK_JOB_REQUESTS);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  // Real store pending booking (assigned or open in their trade)
  const pendingIncomingBooking = bookings.find(
    (b) =>
      (((b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
        ['PENDING_WORKER_ACCEPTANCE', 'WORKER_ASSIGNED'].includes(b.state)) ||
        b.state === 'PENDING_ASSIGNMENT') &&
      isWorkerSkillMatching(currentWorker, b.category || b.serviceCategory)
  );

  // Real store upcoming booking
  const storeUpcomingBooking = bookings.find(
    (b) =>
      (b.matchedWorkerId === currentWorker.id || b.matchedWorkerId === 'w_rahul') &&
      ['CONFIRMED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.state) &&
      isWorkerSkillMatching(currentWorker, b.category || b.serviceCategory)
  );

  const tradeMatchedMockRequests = mockJobRequests.filter((r) =>
    isWorkerSkillMatching(currentWorker, r.serviceType)
  );
  const tradeMatchedUpcomingMock = MOCK_UPCOMING_JOBS.filter((j) =>
    isWorkerSkillMatching(currentWorker, j.serviceType)
  );

  // Next job to display
  const nextJob = storeUpcomingBooking
    ? {
        id: storeUpcomingBooking.id,
        service: storeUpcomingBooking.category || storeUpcomingBooking.serviceCategory,
        problem: storeUpcomingBooking.problemType,
        location: storeUpcomingBooking.customerAddress || 'Green Residency, Block B',
        dateTime: 'Today · Scheduled',
        earnings: storeUpcomingBooking.pricing?.workerShare || 400,
        isReal: true,
        booking: storeUpcomingBooking,
      }
    : tradeMatchedUpcomingMock.length > 0
    ? {
        id: tradeMatchedUpcomingMock[0].jobId,
        service: tradeMatchedUpcomingMock[0].serviceType,
        problem: tradeMatchedUpcomingMock[0].problemType,
        location: tradeMatchedUpcomingMock[0].customer.address,
        dateTime: `${tradeMatchedUpcomingMock[0].date}, ${tradeMatchedUpcomingMock[0].time}`,
        earnings: tradeMatchedUpcomingMock[0].estimatedEarnings,
        isReal: false,
        booking: null,
      }
    : null;

  // Active incoming job request (either store or mock)
  const incomingRequest = pendingIncomingBooking
    ? {
        id: pendingIncomingBooking.id,
        service: pendingIncomingBooking.category || pendingIncomingBooking.serviceCategory,
        problem: pendingIncomingBooking.problemType,
        customerName: pendingIncomingBooking.customerName,
        location: pendingIncomingBooking.customerAddress || 'Green Residency',
        distance: '0.9 km',
        dateTime: 'Immediate Dispatch',
        earnings: pendingIncomingBooking.pricing?.workerShare || 400,
        priority: 'urgent' as const,
        isReal: true,
      }
    : tradeMatchedMockRequests.length > 0
    ? {
        id: tradeMatchedMockRequests[0].jobId,
        service: tradeMatchedMockRequests[0].serviceType,
        problem: tradeMatchedMockRequests[0].problemType,
        customerName: tradeMatchedMockRequests[0].customer.name,
        location: tradeMatchedMockRequests[0].location,
        distance: tradeMatchedMockRequests[0].distance,
        dateTime: `${tradeMatchedMockRequests[0].date}, ${tradeMatchedMockRequests[0].time}`,
        earnings: tradeMatchedMockRequests[0].estimatedEarnings,
        priority: tradeMatchedMockRequests[0].priority,
        isReal: false,
      }
    : null;

  const isAvailable = availabilityStatus === 'online';
  const isOnBreak = availabilityStatus === 'break';
  const primarySkill = currentWorker.skills[0] || 'General Maintenance';

  // Availability toggle handlers
  const handleSetAvailable = () => {
    setAvailabilityStatus('online');
    setShowBreakSelector(false);
    setBreakEndsAt(null);
    if (currentWorker.availability !== 'online') toggleWorkerAvailability(currentWorker.id);
    showToast({
      title: '🟢 You are now Available',
      message: 'New job requests will be dispatched to you based on skill and proximity.',
      type: 'success',
    });
  };

  const handleSetOffline = () => {
    setAvailabilityStatus('offline');
    setShowBreakSelector(false);
    setBreakEndsAt(null);
    if (currentWorker.availability === 'online') toggleWorkerAvailability(currentWorker.id);
    showToast({
      title: '🔴 You are now Offline',
      message: 'You will not receive new dispatches while offline.',
      type: 'warning',
    });
  };

  const handleStartBreak = (breakType: string, durationMinutes: number) => {
    setAvailabilityStatus('break');
    setShowBreakSelector(false);
    const label = breakType === 'short' ? 'Short Break' : breakType === 'lunch' ? 'Lunch Break' : 'Custom Break';
    setBreakLabel(label);
    if (durationMinutes > 0) {
      setBreakEndsAt(new Date(Date.now() + durationMinutes * 60 * 1000));
    } else {
      setBreakEndsAt(null);
    }
    showToast({
      title: `🟡 ${label} Started`,
      message: `You are temporarily paused for ${durationMinutes} minutes.`,
      type: 'info',
    });
  };

  const handleResumeWork = () => {
    setAvailabilityStatus('online');
    setBreakEndsAt(null);
    showToast({
      title: '🟢 Welcome back!',
      message: 'You are now ready to receive new job dispatches.',
      type: 'success',
    });
  };

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    if (incomingRequest.isReal) {
      acceptBookingByWorker(incomingRequest.id, currentWorker.id);
      showToast({ title: 'Job Accepted! ✅', message: 'Customer notified. Added to My Work.', type: 'success' });
    } else {
      setProcessingJobId(incomingRequest.id);
      setTimeout(() => {
        setMockJobRequests((prev) => prev.filter((j) => j.jobId !== incomingRequest.id));
        setProcessingJobId(null);
        showToast({ title: 'Job Accepted! ✅', message: 'Customer notified. Added to Upcoming jobs.', type: 'success' });
      }, 600);
    }
  };

  const handleDeclineRequest = () => {
    if (!incomingRequest) return;
    if (incomingRequest.isReal) {
      rejectBookingByWorker(incomingRequest.id, currentWorker.id);
      showToast({ title: 'Job Declined', message: 'Assignment routed to the next available specialist.', type: 'warning' });
    } else {
      setMockJobRequests((prev) => prev.filter((j) => j.jobId !== incomingRequest.id));
      showToast({ title: 'Job Declined', message: 'Assignment passed to next specialist.', type: 'warning' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* ============================================================ */}
      {/* 1. WORKER HEADER — Avatar, Name, Skill, Society, Verification, */}
      {/*    Availability Toggle                                      */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onOpenProfile}
            className="relative cursor-pointer shrink-0 group focus:outline-none"
            title="View Profile"
          >
            <img
              src={currentWorker.avatar}
              alt={currentWorker.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#B8CBDD] shadow-xs group-hover:border-[#537895] transition-colors"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isAvailable ? 'bg-[#6E8B67]' : isOnBreak ? 'bg-[#E8A07A]' : 'bg-[#B86B6B]'
              }`}
            />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292824] leading-tight">
                {currentWorker.name}
              </h1>
              {/* Verification indicator */}
              <Badge variant="verified" size="sm">
                Verified Specialist ✓
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#77736B] mt-0.5 flex-wrap">
              <span className="font-semibold text-[#324F66]">{primarySkill}</span>
              <span>·</span>
              <span>{currentWorker.societyName || 'Green Residency'}</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle: Available / Break / Offline */}
        <div className="flex items-center gap-1 bg-[#FCF9F3] border border-[#E8E2D5] p-1 rounded-2xl self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={handleSetAvailable}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isAvailable
                ? 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] shadow-2xs'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#6E8B67] animate-pulse' : 'bg-[#CFDDD0]'}`} />
            Available
          </button>

          <button
            type="button"
            onClick={() => setShowBreakSelector(!showBreakSelector)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isOnBreak
                ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F4DCD3] shadow-2xs'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnBreak ? 'bg-[#E8A07A] animate-pulse' : 'bg-[#F4DCD3]'}`} />
            Break
          </button>

          <button
            type="button"
            onClick={handleSetOffline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              !isAvailable && !isOnBreak
                ? 'bg-[#FAEBEB] text-[#632727] border border-[#F4D7D7] shadow-2xs'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${!isAvailable && !isOnBreak ? 'bg-[#D32F2F]' : 'bg-[#E8E2D5]'}`} />
            Offline
          </button>
        </div>
      </div>

      {/* GPS Telemetry & Location Sharing Control */}
      <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            workerTracking.isSharing ? 'bg-[#E6ECE4] text-[#445D3E] border border-[#CFDDD0]' : 'bg-[#FAF7F2] text-[#9A958B] border border-[#E8E2D5]'
          }`}>
            <Radio className={`w-4 h-4 ${workerTracking.isSharing ? 'animate-pulse text-[#6E8B67]' : 'text-[#9A958B]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-xs font-bold text-[#292824]">
                {workerTracking.isSharing ? 'Live Location Sharing Active' : 'Location Sharing Paused'}
              </strong>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                workerTracking.isSharing ? 'bg-[#E6ECE4] text-[#445D3E]' : 'bg-[#FAF7F2] text-[#77736B]'
              }`}>
                {workerTracking.isSharing ? 'GPS ±12m' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-[#77736B] mt-0.5">
              Station: <span className="font-semibold text-[#524E47]">{currentWorker.lastKnownArea || currentWorker.societyName || 'Green Residency'}</span> · Ping: <span className="font-mono">{workerTracking.lastUpdated || 'Just now'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => toggleWorkerLocationSharing(currentWorker.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              workerTracking.isSharing
                ? 'bg-[#E6ECE4] hover:bg-[#CFDDD0] text-[#364A32] border border-[#CFDDD0]'
                : 'bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#524E47] border border-[#E8E2D5]'
            }`}
          >
            {workerTracking.isSharing ? '● Sharing Active' : 'Enable Sharing'}
          </button>
        </div>
      </div>

      {/* Break Selector Drawer (shows when Break is active or clicked) */}
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
      {/* 2. COMPACT STATISTICS (ONLY 3 STATS, NOT LARGE SEPARATE CARDS) */}
      {/*    - Today's Jobs                                             */}
      {/*    - This Week's Earnings                                     */}
      {/*    - Rating                                                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Today's Jobs */}
        <div
          onClick={onOpenJobs || onOpenMyWork}
          className="p-3.5 sm:p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl cursor-pointer hover:border-[#CFDDD0] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#77736B]">
              Today's Jobs
            </span>
            <Briefcase className="w-3.5 h-3.5 text-[#537895]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#292824]">
              {storeUpcomingBooking ? '1' : '1'}
            </span>
            <span className="text-[10px] text-[#77736B]">
              {storeUpcomingBooking ? 'active' : 'completed'}
            </span>
          </div>
        </div>

        {/* This Week's Earnings */}
        <div
          onClick={onOpenEarnings || onOpenMyWork}
          className="p-3.5 sm:p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl cursor-pointer hover:border-[#CFDDD0] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#364A32]">
              This Week's Earnings
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[#6E8B67]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#2A3927]">
              ₹2,450
            </span>
            <span className="text-[10px] text-[#527048] font-semibold">
              70% share
            </span>
          </div>
        </div>

        {/* Rating */}
        <div
          onClick={onOpenProfile}
          className="p-3.5 sm:p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl cursor-pointer hover:border-[#CFDDD0] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#80432E]">
              Rating
            </span>
            <Star className="w-3.5 h-3.5 text-[#B37055]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#292824] flex items-center gap-0.5">
              <span>{currentWorker.rating}</span>
              <Star className="w-4 h-4 fill-[#B37055] text-[#B37055] inline" />
            </span>
            <span className="text-[10px] text-[#77736B]">
              ({currentWorker.totalReviews})
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. NEW JOB REQUEST ("NEW JOB FOR YOU")                       */}
      {/*    Display: Service, Customer/location, Distance, Date/time,  */}
      {/*    Estimated earnings, Priority                               */}
      {/*    Buttons: Decline, Accept                                   */}
      {/* ============================================================ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#537895]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#324F66]">
              New Job For You
            </h2>
          </div>
          <span className="text-[11px] text-[#77736B]">
            Matched based on your skill, distance and availability
          </span>
        </div>

        {incomingRequest ? (
          <div className="p-4 sm:p-5 bg-[#FCF9F3] border-2 border-[#B8CBDD] rounded-2xl shadow-card space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
                    {incomingRequest.service}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      incomingRequest.priority === 'urgent'
                        ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F4DCD3]'
                        : 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0]'
                    }`}
                  >
                    {incomingRequest.priority} Priority
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#292824]">
                  {incomingRequest.problem}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg sm:text-xl font-bold font-mono text-[#445D3E] block">
                  ₹{incomingRequest.earnings}
                </span>
                <span className="text-[10px] text-[#77736B]">Estimated Net</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#524E47] pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span className="truncate">{incomingRequest.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#80432E]">Distance: {incomingRequest.distance}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span>{incomingRequest.dateTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={handleDeclineRequest}
                className="px-4 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#80432E] border border-[#E8E2D5] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleAcceptRequest}
                disabled={processingJobId !== null}
                className="px-5 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {processingJobId ? 'Accepting…' : `Accept (₹${incomingRequest.earnings})`}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-[#6E8B67] mx-auto" />
            <span className="text-xs font-semibold text-[#292824] block">No pending requests</span>
            <p className="text-[11px] text-[#77736B]">
              {isAvailable
                ? 'You are active in the allocation queue. Nearby requests will pop up automatically.'
                : 'Switch to Available to receive new dispatches from your society.'}
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. NEXT JOB                                                  */}
      {/*    Display upcoming job with Service, Location, Date/time,    */}
      {/*    Earnings                                                   */}
      {/* ============================================================ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#537895]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#324F66]">
              Next Job
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenMyWork}
            className="text-xs font-bold text-[#537895] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>View all in My Work</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nextJob ? (
          <div className="p-4 sm:p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
                  {nextJob.service}
                </span>
                <h3 className="text-base font-bold text-[#292824] mt-1">{nextJob.problem}</h3>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-[#445D3E] block">
                  ₹{nextJob.earnings}
                </span>
                <span className="text-[10px] text-[#77736B]">Confirmed Net</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#524E47]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span className="truncate">{nextJob.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span>{nextJob.dateTime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
              <span className="text-[11px] text-[#77736B]">Job Reference #{nextJob.id}</span>
              <button
                type="button"
                onClick={onOpenMyWork}
                className="px-4 py-1.5 bg-[#537895] hover:bg-[#41637E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Open in My Work →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center text-xs text-[#77736B]">
            No upcoming jobs scheduled yet.
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. DEMAND NEAR YOU (Small compact card linking to future      */}
      {/*    Predictive Demand Heatmap module)                          */}
      {/* ============================================================ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Map className="w-4 h-4 text-[#6E8B67]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#364A32]">
              Demand Near You
            </h2>
          </div>
          <span className="text-[11px] text-[#77736B]">Predictive Heatmap Link</span>
        </div>

        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MOCK_DEMAND_AREAS.map((area) => (
              <div
                key={area.area}
                className="p-2.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#292824] block leading-tight">{area.area}</span>
                  <span className="text-[10px] text-[#77736B]">{area.serviceType}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    area.demandLevel === 'high'
                      ? 'bg-[#FAEDE8] text-[#80432E]'
                      : area.demandLevel === 'medium'
                      ? 'bg-[#EFEBF4] text-[#3D314C]'
                      : 'bg-[#E6ECE4] text-[#364A32]'
                  }`}
                >
                  {area.demandLevel.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
            <span className="text-[10px] text-[#77736B]">
              Predictive demand forecast updated every 30 mins
            </span>
            <button
              type="button"
              onClick={() => setShowDemandHeatmapModal(true)}
              className="text-xs font-bold text-[#537895] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Explore Demand Heatmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

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

      {/* DEMAND HEATMAP INTEGRATION MODAL */}
      <Modal
        isOpen={showDemandHeatmapModal}
        onClose={() => setShowDemandHeatmapModal(false)}
        title="Predictive Demand & Operational Sectors"
        subtitle="Cooperative Spatial Dispatch Engine & Active Clusters"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#E4EDF4] border border-[#B8CBDD] rounded-xl text-[#263D50]">
            <p className="font-bold flex items-center gap-1.5">
              <Map className="w-4 h-4 text-[#324F66]" />
              <span>Active Cooperative Demand Hotspots</span>
            </p>
            <p className="text-[11px] text-[#537895] mt-0.5">
              Live spatial demand distribution across Western Pune member societies and high-volume sectors.
            </p>
          </div>

          {/* Interactive Leaflet Demand Map */}
          <CooperativeMap
            height={260}
            markers={[
              {
                id: 'my_worker_pos',
                type: 'worker',
                title: `${currentWorker.name} (You)`,
                profession: primarySkill,
                status: 'AVAILABLE',
                avatar: currentWorker.avatar,
                coordinates: {
                  lat: currentWorker.latitude || 18.5590,
                  lng: currentWorker.longitude || 73.7868,
                },
              },
              {
                id: 'demand_baner',
                type: 'job',
                title: 'High Demand: Baner Tower A',
                urgencyTier: 'URGENT',
                coordinates: { lat: 18.5595, lng: 73.7880 },
              },
              {
                id: 'demand_balewadi',
                type: 'job',
                title: 'Medium Demand: Balewadi High St',
                urgencyTier: 'STANDARD',
                coordinates: { lat: 18.5742, lng: 73.7725 },
              },
              {
                id: 'demand_pashan',
                type: 'job',
                title: 'Emergency: Pashan Lake Road',
                urgencyTier: 'EMERGENCY',
                coordinates: { lat: 18.5362, lng: 73.7925 },
              },
            ]}
            autoFitBounds={true}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MOCK_DEMAND_AREAS.map((item) => (
              <div key={item.area} className="p-2.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex justify-between items-center">
                <div>
                  <strong className="text-[#292824] block leading-tight">{item.area}</strong>
                  <span className="text-[10px] text-[#77736B]">{item.serviceType} · {item.distance}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-[#FAEDE8] text-[#80432E]">
                  {item.demandLevel.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowDemandHeatmapModal(false)}
            className="w-full py-2.5 bg-[#292824] text-white font-bold rounded-xl cursor-pointer hover:bg-black transition-colors"
          >
            Close Heatmap
          </button>
        </div>
      </Modal>
    </div>
  );
};
