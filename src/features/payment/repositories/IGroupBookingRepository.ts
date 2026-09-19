/**
 * @file IGroupBookingRepository.ts
 * @description Repository interface (port) for Customer Group Bookings.
 *
 * Any concrete implementation (mock, REST API, Firebase, etc.)
 * must implement this interface. Consumers depend only on this contract.
 */

import {
  GroupBooking,
  GroupBookingParticipant,
  GroupBookingStatus,
  ParticipantInvoice,
  ParticipantPaymentRecord,
  GroupBookingWorkerAssignment,
  GroupBookingFilter,
  PaginatedGroupBookings,
  GroupBookingFinancialSummary,
  CostSplitStrategy,
  ParticipantPaymentMethod,
  ParticipantPaymentStatus,
} from '../types/groupBooking.types';
import { UrgencyTier } from '../../../types';

// ─── Input types for mutations ────────────────────────────────────────────────

export interface CreateGroupBookingInput {
  organiserId: string;
  organiserName: string;
  organiserPhone: string;
  organiserFlatNumber: string;
  societyId: string;
  societyName: string;
  federationId?: string;
  serviceCategory: string;
  problemType: string;
  description: string;
  urgencyTier: UrgencyTier;
  photos?: string[];
  minimumParticipants: number;
  maximumParticipants: number;
  preferredDate: string;
  preferredTimeStart: string;
  preferredTimeEnd: string;
  costSplitStrategy: CostSplitStrategy;
  estimatedTotalCost: number;
  groupDiscountPercent: number;
  notes?: string;
  bookingTag?: string;
}

export interface JoinGroupBookingInput {
  groupBookingId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  flatNumber: string;
  tower?: string;
  floor?: number;
  unitAreaSqFt?: number;
}

export interface InitiateParticipantPaymentInput {
  groupBookingId: string;
  participantId: string;
  invoiceId: string;
  paymentMethod: ParticipantPaymentMethod;
  upiId?: string;
  bankAccountDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountName: string;
  };
}

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface IGroupBookingRepository {
  /**
   * Creates a new group booking in DRAFT state.
   */
  createGroupBooking(input: CreateGroupBookingInput): Promise<GroupBooking>;

  /**
   * Publishes a DRAFT group booking → transitions to OPEN.
   */
  publishGroupBooking(groupBookingId: string): Promise<GroupBooking>;

  /**
   * Retrieves a single group booking by its ID.
   */
  getGroupBookingById(groupBookingId: string): Promise<GroupBooking | null>;

  /**
   * Returns a paginated, filtered list of group booking summary cards.
   */
  listGroupBookings(filter: GroupBookingFilter): Promise<PaginatedGroupBookings>;

  /**
   * Adds a new participant to an OPEN group booking.
   */
  joinGroupBooking(input: JoinGroupBookingInput): Promise<GroupBookingParticipant>;

  /**
   * Removes a participant from a group booking (opt-out or organiser removal).
   */
  removeParticipant(
    groupBookingId: string,
    participantId: string,
    reason: string,
  ): Promise<GroupBooking>;

  /**
   * Locks an OPEN booking once minimum participants are met.
   * Transitions → LOCKED and finalizes cost splits.
   */
  lockGroupBooking(groupBookingId: string): Promise<GroupBooking>;

  /**
   * Assigns one or more workers and transitions the booking → CONFIRMED.
   */
  assignWorkers(
    groupBookingId: string,
    assignments: Array<{
      workerId: string;
      workerName: string;
      workerPhone: string;
      workerProfession: string;
      assignedParticipantIds: string[];
    }>,
  ): Promise<GroupBooking>;

  /**
   * Verifies the arrival OTP and transitions booking → IN_PROGRESS.
   */
  verifyArrivalOtp(
    groupBookingId: string,
    workerAssignmentId: string,
    enteredOtp: string,
  ): Promise<boolean>;

  /**
   * Marks the entire group booking as COMPLETED and triggers invoice generation.
   */
  completeGroupBooking(
    groupBookingId: string,
    workNotes?: string,
    workPhotos?: string[],
  ): Promise<GroupBooking>;

  /**
   * Cancels a group booking.
   */
  cancelGroupBooking(
    groupBookingId: string,
    reason: string,
  ): Promise<GroupBooking>;

  /**
   * Generates invoices for all confirmed participants of a COMPLETED booking.
   * Transitions booking → INVOICED.
   */
  generateInvoices(groupBookingId: string): Promise<ParticipantInvoice[]>;

  /**
   * Returns the invoice for a specific participant.
   */
  getParticipantInvoice(invoiceId: string): Promise<ParticipantInvoice | null>;

  /**
   * Returns all invoices for a group booking.
   */
  getInvoicesForGroupBooking(groupBookingId: string): Promise<ParticipantInvoice[]>;

  /**
   * Initiates payment for a participant invoice.
   * Returns the payment record in PROCESSING state.
   */
  initiateParticipantPayment(
    input: InitiateParticipantPaymentInput,
  ): Promise<ParticipantPaymentRecord>;

  /**
   * Simulates a payment gateway callback — marks the payment as SUCCESS or FAILED.
   */
  confirmParticipantPayment(
    paymentId: string,
    success: boolean,
    gatewayTransactionId?: string,
    failureReason?: string,
  ): Promise<ParticipantPaymentRecord>;

  /**
   * Returns all payment records for a group booking.
   */
  getPaymentsForGroupBooking(groupBookingId: string): Promise<ParticipantPaymentRecord[]>;

  /**
   * Returns a single payment record by ID.
   */
  getPaymentById(paymentId: string): Promise<ParticipantPaymentRecord | null>;

  /**
   * Returns the overall payment status of a group booking
   * (e.g., how many participants have paid).
   */
  getGroupPaymentStatus(groupBookingId: string): Promise<{
    totalParticipants: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    totalDue: number;
    totalCollected: number;
    status: GroupBookingStatus;
  }>;

  /**
   * Returns the financial summary for a society manager.
   */
  getFinancialSummary(
    societyId: string,
    month: number,
    year: number,
  ): Promise<GroupBookingFinancialSummary>;

  /**
   * Returns all worker assignments for a group booking.
   */
  getWorkerAssignments(groupBookingId: string): Promise<GroupBookingWorkerAssignment[]>;

  /**
   * Updates a worker assignment's status (e.g., start/complete work).
   */
  updateWorkerAssignmentStatus(
    assignmentId: string,
    status: GroupBookingWorkerAssignment['status'],
    notes?: string,
    photos?: string[],
  ): Promise<GroupBookingWorkerAssignment>;
}
