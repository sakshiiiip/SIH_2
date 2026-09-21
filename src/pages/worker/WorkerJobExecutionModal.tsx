import React, { useState } from 'react';
import { Booking } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  KeyRound,
  Play,
  Camera,
  AlertTriangle,
  Clock,
  Coffee,
  Wrench,
  Star,
  Timer,
  X,
} from 'lucide-react';

// ─── Break reason options ─────────────────────────────────────────────────────

const BREAK_DURATIONS = [15, 30, 45] as const;
type BreakDuration = typeof BREAK_DURATIONS[number];

const BREAK_REASONS = [
  { label: 'Lunch Break',        icon: <Coffee className="w-3.5 h-3.5" /> },
  { label: 'Sourcing Materials', icon: <Wrench  className="w-3.5 h-3.5" /> },
  { label: 'Sourcing Parts',     icon: <Wrench  className="w-3.5 h-3.5" /> },
  { label: 'Prayer Break',       icon: <Star    className="w-3.5 h-3.5" /> },
  { label: 'Personal Break',     icon: <Coffee  className="w-3.5 h-3.5" /> },
] as const;

// ─── Break picker modal ───────────────────────────────────────────────────────

interface BreakPickerProps {
  onConfirm: (durationMins: BreakDuration, reason?: string) => void;
  onCancel: () => void;
}

function BreakPicker({ onConfirm, onCancel }: BreakPickerProps) {
  const [duration, setDuration]     = useState<BreakDuration>(15);
  const [reason, setReason]         = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = reason === '__custom__' ? customReason.trim() || undefined : reason || undefined;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full sm:max-w-sm bg-[#FAF8F4] sm:rounded-3xl rounded-t-3xl shadow-float overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-amber-700" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#292824]">Take a Break</p>
              <p className="text-[11px] text-[#77736B]">Customer will be notified automatically</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="w-7 h-7 rounded-lg hover:bg-[#F3EEE4] flex items-center justify-center cursor-pointer transition-colors">
            <X className="w-4 h-4 text-[#77736B]" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Duration selection */}
          <div>
            <p className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider mb-2">Break Duration</p>
            <div className="grid grid-cols-3 gap-2">
              {BREAK_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                    duration === d
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-[#E8E2D5] bg-white text-[#292824] hover:bg-[#F8F5EE]'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Reason selection */}
          <div>
            <p className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider mb-2">Reason (optional)</p>
            <div className="space-y-1.5">
              {BREAK_REASONS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setReason(reason === r.label ? '' : r.label)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                    reason === r.label
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-[#E8E2D5] bg-white text-[#292824] hover:bg-[#F8F5EE]'
                  }`}
                >
                  <span className={reason === r.label ? 'text-amber-600' : 'text-[#77736B]'}>{r.icon}</span>
                  {r.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReason(reason === '__custom__' ? '' : '__custom__')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                  reason === '__custom__'
                    ? 'border-amber-400 bg-amber-50 text-amber-900'
                    : 'border-[#E8E2D5] bg-white text-[#292824] hover:bg-[#F8F5EE]'
                }`}
              >
                <Timer className={`w-3.5 h-3.5 ${reason === '__custom__' ? 'text-amber-600' : 'text-[#77736B]'}`} />
                Other…
              </button>
              {reason === '__custom__' && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Describe reason…"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-amber-50/50"
                />
              )}
            </div>
          </div>

          {/* Confirm */}
          <button
            type="button"
            onClick={() => onConfirm(duration, finalReason)}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Coffee className="w-4 h-4" />
            Start {duration}-Minute Break
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface WorkerJobExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const WorkerJobExecutionModal: React.FC<WorkerJobExecutionModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const {
    updateBookingState,
    verifyBookingOTP,
    completeBooking,
    startWorkerBreak,
    endWorkerBreak,
  } = useCooperativeStore();

  const [enteredOtp, setEnteredOtp]       = useState<string>('');
  const [otpError, setOtpError]           = useState<string>('');
  const [workNotes, setWorkNotes]         = useState<string>('');
  const [photoAttached, setPhotoAttached] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting]   = useState<boolean>(false);
  const [showBreakPicker, setShowBreakPicker] = useState(false);

  if (!isOpen || !booking) return null;

  const isOnBreak = booking.state === 'WORKER_ON_BREAK';

  // ── Transitions ─────────────────────────────────────────────────────────────
  const handleStartTravelling   = () => updateBookingState(booking.id, 'TRAVELLING');
  const handleConfirmArrival    = () => updateBookingState(booking.id, 'ARRIVED');

  const handleVerifyOtpAndStart = () => {
    setOtpError('');
    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setOtpError('Please enter the 4-digit code provided by the customer.');
      return;
    }
    const success = verifyBookingOTP(booking.id, enteredOtp);
    if (!success) {
      setOtpError('Incorrect OTP. Please ask the customer to confirm the code shown on their app.');
    } else {
      setEnteredOtp('');
    }
  };

  const handleCompleteJob = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      completeBooking(
        booking.id,
        workNotes || 'Inspected connection, replaced worn gasket, and pressure-tested line.',
        photoAttached
          ? ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400']
          : [],
      );
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handleBreakConfirm = (durationMins: BreakDuration, reason?: string) => {
    setShowBreakPicker(false);
    startWorkerBreak(booking.id, durationMins, reason);
  };

  const handleResumeWork = () => endWorkerBreak(booking.id);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Job Execution Center"
        subtitle={<span>Booking <span className="font-mono font-bold">#{booking.id}</span> · {booking.serviceCategory}</span>}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Customer Location & Problem Card */}
          <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5] space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider">
                  Customer &amp; Destination
                </span>
                <h4 className="text-base font-bold text-[#292824] mt-0.5">
                  {booking.customerName}
                </h4>
                <p className="text-xs text-[#524E47] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6E8B67]" />
                  <span>{booking.customerAddress} ({booking.societyName})</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Navigating via GPS to ${booking.customerAddress}...`)}
                leftIcon={<Navigation className="w-3.5 h-3.5 text-[#6E8B67]" />}
              >
                GPS Map
              </Button>
            </div>

            <div className="border-t border-[#E8E2D5] pt-2 flex items-center justify-between text-xs">
              <span className="text-[#524E47]">
                <strong>Requirement:</strong> {booking.problemType}
              </span>
              <span className="text-[#445D3E] font-bold">
                Worker Payout: <span className="font-mono">₹{booking.pricing.workerShare}</span>
              </span>
            </div>
          </Card>

          {/* CURRENT STEP CONTROLS */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Execution Stage: {booking.state}
              </span>
              <Badge variant={isOnBreak ? 'urgent' : 'coop'}>{booking.state}</Badge>
            </div>

            {/* STATE 1: CONFIRMED → START TRAVELLING */}
            {booking.state === 'CONFIRMED' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  You have accepted this job. Tap below when you begin travelling to notify the resident.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleStartTravelling}
                  leftIcon={<Navigation className="w-5 h-5" />}
                >
                  Start Travelling to Customer
                </Button>
              </div>
            )}

            {/* STATE 2: TRAVELLING → CONFIRM ARRIVAL */}
            {booking.state === 'TRAVELLING' && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  Customer has been notified that you are en route.
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirmArrival}
                  leftIcon={<MapPin className="w-5 h-5" />}
                >
                  Confirm Arrival At Society / Doorstep
                </Button>
              </div>
            )}

            {/* STATE 3: ARRIVED → OTP VERIFICATION */}
            {booking.state === 'ARRIVED' && (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                    <KeyRound className="w-4 h-4 text-teal-700" />
                    <span>Customer 4-Digit Arrival Code</span>
                  </div>
                  <p className="text-xs text-teal-700">
                    Ask the customer for the 4-digit code shown on their Cooperative mobile screen to verify identity and unlock job execution.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Enter 4-Digit Customer Code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4829"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="flex-1 p-3.5 border border-slate-200 rounded-xl text-center text-xl font-mono font-bold tracking-widest focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <Button variant="primary" size="md" onClick={handleVerifyOtpAndStart}>
                      Verify &amp; Begin Work
                    </Button>
                  </div>
                  {otpError && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STATE 4: IN_PROGRESS → Work controls + Take a Break */}
            {booking.state === 'IN_PROGRESS' && (
              <div className="space-y-4">
                {/* Status row + Take a Break CTA */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Work Underway (OTP Verified)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBreakPicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-[0.97]"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Take a Break
                  </button>
                </div>

                {/* Work notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Work Notes &amp; Parts Replaced:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Replaced faulty silicone seal on hot water inlet. Pressure checked."
                    value={workNotes}
                    onChange={(e) => setWorkNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
                  />
                </div>

                {/* Photo attachment */}
                <button
                  onClick={() => setPhotoAttached(!photoAttached)}
                  className={`w-full p-3 rounded-xl border text-xs flex items-center justify-center gap-2 transition-colors ${
                    photoAttached
                      ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {photoAttached
                      ? '✓ Post-repair completion photo captured (Tap to re-take)'
                      : 'Attach Proof of Completion Photo'}
                  </span>
                </button>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCompleteJob}
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Mark Job as Completed
                </Button>
              </div>
            )}

            {/* STATE 4b: WORKER_ON_BREAK → Resume controls */}
            {booking.state === 'WORKER_ON_BREAK' && (
              <div className="space-y-4">
                {/* Break status banner */}
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-amber-200 flex items-center justify-center shrink-0">
                      <Coffee className="w-5 h-5 text-amber-700" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-amber-900">You're on a Break</p>
                      <p className="text-[11px] text-amber-700">
                        Customer has been notified · Job paused
                      </p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      PAUSED
                    </span>
                  </div>

                  {booking.breakDetails && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/70 rounded-lg p-2 text-center border border-amber-200">
                        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Duration</p>
                        <p className="font-bold text-amber-900 mt-0.5">
                          {booking.breakDetails.estimatedDurationMins} min
                        </p>
                      </div>
                      {booking.breakDetails.reason && (
                        <div className="bg-white/70 rounded-lg p-2 text-center border border-amber-200">
                          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Reason</p>
                          <p className="font-bold text-amber-900 mt-0.5 truncate">{booking.breakDetails.reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Resume button */}
                <button
                  type="button"
                  onClick={handleResumeWork}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <Play className="w-5 h-5" />
                  Resume Work
                </button>

                <p className="text-center text-[11px] text-slate-500">
                  Resuming will notify the customer that work has restarted.
                </p>
              </div>
            )}

            {/* STATE 5: COMPLETED OR BEYOND */}
            {['COMPLETED', 'PAID', 'RATED'].includes(booking.state) && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-base">
                  Job Successfully Completed!
                </h4>
                <p className="text-xs text-emerald-700">
                  Settlement of ₹{booking.pricing.workerShare} is routed to your cooperative account.
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Break picker overlay */}
      {showBreakPicker && (
        <BreakPicker
          onConfirm={handleBreakConfirm}
          onCancel={() => setShowBreakPicker(false)}
        />
      )}
    </>
  );
};
