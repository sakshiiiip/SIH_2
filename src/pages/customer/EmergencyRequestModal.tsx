import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldAlert, Zap, Wrench, Flame, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencyCreated?: (bookingId: string) => void;
}

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
  onEmergencyCreated,
}) => {
  const { currentUser, createBooking } = useCooperativeStore();

  const [selectedEmergencyCategory, setSelectedEmergencyCategory] =
    useState<string>('Plumbing');
  const [problemDescription, setProblemDescription] = useState<string>(
    'Severe pipe burst / continuous water leakage'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const emergencyOptions = [
    {
      category: 'Plumbing',
      problem: 'Severe pipe burst / continuous water leakage flooding room',
      icon: <Wrench className="w-5 h-5 text-sky-600" />,
    },
    {
      category: 'Electrical',
      problem: 'Main distribution box sparking / burning smell / complete blackout',
      icon: <Zap className="w-5 h-5 text-amber-600" />,
    },
    {
      category: 'Carpentry',
      problem: 'Main entrance security door jammed shut / resident locked out',
      icon: <Flame className="w-5 h-5 text-rose-600" />,
    },
  ];

  const handleTriggerEmergency = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newBooking = createBooking({
        serviceCategory: selectedEmergencyCategory,
        problemType: problemDescription,
        details: 'EMERGENCY: Immediate priority response requested.',
        urgencyTier: 'EMERGENCY',
      });

      setIsSubmitting(false);
      onClose();
      if (onEmergencyCreated) {
        onEmergencyCreated(newBooking.id);
      }
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Need help immediately?"
      subtitle="Cooperative Priority Emergency Response"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-950 text-sm">
              Emergency Priority Queue
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              For situations requiring immediate assistance. Dispatches directly to closest available verified specialists with auto-escalation.
            </p>
          </div>
        </div>

        {/* Quick select */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">
            Select Emergency Type:
          </label>
          <div className="space-y-2">
            {emergencyOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedEmergencyCategory(opt.category);
                  setProblemDescription(opt.problem);
                }}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  selectedEmergencyCategory === opt.category
                    ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">{opt.category}</div>
                  <div className="text-xs text-slate-600 line-clamp-1">{opt.problem}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location display */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <span>Dispatching to: <strong>{currentUser.address}</strong></span>
          <span className="text-teal-700 font-semibold">{currentUser.societyName}</span>
        </div>

        {/* Action button */}
        <Button
          variant="emergency"
          size="lg"
          className="w-full"
          onClick={handleTriggerEmergency}
          isLoading={isSubmitting}
          leftIcon={<ShieldAlert className="w-5 h-5" />}
        >
          Request Immediate Emergency Help
        </Button>
      </div>
    </Modal>
  );
};
