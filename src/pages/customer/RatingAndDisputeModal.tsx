import React, { useState } from 'react';
import { Booking } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Star, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface RatingAndDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const RatingAndDisputeModal: React.FC<RatingAndDisputeModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { rateBooking, reportQualityIssue } = useCooperativeStore();

  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [showDisputeForm, setShowDisputeForm] = useState<boolean>(false);
  const [disputeType, setDisputeType] = useState<
    'incomplete_work' | 'poor_quality' | 'worker_issue' | 'damage' | 'other'
  >('poor_quality');
  const [disputeDescription, setDisputeDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  const handleSubmitRating = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      rateBooking(
        booking.id,
        rating,
        feedback || 'Great cooperative service! Punctual and skilled.'
      );
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleReportDispute = () => {
    if (!disputeDescription.trim()) {
      alert('Please describe the quality issue so the cooperative coordinator can assist.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      reportQualityIssue(booking.id, disputeType, disputeDescription);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showDisputeForm ? 'Report Quality Issue' : 'How was your service?'}
      subtitle={<span>Booking <span className="font-mono font-bold">#{booking.id}</span> · {booking.matchedWorker?.name || 'Worker'}</span>}
      maxWidth="md"
    >
      <div className="space-y-6">
        {!showDisputeForm ? (
          <>
            {/* 5-STAR RATING SELECTOR */}
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {rating === 5 && 'Excellent — Highly recommended!'}
                {rating === 4 && 'Good — Satisfactory work.'}
                {rating === 3 && 'Average — Met expectations.'}
                {rating === 2 && 'Below expectation.'}
                {rating === 1 && 'Unsatisfactory.'}
              </span>
            </div>

            {/* Quick compliment tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['Punctual arrival', 'Polite behaviour', 'Spotless cleanup', 'Expert repair'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFeedback((prev) => (prev ? `${prev}, ${tag}` : tag))}
                  className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Detailed Feedback (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share your experience to help the cooperative maintain quality..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmitRating}
              isLoading={isSubmitting}
            >
              Submit Rating
            </Button>

            {/* Quality Dispute Link */}
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDisputeForm(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Work was incomplete or facing issues? Report quality concern</span>
              </button>
            </div>
          </>
        ) : (
          /* QUALITY ISSUE DISPUTE REPORTING */
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              Cooperative Guarantee: If work is defective or incomplete, our society coordinator will review and assign a complimentary revisit at zero additional charge.
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Issue Category:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'incomplete_work', label: 'Incomplete work' },
                  { id: 'poor_quality', label: 'Poor quality / recurring leak' },
                  { id: 'worker_issue', label: 'Worker conduct / delay' },
                  { id: 'damage', label: 'Accidental damage' },
                  { id: 'other', label: 'Other concern' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDisputeType(item.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      disputeType === item.id
                        ? 'border-rose-600 bg-rose-50 text-rose-950 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Describe the specific issue:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. The tap joint started dripping again within 2 hours of repair..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="subtle"
                size="md"
                onClick={() => setShowDisputeForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleReportDispute}
                isLoading={isSubmitting}
              >
                Submit Quality Dispute
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
