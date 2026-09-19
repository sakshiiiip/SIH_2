/**
 * @file groupBooking.types.ts
 * @description Data models and interfaces for the Customer Group Bookings feature.
 *
 * Covers:
 *  - Community group booking creation (multiple users, shared service)
 *  - Participant tracking (join/leave, flat/unit details)
 *  - Shared cost splits (equal / custom / proportional)
 *  - Invoice generation per participant
 *  - Payment processing (individual participant payments)
 */

import { BookingState, UrgencyTier, PaymentBreakdown } from '../../../types';

// ─── Enums & Literals ────────────────────────────────────────────────────────

/** Overall status of the group booking. */
export type GroupBookingStatus =
  | 'DRAFT'             // Organiser has created but not published
  | 'OPEN'              // Published; accepting participants
  | 'LOCKED'            // Minimum quorum reached; no new joins
  | 'CONFIRMED'         // Worker(s) assigned; date confirmed
  | 'IN_PROGRESS'       // Work has started on-site
  | 'COMPLETED'         // All work done; pending payments
  | 'INVOICED'          // Invoices generated for all participants
  | 'PAID'              // All participants have paid
  | 'PARTIALLY_PAID'    // Some participants have paid
  | 'CANCELLED';        // Group booking cancelled

/** Status of an individual participant within a group booking. */
export type ParticipantStatus =
  | 'PENDING'           // Invited but has not confirmed
  | 'CONFIRMED'         // Has confirmed participation
  | 'OPT_OUT'           // Withdrew before confirmation
  | 'REMOVED'           // Removed by organiser
  | 'INVOICED'          // Individual invoice sent
  | 'PAID'              // Has paid their share
  | 'PAYMENT_FAILED';   // Payment attempt failed

/** Strategy to split the total cost among participants. */
export type CostSplitStrategy =
  | 'EQUAL'             // Divided equally by participant count
  | 'CUSTOM'            // Organiser specifies each participant's amount
  | 'PROPORTIONAL';     // Split by unit size / area (sq.ft.)

/** Status of an individual participant invoice. */
export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

/** Payment method chosen by a participant. */
export type ParticipantPaymentMethod =
  | 'UPI'
  | 'NET_BANKING'
  | 'CARD'
  | 'COOPERATIVE_WALLET'
  | 'CASH';

/** Status of a participant's payment record. */
export type ParticipantPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED';

// ─── Core Models ─────────────────────────────────────────────────────────────

/**
 * A single participant in a group booking.
 */
export interface GroupBookingParticipant {
  id: string;
  /** Reference to the User record. */
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  /** Apartment / flat / unit identifier within the society. */
  flatNumber: string;
  /** Tower / block within the society, if applicable. */
  tower?: string;
  /** Floor number (for proportional area splits). */
  floor?: number;
  /** Unit area in sq.ft. (used for PROPORTIONAL split). */
  unitAreaSqFt?: number;
  status: ParticipantStatus;
  /** ISO 8601 timestamp when the participant joined. */
  joinedAt: string;
  /** ISO 8601 timestamp of last status change. */
  updatedAt: string;
  /** Reason for opting out or being removed. */
  removalReason?: string;
  /** Invoice ID linked to this participant. */
  invoiceId?: string;
  /** Cost share assigned to this participant. */
  assignedCostShare?: number;
}

/**
 * Schedule slot for the group booking (when the work will happen).
 */
export interface GroupBookingSchedule {
  /** Preferred date. YYYY-MM-DD */
  preferredDate: string;
  /** Preferred time window start (HH:mm 24h). */
  preferredTimeStart: string;
  /** Preferred time window end (HH:mm 24h). */
  preferredTimeEnd: string;
  /** Confirmed date once worker is assigned. YYYY-MM-DD */
  confirmedDate?: string;
  confirmedTimeStart?: string;
  confirmedTimeEnd?: string;
}

/**
 * Details about how the cost will be (or was) split.
 */
export interface CostSplitDetails {
  strategy: CostSplitStrategy;
  /** Total cost for the entire group service. */
  totalGroupCost: number;
  /** Discount applied for booking as a group. */
  groupDiscountPercent: number;
  /** Total after group discount. */
  discountedTotal: number;
  /** Per-participant allocations (length = confirmed participants). */
  allocations: Array<{
    participantId: string;
    userId: string;
    customerName: string;
    flatNumber: string;
    /** Raw allocated amount before discount. */
    rawShare: number;
    /** Final share after discount. */
    finalShare: number;
    /** Proportional weight (e.g. area) for PROPORTIONAL strategy. */
    weight?: number;
  }>;
  /** Custom overrides (used for CUSTOM strategy). */
  customAmounts?: Record<string, number>; // participantId → amount
  /** Computed at time of finalization. */
  finalizedAt?: string;
}

/**
 * Revenue split for the entire group booking (mirrors PaymentBreakdown).
 */
export interface GroupBookingRevenueBreakdown extends PaymentBreakdown {
  /** Number of workers deployed for this group booking. */
  workerCount: number;
  /** Per-worker share (workerShare / workerCount). */
  perWorkerShare: number;
}

/**
 * A single line item within an invoice.
 */
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
}

/**
 * Invoice issued to a participant for their share of the group booking.
 */
export interface ParticipantInvoice {
  id: string;
  invoiceNumber: string; // e.g. "GBK-2026-00123-P04"
  groupBookingId: string;
  participantId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  flatNumber: string;
  societyName: string;
  /** ISO 8601 date the invoice was generated. */
  issuedAt: string;
  /** ISO 8601 due date for payment. */
  dueDate: string;
  lineItems: InvoiceLineItem[];
  /** Subtotal before tax. */
  subtotal: number;
  /** GST / tax rate percent. */
  taxRatePercent: number;
  /** Tax amount. */
  taxAmount: number;
  /** Final amount due. */
  totalDue: number;
  /** Amount paid (may be partial). */
  amountPaid: number;
  status: InvoiceStatus;
  /** Reference to payment record once paid. */
  paymentId?: string;
  /** PDF URL or base64 (populated by backend). */
  pdfUrl?: string;
  /** Notes from the organiser. */
  notes?: string;
}

/**
 * A payment record for a participant's invoice.
 */
export interface ParticipantPaymentRecord {
  id: string;
  groupBookingId: string;
  invoiceId: string;
  participantId: string;
  userId: string;
  customerName: string;
  amountDue: number;
  amountPaid: number;
  paymentMethod: ParticipantPaymentMethod;
  status: ParticipantPaymentStatus;
  /** Gateway transaction ID. */
  gatewayTransactionId?: string;
  /** UPI / bank reference ID. */
  paymentReference?: string;
  /** ISO 8601 timestamp when the payment was initiated. */
  initiatedAt: string;
  /** ISO 8601 timestamp when payment was confirmed. */
  confirmedAt?: string;
  /** Failure reason, if status is FAILED. */
  failureReason?: string;
  /** Whether a receipt has been sent to the customer. */
  receiptSent: boolean;
}

/**
 * Worker assignment for a group booking.
 * A group booking may require multiple workers (one per floor / tower).
 */
export interface GroupBookingWorkerAssignment {
  id: string;
  groupBookingId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerProfession: string;
  /** Subset of participants this worker is responsible for. */
  assignedParticipantIds: string[];
  /** Flats/units this worker will service. */
  assignedFlats: string[];
  status: BookingState;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  /** OTP verified on arrival. */
  arrivalOtpVerified?: boolean;
  workNotes?: string;
  workPhotos?: string[];
  /** Earnings for this worker from this assignment. */
  workerEarning?: number;
}

/**
 * Core Group Booking model — the top-level record for a community group booking.
 */
export interface GroupBooking {
  id: string;
  /** Display-friendly booking reference. e.g. "GBK-2026-00123" */
  referenceNumber: string;
  /** User ID of the resident who initiated the booking. */
  organiserId: string;
  organiserName: string;
  organiserPhone: string;
  organiserFlatNumber: string;
  societyId: string;
  societyName: string;
  federationId?: string;

  // Service details
  serviceCategory: string;
  problemType: string;
  description: string;
  urgencyTier: UrgencyTier;
  /** Photos of the issue submitted by the organiser. */
  photos: string[];

  // Participant management
  participants: GroupBookingParticipant[];
  /** Minimum number of confirmed participants needed to lock the booking. */
  minimumParticipants: number;
  /** Maximum number of participants allowed. */
  maximumParticipants: number;

  // Scheduling
  schedule: GroupBookingSchedule;

  // Cost & Payment
  costSplit: CostSplitDetails;
  revenueBreakdown?: GroupBookingRevenueBreakdown;

  // Worker assignments
  workerAssignments: GroupBookingWorkerAssignment[];

  // Invoices & Payments
  invoices: ParticipantInvoice[];
  payments: ParticipantPaymentRecord[];

  // Status & Lifecycle
  status: GroupBookingStatus;
  /** OTP for all workers to verify arrival. */
  arrivalOtp: string;
  createdAt: string;
  updatedAt: string;
  lockedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // Metadata
  notes?: string;
  /** Tag for the type of group (e.g., "annual_maintenance", "festive_cleaning"). */
  bookingTag?: string;
}

// ─── Summary & Dashboard Models ───────────────────────────────────────────────

/**
 * A lightweight card summary for listing group bookings.
 */
export interface GroupBookingSummaryCard {
  id: string;
  referenceNumber: string;
  serviceCategory: string;
  societyName: string;
  status: GroupBookingStatus;
  organiserName: string;
  organiserFlatNumber: string;
  confirmedParticipants: number;
  totalParticipants: number;
  totalGroupCost: number;
  userCostShare?: number;    // For a specific customer's view
  userPaymentStatus?: ParticipantPaymentStatus;
  preferredDate: string;
  createdAt: string;
}

/**
 * Financial summary of all group bookings for a society manager.
 */
export interface GroupBookingFinancialSummary {
  societyId: string;
  societyName: string;
  /** Current month */
  month: number;
  year: number;
  totalGroupBookings: number;
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  societyFundShare: number;
  cooperativeFundShare: number;
  totalWorkerPayouts: number;
  byStatus: Record<GroupBookingStatus, number>;
}

// ─── Filter & Pagination Interfaces ──────────────────────────────────────────

/** Filter options for listing group bookings. */
export interface GroupBookingFilter {
  societyId?: string;
  organiserId?: string;
  /** Filter for bookings where this userId is a participant. */
  participantUserId?: string;
  status?: GroupBookingStatus | GroupBookingStatus[];
  serviceCategory?: string;
  fromDate?: string;
  toDate?: string;
  searchQuery?: string;
  sortBy?: 'createdAt' | 'preferredDate' | 'totalGroupCost' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/** Paginated list result for group bookings. */
export interface PaginatedGroupBookings {
  groupBookings: GroupBookingSummaryCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
