import React, { useState } from 'react';
import { WorkerJobRequest } from '../../data/workerMockData';
import { JobStatusBadge } from './JobStatusBadge';
import {
  MapPin,
  Clock,
  User,
  DollarSign,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Phone,
  Navigation,
} from 'lucide-react';

interface JobRequestCardProps {
  job: WorkerJobRequest;
  onAccept: (jobId: string) => void;
  onDecline: (jobId: string) => void;
  isProcessing?: boolean;
}

const PRIORITY_MAP = {
  emergency: { label: 'EMERGENCY', bg: 'bg-[#FAEBEB]', text: 'text-[#C93B2B]', border: 'border-[#F4D7D7]', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  urgent:    { label: 'URGENT',    bg: 'bg-[#FAEDE8]', text: 'text-[#80432E]', border: 'border-[#F4DCD3]', icon: <Zap className="w-3.5 h-3.5" /> },
  normal:    { label: 'STANDARD',  bg: 'bg-[#E4EDF4]', text: 'text-[#2B4C68]', border: 'border-[#B8CBDD]', icon: null },
};

export const JobRequestCard: React.FC<JobRequestCardProps> = ({
  job,
  onAccept,
  onDecline,
  isProcessing = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const priority = PRIORITY_MAP[job.priority];

  const handleDeclineConfirm = () => {
    onDecline(job.jobId);
    setShowDeclineConfirm(false);
    setDeclineReason('');
  };

  return (
    <div className={`rounded-2xl border-2 shadow-card overflow-hidden transition-all ${
      job.priority === 'emergency'
        ? 'border-[#F4D7D7] bg-[#FEF9F9]'
        : job.priority === 'urgent'
        ? 'border-[#E98074] bg-[#FAEDE8]'
        : 'border-[#B8CBDD] bg-[#F4F8FC]'
    }`}>
      {/* Priority banner */}
      {job.priority !== 'normal' && (
        <div className={`flex items-center gap-1.5 px-4 py-1.5 ${priority.bg} ${priority.text} border-b ${priority.border}`}>
          {priority.icon}
          <span className="text-[11px] font-extrabold tracking-widest uppercase">{priority.label} JOB REQUEST</span>
          {job.priority === 'emergency' && (
            <span className="ml-auto text-[11px] font-bold animate-pulse">Expires in 2 min</span>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E4EDF4] text-[#324F66] border border-[#B8CBDD] rounded-md">
                {job.serviceType}
              </span>
              <JobStatusBadge state="new" />
              <span className="text-[10px] font-mono text-[#9A958B]">#{job.jobId}</span>
            </div>
            <h3 className="text-base font-bold text-[#292824]">{job.problemType}</h3>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg font-bold font-mono text-[#445D3E] block">₹{job.estimatedEarnings}</span>
            <span className="text-[10px] text-[#77736B]">est. earnings</span>
          </div>
        </div>

        {/* Key info */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs text-[#524E47]">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#537895] shrink-0" />
            <strong className="text-[#292824]">{job.customer.name}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#80432E] shrink-0" />
            <span className="truncate">{job.distance}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#537895] shrink-0" />
            <span>{job.date}, {job.time}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#537895] shrink-0" />
            <span className="truncate text-[#292824]">{job.location}</span>
          </span>
        </div>

        {/* Location address */}
        <div className="flex items-start gap-1.5 text-xs text-[#77736B]">
          <MapPin className="w-3.5 h-3.5 text-[#80432E] shrink-0 mt-0.5" />
          <span>{job.customer.address}</span>
        </div>

        {/* Expand/Collapse description */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#537895] font-medium hover:underline cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide' : 'Show'} job description
        </button>

        {expanded && (
          <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47] space-y-2">
            <p className="italic">"{job.description}"</p>
            {job.allocationReason && (
              <p className="text-[#364A32] font-semibold">
                🤖 AI Allocation: {job.allocationReason}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[#77736B]">
              <Phone className="w-3 h-3" />
              <span>{job.customer.phone}</span>
            </div>
          </div>
        )}

        {/* Earnings breakdown */}
        <div className="flex items-center gap-2 p-2.5 bg-[#EEF3EC] border border-[#CFDDD0] rounded-xl">
          <DollarSign className="w-4 h-4 text-[#6E8B67] shrink-0" />
          <span className="text-xs text-[#364A32]">
            Your share: <strong className="font-mono">₹{job.estimatedEarnings}</strong>
            <span className="text-[#527048] ml-1">(70% of ₹{Math.round(job.estimatedEarnings / 0.7)})</span>
          </span>
        </div>

        {/* Decline confirm panel */}
        {showDeclineConfirm && (
          <div className="p-3 bg-[#FAEBEB] border border-[#F4D7D7] rounded-xl space-y-2">
            <p className="text-xs font-bold text-[#632727]">Reason for declining (optional):</p>
            <select
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#B86B6B]"
            >
              <option value="">Select a reason...</option>
              <option value="too_far">Location too far</option>
              <option value="no_skills">Outside my skill set</option>
              <option value="on_break">Currently on break</option>
              <option value="personal">Personal reasons</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeclineConfirm(false)}
                className="flex-1 px-3 py-2 bg-white border border-[#E8E2D5] text-[#524E47] text-xs font-bold rounded-xl cursor-pointer hover:bg-[#F3EEE4]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDeclineConfirm}
                className="flex-1 px-3 py-2 bg-[#B86B6B] hover:bg-[#9B4E4E] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!showDeclineConfirm && (
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowDeclineConfirm(true)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-[#FCF9F3] hover:bg-[#F3EEE4] border border-[#E8E2D5] text-[#80432E] text-sm font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => onAccept(job.jobId)}
              disabled={isProcessing}
              className="flex-[2] px-4 py-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-sm font-bold rounded-xl cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              {isProcessing ? 'Processing…' : `Accept Job — ₹${job.estimatedEarnings}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
