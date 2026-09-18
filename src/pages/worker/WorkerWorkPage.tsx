import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { WorkerSOSModal } from './WorkerSOSModal';
import {
  HardHat,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Phone,
  Navigation,
  MapPin,
  KeyRound,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Star,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface WorkerWorkPageProps {
  onOpenJobExecution?: (booking: Booking) => void;
}

type WorkerTabType = 'all' | 'active' | 'pending' | 'completed' | 'earnings';

export const WorkerWorkPage: React.FC<WorkerWorkPageProps> = ({ onOpenJobExecution }) => {
  const { currentUser, bookings, updateBookingState, verifyOTPAndStartJob } = useCooperativeStore();
  const [activeTab, setActiveTab] = useState<WorkerTabType>('all');
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});

  // Worker assigned bookings
  const workerBookings = bookings.filter((b) => b.matchedWorkerId === currentUser.id || b.matchedWorkerId === 'w_rahul');

  const activeJobs = workerBookings.filter((b) =>
    ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.state)
  );

  const pendingJobs = workerBookings.filter((b) =>
    ['PENDING_WORKER_ACCEPTANCE', 'CONFIRMED'].includes(b.state)
  );

  const completedJobs = workerBookings.filter((b) =>
    ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  const totalEarnings = completedJobs.reduce((sum, b) => sum + (b.pricing?.workerShare || 0), 0);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'active':
        return activeJobs;
      case 'pending':
        return pendingJobs;
      case 'completed':
        return completedJobs;
      case 'earnings':
        return completedJobs;
      case 'all':
      default:
        return workerBookings;
    }
  };

  const filteredList = getFilteredBookings();

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

  const getStatusBadge = (state: Booking['state']) => {
    switch (state) {
      case 'PENDING_WORKER_ACCEPTANCE':
        return <Badge variant="pending" dot>New Assignment</Badge>;
      case 'CONFIRMED':
        return <Badge variant="verified" dot>Confirmed</Badge>;
      case 'TRAVELLING':
        return <Badge variant="urgent" dot>En Route</Badge>;
      case 'ARRIVED':
        return <Badge variant="verified" dot>Arrived on Site</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="coop" dot>Work in Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="completed">Completed</Badge>;
      case 'PAID':
        return <Badge variant="completed">Settled</Badge>;
      case 'RATED':
        return <Badge variant="verified">Rated 5.0 ★</Badge>;
      default:
        return <Badge variant="neutral">{state}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header & Worker KPIs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292824] tracking-tight">
              My Work & Job Ledger
            </h1>
            <p className="text-xs sm:text-sm text-[#77736B] mt-1">
              Active assignments, on-site execution, OTP arrivals, and 70% direct cooperative earnings.
            </p>
          </div>
          <Badge variant="urgent" size="md">
            <HardHat className="w-4 h-4 mr-1 text-[#324F66]" />
            Trade Specialist Desk
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5]">
            <span className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider block">Active Jobs</span>
            <span className="text-2xl font-bold font-mono text-[#292824] mt-1 block">{activeJobs.length}</span>
            <span className="text-[11px] text-[#324F66] font-medium mt-0.5 block">Immediate dispatch</span>
          </Card>
          <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5]">
            <span className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-bold font-mono text-[#292824] mt-1 block">{completedJobs.length}</span>
            <span className="text-[11px] text-[#445D3E] font-medium mt-0.5 block">100% Quality rate</span>
          </Card>
          <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5]">
            <span className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider block">Earned Net (70%)</span>
            <span className="text-2xl font-bold font-mono text-[#445D3E] mt-1 block">₹{totalEarnings}</span>
            <span className="text-[11px] text-[#445D3E] font-medium mt-0.5 block">Direct bank payout</span>
          </Card>
          <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5]">
            <span className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider block">Member Rating</span>
            <span className="text-2xl font-bold font-mono text-[#80432E] mt-1 block flex items-center gap-1">
              <span>4.95</span>
              <Star className="w-5 h-5 fill-[#B37055] text-[#B37055]" />
            </span>
            <span className="text-[11px] text-[#77736B] font-medium mt-0.5 block">Green Residency tier</span>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#E8E2D5]">
        {[
          { id: 'all', label: 'All Jobs', count: workerBookings.length },
          { id: 'active', label: 'Active', count: activeJobs.length },
          { id: 'pending', label: 'New / Pending', count: pendingJobs.length },
          { id: 'completed', label: 'Completed', count: completedJobs.length },
          { id: 'earnings', label: 'Earnings & Split' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkerTabType)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#292824] text-[#FAF7F2] shadow-xs'
                  : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
              }`}
            >
              {tab.label} {tab.count !== undefined && <>(<span className="font-mono">{tab.count}</span>)</>}
            </button>
          );
        })}
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <Card className="p-12 text-center bg-[#FCF9F3] border-[#E8E2D5] space-y-3">
            <HardHat className="w-10 h-10 text-[#9A958B] mx-auto" />
            <h3 className="text-base font-bold text-[#292824]">No jobs in this view</h3>
            <p className="text-xs text-[#77736B] max-w-sm mx-auto">
              Your availability is currently active. The cooperative fair-dispatch engine will assign nearby society requests.
            </p>
          </Card>
        ) : (
          filteredList.map((job) => {
            const isActive = ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(job.state);

            return (
              <Card
                key={job.id}
                className="p-5 sm:p-6 border-[#E8E2D5] bg-[#FCF9F3] hover:border-[#CFDDD0] transition-all space-y-4 shadow-card"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#324F66] bg-[#E4EDF4] px-2.5 py-0.5 rounded-md border border-[#B8CBDD]">
                        {job.serviceCategory}
                      </span>
                      {getStatusBadge(job.state)}
                      <span className="text-xs font-mono text-[#9A958B]">#{job.id}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#292824]">{job.problemType}</h3>
                  </div>

                  {/* Right: Worker SOS (during active job) + Payout */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                    {isActive && (
                      <button
                        onClick={() => setSosJob(job)}
                        className="px-3 py-1.5 bg-[#FAEDE8] hover:bg-[#F6DDD4] border border-[#F3C5B8] text-[#C93B2B] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer animate-pulse"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 text-[#C93B2B]" />
                        <span>Worker SOS</span>
                      </button>
                    )}

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#445D3E] block">Worker Net: ₹{job.pricing?.workerShare}</span>
                      <span className="text-[10px] text-[#9A958B] block">Total: ₹{job.pricing?.total}</span>
                    </div>
                  </div>
                </div>

                {/* Location & Customer Info */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs text-[#524E47]">
                    <MapPin className="w-4 h-4 text-[#80432E] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#292824] block">{job.customerAddress || 'Green Residency, Flat 402'}</strong>
                      <span className="text-[#77736B]">Customer: {job.customerName} ({job.customerPhone})</span>
                    </div>
                  </div>
                  {job.details && (
                    <p className="text-xs text-[#77736B] pl-6 italic">
                      "{job.details}"
                    </p>
                  )}
                </div>

                {/* State Machine Step Progression */}
                <div className="pt-2 border-t border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Calling Customer ${job.customerName}: ${job.customerPhone}`)}
                      leftIcon={<Phone className="w-3.5 h-3.5" />}
                    >
                      Call Customer
                    </Button>
                    {onOpenJobExecution && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenJobExecution(job)}
                      >
                        Job Desk View
                      </Button>
                    )}
                  </div>

                  {/* Progressive Action Button based on state */}
                  <div className="flex items-center gap-2">
                    {job.state === 'PENDING_WORKER_ACCEPTANCE' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateBookingState(job.id, 'CONFIRMED')}
                      >
                        Accept Assignment
                      </Button>
                    )}

                    {job.state === 'CONFIRMED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateBookingState(job.id, 'TRAVELLING')}
                        leftIcon={<Navigation className="w-3.5 h-3.5" />}
                      >
                        Start Travel
                      </Button>
                    )}

                    {job.state === 'TRAVELLING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateBookingState(job.id, 'ARRIVED')}
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
                          className="w-28 px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
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
                        onClick={() => updateBookingState(job.id, 'COMPLETED')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Mark Job Complete
                      </Button>
                    )}

                    {['COMPLETED', 'PAID', 'RATED'].includes(job.state) && (
                      <Badge variant="completed" size="sm">
                        Job Successfully Closed
                      </Badge>
                    )}
                  </div>
                </div>

                {otpErrors[job.id] && (
                  <p className="text-xs text-[#C93B2B] font-semibold">{otpErrors[job.id]}</p>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Worker SOS Modal */}
      {sosJob && (
        <WorkerSOSModal
          isOpen={sosJob !== null}
          onClose={() => setSosJob(null)}
          job={sosJob}
        />
      )}
    </div>
  );
};
