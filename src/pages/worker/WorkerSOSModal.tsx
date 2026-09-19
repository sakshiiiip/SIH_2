import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { ServiceRequest } from '../../types';
import {
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  X,
} from 'lucide-react';

interface WorkerSOSModalProps {
  job: ServiceRequest;
  isOpen: boolean;
  onClose: () => void;
}

const WORKER_SOS_REASONS = [
  'Unsafe environment',
  'Customer safety issue',
  'Medical emergency',
  'Conflict',
  'Equipment problem',
  'Other',
];

export const WorkerSOSModal: React.FC<WorkerSOSModalProps> = ({ job, isOpen, onClose }) => {
  const { triggerActiveJobSOS } = useCooperativeStore();
  const [selectedReason, setSelectedReason] = useState(WORKER_SOS_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const ticket = triggerActiveJobSOS(job.id, 'worker', selectedReason, details || 'Worker emergency assistance requested on-site.');
      setSubmittedTicketId(ticket.id);
      setIsSubmitting(false);
    }, 350);
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
                Worker Safety SOS
              </span>
              <h3 className="text-base font-extrabold text-[#292824] mt-0.5">Worker Support Escalation</h3>
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
          {submittedTicketId ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 bg-[#E6ECE4] border-2 border-[#CFDDD0] rounded-full flex items-center justify-center mx-auto text-[#445D3E]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#445D3E]">
                  Support Dispatched
                </span>
                <h4 className="text-lg font-black text-[#292824]">Ticket <span className="font-mono font-bold">#{submittedTicketId}</span></h4>
                <p className="text-xs text-[#77736B] max-w-xs mx-auto">
                  Your Society Manager and Cooperative Support desk are on stand-by to assist immediately.
                </p>
              </div>

              {/* Direct Support line */}
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs">
                <span className="font-bold text-[#292824]">Worker Safety Line</span>
                <a
                  href="tel:18002008899"
                  className="px-3 py-1.5 bg-[#537895] text-white font-bold rounded-lg flex items-center gap-1 text-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Support</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#F3EEE4] hover:bg-[#E8E2D5] text-[#292824] text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
                  {WORKER_SOS_REASONS.map((reason) => {
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
                  placeholder="Describe the immediate situation..."
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
                    <span>Contact Support</span>
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
