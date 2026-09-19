/**
 * @file workerEarnings.types.ts
 * @description Data models and interfaces for the Worker Earnings feature.
 *
 * Covers:
 *  - Today's earnings snapshot
 *  - Weekly & monthly breakdowns
 *  - Pending payments (awaiting disbursement)
 *  - Completed payments (disbursed)
 *  - Full transaction history with filters
 */

// ─── Enums & Literals ────────────────────────────────────────────────────────

/** Status of a single earnings disbursement. */
export type EarningsDisbursementStatus =
  | 'PENDING'       // Job completed; payment not yet disbursed
  | 'PROCESSING'    // Bank transfer initiated
  | 'COMPLETED'     // Amount credited to worker's account
  | 'FAILED'        // Disbursement attempt failed
  | 'ON_HOLD';      // Held by admin (dispute / verification)

/** Type of earnings transaction. */
export type EarningsTransactionType =
  | 'JOB_PAYMENT'        // Standard service job
  | 'GROUP_BOOKING_SHARE' // Share from a community group booking
  | 'BONUS'              // Performance / urgency bonus
  | 'DEDUCTION'          // Fine, cancellation penalty
  | 'REFUND'             // Reversed deduction
  | 'ADVANCE';           // Advance against upcoming earnings

/** Payment method used for disbursement. */
export type DisbursementMethod =
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'COOPERATIVE_WALLET'
  | 'CASH';

// ─── Core Models ─────────────────────────────────────────────────────────────

/**
 * Represents the worker's share breakdown for a single booking/job.
 * This is derived from the platform's revenue split configuration.
 */
export interface JobEarningsSplit {
  bookingId: string;
  /** Total amount paid by customer for the job. */
  totalJobValue: number;
  /** Percentage assigned to the worker (e.g. 70). */
  workerSharePercent: number;
  /** Absolute amount credited to the worker. */
  workerAmount: number;
  /** Absolute amount credited to the society fund. */
  societyAmount: number;
  /** Absolute amount credited to the cooperative fund. */
  cooperativeAmount: number;
  /** Platform fee / tax deducted, if any. */
  platformFeeDeducted: number;
  /** Final net amount to be disbursed to the worker. */
  netWorkerPayout: number;
}

/**
 * A single line item in the worker's earnings history.
 */
export interface WorkerEarningsTransaction {
  id: string;
  workerId: string;
  type: EarningsTransactionType;
  /** Human-readable label (e.g. "Plumbing – Tank Leak Repair"). */
  description: string;
  /** Reference to the originating booking, if applicable. */
  bookingId?: string;
  /** Reference to a group booking, if applicable. */
  groupBookingId?: string;
  /** Reference to the disbursement record. */
  disbursementId?: string;
  /** Gross amount before deductions/taxes. */
  grossAmount: number;
  /** Net amount after all deductions. */
  netAmount: number;
  /** Deductions applied (tax, fine, etc.). */
  deductions: Array<{
    label: string;
    amount: number;
  }>;
  status: EarningsDisbursementStatus;
  /** ISO 8601 timestamp when the job/event occurred. */
  occurredAt: string;
  /** ISO 8601 timestamp when the transaction was created in the system. */
  createdAt: string;
  /** ISO 8601 timestamp when the payment was disbursed. Null if pending. */
  disbursedAt?: string;
  /** Split details for this transaction, if it originates from a booking. */
  earningsSplit?: JobEarningsSplit;
}

/**
 * Aggregated earnings snapshot for a single calendar day.
 */
export interface DailyEarningsSnapshot {
  date: string; // YYYY-MM-DD
  workerId: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  jobsCompleted: number;
  transactions: WorkerEarningsTransaction[];
}

/**
 * Aggregated earnings for a single week.
 */
export interface WeeklyEarningsBreakdown {
  workerId: string;
  /** Start date of the week (Monday). YYYY-MM-DD */
  weekStartDate: string;
  /** End date of the week (Sunday). YYYY-MM-DD */
  weekEndDate: string;
  /** Week number within the year (ISO 8601 week number). */
  weekNumber: number;
  year: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  jobsCompleted: number;
  /** Per-day breakdown for the week. */
  dailyBreakdown: DailyEarningsSnapshot[];
}

/**
 * Aggregated earnings for a full calendar month.
 */
export interface MonthlyEarningsBreakdown {
  workerId: string;
  /** 1–12 */
  month: number;
  year: number;
  /** Human-readable month label, e.g. "September 2026". */
  monthLabel: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  jobsCompleted: number;
  /** Per-week breakdown within the month. */
  weeklyBreakdown: WeeklyEarningsBreakdown[];
  /** Top job categories by earnings this month. */
  topCategories: Array<{
    category: string;
    amount: number;
    jobCount: number;
  }>;
}

/**
 * A pending payment awaiting disbursement to the worker.
 */
export interface PendingPayment {
  id: string;
  workerId: string;
  workerName: string;
  /** Total gross amount pending. */
  grossAmount: number;
  /** Deductions that will be applied upon disbursement. */
  expectedDeductions: number;
  /** Net amount the worker will receive. */
  expectedNetAmount: number;
  status: EarningsDisbursementStatus;
  /** ISO 8601 timestamp of the job completion. */
  jobCompletedAt: string;
  /** Expected disbursement date per the platform's payout schedule. */
  expectedDisbursementDate: string;
  /** Source booking details. */
  bookingId: string;
  bookingDescription: string;
  /** Source group booking, if applicable. */
  groupBookingId?: string;
  /** Reason for hold, if status is ON_HOLD. */
  holdReason?: string;
}

/**
 * A completed payment that has been successfully disbursed.
 */
export interface CompletedPayment {
  id: string;
  workerId: string;
  workerName: string;
  grossAmount: number;
  deductionsApplied: number;
  netAmountDisbursed: number;
  disbursementMethod: DisbursementMethod;
  /** UPI ID / bank account ref / wallet ID. */
  disbursementReference: string;
  disbursedAt: string;
  bookingId?: string;
  groupBookingId?: string;
  bookingDescription: string;
  /** Bank/UPI transaction ID, if available. */
  externalTransactionId?: string;
}

/**
 * A disbursement batch — the platform groups pending payments and sends
 * them in a single bank batch on each payout cycle.
 */
export interface EarningsDisbursementBatch {
  id: string;
  batchDate: string;
  totalWorkers: number;
  totalGrossAmount: number;
  totalNetAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_FAILURE';
  payments: CompletedPayment[];
  failedPayments: Array<{
    workerId: string;
    workerName: string;
    amount: number;
    failureReason: string;
  }>;
  processedBy: string;
  processedAt?: string;
}

/**
 * Top-level summary of a worker's earnings — used on the dashboard/home view.
 */
export interface WorkerEarningsSummary {
  workerId: string;
  workerName: string;
  /** Today's net earnings (completed + pending for today). */
  todayNet: number;
  /** Today's pending (not yet disbursed). */
  todayPending: number;
  /** This week's total net. */
  thisWeekNet: number;
  /** This month's total net. */
  thisMonthNet: number;
  /** All-time total net earnings. */
  allTimeNet: number;
  /** Total pending across all open payments. */
  totalPendingAmount: number;
  /** Count of pending payment records. */
  pendingPaymentCount: number;
  /** Average earnings per job (last 30 days). */
  avgEarningsPerJob: number;
  /** Best earning day this month. */
  bestDayThisMonth?: DailyEarningsSnapshot;
  /** Rating average (from last 30 jobs). */
  averageRating: number;
  /** Total jobs completed (all-time). */
  totalJobsCompleted: number;
}

// ─── Filter & Pagination Interfaces ──────────────────────────────────────────

/** Filter options for querying the transaction history. */
export interface EarningsHistoryFilter {
  workerId: string;
  type?: EarningsTransactionType;
  status?: EarningsDisbursementStatus;
  /** Filter from this date (inclusive). YYYY-MM-DD */
  fromDate?: string;
  /** Filter to this date (inclusive). YYYY-MM-DD */
  toDate?: string;
  /** Filter to a specific month (1–12). */
  month?: number;
  /** Filter to a specific year. */
  year?: number;
  /** Min net amount. */
  minAmount?: number;
  /** Max net amount. */
  maxAmount?: number;
  /** Search in description. */
  searchQuery?: string;
  /** Sort field. */
  sortBy?: 'occurredAt' | 'netAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/** Paginated result for earnings history queries. */
export interface PaginatedEarningsHistory {
  transactions: WorkerEarningsTransaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totalNetInPeriod: number;
  totalGrossInPeriod: number;
}
