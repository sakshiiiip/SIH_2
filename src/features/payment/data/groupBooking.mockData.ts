/**
 * @file groupBooking.mockData.ts
 * @description Deterministic mock data for Customer Group Bookings.
 *
 * Contains:
 *  - 4 group bookings in various lifecycle states (OPEN → PAID)
 *  - Realistic participant lists with flat numbers
 *  - EQUAL and PROPORTIONAL cost split examples
 *  - Per-participant invoices and payment records
 *  - Worker assignment details
 */

import {
  GroupBooking,
  GroupBookingParticipant,
  GroupBookingStatus,
  ParticipantInvoice,
  ParticipantPaymentRecord,
  GroupBookingWorkerAssignment,
  GroupBookingFinancialSummary,
  GroupBookingSummaryCard,
} from '../types/groupBooking.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const iso = (offsetDays: number, hour = 10, minute = 0): string => {
  const d = new Date('2026-09-20T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + offsetDays);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};

const dateStr = (offsetDays: number): string => iso(offsetDays, 0, 0).slice(0, 10);

const invoiceNumber = (gbkSeq: string, participantSeq: string): string =>
  `GBK-2026-${gbkSeq}-P${participantSeq}`;

// ─────────────────────────────────────────────────────────────────────────────
// GROUP BOOKING 1 — PAID (completed & fully settled)
// Annual Pipe Inspection for 6 flats – GBK-2026-00041
// ─────────────────────────────────────────────────────────────────────────────

const gbk001_participants: GroupBookingParticipant[] = [
  {
    id: 'gbk001_p1', userId: 'user_cust_01', customerName: 'Ananya Deshmukh',
    customerPhone: '+91 98201 44521', flatNumber: 'B-402', tower: 'Tower B',
    status: 'PAID', joinedAt: iso(-15), updatedAt: iso(-2), invoiceId: 'inv_001_p1',
    assignedCostShare: 300,
  },
  {
    id: 'gbk001_p2', userId: 'user_cust_02', customerName: 'Vikram Nair',
    customerPhone: '+91 98765 12300', flatNumber: 'B-403', tower: 'Tower B',
    status: 'PAID', joinedAt: iso(-14), updatedAt: iso(-2), invoiceId: 'inv_001_p2',
    assignedCostShare: 300,
  },
  {
    id: 'gbk001_p3', userId: 'user_cust_03', customerName: 'Sunita Rao',
    customerPhone: '+91 98231 55610', flatNumber: 'B-404', tower: 'Tower B',
    status: 'PAID', joinedAt: iso(-14), updatedAt: iso(-2), invoiceId: 'inv_001_p3',
    assignedCostShare: 300,
  },
  {
    id: 'gbk001_p4', userId: 'user_cust_04', customerName: 'Rohan Menon',
    customerPhone: '+91 98111 22334', flatNumber: 'B-501', tower: 'Tower B',
    status: 'PAID', joinedAt: iso(-13), updatedAt: iso(-2), invoiceId: 'inv_001_p4',
    assignedCostShare: 300,
  },
  {
    id: 'gbk001_p5', userId: 'user_cust_05', customerName: 'Meena Joshi',
    customerPhone: '+91 97654 32100', flatNumber: 'B-502', tower: 'Tower B',
    status: 'PAID', joinedAt: iso(-13), updatedAt: iso(-2), invoiceId: 'inv_001_p5',
    assignedCostShare: 300,
  },
  {
    id: 'gbk001_p6', userId: 'user_cust_06', customerName: 'Aditya Singh',
    customerPhone: '+91 96543 21000', flatNumber: 'B-503', tower: 'Tower B',
    status: 'PAID', joinedAt: iso(-12), updatedAt: iso(-2), invoiceId: 'inv_001_p6',
    assignedCostShare: 300,
  },
];

const gbk001_invoices: ParticipantInvoice[] = gbk001_participants.map((p, i) => ({
  id: `inv_001_p${i + 1}`,
  invoiceNumber: invoiceNumber('00041', String(i + 1).padStart(2, '0')),
  groupBookingId: 'gbk_0041',
  participantId: p.id,
  userId: p.userId,
  customerName: p.customerName,
  customerPhone: p.customerPhone,
  flatNumber: p.flatNumber,
  societyName: 'Green Residency',
  issuedAt: iso(-3),
  dueDate: dateStr(-1),
  lineItems: [
    { description: 'Annual Pipe Inspection – Labour', quantity: 1, unitRate: 250, amount: 250 },
    { description: 'Material & Consumables Share', quantity: 1, unitRate: 37, amount: 37 },
    { description: 'Group Discount (10%)', quantity: 1, unitRate: -28.7, amount: -28.7 },
  ],
  subtotal: 258.3,
  taxRatePercent: 18,
  taxAmount: 46.5,
  totalDue: 304.8,
  amountPaid: 304.8,
  status: 'PAID',
  paymentId: `pay_gbk001_p${i + 1}`,
  notes: 'Thank you for participating in the group booking. 10% group discount applied.',
}));

const gbk001_payments: ParticipantPaymentRecord[] = gbk001_participants.map((p, i) => ({
  id: `pay_gbk001_p${i + 1}`,
  groupBookingId: 'gbk_0041',
  invoiceId: `inv_001_p${i + 1}`,
  participantId: p.id,
  userId: p.userId,
  customerName: p.customerName,
  amountDue: 304.8,
  amountPaid: 304.8,
  paymentMethod: i % 2 === 0 ? 'UPI' : 'NET_BANKING',
  status: 'SUCCESS',
  gatewayTransactionId: `GATE-001-P${i + 1}`,
  paymentReference: i % 2 === 0 ? `${p.customerName.split(' ')[0].toLowerCase()}@okaxis` : `NEFT00${i + 1}`,
  initiatedAt: iso(-2, 10, i * 5),
  confirmedAt: iso(-2, 10, i * 5 + 2),
  receiptSent: true,
}));

const gbk001_workerAssignments: GroupBookingWorkerAssignment[] = [
  {
    id: 'wa_gbk001_01',
    groupBookingId: 'gbk_0041',
    workerId: 'w_rahul',
    workerName: 'Rahul Sharma',
    workerPhone: '+91 97112 88402',
    workerProfession: 'Plumbing',
    assignedParticipantIds: gbk001_participants.map(p => p.id),
    assignedFlats: gbk001_participants.map(p => p.flatNumber),
    status: 'PAID',
    assignedAt: iso(-4),
    startedAt: iso(-1, 9, 0),
    completedAt: iso(-1, 16, 30),
    arrivalOtpVerified: true,
    workNotes: 'All 6 units inspected. Minor leak in B-502 sealed with epoxy. All drain lines cleared.',
    workPhotos: [],
    workerEarning: 1260,
  },
];

export const MOCK_GROUP_BOOKING_001: GroupBooking = {
  id: 'gbk_0041',
  referenceNumber: 'GBK-2026-00041',
  organiserId: 'user_cust_01',
  organiserName: 'Ananya Deshmukh',
  organiserPhone: '+91 98201 44521',
  organiserFlatNumber: 'B-402',
  societyId: 'soc_green_residency',
  societyName: 'Green Residency',

  serviceCategory: 'Plumbing',
  problemType: 'Pipe Inspection & Preventive Maintenance',
  description: 'Annual pre-monsoon pipe inspection and drain cleaning for Tower B flats 402–503.',
  urgencyTier: 'STANDARD',
  photos: [],

  participants: gbk001_participants,
  minimumParticipants: 4,
  maximumParticipants: 12,

  schedule: {
    preferredDate: dateStr(-6),
    preferredTimeStart: '09:00',
    preferredTimeEnd: '17:00',
    confirmedDate: dateStr(-1),
    confirmedTimeStart: '09:00',
    confirmedTimeEnd: '17:00',
  },

  costSplit: {
    strategy: 'EQUAL',
    totalGroupCost: 2000,
    groupDiscountPercent: 10,
    discountedTotal: 1800,
    allocations: gbk001_participants.map(p => ({
      participantId: p.id,
      userId: p.userId,
      customerName: p.customerName,
      flatNumber: p.flatNumber,
      rawShare: 333.33,
      finalShare: 300,
    })),
    finalizedAt: iso(-3),
  },

  revenueBreakdown: {
    total: 1800,
    workerShare: 1260,
    societyShare: 90,
    cooperativeFund: 450,
    workerCount: 1,
    perWorkerShare: 1260,
  },

  workerAssignments: gbk001_workerAssignments,
  invoices: gbk001_invoices,
  payments: gbk001_payments,

  status: 'PAID',
  arrivalOtp: '4821',
  createdAt: iso(-15),
  updatedAt: iso(-2),
  lockedAt: iso(-12),
  confirmedAt: iso(-4),
  completedAt: iso(-1, 17, 0),

  notes: 'Annual maintenance group booking – organized by Tower B residents committee.',
  bookingTag: 'annual_maintenance',
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP BOOKING 2 — IN_PROGRESS
// Festival Deep-Clean Plumbing for 8 units – GBK-2026-00038
// ─────────────────────────────────────────────────────────────────────────────

const gbk002_participants: GroupBookingParticipant[] = [
  { id: 'gbk002_p1', userId: 'user_cust_07', customerName: 'Kavitha Rajan', customerPhone: '+91 98109 33412', flatNumber: 'A-101', tower: 'Tower A', unitAreaSqFt: 950, status: 'PAID', joinedAt: iso(-9), updatedAt: iso(-1), invoiceId: 'inv_002_p1', assignedCostShare: 487.5 },
  { id: 'gbk002_p2', userId: 'user_cust_08', customerName: 'Nikhil Varma', customerPhone: '+91 97234 55678', flatNumber: 'A-102', tower: 'Tower A', unitAreaSqFt: 1200, status: 'PAID', joinedAt: iso(-9), updatedAt: iso(-1), invoiceId: 'inv_002_p2', assignedCostShare: 616.5 },
  { id: 'gbk002_p3', userId: 'user_cust_09', customerName: 'Preethi Kumar', customerPhone: '+91 97811 22345', flatNumber: 'A-103', tower: 'Tower A', unitAreaSqFt: 950, status: 'INVOICED', joinedAt: iso(-8), updatedAt: iso(0), invoiceId: 'inv_002_p3', assignedCostShare: 487.5 },
  { id: 'gbk002_p4', userId: 'user_cust_10', customerName: 'Rajan Pillai', customerPhone: '+91 96342 11200', flatNumber: 'A-201', tower: 'Tower A', unitAreaSqFt: 1200, status: 'INVOICED', joinedAt: iso(-8), updatedAt: iso(0), invoiceId: 'inv_002_p4', assignedCostShare: 616.5 },
  { id: 'gbk002_p5', userId: 'user_cust_11', customerName: 'Sowmya Krishnan', customerPhone: '+91 98001 77654', flatNumber: 'A-202', tower: 'Tower A', unitAreaSqFt: 800, status: 'INVOICED', joinedAt: iso(-7), updatedAt: iso(0), invoiceId: 'inv_002_p5', assignedCostShare: 411 },
  { id: 'gbk002_p6', userId: 'user_cust_12', customerName: 'Dinesh Iyer', customerPhone: '+91 97654 99100', flatNumber: 'A-203', tower: 'Tower A', unitAreaSqFt: 800, status: 'INVOICED', joinedAt: iso(-7), updatedAt: iso(0), invoiceId: 'inv_002_p6', assignedCostShare: 411 },
  { id: 'gbk002_p7', userId: 'user_cust_13', customerName: 'Gayatri Shah', customerPhone: '+91 98321 45001', flatNumber: 'A-301', tower: 'Tower A', unitAreaSqFt: 1050, status: 'INVOICED', joinedAt: iso(-7), updatedAt: iso(0), invoiceId: 'inv_002_p7', assignedCostShare: 539.25 },
  { id: 'gbk002_p8', userId: 'user_cust_14', customerName: 'Vivek Reddy', customerPhone: '+91 96543 77800', flatNumber: 'A-302', tower: 'Tower A', unitAreaSqFt: 1050, status: 'INVOICED', joinedAt: iso(-6), updatedAt: iso(0), invoiceId: 'inv_002_p8', assignedCostShare: 539.25 },
];

export const MOCK_GROUP_BOOKING_002: GroupBooking = {
  id: 'gbk_0038',
  referenceNumber: 'GBK-2026-00038',
  organiserId: 'user_cust_07',
  organiserName: 'Kavitha Rajan',
  organiserPhone: '+91 98109 33412',
  organiserFlatNumber: 'A-101',
  societyId: 'soc_green_residency',
  societyName: 'Green Residency',

  serviceCategory: 'Plumbing',
  problemType: 'Pre-Festival Deep-Clean & Pipe Flush',
  description: 'Complete pipe flush and drain cleaning before Navratri. Tower A, floors 1–3.',
  urgencyTier: 'STANDARD',
  photos: [],

  participants: gbk002_participants,
  minimumParticipants: 6,
  maximumParticipants: 16,

  schedule: {
    preferredDate: dateStr(-3),
    preferredTimeStart: '08:00',
    preferredTimeEnd: '18:00',
    confirmedDate: dateStr(0),
    confirmedTimeStart: '08:00',
    confirmedTimeEnd: '18:00',
  },

  costSplit: {
    strategy: 'PROPORTIONAL',
    totalGroupCost: 4500,
    groupDiscountPercent: 12,
    discountedTotal: 3960,
    allocations: gbk002_participants.map(p => ({
      participantId: p.id,
      userId: p.userId,
      customerName: p.customerName,
      flatNumber: p.flatNumber,
      rawShare: ((p.unitAreaSqFt ?? 1000) / 8000) * 4500,
      finalShare: p.assignedCostShare ?? 0,
      weight: p.unitAreaSqFt,
    })),
    finalizedAt: iso(-2),
  },

  revenueBreakdown: {
    total: 3960,
    workerShare: 2772,
    societyShare: 198,
    cooperativeFund: 990,
    workerCount: 2,
    perWorkerShare: 1386,
  },

  workerAssignments: [
    {
      id: 'wa_gbk002_01',
      groupBookingId: 'gbk_0038',
      workerId: 'w_rahul',
      workerName: 'Rahul Sharma',
      workerPhone: '+91 97112 88402',
      workerProfession: 'Plumbing',
      assignedParticipantIds: gbk002_participants.slice(0, 4).map(p => p.id),
      assignedFlats: gbk002_participants.slice(0, 4).map(p => p.flatNumber),
      status: 'IN_PROGRESS',
      assignedAt: iso(-2),
      startedAt: iso(0, 8, 15),
      arrivalOtpVerified: true,
      workerEarning: 1386,
    },
    {
      id: 'wa_gbk002_02',
      groupBookingId: 'gbk_0038',
      workerId: 'w_suresh',
      workerName: 'Suresh Patil',
      workerPhone: '+91 98765 43210',
      workerProfession: 'Plumbing',
      assignedParticipantIds: gbk002_participants.slice(4).map(p => p.id),
      assignedFlats: gbk002_participants.slice(4).map(p => p.flatNumber),
      status: 'IN_PROGRESS',
      assignedAt: iso(-2),
      startedAt: iso(0, 8, 30),
      arrivalOtpVerified: true,
      workerEarning: 1386,
    },
  ],

  invoices: gbk002_participants.map((p, i) => ({
    id: `inv_002_p${i + 1}`,
    invoiceNumber: invoiceNumber('00038', String(i + 1).padStart(2, '0')),
    groupBookingId: 'gbk_0038',
    participantId: p.id,
    userId: p.userId,
    customerName: p.customerName,
    customerPhone: p.customerPhone,
    flatNumber: p.flatNumber,
    societyName: 'Green Residency',
    issuedAt: iso(0),
    dueDate: dateStr(3),
    lineItems: [
      { description: 'Pre-Festival Deep Clean – Proportional Share', quantity: 1, unitRate: p.assignedCostShare ?? 0, amount: p.assignedCostShare ?? 0 },
    ],
    subtotal: p.assignedCostShare ?? 0,
    taxRatePercent: 18,
    taxAmount: ((p.assignedCostShare ?? 0) * 0.18),
    totalDue: ((p.assignedCostShare ?? 0) * 1.18),
    amountPaid: i < 2 ? ((p.assignedCostShare ?? 0) * 1.18) : 0,
    status: (i < 2 ? 'PAID' : 'SENT') as ParticipantInvoice['status'],
    paymentId: i < 2 ? `pay_gbk002_p${i + 1}` : undefined,
    notes: 'Proportional split based on unit area (sq.ft). 12% group discount applied.',
  })),

  payments: gbk002_participants.slice(0, 2).map((p, i) => ({
    id: `pay_gbk002_p${i + 1}`,
    groupBookingId: 'gbk_0038',
    invoiceId: `inv_002_p${i + 1}`,
    participantId: p.id,
    userId: p.userId,
    customerName: p.customerName,
    amountDue: (p.assignedCostShare ?? 0) * 1.18,
    amountPaid: (p.assignedCostShare ?? 0) * 1.18,
    paymentMethod: 'UPI' as const,
    status: 'SUCCESS' as const,
    gatewayTransactionId: `GATE-002-P${i + 1}`,
    paymentReference: `${p.customerName.split(' ')[0].toLowerCase()}@oksbi`,
    initiatedAt: iso(0, 9, i * 10),
    confirmedAt: iso(0, 9, i * 10 + 3),
    receiptSent: true,
  })),

  status: 'IN_PROGRESS',
  arrivalOtp: '7364',
  createdAt: iso(-9),
  updatedAt: iso(0),
  lockedAt: iso(-7),
  confirmedAt: iso(-2),

  notes: 'Tower A pre-Navratri maintenance — proportional split by unit area.',
  bookingTag: 'festive_cleaning',
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP BOOKING 3 — OPEN (collecting participants)
// Waterproofing + Terrace Drainage Fix – GBK-2026-00052
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_GROUP_BOOKING_003: GroupBooking = {
  id: 'gbk_0052',
  referenceNumber: 'GBK-2026-00052',
  organiserId: 'user_cust_01',
  organiserName: 'Ananya Deshmukh',
  organiserPhone: '+91 98201 44521',
  organiserFlatNumber: 'B-402',
  societyId: 'soc_green_residency',
  societyName: 'Green Residency',

  serviceCategory: 'Waterproofing',
  problemType: 'Terrace Drainage & Waterproofing',
  description: 'Post-monsoon terrace waterproofing and drainage clearing. Open to all top-floor residents.',
  urgencyTier: 'STANDARD',
  photos: [],

  participants: [
    { id: 'gbk003_p1', userId: 'user_cust_01', customerName: 'Ananya Deshmukh', customerPhone: '+91 98201 44521', flatNumber: 'B-402', tower: 'Tower B', status: 'CONFIRMED', joinedAt: iso(0, 8, 0), updatedAt: iso(0, 8, 0) },
    { id: 'gbk003_p2', userId: 'user_cust_15', customerName: 'Priya Venkatesh', customerPhone: '+91 98877 66554', flatNumber: 'A-401', tower: 'Tower A', status: 'CONFIRMED', joinedAt: iso(0, 8, 30), updatedAt: iso(0, 8, 30) },
    { id: 'gbk003_p3', userId: 'user_cust_16', customerName: 'Mahesh Kulkarni', customerPhone: '+91 96533 44100', flatNumber: 'C-401', tower: 'Tower C', status: 'PENDING', joinedAt: iso(0, 9, 0), updatedAt: iso(0, 9, 0) },
  ],
  minimumParticipants: 4,
  maximumParticipants: 20,

  schedule: {
    preferredDate: dateStr(7),
    preferredTimeStart: '08:00',
    preferredTimeEnd: '17:00',
  },

  costSplit: {
    strategy: 'EQUAL',
    totalGroupCost: 8000,
    groupDiscountPercent: 15,
    discountedTotal: 6800,
    allocations: [],   // Not finalized yet – awaiting participant lock
  },

  workerAssignments: [],
  invoices: [],
  payments: [],

  status: 'OPEN',
  arrivalOtp: '2951',
  createdAt: iso(0, 7, 30),
  updatedAt: iso(0, 9, 5),

  notes: 'Need at least 4 participants to confirm. Please share with terrace-facing neighbours.',
  bookingTag: 'post_monsoon_waterproofing',
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP BOOKING 4 — CONFIRMED (worker assigned, awaiting start)
// Electrical Safety Audit for 5 units – GBK-2026-00049
// ─────────────────────────────────────────────────────────────────────────────

const gbk004_participants: GroupBookingParticipant[] = [
  { id: 'gbk004_p1', userId: 'user_cust_20', customerName: 'Rahul Bose', customerPhone: '+91 98100 77001', flatNumber: 'C-201', tower: 'Tower C', status: 'CONFIRMED', joinedAt: iso(-5), updatedAt: iso(-2), assignedCostShare: 840 },
  { id: 'gbk004_p2', userId: 'user_cust_21', customerName: 'Lalita Bose', customerPhone: '+91 97100 77002', flatNumber: 'C-202', tower: 'Tower C', status: 'CONFIRMED', joinedAt: iso(-5), updatedAt: iso(-2), assignedCostShare: 840 },
  { id: 'gbk004_p3', userId: 'user_cust_22', customerName: 'Girish Patel', customerPhone: '+91 96100 77003', flatNumber: 'C-203', tower: 'Tower C', status: 'CONFIRMED', joinedAt: iso(-4), updatedAt: iso(-2), assignedCostShare: 840 },
  { id: 'gbk004_p4', userId: 'user_cust_23', customerName: 'Neeta Patel', customerPhone: '+91 95100 77004', flatNumber: 'C-301', tower: 'Tower C', status: 'CONFIRMED', joinedAt: iso(-4), updatedAt: iso(-2), assignedCostShare: 840 },
  { id: 'gbk004_p5', userId: 'user_cust_24', customerName: 'Suresh Bhat', customerPhone: '+91 94100 77005', flatNumber: 'C-302', tower: 'Tower C', status: 'CONFIRMED', joinedAt: iso(-3), updatedAt: iso(-2), assignedCostShare: 840 },
];

export const MOCK_GROUP_BOOKING_004: GroupBooking = {
  id: 'gbk_0049',
  referenceNumber: 'GBK-2026-00049',
  organiserId: 'user_cust_20',
  organiserName: 'Rahul Bose',
  organiserPhone: '+91 98100 77001',
  organiserFlatNumber: 'C-201',
  societyId: 'soc_green_residency',
  societyName: 'Green Residency',

  serviceCategory: 'Electrical',
  problemType: 'Electrical Safety Audit',
  description: 'Complete electrical safety audit for Tower C floor 2 & 3 units. Panel check + wiring inspection.',
  urgencyTier: 'STANDARD',
  photos: [],

  participants: gbk004_participants,
  minimumParticipants: 3,
  maximumParticipants: 10,

  schedule: {
    preferredDate: dateStr(2),
    preferredTimeStart: '09:00',
    preferredTimeEnd: '16:00',
    confirmedDate: dateStr(2),
    confirmedTimeStart: '09:00',
    confirmedTimeEnd: '16:00',
  },

  costSplit: {
    strategy: 'EQUAL',
    totalGroupCost: 5000,
    groupDiscountPercent: 16,
    discountedTotal: 4200,
    allocations: gbk004_participants.map(p => ({
      participantId: p.id,
      userId: p.userId,
      customerName: p.customerName,
      flatNumber: p.flatNumber,
      rawShare: 1000,
      finalShare: 840,
    })),
    finalizedAt: iso(-2),
  },

  revenueBreakdown: {
    total: 4200,
    workerShare: 2940,
    societyShare: 210,
    cooperativeFund: 1050,
    workerCount: 1,
    perWorkerShare: 2940,
  },

  workerAssignments: [
    {
      id: 'wa_gbk004_01',
      groupBookingId: 'gbk_0049',
      workerId: 'w_electrician_01',
      workerName: 'Ajay Kothari',
      workerPhone: '+91 99111 22333',
      workerProfession: 'Electrical',
      assignedParticipantIds: gbk004_participants.map(p => p.id),
      assignedFlats: gbk004_participants.map(p => p.flatNumber),
      status: 'CONFIRMED',
      assignedAt: iso(-2),
      workerEarning: 2940,
    },
  ],

  invoices: [],   // Invoices not yet generated (pre-job)
  payments: [],

  status: 'CONFIRMED',
  arrivalOtp: '6103',
  createdAt: iso(-6),
  updatedAt: iso(-2),
  lockedAt: iso(-4),
  confirmedAt: iso(-2),

  notes: 'Scheduled for day-after-tomorrow. All 5 units confirmed. Worker briefed.',
  bookingTag: 'electrical_safety',
};

// ─── All Group Bookings ────────────────────────────────────────────────────────

export const ALL_MOCK_GROUP_BOOKINGS: GroupBooking[] = [
  MOCK_GROUP_BOOKING_001,
  MOCK_GROUP_BOOKING_002,
  MOCK_GROUP_BOOKING_003,
  MOCK_GROUP_BOOKING_004,
];

// ─── Summary Cards ─────────────────────────────────────────────────────────────

export const MOCK_GROUP_BOOKING_SUMMARY_CARDS: GroupBookingSummaryCard[] = ALL_MOCK_GROUP_BOOKINGS.map(gb => ({
  id: gb.id,
  referenceNumber: gb.referenceNumber,
  serviceCategory: gb.serviceCategory,
  societyName: gb.societyName,
  status: gb.status,
  organiserName: gb.organiserName,
  organiserFlatNumber: gb.organiserFlatNumber,
  confirmedParticipants: gb.participants.filter(p => ['CONFIRMED', 'PAID', 'INVOICED'].includes(p.status)).length,
  totalParticipants: gb.participants.length,
  totalGroupCost: gb.costSplit.discountedTotal,
  userCostShare: gb.costSplit.allocations.find(a => a.userId === 'user_cust_01')?.finalShare,
  preferredDate: gb.schedule.preferredDate,
  createdAt: gb.createdAt,
}));

// ─── Financial Summary (Society Manager View) ──────────────────────────────────

export const MOCK_GROUP_BOOKING_FINANCIAL_SUMMARY: GroupBookingFinancialSummary = {
  societyId: 'soc_green_residency',
  societyName: 'Green Residency',
  month: 9,
  year: 2026,
  totalGroupBookings: 4,
  totalRevenue: 1800 + 3960 + 0 + 4200,   // PAID + IN_PROGRESS + OPEN(0) + CONFIRMED
  totalCollected: 1800 + (304.8 * 2),     // GBK001 fully paid + 2 from GBK002
  totalOutstanding: 3960 - (304.8 * 2) + 4200,
  societyFundShare: 90 + 198 + 210,
  cooperativeFundShare: 450 + 990 + 1050,
  totalWorkerPayouts: 1260 + 2772 + 2940,
  byStatus: {
    DRAFT: 0,
    OPEN: 1,
    LOCKED: 0,
    CONFIRMED: 1,
    IN_PROGRESS: 1,
    COMPLETED: 0,
    INVOICED: 0,
    PAID: 1,
    PARTIALLY_PAID: 0,
    CANCELLED: 0,
  },
};
