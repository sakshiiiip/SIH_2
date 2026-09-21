import { BookingState } from '../types';

export type CustomerFacingStatus =
  | 'REQUESTED'
  | 'WORKER FOUND'
  | 'ON THE WAY'
  | 'WORKING'
  | 'COMPLETED';

export interface StatusMappingResult {
  customerStatus: CustomerFacingStatus;
  headline: string;
  description: string;
  badgeVariant: 'pending' | 'verified' | 'urgent' | 'coop' | 'completed' | 'danger';
  stepIndex: number; // 0 to 4
}

/**
 * Maps the 17 internal backend BookingStates to 5 simple, customer-friendly states.
 * Internal states:
 * - DRAFT, SUBMITTED, MATCHING, RE_MATCHING -> REQUESTED
 * - MATCHED, PENDING_WORKER_ACCEPTANCE, CONFIRMED -> WORKER FOUND
 * - TRAVELLING -> ON THE WAY
 * - ARRIVED, IN_PROGRESS -> WORKING
 * - COMPLETED, PAID, RATED -> COMPLETED
 * - QUALITY_ISSUE, REVIEW, REVISIT, REASSIGNED -> Contextual customer info
 */
export function mapBookingStatus(state: BookingState): StatusMappingResult {
  switch (state) {
    case 'DRAFT':
    case 'SUBMITTED':
    case 'MATCHING':
      return {
        customerStatus: 'REQUESTED',
        headline: 'Service Requested',
        description: 'Finding the best verified specialist near you',
        badgeVariant: 'pending',
        stepIndex: 0,
      };

    case 'RE_MATCHING':
      return {
        customerStatus: 'REQUESTED',
        headline: 'Finding Another Specialist',
        description: 'Cooperative matching engine is reassigning a verified worker',
        badgeVariant: 'urgent',
        stepIndex: 0,
      };

    case 'MATCHED':
    case 'PENDING_WORKER_ACCEPTANCE':
      return {
        customerStatus: 'WORKER FOUND',
        headline: 'Worker Found',
        description: 'Awaiting worker confirmation',
        badgeVariant: 'pending',
        stepIndex: 1,
      };

    case 'CONFIRMED':
      return {
        customerStatus: 'WORKER FOUND',
        headline: 'Worker Confirmed',
        description: 'Specialist accepted and preparing to travel',
        badgeVariant: 'verified',
        stepIndex: 1,
      };

    case 'TRAVELLING':
      return {
        customerStatus: 'ON THE WAY',
        headline: 'On The Way',
        description: 'Worker is travelling to your society · ETA ~12 min',
        badgeVariant: 'urgent',
        stepIndex: 2,
      };

    case 'ARRIVED':
      return {
        customerStatus: 'WORKING',
        headline: 'Worker Arrived',
        description: 'Please share your 4-digit arrival OTP to begin work',
        badgeVariant: 'verified',
        stepIndex: 3,
      };

    case 'IN_PROGRESS':
      return {
        customerStatus: 'WORKING',
        headline: 'Service In Progress',
        description: 'Work is actively underway at your residence',
        badgeVariant: 'coop',
        stepIndex: 3,
      };

    case 'WORKER_ON_BREAK':
      return {
        customerStatus: 'WORKING',
        headline: 'Worker on Short Break',
        description: 'Your specialist is on a brief break and will resume shortly',
        badgeVariant: 'urgent',
        stepIndex: 3,
      };

    case 'WORKER_ON_BREAK':
      return {
        customerStatus: 'WORKING',
        headline: 'Worker on Short Break',
        description: 'Your specialist is on a brief break and will resume shortly',
        badgeVariant: 'urgent',
        stepIndex: 3,
      };

    case 'COMPLETED':
      return {
        customerStatus: 'COMPLETED',
        headline: 'Work Completed',
        description: 'Service finished · Please confirm payment',
        badgeVariant: 'completed',
        stepIndex: 4,
      };

    case 'PAID':
      return {
        customerStatus: 'COMPLETED',
        headline: 'Payment Received',
        description: 'Thank you! Rate your specialist experience',
        badgeVariant: 'completed',
        stepIndex: 4,
      };

    case 'RATED':
      return {
        customerStatus: 'COMPLETED',
        headline: 'Service Completed',
        description: 'Rated & saved in your cooperative activity log',
        badgeVariant: 'completed',
        stepIndex: 4,
      };

    case 'QUALITY_ISSUE':
    case 'REVIEW':
      return {
        customerStatus: 'WORKING',
        headline: 'Quality Review',
        description: 'Society manager is reviewing service feedback',
        badgeVariant: 'danger',
        stepIndex: 3,
      };

    case 'AWAITING_VERIFICATION':
      return {
        customerStatus: 'WORKING',
        headline: 'Awaiting Verification',
        description: 'Worker has finished work. Inspect & confirm or request revisit.',
        badgeVariant: 'coop',
        stepIndex: 3,
      };

    case 'REVISIT_REQUESTED':
      return {
        customerStatus: 'WORKING',
        headline: 'Revisit Requested',
        description: 'Your revisit request is pending society manager scheduling',
        badgeVariant: 'urgent',
        stepIndex: 3,
      };

    case 'REVISIT_SCHEDULED':
      return {
        customerStatus: 'WORKING',
        headline: 'Revisit Scheduled',
        description: 'Specialist has been scheduled for complimentary follow-up',
        badgeVariant: 'verified',
        stepIndex: 3,
      };

    case 'CANCELLED':
      return {
        customerStatus: 'COMPLETED',
        headline: 'Booking Cancelled',
        description: 'This booking has been cancelled and closed',
        badgeVariant: 'danger',
        stepIndex: 4,
      };

    case 'PENDING_ASSIGNMENT':
      return {
        customerStatus: 'REQUESTED',
        headline: 'Pending Assignment',
        description: 'Assigning to verified cooperative specialist',
        badgeVariant: 'pending',
        stepIndex: 0,
      };

    case 'WORKER_ASSIGNED':
      return {
        customerStatus: 'WORKER FOUND',
        headline: 'Worker Assigned',
        description: 'Specialist assigned and awaiting final dispatch',
        badgeVariant: 'verified',
        stepIndex: 1,
      };

    case 'REVISIT':
    case 'REASSIGNED':
      return {
        customerStatus: 'WORKING',
        headline: 'Revisit Scheduled',
        description: 'A specialist has been dispatched for complimentary follow-up',
        badgeVariant: 'urgent',
        stepIndex: 3,
      };

    default:
      return {
        customerStatus: 'REQUESTED',
        headline: 'Service Scheduled',
        description: 'Processing service details',
        badgeVariant: 'pending',
        stepIndex: 0,
      };
  }
}
