/**
 * @file IWorkerEarningsRepository.ts
 * @description Repository interface (port) for Worker Earnings.
 *
 * Any concrete implementation (mock, REST API, Firebase, etc.)
 * must implement this interface. Consumers depend only on this contract.
 */

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

export interface IWorkerEarningsRepository {
  /**
   * Returns the high-level earnings summary for a worker — used on
   * the earnings dashboard / home card.
   */
  getEarningsSummary(workerId: string): Promise<WorkerEarningsSummary>;

  /**
   * Returns today's earnings snapshot for the given worker.
   */
  getTodaySnapshot(workerId: string): Promise<DailyEarningsSnapshot>;

  /**
   * Returns the weekly breakdown containing daily snapshots for the
   * ISO week that contains the given date (defaults to current week).
   */
  getWeeklyBreakdown(workerId: string, referenceDate?: string): Promise<WeeklyEarningsBreakdown>;

  /**
   * Returns monthly breakdown containing weekly snapshots for the
   * given month and year (defaults to current month).
   */
  getMonthlyBreakdown(
    workerId: string,
    month?: number,
    year?: number,
  ): Promise<MonthlyEarningsBreakdown>;

  /**
   * Returns all pending payments for a worker (status: PENDING | PROCESSING | ON_HOLD).
   */
  getPendingPayments(workerId: string): Promise<PendingPayment[]>;

  /**
   * Returns all completed (disbursed) payment records for a worker.
   */
  getCompletedPayments(workerId: string): Promise<CompletedPayment[]>;

  /**
   * Returns a single transaction by its ID.
   */
  getTransactionById(transactionId: string): Promise<WorkerEarningsTransaction | null>;

  /**
   * Returns the full paginated transaction history respecting filters.
   */
  getTransactionHistory(filter: EarningsHistoryFilter): Promise<PaginatedEarningsHistory>;

  /**
   * Returns disbursement batches — visible to society managers / admins.
   */
  getDisbursementBatches(societyId: string): Promise<EarningsDisbursementBatch[]>;

  /**
   * Updates the status of a single pending payment.
   * Typically called by manager logic to release or hold a payment.
   */
  updatePendingPaymentStatus(
    paymentId: string,
    newStatus: EarningsDisbursementStatus,
    holdReason?: string,
  ): Promise<PendingPayment>;

  /**
   * Marks a batch of pending payments as PROCESSING and initiates disbursement.
   * Returns the newly created disbursement batch record.
   */
  processDisbursementBatch(
    paymentIds: string[],
    processedBy: string,
  ): Promise<EarningsDisbursementBatch>;
}
