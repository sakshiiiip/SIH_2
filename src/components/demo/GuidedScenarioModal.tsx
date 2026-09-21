import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Play,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Cpu,
  UserX,
  UserCheck,
  Navigation,
  MapPin,
  KeyRound,
  CreditCard,
  Star,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GuidedScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const GuidedScenarioModal: React.FC<GuidedScenarioModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    createBooking,
    bookings,
    workers,
    setRole,
    rejectBookingByWorker,
    acceptBookingByWorker,
    updateBookingState,
    verifyBookingOTP,
    completeBooking,
    payBooking,
    rateBooking,
    reportQualityIssue,
    adminReviewQualityIssue,
    adminReassignQualityIssue,
    completeRevisit,
  } = useCooperativeStore();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentBooking = bookings.find((b) => b.id === createdBookingId) || bookings[0];

  const steps = [
    {
      step: 1,
      title: 'Customer Requests Emergency Plumbing',
      actor: 'Customer (Ananya)',
      badge: 'emergency',
      description:
        'Customer triggers an immediate emergency plumbing request for severe pipe burst at Green Residency.',
      actionLabel: '1. Dispatch Emergency Request',
      action: () => {
        setRole('customer');
        const newBooking = createBooking({
          serviceCategory: 'Plumbing',
          problemType: 'Severe pipe burst / continuous water leakage',
          details: 'URGENT SCENARIO: Water spraying under kitchen sink valve.',
          urgencyTier: 'EMERGENCY',
          societyName: 'Green Residency',
          customAddress: 'Flat 402, Tower B, Green Residency',
        });
        setCreatedBookingId(newBooking.id);
        if (onNavigateTab) onNavigateTab('home');
      },
    },
    {
      step: 2,
      title: 'Request Enters Priority Queue & Matching',
      actor: 'AI Fair Allocation Engine',
      badge: 'coop',
      description:
        'Algorithmic match engine evaluates certified local plumbers on skill compatibility, proximity, and current workload balance. Candidate 1 (Amit Kumar) is selected.',
      actionLabel: '2. Inspect Matching & Alert Candidate 1',
      action: () => {
        setRole('society_manager');
        if (onNavigateTab) onNavigateTab('soc_dashboard');
      },
    },
    {
      step: 3,
      title: 'Candidate Worker 1 Rejects the Job',
      actor: 'Worker 1 (Amit Kumar)',
      badge: 'danger',
      description:
        'Candidate 1 (Amit Kumar) is currently in another task and declines the job offer.',
      actionLabel: '3. Simulate Worker 1 Rejecting Job',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        rejectBookingByWorker(bId, 'w_amit');
        setRole('worker');
        if (onNavigateTab) onNavigateTab('worker_dashboard');
      },
    },
    {
      step: 4,
      title: 'System Triggers Automatic Fair Re-Matching',
      actor: 'System Re-matching Engine',
      badge: 'urgent',
      description:
        'The platform automatically re-scores remaining eligible candidates excluding Amit. Candidate 2 (Rahul Sharma, 96% match score) is immediately matched without customer restart.',
      actionLabel: '4. Re-match with Candidate 2 (Rahul)',
      action: () => {
        setRole('customer');
        if (onNavigateTab) onNavigateTab('home');
      },
    },
    {
      step: 5,
      title: 'Worker 2 (Rahul) Accepts the Job',
      actor: 'Worker 2 (Rahul Sharma)',
      badge: 'verified',
      description:
        'Rahul Sharma reviews the emergency job details and accepts. The booking moves to CONFIRMED.',
      actionLabel: '5. Rahul Accepts Job',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        acceptBookingByWorker(bId, 'w_rahul');
        setRole('worker');
        if (onNavigateTab) onNavigateTab('worker_dashboard');
      },
    },
    {
      step: 6,
      title: 'Worker Travels & Arrives at Customer',
      actor: 'Worker (Rahul Sharma)',
      badge: 'coop',
      description:
        'Rahul updates status to TRAVELLING (notifying resident) and subsequently marks ARRIVED at Green Residency.',
      actionLabel: '6. Travel & Confirm Arrival',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        updateBookingState(bId, 'TRAVELLING');
        setTimeout(() => {
          updateBookingState(bId, 'ARRIVED');
        }, 800);
      },
    },
    {
      step: 7,
      title: 'Customer OTP Verification & Job Starts',
      actor: 'Customer + Worker',
      badge: 'verified',
      description:
        `Customer shares the secure 4-digit code (${currentBooking?.otp || '4829'}) with Rahul. OTP is verified and status advances to IN_PROGRESS.`,
      actionLabel: '7. Verify OTP & Start Job',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        verifyBookingOTP(bId, currentBooking?.otp || '4829');
      },
    },
    {
      step: 8,
      title: 'Worker Completes Repair Job',
      actor: 'Worker (Rahul Sharma)',
      badge: 'completed',
      description:
        'Rahul replaces the cracked inlet gasket, checks water pressure, attaches post-work photo, and marks job as COMPLETED.',
      actionLabel: '8. Complete Job & Notes',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        completeBooking(
          bId,
          'Replaced failed kitchen sink coupling and Teflon gasket. Tested under full mains pressure.'
        );
        setRole('customer');
        if (onNavigateTab) onNavigateTab('home');
      },
    },
    {
      step: 9,
      title: 'Transparent Payment & Fund Credit',
      actor: 'Customer Settlement',
      badge: 'coop',
      description:
        'Customer settles ₹600: Worker receives ₹420 (70%), Green Residency society receives ₹30 (5%), and Cooperative Fund receives ₹150 (25%).',
      actionLabel: '9. Settle Payment',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        payBooking(bId);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      },
    },
    {
      step: 10,
      title: 'Customer Rates & Flags Quality Dispute',
      actor: 'Customer (Ananya)',
      badge: 'danger',
      description:
        'Customer rates service and reports minor seepage fitting issue: "Minor seep from cold line connection."',
      actionLabel: '10. Report Quality Dispute',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        rateBooking(bId, 4, 'Very fast arrival, but slight moisture dripping from the cold connector.');
        reportQualityIssue(
          bId,
          'poor_quality',
          'Slight drip noticed at the base connector after 30 minutes.'
        );
      },
    },
    {
      step: 11,
      title: 'Admin Reviews Dispute & Assigns Revisit',
      actor: 'Society Manager (Suresh Menon)',
      badge: 'urgent',
      description:
        'Society Manager reviews customer claim in Quality Disputes desk and dispatches a complimentary senior revisit ticket.',
      actionLabel: '11. Society Manager Reassigns Revisit',
      action: () => {
        setRole('society_manager');
        const bId = createdBookingId || currentBooking.id;
        adminReviewQualityIssue(bId, 'Customer report verified. Scheduling priority revisit.');
        adminReassignQualityIssue(bId, 'w_priya');
        if (onNavigateTab) onNavigateTab('soc_quality');
      },
    },
    {
      step: 12,
      title: 'Revisit Completed & Dispute Resolved',
      actor: 'Cooperative Resolution',
      badge: 'completed',
      description:
        'Senior specialist completes the complimentary inspection and secures the fitting. Customer dispute is resolved successfully!',
      actionLabel: '12. Finalize Revisit & Complete Flow',
      action: () => {
        const bId = createdBookingId || currentBooking.id;
        completeRevisit(bId);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      },
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleExecuteCurrentStep = () => {
    setIsExecuting(true);
    currentStep.action();
    setTimeout(() => {
      setIsExecuting(false);
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Section 44: End-to-End Demonstration Walkthrough"
      subtitle={`Interactive Scripted Scenario · Step ${currentStepIndex + 1} of ${steps.length}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Scenario Progress Header */}
        <div className="p-4 bg-[#292824] text-[#FAF7F2] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card border border-[#383530]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-[#6E8B67]/30 text-[#CFDDD0] px-2 py-0.5 rounded font-mono font-bold">
                STEP {currentStepIndex + 1}/{steps.length}
              </span>
              <span className="text-xs text-[#BCB7AD] font-semibold">
                Perspective: {currentStep.actor}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#FAF7F2]">
              {currentStep.title}
            </h3>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#383530] border border-[#524E47] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#E9C5B5]" />
          </div>
        </div>

        {/* Step Description */}
        <div className="p-4 border border-[#E8E2D5] rounded-2xl bg-[#FCF9F3] space-y-2">
          <span className="text-xs font-semibold text-[#9A958B] uppercase tracking-wider block">
            What Happens at this Step:
          </span>
          <p className="text-sm text-[#524E47] leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Action Trigger */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8E2D5]">
          <div className="flex items-center gap-2 text-xs text-[#77736B]">
            <span>Booking ID:</span>
            <span className="font-mono font-bold text-[#292824]">
              {createdBookingId || currentBooking.id}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStepIndex > 0 && (
              <Button
                variant="subtle"
                size="md"
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              >
                Previous
              </Button>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleExecuteCurrentStep}
              isLoading={isExecuting}
              className="flex-1 sm:flex-initial"
              rightIcon={<Play className="w-4 h-4" />}
            >
              {currentStep.actionLabel}
            </Button>
          </div>
        </div>

        {/* Complete Overview List */}
        <div className="pt-4 border-t border-[#E8E2D5]">
          <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider block mb-2">
            Scenario Steps Outline:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {steps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'border-[#6E8B67] bg-[#E6ECE4] text-[#2A3927] font-bold'
                    : idx < currentStepIndex
                    ? 'border-[#E8E2D5] bg-[#F3EEE4] text-[#9A958B] line-through'
                    : 'border-[#E8E2D5]/70 bg-[#FCF9F3] text-[#524E47] hover:border-[#D8CFBE]'
                }`}
              >
                <div className="text-[10px] text-[#9A958B]">0{s.step}</div>
                <div className="truncate">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
