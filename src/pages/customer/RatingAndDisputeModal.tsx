import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Booking } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import {
  Star,
  AlertTriangle,
  ShieldCheck,
  Check,
  RotateCcw,
  ImageIcon,
  Sparkles,
} from 'lucide-react';

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
  const { t } = useTranslation();
  const { rateBooking, reportQualityIssue, requestRevisit } = useCooperativeStore();

  const [mode, setMode] = useState<'rate' | 'dispute' | 'revisit'>('rate');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [disputeType, setDisputeType] = useState<
    'incomplete_work' | 'poor_quality' | 'worker_issue' | 'damage' | 'other'
  >('poor_quality');
  const [disputeDescription, setDisputeDescription] = useState<string>('');
  const [revisitReason, setRevisitReason] = useState<string>('');
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

  const handleRequestRevisit = () => {
    if (!revisitReason.trim()) {
      alert('Please describe why a revisit is required.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      requestRevisit(booking.id, { reason: revisitReason.trim() });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const hasPhotos = Boolean(
    booking.beforeImage || booking.afterImage || (booking.workPhotos && booking.workPhotos.length > 0)
  );

  const complimentTags = [
    { key: 'tagPunctual', label: t('dispute.tagPunctual', 'Punctual arrival') },
    { key: 'tagPolite', label: t('dispute.tagPolite', 'Polite behaviour') },
    { key: 'tagCleanup', label: t('dispute.tagCleanup', 'Spotless cleanup') },
    { key: 'tagExpert', label: t('dispute.tagExpert', 'Expert repair') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'revisit'
          ? t('dispute.revisitTitle', 'Request Service Revisit')
          : mode === 'dispute'
          ? t('dispute.disputeTitle', 'Report Quality Concern')
          : t('dispute.rateTitle', 'How was your service?')
      }
      subtitle={
        <span>
          Booking <span className="font-mono font-bold">#{booking.id}</span> ·{' '}
          {booking.matchedWorker?.name || 'Worker'}
        </span>
      }
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Before / After Photo Comparison Preview if photos exist */}
        {hasPhotos && (
          <div className="p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-2xl space-y-2">
            <span className="text-xs font-semibold text-[#524E47] flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#6E8B67]" />
              {t('dispute.workProof', 'Work Execution Proof (Before & After)')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5] bg-white h-24">
                {booking.beforeImage ? (
                  <img
                    src={booking.beforeImage}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[#77736B]">
                    {t('dispute.noBefore', 'No Before Photo')}
                  </div>
                )}
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  {t('dispute.before', 'Before')}
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-[#6E8B67] bg-white h-24">
                {booking.afterImage || (booking.workPhotos && booking.workPhotos[0]) ? (
                  <img
                    src={booking.afterImage || (booking.workPhotos && booking.workPhotos[0])}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[#77736B]">
                    {t('dispute.noAfter', 'No After Photo')}
                  </div>
                )}
                <span className="absolute bottom-1 left-1 bg-[#445D3E] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  {t('dispute.after', 'After ✓')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE 1: RATE SERVICE ── */}
        {mode === 'rate' && (
          <>
            {/* 5-STAR RATING SELECTOR */}
            <div className="text-center py-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
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
                {rating === 5 && t('dispute.excellent', 'Excellent — Highly recommended!')}
                {rating === 4 && t('dispute.good', 'Good — Satisfactory work.')}
                {rating === 3 && t('dispute.average', 'Average — Met expectations.')}
                {rating === 2 && t('dispute.below', 'Below expectation.')}
                {rating === 1 && t('dispute.unsatisfactory', 'Unsatisfactory.')}
              </span>
            </div>

            {/* Quick compliment tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {complimentTags.map(
                (item) => (
                  <button
                    key={item.key}
                    onClick={() => setFeedback((prev) => (prev ? `${prev}, ${item.label}` : item.label))}
                    className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                )
              )}
            </div>

            {/* Textarea */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('dispute.detailedFeedback', 'Detailed Feedback (Optional)')}
              </label>
              <textarea
                rows={3}
                placeholder={t('dispute.feedbackPlaceholder', 'Share your experience to help the cooperative maintain quality...')}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none bg-white"
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
              {t('dispute.submitRating', 'Submit Rating')}
            </Button>

            {/* Quality Dispute / Revisit Options */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <button
                onClick={() => setMode('revisit')}
                className="text-amber-800 hover:text-amber-950 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('dispute.needFollowup', 'Need follow-up? Request Revisit')}</span>
              </button>

              <button
                onClick={() => setMode('dispute')}
                className="text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('dispute.reportDispute', 'Report quality dispute')}</span>
              </button>
            </div>
          </>
        )}

        {/* ── MODE 2: REQUEST REVISIT ── */}
        {mode === 'revisit' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <strong className="block font-bold">{t('dispute.revisitNoticeTitle', 'Complimentary Cooperative Revisit')}</strong>
              <p>
                {t('dispute.revisitNoticeDesc', 'If the service requires follow-up, our society manager will coordinate a free revisit with the technician.')}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('dispute.reasonForRevisit', 'Reason for Revisit:')}
              </label>
              <textarea
                rows={3}
                placeholder={t('dispute.revisitPlaceholder', 'e.g. Joint slightly dripping under heavy water pressure. Needs second inspection...')}
                value={revisitReason}
                onChange={(e) => setRevisitReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button variant="subtle" size="md" onClick={() => setMode('rate')}>
                {t('dispute.backToRating', 'Back to Rating')}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleRequestRevisit}
                isLoading={isSubmitting}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                {t('dispute.submitRevisit', 'Submit Revisit Request')}
              </Button>
            </div>
          </div>
        )}

        {/* ── MODE 3: QUALITY ISSUE DISPUTE ── */}
        {mode === 'dispute' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {t('dispute.disputeGuarantee', 'Cooperative Guarantee: If work is defective or incomplete, our society coordinator will review and assign a complimentary revisit at zero additional charge.')}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                {t('dispute.issueCategory', 'Issue Category:')}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'incomplete_work', label: t('dispute.incompleteWork', 'Incomplete work') },
                  { id: 'poor_quality', label: t('dispute.poorQuality', 'Poor quality / recurring leak') },
                  { id: 'worker_issue', label: t('dispute.workerIssue', 'Worker conduct / delay') },
                  { id: 'damage', label: t('dispute.damage', 'Accidental damage') },
                  { id: 'other', label: t('dispute.otherConcern', 'Other concern') },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDisputeType(item.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
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
                {t('dispute.describeIssue', 'Describe the specific issue:')}
              </label>
              <textarea
                rows={3}
                placeholder={t('dispute.disputePlaceholder', 'e.g. The tap joint started dripping again within 2 hours of repair...')}
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 resize-none bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="subtle" size="md" onClick={() => setMode('rate')}>
                {t('dispute.backToRating', 'Back to Rating')}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleReportDispute}
                isLoading={isSubmitting}
              >
                {t('dispute.submitDispute', 'Submit Quality Dispute')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
