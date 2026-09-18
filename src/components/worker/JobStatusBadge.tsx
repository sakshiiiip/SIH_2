import React from 'react';
import { BookingState } from '../../types';

interface JobStatusBadgeProps {
  state: BookingState | 'new' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const STATE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dotColor: string }> = {
  // Booking states (from store)
  PENDING_WORKER_ACCEPTANCE: { label: 'New Assignment', bg: 'bg-[#FAEDE8]', text: 'text-[#80432E]', border: 'border-[#F4DCD3]', dotColor: 'bg-[#B37055] animate-pulse' },
  CONFIRMED:  { label: 'Confirmed',       bg: 'bg-[#E6ECE4]', text: 'text-[#364A32]', border: 'border-[#CFDDD0]', dotColor: 'bg-[#6E8B67]' },
  TRAVELLING: { label: 'En Route',        bg: 'bg-[#E4EDF4]', text: 'text-[#2B4C68]', border: 'border-[#B8CBDD]', dotColor: 'bg-[#537895] animate-pulse' },
  ARRIVED:    { label: 'Arrived On-Site', bg: 'bg-[#E4EDF4]', text: 'text-[#2B4C68]', border: 'border-[#B8CBDD]', dotColor: 'bg-[#537895]' },
  IN_PROGRESS:{ label: 'In Progress',     bg: 'bg-[#EFEBF4]', text: 'text-[#3D314C]', border: 'border-[#DFD8E8]', dotColor: 'bg-[#7A6A8E] animate-pulse' },
  COMPLETED:  { label: 'Completed',       bg: 'bg-[#E6ECE4]', text: 'text-[#364A32]', border: 'border-[#CFDDD0]', dotColor: 'bg-[#6E8B67]' },
  PAID:       { label: 'Paid & Settled',  bg: 'bg-[#E6ECE4]', text: 'text-[#364A32]', border: 'border-[#CFDDD0]', dotColor: 'bg-[#6E8B67]' },
  RATED:      { label: 'Rated ★',         bg: 'bg-[#E6ECE4]', text: 'text-[#364A32]', border: 'border-[#CFDDD0]', dotColor: 'bg-[#6E8B67]' },
  REJECTED:   { label: 'Rejected',        bg: 'bg-[#FAEBEB]', text: 'text-[#632727]', border: 'border-[#F4D7D7]', dotColor: 'bg-[#B86B6B]' },
  QUALITY_ISSUE: { label: 'Quality Issue', bg: 'bg-[#FAEBEB]', text: 'text-[#632727]', border: 'border-[#F4D7D7]', dotColor: 'bg-[#B86B6B]' },
  // Mock data states
  new:        { label: 'New Request',     bg: 'bg-[#FAEDE8]', text: 'text-[#80432E]', border: 'border-[#F4DCD3]', dotColor: 'bg-[#B37055] animate-pulse' },
  upcoming:   { label: 'Upcoming',        bg: 'bg-[#E4EDF4]', text: 'text-[#2B4C68]', border: 'border-[#B8CBDD]', dotColor: 'bg-[#537895]' },
  in_progress:{ label: 'In Progress',     bg: 'bg-[#EFEBF4]', text: 'text-[#3D314C]', border: 'border-[#DFD8E8]', dotColor: 'bg-[#7A6A8E] animate-pulse' },
  completed:  { label: 'Completed',       bg: 'bg-[#E6ECE4]', text: 'text-[#364A32]', border: 'border-[#CFDDD0]', dotColor: 'bg-[#6E8B67]' },
  cancelled:  { label: 'Cancelled',       bg: 'bg-[#F3EEE4]', text: 'text-[#524E47]', border: 'border-[#E8E2D5]', dotColor: 'bg-[#9A958B]' },
};

const FALLBACK = { label: 'Unknown', bg: 'bg-[#F3EEE4]', text: 'text-[#524E47]', border: 'border-[#E8E2D5]', dotColor: 'bg-[#9A958B]' };

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ state, size = 'sm', dot = true }) => {
  const cfg = STATE_CONFIG[state] ?? FALLBACK;
  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 rounded-full gap-1'
    : 'text-xs px-2.5 py-1 rounded-full gap-1.5';

  return (
    <span className={`inline-flex items-center border font-medium tracking-tight ${sizeClasses} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`} />}
      {cfg.label}
    </span>
  );
};
