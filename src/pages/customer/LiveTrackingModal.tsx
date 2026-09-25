import React from 'react';
import { Booking } from '../../types';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { CooperativeMap } from '../../components/common/Map/CooperativeMap';
import { MapMarkerEntity } from '../../types/location';
import { mapBookingStatus } from '../../utils/statusMapper';
import { formatDistance, estimateETA, generateGoogleMapsUrl } from '../../utils/geoUtils';
import { BreakCountdownTimer } from '../../components/common/BreakCountdownTimer';
import { useCooperativeStore } from '../../store/cooperativeStore';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  KeyRound,
  RotateCw,
  AlertTriangle,
  HardHat,
  ShieldAlert,
  CreditCard,
  ChevronRight,
  Navigation,
  ExternalLink,
  Coffee,
} from 'lucide-react';

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onProceedToPayment?: (booking: Booking) => void;
  onOpenSOS?: (booking: Booking) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onProceedToPayment,
  onOpenSOS,
}) => {
  const { t } = useTranslation();
  const { acceptWorkerBreak, declineWorkerBreak, autoResumeWorkerBreak } = useCooperativeStore();
  if (!isOpen || !booking) return null;

  const statusInfo = mapBookingStatus(booking.state);

  // 5 customer-facing stages
  const customerSteps = [
    { key: 'REQUESTED', label: t('common.pending', 'Requested'), desc: 'Finding verified specialist' },
    { key: 'WORKER FOUND', label: t('common.assigned', 'Worker Found'), desc: 'Specialist matched & assigned' },
    { key: 'ON THE WAY', label: t('tracking.workerArriving', 'On The Way'), desc: 'Travelling to your residence' },
    { key: 'WORKING', label: t('common.inProgress', 'Working'), desc: 'Service underway at residence' },
    { key: 'COMPLETED', label: t('common.completed', 'Completed'), desc: 'Job finished & verified' },
  ];

  const currentStepIndex = statusInfo.stepIndex;
  const isSOSApplicable = ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(booking.state);

  // Coordinates resolution
  const custLat = booking.customerLatitude || 18.5590;
  const custLng = booking.customerLongitude || 73.7868;

  // Worker coordinates during active job (slightly offset if travelling)
  const isTravelling = booking.state === 'TRAVELLING';
  const isWorking = booking.state === 'IN_PROGRESS' || booking.state === 'ARRIVED';

  const workerLat = booking.matchedWorker?.latitude || (custLat + (isTravelling ? 0.008 : 0.0002));
  const workerLng = booking.matchedWorker?.longitude || (custLng + (isTravelling ? 0.008 : 0.0002));

  const distanceKm = isWorking ? 0.05 : booking.distanceKm || 1.2;
  const eta = estimateETA(distanceKm);

  // Build live map markers
  const trackingMarkers: MapMarkerEntity[] = [
    {
      id: 'customer_dest',
      type: 'user',
      title: 'Your Residence',
      subtitle: booking.customerAddress,
      coordinates: { lat: custLat, lng: custLng },
    },
  ];

  if (booking.matchedWorker) {
    trackingMarkers.push({
      id: `worker_${booking.matchedWorker.id}`,
      type: 'worker',
      title: booking.matchedWorker.name,
      profession: booking.matchedWorker.skills[0] || 'Specialist',
      status: isTravelling ? 'TRAVELLING' : isWorking ? 'ON_JOB' : 'AVAILABLE',
      avatar: booking.matchedWorker.avatar,
      coordinates: { lat: workerLat, lng: workerLng },
    });
  }

  const googleMapsLink = generateGoogleMapsUrl(custLat, custLng, `Service Destination #${booking.id}`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Service Tracking"
      subtitle={<span>Booking <span className="font-mono font-bold">#{booking.id}</span> · {booking.serviceCategory}</span>}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* BREAK REQUEST ALERT */}
        {booking.state === 'BREAK_REQUESTED' && (
          <div className="p-3.5 bg-[#FFF7ED] border border-[#FDBA74] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#9A3412]">
                  Worker {booking.matchedWorker?.name || 'Worker'} has requested a {booking.breakDetails?.estimatedDurationMins || 15}-minute break.
                </p>
                <p className="text-[11px] text-[#C2410C]">
                  {t('customer.breakReviewNotice', 'Please approve to pause work countdown or decline if urgent.')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => declineWorkerBreak(booking.id)}
                className="px-3 py-1.5 bg-white hover:bg-[#FFF1E6] text-[#C2410C] border border-[#FDBA74] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {t('customer.decline', 'Decline')}
              </button>
              <button
                type="button"
                onClick={() => acceptWorkerBreak(booking.id)}
                className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{t('customer.acceptBreak', 'Accept Break')}</span>
              </button>
            </div>
          </div>
        )}

        {/* WORKER ON BREAK ALERT */}
        {booking.state === 'WORKER_ON_BREAK' && (
          <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#166534]">
                    {t('customer.workerOnBreak', 'Worker on Break')}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                </div>
                <p className="text-[11px] text-[#15803D]">
                  {t('customer.breakTimerAutoNotice', 'Job is paused. Work will automatically resume when break expires.')}
                </p>
              </div>
            </div>
            <div className="shrink-0 self-end sm:self-center">
              <BreakCountdownTimer
                startedAt={booking.breakDetails?.startedAt}
                durationMins={booking.breakDetails?.estimatedDurationMins || 15}
                onExpire={() => autoResumeWorkerBreak(booking.id)}
              />
            </div>
          </div>
        )}

        {/* RE-MATCHING ALERT IF APPLICABLE */}
        {booking.state === 'RE_MATCHING' && (
          <div className="p-3.5 bg-[#FAEDE8] border border-[#F3C5B8] rounded-2xl flex items-start gap-3 animate-fade-in">
            <RotateCw className="w-4 h-4 text-[#80432E] animate-spin shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#292824] text-xs">
                Re-matching specialist
              </h4>
              <p className="text-[11px] text-[#77736B] mt-0.5">
                Our cooperative engine is assigning another verified specialist in your sector.
              </p>
            </div>
          </div>
        )}

        {/* LIVE INTERACTIVE TRACKING MAP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77736B] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#6E8B67]" />
              <span>Live Operational Map</span>
            </span>

            {/* Real-time ETA Pill */}
            {isTravelling && (
              <span className="text-[11px] font-bold text-[#80432E] bg-[#FAEDE8] border border-[#F3C5B8] px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3" />
                <span>Estimated Arrival: <strong>{eta.formatted}</strong> ({formatDistance(distanceKm)})</span>
              </span>
            )}

            {isWorking && (
              <span className="text-[11px] font-bold text-[#445D3E] bg-[#E6ECE4] border border-[#CFDDD0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <HardHat className="w-3 h-3" />
                <span>Specialist On Site · Working</span>
              </span>
            )}
          </div>

          <CooperativeMap
            height={220}
            markers={trackingMarkers}
            autoFitBounds={true}
            interactive={true}
            showLegend={false}
          />
        </div>

        {/* 5-STAGE PROGRESS TIMELINE */}
        <div className="p-4 bg-[#FCF9F3] rounded-2xl border border-[#E8E2D5] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77736B]">
              Current Status
            </span>
            <Badge variant={statusInfo.badgeVariant} dot size="sm">
              {statusInfo.headline}
            </Badge>
          </div>

          {/* Stepper Grid */}
          <div className="relative pl-6 sm:pl-8 space-y-3.5 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E2D5]">
            {customerSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="relative flex items-start gap-3">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isPast
                        ? 'bg-[#6E8B67] border-[#6E8B67] text-white'
                        : isCurrent
                        ? 'bg-white border-[#6E8B67] text-[#6E8B67] ring-2 ring-[#CFDDD0]'
                        : 'bg-white border-[#E8E2D5] text-[#9A958B]'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#6E8B67]' : 'bg-[#E8E2D5]'}`} />
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold tracking-tight ${
                        isCurrent ? 'text-[#292824]' : isPast ? 'text-[#524E47]' : 'text-[#9A958B]'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-[#77736B]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ARRIVAL OTP DISPLAY (CRITICAL FOR ARRIVAL / STARTING JOB) */}
        {['CONFIRMED', 'TRAVELLING', 'ARRIVED'].includes(booking.state) && (
          <div className="p-4 bg-[#E6ECE4]/80 rounded-2xl border border-[#CFDDD0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FCF9F3] border border-[#CFDDD0] flex items-center justify-center text-[#445D3E]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-[#445D3E] font-bold uppercase tracking-wider block">
                  {t('common.otpCode', 'Verification OTP')}
                </span>
                <span className="text-xs text-[#524E47]">
                  {t('tracking.otpInstruction', 'Share this code with your worker upon arrival:')}
                </span>
              </div>
            </div>
            <div className="px-3.5 py-1.5 bg-white border border-[#CFDDD0] rounded-xl font-mono text-lg font-black text-[#2A3927] tracking-widest shadow-2xs">
              {booking.otp}
            </div>
          </div>
        )}

        {/* WORKER SUMMARY CARD */}
        {booking.matchedWorker && (
          <div className="p-4 bg-[#FCF9F3] rounded-2xl border border-[#E8E2D5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={booking.matchedWorker.avatar}
                alt={booking.matchedWorker.name}
                className="w-12 h-12 rounded-full object-cover border border-[#E8E2D5]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-xs font-bold text-[#292824]">{booking.matchedWorker.name}</strong>
                  <span className="text-[10px] text-[#445D3E] bg-[#E6ECE4] px-1.5 py-0.2 rounded font-bold">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-[11px] text-[#77736B] block">
                  {booking.matchedWorker.skills[0]} · {booking.matchedWorker.societyName || 'Green Residency'}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-[#80432E] mt-0.5">
                  <Star className="w-3 h-3 fill-[#B37055] text-[#B37055]" />
                  <span className="font-bold font-mono">{booking.matchedWorker.rating}</span>
                  <span className="text-[#77736B]">(<span className="font-mono">{booking.matchedWorker.completedJobs}</span> jobs)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${booking.matchedWorker.phone}`}
                className="p-2.5 rounded-xl bg-[#F3EEE4] hover:bg-[#E8E2D5] text-[#524E47] transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS: PAYMENT & SOS */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* CONTEXTUAL SOS BUTTON (Only during in-progress / active job) */}
          {isSOSApplicable && onOpenSOS ? (
            <button
              type="button"
              onClick={() => onOpenSOS(booking)}
              className="px-3 py-2.5 rounded-xl bg-[#FAEDE8] hover:bg-[#F33B2B]/15 text-[#80432E] border border-[#F3C5B8] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#C93B2B]" />
              <span>Emergency SOS</span>
            </button>
          ) : <div />}

          {/* PAYMENT BUTTON IF COMPLETED */}
          {booking.state === 'COMPLETED' && onProceedToPayment && (
            <button
              type="button"
              onClick={() => onProceedToPayment(booking)}
              className="px-5 py-2.5 rounded-xl bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay & Settle <span className="font-mono">₹{booking.pricing.total}</span></span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
