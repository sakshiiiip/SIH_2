import React, { useState } from 'react';
import { Booking } from '../../types';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CheckCircle2, ShieldCheck, CreditCard, Sparkles, Building2, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess?: (booking: Booking) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}) => {
  const { config, payBooking } = useCooperativeStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  if (!isOpen || !booking) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      payBooking(booking.id);
      setIsProcessing(false);
      setIsPaid(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0f766e', '#14b8a6', '#f59e0b'],
      });

      setTimeout(() => {
        setIsPaid(false);
        onClose();
        if (onPaymentSuccess) {
          onPaymentSuccess(booking);
        }
      }, 1400);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transparent Payment"
      subtitle={<span>Settlement for Booking <span className="font-mono font-bold">#{booking.id}</span></span>}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Service Completed Banner */}
        <div className="flex items-center gap-3 p-4 bg-[#E6ECE4] border border-[#CFDDD0] rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[#6E8B67] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[#292824] text-base">Service Completed ✓</h4>
            <p className="text-xs text-[#524E47]">
              {booking.serviceCategory} — {booking.problemType}
            </p>
          </div>
        </div>

        {/* Itemized Transparent Distribution */}
        <div className="border border-[#E8E2D5] rounded-2xl p-5 bg-[#FCF9F3] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
            <span className="text-xs font-bold text-[#77736B] uppercase tracking-wider">
              Itemized Allocation
            </span>
            <span className="text-xs text-[#77736B]">Cooperative Formula</span>
          </div>

          <div className="space-y-3 text-sm">
            {/* Worker Share */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#6E8B67]" />
                <span className="text-[#292824] font-medium">Worker Direct Payout</span>
                <span className="text-xs text-[#77736B] font-mono">({config.workerSharePercent}%)</span>
              </div>
              <span className="font-bold font-mono text-[#292824]">
                ₹{booking.pricing.workerShare}
              </span>
            </div>

            {/* Society Share */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#B37055]" />
                <span className="text-[#292824] font-medium">
                  {booking.societyName} Share
                </span>
                <span className="text-xs text-[#77736B] font-mono">({config.societySharePercent}%)</span>
              </div>
              <span className="font-bold font-mono text-[#292824]">
                ₹{booking.pricing.societyShare}
              </span>
            </div>

            {/* Cooperative Fund */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#537895]" />
                <span className="text-[#292824] font-medium">
                  Cooperative Emergency & Tool Fund
                </span>
                <span className="text-xs text-[#77736B] font-mono">({config.cooperativeFundPercent}%)</span>
              </div>
              <span className="font-bold font-mono text-[#292824]">
                ₹{booking.pricing.cooperativeFund}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between">
            <span className="text-base font-bold text-[#292824]">Total Settlement</span>
            <span className="text-2xl font-bold font-mono text-[#292824]">
              ₹{booking.pricing.total}
            </span>
          </div>
        </div>

        {/* Transparent Guarantee Note */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p>
            Unlike commercial gig apps that extract 30%+ profit, your payment directly supports worker livelihoods, resident society upkeep, and zero-interest emergency tool loans.
          </p>
        </div>

        {/* Payment CTA */}
        <Button
          variant="primary"
          size="lg"
          onClick={handlePay}
          isLoading={isProcessing}
          disabled={isPaid}
          className="w-full"
          leftIcon={<CreditCard className="w-5 h-5" />}
        >
          {isPaid ? 'Payment Confirmed! ✓' : `Pay ₹${booking.pricing.total} via UPI / Card`}
        </Button>
      </div>
    </Modal>
  );
};
