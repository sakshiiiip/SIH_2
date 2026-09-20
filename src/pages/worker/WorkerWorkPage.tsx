import React, { useState, useRef } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { JobStatusBadge } from '../../components/worker/JobStatusBadge';
import { WorkerSOSModal } from './WorkerSOSModal';
import { Modal } from '../../components/common/Modal';
import {
  MOCK_UPCOMING_JOBS,
  MOCK_IN_PROGRESS_JOB,
  MOCK_COMPLETED_JOBS,
  MOCK_CANCELLED_JOBS,
  MOCK_EARNINGS,
} from '../../data/workerMockData';
import {
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Phone,
  MapPin,
  Star,
  XCircle,
  ChevronRight,
  Navigation,
  Camera,
  KeyRound,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';

interface WorkerWorkPageProps {
  initialTab?: 'jobs' | 'earnings';
  onOpenJobDetails?: (jobId: string) => void;
  onOpenJobExecution?: (booking: Booking) => void;
}

type MainTab = 'jobs' | 'earnings';
type JobFilter = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export const WorkerWorkPage: React.FC<WorkerWorkPageProps> = ({
  initialTab = 'jobs',
  onOpenJobDetails,
  onOpenJobExecution,
}) => {
  const { currentUser, bookings, updateBookingState, verifyOTPAndStartJob, showToast } =
    useCooperativeStore();

  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [jobFilter, setJobFilter] = useState<JobFilter>('upcoming');

  // Modals
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [verificationJob, setVerificationJob] = useState<{ id: string; service: string } | null>(null);
  const [verificationBeforePhoto, setVerificationBeforePhoto] = useState<string | null>(null);
  const [verificationAfterPhoto, setVerificationAfterPhoto] = useState<string | null>(null);
  const verificationBeforeInputRef = useRef<HTMLInputElement>(null);
  const verificationAfterInputRef = useRef<HTMLInputElement>(null);
  const [detailsJobId, setDetailsJobId] = useState<string | null>(null);

  // OTP inputs
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});

  // Earnings view options
  const [showAllPayments, setShowAllPayments] = useState(false);

  // Filter store bookings
  const workerBookings = bookings.filter(
    (b) => b.matchedWorkerId === currentUser.id || b.matchedWorkerId === 'w_rahul'
  );

  const storeUpcoming = workerBookings.filter((b) =>
    ['PENDING_WORKER_ACCEPTANCE', 'CONFIRMED'].includes(b.state)
  );
  const storeInProgress = workerBookings.filter((b) =>
    ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.state)
  );
  const storeCompleted = workerBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const handleOtpVerify = (job: Booking) => {
    const entered = otpInputs[job.id] || '';
    if (!entered.trim()) {
      setOtpErrors({ ...otpErrors, [job.id]: 'Please enter the 4-digit arrival OTP' });
      return;
    }
    const success = verifyOTPAndStartJob(job.id, entered.trim());
    if (success) {
      setOtpErrors({ ...otpErrors, [job.id]: '' });
      showToast({ title: 'Arrival Confirmed!', message: 'OTP verified. You may start the job.', type: 'success' });
    } else {
      setOtpErrors({ ...otpErrors, [job.id]: 'Invalid OTP code. Ask customer for 4-digit OTP.' });
    }
  };

  const JOB_FILTERS: { id: JobFilter; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: storeUpcoming.length + MOCK_UPCOMING_JOBS.length },
    { id: 'in_progress', label: 'In Progress', count: storeInProgress.length + 1 },
    { id: 'completed', label: 'Completed', count: storeCompleted.length + MOCK_COMPLETED_JOBS.length },
    { id: 'cancelled', label: 'Cancelled', count: MOCK_CANCELLED_JOBS.length },
  ];

  // Earnings mock data
  const earnings = MOCK_EARNINGS;
  const displayedPayments = showAllPayments
    ? earnings.recentPayments
    : earnings.recentPayments.slice(0, 4);

  // Weekly chart data (Mon - Sun)
  const weeklyChartData = [
    { day: 'Mon', amount: 350, height: 35 },
    { day: 'Tue', amount: 450, height: 45 },
    { day: 'Wed', amount: 200, height: 20 },
    { day: 'Thu', amount: 600, height: 60 },
    { day: 'Fri', amount: 300, height: 30 },
    { day: 'Sat', amount: 550, height: 55 },
    { day: 'Sun', amount: 0, height: 8 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E2D5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#324F66] bg-[#E4EDF4] px-2.5 py-0.5 rounded-md border border-[#B8CBDD]">
              Worker Operations
            </span>
            <Badge variant="coop" size="sm">70% Net Share</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292824] tracking-tight">
            My Work
          </h1>
          <p className="text-xs sm:text-sm text-[#77736B] mt-1">
            Manage your service pipeline, active assignments, OTP verification, and earnings ledger.
          </p>
        </div>

        {/* PRIMARY TAB SELECTOR: [ Jobs ] [ Earnings ] */}
        <div className="flex items-center gap-1 bg-[#F3EEE4] p-1 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMainTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mainTab === 'jobs'
                ? 'bg-white text-[#292824] shadow-xs border border-[#E8E2D5]'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[#537895]" />
            <span>Jobs</span>
            <span className="ml-1 px-1.5 py-0.2 bg-[#E4EDF4] text-[#324F66] rounded-full text-[10px]">
              {storeUpcoming.length + storeInProgress.length + MOCK_UPCOMING_JOBS.length + 1}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('earnings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mainTab === 'earnings'
                ? 'bg-white text-[#292824] shadow-xs border border-[#E8E2D5]'
                : 'text-[#77736B] hover:text-[#292824]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#6E8B67]" />
            <span>Earnings</span>
            <span className="ml-1 text-[10px] font-mono text-[#6E8B67] font-bold">
              ₹{earnings.weeklyEarnings}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. JOBS TAB                                                  */}
      {/* ============================================================ */}
      {mainTab === 'jobs' && (
        <div className="space-y-6">
          {/* Sub-filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#E8E2D5]">
            {JOB_FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setJobFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  jobFilter === tab.id
                    ? 'bg-[#292824] text-[#FAF7F2] shadow-xs'
                    : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full font-mono text-[10px] ${
                      jobFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F3EEE4] text-[#77736B]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* UPCOMING JOBS */}
          {jobFilter === 'upcoming' && (
            <div className="space-y-3.5">
              {storeUpcoming.length === 0 && MOCK_UPCOMING_JOBS.length === 0 ? (
                <EmptyJobsState
                  icon={<Clock className="w-8 h-8 text-[#9A958B]" />}
                  title="No upcoming jobs scheduled"
                  subtitle="New accepted assignments from societies will appear here."
                />
              ) : (
                <>
                  {storeUpcoming.map((job) => (
                    <Card
                      key={job.id}
                      className="p-4 sm:p-5 border-[#B8CBDD] bg-[#FCF9F3] hover:border-[#CFDDD0] transition-all space-y-3 shadow-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
                              {job.serviceCategory}
                            </span>
                            <JobStatusBadge state={job.state} />
                            <span className="text-[10px] font-mono text-[#9A958B]">#{job.id}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#292824]">{job.problemType}</h3>
                          <p className="text-xs text-[#77736B] mt-0.5">
                            Customer: <strong className="text-[#292824]">{job.customerName}</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-[#445D3E] block">
                            ₹{job.pricing.workerShare}
                          </span>
                          <span className="text-[10px] text-[#77736B]">Net Share</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#524E47] flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#537895]" />
                          {job.customerAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#537895]" />
                          Scheduled Today
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D5]">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenJobDetails) onOpenJobDetails(job.id);
                            else setDetailsJobId(job.id);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-[#537895] hover:underline cursor-pointer"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            updateBookingState(job.id, 'TRAVELLING');
                            showToast({ title: 'Travel Started', message: 'Customer notified of your departure.', type: 'info' });
                          }}
                          leftIcon={<Navigation className="w-3.5 h-3.5" />}
                        >
                          Start Travel
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {MOCK_UPCOMING_JOBS.map((job) => (
                    <Card
                      key={job.jobId}
                      className="p-4 sm:p-5 border-[#E8E2D5] bg-[#FCF9F3] hover:border-[#CFDDD0] transition-all space-y-3 shadow-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
                              {job.serviceType}
                            </span>
                            <JobStatusBadge state="upcoming" />
                            <span className="text-[10px] font-mono text-[#9A958B]">#{job.jobId}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#292824]">{job.problemType}</h3>
                          <p className="text-xs text-[#77736B] mt-0.5">
                            Customer: <strong className="text-[#292824]">{job.customer.name}</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-[#445D3E] block">
                            ₹{job.estimatedEarnings}
                          </span>
                          <span className="text-[10px] text-[#77736B]">Est. Earnings</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#524E47] flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#537895]" />
                          {job.customer.address} · <span className="font-semibold text-[#80432E]">{job.distance}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#537895]" />
                          {job.date}, {job.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D5]">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenJobDetails) onOpenJobDetails(job.jobId);
                            else setDetailsJobId(job.jobId);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-[#537895] hover:underline cursor-pointer"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-[#77736B]">Auto-reminder 1 hr before</span>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {/* IN PROGRESS JOBS */}
          {jobFilter === 'in_progress' && (
            <div className="space-y-4">
              {/* Store in-progress jobs */}
              {storeInProgress.map((job) => (
                <Card key={job.id} className="p-5 border-2 border-[#B8CBDD] bg-[#FCF9F3] shadow-card space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#EFEBF4] text-[#3D314C] border border-[#DFD8E8] rounded-md animate-pulse">
                          {job.serviceCategory}
                        </span>
                        <JobStatusBadge state={job.state} />
                        <span className="text-xs text-[#77736B] font-mono">#{job.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#292824]">{job.problemType}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-[#445D3E]">
                        ₹{job.pricing.workerShare}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSosJob(job)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] border border-[#F3C5B8] text-[11px] font-bold rounded-lg transition-colors cursor-pointer animate-pulse"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 text-[#C93B2B]" />
                        SOS
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-[#524E47]">
                    <MapPin className="w-4 h-4 text-[#80432E] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#292824] block">{job.customerAddress}</strong>
                      <span>Customer: {job.customerName} ({job.customerPhone})</span>
                    </div>
                  </div>

                  {/* Actions & Integration Points */}
                  <div className="border-t border-[#E8E2D5] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => alert(`Calling customer ${job.customerName}: ${job.customerPhone}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Customer
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Job Verification */}
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationBeforePhoto(null);
                          setVerificationAfterPhoto(null);
                          setVerificationJob({ id: job.id, service: `${job.serviceCategory} — ${job.problemType}` });
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#E4EDF4] hover:bg-[#D5E5F0] border border-[#B8CBDD] text-[#2B4C68] text-xs font-bold rounded-xl cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Job Verification
                      </button>

                      {/* State progressions */}
                      {job.state === 'TRAVELLING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            updateBookingState(job.id, 'ARRIVED');
                            showToast({ title: 'Arrived on Site', message: 'Ask resident for their 4-digit OTP.', type: 'info' });
                          }}
                          leftIcon={<MapPin className="w-3.5 h-3.5" />}
                        >
                          I Have Arrived
                        </Button>
                      )}

                      {job.state === 'ARRIVED' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="4-digit OTP"
                            value={otpInputs[job.id] || ''}
                            onChange={(e) => setOtpInputs({ ...otpInputs, [job.id]: e.target.value })}
                            className="w-24 px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOtpVerify(job)}
                            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                          >
                            Verify & Start
                          </Button>
                        </div>
                      )}

                      {job.state === 'IN_PROGRESS' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            updateBookingState(job.id, 'COMPLETED');
                            showToast({ title: 'Job Marked Complete!', message: 'Job closed. Earnings credited to your ledger.', type: 'success' });
                          }}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>

                  {otpErrors[job.id] && (
                    <p className="text-xs text-[#C93B2B] font-semibold">{otpErrors[job.id]}</p>
                  )}
                </Card>
              ))}

              {/* Mock active job */}
              <Card className="p-5 border-2 border-[#B8CBDD] bg-[#FCF9F3] shadow-card space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#EFEBF4] text-[#3D314C] border border-[#DFD8E8] rounded-md animate-pulse">
                        {MOCK_IN_PROGRESS_JOB.serviceType}
                      </span>
                      <JobStatusBadge state="in_progress" />
                      <span className="text-xs text-[#77736B] font-mono">#{MOCK_IN_PROGRESS_JOB.jobId}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#292824]">{MOCK_IN_PROGRESS_JOB.problemType}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-[#445D3E] block">
                      ₹{MOCK_IN_PROGRESS_JOB.estimatedEarnings}
                    </span>
                    <span className="text-[10px] text-[#77736B]">In Execution</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-[#524E47]">
                  <MapPin className="w-4 h-4 text-[#80432E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#292824] block">{MOCK_IN_PROGRESS_JOB.customer.address}</strong>
                    <span>Customer: {MOCK_IN_PROGRESS_JOB.customer.name} ({MOCK_IN_PROGRESS_JOB.customer.phone})</span>
                  </div>
                </div>

                <p className="text-xs text-[#77736B] italic border-t border-[#E8E2D5] pt-2">
                  "{MOCK_IN_PROGRESS_JOB.description}"
                </p>

                <div className="border-t border-[#E8E2D5] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => alert(`Calling customer ${MOCK_IN_PROGRESS_JOB.customer.name}: ${MOCK_IN_PROGRESS_JOB.customer.phone}`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Customer
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Job Verification */}
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationBeforePhoto(null);
                        setVerificationAfterPhoto(null);
                        setVerificationJob({
                          id: MOCK_IN_PROGRESS_JOB.jobId,
                          service: `${MOCK_IN_PROGRESS_JOB.serviceType} — ${MOCK_IN_PROGRESS_JOB.problemType}`,
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#E4EDF4] hover:bg-[#D5E5F0] border border-[#B8CBDD] text-[#2B4C68] text-xs font-bold rounded-xl cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Job Verification
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        showToast({
                          title: 'Job Completed',
                          message: 'Job closed. Customer billed and rating requested.',
                          type: 'success',
                        })
                      }
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* COMPLETED JOBS */}
          {jobFilter === 'completed' && (
            <div className="space-y-3.5">
              {storeCompleted.length === 0 && MOCK_COMPLETED_JOBS.length === 0 ? (
                <EmptyJobsState
                  icon={<CheckCircle2 className="w-8 h-8 text-[#9A958B]" />}
                  title="No completed jobs yet"
                  subtitle="Finished assignments and customer ratings will be archived here."
                />
              ) : (
                <>
                  {storeCompleted.map((job) => (
                    <Card key={job.id} className="p-4 sm:p-5 border-[#CFDDD0] bg-[#FCF9F3] shadow-card space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] rounded-md">
                              {job.serviceCategory}
                            </span>
                            <JobStatusBadge state="completed" />
                            <span className="text-[10px] font-mono text-[#9A958B]">#{job.id}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#292824]">{job.problemType}</h3>
                          <p className="text-xs text-[#77736B] mt-0.5">{job.customerName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-[#445D3E] block">
                            ₹{job.pricing.workerShare}
                          </span>
                          <span className="text-[10px] font-bold text-[#364A32] bg-[#E6ECE4] px-2 py-0.5 rounded-full">
                            ✓ Settled
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#77736B] pt-2 border-t border-[#E8E2D5]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Completed: {job.completedAt || 'Today'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#B37055] text-[#B37055]" />
                          <strong className="text-[#292824]">5.0 ★</strong>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {MOCK_COMPLETED_JOBS.map((job) => (
                    <Card key={job.jobId} className="p-4 sm:p-5 border-[#CFDDD0] bg-[#FCF9F3] shadow-card space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] rounded-md">
                              {job.serviceType}
                            </span>
                            <JobStatusBadge state="completed" />
                            <span className="text-[10px] font-mono text-[#9A958B]">#{job.jobId}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#292824]">{job.problemType}</h3>
                          <p className="text-xs text-[#77736B] mt-0.5">{job.customer.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-[#445D3E] block">
                            ₹{job.estimatedEarnings}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            job.paymentStatus === 'paid' ? 'bg-[#E6ECE4] text-[#364A32]' : 'bg-[#FAEDE8] text-[#80432E]'
                          }`}>
                            {job.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {job.rating !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-[#77736B]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < job.rating! ? 'fill-[#B37055] text-[#B37055]' : 'text-[#E8E2D5]'
                              }`}
                            />
                          ))}
                          {job.ratingComment && (
                            <span className="ml-1 italic text-[#9A958B]">"{job.ratingComment}"</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#77736B] pt-2 border-t border-[#E8E2D5]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Completed: {job.date}
                        </span>
                        <span className="text-[#6E8B67] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Job Closed
                        </span>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {/* CANCELLED JOBS */}
          {jobFilter === 'cancelled' && (
            <div className="space-y-3.5">
              {MOCK_CANCELLED_JOBS.length === 0 ? (
                <EmptyJobsState
                  icon={<XCircle className="w-8 h-8 text-[#9A958B]" />}
                  title="No cancelled jobs"
                  subtitle="Any cancelled or rescheduled appointments will be listed here."
                />
              ) : (
                MOCK_CANCELLED_JOBS.map((job) => (
                  <Card key={job.jobId} className="p-4 sm:p-5 border-[#E8E2D5] bg-[#FCF9F3] shadow-card space-y-3 opacity-80">
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
                      <span className="text-sm font-bold font-mono text-[#9A958B] line-through">
                        ₹{job.estimatedEarnings}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#77736B] flex-wrap">
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
                      <div className="p-2.5 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47]">
                        <strong className="text-[#292824]">Cancellation Note:</strong> {job.cancellationReason}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. EARNINGS TAB (Section 3 Requirement)                      */}
      {/* ============================================================ */}
      {mainTab === 'earnings' && (
        <div className="space-y-6">
          {/* Hero: Total Earnings This Week */}
          <div className="p-6 bg-[#EEF3EC] border border-[#CFDDD0] rounded-2xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#527048] block">
                Total Earnings This Week
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#2A3927] mt-1">
                ₹{earnings.weeklyEarnings.toLocaleString('en-IN')}
              </div>
              <p className="text-xs sm:text-sm text-[#527048] mt-1 font-medium">
                {earnings.weeklyJobsCount} jobs completed · 70% direct cooperative member share
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white/80 border border-[#CFDDD0] rounded-xl text-xs font-bold text-[#364A32]">
                T+1 Automated Bank Settlement
              </span>
            </div>
          </div>

          {/* Compact Statistics: Today, This Week, This Month */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] block">
                Today
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#292824] block mt-1">
                ₹{earnings.todayEarnings}
              </span>
              <span className="text-[10px] text-[#77736B] block mt-0.5">
                {earnings.todayJobsCount} job done
              </span>
            </div>

            <div className="p-4 bg-[#FCF9F3] border-2 border-[#6E8B67] rounded-2xl text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#364A32] block">
                This Week
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#364A32] block mt-1">
                ₹{earnings.weeklyEarnings}
              </span>
              <span className="text-[10px] text-[#527048] block mt-0.5">
                {earnings.weeklyJobsCount} jobs done
              </span>
            </div>

            <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] block">
                This Month
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#292824] block mt-1">
                ₹{earnings.monthlyEarnings.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#77736B] block mt-0.5">
                {earnings.monthlyJobsCount} jobs done
              </span>
            </div>
          </div>

          {/* Clean Earnings Overview Chart */}
          <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#292824]">Weekly Earnings Breakdown</h3>
                <p className="text-xs text-[#77736B]">Daily net receipts for current settlement cycle</p>
              </div>
              <Badge variant="coop" size="sm">Active Week</Badge>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-40 flex items-end justify-between gap-2 px-2 border-b border-[#E8E2D5]">
                {weeklyChartData.map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono text-[#77736B] group-hover:text-[#292824] transition-colors">
                      {bar.amount > 0 ? `₹${bar.amount}` : '—'}
                    </span>
                    <div
                      style={{ height: `${Math.max(bar.height, 8)}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                        bar.amount > 0
                          ? 'bg-[#6E8B67] hover:bg-[#587352] shadow-2xs'
                          : 'bg-[#E8E2D5]'
                      }`}
                    />
                    <span className="text-[11px] font-semibold text-[#524E47] mt-1">
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooperative Split Pill */}
            <div className="p-3 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl flex items-center justify-between text-xs">
              <span className="text-[#524E47]">
                Cooperative Revenue Model: <strong className="text-[#364A32]">70% Worker</strong> · 5% Society · 25% Solidarity Fund
              </span>
              <span className="font-mono text-[#77736B] text-[11px]">Fair Gig Standard</span>
            </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="p-5 sm:p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#537895]" />
                <h3 className="text-sm font-bold text-[#292824]">Recent Payments</h3>
              </div>
              <span className="text-xs text-[#77736B]">Direct IMPS / UPI Transfers</span>
            </div>

            <div className="space-y-2.5">
              {displayedPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl hover:border-[#CFDDD0] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        p.status === 'paid' ? 'bg-[#E6ECE4]' : 'bg-[#FAEDE8]'
                      }`}
                    >
                      {p.status === 'paid' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#6E8B67]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#80432E]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#292824] block">{p.serviceType}</span>
                      <span className="text-[10px] text-[#77736B]">
                        Job #{p.jobId} · {p.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-[#292824] block">₹{p.amount}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'paid' ? 'bg-[#E6ECE4] text-[#364A32]' : 'bg-[#FAEDE8] text-[#80432E]'
                      }`}
                    >
                      {p.status === 'paid' ? 'Paid ✓' : 'Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* View Payment History → */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#77736B]">
                Showing {displayedPayments.length} of {earnings.recentPayments.length} transactions
              </span>
              <button
                type="button"
                onClick={() => setShowAllPayments(!showAllPayments)}
                className="text-xs font-bold text-[#537895] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showAllPayments ? 'Show Less' : 'View Payment History →'}</span>
              </button>
            </div>
          </div>

          {/* Person 3 Backend Note */}
          <div className="flex items-start gap-3 p-4 bg-[#E4EDF4] border border-[#B8CBDD] rounded-2xl text-xs text-[#263D50]">
            <AlertCircle className="w-4 h-4 text-[#324F66] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Payment & Settlement Integration Point (Person 3)</p>
              <p className="text-[11px] text-[#537895] mt-0.5">
                Mock financial data currently displayed. Person 3 will integrate live escrow disbursals and UPI split webhook via <span className="font-mono">/api/worker/earnings</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SOS MODAL */}
      {sosJob && (
        <WorkerSOSModal isOpen={sosJob !== null} onClose={() => setSosJob(null)} job={sosJob} />
      )}

      {/* JOB VERIFICATION MODAL */}
      <Modal
        isOpen={verificationJob !== null}
        onClose={() => setVerificationJob(null)}
        title="Job Verification"
        subtitle={verificationJob?.service}
        maxWidth="md"
      >
        <div className="space-y-4">
          <input
            ref={verificationBeforeInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => setVerificationBeforePhoto(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
          <input
            ref={verificationAfterInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => setVerificationAfterPhoto(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Before Photo */}
            <div className="border-2 border-dashed border-[#B8CBDD] rounded-2xl p-3 text-center space-y-2 bg-[#FAF7F2] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#292824] block mb-2">Before Photo</span>
                {verificationBeforePhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#B8CBDD]">
                    <img
                      src={verificationBeforePhoto}
                      alt="Before repair preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-[#445D3E] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Recorded
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => verificationBeforeInputRef.current?.click()}
                    className="h-36 rounded-xl border border-dashed border-[#D8D3C8] bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#F3EEE4] transition-colors p-2"
                  >
                    <ImageIcon className="w-7 h-7 text-[#537895] opacity-60" />
                    <span className="text-[11px] text-[#77736B]">Tap to capture or upload before photo</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => verificationBeforeInputRef.current?.click()}
                className="w-full px-3 py-1.5 bg-[#FCF9F3] border border-[#E8E2D5] text-xs font-bold rounded-xl text-[#292824] cursor-pointer hover:bg-[#F3EEE4] flex items-center justify-center gap-1.5"
              >
                {verificationBeforePhoto ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#537895]" />
                    Retake / Change
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-[#537895]" />
                    Upload Before
                  </>
                )}
              </button>
            </div>

            {/* After Photo */}
            <div className="border-2 border-dashed border-[#CFDDD0] rounded-2xl p-3 text-center space-y-2 bg-[#FAF7F2] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#292824] block mb-2">After Photo</span>
                {verificationAfterPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#CFDDD0]">
                    <img
                      src={verificationAfterPhoto}
                      alt="After repair preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-[#445D3E] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Recorded
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => verificationAfterInputRef.current?.click()}
                    className="h-36 rounded-xl border border-dashed border-[#CFDDD0] bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#EEF3EC] transition-colors p-2"
                  >
                    <ImageIcon className="w-7 h-7 text-[#6E8B67] opacity-60" />
                    <span className="text-[11px] text-[#77736B]">Tap to capture or upload after photo</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => verificationAfterInputRef.current?.click()}
                className="w-full px-3 py-1.5 bg-[#6E8B67] text-xs font-bold rounded-xl text-white cursor-pointer hover:bg-[#587352] flex items-center justify-center gap-1.5"
              >
                {verificationAfterPhoto ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retake / Change
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    Upload After
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
            <Button variant="subtle" size="sm" onClick={() => setVerificationJob(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setVerificationJob(null);
                showToast({
                  title: 'Verification Proof Saved',
                  message: 'Quality check saved. Society manager notified.',
                  type: 'success',
                });
              }}
            >
              Submit Quality Proof
            </Button>
          </div>
        </div>
      </Modal>

      {/* JOB DETAILS QUICK MODAL */}
      <Modal
        isOpen={detailsJobId !== null}
        onClose={() => setDetailsJobId(null)}
        title="Assignment Details"
        subtitle={`Reference #${detailsJobId}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-[#77736B]">Assigned Job:</span>
              <strong className="text-[#292824]">Standard Trade Assignment</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77736B]">Location:</span>
              <strong className="text-[#292824]">Green Residency Society</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77736B]">Settlement Share:</span>
              <strong className="text-[#445D3E]">70% Guaranteed Member Net</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77736B]">Arrival Rule:</span>
              <strong className="text-[#292824]">Must request 4-digit resident OTP upon arrival</strong>
            </div>
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setDetailsJobId(null)}>
            Close Details
          </Button>
        </div>
      </Modal>
    </div>
  );
};

function EmptyJobsState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Card className="p-10 text-center bg-[#FCF9F3] border-[#E8E2D5] space-y-2">
      <div className="mx-auto w-10 h-10 flex items-center justify-center">{icon}</div>
      <h3 className="text-sm font-bold text-[#292824]">{title}</h3>
      <p className="text-xs text-[#77736B] max-w-sm mx-auto">{subtitle}</p>
    </Card>
  );
}
