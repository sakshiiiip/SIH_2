/**
 * @file GroupBookingService.ts
 * @description Application-level service for Customer Group Bookings.
 *
 * Orchestrates lifecycle transitions, business-rule enforcement, and
 * cross-cutting concerns (notifications, audit events) between the
 * repository and the rest of the app.
 */

import {
  IGroupBookingRepository,
  CreateGroupBookingInput,
  JoinGroupBookingInput,
  InitiateParticipantPaymentInput,
} from '../repositories/IGroupBookingRepository';
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
  GroupBookingSummaryCard,
  ParticipantPaymentMethod,
  CostSplitStrategy,
} from '../types/groupBooking.types';
import { UrgencyTier } from '../../../types';

// ─── DTOs returned to the UI ──────────────────────────────────────────────────

export interface GroupBookingDetailView {
  booking: GroupBooking;
  paymentStatus: {
    totalParticipants: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    totalDue: number;
    totalCollected: number;
    status: GroupBookingStatus;
  };
  workerAssignments: GroupBookingWorkerAssignment[];
  invoices: ParticipantInvoice[];
  payments: ParticipantPaymentRecord[];
}

export interface ParticipantBookingView {
  booking: GroupBookingSummaryCard;
  myParticipation: GroupBookingParticipant | null;
  myInvoice: ParticipantInvoice | null;
  myPayment: ParticipantPaymentRecord | null;
}

export interface OrganiserDashboard {
  myOpenBookings: GroupBookingSummaryCard[];
  myCompletedBookings: GroupBookingSummaryCard[];
  awaitingPayment: GroupBookingSummaryCard[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class GroupBookingService {
  constructor(private readonly repo: IGroupBookingRepository) {}

  // ── Creation & Publishing ──────────────────────────────────────────────────

  /**
   * Creates a group booking in DRAFT state and immediately publishes it (OPEN).
   * The organiser is automatically added as the first participant.
   */
  async createAndPublish(input: CreateGroupBookingInput): Promise<GroupBooking> {
    const gb = await this.repo.createGroupBooking(input);
    const published = await this.repo.publishGroupBooking(gb.id);

    // Auto-add organiser as first confirmed participant.
    await this.repo.joinGroupBooking({
      groupBookingId: published.id,
      userId: input.organiserId,
      customerName: input.organiserName,
      customerPhone: input.organiserPhone,
      flatNumber: input.organiserFlatNumber,
    });

    return this.repo.getGroupBookingById(published.id) as Promise<GroupBooking>;
  }

  /**
   * Creates a group booking but keeps it in DRAFT state for review before publishing.
   */
  async createDraft(input: CreateGroupBookingInput): Promise<GroupBooking> {
    return this.repo.createGroupBooking(input);
  }

  /**
   * Publishes an existing DRAFT group booking.
   */
  async publish(groupBookingId: string): Promise<GroupBooking> {
    return this.repo.publishGroupBooking(groupBookingId);
  }

  // ── Participant Management ─────────────────────────────────────────────────

  /**
   * Adds a resident as a confirmed participant.
   */
  async joinBooking(input: JoinGroupBookingInput): Promise<GroupBookingParticipant> {
    return this.repo.joinGroupBooking(input);
  }

  /**
   * Allows a participant to opt out before the booking is locked.
   */
  async optOut(
    groupBookingId: string,
    participantId: string,
  ): Promise<GroupBooking> {
    return this.repo.removeParticipant(
      groupBookingId,
      participantId,
      'Participant opted out',
    );
  }

  /**
   * Organiser removes a participant.
   */
  async removeParticipant(
    groupBookingId: string,
    participantId: string,
    reason: string,
  ): Promise<GroupBooking> {
    return this.repo.removeParticipant(groupBookingId, participantId, reason);
  }

  // ── Lifecycle Transitions ──────────────────────────────────────────────────

  /**
   * Locks the booking when enough participants have confirmed.
   * Finalized cost splits are computed at this point.
   */
  async lock(groupBookingId: string): Promise<GroupBooking> {
    return this.repo.lockGroupBooking(groupBookingId);
  }

  /**
   * Auto-locks the booking if the participant count reaches maximumParticipants.
   * Call this after each successful joinBooking().
   */
  async autoLockIfFull(groupBookingId: string): Promise<GroupBooking> {
    const gb = await this.repo.getGroupBookingById(groupBookingId);
    if (!gb) throw new Error(`Booking '${groupBookingId}' not found.`);

    const confirmed = gb.participants.filter(p =>
      ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status),
    ).length;

    if (confirmed >= gb.maximumParticipants && gb.status === 'OPEN') {
      return this.repo.lockGroupBooking(groupBookingId);
    }
    return gb;
  }

  /**
   * Assigns workers to a LOCKED booking and transitions to CONFIRMED.
   */
  async assignWorkers(
    groupBookingId: string,
    assignments: Array<{
      workerId: string;
      workerName: string;
      workerPhone: string;
      workerProfession: string;
      assignedParticipantIds: string[];
    }>,
  ): Promise<GroupBooking> {
    return this.repo.assignWorkers(groupBookingId, assignments);
  }

  /**
   * Verifies the arrival OTP entered by a worker.
   * Returns true on success; transitions booking to IN_PROGRESS.
   */
  async verifyArrivalOtp(
    groupBookingId: string,
    workerAssignmentId: string,
    enteredOtp: string,
  ): Promise<boolean> {
    return this.repo.verifyArrivalOtp(groupBookingId, workerAssignmentId, enteredOtp);
  }

  /**
   * Marks the group booking as completed and triggers invoice generation.
   */
  async complete(
    groupBookingId: string,
    workNotes?: string,
    workPhotos?: string[],
  ): Promise<GroupBooking> {
    return this.repo.completeGroupBooking(groupBookingId, workNotes, workPhotos);
  }

  /**
   * Cancels a group booking.
   */
  async cancel(groupBookingId: string, reason: string): Promise<GroupBooking> {
    return this.repo.cancelGroupBooking(groupBookingId, reason);
  }

  // ── Invoice Management ─────────────────────────────────────────────────────

  /**
   * Manually triggers invoice generation (if not auto-generated on completion).
   */
  async generateInvoices(groupBookingId: string): Promise<ParticipantInvoice[]> {
    return this.repo.generateInvoices(groupBookingId);
  }

  /**
   * Returns a single participant's invoice.
   */
  async getMyInvoice(invoiceId: string): Promise<ParticipantInvoice | null> {
    return this.repo.getParticipantInvoice(invoiceId);
  }

  /**
   * Returns all invoices for a booking (organiser / manager view).
   */
  async getAllInvoices(groupBookingId: string): Promise<ParticipantInvoice[]> {
    return this.repo.getInvoicesForGroupBooking(groupBookingId);
  }

  // ── Payment Processing ─────────────────────────────────────────────────────

  /**
   * Initiates a payment for a participant's invoice.
   * In a real app, this would call a payment gateway (Razorpay, UPI, etc.)
   * and return a redirect URL or payment session ID.
   */
  async initiatePayment(input: InitiateParticipantPaymentInput): Promise<ParticipantPaymentRecord> {
    return this.repo.initiateParticipantPayment(input);
  }

  /**
   * Simulates a successful payment confirmation (mock gateway callback).
   */
  async simulatePaymentSuccess(
    paymentId: string,
    gatewayTransactionId?: string,
  ): Promise<ParticipantPaymentRecord> {
    return this.repo.confirmParticipantPayment(
      paymentId,
      true,
      gatewayTransactionId ?? `MOCK_GTW_${Date.now()}`,
    );
  }

  /**
   * Simulates a failed payment (mock gateway callback).
   */
  async simulatePaymentFailure(
    paymentId: string,
    reason = 'Insufficient balance.',
  ): Promise<ParticipantPaymentRecord> {
    return this.repo.confirmParticipantPayment(paymentId, false, undefined, reason);
  }

  /**
   * Completes the full payment flow for a participant:
   *  1. Initiates payment
   *  2. Simulates gateway confirmation (mock only)
   * Returns the final payment record.
   */
  async payMyShare(
    groupBookingId: string,
    participantId: string,
    invoiceId: string,
    paymentMethod: ParticipantPaymentMethod,
  ): Promise<ParticipantPaymentRecord> {
    const payment = await this.initiatePayment({
      groupBookingId,
      participantId,
      invoiceId,
      paymentMethod,
    });
    return this.simulatePaymentSuccess(payment.id);
  }

  // ── Queries & Views ────────────────────────────────────────────────────────

  /**
   * Returns the full detail view for a group booking, including
   * payment status, worker assignments, invoices, and payment records.
   */
  async getDetailView(groupBookingId: string): Promise<GroupBookingDetailView> {
    const [booking, paymentStatus, workerAssignments, invoices, payments] = await Promise.all([
      this.repo.getGroupBookingById(groupBookingId),
      this.repo.getGroupPaymentStatus(groupBookingId),
      this.repo.getWorkerAssignments(groupBookingId),
      this.repo.getInvoicesForGroupBooking(groupBookingId),
      this.repo.getPaymentsForGroupBooking(groupBookingId),
    ]);
    if (!booking) throw new Error(`Booking '${groupBookingId}' not found.`);
    return { booking, paymentStatus, workerAssignments, invoices, payments };
  }

  /**
   * Returns a participant-centric view: their booking card, participation record,
   * invoice, and payment record — all in one call.
   */
  async getParticipantView(
    groupBookingId: string,
    userId: string,
  ): Promise<ParticipantBookingView> {
    const booking = await this.repo.getGroupBookingById(groupBookingId);
    if (!booking) throw new Error(`Booking '${groupBookingId}' not found.`);

    const myParticipation = booking.participants.find(p => p.userId === userId) ?? null;
    const myInvoice = myParticipation?.invoiceId
      ? await this.repo.getParticipantInvoice(myParticipation.invoiceId)
      : null;
    const myPayment = myInvoice?.paymentId
      ? await this.repo.getPaymentById(myInvoice.paymentId)
      : null;

    const summaryCard: GroupBookingSummaryCard = {
      id: booking.id,
      referenceNumber: booking.referenceNumber,
      serviceCategory: booking.serviceCategory,
      societyName: booking.societyName,
      status: booking.status,
      organiserName: booking.organiserName,
      organiserFlatNumber: booking.organiserFlatNumber,
      confirmedParticipants: booking.participants.filter(p =>
        ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status),
      ).length,
      totalParticipants: booking.participants.length,
      totalGroupCost: booking.costSplit.discountedTotal,
      userCostShare: myParticipation?.assignedCostShare,
      preferredDate: booking.schedule.preferredDate,
      createdAt: booking.createdAt,
    };

    return {
      booking: summaryCard,
      myParticipation,
      myInvoice,
      myPayment,
    };
  }

  /**
   * Returns bookings organized for the organiser's dashboard view.
   */
  async getOrganiserDashboard(organiserId: string): Promise<OrganiserDashboard> {
    const [openResult, completedResult] = await Promise.all([
      this.repo.listGroupBookings({
        organiserId,
        status: ['DRAFT', 'OPEN', 'LOCKED', 'CONFIRMED', 'IN_PROGRESS'],
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      this.repo.listGroupBookings({
        organiserId,
        status: ['COMPLETED', 'INVOICED', 'PAID', 'PARTIALLY_PAID'],
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    ]);
    const awaitingPayment = [
      ...openResult.groupBookings,
      ...completedResult.groupBookings,
    ].filter(gb => ['INVOICED', 'PARTIALLY_PAID'].includes(gb.status));

    return {
      myOpenBookings: openResult.groupBookings,
      myCompletedBookings: completedResult.groupBookings,
      awaitingPayment,
    };
  }

  /**
   * Returns all group bookings a specific user participates in.
   */
  async getMyGroupBookings(
    userId: string,
    filter?: Omit<GroupBookingFilter, 'participantUserId'>,
  ): Promise<PaginatedGroupBookings> {
    return this.repo.listGroupBookings({
      ...filter,
      participantUserId: userId,
    });
  }

  /**
   * Returns the financial summary for a society manager.
   */
  async getFinancialSummary(
    societyId: string,
    month?: number,
    year?: number,
  ): Promise<GroupBookingFinancialSummary> {
    const now = new Date();
    return this.repo.getFinancialSummary(
      societyId,
      month ?? now.getMonth() + 1,
      year ?? now.getFullYear(),
    );
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /**
   * Returns a human-readable label for a group booking status.
   */
  static statusLabel(status: GroupBookingStatus): string {
    const labels: Record<GroupBookingStatus, string> = {
      DRAFT: 'Draft',
      OPEN: 'Open – Accepting Participants',
      LOCKED: 'Locked – Cost Split Finalised',
      CONFIRMED: 'Confirmed – Worker Assigned',
      IN_PROGRESS: 'Work In Progress',
      COMPLETED: 'Work Completed',
      INVOICED: 'Invoices Sent',
      PAID: 'Fully Paid',
      PARTIALLY_PAID: 'Partially Paid',
      CANCELLED: 'Cancelled',
    };
    return labels[status];
  }

  /**
   * Returns a CSS-class-friendly color key for each status.
   */
  static statusColor(status: GroupBookingStatus): 'green' | 'blue' | 'yellow' | 'red' | 'gray' {
    if (['PAID'].includes(status)) return 'green';
    if (['OPEN', 'CONFIRMED', 'LOCKED', 'INVOICED'].includes(status)) return 'blue';
    if (['IN_PROGRESS', 'PARTIALLY_PAID', 'COMPLETED'].includes(status)) return 'yellow';
    if (['CANCELLED'].includes(status)) return 'red';
    return 'gray'; // DRAFT
  }

  /**
   * Returns the split strategy description for display.
   */
  static splitStrategyLabel(strategy: CostSplitStrategy): string {
    return {
      EQUAL: 'Equal Split (per unit)',
      CUSTOM: 'Custom Amounts',
      PROPORTIONAL: 'Proportional (by floor area)',
    }[strategy];
  }

  /**
   * Checks whether a given user can still join a group booking.
   */
  static canJoin(booking: GroupBooking, userId: string): {
    allowed: boolean;
    reason?: string;
  } {
    if (booking.status !== 'OPEN') {
      return { allowed: false, reason: `Booking is ${booking.status.toLowerCase()}.` };
    }
    const activeParticipants = booking.participants.filter(p =>
      ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status),
    ).length;
    if (activeParticipants >= booking.maximumParticipants) {
      return { allowed: false, reason: 'Booking is at full capacity.' };
    }
    const existing = booking.participants.find(p => p.userId === userId);
    if (existing && !['OPT_OUT', 'REMOVED'].includes(existing.status)) {
      return { allowed: false, reason: 'You are already a participant.' };
    }
    return { allowed: true };
  }
}
