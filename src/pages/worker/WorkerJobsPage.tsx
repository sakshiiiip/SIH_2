import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { JobStatusBadge } from '../../components/worker/JobStatusBadge';
import { WorkerSOSModal } from './WorkerSOSModal';
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
} from 'lucide-react';

type JobTab = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

interface WorkerJobsPageProps {
  onOpenJobDetails?: (jobId: string) => void;
}

export const WorkerJobsPage: React.FC<WorkerJobsPageProps> = ({ onOpenJobDetails }) => {
  const { currentUser, bookings, updateBookingState, verifyOTPAndStartJob } = useCooperativeStore();
  const [activeTab, setActiveTab] = useState<JobTab>('upcoming');
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});

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
    } else {
      setOtpErrors({ ...otpErrors, [job.id]: 'Invalid OTP code. Ask customer for flat OTP.' });
    }
  };

  const TABS: { id: JobTab; label: string; count: number }[] = [
    { id: 'upcoming',    label: 'Upcoming',    count: storeUpcoming.length + MOCK_UPCOMING_JOBS.length },
    { id: 'in_progress', label: 'In Progress', count: storeInProgress.length + 1 },
    { id: 'completed',   label: 'Completed',   count: storeCompleted.length + MOCK_COMPLETED_JOBS.length },
    { id: 'cancelled',   label: 'Cancelled',   count: MOCK_CANCELLED_JOBS.length },
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
          {storeUpcoming.length === 0 && MOCK_UPCOMING_JOBS.length === 0 ? (
            <EmptyState icon={<Clock />} message="No upcoming jobs" sub="New accepted jobs will appear here." />
          ) : (
            <>
              {/* Store-sourced upcoming jobs */}
              {storeUpcoming.map((job) => (
                <UpcomingJobCard
                  key={job.id}
                  jobId={job.id}
                  serviceType={job.serviceCategory}
                  problemType={job.problemType}
                  customerName={job.customerName}
                  address={job.customerAddress}
                  date="Scheduled"
                  time={job.state}
                  earnings={job.pricing.workerShare}
                  status={job.state}
                  onStartJob={() => updateBookingState(job.id, 'TRAVELLING')}
                  onViewDetails={() => onOpenJobDetails?.(job.id)}
                />
              ))}
              {/* Mock upcoming jobs */}
              {MOCK_UPCOMING_JOBS.map((job) => (
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
          {storeInProgress.length === 0 && (
            /* Mock in-progress job */
            <InProgressJobCard
              job={MOCK_IN_PROGRESS_JOB}
              onSOS={() => {}} // Would open SOS modal — Person 5 support
            />
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
                      {/* Job Verification — Integration point for Person 2 */}
                      <Button variant="outline" size="sm" leftIcon={<Camera className="w-3.5 h-3.5" />}
                        onClick={() => alert('📸 Job Verification — Person 2\'s Before/After photo module will connect here.')}>
                        Job Verification
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => updateBookingState(job.id, 'COMPLETED')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                        Mark Complete
                      </Button>
                    </>
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
          {storeCompleted.length === 0 && MOCK_COMPLETED_JOBS.length === 0 ? (
            <EmptyState icon={<CheckCircle2 />} message="No completed jobs yet" sub="Completed jobs will appear here." />
          ) : (
            <>
              {storeCompleted.map((job) => (
                <CompletedJobCard
                  key={job.id}
                  jobId={job.id}
                  serviceType={job.serviceCategory}
                  problemType={job.problemType}
                  customerName={job.customerName}
                  date={job.completedAt || job.updatedAt}
                  earnings={job.pricing.workerShare}
                  paymentStatus={['PAID', 'RATED'].includes(job.state) ? 'paid' : 'pending'}
                  rating={job.rating?.stars}
                />
              ))}
              {MOCK_COMPLETED_JOBS.map((job) => (
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
          {MOCK_CANCELLED_JOBS.length === 0 ? (
            <EmptyState icon={<XCircle />} message="No cancelled jobs" sub="Cancelled jobs will appear here." />
          ) : (
            MOCK_CANCELLED_JOBS.map((job) => (
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

      {sosJob && (
        <WorkerSOSModal isOpen={sosJob !== null} onClose={() => setSosJob(null)} job={sosJob} />
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
  date, time, earnings, status, onStartJob, onViewDetails,
}: {
  jobId: string; serviceType: string; problemType: string; customerName: string;
  address: string; date: string; time: string; earnings: number;
  status: string; onStartJob?: () => void; onViewDetails?: () => void;
}) {
  return (
    <Card className="p-5 border-[#B8CBDD] bg-[#F4F8FC] shadow-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
              {serviceType}
            </span>
            <JobStatusBadge state={status as 'upcoming'} />
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
        {/* ============================================================
            PERSON 2 INTEGRATION POINT
            Replace this alert with a call to Person 2's
            job verification / before-after image module.
            ============================================================ */}
        <button
          type="button"
          onClick={() => alert('📸 Job Verification — Person 2\'s Before/After photo verification module will connect here.')}
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
