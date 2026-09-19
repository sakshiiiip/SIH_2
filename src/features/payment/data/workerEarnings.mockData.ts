/**
 * @file workerEarnings.mockData.ts
 * @description Deterministic mock data for Worker Earnings.
 *
 * Mirrors real-world patterns:
 *  - Worker "w_rahul" (Rahul Sharma) — the demo worker from the main store.
 *  - Transactions span ~3 months to populate breakdowns.
 *  - Mix of JOB_PAYMENT, GROUP_BOOKING_SHARE, BONUS, DEDUCTION transaction types.
 *  - Mix of PENDING, PROCESSING, COMPLETED, and ON_HOLD disbursements.
 */

import {
  WorkerEarningsTransaction,
  CompletedPayment,
  PendingPayment,
  WorkerEarningsSummary,
  DailyEarningsSnapshot,
  WeeklyEarningsBreakdown,
  MonthlyEarningsBreakdown,
  EarningsDisbursementBatch,
} from '../types/workerEarnings.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const iso = (offsetDays: number, hour = 10, minute = 0): string => {
  const d = new Date('2026-09-20T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + offsetDays);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};

const dateStr = (offsetDays: number): string => iso(offsetDays, 0, 0).slice(0, 10);

// ─── Full Transaction History ─────────────────────────────────────────────────

export const MOCK_WORKER_TRANSACTIONS: WorkerEarningsTransaction[] = [
  // ── TODAY (offset 0) ──────────────────────────────────────────────────────
  {
    id: 'txn_001',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Bathroom Tap Replacement · Flat 102, Green Residency',
    bookingId: 'bkg_0101',
    disbursementId: 'dis_0101',
    grossAmount: 800,
    netAmount: 800,
    deductions: [],
    status: 'PENDING',
    occurredAt: iso(0, 9, 30),
    createdAt: iso(0, 9, 35),
    earningsSplit: {
      bookingId: 'bkg_0101',
      totalJobValue: 1143,
      workerSharePercent: 70,
      workerAmount: 800,
      societyAmount: 57,
      cooperativeAmount: 286,
      platformFeeDeducted: 0,
      netWorkerPayout: 800,
    },
  },
  {
    id: 'txn_002',
    workerId: 'w_rahul',
    type: 'BONUS',
    description: 'Urgent Response Bonus – Emergency Tank Leak (Tier: EMERGENCY)',
    bookingId: 'bkg_0102',
    grossAmount: 200,
    netAmount: 200,
    deductions: [],
    status: 'PENDING',
    occurredAt: iso(0, 14, 0),
    createdAt: iso(0, 14, 5),
  },
  {
    id: 'txn_003',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Main Line Pressure Fix · Flat 504, Green Residency',
    bookingId: 'bkg_0103',
    disbursementId: 'dis_0103',
    grossAmount: 1120,
    netAmount: 1120,
    deductions: [],
    status: 'PENDING',
    occurredAt: iso(0, 16, 45),
    createdAt: iso(0, 16, 50),
    earningsSplit: {
      bookingId: 'bkg_0103',
      totalJobValue: 1600,
      workerSharePercent: 70,
      workerAmount: 1120,
      societyAmount: 80,
      cooperativeAmount: 400,
      platformFeeDeducted: 0,
      netWorkerPayout: 1120,
    },
  },

  // ── YESTERDAY (offset -1) ─────────────────────────────────────────────────
  {
    id: 'txn_004',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Kitchen Sink Blockage · Flat 203, Green Residency',
    bookingId: 'bkg_0099',
    disbursementId: 'dis_0099',
    grossAmount: 490,
    netAmount: 490,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-1, 11, 0),
    createdAt: iso(-1, 11, 5),
    disbursedAt: iso(0, 8, 0),
    earningsSplit: {
      bookingId: 'bkg_0099',
      totalJobValue: 700,
      workerSharePercent: 70,
      workerAmount: 490,
      societyAmount: 35,
      cooperativeAmount: 175,
      platformFeeDeducted: 0,
      netWorkerPayout: 490,
    },
  },
  {
    id: 'txn_005',
    workerId: 'w_rahul',
    type: 'GROUP_BOOKING_SHARE',
    description: 'Group Booking – Annual Pipe Inspection (6 units) · Share from GBK-2026-00041',
    groupBookingId: 'gbk_0041',
    disbursementId: 'dis_0041',
    grossAmount: 1260,
    netAmount: 1197,
    deductions: [{ label: 'TDS (5%)', amount: 63 }],
    status: 'COMPLETED',
    occurredAt: iso(-1, 15, 30),
    createdAt: iso(-1, 15, 35),
    disbursedAt: iso(0, 8, 0),
  },

  // ── 3 DAYS AGO ────────────────────────────────────────────────────────────
  {
    id: 'txn_006',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Water Heater Installation · Flat 701, Tower B, Green Residency',
    bookingId: 'bkg_0095',
    grossAmount: 2100,
    netAmount: 1995,
    deductions: [{ label: 'TDS (5%)', amount: 105 }],
    status: 'COMPLETED',
    occurredAt: iso(-3, 10, 30),
    createdAt: iso(-3, 10, 35),
    disbursedAt: iso(-2, 8, 0),
    earningsSplit: {
      bookingId: 'bkg_0095',
      totalJobValue: 3000,
      workerSharePercent: 70,
      workerAmount: 2100,
      societyAmount: 150,
      cooperativeAmount: 750,
      platformFeeDeducted: 0,
      netWorkerPayout: 1995,
    },
  },
  {
    id: 'txn_007',
    workerId: 'w_rahul',
    type: 'DEDUCTION',
    description: 'Late Arrival Penalty – bkg_0093 (arrived 45 min late)',
    bookingId: 'bkg_0093',
    grossAmount: -150,
    netAmount: -150,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-3, 18, 0),
    createdAt: iso(-3, 18, 5),
    disbursedAt: iso(-2, 8, 0),
  },

  // ── 5 DAYS AGO ────────────────────────────────────────────────────────────
  {
    id: 'txn_008',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Overhead Tank Float Valve Fix · Flat 309, Green Residency',
    bookingId: 'bkg_0090',
    grossAmount: 700,
    netAmount: 700,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-5, 9, 0),
    createdAt: iso(-5, 9, 5),
    disbursedAt: iso(-4, 8, 0),
    earningsSplit: {
      bookingId: 'bkg_0090',
      totalJobValue: 1000,
      workerSharePercent: 70,
      workerAmount: 700,
      societyAmount: 50,
      cooperativeAmount: 250,
      platformFeeDeducted: 0,
      netWorkerPayout: 700,
    },
  },

  // ── 7 DAYS AGO ────────────────────────────────────────────────────────────
  {
    id: 'txn_009',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Flush Tank Repair · Flat 111, Green Residency',
    bookingId: 'bkg_0088',
    grossAmount: 420,
    netAmount: 420,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-7, 11, 0),
    createdAt: iso(-7, 11, 5),
    disbursedAt: iso(-6, 8, 0),
    earningsSplit: {
      bookingId: 'bkg_0088',
      totalJobValue: 600,
      workerSharePercent: 70,
      workerAmount: 420,
      societyAmount: 30,
      cooperativeAmount: 150,
      platformFeeDeducted: 0,
      netWorkerPayout: 420,
    },
  },
  {
    id: 'txn_010',
    workerId: 'w_rahul',
    type: 'GROUP_BOOKING_SHARE',
    description: 'Group Booking – Pre-Festival Deep Clean Plumbing (8 units) · GBK-2026-00038',
    groupBookingId: 'gbk_0038',
    grossAmount: 1680,
    netAmount: 1596,
    deductions: [{ label: 'TDS (5%)', amount: 84 }],
    status: 'COMPLETED',
    occurredAt: iso(-7, 17, 0),
    createdAt: iso(-7, 17, 5),
    disbursedAt: iso(-6, 8, 0),
  },

  // ── 10 DAYS AGO ───────────────────────────────────────────────────────────
  {
    id: 'txn_011',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Drainage Blockage · Flat 402, Green Residency',
    bookingId: 'bkg_0085',
    grossAmount: 560,
    netAmount: 560,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-10, 10, 0),
    createdAt: iso(-10, 10, 5),
    disbursedAt: iso(-9, 8, 0),
    earningsSplit: {
      bookingId: 'bkg_0085',
      totalJobValue: 800,
      workerSharePercent: 70,
      workerAmount: 560,
      societyAmount: 40,
      cooperativeAmount: 200,
      platformFeeDeducted: 0,
      netWorkerPayout: 560,
    },
  },

  // ── ON_HOLD – flagged by admin ─────────────────────────────────────────────
  {
    id: 'txn_012',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Sewage Line Repair · Flat 601, Green Residency (DISPUTED)',
    bookingId: 'bkg_0082',
    grossAmount: 1400,
    netAmount: 1400,
    deductions: [],
    status: 'ON_HOLD',
    occurredAt: iso(-12, 14, 0),
    createdAt: iso(-12, 14, 5),
    earningsSplit: {
      bookingId: 'bkg_0082',
      totalJobValue: 2000,
      workerSharePercent: 70,
      workerAmount: 1400,
      societyAmount: 100,
      cooperativeAmount: 500,
      platformFeeDeducted: 0,
      netWorkerPayout: 1400,
    },
  },

  // ── 20 DAYS AGO (last month) ───────────────────────────────────────────────
  {
    id: 'txn_013',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – New Tap Installation · Flat 205, Tower A, Green Residency',
    bookingId: 'bkg_0075',
    grossAmount: 350,
    netAmount: 350,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-20, 9, 0),
    createdAt: iso(-20, 9, 5),
    disbursedAt: iso(-19, 8, 0),
    earningsSplit: {
      bookingId: 'bkg_0075',
      totalJobValue: 500,
      workerSharePercent: 70,
      workerAmount: 350,
      societyAmount: 25,
      cooperativeAmount: 125,
      platformFeeDeducted: 0,
      netWorkerPayout: 350,
    },
  },
  {
    id: 'txn_014',
    workerId: 'w_rahul',
    type: 'ADVANCE',
    description: 'Advance against September earnings – cooperative wallet',
    grossAmount: 2000,
    netAmount: 2000,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-20, 12, 0),
    createdAt: iso(-20, 12, 5),
    disbursedAt: iso(-20, 13, 0),
  },
  {
    id: 'txn_015',
    workerId: 'w_rahul',
    type: 'JOB_PAYMENT',
    description: 'Plumbing – Bore-well Pump Service · Common Area, Green Residency',
    bookingId: 'bkg_0070',
    grossAmount: 2800,
    netAmount: 2660,
    deductions: [{ label: 'TDS (5%)', amount: 140 }],
    status: 'COMPLETED',
    occurredAt: iso(-25, 10, 0),
    createdAt: iso(-25, 10, 5),
    disbursedAt: iso(-24, 8, 0),
    earningsSplit: {
      bookingId: 'bkg_0070',
      totalJobValue: 4000,
      workerSharePercent: 70,
      workerAmount: 2800,
      societyAmount: 200,
      cooperativeAmount: 1000,
      platformFeeDeducted: 0,
      netWorkerPayout: 2660,
    },
  },
  {
    id: 'txn_016',
    workerId: 'w_rahul',
    type: 'REFUND',
    description: 'Deduction Reversal – bkg_0068 (penalty overturned by manager)',
    bookingId: 'bkg_0068',
    grossAmount: 150,
    netAmount: 150,
    deductions: [],
    status: 'COMPLETED',
    occurredAt: iso(-28, 11, 0),
    createdAt: iso(-28, 11, 5),
    disbursedAt: iso(-27, 8, 0),
  },
];

// ─── Pending Payments ─────────────────────────────────────────────────────────

export const MOCK_PENDING_PAYMENTS: PendingPayment[] = [
  {
    id: 'pend_001',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 800,
    expectedDeductions: 0,
    expectedNetAmount: 800,
    status: 'PENDING',
    jobCompletedAt: iso(0, 9, 30),
    expectedDisbursementDate: dateStr(1),
    bookingId: 'bkg_0101',
    bookingDescription: 'Plumbing – Bathroom Tap Replacement · Flat 102',
  },
  {
    id: 'pend_002',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 200,
    expectedDeductions: 0,
    expectedNetAmount: 200,
    status: 'PENDING',
    jobCompletedAt: iso(0, 14, 0),
    expectedDisbursementDate: dateStr(1),
    bookingId: 'bkg_0102',
    bookingDescription: 'Urgent Response Bonus – Emergency Tank Leak',
  },
  {
    id: 'pend_003',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 1120,
    expectedDeductions: 0,
    expectedNetAmount: 1120,
    status: 'PENDING',
    jobCompletedAt: iso(0, 16, 45),
    expectedDisbursementDate: dateStr(1),
    bookingId: 'bkg_0103',
    bookingDescription: 'Plumbing – Main Line Pressure Fix · Flat 504',
  },
  {
    id: 'pend_004',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 1400,
    expectedDeductions: 0,
    expectedNetAmount: 1400,
    status: 'ON_HOLD',
    jobCompletedAt: iso(-12, 14, 0),
    expectedDisbursementDate: dateStr(5),
    bookingId: 'bkg_0082',
    bookingDescription: 'Plumbing – Sewage Line Repair · Flat 601 (DISPUTED)',
    holdReason: 'Quality dispute raised by customer. Under manager review.',
  },
];

// ─── Completed Payments ────────────────────────────────────────────────────────

export const MOCK_COMPLETED_PAYMENTS: CompletedPayment[] = [
  {
    id: 'pay_001',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 490,
    deductionsApplied: 0,
    netAmountDisbursed: 490,
    disbursementMethod: 'UPI',
    disbursementReference: 'rahulsharma@okicici',
    disbursedAt: iso(0, 8, 0),
    bookingId: 'bkg_0099',
    bookingDescription: 'Plumbing – Kitchen Sink Blockage · Flat 203',
    externalTransactionId: 'UPI2026092000001',
  },
  {
    id: 'pay_002',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 1260,
    deductionsApplied: 63,
    netAmountDisbursed: 1197,
    disbursementMethod: 'BANK_TRANSFER',
    disbursementReference: 'HDFC XXXX1234',
    disbursedAt: iso(0, 8, 0),
    groupBookingId: 'gbk_0041',
    bookingDescription: 'Group Booking Share – Annual Pipe Inspection (6 units)',
    externalTransactionId: 'NEFT2026092000002',
  },
  {
    id: 'pay_003',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 2100,
    deductionsApplied: 105,
    netAmountDisbursed: 1995,
    disbursementMethod: 'UPI',
    disbursementReference: 'rahulsharma@okicici',
    disbursedAt: iso(-2, 8, 0),
    bookingId: 'bkg_0095',
    bookingDescription: 'Plumbing – Water Heater Installation · Flat 701, Tower B',
    externalTransactionId: 'UPI2026091800003',
  },
  {
    id: 'pay_004',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: -150,
    deductionsApplied: 0,
    netAmountDisbursed: -150,
    disbursementMethod: 'COOPERATIVE_WALLET',
    disbursementReference: 'COOP-W-00412',
    disbursedAt: iso(-2, 8, 0),
    bookingId: 'bkg_0093',
    bookingDescription: 'Late Arrival Penalty Deduction',
  },
  {
    id: 'pay_005',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 700,
    deductionsApplied: 0,
    netAmountDisbursed: 700,
    disbursementMethod: 'UPI',
    disbursementReference: 'rahulsharma@okicici',
    disbursedAt: iso(-4, 8, 0),
    bookingId: 'bkg_0090',
    bookingDescription: 'Plumbing – Overhead Tank Float Valve Fix · Flat 309',
    externalTransactionId: 'UPI2026091600004',
  },
  {
    id: 'pay_006',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 420,
    deductionsApplied: 0,
    netAmountDisbursed: 420,
    disbursementMethod: 'UPI',
    disbursementReference: 'rahulsharma@okicici',
    disbursedAt: iso(-6, 8, 0),
    bookingId: 'bkg_0088',
    bookingDescription: 'Plumbing – Flush Tank Repair · Flat 111',
    externalTransactionId: 'UPI2026091400005',
  },
  {
    id: 'pay_007',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    grossAmount: 1680,
    deductionsApplied: 84,
    netAmountDisbursed: 1596,
    disbursementMethod: 'BANK_TRANSFER',
    disbursementReference: 'HDFC XXXX1234',
    disbursedAt: iso(-6, 8, 0),
    groupBookingId: 'gbk_0038',
    bookingDescription: 'Group Booking Share – Pre-Festival Deep Clean Plumbing (8 units)',
    externalTransactionId: 'NEFT2026091400006',
  },
];

// ─── Disbursement Batch ────────────────────────────────────────────────────────

export const MOCK_DISBURSEMENT_BATCHES: EarningsDisbursementBatch[] = [
  {
    id: 'batch_001',
    batchDate: dateStr(0),
    totalWorkers: 12,
    totalGrossAmount: 24680,
    totalNetAmount: 23200,
    status: 'COMPLETED',
    payments: MOCK_COMPLETED_PAYMENTS,
    failedPayments: [],
    processedBy: 'society_manager_01',
    processedAt: iso(0, 8, 30),
  },
];

// ─── Daily Snapshot (Today) ───────────────────────────────────────────────────

export const TODAY_EARNINGS_SNAPSHOT: DailyEarningsSnapshot = {
  date: dateStr(0),
  workerId: 'w_rahul',
  totalGross: 2120,       // 800 + 200 + 1120
  totalDeductions: 0,
  totalNet: 2120,
  jobsCompleted: 2,       // 2 job payments (bonus not counted as job)
  transactions: MOCK_WORKER_TRANSACTIONS.filter(t => t.occurredAt.startsWith(dateStr(0))),
};

// ─── Weekly Breakdown ─────────────────────────────────────────────────────────

export const THIS_WEEK_EARNINGS: WeeklyEarningsBreakdown = {
  workerId: 'w_rahul',
  weekStartDate: dateStr(-6), // Monday
  weekEndDate: dateStr(0),    // Sunday
  weekNumber: 38,
  year: 2026,
  totalGross: 6770,   // sum of last 7 days gross
  totalDeductions: 147,
  totalNet: 6623,
  jobsCompleted: 7,
  dailyBreakdown: [
    {
      date: dateStr(-6),
      workerId: 'w_rahul',
      totalGross: 420,
      totalDeductions: 0,
      totalNet: 420,
      jobsCompleted: 1,
      transactions: MOCK_WORKER_TRANSACTIONS.filter(t => t.occurredAt.startsWith(dateStr(-6))),
    },
    {
      date: dateStr(-5),
      workerId: 'w_rahul',
      totalGross: 700,
      totalDeductions: 0,
      totalNet: 700,
      jobsCompleted: 1,
      transactions: MOCK_WORKER_TRANSACTIONS.filter(t => t.occurredAt.startsWith(dateStr(-5))),
    },
    {
      date: dateStr(-4), workerId: 'w_rahul',
      totalGross: 0, totalDeductions: 0, totalNet: 0, jobsCompleted: 0, transactions: [],
    },
    {
      date: dateStr(-3),
      workerId: 'w_rahul',
      totalGross: 1950,   // 2100 - 150
      totalDeductions: 105,
      totalNet: 1845,
      jobsCompleted: 1,
      transactions: MOCK_WORKER_TRANSACTIONS.filter(t => t.occurredAt.startsWith(dateStr(-3))),
    },
    {
      date: dateStr(-2), workerId: 'w_rahul',
      totalGross: 0, totalDeductions: 0, totalNet: 0, jobsCompleted: 0, transactions: [],
    },
    {
      date: dateStr(-1),
      workerId: 'w_rahul',
      totalGross: 1750,   // 490 + 1260
      totalDeductions: 63,
      totalNet: 1687,
      jobsCompleted: 2,
      transactions: MOCK_WORKER_TRANSACTIONS.filter(t => t.occurredAt.startsWith(dateStr(-1))),
    },
    TODAY_EARNINGS_SNAPSHOT,
  ],
};

// ─── Monthly Breakdown ────────────────────────────────────────────────────────

export const THIS_MONTH_EARNINGS: MonthlyEarningsBreakdown = {
  workerId: 'w_rahul',
  month: 9,
  year: 2026,
  monthLabel: 'September 2026',
  totalGross: 14870,
  totalDeductions: 357,
  totalNet: 14513,
  jobsCompleted: 18,
  weeklyBreakdown: [THIS_WEEK_EARNINGS],
  topCategories: [
    { category: 'Plumbing – Installation', amount: 4955, jobCount: 2 },
    { category: 'Plumbing – Repairs', amount: 3850, jobCount: 7 },
    { category: 'Group Booking Share', amount: 2793, jobCount: 2 },
    { category: 'Bonus', amount: 200, jobCount: 1 },
  ],
};

// ─── Earnings Summary (Dashboard) ─────────────────────────────────────────────

export const MOCK_WORKER_EARNINGS_SUMMARY: WorkerEarningsSummary = {
  workerId: 'w_rahul',
  workerName: 'Rahul Sharma',
  todayNet: 2120,
  todayPending: 2120,
  thisWeekNet: 6623,
  thisMonthNet: 14513,
  allTimeNet: 182450,
  totalPendingAmount: 3520,    // pend_001 + pend_002 + pend_003 (ON_HOLD excluded)
  pendingPaymentCount: 3,
  avgEarningsPerJob: 780,
  bestDayThisMonth: TODAY_EARNINGS_SNAPSHOT,
  averageRating: 4.7,
  totalJobsCompleted: 234,
};
