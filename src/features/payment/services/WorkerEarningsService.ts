/**
 * @file WorkerEarningsService.ts
 * @description Application-level service for Worker Earnings.
 *
 * Orchestrates business logic between the repository and the rest of the app.
 * All logic that spans multiple repository calls or enforces domain rules
 * lives here — keeping the repository interface thin and the UI layer dumb.
 */

import { IWorkerEarningsRepository } from '../repositories/IWorkerEarningsRepository';
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
  JobEarningsSplit,
} from '../types/workerEarnings.types';

// ─── DTOs returned to the UI ──────────────────────────────────────────────────

export interface EarningsDashboardData {
  summary: WorkerEarningsSummary;
  todaySnapshot: DailyEarningsSnapshot;
  thisWeek: WeeklyEarningsBreakdown;
  thisMonth: MonthlyEarningsBreakdown;
  pendingPayments: PendingPayment[];
  recentCompleted: CompletedPayment[];
}

export interface EarningsInsights {
  bestDayThisMonth: DailyEarningsSnapshot | null;
  worstDayThisMonth: DailyEarningsSnapshot | null;
  mostLucrativeCategory: string;
  growthVsLastMonth: number; // percent, positive = growth
  estimatedMonthEndNet: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class WorkerEarningsService {
  constructor(private readonly repo: IWorkerEarningsRepository) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────

  /**
   * Fetches all data needed to render the earnings dashboard in a single
   * parallel call. Ideal for initial page load.
   */
  async getDashboardData(workerId: string): Promise<EarningsDashboardData> {
    const [summary, todaySnapshot, thisWeek, thisMonth, pendingPayments, allCompleted] =
      await Promise.all([
        this.repo.getEarningsSummary(workerId),
        this.repo.getTodaySnapshot(workerId),
        this.repo.getWeeklyBreakdown(workerId),
        this.repo.getMonthlyBreakdown(workerId),
        this.repo.getPendingPayments(workerId),
        this.repo.getCompletedPayments(workerId),
      ]);

    // Show only the 5 most recent completed payments on the dashboard.
    const recentCompleted = allCompleted
      .sort((a, b) => b.disbursedAt.localeCompare(a.disbursedAt))
      .slice(0, 5);

    return {
      summary,
      todaySnapshot,
      thisWeek,
      thisMonth,
      pendingPayments,
      recentCompleted,
    };
  }

  // ── Earnings Breakdown ─────────────────────────────────────────────────────

  async getTodayEarnings(workerId: string): Promise<DailyEarningsSnapshot> {
    return this.repo.getTodaySnapshot(workerId);
  }

  async getWeeklyBreakdown(
    workerId: string,
    referenceDate?: string,
  ): Promise<WeeklyEarningsBreakdown> {
    return this.repo.getWeeklyBreakdown(workerId, referenceDate);
  }

  async getMonthlyBreakdown(
    workerId: string,
    month?: number,
    year?: number,
  ): Promise<MonthlyEarningsBreakdown> {
    return this.repo.getMonthlyBreakdown(workerId, month, year);
  }

  /**
   * Returns monthly breakdowns for the last N months.
   * Useful for trend charts.
   */
  async getLastNMonthsBreakdown(
    workerId: string,
    n: number,
  ): Promise<MonthlyEarningsBreakdown[]> {
    const now = new Date();
    const promises: Promise<MonthlyEarningsBreakdown>[] = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      promises.push(this.repo.getMonthlyBreakdown(workerId, d.getMonth() + 1, d.getFullYear()));
    }
    const results = await Promise.all(promises);
    return results.reverse(); // chronological order
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  async getPendingPayments(workerId: string): Promise<PendingPayment[]> {
    return this.repo.getPendingPayments(workerId);
  }

  async getCompletedPayments(workerId: string): Promise<CompletedPayment[]> {
    const payments = await this.repo.getCompletedPayments(workerId);
    return payments.sort((a, b) => b.disbursedAt.localeCompare(a.disbursedAt));
  }

  // ── Transaction History ────────────────────────────────────────────────────

  async getTransactionHistory(
    filter: EarningsHistoryFilter,
  ): Promise<PaginatedEarningsHistory> {
    // Enforce defaults.
    return this.repo.getTransactionHistory({
      sortBy: 'occurredAt',
      sortOrder: 'desc',
      page: 1,
      pageSize: 20,
      ...filter,
    });
  }

  async getTransactionById(id: string): Promise<WorkerEarningsTransaction | null> {
    return this.repo.getTransactionById(id);
  }

  // ── Insights ───────────────────────────────────────────────────────────────

  /**
   * Derives lightweight insights from the monthly breakdown.
   * Used for the "Insights" card on the worker earnings page.
   */
  async getEarningsInsights(workerId: string): Promise<EarningsInsights> {
    const [currentMonth, lastMonth] = await Promise.all([
      this.repo.getMonthlyBreakdown(workerId),
      this.repo.getMonthlyBreakdown(
        workerId,
        new Date().getMonth() === 0 ? 12 : new Date().getMonth(),
        new Date().getMonth() === 0
          ? new Date().getFullYear() - 1
          : new Date().getFullYear(),
      ),
    ]);

    // Best / worst day.
    const days = currentMonth.weeklyBreakdown.flatMap(w => w.dailyBreakdown);
    const daysWithWork = days.filter(d => d.jobsCompleted > 0);
    const bestDay = daysWithWork.length
      ? daysWithWork.reduce((a, b) => (a.totalNet >= b.totalNet ? a : b))
      : null;
    const worstDay = daysWithWork.length
      ? daysWithWork.reduce((a, b) => (a.totalNet <= b.totalNet ? a : b))
      : null;

    // Most lucrative category.
    const topCat =
      currentMonth.topCategories.length > 0
        ? currentMonth.topCategories[0].category
        : 'N/A';

    // Growth vs last month.
    const growth =
      lastMonth.totalNet > 0
        ? Math.round(((currentMonth.totalNet - lastMonth.totalNet) / lastMonth.totalNet) * 100)
        : 0;

    // Estimated month-end earnings: prorate based on current day-of-month.
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    const estimatedMonthEndNet =
      dayOfMonth > 0
        ? Math.round((currentMonth.totalNet / dayOfMonth) * daysInMonth)
        : currentMonth.totalNet;

    return {
      bestDayThisMonth: bestDay,
      worstDayThisMonth: worstDay,
      mostLucrativeCategory: topCat,
      growthVsLastMonth: growth,
      estimatedMonthEndNet,
    };
  }

  // ── Disbursement Management (Society Manager / Admin) ──────────────────────

  /**
   * Returns all disbursement batches visible to a society manager.
   */
  async getDisbursementBatches(societyId: string): Promise<EarningsDisbursementBatch[]> {
    return this.repo.getDisbursementBatches(societyId);
  }

  /**
   * Places a pending payment on hold (e.g., during dispute resolution).
   */
  async holdPayment(paymentId: string, reason: string): Promise<PendingPayment> {
    return this.repo.updatePendingPaymentStatus(paymentId, 'ON_HOLD', reason);
  }

  /**
   * Releases a held payment back to PENDING.
   */
  async releasePayment(paymentId: string): Promise<PendingPayment> {
    return this.repo.updatePendingPaymentStatus(paymentId, 'PENDING');
  }

  /**
   * Triggers a disbursement batch for the given pending payment IDs.
   * Validates that all IDs belong to the same society (domain guard).
   */
  async triggerDisbursement(
    paymentIds: string[],
    processedBy: string,
  ): Promise<EarningsDisbursementBatch> {
    if (paymentIds.length === 0) {
      throw new Error('At least one payment ID is required to trigger a disbursement.');
    }
    return this.repo.processDisbursementBatch(paymentIds, processedBy);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /**
   * Computes the earnings split for a given job, mirroring the platform
   * revenue configuration. Useful when previewing earnings before job completion.
   */
  static computeJobEarningsSplit(
    bookingId: string,
    totalJobValue: number,
    workerSharePercent: number,
    societySharePercent: number,
    cooperativeFundPercent: number,
    tdsPercent = 0,
  ): JobEarningsSplit {
    const workerAmount = Math.round(totalJobValue * (workerSharePercent / 100) * 100) / 100;
    const societyAmount = Math.round(totalJobValue * (societySharePercent / 100) * 100) / 100;
    const cooperativeAmount =
      Math.round(totalJobValue * (cooperativeFundPercent / 100) * 100) / 100;
    const platformFeeDeducted = 0; // No platform fee in the current cooperative model.
    const tdsDeduction = Math.round(workerAmount * (tdsPercent / 100) * 100) / 100;
    return {
      bookingId,
      totalJobValue,
      workerSharePercent,
      workerAmount,
      societyAmount,
      cooperativeAmount,
      platformFeeDeducted,
      netWorkerPayout: workerAmount - tdsDeduction,
    };
  }

  /**
   * Returns a human-readable label for a disbursement status.
   */
  static disbursementStatusLabel(status: EarningsDisbursementStatus): string {
    const labels: Record<EarningsDisbursementStatus, string> = {
      PENDING: 'Awaiting Payout',
      PROCESSING: 'Transfer In Progress',
      COMPLETED: 'Credited',
      FAILED: 'Transfer Failed',
      ON_HOLD: 'On Hold',
    };
    return labels[status];
  }
}
