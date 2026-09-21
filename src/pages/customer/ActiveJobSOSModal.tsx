import React, { useState, useEffect } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { ServiceRequest } from '../../types';
import { generateGoogleMapsUrl } from '../../utils/geoUtils';
import {
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  X,
  Building2,
  PhoneForwarded,
  Ambulance,
  MapPin,
  ExternalLink,
  Navigation,
} from 'lucide-react';

interface ActiveJobSOSModalProps {
  job: ServiceRequest;
  isOpen: boolean;
  onClose: () => void;
}

const CUSTOMER_SOS_REASONS = [
  'Safety concern',
  'Worker issue',
  'Medical emergency',
  'Property damage',
  'Worker has not arrived',
  'Other',
];

export const ActiveJobSOSModal: React.FC<ActiveJobSOSModalProps> = ({ job, isOpen, onClose }) => {
  const { triggerActiveJobSOS, currentUser } = useCooperativeStore();
  const { currentCoordinates, currentAddress, captureSOSSnapshot } = useGeolocation();

  const [selectedReason, setSelectedReason] = useState(CUSTOMER_SOS_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emergencyCoords, setEmergencyCoords] = useState(currentCoordinates);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmittedTicketId(null);
      setEmergencyCoords(currentCoordinates);
      const url = generateGoogleMapsUrl(
        currentCoordinates.latitude,
        currentCoordinates.longitude,
        `Active Job SOS #${job.id}`
      );
      setGoogleMapsUrl(url);
    }
  }, [isOpen, currentCoordinates, job.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const snapshot = await captureSOSSnapshot(job.id, 'customer', currentUser.name);
      setEmergencyCoords(snapshot.coordinates);
      setGoogleMapsUrl(snapshot.googleMapsUrl);

      const ticket = triggerActiveJobSOS(
        job.id,
        'customer',
        selectedReason,
        details || 'Immediate escalation triggered by resident.',
        {
          latitude: snapshot.coordinates.latitude,
          longitude: snapshot.coordinates.longitude,
          locationAccuracy: snapshot.coordinates.accuracy,
          locationAddress: snapshot.address,
          googleMapsUrl: snapshot.googleMapsUrl,
        }
      );

      setSubmittedTicketId(ticket.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292824]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FCF9F3] border-2 border-[#E98074] rounded-[28px] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Warning Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D9534F] via-[#E98074] to-[#C93B2B]" />

        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-[#E8E2D5] mt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAEDE8] border border-[#F3C5B8] flex items-center justify-center text-[#C93B2B]">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#C93B2B] text-white">
                Active Job SOS
              </span>
              <h3 className="text-base font-extrabold text-[#292824] mt-0.5">Emergency Assistance</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#77736B] hover:text-[#292824] hover:bg-[#E8E2D5]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-4">
          {/* LOCATION TELEMETRY STATUS PILL */}
          <div className="p-3 bg-[#FAEDE8]/60 border border-[#F3C5B8] rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-[#C93B2B] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase text-[#80432E] block">
                  Captured GPS Telemetry
                </span>
                <strong className="text-[#292824] font-bold block truncate">
                  {currentAddress.formattedAddress || 'Green Residency, Baner, Pune'}
                </strong>
              </div>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white hover:bg-[#FAF7F2] text-[#80432E] border border-[#F3C5B8] rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Maps</span>
            </a>
          </div>

          {submittedTicketId ? (
            <div className="text-center py-3 space-y-3">
              <div className="w-14 h-14 bg-[#E6ECE4] border-2 border-[#CFDDD0] rounded-full flex items-center justify-center mx-auto text-[#445D3E]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#445D3E]">
                  Ticket Dispatched
                </span>
                <h4 className="text-lg font-black text-[#292824]">Ticket <span className="font-mono font-bold">#{submittedTicketId}</span></h4>
                <p className="text-xs text-[#77736B] max-w-xs mx-auto">
                  Your Society Desk and Emergency Response have been alerted with live GPS telemetry.
                </p>
              </div>

              {/* Direct Quick Emergency Helplines */}
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#292824]">Police Control (112)</span>
                  <a
                    href="tel:112"
                    className="px-3 py-1.5 bg-[#C93B2B] text-white font-bold rounded-lg flex items-center gap-1 text-xs shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 112</span>
                  </a>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#292824]">Society Manager Desk</span>
                  <a
                    href="tel:9820411983"
                    className="px-3 py-1.5 bg-[#6E8B67] text-white font-bold rounded-lg flex items-center gap-1 text-xs shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Desk</span>
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#F3EEE4] hover:bg-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl transition-colors cursor-pointer mt-2"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#292824] block mb-2">
                  What's wrong?
                </label>
                <div className="space-y-1.5">
                  {CUSTOMER_SOS_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setSelectedReason(reason)}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between text-xs font-semibold cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAEDE8] border-2 border-[#C93B2B] text-[#80432E]'
                            : 'bg-[#FCF9F3] border-[#E8E2D5] text-[#524E47] hover:border-[#F3C5B8]'
                        }`}
                      >
                        <span>{reason}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#C93B2B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#77736B] block mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide any critical context..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#C93B2B]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#C93B2B] hover:bg-[#B33224] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Submit Emergency SOS with Location</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
