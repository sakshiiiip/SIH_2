/**
 * @file MockGroupBookingRepository.ts
 * @description In-memory mock implementation of IGroupBookingRepository.
 *
 * Fully operational for local development, demos, and unit tests.
 * Manages the complete group booking lifecycle including participant
 * management, cost splitting, invoice generation, and payment processing.
 */

import {
  IGroupBookingRepository,
  CreateGroupBookingInput,
  JoinGroupBookingInput,
  InitiateParticipantPaymentInput,
} from './IGroupBookingRepository';
import {
  GroupBooking,
  GroupBookingParticipant,
  GroupBookingStatus,
  ParticipantInvoice,
  ParticipantPaymentRecord,
  GroupBookingWorkerAssignment,
  GroupBookingFilter,
  PaginatedGroupBookings,
  GroupBookingSummaryCard,
  GroupBookingFinancialSummary,
  CostSplitDetails,
  ParticipantPaymentStatus,
  InvoiceStatus,
} from '../types/groupBooking.types';
import {
  ALL_MOCK_GROUP_BOOKINGS,
  MOCK_GROUP_BOOKING_FINANCIAL_SUMMARY,
} from '../data/groupBooking.mockData';
import { BookingState } from '../../../types';

// ─── Utility ──────────────────────────────────────────────────────────────────

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const delay = (ms = 80): Promise<void> => new Promise(r => setTimeout(r, ms));

const uid = (): string => Math.random().toString(36).slice(2, 10);

const generateOtp = (): string =>
  Math.floor(1000 + Math.random() * 9000).toString();

const dateStr = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const invoiceNum = (gbkRef: string, seq: number): string => {
  const seqStr = String(seq).padStart(2, '0');
  return `${gbkRef}-P${seqStr}`;
};

/** Derive a summary card from a full GroupBooking object. */
const toSummaryCard = (
  gb: GroupBooking,
  forUserId?: string,
): GroupBookingSummaryCard => ({
  id: gb.id,
  referenceNumber: gb.referenceNumber,
  serviceCategory: gb.serviceCategory,
  societyName: gb.societyName,
  status: gb.status,
  organiserName: gb.organiserName,
  organiserFlatNumber: gb.organiserFlatNumber,
  confirmedParticipants: gb.participants.filter(p =>
    ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status),
  ).length,
  totalParticipants: gb.participants.length,
  totalGroupCost: gb.costSplit.discountedTotal,
  userCostShare: gb.costSplit.allocations.find(a => a.userId === forUserId)?.finalShare,
  preferredDate: gb.schedule.preferredDate,
  createdAt: gb.createdAt,
});

/** Recompute cost allocations for EQUAL strategy. */
const computeEqualAllocations = (
  participants: GroupBookingParticipant[],
  costSplit: CostSplitDetails,
): CostSplitDetails['allocations'] => {
  const active = participants.filter(p =>
    ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status),
  );
  if (active.length === 0) return [];
  const perHead = Math.round((costSplit.discountedTotal / active.length) * 100) / 100;
  return active.map(p => ({
    participantId: p.id,
    userId: p.userId,
    customerName: p.customerName,
    flatNumber: p.flatNumber,
    rawShare: Math.round((costSplit.totalGroupCost / active.length) * 100) / 100,
    finalShare: perHead,
  }));
};

/** Recompute cost allocations for PROPORTIONAL strategy. */
const computeProportionalAllocations = (
  participants: GroupBookingParticipant[],
  costSplit: CostSplitDetails,
): CostSplitDetails['allocations'] => {
  const active = participants.filter(p =>
    ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status),
  );
  const totalArea = active.reduce((s, p) => s + (p.unitAreaSqFt ?? 1000), 0);
  return active.map(p => {
    const weight = p.unitAreaSqFt ?? 1000;
    const share = Math.round(((weight / totalArea) * costSplit.discountedTotal) * 100) / 100;
    return {
      participantId: p.id,
      userId: p.userId,
      customerName: p.customerName,
      flatNumber: p.flatNumber,
      rawShare: Math.round(((weight / totalArea) * costSplit.totalGroupCost) * 100) / 100,
      finalShare: share,
      weight,
    };
  });
};

// ─── Mock Repository ──────────────────────────────────────────────────────────

export class MockGroupBookingRepository implements IGroupBookingRepository {
  private store: GroupBooking[] = clone(ALL_MOCK_GROUP_BOOKINGS);
  private seqCounter = 53; // next GBK reference number

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private findOrThrow(groupBookingId: string): GroupBooking {
    const gb = this.store.find(g => g.id === groupBookingId);
    if (!gb) throw new Error(`Group booking '${groupBookingId}' not found.`);
    return gb;
  }

  private touch(gb: GroupBooking): void {
    gb.updatedAt = new Date().toISOString();
  }

  private buildInvoice(
    gb: GroupBooking,
    participant: GroupBookingParticipant,
    seq: number,
    share: number,
    taxRatePercent = 18,
  ): ParticipantInvoice {
    const subtotal = share;
    const taxAmount = Math.round(subtotal * (taxRatePercent / 100) * 100) / 100;
    const totalDue = Math.round((subtotal + taxAmount) * 100) / 100;
    return {
      id: `inv_${gb.id}_p${seq}`,
      invoiceNumber: invoiceNum(gb.referenceNumber, seq),
      groupBookingId: gb.id,
      participantId: participant.id,
      userId: participant.userId,
      customerName: participant.customerName,
      customerPhone: participant.customerPhone,
      flatNumber: participant.flatNumber,
      societyName: gb.societyName,
      issuedAt: new Date().toISOString(),
      dueDate: dateStr(5),
      lineItems: [
        {
          description: `${gb.serviceCategory} – ${gb.problemType}`,
          quantity: 1,
          unitRate: share,
          amount: share,
        },
        {
          description: `Group Discount (${gb.costSplit.groupDiscountPercent}%)`,
          quantity: 1,
          unitRate: -(gb.costSplit.totalGroupCost / gb.participants.length - share),
          amount: -(gb.costSplit.totalGroupCost / gb.participants.length - share),
        },
      ],
      subtotal,
      taxRatePercent,
      taxAmount,
      totalDue,
      amountPaid: 0,
      status: 'SENT',
      notes: `${gb.costSplit.strategy === 'EQUAL' ? 'Equal' : 'Proportional'} split. ${gb.costSplit.groupDiscountPercent}% group discount applied.`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  async createGroupBooking(input: CreateGroupBookingInput): Promise<GroupBooking> {
    await delay();
    const refNum = `GBK-2026-${String(this.seqCounter++).padStart(5, '0')}`;
    const now = new Date().toISOString();
    const gb: GroupBooking = {
      id: `gbk_${uid()}`,
      referenceNumber: refNum,
      organiserId: input.organiserId,
      organiserName: input.organiserName,
      organiserPhone: input.organiserPhone,
      organiserFlatNumber: input.organiserFlatNumber,
      societyId: input.societyId,
      societyName: input.societyName,
      federationId: input.federationId,
      serviceCategory: input.serviceCategory,
      problemType: input.problemType,
      description: input.description,
      urgencyTier: input.urgencyTier,
      photos: input.photos ?? [],
      participants: [],
      minimumParticipants: input.minimumParticipants,
      maximumParticipants: input.maximumParticipants,
      schedule: {
        preferredDate: input.preferredDate,
        preferredTimeStart: input.preferredTimeStart,
        preferredTimeEnd: input.preferredTimeEnd,
      },
      costSplit: {
        strategy: input.costSplitStrategy,
        totalGroupCost: input.estimatedTotalCost,
        groupDiscountPercent: input.groupDiscountPercent,
        discountedTotal:
          input.estimatedTotalCost * (1 - input.groupDiscountPercent / 100),
        allocations: [],
      },
      workerAssignments: [],
      invoices: [],
      payments: [],
      status: 'DRAFT',
      arrivalOtp: generateOtp(),
      createdAt: now,
      updatedAt: now,
      notes: input.notes,
      bookingTag: input.bookingTag,
    };
    this.store.push(gb);
    return clone(gb);
  }

  async publishGroupBooking(groupBookingId: string): Promise<GroupBooking> {
    await delay();
    const gb = this.findOrThrow(groupBookingId);
    if (gb.status !== 'DRAFT') {
      throw new Error(`Cannot publish a booking in '${gb.status}' state.`);
    }
    gb.status = 'OPEN';
    this.touch(gb);
    return clone(gb);
  }

  async getGroupBookingById(groupBookingId: string): Promise<GroupBooking | null> {
    await delay(40);
    return clone(this.store.find(g => g.id === groupBookingId) ?? null);
  }

  async listGroupBookings(filter: GroupBookingFilter): Promise<PaginatedGroupBookings> {
    await delay();
    let results = [...this.store];

    if (filter.societyId) results = results.filter(g => g.societyId === filter.societyId);
    if (filter.organiserId) results = results.filter(g => g.organiserId === filter.organiserId);
    if (filter.participantUserId) {
      results = results.filter(g =>
        g.participants.some(p => p.userId === filter.participantUserId),
      );
    }
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter(g => statuses.includes(g.status));
    }
    if (filter.serviceCategory) {
      results = results.filter(g =>
        g.serviceCategory.toLowerCase().includes(filter.serviceCategory!.toLowerCase()),
      );
    }
    if (filter.fromDate) results = results.filter(g => g.schedule.preferredDate >= filter.fromDate!);
    if (filter.toDate) results = results.filter(g => g.schedule.preferredDate <= filter.toDate!);
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      results = results.filter(
        g =>
          g.referenceNumber.toLowerCase().includes(q) ||
          g.serviceCategory.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.organiserName.toLowerCase().includes(q),
      );
    }

    // Sort
    const sortBy = filter.sortBy ?? 'createdAt';
    const sortOrder = filter.sortOrder ?? 'desc';
    results.sort((a, b) => {
      const aVal = sortBy === 'totalGroupCost' ? a.costSplit.discountedTotal
        : sortBy === 'preferredDate' ? a.schedule.preferredDate
        : sortBy === 'status' ? a.status
        : a.createdAt;
      const bVal = sortBy === 'totalGroupCost' ? b.costSplit.discountedTotal
        : sortBy === 'preferredDate' ? b.schedule.preferredDate
        : sortBy === 'status' ? b.status
        : b.createdAt;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = results.length;
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 10;
    const paginated = results.slice((page - 1) * pageSize, page * pageSize);

    return {
      groupBookings: paginated.map(g => toSummaryCard(g, filter.participantUserId)),
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async joinGroupBooking(input: JoinGroupBookingInput): Promise<GroupBookingParticipant> {
    await delay();
    const gb = this.findOrThrow(input.groupBookingId);

    if (!['OPEN'].includes(gb.status)) {
      throw new Error(`Booking '${gb.referenceNumber}' is not accepting participants (status: ${gb.status}).`);
    }
    if (gb.participants.length >= gb.maximumParticipants) {
      throw new Error(`Booking '${gb.referenceNumber}' is at full capacity.`);
    }
    const existing = gb.participants.find(p => p.userId === input.userId);
    if (existing && existing.status !== 'OPT_OUT' && existing.status !== 'REMOVED') {
      throw new Error(`User '${input.userId}' is already a participant.`);
    }

    const now = new Date().toISOString();
    const participant: GroupBookingParticipant = {
      id: `p_${uid()}`,
      userId: input.userId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      flatNumber: input.flatNumber,
      tower: input.tower,
      floor: input.floor,
      unitAreaSqFt: input.unitAreaSqFt,
      status: 'CONFIRMED',
      joinedAt: now,
      updatedAt: now,
    };

    gb.participants.push(participant);
    this.touch(gb);
    return clone(participant);
  }

  async removeParticipant(
    groupBookingId: string,
    participantId: string,
    reason: string,
  ): Promise<GroupBooking> {
    await delay();
    const gb = this.findOrThrow(groupBookingId);
    const p = gb.participants.find(pp => pp.id === participantId);
    if (!p) throw new Error(`Participant '${participantId}' not found.`);

    p.status = 'REMOVED';
    p.removalReason = reason;
    p.updatedAt = new Date().toISOString();
    this.touch(gb);
    return clone(gb);
  }

  async lockGroupBooking(groupBookingId: string): Promise<GroupBooking> {
    await delay();
    const gb = this.findOrThrow(groupBookingId);
    const confirmed = gb.participants.filter(p =>
      ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status),
    );
    if (confirmed.length < gb.minimumParticipants) {
      throw new Error(
        `Not enough participants. Need ${gb.minimumParticipants}, have ${confirmed.length}.`,
      );
    }

    gb.status = 'LOCKED';
    gb.lockedAt = new Date().toISOString();

    // Finalize cost split
    const allocations =
      gb.costSplit.strategy === 'EQUAL'
        ? computeEqualAllocations(gb.participants, gb.costSplit)
        : computeProportionalAllocations(gb.participants, gb.costSplit);

    gb.costSplit.allocations = allocations;
    gb.costSplit.finalizedAt = new Date().toISOString();

    // Update each participant's assignedCostShare
    allocations.forEach(a => {
      const p = gb.participants.find(pp => pp.id === a.participantId);
      if (p) p.assignedCostShare = a.finalShare;
    });

    this.touch(gb);
    return clone(gb);
  }

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
    await delay();
    const gb = this.findOrThrow(groupBookingId);
    if (!['LOCKED'].includes(gb.status)) {
      throw new Error(`Workers can only be assigned to a LOCKED booking (current: ${gb.status}).`);
    }

    const now = new Date().toISOString();
    gb.workerAssignments = assignments.map((a, i) => ({
      id: `wa_${gb.id}_${i}`,
      groupBookingId: gb.id,
      workerId: a.workerId,
      workerName: a.workerName,
      workerPhone: a.workerPhone,
      workerProfession: a.workerProfession,
      assignedParticipantIds: a.assignedParticipantIds,
      assignedFlats: a.assignedParticipantIds
        .map(id => gb.participants.find(p => p.id === id)?.flatNumber ?? '')
        .filter(Boolean),
      status: 'CONFIRMED' as BookingState,
      assignedAt: now,
    }));

    gb.status = 'CONFIRMED';
    gb.confirmedAt = now;
    gb.schedule.confirmedDate = gb.schedule.preferredDate;
    gb.schedule.confirmedTimeStart = gb.schedule.preferredTimeStart;
    gb.schedule.confirmedTimeEnd = gb.schedule.preferredTimeEnd;
    this.touch(gb);
    return clone(gb);
  }

  async verifyArrivalOtp(
    groupBookingId: string,
    workerAssignmentId: string,
    enteredOtp: string,
  ): Promise<boolean> {
    await delay(50);
    const gb = this.findOrThrow(groupBookingId);
    if (gb.arrivalOtp !== enteredOtp) return false;

    const assignment = gb.workerAssignments.find(wa => wa.id === workerAssignmentId);
    if (!assignment) throw new Error(`Assignment '${workerAssignmentId}' not found.`);

    assignment.arrivalOtpVerified = true;
    assignment.startedAt = new Date().toISOString();
    assignment.status = 'IN_PROGRESS';

    // If all workers have verified, mark the booking as IN_PROGRESS.
    if (gb.workerAssignments.every(wa => wa.arrivalOtpVerified)) {
      gb.status = 'IN_PROGRESS';
      this.touch(gb);
    }
    return true;
  }

  async completeGroupBooking(
    groupBookingId: string,
    workNotes?: string,
    workPhotos?: string[],
  ): Promise<GroupBooking> {
    await delay();
    const gb = this.findOrThrow(groupBookingId);
    const now = new Date().toISOString();

    gb.workerAssignments.forEach(wa => {
      wa.status = 'COMPLETED';
      wa.completedAt = now;
      if (workNotes) wa.workNotes = workNotes;
      if (workPhotos) wa.workPhotos = workPhotos;
    });

    gb.status = 'COMPLETED';
    gb.completedAt = now;
    this.touch(gb);

    // Automatically generate invoices.
    await this.generateInvoices(groupBookingId);
    return clone(gb);
  }

  async cancelGroupBooking(groupBookingId: string, reason: string): Promise<GroupBooking> {
    await delay();
    const gb = this.findOrThrow(groupBookingId);
    if (['PAID', 'CANCELLED'].includes(gb.status)) {
      throw new Error(`Cannot cancel a booking in '${gb.status}' state.`);
    }
    gb.status = 'CANCELLED';
    gb.cancelledAt = new Date().toISOString();
    gb.cancellationReason = reason;
    this.touch(gb);
    return clone(gb);
  }

  async generateInvoices(groupBookingId: string): Promise<ParticipantInvoice[]> {
    await delay();
    const gb = this.findOrThrow(groupBookingId);
    if (!['COMPLETED', 'INVOICED'].includes(gb.status)) {
      throw new Error(`Invoices can only be generated for COMPLETED bookings (current: ${gb.status}).`);
    }
    if (gb.invoices.length > 0) {
      // Already generated — return existing.
      return clone(gb.invoices);
    }

    const allocations = gb.costSplit.allocations.length > 0
      ? gb.costSplit.allocations
      : gb.costSplit.strategy === 'EQUAL'
        ? computeEqualAllocations(gb.participants, gb.costSplit)
        : computeProportionalAllocations(gb.participants, gb.costSplit);

    const invoices: ParticipantInvoice[] = allocations.map((a, i) => {
      const participant = gb.participants.find(p => p.id === a.participantId)!;
      return this.buildInvoice(gb, participant, i + 1, a.finalShare);
    });

    gb.invoices = invoices;
    gb.status = 'INVOICED';

    // Update participant statuses.
    invoices.forEach(inv => {
      const p = gb.participants.find(pp => pp.id === inv.participantId);
      if (p) {
        p.invoiceId = inv.id;
        p.status = 'INVOICED';
      }
    });

    this.touch(gb);
    return clone(invoices);
  }

  async getParticipantInvoice(invoiceId: string): Promise<ParticipantInvoice | null> {
    await delay(40);
    for (const gb of this.store) {
      const inv = gb.invoices.find(i => i.id === invoiceId);
      if (inv) return clone(inv);
    }
    return null;
  }

  async getInvoicesForGroupBooking(groupBookingId: string): Promise<ParticipantInvoice[]> {
    await delay(40);
    const gb = this.findOrThrow(groupBookingId);
    return clone(gb.invoices);
  }

  async initiateParticipantPayment(
    input: InitiateParticipantPaymentInput,
  ): Promise<ParticipantPaymentRecord> {
    await delay();
    const gb = this.findOrThrow(input.groupBookingId);
    const invoice = gb.invoices.find(i => i.id === input.invoiceId);
    if (!invoice) throw new Error(`Invoice '${input.invoiceId}' not found.`);
    if (invoice.status === 'PAID') throw new Error('Invoice is already paid.');

    const now = new Date().toISOString();
    const payment: ParticipantPaymentRecord = {
      id: `pay_${uid()}`,
      groupBookingId: input.groupBookingId,
      invoiceId: input.invoiceId,
      participantId: input.participantId,
      userId: gb.participants.find(p => p.id === input.participantId)?.userId ?? '',
      customerName: gb.participants.find(p => p.id === input.participantId)?.customerName ?? '',
      amountDue: invoice.totalDue,
      amountPaid: 0,
      paymentMethod: input.paymentMethod,
      status: 'PROCESSING',
      initiatedAt: now,
      receiptSent: false,
    };

    gb.payments.push(payment);
    invoice.status = 'VIEWED';
    this.touch(gb);
    return clone(payment);
  }

  async confirmParticipantPayment(
    paymentId: string,
    success: boolean,
    gatewayTransactionId?: string,
    failureReason?: string,
  ): Promise<ParticipantPaymentRecord> {
    await delay();
    let foundPayment: ParticipantPaymentRecord | undefined;
    let parentGb: GroupBooking | undefined;

    for (const gb of this.store) {
      const p = gb.payments.find(pp => pp.id === paymentId);
      if (p) { foundPayment = p; parentGb = gb; break; }
    }
    if (!foundPayment || !parentGb) throw new Error(`Payment '${paymentId}' not found.`);

    const now = new Date().toISOString();
    const newStatus: ParticipantPaymentStatus = success ? 'SUCCESS' : 'FAILED';
    foundPayment.status = newStatus;
    foundPayment.confirmedAt = now;

    if (success) {
      foundPayment.amountPaid = foundPayment.amountDue;
      foundPayment.gatewayTransactionId = gatewayTransactionId;
      foundPayment.receiptSent = true;

      // Update invoice.
      const invoice = parentGb.invoices.find(i => i.id === foundPayment!.invoiceId);
      if (invoice) {
        invoice.status = 'PAID';
        invoice.amountPaid = foundPayment.amountDue;
        invoice.paymentId = paymentId;
      }

      // Update participant status.
      const participant = parentGb.participants.find(p => p.id === foundPayment!.participantId);
      if (participant) participant.status = 'PAID';

      // Recheck overall booking payment status.
      const allInvoicePaid = parentGb.invoices.length > 0 &&
        parentGb.invoices.every(i => i.status === 'PAID');
      if (allInvoicePaid) {
        parentGb.status = 'PAID';
      } else if (parentGb.payments.some(pp => pp.status === 'SUCCESS')) {
        parentGb.status = 'PARTIALLY_PAID';
      }
    } else {
      foundPayment.failureReason = failureReason ?? 'Payment gateway declined.';
    }

    this.touch(parentGb);
    return clone(foundPayment);
  }

  async getPaymentsForGroupBooking(groupBookingId: string): Promise<ParticipantPaymentRecord[]> {
    await delay(40);
    const gb = this.findOrThrow(groupBookingId);
    return clone(gb.payments);
  }

  async getPaymentById(paymentId: string): Promise<ParticipantPaymentRecord | null> {
    await delay(40);
    for (const gb of this.store) {
      const p = gb.payments.find(pp => pp.id === paymentId);
      if (p) return clone(p);
    }
    return null;
  }

  async getGroupPaymentStatus(groupBookingId: string): Promise<{
    totalParticipants: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    totalDue: number;
    totalCollected: number;
    status: GroupBookingStatus;
  }> {
    await delay(40);
    const gb = this.findOrThrow(groupBookingId);
    const confirmedParticipants = gb.participants.filter(p =>
      ['CONFIRMED', 'INVOICED', 'PAID'].includes(p.status),
    );
    const paidCount = gb.participants.filter(p => p.status === 'PAID').length;
    const pendingCount = confirmedParticipants.length - paidCount;
    const failedCount = gb.payments.filter(p => p.status === 'FAILED').length;
    const totalDue = gb.invoices.reduce((s, i) => s + i.totalDue, 0);
    const totalCollected = gb.invoices.reduce((s, i) => s + i.amountPaid, 0);

    return {
      totalParticipants: confirmedParticipants.length,
      paidCount,
      pendingCount,
      failedCount,
      totalDue,
      totalCollected,
      status: gb.status,
    };
  }

  async getFinancialSummary(
    societyId: string,
    month: number,
    year: number,
  ): Promise<GroupBookingFinancialSummary> {
    await delay();
    // Return seed summary for the demo society; compute dynamically otherwise.
    if (
      societyId === 'soc_green_residency' &&
      month === 9 &&
      year === 2026
    ) {
      return clone(MOCK_GROUP_BOOKING_FINANCIAL_SUMMARY);
    }

    const bookings = this.store.filter(gb => {
      if (gb.societyId !== societyId) return false;
      const d = new Date(gb.createdAt);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const totalRevenue = bookings.reduce((s, g) => s + g.costSplit.discountedTotal, 0);
    const totalCollected = bookings.reduce(
      (s, g) => s + g.invoices.reduce((ss, i) => ss + i.amountPaid, 0),
      0,
    );
    const byStatus = bookings.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] ?? 0) + 1;
      return acc;
    }, {} as Record<GroupBookingStatus, number>);

    return {
      societyId,
      societyName: bookings[0]?.societyName ?? '',
      month,
      year,
      totalGroupBookings: bookings.length,
      totalRevenue,
      totalCollected,
      totalOutstanding: totalRevenue - totalCollected,
      societyFundShare: bookings.reduce(
        (s, g) => s + (g.revenueBreakdown?.societyShare ?? 0),
        0,
      ),
      cooperativeFundShare: bookings.reduce(
        (s, g) => s + (g.revenueBreakdown?.cooperativeFund ?? 0),
        0,
      ),
      totalWorkerPayouts: bookings.reduce(
        (s, g) => s + (g.revenueBreakdown?.workerShare ?? 0),
        0,
      ),
      byStatus: byStatus as Record<GroupBookingStatus, number>,
    };
  }

  async getWorkerAssignments(
    groupBookingId: string,
  ): Promise<GroupBookingWorkerAssignment[]> {
    await delay(40);
    const gb = this.findOrThrow(groupBookingId);
    return clone(gb.workerAssignments);
  }

  async updateWorkerAssignmentStatus(
    assignmentId: string,
    status: GroupBookingWorkerAssignment['status'],
    notes?: string,
    photos?: string[],
  ): Promise<GroupBookingWorkerAssignment> {
    await delay();
    for (const gb of this.store) {
      const wa = gb.workerAssignments.find(a => a.id === assignmentId);
      if (wa) {
        wa.status = status;
        if (notes) wa.workNotes = notes;
        if (photos) wa.workPhotos = photos;
        this.touch(gb);
        return clone(wa);
      }
    }
    throw new Error(`Worker assignment '${assignmentId}' not found.`);
  }
}
