import React, { useState, useRef } from 'react';
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
  AlertTriangle,
  Clock,
  Upload,
  ArrowRight,
  ImageIcon,
  Sparkles,
} from 'lucide-react';

interface WorkerJobExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

// Step indices for IN_PROGRESS micro-wizard
type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Before Photo',
  2: 'Start Work',
  3: 'After Photo',
  4: 'Mark Complete',
};

export const WorkerJobExecutionModal: React.FC<WorkerJobExecutionModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const {
    updateBookingState,
    verifyBookingOTP,
    completeBooking,
    uploadJobPhotos,
  } = useCooperativeStore();

  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [workNotes, setWorkNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 4-step wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [beforePreview, setBeforePreview] = useState<string | null>(booking?.beforeImage || null);
  const [afterPreview, setAfterPreview] = useState<string | null>(booking?.afterImage || null);
  
  // Separate camera and gallery input refs
  const beforeCameraInputRef = useRef<HTMLInputElement>(null);
  const beforeGalleryInputRef = useRef<HTMLInputElement>(null);
  const afterCameraInputRef = useRef<HTMLInputElement>(null);
  const afterGalleryInputRef = useRef<HTMLInputElement>(null);

  // Sync previews if booking changes
  React.useEffect(() => {
    if (booking) {
      if (booking.beforeImage && !beforePreview) setBeforePreview(booking.beforeImage);
      if (booking.afterImage && !afterPreview) setAfterPreview(booking.afterImage);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  // ─── Step handlers ────────────────────────────────────────────────────────

  const handleStartTravelling = () => updateBookingState(booking.id, 'TRAVELLING');
  const handleConfirmArrival = () => updateBookingState(booking.id, 'ARRIVED');

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
      setWizardStep(1); // reset wizard when entering IN_PROGRESS
    }
  };

  const handleBeforePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBeforePreview(url);
    uploadJobPhotos(booking.id, { beforeImage: url });
  };

  const handleAfterPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAfterPreview(url);
    uploadJobPhotos(booking.id, { afterImage: url });
  };

  const handleCompleteJob = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      completeBooking(
        booking.id,
        workNotes || 'Job completed. Before and after photos attached.',
        [beforePreview, afterPreview].filter(Boolean) as string[]
      );
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  // ─── Wizard step progress indicator ──────────────────────────────────────
  const StepProgress = () => (
    <div className="flex items-center justify-center gap-0 mb-5">
      {([1, 2, 3, 4] as WizardStep[]).map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                wizardStep > step
                  ? 'bg-[#6E8B67] border-[#6E8B67] text-white'
                  : wizardStep === step
                  ? 'bg-[#445D3E] border-[#445D3E] text-white scale-110'
                  : 'bg-[#F3EEE4] border-[#D8D3C8] text-[#77736B]'
              }`}
            >
              {wizardStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                wizardStep === step ? 'text-[#445D3E]' : 'text-[#77736B]'
              }`}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
          {idx < 3 && (
            <div
              className={`h-0.5 w-8 sm:w-12 mb-4 transition-colors ${
                wizardStep > step ? 'bg-[#6E8B67]' : 'bg-[#D8D3C8]'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // ─── Dual Photo Upload Tile (Camera + Device Gallery) ─────────────────────
  const PhotoUploadTile = ({
    label,
    preview,
    cameraInputRef,
    galleryInputRef,
    onCapture,
  }: {
    label: string;
    preview: string | null;
    cameraInputRef: React.RefObject<HTMLInputElement | null>;
    galleryInputRef: React.RefObject<HTMLInputElement | null>;
    onCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-3">
      {/* Hidden file inputs: direct camera vs device gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onCapture}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCapture}
      />

      {/* Visual Image Preview Box */}
      <div
        className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
          preview
            ? 'border-[#6E8B67] bg-[#F0F4EF]'
            : 'border-dashed border-[#D8D3C8] bg-[#F3EEE4]'
        }`}
      >
        {preview ? (
          <div className="relative group">
            <img src={preview} alt={label} className="w-full h-48 object-cover" />
            <div className="absolute top-2 left-2 bg-[#445D3E] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{label} Recorded</span>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-[#292824] rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#445D3E]" />
                Retake
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-[#292824] rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#537895]" />
                Replace
              </button>
            </div>
          </div>
        ) : (
          <div className="h-44 flex flex-col items-center justify-center gap-2 text-[#77736B] p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E8E2D5] flex items-center justify-center text-[#524E47]">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#292824] block">{label}</span>
              <span className="text-[11px] text-[#77736B]">
                Take a direct snapshot with camera or select an existing photo
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Explicit Option Buttons: Camera vs Device Gallery */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="px-3 py-2.5 bg-[#445D3E] hover:bg-[#33472F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>{preview ? 'Retake Camera' : 'Take Photo (Camera)'}</span>
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="px-3 py-2.5 bg-[#FCF9F3] hover:bg-[#F3EEE4] text-[#292824] border border-[#E8E2D5] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4 text-[#537895]" />
          <span>{preview ? 'Change from Gallery' : 'Upload from Device'}</span>
        </button>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
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

          {/* STATE 4: IN_PROGRESS -> 4-STEP WIZARD */}
          {booking.state === 'IN_PROGRESS' && (
            <div className="space-y-5">
              {/* Pause/Resume bar */}
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

              {/* Step progress */}
              <StepProgress />

              {/* ── STEP 1: Before Photo ── */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47]">
                    <strong className="text-[#292824]">Step 1 of 4 — Before Photo</strong>
                    <br />Capture the work area <em>before</em> starting any repairs. This protects both you and the customer.
                  </div>
                  <PhotoUploadTile
                    label="Before Photo"
                    preview={beforePreview}
                    cameraInputRef={beforeCameraInputRef}
                    galleryInputRef={beforeGalleryInputRef}
                    onCapture={handleBeforePhotoSelected}
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => setWizardStep(2)}
                    disabled={!beforePreview}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {beforePreview ? 'Before Photo Captured — Continue' : 'Capture Before Photo to Proceed'}
                  </Button>
                </div>
              )}

              {/* ── STEP 2: Confirm Start ── */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                    <strong>Step 2 of 4 — Begin Work</strong>
                    <br />Before photo recorded. You're ready to begin the repair. Tap below to officially start.
                  </div>
                  {/* Thumbnail of before photo */}
                  {beforePreview && (
                    <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5]">
                      <img src={beforePreview} alt="Before" className="w-full h-28 object-cover" />
                      <div className="absolute top-2 left-2 bg-[#6E8B67] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        ✓ Before
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Work Notes & Parts Replaced (optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Replaced faulty silicone seal on hot water inlet. Pressure checked."
                      value={workNotes}
                      onChange={(e) => setWorkNotes(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => setWizardStep(3)}
                    leftIcon={<Clock className="w-4 h-4" />}
                  >
                    Start Work Now
                  </Button>
                </div>
              )}

              {/* ── STEP 3: After Photo ── */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <strong>Step 3 of 4 — After Photo</strong>
                    <br />Capture the completed repair. This serves as proof of work quality for verification.
                  </div>
                  {/* Side-by-side thumbnails */}
                  <div className="grid grid-cols-2 gap-2">
                    {beforePreview && (
                      <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5]">
                        <img src={beforePreview} alt="Before" className="w-full h-24 object-cover" />
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Before
                        </div>
                      </div>
                    )}
                    <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#D8D3C8] bg-[#F3EEE4] flex items-center justify-center h-24">
                      <div className="text-center text-[#77736B]">
                        <ImageIcon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-[9px] font-semibold">After</span>
                      </div>
                    </div>
                  </div>
                  <PhotoUploadTile
                    label="After Photo"
                    preview={afterPreview}
                    cameraInputRef={afterCameraInputRef}
                    galleryInputRef={afterGalleryInputRef}
                    onCapture={handleAfterPhotoSelected}
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => setWizardStep(4)}
                    disabled={!afterPreview}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {afterPreview ? 'After Photo Captured — Continue' : 'Capture After Photo to Proceed'}
                  </Button>
                </div>
              )}

              {/* ── STEP 4: Mark Complete ── */}
              {wizardStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <strong>Step 4 of 4 — Mark as Completed</strong>
                    <br />Both photos captured. Review and submit the job. It will enter the manager verification queue.
                  </div>

                  {/* Before/After comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    {beforePreview && (
                      <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5]">
                        <img src={beforePreview} alt="Before" className="w-full h-32 object-cover" />
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Before
                        </div>
                      </div>
                    )}
                    {afterPreview && (
                      <div className="relative rounded-xl overflow-hidden border border-[#6E8B67]">
                        <img src={afterPreview} alt="After" className="w-full h-32 object-cover" />
                        <div className="absolute bottom-1 left-1 bg-[#6E8B67] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          After ✓
                        </div>
                      </div>
                    )}
                  </div>

                  {workNotes && (
                    <div className="p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47]">
                      <strong className="text-[#292824]">Notes: </strong>{workNotes}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleCompleteJob}
                    isLoading={isSubmitting}
                    leftIcon={<Sparkles className="w-5 h-5" />}
                  >
                    Submit for Verification
                  </Button>
                  <p className="text-center text-[10px] text-[#77736B]">
                    Job will enter the manager verification queue. Customer will be notified.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STATE 5: AWAITING_VERIFICATION */}
          {booking.state === 'AWAITING_VERIFICATION' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-2">
              <Upload className="w-10 h-10 text-blue-500 mx-auto" />
              <h4 className="font-bold text-blue-900 text-base">
                Awaiting Manager Verification
              </h4>
              <p className="text-xs text-blue-700">
                Job submitted. The society manager will review your before/after photos and approve the job. You'll be notified once it's cleared.
              </p>
            </div>
          )}

          {/* STATE 6: COMPLETED OR BEYOND */}
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
