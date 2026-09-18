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
  Pause,
  Camera,
  FileText,
  AlertTriangle,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';

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
  } = useCooperativeStore();

  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [workNotes, setWorkNotes] = useState<string>('');
  const [photoAttached, setPhotoAttached] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  // STEP TRANSITIONS
  const handleStartTravelling = () => {
    updateBookingState(booking.id, 'TRAVELLING');
  };

  const handleConfirmArrival = () => {
    updateBookingState(booking.id, 'ARRIVED');
  };

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
          : []
      );
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
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
                Customer & Destination
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
            <Badge variant="coop">{booking.state}</Badge>
          </div>

          {/* STATE 1: CONFIRMED -> START TRAVELLING */}
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

          {/* STATE 2: TRAVELLING -> CONFIRM ARRIVAL */}
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

          {/* STATE 3: ARRIVED -> CUSTOMER OTP VERIFICATION */}
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
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleVerifyOtpAndStart}
                  >
                    Verify & Begin Work
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

          {/* STATE 4: IN_PROGRESS -> TIMER, NOTES, PHOTOS, COMPLETE */}
          {booking.state === 'IN_PROGRESS' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Work Underway (OTP Verified)</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  leftIcon={isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Work Notes & Parts Replaced:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Replaced faulty silicone seal on hot water inlet. Pressure checked."
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
                />
              </div>

              <div>
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
              </div>

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
  );
};
