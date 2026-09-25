import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Booking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { JobStatusBadge } from '../../components/worker/JobStatusBadge';
import { WorkerSOSModal } from './WorkerSOSModal';
import {
  MapPin,
  Clock,
  User,
  Phone,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  Navigation,
  CheckCircle2,
  CalendarClock,
  Camera,
  KeyRound,
  Coffee,
} from 'lucide-react';
import { BreakPicker } from './WorkerJobExecutionModal';
import { BreakCountdownTimer } from '../../components/common/BreakCountdownTimer';

interface WorkerJobDetailsProps {
  jobId: string;
  onBack: () => void;
}

export const WorkerJobDetails: React.FC<WorkerJobDetailsProps> = ({ jobId, onBack }) => {
  const { t } = useTranslation();
  const {
    bookings,
    updateBookingState,
    verifyOTPAndStartJob,
    showToast,
    requestWorkerBreak,
    autoResumeWorkerBreak,
  } = useCooperativeStore();
  
  // Real booking
  const job = bookings.find((b) => b.id === jobId);

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sosJob, setSosJob] = useState<Booking | null>(null);
  const [showBreakPicker, setShowBreakPicker] = useState(false);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-[#292824]">{t('common.details', 'Job Details')}</h2>
        <p className="text-sm text-[#77736B] mt-2 mb-6">{t('common.noData', 'Job details not found.')}</p>
        <Button variant="outline" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          {t('common.back', 'Back')}
        </Button>
      </div>
    );
  }

  const isActive = ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'BREAK_REQUESTED', 'WORKER_ON_BREAK', 'WORK_RESUMED'].includes(job.state);

  const handleOtpVerify = () => {
    if (!otpInput.trim()) {
      setOtpError(t('worker.jobs.otpErrorRequired', 'Please enter the 4-digit arrival OTP'));
      return;
    }
    const success = verifyOTPAndStartJob(job.id, otpInput.trim());
    if (success) {
      setOtpError('');
      showToast({ title: t('common.success', 'OTP Verified'), message: 'Job started successfully!', type: 'success' });
    } else {
      setOtpError(t('worker.jobs.otpErrorInvalid', 'Invalid OTP code. Ask customer for flat OTP.'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in pb-24">
      {/* Header / Back */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onBack}
          className="p-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-[#292824]" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-[#292824] tracking-tight">
            Job #{job.id}
          </h1>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card overflow-hidden">
        {/* Status Banner */}
        <div className="bg-[#F3EEE4] px-4 py-3 border-b border-[#E8E2D5] flex items-center justify-between">
          <JobStatusBadge state={job.state} size="md" />
          <span className="text-sm font-bold text-[#292824]">{job.serviceCategory}</span>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#292824]">{job.problemType}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-[#524E47]">
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-[#537895]" />
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : t('worker.earnings.today', 'Today')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Badge variant={job.urgencyTier === 'EMERGENCY' ? 'emergency' : job.urgencyTier === 'URGENT' ? 'urgent' : 'neutral'} size="sm">
                    {job.urgencyTier}
                  </Badge>
                </span>
              </div>
            </div>
            
            {/* Earnings Box */}
            <div className="p-3 bg-[#EEF3EC] border border-[#CFDDD0] rounded-xl text-right sm:text-left shrink-0">
              <span className="text-[10px] font-bold uppercase text-[#527048] flex items-center gap-1 justify-end sm:justify-start">
                <DollarSign className="w-3.5 h-3.5" /> {t('worker.dashboard.estimatedNet', 'Est. Earnings')}
              </span>
              <span className="text-2xl font-bold font-mono text-[#2A3927] block">₹{job.pricing.workerShare}</span>
              <span className="text-[10px] text-[#527048]">({t('worker.dashboard.sharePercent', '70% share')})</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77736B]">{t('wizard.problemLabel', 'Problem Description')}</h3>
            <p className="text-sm text-[#292824] bg-white p-3 border border-[#E8E2D5] rounded-xl leading-relaxed">
              {job.details || 'No additional details provided by customer.'}
            </p>
          </div>

          {/* Customer & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#77736B]">{t('worker.jobExec.customerDestination', 'Customer Details')}</h3>
              <div className="flex items-center gap-3 p-3 bg-white border border-[#E8E2D5] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#E4EDF4] flex items-center justify-center text-[#2B4C68] font-bold">
                  {job.customerName.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-bold text-[#292824] block">{job.customerName}</span>
                  <div className="flex items-center gap-1 text-xs text-[#524E47] mt-0.5">
                    <Phone className="w-3 h-3" /> {job.customerPhone}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#77736B]">{t('common.address', 'Location')}</h3>
              <div className="flex items-start gap-2 p-3 bg-white border border-[#E8E2D5] rounded-xl h-[66px]">
                <MapPin className="w-4 h-4 text-[#80432E] shrink-0 mt-0.5" />
                <span className="text-sm text-[#292824] leading-snug">{job.customerAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-white px-4 py-4 border-t border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Call / SOS */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert(`Calling Customer ${job.customerName}: ${job.customerPhone}`)}
              leftIcon={<Phone className="w-4 h-4" />}
            >
              {t('worker.jobs.callCustomer', 'Call')}
            </Button>
            {isActive && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setSosJob(job)}
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                {t('worker.jobs.sos', 'SOS')}
              </Button>
            )}
          </div>

          {/* Progressive Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {job.state === 'PENDING_WORKER_ACCEPTANCE' && (
              <Button variant="primary" onClick={() => updateBookingState(job.id, 'CONFIRMED')} className="w-full sm:w-auto">
                {t('worker.jobs.acceptJob', 'Accept Job')}
              </Button>
            )}

            {job.state === 'CONFIRMED' && (
              <Button variant="primary" onClick={() => updateBookingState(job.id, 'TRAVELLING')} leftIcon={<Navigation className="w-4 h-4" />} className="w-full sm:w-auto">
                {t('worker.jobs.startTravel', 'Start Travel')}
              </Button>
            )}

            {job.state === 'TRAVELLING' && (
              <Button variant="primary" onClick={() => updateBookingState(job.id, 'ARRIVED')} leftIcon={<MapPin className="w-4 h-4" />} className="w-full sm:w-auto">
                {t('worker.jobs.iHaveArrived', 'I Have Arrived')}
              </Button>
            )}

            {job.state === 'ARRIVED' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  maxLength={4}
                  placeholder={t('worker.jobExec.otpPlaceholder', '4-digit OTP')}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-28 px-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
                />
                <Button variant="primary" onClick={handleOtpVerify} leftIcon={<KeyRound className="w-4 h-4" />} className="flex-1 sm:flex-none">
                  {t('worker.jobs.verifyStart', 'Verify OTP')}
                </Button>
              </div>
            )}

            {['IN_PROGRESS', 'WORK_RESUMED'].includes(job.state) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowBreakPicker(true)}
                  leftIcon={<Coffee className="w-4 h-4 text-amber-700" />}
                  className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800"
                >
                  {t('worker.jobExec.takeABreak', 'Take a Break')}
                </Button>
                <Button variant="outline" onClick={() => alert('Job verification photos can be captured and reviewed during active job execution.')} leftIcon={<Camera className="w-4 h-4" />} className="w-full sm:w-auto">
                  {t('worker.jobs.jobVerification', 'Verify Work')}
                </Button>
                <Button variant="primary" onClick={() => updateBookingState(job.id, 'COMPLETED')} leftIcon={<CheckCircle2 className="w-4 h-4" />} className="w-full sm:w-auto">
                  {t('worker.stepLabels.4', 'Mark Complete')}
                </Button>
              </>
            )}

            {job.state === 'BREAK_REQUESTED' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-orange-800 bg-orange-50 px-3 py-2 rounded-xl border border-orange-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span>Break Requested ({job.breakDetails?.estimatedDurationMins || 15}m) — Awaiting Customer</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBookingState(job.id, 'IN_PROGRESS')}
                >
                  Cancel
                </Button>
              </div>
            )}

            {job.state === 'WORKER_ON_BREAK' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900">On Break:</span>
                  <BreakCountdownTimer
                    startedAt={job.breakDetails?.startedAt}
                    durationMins={job.breakDetails?.estimatedDurationMins || 15}
                    onExpire={() => autoResumeWorkerBreak(job.id)}
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => autoResumeWorkerBreak(job.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {t('worker.jobExec.resumeWorkEarly', 'Resume Work Early')}
                </Button>
              </div>
            )}

            {['COMPLETED', 'PAID', 'RATED'].includes(job.state) && (
              <Badge variant="completed" size="md">
                {t('worker.jobs.jobClosed', 'Job Successfully Closed')}
              </Badge>
            )}
          </div>
        </div>

        {otpError && (
          <div className="bg-[#FAEBEB] px-4 py-2 border-t border-[#F4D7D7]">
            <p className="text-xs text-[#C93B2B] font-semibold text-center">{otpError}</p>
          </div>
        )}
      </div>

      {sosJob && (
        <WorkerSOSModal isOpen={sosJob !== null} onClose={() => setSosJob(null)} job={sosJob} />
      )}

      {showBreakPicker && (
        <BreakPicker
          onConfirm={(duration, reason) => {
            requestWorkerBreak(job.id, duration, reason);
            setShowBreakPicker(false);
          }}
          onCancel={() => setShowBreakPicker(false)}
        />
      )}
    </div>
  );
};
