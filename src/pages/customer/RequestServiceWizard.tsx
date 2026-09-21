import React, { useState, useRef } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { LocationPickerModal } from '../../components/common/LocationPickerModal';
import { INITIAL_SERVICES } from '../../store/initialData';
import { UrgencyTier } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import {
  Check,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  ShieldAlert,
  MapPin,
  Camera,
  Coins,
  ShieldCheck,
  Wrench,
  Hammer,
  Paintbrush,
  Tv,
  Bug,
  Trees,
  Cctv,
  CheckCircle2,
  X,
  ImageIcon,
  Crosshair,
  Edit3,
} from 'lucide-react';

interface RequestServiceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
  preselectedProblem?: string;
  onBookingCreated?: (bookingId: string) => void;
}

const SERVICE_ICONS: Record<string, React.ElementType> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Cleaning: Sparkles,
  Carpentry: Hammer,
  Painting: Paintbrush,
  'Appliance Repairs': Tv,
  'Pest Control': Bug,
  'Gardening & Greenery': Trees,
  'Security & CCTV': Cctv,
};

export const RequestServiceWizard: React.FC<RequestServiceWizardProps> = ({
  isOpen,
  onClose,
  preselectedService,
  preselectedProblem,
  onBookingCreated,
}) => {
  const { currentUser, config, createBooking } = useCooperativeStore();
  const { currentCoordinates, currentAddress, setManualLocation } = useGeolocation();

  // 3-Screen logical state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<string>(
    preselectedService || 'Plumbing'
  );
  const [selectedProblem, setSelectedProblem] = useState<string>(
    preselectedProblem || 'Leaking pipe under sink'
  );
  const [customProblem, setCustomProblem] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [urgencyTier, setUrgencyTier] = useState<UrgencyTier>('STANDARD');
  const [address, setAddress] = useState<string>(
    currentUser.address || currentAddress.formattedAddress || 'Flat 402, Block B, Green Residency'
  );
  const [society, setSociety] = useState<string>(
    currentUser.societyName || currentAddress.locality || 'Green Residency'
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Hidden camera / file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if props change
  React.useEffect(() => {
    if (preselectedService) setSelectedService(preselectedService);
    if (preselectedProblem) setSelectedProblem(preselectedProblem);
  }, [preselectedService, preselectedProblem]);

  // Sync address if global currentAddress changes
  React.useEffect(() => {
    if (currentAddress?.formattedAddress && !address) {
      setAddress(currentAddress.formattedAddress);
    }
  }, [currentAddress]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeServiceObj =
    INITIAL_SERVICES.find(
      (s) => s.name.toLowerCase() === selectedService.toLowerCase()
    ) || INITIAL_SERVICES[0];

  // Pricing calculation
  const basePrice = activeServiceObj ? activeServiceObj.basePrice : 500;
  const urgencyMultiplier =
    urgencyTier === 'EMERGENCY' ? 1.5 : urgencyTier === 'URGENT' ? 1.25 : 1.0;
  const totalEstimated = Math.round(basePrice * urgencyMultiplier);
  const workerEstimated = Math.round((totalEstimated * config.workerSharePercent) / 100);
  const societyEstimated = Math.round((totalEstimated * config.societySharePercent) / 100);
  const fundEstimated = totalEstimated - workerEstimated - societyEstimated;

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const finalProblem =
        selectedProblem === 'Something else' && customProblem.trim()
          ? customProblem
          : selectedProblem;

      const booking = createBooking({
        serviceCategory: selectedService,
        problemType: finalProblem,
        details: details || 'Standard residential inspection and fix requested.',
        photos: selectedPhoto ? [selectedPhoto] : [],
        urgencyTier,
        societyName: society,
        customAddress: address,
        customerCoordinates: currentCoordinates,
        customerLocality: currentAddress.locality || society,
        customerPostalCode: currentAddress.postalCode,
      });

      setIsSubmitting(false);
      onClose();
      // Reset for next use
      setStep(1);
      setSelectedPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onBookingCreated) {
        onBookingCreated(booking.id);
      }
    }, 450);
  };

  const stepMeta = [
    { title: 'What do you need?', subtitle: 'Select service & issue type' },
    { title: 'Tell us more', subtitle: 'Details, photos & location' },
    { title: 'Confirm Request', subtitle: 'Urgency & transparent pricing' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStep(1);
        setSelectedPhoto(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }}
      title={stepMeta[step - 1].title}
      subtitle={`Screen ${step} of 3 · ${stepMeta[step - 1].subtitle}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* 3-Step Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                step >= s ? 'bg-[#6E8B67]' : 'bg-[#E8E2D5]'
              }`}
            />
          ))}
        </div>

        {/* ========================================================================= */}
        {/* SCREEN 1: WHAT DO YOU NEED? (Service Category + Specific Problem) */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block mb-2">
                1. Select Service Category
              </label>
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {INITIAL_SERVICES.map((s) => {
                  const isSelected = selectedService === s.name;
                  const IconComp = SERVICE_ICONS[s.name] || Wrench;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(s.name);
                        setSelectedProblem(s.problems[0] || 'General Service');
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#6E8B67] bg-[#E6ECE4] shadow-xs'
                          : 'border-[#E8E2D5] hover:border-[#CFDDD0] bg-[#FCF9F3]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#445D3E]' : 'text-[#77736B]'}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />}
                      </div>
                      <div className="mt-2">
                        <span className="font-bold text-[#292824] text-xs block truncate leading-tight">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-[#77736B] mt-0.5 block">
                          From ₹{s.basePrice}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem Type Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block mb-2">
                2. Specific Issue for {selectedService}
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activeServiceObj.problems.map((prob, idx) => {
                  const isSelected = selectedProblem === prob;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedProblem(prob)}
                      className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between text-xs font-semibold cursor-pointer ${
                        isSelected
                          ? 'border-[#6E8B67] bg-[#E6ECE4] text-[#2A3927]'
                          : 'border-[#E8E2D5] hover:border-[#CFDDD0] bg-[#FCF9F3] text-[#524E47]'
                      }`}
                    >
                      <span>{prob}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#6E8B67]" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedProblem('Something else')}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between text-xs font-semibold cursor-pointer ${
                    selectedProblem === 'Something else'
                      ? 'border-[#6E8B67] bg-[#E6ECE4] text-[#2A3927]'
                      : 'border-[#E8E2D5] hover:border-[#CFDDD0] bg-[#FCF9F3] text-[#524E47]'
                  }`}
                >
                  <span>Other custom issue</span>
                  {selectedProblem === 'Something else' && <Check className="w-3.5 h-3.5 text-[#6E8B67]" />}
                </button>
              </div>

              {selectedProblem === 'Something else' && (
                <input
                  type="text"
                  placeholder="Describe your issue in brief..."
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  className="mt-2 w-full p-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
                />
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: TELL US MORE (Description, Photo & Location) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Selected Summary Pill */}
            <div className="p-3 bg-[#E6ECE4]/70 rounded-2xl border border-[#CFDDD0] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#445D3E] font-bold uppercase tracking-wider block">Requested:</span>
                <strong className="text-[#292824] font-bold">{selectedService} · {selectedProblem === 'Something else' ? (customProblem || 'Custom Issue') : selectedProblem}</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#445D3E] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block mb-1.5">
                Describe the problem (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Water dripping slowly under kitchen sink, valve is tight, need washer replacement."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
              />
            </div>

            {/* Photo Attachment & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo Upload Section */}
              <div className="p-3.5 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#292824]">Attach Photo</span>
                    {selectedPhoto && (
                      <span className="text-[10px] font-bold text-[#445D3E] bg-[#E6ECE4] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
                        Attached
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#77736B] mb-2.5">
                    Helps worker diagnose problem & bring exact replacement parts.
                  </p>
                </div>

                {/* Hidden File Input with camera capture */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                {selectedPhoto ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-[#CFDDD0] bg-black/5 aspect-video sm:aspect-auto sm:h-28 flex items-center justify-center">
                      <img
                        src={selectedPhoto}
                        alt="Problem preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-2 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] rounded-lg text-[11px] font-bold text-[#524E47] transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Camera className="w-3 h-3 text-[#537895]" />
                        <span>Retake</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-[11px] font-bold text-rose-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-[#F3EEE4] text-[#524E47] hover:bg-[#E8E2D5] border border-transparent hover:border-[#CFDDD0]"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#537895]" />
                    <span>Take / Upload Photo</span>
                  </button>
                )}
              </div>

              {/* Society & Flat Location with Map Action */}
              <div className="p-3.5 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#292824] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#6E8B67]" />
                    <span>Service Location</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="text-[11px] font-bold text-[#6E8B67] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Change on Map</span>
                  </button>
                </div>

                <div
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="p-2.5 bg-white border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-xl cursor-pointer transition-colors"
                >
                  <span className="text-[10px] text-[#77736B] block uppercase tracking-wider font-extrabold">
                    Selected Area
                  </span>
                  <strong className="text-xs text-[#292824] font-bold block truncate mt-0.5">
                    {currentAddress?.formattedAddress || address}
                  </strong>
                  <span className="text-[10px] text-[#6E8B67] font-mono mt-0.5 block">
                    📍 {currentCoordinates.latitude.toFixed(4)}° N, {currentCoordinates.longitude.toFixed(4)}° E
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat & Block Details (e.g. Flat 402, Block B)"
                    className="w-full p-2 bg-white border border-[#E8E2D5] rounded-lg text-xs text-[#292824] focus:outline-none focus:ring-1 focus:ring-[#6E8B67]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: CONFIRM & PRICING (Urgency, Transparent Split & Submit) */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Urgency Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#77736B] block mb-2">
                Urgency Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'STANDARD' as UrgencyTier, title: 'Standard', desc: 'Today / Scheduled', icon: Clock, badge: 'Standard rate' },
                  { id: 'URGENT' as UrgencyTier, title: 'Urgent', desc: 'Within 60 min', icon: Zap, badge: '+25% speed' },
                  { id: 'EMERGENCY' as UrgencyTier, title: 'Emergency', desc: 'Immediate dispatch', icon: ShieldAlert, badge: '+50% emergency' },
                ].map((tier) => {
                  const isSelected = urgencyTier === tier.id;
                  const TierIcon = tier.icon;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setUrgencyTier(tier.id)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#6E8B67] bg-[#E6ECE4] shadow-xs'
                          : 'border-[#E8E2D5] bg-[#FCF9F3] hover:border-[#CFDDD0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <TierIcon className={`w-4 h-4 ${isSelected ? 'text-[#445D3E]' : 'text-[#77736B]'}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />}
                      </div>
                      <div className="mt-2">
                        <strong className="text-xs font-bold text-[#292824] block">{tier.title}</strong>
                        <span className="text-[10px] text-[#77736B] block mt-0.5">{tier.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transparent Cooperative Pricing Breakdown */}
            <div className="p-4 bg-[#F3EEE4] rounded-2xl border border-[#E8E2D5] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                <div>
                  <span className="text-xs text-[#77736B] block">Estimated Total Service Cost</span>
                  <span className="text-xl font-bold font-mono text-[#292824]">₹{totalEstimated}</span>
                </div>
                <Badge variant="coop" size="sm">Cooperative <span className="font-mono">70/5/25</span> Model</Badge>
              </div>

              {/* 3-Way Split */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white border border-[#E8E2D5]">
                  <span className="text-[10px] text-[#77736B] block">Worker (<span className="font-mono">70%</span>)</span>
                  <strong className="text-[#324F66] font-bold font-mono text-xs">₹{workerEstimated}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E8E2D5]">
                  <span className="text-[10px] text-[#77736B] block">Society (<span className="font-mono">5%</span>)</span>
                  <strong className="text-[#80432E] font-bold font-mono text-xs">₹{societyEstimated}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E8E2D5]">
                  <span className="text-[10px] text-[#77736B] block">Coop Fund (<span className="font-mono">25%</span>)</span>
                  <strong className="text-[#504161] font-bold font-mono text-xs">₹{fundEstimated}</strong>
                </div>
              </div>
            </div>

            {/* Summary Recap */}
            <div className="p-3 bg-[#FCF9F3] rounded-xl border border-[#E8E2D5] text-xs text-[#77736B] space-y-1">
              <div className="flex justify-between">
                <span>Location:</span>
                <strong className="text-[#292824]">{address}, {society}</strong>
              </div>
              <div className="flex justify-between">
                <span>Specialist:</span>
                <strong className="text-[#292824]">Verified {selectedService} Specialist</strong>
              </div>
              {selectedPhoto && (
                <div className="flex justify-between items-center pt-1 border-t border-[#E8E2D5]/60">
                  <span>Photo:</span>
                  <span className="text-[#445D3E] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
                    Attached
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D5]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#524E47] bg-[#F3EEE4] hover:bg-[#E8E2D5] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#77736B] hover:text-[#292824] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6E8B67] hover:bg-[#587352] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6E8B67] hover:bg-[#587352] transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Confirm Request</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* LOCATION PICKER MODAL */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationConfirmed={(coords, addr) => {
          setAddress(addr.formattedAddress);
          if (addr.locality) setSociety(addr.locality);
          setIsLocationPickerOpen(false);
        }}
      />
    </Modal>
  );
};
