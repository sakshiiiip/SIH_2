import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { CooperativeMap } from '../../components/common/Map/CooperativeMap';
import { Booking } from '../../types';
import { useTranslation } from 'react-i18next';
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
  ShieldCheck,
  Clock,
  MapPin,
  Zap,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Star,
  Map,
  Radio,
  DollarSign,
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
  onOpenPayments?: () => void;
}

type AvailabilityStatus = 'online' | 'break' | 'offline';

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  onOpenToolBank,
  onOpenEmergencyAid,
  onOpenVerification,
  onOpenCommunity,
  onOpenMyWork,
  onOpenPayments,
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
  const { t } = useTranslation();

  const {
    workerTracking,
    toggleWorkerLocationSharing,
    currentAddress,
    currentCoordinates,
  } = useGeolocation();

  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers[0];

  const [selectedBookingForExecution, setSelectedBookingForExecution] =
    useState<Booking | null>(null);

  const [sosJob, setSosJob] = useState<Booking | null>(null);

  const [showDemandHeatmapModal, setShowDemandHeatmapModal] =
    useState(false);

  // ============================================================
  // AVAILABILITY
  // ============================================================

  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>(
      currentWorker.availability === 'online' ? 'online' : 'offline'
    );

  const [breakEndsAt, setBreakEndsAt] = useState<Date | null>(null);

  const [breakLabel, setBreakLabel] = useState('On Break');

  const [showBreakSelector, setShowBreakSelector] = useState(false);

  // ============================================================
  // MOCK JOB REQUESTS
  // ============================================================

  const [mockJobRequests, setMockJobRequests] =
    useState<WorkerJobRequest[]>(MOCK_JOB_REQUESTS);

  const [processingJobId, setProcessingJobId] =
    useState<string | null>(null);

  // ============================================================
  // PENDING INCOMING BOOKING
  // ============================================================

  const pendingIncomingBooking = bookings.find(
    (b) =>
      (((b.matchedWorkerId === currentWorker.id ||
        b.matchedWorkerId === 'w_rahul') &&
        ['PENDING_WORKER_ACCEPTANCE', 'WORKER_ASSIGNED'].includes(
          b.state
        )) ||
        b.state === 'PENDING_ASSIGNMENT') &&
      isWorkerSkillMatching(
        currentWorker,
        b.category || b.serviceCategory
      )
  );

  // ============================================================
  // UPCOMING BOOKING
  // ============================================================

  const storeUpcomingBooking = bookings.find(
    (b) =>
      (b.matchedWorkerId === currentWorker.id ||
        b.matchedWorkerId === 'w_rahul') &&
      ['CONFIRMED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(
        b.state
      ) &&
      isWorkerSkillMatching(
        currentWorker,
        b.category || b.serviceCategory
      )
  );

  // ============================================================
  // MOCK REQUESTS FILTERED BY SKILL
  // ============================================================

  const tradeMatchedMockRequests = mockJobRequests.filter((request) =>
    isWorkerSkillMatching(currentWorker, request.serviceType)
  );

  const tradeMatchedUpcomingMock = MOCK_UPCOMING_JOBS.filter((job) =>
    isWorkerSkillMatching(currentWorker, job.serviceType)
  );

  // ============================================================
  // NEXT JOB
  // ============================================================

  const nextJob = storeUpcomingBooking
    ? {
        id: storeUpcomingBooking.id,
        service:
          storeUpcomingBooking.category ||
          storeUpcomingBooking.serviceCategory,
        problem: storeUpcomingBooking.problemType,
        location:
          storeUpcomingBooking.customerAddress ||
          'Green Residency, Block B',
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

  // ============================================================
  // INCOMING REQUEST
  // ============================================================

  const incomingRequest = pendingIncomingBooking
    ? {
        id: pendingIncomingBooking.id,
        service:
          pendingIncomingBooking.category ||
          pendingIncomingBooking.serviceCategory,
        problem: pendingIncomingBooking.problemType,
        customerName: pendingIncomingBooking.customerName,
        location:
          pendingIncomingBooking.customerAddress || 'Green Residency',
        distance: '0.9 km',
        dateTime: 'Immediate Dispatch',
        earnings:
          pendingIncomingBooking.pricing?.workerShare || 400,
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

  // ============================================================
  // DERIVED STATE
  // ============================================================

  const isAvailable = availabilityStatus === 'online';

  const isOnBreak = availabilityStatus === 'break';

  const primarySkill =
    currentWorker.skills[0] || 'General Maintenance';

  // ============================================================
  // AVAILABILITY HANDLERS
  // ============================================================

  const handleSetAvailable = () => {
    setAvailabilityStatus('online');
    setShowBreakSelector(false);
    setBreakEndsAt(null);

    if (currentWorker.availability !== 'online') {
      toggleWorkerAvailability(currentWorker.id);
    }

    showToast({
      title: t('worker.dashboard.availableTitle', '🟢 You are now Available'),
      message: t('worker.dashboard.availableMsg', 'New job requests will be dispatched to you based on skill and proximity.'),
      type: 'success',
    });
  };

  const handleSetOffline = () => {
    setAvailabilityStatus('offline');
    setShowBreakSelector(false);
    setBreakEndsAt(null);

    if (currentWorker.availability === 'online') {
      toggleWorkerAvailability(currentWorker.id);
    }

    showToast({
      title: t('worker.dashboard.offlineTitle', '🔴 You are now Offline'),
      message: t('worker.dashboard.offlineMsg', 'You will not receive new dispatches while offline.'),
      type: 'warning',
    });
  };

  const handleStartBreak = (
    breakType: string,
    durationMinutes: number
  ) => {
    setAvailabilityStatus('break');
    setShowBreakSelector(false);
    const label = breakType === 'short' ? t('worker.breakShort', 'Short Break') : breakType === 'lunch' ? t('worker.breakLunch', 'Lunch Break') : t('worker.breakCustom', 'Custom Break');
    setBreakLabel(label);

    if (durationMinutes > 0) {
      setBreakEndsAt(
        new Date(Date.now() + durationMinutes * 60 * 1000)
      );
    } else {
      setBreakEndsAt(null);
    }

    showToast({
      title: `🟡 ${label} Started`,
      message: t('worker.dashboard.breakStartedMsg', { duration: durationMinutes, defaultValue: `You are temporarily paused for ${durationMinutes} minutes.` }),
      type: 'info',
    });
  };

  const handleResumeWork = () => {
    setAvailabilityStatus('online');
    setBreakEndsAt(null);

    showToast({
      title: t('worker.dashboard.welcomeBack', '🟢 Welcome back!'),
      message: t('worker.dashboard.welcomeBackMsg', 'You are now ready to receive new job dispatches.'),
      type: 'success',
    });
  };

  // ============================================================
  // JOB HANDLERS
  // ============================================================

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;

    if (incomingRequest.isReal) {
      acceptBookingByWorker(incomingRequest.id, currentWorker.id);
      showToast({ title: t('worker.dashboard.jobAccepted', 'Job Accepted! ✅'), message: t('worker.dashboard.customerNotifiedMyWork', 'Customer notified. Added to My Work.'), type: 'success' });
    } else {
      setProcessingJobId(incomingRequest.id);

      setTimeout(() => {
        setMockJobRequests((previous) =>
          previous.filter(
            (job) => job.jobId !== incomingRequest.id
          )
        );

        setProcessingJobId(null);
        showToast({ title: t('worker.dashboard.jobAccepted', 'Job Accepted! ✅'), message: t('worker.dashboard.customerNotifiedUpcoming', 'Customer notified. Added to Upcoming jobs.'), type: 'success' });
      }, 600);
    }
  };

  const handleDeclineRequest = () => {
    if (!incomingRequest) return;

    if (incomingRequest.isReal) {
      rejectBookingByWorker(incomingRequest.id, currentWorker.id);
      showToast({ title: t('worker.dashboard.jobDeclined', 'Job Declined'), message: t('worker.dashboard.routedNextSpecialist', 'Assignment routed to the next available specialist.'), type: 'warning' });
    } else {
      setMockJobRequests((prev) => prev.filter((j) => j.jobId !== incomingRequest.id));
      showToast({ title: t('worker.dashboard.jobDeclined', 'Job Declined'), message: t('worker.dashboard.passedNextSpecialist', 'Assignment passed to next specialist.'), type: 'warning' });
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* ============================================================ */}
      {/* 1. WORKER HEADER — Avatar, Name, Skill, Society, Verification, */}
      {/*    Availability Toggle                                      */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3.5">

          <button
            type="button"
            onClick={onOpenProfile}
            className="relative cursor-pointer shrink-0 group focus:outline-none"
            title="View Profile"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E4EDF4] border-2 border-[#B8CBDD] shadow-xs flex items-center justify-center text-[#263D50] font-bold text-lg sm:text-xl">
              {(currentWorker.name.includes('Priya') ? t('demoUsers.priyaPatel', currentWorker.name) : currentWorker.name).charAt(0)}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isAvailable
                  ? 'bg-[#6E8B67]'
                  : isOnBreak
                  ? 'bg-[#E8A07A]'
                  : 'bg-[#B86B6B]'
              }`}
            />
          </button>

          <div>

            <div className="flex items-center gap-2 flex-wrap">

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292824] leading-tight">
                {currentWorker.name.includes('Priya') ? t('demoUsers.priyaPatel', currentWorker.name) : currentWorker.name}
              </h1>

              <Badge variant="verified" size="sm">
                {t('demoUsers.verifiedExpert', 'Verified Specialist ✓')}
              </Badge>

            </div>

            <div className="flex items-center gap-2 text-xs text-[#77736B] mt-0.5 flex-wrap">

              <span className="font-semibold text-[#324F66]">
                {primarySkill}
              </span>

              <span>·</span>

              <span>
                {currentWorker.societyName ||
                  'Green Residency'}
              </span>

              <span>·</span>

              <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                सहाAI Member
              </span>

            </div>

          </div>

        </div>

        {/* Availability Toggle */}

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
            {t('common.active', 'Available')}
          </button>

          <button
            type="button"
            onClick={() =>
              setShowBreakSelector(!showBreakSelector)
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isOnBreak
                ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F4DCD3] shadow-2xs'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnBreak ? 'bg-[#E8A07A] animate-pulse' : 'bg-[#F4DCD3]'}`} />
            {t('worker.takeBreak', 'Break')}
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
            {t('worker.statusOffline', 'Offline')}
          </button>

        </div>

      </div>

      {/* ======================================================== */}
      {/* GPS TELEMETRY                                            */}
      {/* ======================================================== */}

      <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">

        <div className="flex items-center gap-3">

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              workerTracking.isSharing
                ? 'bg-[#E6ECE4] text-[#445D3E] border border-[#CFDDD0]'
                : 'bg-[#FAF7F2] text-[#9A958B] border border-[#E8E2D5]'
            }`}
          >
            <Radio
              className={`w-4 h-4 ${
                workerTracking.isSharing
                  ? 'animate-pulse text-[#6E8B67]'
                  : 'text-[#9A958B]'
              }`}
            />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <strong className="text-xs font-bold text-[#292824]">
                {workerTracking.isSharing ? t('worker.dashboard.locationActive', 'Live Location Sharing Active') : t('worker.dashboard.locationPaused', 'Location Sharing Paused')}
              </strong>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                workerTracking.isSharing ? 'bg-[#E6ECE4] text-[#445D3E]' : 'bg-[#FAF7F2] text-[#77736B]'
              }`}>
                {workerTracking.isSharing ? 'GPS ±12m' : t('worker.dashboard.offlineLabel', 'Offline')}
              </span>

            </div>

            <p className="text-[11px] text-[#77736B] mt-0.5">
              {t('worker.dashboard.stationLabel', 'Station:')} <span className="font-semibold text-[#524E47]">{currentWorker.lastKnownArea || currentWorker.societyName || 'Green Residency'}</span> · {t('worker.dashboard.pingLabel', 'Ping:')} <span className="font-mono">{workerTracking.lastUpdated || t('admin.justNow', 'Just now')}</span>
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">

          <button
            type="button"
            onClick={() =>
              toggleWorkerLocationSharing(
                currentWorker.id
              )
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              workerTracking.isSharing
                ? 'bg-[#E6ECE4] hover:bg-[#CFDDD0] text-[#364A32] border border-[#CFDDD0]'
                : 'bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#524E47] border border-[#E8E2D5]'
            }`}
          >
            {workerTracking.isSharing ? t('worker.dashboard.sharingActive', '● Sharing Active') : t('worker.dashboard.enableSharing', 'Enable Sharing')}
          </button>

        </div>

      </div>

      {/* ======================================================== */}
      {/* BREAK SELECTOR                                           */}
      {/* ======================================================== */}

      {(showBreakSelector || isOnBreak) && (
        <BreakSelector
          isOnBreak={isOnBreak}
          breakLabel={breakLabel}
          breakEndsAt={breakEndsAt}
          onStartBreak={handleStartBreak}
          onResumeWork={handleResumeWork}
        />
      )}

      {/* ======================================================== */}
      {/* 2. COMPACT STATISTICS                                    */}
      {/* ======================================================== */}

      <div className="grid grid-cols-3 gap-3">

        {/* Today's Jobs */}

        <div
          onClick={onOpenJobs || onOpenMyWork}
          className="p-3.5 sm:p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl cursor-pointer hover:border-[#CFDDD0] transition-colors"
        >

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#77736B]">
              {t('worker.dashboard.todayJobs', "Today's Jobs")}
            </span>

            <Briefcase className="w-3.5 h-3.5 text-[#537895]" />

          </div>

          <div className="mt-1 flex items-baseline gap-1.5">

            <span className="text-xl sm:text-2xl font-bold font-mono text-[#292824]">
              {storeUpcomingBooking ? '1' : '1'}
            </span>

            <span className="text-[10px] text-[#77736B]">
              {storeUpcomingBooking ? t('worker.dashboard.activeStat', 'active') : t('worker.dashboard.completedStat', 'completed')}
            </span>

          </div>

          {onOpenPayments && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenPayments();
              }}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#E6ECE4] hover:bg-[#CFDDD0] text-[#364A32] text-xs font-bold transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              {t('worker.dashboard.viewEarningsPayments', 'View Earnings & Payments')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

        {/* This Week's Earnings */}

        <div
          onClick={onOpenEarnings || onOpenMyWork}
          className="p-3.5 sm:p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl cursor-pointer hover:border-[#CFDDD0] transition-colors"
        >

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#364A32]">
              {t('worker.dashboard.thisWeekEarnings', "This Week's Earnings")}
            </span>

            <TrendingUp className="w-3.5 h-3.5 text-[#6E8B67]" />

          </div>

          <div className="mt-1 flex items-baseline gap-1.5">

            <span className="text-xl sm:text-2xl font-bold font-mono text-[#2A3927]">
              ₹2,450
            </span>

            <span className="text-[10px] text-[#527048] font-semibold">
              {t('worker.dashboard.sharePercent', '70% share')}
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
              {t('worker.dashboard.ratingLabel', 'Rating')}
            </span>

            <Star className="w-3.5 h-3.5 text-[#B37055]" />

          </div>

          <div className="mt-1 flex items-baseline gap-1.5">

            <span className="text-xl sm:text-2xl font-bold font-mono text-[#292824] flex items-center gap-0.5">

              <span>
                {currentWorker.rating}
              </span>

              <Star className="w-4 h-4 fill-[#B37055] text-[#B37055] inline" />

            </span>

            <span className="text-[10px] text-[#77736B]">
              ({currentWorker.totalReviews})
            </span>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. NEW JOB REQUEST                                      */}
      {/* ======================================================== */}

      <div className="space-y-2.5">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            <Zap className="w-4 h-4 text-[#537895]" />

            <h2 className="text-xs font-bold uppercase tracking-wider text-[#324F66]">
              {t('worker.dashboard.newJobForYou', 'New Job For You')}
            </h2>

          </div>

          <span className="text-[11px] text-[#77736B]">
            {t('worker.dashboard.newJobSubtitle', 'Matched based on your skill, distance and availability')}
          </span>

        </div>

        {incomingRequest ? (

          <div className="p-4 sm:p-5 bg-[#FCF9F3] border-2 border-[#B8CBDD] rounded-2xl shadow-card space-y-4 animate-fade-in">

            <div className="flex items-start justify-between gap-3">

              <div>

                <div className="flex items-center gap-2 flex-wrap mb-1">

                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
                    {t('category.' + incomingRequest.service.toLowerCase().replace(/[\s/&-]+/g, '_'), incomingRequest.service)}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      incomingRequest.priority === 'urgent'
                        ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F4DCD3]'
                        : 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0]'
                    }`}
                  >
                    {t('worker.dashboard.prioritySuffix', { priority: t('priority.' + incomingRequest.priority.toLowerCase(), incomingRequest.priority), defaultValue: `${t('priority.' + incomingRequest.priority.toLowerCase(), incomingRequest.priority)} Priority` })}
                  </span>

                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#292824]">
                  {incomingRequest.problem === 'Power Socket Issue' ? t('cardContent.powerSocketIssue', incomingRequest.problem) : incomingRequest.problem}
                </h3>

              </div>

              <div className="text-right shrink-0">

                <span className="text-lg sm:text-xl font-bold font-mono text-[#445D3E] block">
                  ₹{incomingRequest.earnings}
                </span>
                <span className="text-[10px] text-[#77736B]">{t('worker.dashboard.estimatedNet', 'Estimated Net')}</span>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#524E47] pt-1">

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span className="truncate">
                  {incomingRequest.location}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#80432E]">{t('worker.dashboard.distanceLabel', { distance: incomingRequest.distance, defaultValue: `Distance: ${incomingRequest.distance}` })}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span>{incomingRequest.dateTime === 'Immediate Dispatch' ? t('worker.dashboard.immediateDispatch', 'Immediate Dispatch') : incomingRequest.dateTime}</span>
              </div>

            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2D5]">

              <button
                type="button"
                onClick={handleDeclineRequest}
                className="px-4 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#80432E] border border-[#E8E2D5] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t('worker.dashboard.declineBtn', 'Decline')}
              </button>

              <button
                type="button"
                onClick={handleAcceptRequest}
                disabled={processingJobId !== null}
                className="px-5 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {processingJobId ? t('worker.dashboard.acceptingBtn', 'Accepting…') : t('worker.dashboard.acceptAmountBtn', { amount: incomingRequest.earnings, defaultValue: `Accept (₹${incomingRequest.earnings})` })}
              </button>

            </div>

          </div>

        ) : (

          <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">

            <CheckCircle2 className="w-6 h-6 text-[#6E8B67] mx-auto" />
            <span className="text-xs font-semibold text-[#292824] block">{t('worker.dashboard.noPendingRequests', 'No pending requests')}</span>
            <p className="text-[11px] text-[#77736B]">
              {isAvailable
                ? t('worker.dashboard.activeAllocationNotice', 'You are active in the allocation queue. Nearby requests will pop up automatically.')
                : t('worker.dashboard.switchAvailableNotice', 'Switch to Available to receive new dispatches from your society.')}
            </p>

          </div>

        )}

      </div>

      {/* ======================================================== */}
      {/* 4. EARNINGS & VERIFICATION                               */}
      {/* ======================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

        {/* Earnings Card */}

        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">

          <div className="flex items-center justify-between">

            <span className="text-xs font-semibold uppercase tracking-wider text-[#364A32] flex items-center gap-1.5">

              <DollarSign className="w-4 h-4 text-[#6E8B67]" />

              <span>Earnings</span>

            </span>

            <Badge variant="coop" size="sm">
              <span className="font-mono">70%</span> Net Share
            </Badge>

          </div>

          <div>

            <span className="text-2xl font-bold font-mono text-[#292824]">
              ₹2,450
            </span>

            <span className="text-xs text-[#77736B] ml-2">
              this week
            </span>

          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E2D5] text-xs">

            <div>
              <span className="text-[10px] text-[#77736B] block">
                Today's Jobs
              </span>

              <strong className="text-[#292824]">
                2 Completed
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-[#77736B] block">
                Lifetime Payout
              </span>

              <strong className="text-[#292824]">
                ₹{currentWorker.completedJobs * 420}
              </strong>
            </div>

          </div>

          {onOpenPayments && (
            <button
              type="button"
              onClick={onOpenPayments}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#E6ECE4] hover:bg-[#CFDDD0] text-[#364A32] text-xs font-bold transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              View Earnings & Payments
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

        {/* Verification Card */}

        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">

          <div className="flex items-center justify-between">

            <span className="text-xs font-bold uppercase tracking-wider text-[#324F66] flex items-center gap-1.5">

              <ShieldCheck className="w-4 h-4 text-[#537895]" />

              <span>
                Verification Status
              </span>

            </span>

            <Badge variant="verified" size="sm">
              VERIFIED WORKER ✓
            </Badge>

          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[11px] text-[#292824]">

            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
              Identity
            </span>

            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
              Membership
            </span>

            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
              Skills
            </span>

            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
              Certificates
            </span>

            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
              Assessment
            </span>

            <span className="flex items-center gap-1 text-[#364A32] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
              Society
            </span>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 5. NEXT JOB                                              */}
      {/* ======================================================== */}

      <div className="space-y-2.5">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            <Clock className="w-4 h-4 text-[#537895]" />

            <h2 className="text-xs font-bold uppercase tracking-wider text-[#324F66]">
              {t('worker.dashboard.nextJob', 'Next Job')}
            </h2>

          </div>

          <button
            type="button"
            onClick={onOpenMyWork}
            className="text-xs font-bold text-[#537895] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>{t('worker.dashboard.viewAllMyWork', 'View all in My Work')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

        </div>

        {nextJob ? (

          <div className="p-4 sm:p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">

            <div className="flex items-start justify-between gap-2">

              <div>

                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
                  {t('category.' + nextJob.service.toLowerCase().replace(/[\s/&-]+/g, '_'), nextJob.service)}
                </span>
                <h3 className="text-base font-bold text-[#292824] mt-1">
                  {nextJob.problem === 'Power Socket Issue' ? t('cardContent.powerSocketIssue', nextJob.problem) : nextJob.problem}
                </h3>
              </div>

              <div className="text-right">

                <span className="text-base font-bold font-mono text-[#445D3E] block">
                  ₹{nextJob.earnings}
                </span>
                <span className="text-[10px] text-[#77736B]">{t('worker.dashboard.confirmedNet', 'Confirmed Net')}</span>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#524E47]">

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span className="truncate">
                  {nextJob.location}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                <span>{nextJob.dateTime === 'Today · Scheduled' ? t('cardContent.todayScheduled', nextJob.dateTime) : nextJob.dateTime}</span>
              </div>

            </div>

            <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
              <span className="text-[11px] text-[#77736B]">{t('worker.dashboard.jobRef', { id: nextJob.id, defaultValue: `Job Reference #${nextJob.id}` })}</span>
              <button
                type="button"
                onClick={onOpenMyWork}
                className="px-4 py-1.5 bg-[#537895] hover:bg-[#41637E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t('worker.dashboard.openInMyWork', 'Open in My Work →')}
              </button>

            </div>

          </div>

        ) : (

          <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center text-xs text-[#77736B]">
            {t('worker.dashboard.noUpcomingJobs', 'No upcoming jobs scheduled yet.')}
          </div>

        )}

      </div>

      {/* ======================================================== */}
      {/* 6. DEMAND NEAR YOU                                      */}
      {/* ======================================================== */}

      <div className="space-y-2.5">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            <Map className="w-4 h-4 text-[#6E8B67]" />

            <h2 className="text-xs font-bold uppercase tracking-wider text-[#364A32]">
              {t('worker.dashboard.demandNearYou', 'Demand Near You')}
            </h2>

          </div>
          <span className="text-[11px] text-[#77736B]">{t('worker.dashboard.predictiveHeatmapLink', 'Predictive Heatmap Link')}</span>
        </div>

        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-3">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

            {MOCK_DEMAND_AREAS.map((area) => (
              <div
                key={area.area}
                className="p-2.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex items-center justify-between text-xs"
              >

                <div>

                  <span className="font-bold text-[#292824] block leading-tight">
                    {area.area}
                  </span>

                  <span className="text-[10px] text-[#77736B]">
                    {area.serviceType}
                  </span>

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
              {t('worker.dashboard.demandForecastUpdate', 'Predictive demand forecast updated every 30 mins')}
            </span>

            <button
              type="button"
              onClick={() =>
                setShowDemandHeatmapModal(true)
              }
              className="text-xs font-bold text-[#537895] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{t('worker.dashboard.exploreDemandHeatmap', 'Explore Demand Heatmap')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {selectedBookingForExecution && (
        <WorkerJobExecutionModal
          booking={selectedBookingForExecution}
          isOpen={
            selectedBookingForExecution !== null
          }
          onClose={() =>
            setSelectedBookingForExecution(null)
          }
        />
      )}

      {sosJob && (
        <WorkerSOSModal
          job={sosJob}
          isOpen={sosJob !== null}
          onClose={() => setSosJob(null)}
        />
      )}

      {/* Demand Heatmap Modal */}

      <Modal
        isOpen={showDemandHeatmapModal}
        onClose={() => setShowDemandHeatmapModal(false)}
        title={t('worker.dashboard.heatmapModalTitle', 'Predictive Demand & Operational Sectors')}
        subtitle={t('worker.dashboard.heatmapModalSubtitle', 'Cooperative Spatial Dispatch Engine & Active Clusters')}
        maxWidth="lg"
      >

        <div className="space-y-4 text-xs">

          <div className="p-3 bg-[#E4EDF4] border border-[#B8CBDD] rounded-xl text-[#263D50]">

            <p className="font-bold flex items-center gap-1.5">

              <Map className="w-4 h-4 text-[#324F66]" />
              <span>{t('worker.dashboard.activeHotspots', 'Active Cooperative Demand Hotspots')}</span>
            </p>

            <p className="text-[11px] text-[#537895] mt-0.5">
              {t('worker.dashboard.hotspotsDesc', 'Live spatial demand distribution across Western Pune member societies and high-volume sectors.')}
            </p>

          </div>

          {/* Interactive Demand Map */}

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
                  lat:
                    currentWorker.latitude ||
                    18.5590,
                  lng:
                    currentWorker.longitude ||
                    73.7868,
                },
              },

              {
                id: 'demand_baner',
                type: 'job',
                title: 'High Demand: Baner Tower A',
                urgencyTier: 'URGENT',
                coordinates: {
                  lat: 18.5595,
                  lng: 73.7880,
                },
              },

              {
                id: 'demand_balewadi',
                type: 'job',
                title: 'Medium Demand: Balewadi High St',
                urgencyTier: 'STANDARD',
                coordinates: {
                  lat: 18.5742,
                  lng: 73.7725,
                },
              },

              {
                id: 'demand_pashan',
                type: 'job',
                title: 'Emergency: Pashan Lake Road',
                urgencyTier: 'EMERGENCY',
                coordinates: {
                  lat: 18.5362,
                  lng: 73.7925,
                },
              },
            ]}
            autoFitBounds={true}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

            {MOCK_DEMAND_AREAS.map((item) => (
              <div
                key={item.area}
                className="p-2.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex justify-between items-center"
              >

                <div>

                  <strong className="text-[#292824] block leading-tight">
                    {item.area}
                  </strong>

                  <span className="text-[10px] text-[#77736B]">
                    {item.serviceType} · {item.distance}
                  </span>

                </div>

                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-[#FAEDE8] text-[#80432E]">
                  {item.demandLevel.toUpperCase()}
                </span>

              </div>
            ))}

          </div>

          <button
            type="button"
            onClick={() =>
              setShowDemandHeatmapModal(false)
            }
            className="w-full py-2.5 bg-[#292824] text-white font-bold rounded-xl cursor-pointer hover:bg-black transition-colors"
          >
            {t('worker.dashboard.closeHeatmap', 'Close Heatmap')}
          </button>

        </div>

      </Modal>

    </div>
  );
};