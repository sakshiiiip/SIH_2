import React, { useState } from 'react';
import { Booking } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface RevisitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const COMMON_REVISIT_REASONS = [
  'Work still leaking / not holding pressure',
  'Part improperly fitted or loose',
  'Problem recurred within hours of repair',
  'Incomplete cleanup or missing final check',
];

export const RevisitRequestModal: React.FC<RevisitRequestModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { requestRevisit } = useCooperativeStore();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the revisit request so the coordinator can inspect.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      requestRevisit(booking.id, { reason: reason.trim() });
      setIsSubmitting(false);
      setReason('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Service Revisit"
      subtitle={
        <span>
          Booking <span className="font-mono font-bold">#{booking.id}</span> · {booking.serviceCategory}
        </span>
      }
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Guarantee Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <strong className="block font-bold">Cooperative Quality Guarantee</strong>
            <p>
              If the completed service did not resolve your issue or requires follow-up adjustment, you can request a complimentary revisit. Your society manager will inspect and schedule the follow-up.
            </p>
          </div>
        </div>

        {/* Quick select reasons */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Common Concerns (tap to append):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_REVISIT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason((prev) => (prev ? `${prev}. ${r}` : r))}
                className="text-[11px] bg-[#F3EEE4] hover:bg-[#E8E2D5] text-[#524E47] px-2.5 py-1.5 rounded-lg border border-[#E8E2D5] transition-colors text-left"
              >
                + {r}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Textarea */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Describe what needs attention: <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g. The leak in the kitchen pipe started again after 2 hours. Needs washer replacement..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none bg-white"
          />
          {error && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="subtle" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Submit Revisit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};
