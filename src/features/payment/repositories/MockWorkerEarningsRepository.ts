/**
 * @file MockWorkerEarningsRepository.ts
 * @description In-memory mock implementation of IWorkerEarningsRepository.
 *
 * Suitable for local development, demos, and unit tests.
 * Operates on cloned copies of mock data to prevent mutation leakage.
 */

import { IWorkerEarningsRepository } from './IWorkerEarningsRepository';
import {
  WorkerEarningsSummary,
  WorkerEarningsTransaction,
  PendingPayment,
  CompletedPayment,
  DailyEarningsSnapshot,
  WeeklyEarningsBreakdown,
  MonthlyEarningsBreakdown,
  EarningsDisbursementBatch,
  EarningsHistoryFilter,
  PaginatedEarningsHistory,
  EarningsDisbursementStatus,
} from '../types/workerEarnings.types';
import {
  MOCK_WORKER_TRANSACTIONS,
  MOCK_PENDING_PAYMENTS,
  MOCK_COMPLETED_PAYMENTS,
  MOCK_DISBURSEMENT_BATCHES,
  MOCK_WORKER_EARNINGS_SUMMARY,
  TODAY_EARNINGS_SNAPSHOT,
  THIS_WEEK_EARNINGS,
  THIS_MONTH_EARNINGS,
} from '../data/workerEarnings.mockData';

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Returns a deep clone to prevent external mutation of seed data. */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** Simulates network latency (50–120ms). */
const delay = (ms = 80): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Derives a YYYY-MM-DD string from an ISO timestamp. */
const toDateStr = (iso: string): string => iso.slice(0, 10);

/** Returns the ISO week number of a date. */
const getWeekNumber = (d: Date): number => {
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const diff = d.getTime() - startOfWeek1.getTime();
  return Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1;
};

// ─── Mock Repository ──────────────────────────────────────────────────────────

export class MockWorkerEarningsRepository implements IWorkerEarningsRepository {
  /** In-memory mutable store. */
  private transactions: WorkerEarningsTransaction[] = clone(MOCK_WORKER_TRANSACTIONS);
  private pendingPayments: PendingPayment[] = clone(MOCK_PENDING_PAYMENTS);
  private completedPayments: CompletedPayment[] = clone(MOCK_COMPLETED_PAYMENTS);
  private batches: EarningsDisbursementBatch[] = clone(MOCK_DISBURSEMENT_BATCHES);

  // ── Public API ──────────────────────────────────────────────────────────────

  async getEarningsSummary(workerId: string): Promise<WorkerEarningsSummary> {
    await delay();
    const summary = clone(MOCK_WORKER_EARNINGS_SUMMARY);
    if (summary.workerId !== workerId) {
      // Return a zeroed summary for unknown workers rather than throwing.
      return {
        workerId,
        workerName: 'Unknown Worker',
        todayNet: 0,
        todayPending: 0,
        thisWeekNet: 0,
        thisMonthNet: 0,
        allTimeNet: 0,
        totalPendingAmount: 0,
        pendingPaymentCount: 0,
        avgEarningsPerJob: 0,
        averageRating: 0,
        totalJobsCompleted: 0,
      };
    }
    // Recompute live pending from mutable store.
    const pending = this.pendingPayments.filter(
      p => p.workerId === workerId && p.status !== 'ON_HOLD',
    );
    summary.totalPendingAmount = pending.reduce((s, p) => s + p.expectedNetAmount, 0);
    summary.pendingPaymentCount = pending.length;
    return summary;
  }

  async getTodaySnapshot(workerId: string): Promise<DailyEarningsSnapshot> {
    await delay();
    const today = new Date().toISOString().slice(0, 10);
    const todayTxns = this.transactions.filter(
      t => t.workerId === workerId && toDateStr(t.occurredAt) === today,
    );
    if (todayTxns.length === 0) {
      // Return seed snapshot for demo worker even if today doesn't match.
      if (workerId === 'w_rahul') return clone(TODAY_EARNINGS_SNAPSHOT);
      return {
        date: today,
        workerId,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        jobsCompleted: 0,
        transactions: [],
      };
    }
    const totalGross = todayTxns.reduce((s, t) => s + t.grossAmount, 0);
    const totalDeductions = todayTxns.reduce(
      (s, t) => s + t.deductions.reduce((ds, d) => ds + d.amount, 0),
      0,
    );
    return {
      date: today,
      workerId,
      totalGross,
      totalDeductions,
      totalNet: totalGross - totalDeductions,
      jobsCompleted: todayTxns.filter(t => t.type === 'JOB_PAYMENT').length,
      transactions: clone(todayTxns),
    };
  }

  async getWeeklyBreakdown(
    workerId: string,
    _referenceDate?: string,
  ): Promise<WeeklyEarningsBreakdown> {
    await delay();
    // For the demo worker, return the pre-built seed breakdown.
    if (workerId === 'w_rahul') return clone(THIS_WEEK_EARNINGS);

    // Generic: build from stored transactions.
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekTxns = this.transactions.filter(t => {
      if (t.workerId !== workerId) return false;
      const d = new Date(t.occurredAt);
      return d >= monday && d <= sunday;
    });
    const totalGross = weekTxns.reduce((s, t) => s + t.grossAmount, 0);
    const totalDeductions = weekTxns.reduce(
      (s, t) => s + t.deductions.reduce((ds, d) => ds + d.amount, 0),
      0,
    );
    return {
      workerId,
      weekStartDate: monday.toISOString().slice(0, 10),
      weekEndDate: sunday.toISOString().slice(0, 10),
      weekNumber: getWeekNumber(monday),
      year: monday.getFullYear(),
      totalGross,
      totalDeductions,
      totalNet: totalGross - totalDeductions,
      jobsCompleted: weekTxns.filter(t => t.type === 'JOB_PAYMENT').length,
      dailyBreakdown: [],
    };
  }

  async getMonthlyBreakdown(
    workerId: string,
    month?: number,
    year?: number,
  ): Promise<MonthlyEarningsBreakdown> {
    await delay();
    if (workerId === 'w_rahul') return clone(THIS_MONTH_EARNINGS);

    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const monthTxns = this.transactions.filter(t => {
      if (t.workerId !== workerId) return false;
      const d = new Date(t.occurredAt);
      return d.getMonth() + 1 === m && d.getFullYear() === y;
    });
    const totalGross = monthTxns.reduce((s, t) => s + t.grossAmount, 0);
    const totalDeductions = monthTxns.reduce(
      (s, t) => s + t.deductions.reduce((ds, d) => ds + d.amount, 0),
      0,
    );
    return {
      workerId,
      month: m,
      year: y,
      monthLabel: new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      totalGross,
      totalDeductions,
      totalNet: totalGross - totalDeductions,
      jobsCompleted: monthTxns.filter(t => t.type === 'JOB_PAYMENT').length,
      weeklyBreakdown: [],
      topCategories: [],
    };
  }

  async getPendingPayments(workerId: string): Promise<PendingPayment[]> {
    await delay();
    return clone(
      this.pendingPayments.filter(
        p => p.workerId === workerId && ['PENDING', 'PROCESSING', 'ON_HOLD'].includes(p.status),
      ),
    );
  }

  async getCompletedPayments(workerId: string): Promise<CompletedPayment[]> {
    await delay();
    return clone(this.completedPayments.filter(p => p.workerId === workerId));
  }

  async getTransactionById(transactionId: string): Promise<WorkerEarningsTransaction | null> {
    await delay(40);
    return clone(this.transactions.find(t => t.id === transactionId) ?? null);
  }

  async getTransactionHistory(filter: EarningsHistoryFilter): Promise<PaginatedEarningsHistory> {
    await delay();
    let results = this.transactions.filter(t => t.workerId === filter.workerId);

    if (filter.type) results = results.filter(t => t.type === filter.type);
    if (filter.status) results = results.filter(t => t.status === filter.status);
    if (filter.fromDate) results = results.filter(t => toDateStr(t.occurredAt) >= filter.fromDate!);
    if (filter.toDate) results = results.filter(t => toDateStr(t.occurredAt) <= filter.toDate!);
    if (filter.month) {
      results = results.filter(t => new Date(t.occurredAt).getMonth() + 1 === filter.month);
    }
    if (filter.year) {
      results = results.filter(t => new Date(t.occurredAt).getFullYear() === filter.year);
    }
    if (filter.minAmount !== undefined) {
      results = results.filter(t => t.netAmount >= filter.minAmount!);
    }
    if (filter.maxAmount !== undefined) {
      results = results.filter(t => t.netAmount <= filter.maxAmount!);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      results = results.filter(
        t =>
          t.description.toLowerCase().includes(q) ||
          t.bookingId?.toLowerCase().includes(q) ||
          t.groupBookingId?.toLowerCase().includes(q),
      );
    }

    // Sort
    const sortBy = filter.sortBy ?? 'occurredAt';
    const sortOrder = filter.sortOrder ?? 'desc';
    results.sort((a, b) => {
      let aVal: string | number = a[sortBy === 'netAmount' ? 'netAmount' : 'occurredAt'];
      let bVal: string | number = b[sortBy === 'netAmount' ? 'netAmount' : 'occurredAt'];
      if (sortBy === 'status') { aVal = a.status; bVal = b.status; }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = results.length;
    const totalNetInPeriod = results.reduce((s, t) => s + t.netAmount, 0);
    const totalGrossInPeriod = results.reduce((s, t) => s + t.grossAmount, 0);

    // Paginate
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const paginated = results.slice(start, start + pageSize);

    return {
      transactions: clone(paginated),
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalNetInPeriod,
      totalGrossInPeriod,
    };
  }

  async getDisbursementBatches(_societyId: string): Promise<EarningsDisbursementBatch[]> {
    await delay();
    return clone(this.batches);
  }

  async updatePendingPaymentStatus(
    paymentId: string,
    newStatus: EarningsDisbursementStatus,
    holdReason?: string,
  ): Promise<PendingPayment> {
    await delay();
    const idx = this.pendingPayments.findIndex(p => p.id === paymentId);
    if (idx === -1) throw new Error(`Pending payment '${paymentId}' not found.`);

    this.pendingPayments[idx] = {
      ...this.pendingPayments[idx],
      status: newStatus,
      holdReason: holdReason ?? this.pendingPayments[idx].holdReason,
    };
    return clone(this.pendingPayments[idx]);
  }

  async processDisbursementBatch(
    paymentIds: string[],
    processedBy: string,
  ): Promise<EarningsDisbursementBatch> {
    await delay(200); // slightly heavier operation

    const paymentsToProcess = this.pendingPayments.filter(
      p => paymentIds.includes(p.id) && p.status === 'PENDING',
    );

    if (paymentsToProcess.length === 0) {
      throw new Error('No eligible PENDING payments found for the provided IDs.');
    }

    // Transition pending → PROCESSING
    paymentsToProcess.forEach(p => {
      const idx = this.pendingPayments.findIndex(pp => pp.id === p.id);
      this.pendingPayments[idx].status = 'PROCESSING';
    });

    // Simulate: after 500ms, mark as COMPLETED and move to completedPayments
    setTimeout(() => {
      paymentsToProcess.forEach(p => {
        const idx = this.pendingPayments.findIndex(pp => pp.id === p.id);
        if (idx !== -1) {
          this.pendingPayments[idx].status = 'COMPLETED';
          // Promote to completedPayments
          this.completedPayments.push({
            id: `pay_${p.id}`,
            workerId: p.workerId,
            workerName: p.workerName,
            grossAmount: p.grossAmount,
            deductionsApplied: p.expectedDeductions,
            netAmountDisbursed: p.expectedNetAmount,
            disbursementMethod: 'UPI',
            disbursementReference: `mock_upi_${p.workerId}`,
            disbursedAt: new Date().toISOString(),
            bookingId: p.bookingId,
            groupBookingId: p.groupBookingId,
            bookingDescription: p.bookingDescription,
            externalTransactionId: `MOCK-${Date.now()}`,
          });
        }
      });
    }, 500);

    const batchId = `batch_${Date.now()}`;
    const now = new Date().toISOString();
    const totalGross = paymentsToProcess.reduce((s, p) => s + p.grossAmount, 0);
    const totalNet = paymentsToProcess.reduce((s, p) => s + p.expectedNetAmount, 0);

    const batch: EarningsDisbursementBatch = {
      id: batchId,
      batchDate: now.slice(0, 10),
      totalWorkers: new Set(paymentsToProcess.map(p => p.workerId)).size,
      totalGrossAmount: totalGross,
      totalNetAmount: totalNet,
      status: 'PROCESSING',
      payments: [],
      failedPayments: [],
      processedBy,
      processedAt: now,
    };
    this.batches.push(batch);
    return clone(batch);
  }
}
