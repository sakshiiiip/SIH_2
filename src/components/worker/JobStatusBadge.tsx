import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookingState } from '../../types';

interface JobStatusBadgeProps {
  state: BookingState | 'new' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ state, size = 'sm', dot = true }) => {
  const { t } = useTranslation();

  const STATE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dotColor: string }> = {
    PENDING_ASSIGNMENT: { label: t('jobStatus.openRequest', 'Open Request'), bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dotColor: 'bg-amber-500 animate-pulse' },
    WORKER_ASSIGNED: { label: t('jobStatus.assigned', 'Assigned'), bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    PENDING_WORKER_ACCEPTANCE: { label: t('jobStatus.newAssignment', 'New Assignment'), bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dotColor: 'bg-amber-500 animate-pulse' },
    CONFIRMED:  { label: t('jobStatus.confirmed', 'Confirmed'), bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    TRAVELLING: { label: t('jobStatus.travelling', 'En Route'), bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dotColor: 'bg-sky-500 animate-pulse' },
    ARRIVED:    { label: t('jobStatus.arrived', 'Arrived On-Site'), bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dotColor: 'bg-sky-500' },
    IN_PROGRESS:{ label: t('jobStatus.inProgress', 'In Progress'), bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', dotColor: 'bg-indigo-500 animate-pulse' },
    BREAK_REQUESTED: { label: t('jobStatus.breakRequested', 'Break Requested'), bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dotColor: 'bg-amber-500 animate-pulse' },
    WORKER_ON_BREAK: { label: t('jobStatus.workerOnBreak', 'Worker on Break'), bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dotColor: 'bg-orange-500 animate-pulse' },
    WORK_RESUMED: { label: t('jobStatus.workResumed', 'Work Resumed'), bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    AWAITING_VERIFICATION: { label: t('jobStatus.awaitingVerification', 'Awaiting Verification'), bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dotColor: 'bg-sky-500' },
    COMPLETED:  { label: t('jobStatus.completed', 'Completed'), bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    PAID:       { label: t('jobStatus.paid', 'Paid & Settled'), bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    RATED:      { label: t('jobStatus.rated', 'Rated ★'), bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    REVISIT_REQUESTED: { label: t('jobStatus.revisitRequested', 'Revisit Requested'), bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dotColor: 'bg-purple-500' },
    REVISIT_SCHEDULED: { label: t('jobStatus.revisitScheduled', 'Revisit Scheduled'), bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dotColor: 'bg-purple-500' },
    REJECTED:   { label: t('jobStatus.rejected', 'Rejected'), bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dotColor: 'bg-rose-500' },
    CANCELLED:  { label: t('jobStatus.cancelled', 'Cancelled'), bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dotColor: 'bg-slate-400' },
    QUALITY_ISSUE: { label: t('jobStatus.qualityIssue', 'Quality Issue'), bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dotColor: 'bg-rose-500' },
    new:        { label: t('jobStatus.new', 'New Request'), bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dotColor: 'bg-amber-500 animate-pulse' },
    upcoming:   { label: t('jobStatus.upcoming', 'Upcoming'), bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dotColor: 'bg-sky-500' },
    in_progress:{ label: t('jobStatus.inProgress', 'In Progress'), bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', dotColor: 'bg-indigo-500 animate-pulse' },
    completed:  { label: t('jobStatus.completed', 'Completed'), bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    cancelled:  { label: t('jobStatus.cancelled', 'Cancelled'), bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dotColor: 'bg-slate-400' },
  };

  const FALLBACK = { label: t('jobStatus.unknown', 'Unknown'), bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dotColor: 'bg-slate-400' };

  const cfg = STATE_CONFIG[state] ?? FALLBACK;
  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 rounded-full text-xs font-semibold gap-1.5'
    : 'px-3 py-1 rounded-full text-xs font-semibold gap-1.5';

  return (
    <span className={`inline-flex items-center border tracking-tight ${sizeClasses} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`} />}
      {cfg.label}
    </span>
  );
};
