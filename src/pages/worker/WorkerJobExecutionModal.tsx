import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Booking } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import {
  generateGoogleDirectionsUrl,
  calculateHaversineDistanceKm,
  formatDistance,
  estimateETA,
} from '../../utils/geoUtils';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { BreakCountdownTimer } from '../../components/common/BreakCountdownTimer';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  KeyRound,
  Play,
  Camera,
  RefreshCw,
  AlertTriangle,
  Clock,
  Coffee,
  Wrench,
  Star,
  Timer,
  X,
  Upload,
  ArrowRight,
  ImageIcon,
  ExternalLink,
  Compass,
  Sparkles,
  Hourglass,
} from 'lucide-react';

// ─── Break reason options ─────────────────────────────────────────────────────

const BREAK_DURATIONS = [15, 30, 45] as const;
type BreakDuration = typeof BREAK_DURATIONS[number];

// ─── Break picker modal ───────────────────────────────────────────────────────

interface BreakPickerProps {
  onConfirm: (durationMins: BreakDuration, reason?: string) => void;
  onCancel: () => void;
}

function BreakPicker({ onConfirm, onCancel }: BreakPickerProps) {
  const { t } = useTranslation();
  const [duration, setDuration] = useState<BreakDuration>(15);
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  const BREAK_REASONS = [
    { label: t('worker.breakPicker.reasonLunch', 'Lunch Break'), key: 'lunch', icon: <Coffee className="w-3.5 h-3.5" /> },
    { label: t('worker.breakPicker.reasonMaterials', 'Sourcing Materials'), key: 'materials', icon: <Wrench className="w-3.5 h-3.5" /> },
    { label: t('worker.breakPicker.reasonParts', 'Sourcing Parts'), key: 'parts', icon: <Wrench className="w-3.5 h-3.5" /> },
    { label: t('worker.breakPicker.reasonPrayer', 'Prayer Break'), key: 'prayer', icon: <Star className="w-3.5 h-3.5" /> },
    { label: t('worker.breakPicker.reasonPersonal', 'Personal Break'), key: 'personal', icon: <Coffee className="w-3.5 h-3.5" /> },
  ] as const;

  const finalReason =
    reason === '__custom__' ? customReason.trim() || undefined : reason || undefined;

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
              <p className="text-sm font-bold text-[#292824]">{t('worker.breakPicker.title', 'Take a Break')}</p>
              <p className="text-[11px] text-[#77736B]">{t('worker.breakPicker.subtitle', 'Customer will be notified automatically')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-lg hover:bg-[#F3EEE4] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 text-[#77736B]" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Duration selection */}
          <div>
            <p className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider mb-2">
              {t('worker.breakPicker.breakDurationLabel', 'Break Duration')}
            </p>
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
                  {t('worker.breakPicker.durationBtn', { d, defaultValue: `${d} min` })}
                </button>
              ))}
            </div>
          </div>

          {/* Reason selection */}
          <div>
            <p className="text-[11px] font-bold text-[#77736B] uppercase tracking-wider mb-2">
              {t('worker.breakPicker.reasonLabel', 'Reason (optional)')}
            </p>
            <div className="space-y-1.5">
              {BREAK_REASONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setReason(reason === r.label ? '' : r.label)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                    reason === r.label
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-[#E8E2D5] bg-white text-[#292824] hover:bg-[#F8F5EE]'
                  }`}
                >
                  <span className={reason === r.label ? 'text-amber-600' : 'text-[#77736B]'}>
                    {r.icon}
                  </span>
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
                <Timer
                  className={`w-3.5 h-3.5 ${
                    reason === '__custom__' ? 'text-amber-600' : 'text-[#77736B]'
                  }`}
                />
                {t('worker.breakPicker.reasonOther', 'Other…')}
              </button>
              {reason === '__custom__' && (
                <input
                  type="text"
                  autoFocus
                  placeholder={t('worker.breakPicker.customReasonPlaceholder', 'Describe reason…')}
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
            {t('worker.breakPicker.confirmBtn', { duration, defaultValue: `Start ${duration}-Minute Break` })}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Wizard helpers ───────────────────────────────────────────────────────────

// Step indices for IN_PROGRESS micro-wizard
type WizardStep = 1 | 2 | 3 | 4;

const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// ─── Wizard step progress indicator ───────────────────────────────────────────

function StepProgress({ wizardStep }: { wizardStep: WizardStep }) {
  const { t } = useTranslation();
  const stepLabels: Record<WizardStep, string> = {
    1: t('worker.stepLabels.1', 'Before Photo'),
    2: t('worker.stepLabels.2', 'Start Work'),
    3: t('worker.stepLabels.3', 'After Photo'),
    4: t('worker.stepLabels.4', 'Mark Complete'),
  };

  return (
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
              {stepLabels[step]}
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
}

// ─── Photo upload tile ────────────────────────────────────────────────────────
interface PhotoUploadTileProps {
  label: string;
  photo: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PhotoUploadTile({ label, photo, inputRef, onPhotoSelected }: PhotoUploadTileProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPhotoSelected}
      />

      {/* Preview / placeholder box */}
      <div
        className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
          photo ? 'border-[#6E8B67] bg-[#F0F4EF]' : 'border-dashed border-[#D8D3C8] bg-[#F3EEE4]'
        }`}
      >
        {photo ? (
          <div className="relative">
            <img src={photo} alt={`${label} preview`} className="w-full h-48 object-cover" />
            <div className="absolute top-2 left-2 bg-[#445D3E] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('worker.photoTile.recorded', { label, defaultValue: `${label} Recorded` })}</span>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#292824] rounded-xl text-xs font-bold shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#445D3E]" />
              {t('worker.photoTile.retakeChange', 'Retake / Change')}
            </button>
          </div>
        ) : (
          <div
            className="h-44 flex flex-col items-center justify-center gap-2 text-[#77736B] p-4 text-center cursor-pointer hover:bg-[#EDE8DD] transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-[#E8E2D5] flex items-center justify-center text-[#524E47]">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#292824] block">{label}</span>
              <span className="text-[11px] text-[#77736B]">
                {t('worker.photoTile.tapToCapture', 'Tap to capture with camera or select from device gallery')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Primary action button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full px-3 py-2.5 bg-[#445D3E] hover:bg-[#33472F] active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
      >
        {photo ? (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>{t('worker.photoTile.retakeChangeLabel', { label, defaultValue: `Retake / Change ${label}` })}</span>
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            <span>{t('worker.photoTile.takeUploadLabel', { label, defaultValue: `Take / Upload ${label}` })}</span>
          </>
        )}
      </button>
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
  const { t } = useTranslation();
  const {
    updateBookingState,
    verifyBookingOTP,
    completeBooking,
    requestWorkerBreak,
    autoResumeWorkerBreak,
    startWorkerBreak,
    endWorkerBreak,
    uploadJobPhotos,
  } = useCooperativeStore();

  const { currentCoordinates } = useGeolocation();

  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [workNotes, setWorkNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showBreakPicker, setShowBreakPicker] = useState(false);

  // 4-step wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // Photo state (stored as base64 data-URLs)
  const [beforePhoto, setBeforePhoto] = useState<string | null>(booking?.beforeImage ?? null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(booking?.afterImage ?? null);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when a different booking is loaded
  useEffect(() => {
    if (booking) {
      setBeforePhoto(booking.beforeImage ?? null);
      setAfterPhoto(booking.afterImage ?? null);
      setWizardStep(1);
      setEnteredOtp('');
      setOtpError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  // Dynamic distance and ETA to customer
  const destLat = booking?.customerLatitude;
  const destLng = booking?.customerLongitude;
  const originLat = currentCoordinates?.latitude;
  const originLng = currentCoordinates?.longitude;

  const dynamicDistanceKm =
    destLat && destLng && originLat && originLng
      ? calculateHaversineDistanceKm(originLat, originLng, destLat, destLng)
      : booking?.distanceKm ?? null;

  const dynamicETA = dynamicDistanceKm ? estimateETA(dynamicDistanceKm) : null;

  const handleOpenGoogleMaps = () => {
    if (!booking) return;
    if (destLat && destLng) {
      const url = generateGoogleDirectionsUrl(destLat, destLng, originLat, originLng);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const fullQuery = `${booking.customerAddress}, ${booking.societyName || 'Pune'}`;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  if (!isOpen || !booking) return null;

  const bookingId = booking.id;
  const isOnBreak = booking.state === 'WORKER_ON_BREAK';

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleStartTravelling = () => updateBookingState(bookingId, 'TRAVELLING');
  const handleConfirmArrival = () => updateBookingState(bookingId, 'ARRIVED');

  const handleVerifyOtpAndStart = () => {
    setOtpError('');
    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setOtpError(t('worker.jobExec.otpErrorEmpty', 'Please enter the 4-digit code provided by the customer.'));
      return;
    }
    const success = verifyBookingOTP(bookingId, enteredOtp);
    if (!success) {
      setOtpError(t('worker.jobExec.otpErrorIncorrect', 'Incorrect OTP. Please ask the customer to confirm the code shown on their app.'));
    } else {
      setEnteredOtp('');
      setWizardStep(1); // reset wizard when entering IN_PROGRESS
    }
  };

  const handleBeforePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected after "Retake"
    e.target.value = '';
    const dataUrl = await readFileAsDataURL(file);
    setBeforePhoto(dataUrl);
    uploadJobPhotos(bookingId, { beforeImage: dataUrl });
  };

  const handleAfterPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const dataUrl = await readFileAsDataURL(file);
    setAfterPhoto(dataUrl);
    uploadJobPhotos(bookingId, { afterImage: dataUrl });
  };

  const handleCompleteJob = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      completeBooking(
        bookingId,
        workNotes || 'Inspected connection, replaced worn gasket, and pressure-tested line.',
        [],
        workNotes || 'Job completed. Before and after photos attached.',
        [beforePhoto, afterPhoto].filter(Boolean) as string[]
      );
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handleBreakConfirm = (durationMins: BreakDuration, reason?: string) => {
    setShowBreakPicker(false);
    requestWorkerBreak(bookingId, durationMins, reason);
  };

  const handleResumeWork = () => endWorkerBreak(bookingId);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('worker.jobExec.modalTitle', 'Job Execution Center')}
        subtitle={
          <span>
            {t('worker.jobExec.bookingSubtitle', 'Booking')} <span className="font-mono font-bold">#{booking.id}</span> ·{' '}
            {booking.serviceCategory}
          </span>
        }
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Customer Location & Problem Card */}
          <Card className="p-4 bg-[#FCF9F3] border-[#E8E2D5] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider">
                    {t('worker.jobExec.customerDestination', 'Customer & Destination')}
                  </span>
                  {dynamicDistanceKm !== null && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2E8] text-[#445D3E] border border-[#CFDDD0] flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#6E8B67]" />
                      <span>
                        {formatDistance(dynamicDistanceKm)} · {dynamicETA?.formatted || '5 mins'}
                      </span>
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-[#292824]">{booking.customerName}</h4>
                <p className="text-xs text-[#524E47] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6E8B67] shrink-0" />
                  <span>
                    {booking.customerAddress} ({booking.societyName})
                  </span>
                </p>
                {destLat && destLng && (
                  <span className="text-[10px] font-mono text-[#77736B] block">
                    {t('worker.jobExec.gpsPin', 'GPS Pin:')} {destLat.toFixed(4)}, {destLng.toFixed(4)}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenGoogleMaps}
                className="bg-white hover:bg-[#F3EEE4] border-[#D8D3C8] text-[#292824] shrink-0 shadow-2xs"
                leftIcon={<Navigation className="w-3.5 h-3.5 text-[#6E8B67]" />}
                rightIcon={<ExternalLink className="w-3 h-3 text-[#9A958B]" />}
              >
                {t('worker.jobExec.navigateGoogleMaps', 'Navigate (Google Maps)')}
              </Button>
            </div>

            <div className="border-t border-[#E8E2D5] pt-2 flex items-center justify-between text-xs">
              <span className="text-[#524E47]">
                <strong>{t('worker.jobExec.requirement', 'Requirement:')}</strong> {booking.problemType}
              </span>
              <span className="text-[#445D3E] font-bold">
                {t('worker.jobExec.workerPayout', 'Worker Payout:')} <span className="font-mono">₹{booking.pricing.workerShare}</span>
              </span>
            </div>
          </Card>

          {/* CURRENT STEP CONTROLS */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('worker.jobExec.executionStage', 'Execution Stage:')} {booking.state}
              </span>
              <Badge variant={isOnBreak ? 'urgent' : 'coop'}>{booking.state}</Badge>
            </div>

            {/* STATE 1: CONFIRMED → START TRAVELLING */}
            {booking.state === 'CONFIRMED' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  {t('worker.jobExec.confirmedDesc', 'You have accepted this job. Tap below when you begin travelling to notify the resident.')}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleStartTravelling}
                  leftIcon={<Navigation className="w-5 h-5" />}
                >
                  {t('worker.jobExec.startTravelling', 'Start Travelling to Customer')}
                </Button>
              </div>
            )}

            {/* STATE 2: TRAVELLING → CONFIRM ARRIVAL & NAVIGATION */}
            {booking.state === 'TRAVELLING' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      {t('worker.jobExec.enRoute', 'En Route to Customer Residence')}
                    </span>
                    {dynamicETA && (
                      <span className="text-amber-800 font-mono text-[11px]">
                        {t('worker.jobExec.eta', 'ETA:')} {dynamicETA.formatted}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {t('worker.jobExec.enRouteNotice', 'Customer has been notified that you are en route. Live GPS telemetry is being transmitted for resident safety.')}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleOpenGoogleMaps}
                      className="w-full py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('worker.jobExec.openGpsNav', 'Open Live Turn-by-Turn GPS Navigation')}</span>
                      <ExternalLink className="w-3 h-3 text-amber-600 ml-0.5" />
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirmArrival}
                  leftIcon={<MapPin className="w-5 h-5" />}
                >
                  {t('worker.jobExec.confirmArrival', 'Confirm Arrival At Society / Doorstep')}
                </Button>
              </div>
            )}

            {/* STATE 3: ARRIVED → OTP VERIFICATION */}
            {booking.state === 'ARRIVED' && (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                    <KeyRound className="w-4 h-4 text-teal-700" />
                    <span>{t('worker.jobExec.arrivedOtpTitle', 'Customer 4-Digit Arrival Code')}</span>
                  </div>
                  <p className="text-xs text-teal-700">
                    {t('worker.jobExec.arrivedOtpDesc', 'Ask the customer for the 4-digit code shown on their Cooperative mobile screen to verify identity and unlock job execution.')}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t('worker.jobExec.enterOtpLabel', 'Enter 4-Digit Customer Code:')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder={t('worker.jobExec.otpPlaceholder', 'e.g. 4829')}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="flex-1 p-3.5 border border-slate-200 rounded-xl text-center text-xl font-mono font-bold tracking-widest focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <Button variant="primary" size="md" onClick={handleVerifyOtpAndStart}>
                      {t('worker.jobExec.verifyBeginWork', 'Verify & Begin Work')}
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

            {/* STATE 4: IN_PROGRESS or WORK_RESUMED → 4-step wizard + Take a Break */}
            {(booking.state === 'IN_PROGRESS' || booking.state === 'WORK_RESUMED') && (
              <div className="space-y-5">
                {/* Status row + Take a Break CTA */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>
                      {booking.state === 'WORK_RESUMED'
                        ? t('worker.jobExec.workResumedActive', 'Work Resumed (Active)')
                        : t('worker.jobExec.workUnderway', 'Work Underway (OTP Verified)')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBreakPicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-[0.97]"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    {t('worker.jobExec.takeABreak', 'Take a Break')}
                  </button>
                </div>

                {/* Step progress */}
                <StepProgress wizardStep={wizardStep} />

                {/* STEP 1: Before Photo */}
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47]">
                      <strong className="text-[#292824]">{t('worker.jobExec.step1Header', 'Step 1 of 4 — Before Photo')}</strong>
                      <br />
                      {t('worker.jobExec.step1Desc', 'Capture the work area before starting any repairs. This protects both you and the customer.')}
                    </div>
                    <PhotoUploadTile
                      label={t('worker.stepLabels.1', 'Before Photo')}
                      photo={beforePhoto}
                      inputRef={beforeInputRef}
                      onPhotoSelected={handleBeforePhotoSelected}
                    />
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => setWizardStep(2)}
                      disabled={!beforePhoto}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {beforePhoto
                        ? t('worker.jobExec.step1ContinueBtn', 'Before Photo Captured — Continue')
                        : t('worker.jobExec.step1ProceedBtn', 'Capture Before Photo to Proceed')}
                    </Button>
                  </div>
                )}

                {/* STEP 2: Confirm Start */}
                {wizardStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                      <strong>{t('worker.jobExec.step2Header', 'Step 2 of 4 — Begin Work')}</strong>
                      <br />
                      {t('worker.jobExec.step2Desc', "Before photo recorded. You're ready to begin the repair. Tap below to officially start.")}
                    </div>
                    {beforePhoto && (
                      <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5]">
                        <img src={beforePhoto} alt="Before" className="w-full h-28 object-cover" />
                        <div className="absolute top-2 left-2 bg-[#6E8B67] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {t('worker.jobExec.step2BeforeLabel', '✓ Before')}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {t('worker.jobExec.step2NotesLabel', 'Work Notes & Parts Replaced (optional):')}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={t('worker.jobExec.step2NotesPlaceholder', 'e.g. Replaced faulty silicone seal on hot water inlet. Pressure checked.')}
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
                      {t('worker.jobExec.step2StartBtn', 'Start Work Now')}
                    </Button>
                  </div>
                )}

                {/* STEP 3: After Photo */}
                {wizardStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      <strong>{t('worker.jobExec.step3Header', 'Step 3 of 4 — After Photo')}</strong>
                      <br />
                      {t('worker.jobExec.step3Desc', 'Capture the completed repair. This serves as proof of work quality for verification.')}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {beforePhoto && (
                        <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5]">
                          <img
                            src={beforePhoto}
                            alt="Before"
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {t('worker.jobExec.step3BeforeLabel', 'Before')}
                          </div>
                        </div>
                      )}
                      {afterPhoto ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#6E8B67]">
                          <img src={afterPhoto} alt="After" className="w-full h-24 object-cover" />
                          <div className="absolute bottom-1 left-1 bg-[#6E8B67] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {t('worker.jobExec.step3AfterLabel', 'After ✓')}
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#D8D3C8] bg-[#F3EEE4] flex items-center justify-center h-24">
                          <div className="text-center text-[#77736B]">
                            <ImageIcon className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-[9px] font-semibold">{t('worker.jobExec.step3AfterPlaceholder', 'After')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <PhotoUploadTile
                      label={t('worker.stepLabels.3', 'After Photo')}
                      photo={afterPhoto}
                      inputRef={afterInputRef}
                      onPhotoSelected={handleAfterPhotoSelected}
                    />
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => setWizardStep(4)}
                      disabled={!afterPhoto}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {afterPhoto
                        ? t('worker.jobExec.step3ContinueBtn', 'After Photo Captured — Continue')
                        : t('worker.jobExec.step3ProceedBtn', 'Capture After Photo to Proceed')}
                    </Button>
                  </div>
                )}

                {/* STEP 4: Mark Complete */}
                {wizardStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                      <strong>{t('worker.jobExec.step4Header', 'Step 4 of 4 — Mark as Completed')}</strong>
                      <br />
                      {t('worker.jobExec.step4Desc', 'Both photos captured. Review and submit the job. It will enter the manager verification queue.')}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {beforePhoto && (
                        <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5]">
                          <img
                            src={beforePhoto}
                            alt="Before"
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {t('worker.jobExec.step4BeforeLabel', 'Before')}
                          </div>
                        </div>
                      )}
                      {afterPhoto && (
                        <div className="relative rounded-xl overflow-hidden border border-[#6E8B67]">
                          <img src={afterPhoto} alt="After" className="w-full h-32 object-cover" />
                          <div className="absolute bottom-1 left-1 bg-[#6E8B67] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {t('worker.jobExec.step4AfterLabel', 'After ✓')}
                          </div>
                        </div>
                      )}
                    </div>

                    {workNotes && (
                      <div className="p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47]">
                        <strong className="text-[#292824]">{t('worker.jobExec.step4NotesLabel', 'Notes:')} </strong>
                        {workNotes}
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
                      {t('worker.jobExec.step4SubmitBtn', 'Submit Quality Proof')}
                    </Button>
                    <p className="text-center text-[10px] text-[#77736B]">
                      {t('worker.jobExec.step4Notice', 'Job will enter the manager verification queue. Customer will be notified.')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STATE 4a: BREAK_REQUESTED → Waiting for customer approval */}
            {booking.state === 'BREAK_REQUESTED' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-orange-200 flex items-center justify-center shrink-0">
                      <Hourglass className="w-5 h-5 text-orange-700 animate-spin" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-orange-950">
                        {t('worker.jobExec.breakRequestedTitle', 'Break Request Submitted')}
                      </p>
                      <p className="text-xs text-orange-800">
                        {t('worker.jobExec.breakRequestedSubtitle', 'Waiting for customer approval...')}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-orange-200 text-xs text-orange-900 space-y-1">
                    <p>
                      <strong>{t('worker.jobExec.requestedDuration', 'Requested Duration:')}</strong>{' '}
                      {booking.breakDetails?.estimatedDurationMins || 15} minutes
                    </p>
                    {booking.breakDetails?.reason && (
                      <p>
                        <strong>{t('worker.jobExec.reason', 'Reason:')}</strong> {booking.breakDetails.reason}
                      </p>
                    )}
                    <p className="text-[11px] text-orange-700 pt-1">
                      {t('worker.jobExec.customerPromptedNotice', 'The customer has been notified directly on their screen to Accept or Decline your break.')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateBookingState(booking.id, 'IN_PROGRESS')}
                  className="w-full py-2.5 bg-white hover:bg-orange-50 text-orange-700 border border-orange-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {t('worker.jobExec.cancelBreakRequest', 'Cancel Break Request & Keep Working')}
                </button>
              </div>
            )}

            {/* STATE 4b: WORKER_ON_BREAK → Active Break with Countdown & Auto Resume */}
            {booking.state === 'WORKER_ON_BREAK' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-amber-200 flex items-center justify-center shrink-0">
                      <Coffee className="w-5 h-5 text-amber-700" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-amber-900">{t('worker.jobExec.onBreakTitle', "You're on a Break")}</p>
                      <p className="text-[11px] text-amber-700">
                        {t('worker.jobExec.breakAcceptedNotice', 'Customer accepted your break · Timer is active')}
                      </p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {t('worker.jobExec.onBreakPaused', 'PAUSED')}
                    </span>
                  </div>

                  <div className="flex justify-center py-2">
                    <BreakCountdownTimer
                      startedAt={booking.breakDetails?.startedAt}
                      durationMins={booking.breakDetails?.estimatedDurationMins || 15}
                      onExpire={() => autoResumeWorkerBreak(booking.id)}
                    />
                  </div>

                  {booking.breakDetails && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/70 rounded-lg p-2 text-center border border-amber-200">
                        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                          {t('worker.jobExec.onBreakDuration', 'Duration')}
                        </p>
                        <p className="font-bold text-amber-900 mt-0.5">
                          {booking.breakDetails.estimatedDurationMins} min
                        </p>
                      </div>
                      {booking.breakDetails.reason && (
                        <div className="bg-white/70 rounded-lg p-2 text-center border border-amber-200">
                          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                            {t('worker.jobExec.onBreakReason', 'Reason')}
                          </p>
                          <p className="font-bold text-amber-900 mt-0.5 truncate">
                            {booking.breakDetails.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResumeWork}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <Play className="w-5 h-5" />
                  {t('worker.jobExec.resumeWorkEarly', 'Resume Work Early')}
                </button>

                <p className="text-center text-[11px] text-slate-500">
                  {t('worker.jobExec.autoResumeTimerNotice', 'When the timer expires, work will automatically resume.')}
                </p>
              </div>
            )}

            {/* STATE 5: AWAITING_VERIFICATION */}
            {booking.state === 'AWAITING_VERIFICATION' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-2">
                <Upload className="w-10 h-10 text-blue-500 mx-auto" />
                <h4 className="font-bold text-blue-900 text-base">{t('worker.jobExec.awaitingTitle', 'Awaiting Manager Verification')}</h4>
                <p className="text-xs text-blue-700">
                  {t('worker.jobExec.awaitingDesc', "Job submitted. The society manager will review your before/after photos and approve the job. You'll be notified once it's cleared.")}
                </p>
              </div>
            )}

            {/* STATE 6: COMPLETED OR BEYOND */}
            {['COMPLETED', 'PAID', 'RATED'].includes(booking.state) && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-base">{t('worker.jobExec.completedTitle', 'Job Successfully Completed!')}</h4>
                <p className="text-xs text-emerald-700">
                  {t('worker.jobExec.completedSettlement', { amount: booking.pricing.workerShare, defaultValue: `Settlement of ₹${booking.pricing.workerShare} is routed to your cooperative account.` })}
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Break picker overlay */}
      {showBreakPicker && (
        <BreakPicker onConfirm={handleBreakConfirm} onCancel={() => setShowBreakPicker(false)} />
      )}
    </>
  );
};
