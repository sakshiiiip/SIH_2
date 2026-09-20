import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { JobStatusBadge } from '../../components/worker/JobStatusBadge';
import { WorkerSOSModal } from './WorkerSOSModal';
import { WorkerJobExecutionModal } from './WorkerJobExecutionModal';
import { isWorkerSkillMatching } from '../../utils/matchingEngine';
import {
  MOCK_UPCOMING_JOBS,
  MOCK_IN_PROGRESS_JOB,
  MOCK_COMPLETED_JOBS,
  MOCK_CANCELLED_JOBS,
  WorkerJobRequest,
} from '../../data/workerMockData';
import {
  HardHat,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Phone,
  MapPin,
  DollarSign,
  Star,
  XCircle,
  ChevronRight,
  Navigation,
  Camera,
  Briefcase,
  KeyRound,
  RotateCcw,
  Filter,
  ImageIcon,
} from 'lucide-react';

type JobTab = 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'history';
type HistoryFilter = 'all' | 'finished' | 'revisited' | 'cancelled';

interface WorkerJobsPageProps {
  onOpenJobDetails?: (jobId: string) => void;
}

export const WorkerJobsPage: React.FC<WorkerJobsPageProps> = ({ onOpenJobDetails }) => {
  const { currentUser, bookings, workers, updateBookingState, verifyOTPAndStartJob, acceptJob } = useCooperativeStore();
  const [activeTab, setActiveTab] = useState<JobTab>('upcoming');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [executionBooking, setExecutionBooking] = useState<Booking | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});

  // Resolve current logged-in worker
  const currentWorker =
    workers.find((w) => w.id === currentUser.id) ||
    workers.find((w) => w.name === currentUser.name) ||
    workers.find((w) => w.id === 'w_rahul') ||
    {
      id: currentUser.id || 'w_rahul',
      name: currentUser.name || 'Rahul Sharma',
      profession: currentUser.tradeProfession || 'Plumber',
      skills: currentUser.tradeProfession ? [currentUser.tradeProfession] : ['Plumbing'],
    };

  // Open pending jobs awaiting worker assignment filtered strictly by trade
  const openPendingJobs = bookings.filter(
    (b) =>
      b.state === 'PENDING_ASSIGNMENT' &&
      isWorkerSkillMatching(currentWorker, b.category || b.serviceCategory)
  );

  // Filter store bookings assigned to this worker and matching trade
  const workerBookings = bookings.filter(
    (b) =>
      (b.matchedWorkerId === currentWorker.id ||
        b.workerId === currentWorker.id ||
        (currentWorker.id === 'w_rahul' && b.matchedWorkerId === 'w_rahul') ||
        b.matchedWorkerId === currentUser.id) &&
      isWorkerSkillMatching(currentWorker, b.category || b.serviceCategory)
  );

  const storeUpcoming = [
    ...workerBookings.filter((b) =>
      ['PENDING_WORKER_ACCEPTANCE', 'WORKER_ASSIGNED', 'CONFIRMED'].includes(b.state)
    ),
    ...openPendingJobs,
  ];
  const storeInProgress = workerBookings.filter((b) =>
    ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'AWAITING_VERIFICATION'].includes(b.state)
  );
  const storeCompleted = workerBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );
  const storeHistory = workerBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED', 'REVISIT', 'REVISIT_REQUESTED', 'REVISIT_SCHEDULED', 'CANCELLED'].includes(b.state)
  );

  // Mock data filtered strictly by worker trade to prevent cross-trade job leaks
  const filteredMockUpcoming = MOCK_UPCOMING_JOBS.filter((job) =>
    isWorkerSkillMatching(currentWorker, job.serviceType)
  );
  const filteredMockCompleted = MOCK_COMPLETED_JOBS.filter((job) =>
    isWorkerSkillMatching(currentWorker, job.serviceType)
  );
  const filteredMockCancelled = MOCK_CANCELLED_JOBS.filter((job) =>
    isWorkerSkillMatching(currentWorker, job.serviceType)
  );
  const showMockInProgress =
    storeInProgress.length === 0 &&
    isWorkerSkillMatching(currentWorker, MOCK_IN_PROGRESS_JOB.serviceType);

  const handleOtpVerify = (job: Booking) => {
    const entered = otpInputs[job.id] || '';
    if (!entered.trim()) {
      setOtpErrors({ ...otpErrors, [job.id]: 'Please enter the 4-digit arrival OTP' });
      return;
    }
    const success = verifyOTPAndStartJob(job.id, entered.trim());
    if (success) {
      setOtpErrors({ ...otpErrors, [job.id]: '' });
    } else {
      setOtpErrors({ ...otpErrors, [job.id]: 'Invalid OTP code. Ask customer for flat OTP.' });
    }
  };

  const TABS: { id: JobTab; label: string; count: number }[] = [
    { id: 'upcoming',    label: 'Upcoming',    count: storeUpcoming.length + filteredMockUpcoming.length },
    { id: 'in_progress', label: 'In Progress', count: storeInProgress.length + (showMockInProgress ? 1 : 0) },
    { id: 'completed',   label: 'Completed',   count: storeCompleted.length + filteredMockCompleted.length },
    { id: 'cancelled',   label: 'Cancelled',   count: filteredMockCancelled.length },
    { id: 'history',     label: 'Job History & Filter', count: storeHistory.length + filteredMockCompleted.length + filteredMockCancelled.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292824] tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#537895]" />
            My Jobs
          </h1>
          <p className="text-xs text-[#77736B] mt-1">Manage your assigned service jobs</p>
        </div>
        <Badge variant="urgent" size="md">
          <HardHat className="w-4 h-4 mr-1 text-[#324F66]" />
          Worker Desk
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#E8E2D5]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#292824] text-[#FAF7F2] shadow-xs'
                : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full font-mono text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#F3EEE4] text-[#77736B]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* UPCOMING TAB                                                  */}
      {/* ============================================================ */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {storeUpcoming.length === 0 && filteredMockUpcoming.length === 0 ? (
            <EmptyState icon={<Clock />} message="No upcoming jobs" sub="New accepted or assigned jobs for your trade will appear here." />
          ) : (
            <>
              {/* Store-sourced upcoming jobs */}
              {storeUpcoming.map((job) => (
                <UpcomingJobCard
                  key={job.id}
                  jobId={job.id}
                  serviceType={job.category || job.serviceCategory}
                  problemType={job.problemType}
                  customerName={job.customerName}
                  address={job.customerAddress}
                  date={job.scheduledDate || 'Scheduled'}
                  time={job.scheduledTimeSlot || job.state}
                  earnings={job.pricing?.workerShare || 400}
                  status={job.state}
                  onAcceptJob={
                    job.state === 'PENDING_ASSIGNMENT' || job.state === 'PENDING_WORKER_ACCEPTANCE'
                      ? () => acceptJob(job.id, currentWorker.id)
                      : undefined
                  }
                  onStartJob={
                    job.state === 'CONFIRMED' || job.state === 'WORKER_ASSIGNED'
                      ? () => updateBookingState(job.id, 'TRAVELLING')
                      : undefined
                  }
                  onViewDetails={() => onOpenJobDetails?.(job.id)}
                />
              ))}
              {/* Mock upcoming jobs */}
              {filteredMockUpcoming.map((job) => (
                <UpcomingJobCard
                  key={job.jobId}
                  jobId={job.jobId}
                  serviceType={job.serviceType}
                  problemType={job.problemType}
                  customerName={job.customer.name}
                  address={job.customer.address}
                  date={job.date}
                  time={job.time}
                  earnings={job.estimatedEarnings}
                  status="upcoming"
                  onViewDetails={() => onOpenJobDetails?.(job.jobId)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* IN PROGRESS TAB                                               */}
      {/* ============================================================ */}
      {activeTab === 'in_progress' && (
        <div className="space-y-4">
          {showMockInProgress && (
            /* Mock in-progress job */
            <InProgressJobCard
              job={MOCK_IN_PROGRESS_JOB}
              onSOS={() => {}} // Would open SOS modal — Person 5 support
            />
          )}
          {storeInProgress.length === 0 && !showMockInProgress && (
            <EmptyState icon={<Briefcase />} message="No active jobs in progress" sub="Jobs will appear here once you start travel or work." />
          )}
          {storeInProgress.map((job) => (
            <Card key={job.id} className="p-5 border-[#DFD8E8] bg-[#FCF9F3] shadow-card space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#EFEBF4] text-[#3D314C] border border-[#DFD8E8] rounded-md">
                      {job.serviceCategory}
                    </span>
                    <JobStatusBadge state={job.state} />
                  </div>
                  <h3 className="text-base font-bold text-[#292824]">{job.problemType}</h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[#445D3E]">₹{job.pricing.workerShare}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => setSosJob(job)}
                    leftIcon={<AlertOctagon className="w-3.5 h-3.5 text-[#C93B2B]" />}
                  >
                    SOS
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#524E47]">
                <MapPin className="w-4 h-4 text-[#80432E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#292824] block">{job.customerAddress}</strong>
                  <span>{job.customerName} · {job.customerPhone}</span>
                </div>
              </div>
              <div className="border-t border-[#E8E2D5] pt-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <Button variant="outline" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}
                  onClick={() => alert(`Calling ${job.customerName}: ${job.customerPhone}`)}>
                  Call Customer
                </Button>

                {/* OTP / State progression */}
                <div className="flex items-center gap-2">
                  {job.state === 'CONFIRMED' && (
                    <Button variant="primary" size="sm" onClick={() => updateBookingState(job.id, 'TRAVELLING')}
                      leftIcon={<Navigation className="w-3.5 h-3.5" />}>
                      Start Travel
                    </Button>
                  )}
                  {job.state === 'TRAVELLING' && (
                    <Button variant="primary" size="sm" onClick={() => updateBookingState(job.id, 'ARRIVED')}
                      leftIcon={<MapPin className="w-3.5 h-3.5" />}>
                      I Have Arrived
                    </Button>
                  )}
                  {job.state === 'ARRIVED' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text" maxLength={4} placeholder="OTP"
                        value={otpInputs[job.id] || ''}
                        onChange={(e) => setOtpInputs({ ...otpInputs, [job.id]: e.target.value })}
                        className="w-24 px-3 py-1.5 border border-[#E8E2D5] rounded-xl text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
                      />
                      <Button variant="primary" size="sm" onClick={() => handleOtpVerify(job)}
                        leftIcon={<KeyRound className="w-3.5 h-3.5" />}>
                        Verify & Start
                      </Button>
                    </div>
                  )}
                  {job.state === 'IN_PROGRESS' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Camera className="w-3.5 h-3.5" />}
                        onClick={() => setExecutionBooking(job)}
                      >
                        Job Verification
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setExecutionBooking(job)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Execution Wizard
                      </Button>
                    </>
                  )}
                  {job.state === 'AWAITING_VERIFICATION' && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Awaiting Manager Verification
                    </span>
                  )}
                </div>
              </div>
              {otpErrors[job.id] && (
                <p className="text-xs text-[#C93B2B] font-semibold">{otpErrors[job.id]}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* COMPLETED TAB                                                 */}
      {/* ============================================================ */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {storeCompleted.length === 0 && filteredMockCompleted.length === 0 ? (
            <EmptyState icon={<CheckCircle2 />} message="No completed jobs yet" sub="Completed jobs will appear here." />
          ) : (
            <>
              {storeCompleted.map((job) => (
                <CompletedJobCard
                  key={job.id}
                  jobId={job.id}
                  serviceType={job.category || job.serviceCategory}
                  problemType={job.problemType}
                  customerName={job.customerName}
                  date={job.completedAt || job.updatedAt}
                  earnings={job.pricing?.workerShare || 400}
                  paymentStatus={['PAID', 'RATED'].includes(job.state) ? 'paid' : 'pending'}
                  rating={job.rating?.stars}
                />
              ))}
              {filteredMockCompleted.map((job) => (
                <CompletedJobCard
                  key={job.jobId}
                  jobId={job.jobId}
                  serviceType={job.serviceType}
                  problemType={job.problemType}
                  customerName={job.customer.name}
                  date={job.date}
                  earnings={job.estimatedEarnings}
                  paymentStatus={job.paymentStatus || 'pending'}
                  rating={job.rating}
                  ratingComment={job.ratingComment}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* CANCELLED TAB                                                 */}
      {/* ============================================================ */}
      {activeTab === 'cancelled' && (
        <div className="space-y-4">
          {filteredMockCancelled.length === 0 ? (
            <EmptyState icon={<XCircle />} message="No cancelled jobs" sub="Cancelled jobs will appear here." />
          ) : (
            filteredMockCancelled.map((job) => (
              <Card key={job.jobId} className="p-5 border-[#E8E2D5] bg-[#FCF9F3] shadow-card space-y-3 opacity-80">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#F3EEE4] text-[#524E47] border border-[#E8E2D5] rounded-md">
                        {job.serviceType}
                      </span>
                      <JobStatusBadge state="cancelled" />
                      <span className="text-[10px] font-mono text-[#9A958B]">#{job.jobId}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#292824]">{job.problemType}</h3>
                  </div>
                  <span className="text-sm font-bold font-mono text-[#9A958B] line-through">₹{job.estimatedEarnings}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#77736B] flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9A958B]" />
                    {job.customer.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#9A958B]" />
                    {job.date}
                  </span>
                </div>
                {job.cancellationReason && (
                  <div className="p-2.5 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl">
                    <p className="text-xs text-[#524E47]">
                      <strong className="text-[#292824]">Reason:</strong> {job.cancellationReason}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* HISTORY & FILTER TAB                                         */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Subfilter pills */}
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#E8E2D5]">
            <span className="text-xs text-[#77736B] font-semibold flex items-center gap-1 mr-1">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  historyFilter === f.id
                    ? 'bg-[#445D3E] text-white shadow-xs'
                    : 'bg-[#FCF9F3] border border-[#E8E2D5] text-[#524E47] hover:bg-[#F3EEE4]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filtered History List */}
          {(() => {
            const filtered = storeHistory.filter((b) => {
              if (historyFilter === 'finished') return ['COMPLETED', 'PAID', 'RATED'].includes(b.state);
              if (historyFilter === 'revisited') return ['REVISIT', 'REVISIT_REQUESTED', 'REVISIT_SCHEDULED'].includes(b.state);
              if (historyFilter === 'cancelled') return b.state === 'CANCELLED';
              return true;
            });

            if (filtered.length === 0) {
              return (
                <EmptyState
                  icon={<RotateCcw />}
                  message="No matching history records"
                  sub="Jobs that are finished, revisited, or cancelled will appear here."
                />
              );
            }

            return (
              <div className="space-y-3">
                {filtered.map((job) => {
                  const isFinished = ['COMPLETED', 'PAID', 'RATED'].includes(job.state);
                  const isRevisit = ['REVISIT', 'REVISIT_REQUESTED', 'REVISIT_SCHEDULED'].includes(job.state);
                  const isCancelled = job.state === 'CANCELLED';

                  return (
                    <Card
                      key={job.id}
                      className={`p-4 border bg-[#FCF9F3] shadow-card space-y-3 transition-all ${
                        isCancelled
                          ? 'border-rose-200 opacity-80'
                          : isRevisit
                          ? 'border-amber-200'
                          : 'border-[#CFDDD0]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#F3EEE4] text-[#524E47] border border-[#E8E2D5] rounded-md">
                              {job.serviceCategory}
                            </span>
                            <Badge
                              variant={
                                isCancelled ? 'danger' : isRevisit ? 'urgent' : 'coop'
                              }
                              size="sm"
                            >
                              {job.state}
                            </Badge>
                            <span className="text-[10px] font-mono text-[#9A958B]">#{job.id}</span>
                          </div>
                          <h3 className="text-sm font-bold text-[#292824]">{job.problemType}</h3>
                          <p className="text-xs text-[#77736B] mt-0.5">
                            Customer: <strong className="text-[#292824]">{job.customerName}</strong> · {job.societyName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-bold font-mono block ${
                              isCancelled ? 'line-through text-slate-400' : 'text-[#445D3E]'
                            }`}
                          >
                            ₹{job.pricing.workerShare}
                          </span>
                          <span className="text-[10px] text-[#77736B]">
                            {isCancelled ? 'Cancelled' : 'Worker Share'}
                          </span>
                        </div>
                      </div>

                      {/* Photo evidence previews if available */}
                      {(job.beforeImage || job.afterImage) && (
                        <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-[#6E8B67]" />
                            Photo Proof:
                          </span>
                          <div className="flex items-center gap-2">
                            {job.beforeImage && (
                              <div className="relative group">
                                <img
                                  src={job.beforeImage}
                                  alt="Before"
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center rounded-b-lg">
                                  Before
                                </span>
                              </div>
                            )}
                            {job.afterImage && (
                              <div className="relative group">
                                <img
                                  src={job.afterImage}
                                  alt="After"
                                  className="w-12 h-12 object-cover rounded-lg border border-[#6E8B67]"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-[#445D3E] text-white text-[8px] text-center rounded-b-lg">
                                  After ✓
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Revisit detail note */}
                      {job.revisitDetails && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                          <strong className="block font-bold">Revisit Details:</strong>
                          <span>Reason: "{job.revisitDetails.reason}"</span>
                          {job.revisitDetails.scheduledDate && (
                            <span className="block mt-0.5 text-amber-800 font-semibold">
                              Scheduled Date: {job.revisitDetails.scheduledDate}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Cancellation note */}
                      {job.cancellationDetails && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                          <strong className="block font-bold">Cancellation Info:</strong>
                          <span>Cancelled by {job.cancellationDetails.cancelledBy}: "{job.cancellationDetails.reason}"</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#77736B] pt-1 border-t border-[#E8E2D5]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Updated: {job.updatedAt?.split('T')[0] || 'Recently'}
                        </span>
                        {job.rating && (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {job.rating.stars} ★
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {sosJob && (
        <WorkerSOSModal isOpen={sosJob !== null} onClose={() => setSosJob(null)} job={sosJob} />
      )}

      {/* Worker Job Execution Wizard Modal */}
      {executionBooking && (
        <WorkerJobExecutionModal
          isOpen={executionBooking !== null}
          onClose={() => setExecutionBooking(null)}
          booking={executionBooking}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <Card className="p-12 text-center bg-[#FCF9F3] border-[#E8E2D5] space-y-3">
      <div className="text-[#9A958B] mx-auto w-10 h-10">{icon}</div>
      <h3 className="text-base font-bold text-[#292824]">{message}</h3>
      <p className="text-xs text-[#77736B] max-w-sm mx-auto">{sub}</p>
    </Card>
  );
}

function UpcomingJobCard({
  jobId, serviceType, problemType, customerName, address,
  date, time, earnings, status, onAcceptJob, onStartJob, onViewDetails,
}: {
  jobId: string; serviceType: string; problemType: string; customerName: string;
  address: string; date: string; time: string; earnings: number;
  status: string; onAcceptJob?: () => void; onStartJob?: () => void; onViewDetails?: () => void;
}) {
  return (
    <Card className="p-5 border-[#B8CBDD] bg-[#F4F8FC] shadow-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
              {serviceType}
            </span>
            <JobStatusBadge state={status as any} />
            <span className="text-[10px] font-mono text-[#9A958B]">#{jobId}</span>
          </div>
          <h3 className="text-base font-bold text-[#292824]">{problemType}</h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold font-mono text-[#445D3E] block">₹{earnings}</span>
          <span className="text-[10px] text-[#77736B]">est. earnings</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-[#524E47] flex-wrap">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#537895]" />
          {address}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#537895]" />
          {date}, {time}
        </span>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D5]">
        <button
          type="button"
          onClick={onViewDetails}
          className="flex items-center gap-1 px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl cursor-pointer transition-colors"
        >
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {onAcceptJob && (
          <button
            type="button"
            onClick={onAcceptJob}
            className="px-4 py-2 bg-[#445D3E] hover:bg-[#33462F] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accept Job
          </button>
        )}
        {onStartJob && (
          <button
            type="button"
            onClick={onStartJob}
            className="px-4 py-2 bg-[#537895] hover:bg-[#41637E] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            Start Job
          </button>
        )}
      </div>
    </Card>
  );
}

function InProgressJobCard({ job, onSOS }: { job: WorkerJobRequest; onSOS: () => void }) {
  return (
    <Card className="p-5 border-2 border-[#DFD8E8] bg-[#F9F7FC] shadow-card space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#EFEBF4] text-[#3D314C] border border-[#DFD8E8] rounded-md animate-pulse">
              {job.serviceType}
            </span>
            <JobStatusBadge state="in_progress" />
            <span className="text-[10px] font-mono text-[#9A958B]">#{job.jobId}</span>
          </div>
          <h3 className="text-base font-bold text-[#292824]">{job.problemType}</h3>
          <p className="text-xs text-[#77736B] mt-1">Customer: <strong className="text-[#292824]">{job.customer.name}</strong></p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-mono text-[#445D3E] block">₹{job.estimatedEarnings}</span>
          <button
            type="button"
            onClick={onSOS}
            className="mt-1 flex items-center gap-1 px-2 py-1 bg-[#FAEBEB] border border-[#F4D7D7] text-[#C93B2B] text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#F6DDD4] animate-pulse"
          >
            <AlertOctagon className="w-3 h-3" />
            SOS
          </button>
        </div>
      </div>
      <div className="flex items-start gap-2 text-xs text-[#524E47]">
        <MapPin className="w-4 h-4 text-[#80432E] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#292824] block">{job.customer.address}</strong>
          <span className="text-[#77736B]">{job.customer.phone} · {job.date}, {job.time}</span>
        </div>
      </div>
      <p className="text-xs text-[#77736B] italic border-t border-[#E8E2D5] pt-2">
        "{job.description}"
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => alert(`Calling ${job.customer.name}: ${job.customer.phone}`)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Customer
        </button>
        <button
          type="button"
          onClick={() => alert('Job verification photos can be captured and reviewed during active job execution.')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#E4EDF4] hover:bg-[#D5E5F0] border border-[#B8CBDD] text-[#2B4C68] text-xs font-bold rounded-xl cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          Job Verification
        </button>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#EEF3EC] border border-[#CFDDD0] rounded-xl">
          <DollarSign className="w-3.5 h-3.5 text-[#6E8B67]" />
          {/* Person 3 integration point — payment status */}
          <span className="text-xs text-[#364A32]">Payment pending · ₹{job.estimatedEarnings}</span>
        </div>
      </div>
    </Card>
  );
}

function CompletedJobCard({
  jobId, serviceType, problemType, customerName, date,
  earnings, paymentStatus, rating, ratingComment,
}: {
  jobId: string; serviceType: string; problemType: string; customerName: string;
  date: string; earnings: number; paymentStatus: 'paid' | 'pending';
  rating?: number; ratingComment?: string;
}) {
  return (
    <Card className="p-5 border-[#CFDDD0] bg-[#F6FAF5] shadow-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] rounded-md">
              {serviceType}
            </span>
            <JobStatusBadge state="completed" />
            <span className="text-[10px] font-mono text-[#9A958B]">#{jobId}</span>
          </div>
          <h3 className="text-sm font-bold text-[#292824]">{problemType}</h3>
          <p className="text-xs text-[#77736B] mt-0.5">{customerName}</p>
        </div>
        <div className="text-right space-y-1">
          <span className="text-base font-bold font-mono text-[#445D3E] block">₹{earnings}</span>
          {/* Person 3 integration point — payment status */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            paymentStatus === 'paid'
              ? 'bg-[#E6ECE4] text-[#364A32]'
              : 'bg-[#FAEDE8] text-[#80432E]'
          }`}>
            {paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
          </span>
        </div>
      </div>
      {rating !== undefined && (
        <div className="flex items-center gap-1.5 text-xs text-[#77736B]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-[#B37055] text-[#B37055]' : 'text-[#E8E2D5]'}`} />
          ))}
          {ratingComment && <span className="ml-1 italic text-[#9A958B]">"{ratingComment}"</span>}
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-[#77736B] pt-1 border-t border-[#E8E2D5]">
        <Clock className="w-3.5 h-3.5" />
        <span>Completed: {date}</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67] ml-auto" />
        <span className="text-[#6E8B67] font-semibold">Job Closed</span>
      </div>
    </Card>
  );
}
