// ============================================================
// WORKER MOCK DATA
// src/data/workerMockData.ts
//
// All mock values for the worker dashboard are centralised here.
// Replace individual sections with real API calls when the backend
// is ready. Structure is kept compatible with the AI Fair Work
// Allocation data schema (Person 5).
// ============================================================

// ------------------------------------------------------------------
// JOB DATA SCHEMA
// Compatible with AI Fair Work Allocation output (Person 5)
// ------------------------------------------------------------------
export interface WorkerJobRequest {
  jobId: string;
  serviceType: string;         // e.g. "Plumbing"
  problemType: string;         // e.g. "Pipe Leakage"
  customer: {
    name: string;
    phone: string;
    address: string;
    flatNumber?: string;
  };
  location: string;
  distance: string;            // e.g. "1.2 km"
  date: string;
  time: string;
  estimatedEarnings: number;
  priority: 'normal' | 'urgent' | 'emergency';
  isEmergency?: boolean;
  description: string;
  status: 'new' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  // --- AI Fair Work Allocation fields (Person 5 will populate these) ---
  assignedWorker?: string;
  allocationReason?: string;
  allocationScore?: number;
  // --- Person 2 fields (Job completion / Before-After) ---
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  jobVerificationStatus?: 'pending' | 'verified' | 'disputed';
  // --- Person 3 fields (Payments / Earnings) ---
  paymentStatus?: 'pending' | 'paid';
  paymentMethod?: string;
  // --- Person 4 fields (KYC / Manager verification) ---
  managerApproved?: boolean;
  // Timestamps
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  rating?: number;
  ratingComment?: string;
}

// ------------------------------------------------------------------
// MOCK JOB REQUESTS (New incoming jobs from AI allocation)
// ------------------------------------------------------------------
export const MOCK_JOB_REQUESTS: WorkerJobRequest[] = [
  {
    jobId: 'JR-2001',
    serviceType: 'Plumbing',
    problemType: 'Pipe Leakage',
    customer: { name: 'Sunita Sharma', phone: '9876543210', address: 'Flat 304, Green Residency', flatNumber: '304' },
    location: 'Green Residency, Block B',
    distance: '0.8 km',
    date: 'Today',
    time: '11:00 AM',
    estimatedEarnings: 420,
    priority: 'urgent',
    isEmergency: false,
    description: 'Kitchen pipe is leaking near the sink joint. Water dripping continuously since morning.',
    status: 'new',
    allocationReason: 'Closest certified plumber with 4.9★ rating', // Person 5 placeholder
  },
  {
    jobId: 'JR-2002',
    serviceType: 'Electrical Repair',
    problemType: 'Power Socket Issue',
    customer: { name: 'Rajesh Gupta', phone: '9871234567', address: 'Flat 501, Sunrise Apartments', flatNumber: '501' },
    location: 'Sunrise Apartments, Block A',
    distance: '2.1 km',
    date: 'Today',
    time: '2:30 PM',
    estimatedEarnings: 350,
    priority: 'normal',
    description: 'Three power sockets in the living room stopped working suddenly. TV and fan not starting.',
    status: 'new',
    allocationReason: 'Fair work rotation — no jobs assigned today',
  },
];

// ------------------------------------------------------------------
// MOCK UPCOMING JOBS
// ------------------------------------------------------------------
export const MOCK_UPCOMING_JOBS: WorkerJobRequest[] = [
  {
    jobId: 'JB-1901',
    serviceType: 'Carpentry',
    problemType: 'Door Hinge Repair',
    customer: { name: 'Meena Iyer', phone: '9823456789', address: 'Flat 203, Palm Grove Society', flatNumber: '203' },
    location: 'Palm Grove Society',
    distance: '1.5 km',
    date: 'Tomorrow',
    time: '10:00 AM',
    estimatedEarnings: 280,
    priority: 'normal',
    description: 'Main door hinge is broken and door does not close properly. Need urgent repair.',
    status: 'upcoming',
    scheduledAt: '2026-09-19T10:00:00',
    paymentStatus: 'pending',
  },
  {
    jobId: 'JB-1902',
    serviceType: 'Cleaning',
    problemType: 'Deep House Cleaning',
    customer: { name: 'Arvind Mehta', phone: '9845678901', address: 'Flat 102, Blue Bell Tower', flatNumber: '102' },
    location: 'Blue Bell Tower',
    distance: '3.2 km',
    date: 'Sep 20',
    time: '9:00 AM',
    estimatedEarnings: 600,
    priority: 'normal',
    description: '3 BHK deep cleaning — kitchen, bathrooms, and all rooms. Estimated 4-5 hours.',
    status: 'upcoming',
    scheduledAt: '2026-09-20T09:00:00',
    paymentStatus: 'pending',
  },
];

// ------------------------------------------------------------------
// MOCK IN-PROGRESS JOB
// ------------------------------------------------------------------
export const MOCK_IN_PROGRESS_JOB: WorkerJobRequest = {
  jobId: 'JB-1850',
  serviceType: 'Appliance Repair',
  problemType: 'Washing Machine Not Spinning',
  customer: { name: 'Priya Nair', phone: '9812345678', address: 'Flat 405, Green Residency', flatNumber: '405' },
  location: 'Green Residency, Block C',
  distance: '0.3 km',
  date: 'Today',
  time: '9:00 AM',
  estimatedEarnings: 550,
  priority: 'normal',
  description: 'Front-load washing machine drum not spinning. Makes a clicking sound. Brand: LG.',
  status: 'in_progress',
  startedAt: '2026-09-18T09:30:00',
  paymentStatus: 'pending',
  jobVerificationStatus: 'pending', // Person 2 will verify
  managerApproved: true,
};

// ------------------------------------------------------------------
// MOCK COMPLETED JOBS
// ------------------------------------------------------------------
export const MOCK_COMPLETED_JOBS: WorkerJobRequest[] = [
  {
    jobId: 'JB-1801',
    serviceType: 'Electrical Repair',
    problemType: 'Ceiling Fan Replacement',
    customer: { name: 'Kiran Bose', phone: '9867890123', address: 'Flat 601, Harmony Heights' },
    location: 'Harmony Heights',
    distance: '2.8 km',
    date: 'Sep 17',
    time: '11:00 AM',
    estimatedEarnings: 380,
    priority: 'normal',
    description: 'Old ceiling fan making noise. Replaced with new fan provided by customer.',
    status: 'completed',
    completedAt: '2026-09-17T13:30:00',
    paymentStatus: 'paid', // Person 3
    jobVerificationStatus: 'verified', // Person 2
    rating: 5,
    ratingComment: 'Excellent work! Very professional.',
  },
  {
    jobId: 'JB-1780',
    serviceType: 'Plumbing',
    problemType: 'Tap Replacement',
    customer: { name: 'Deepak Sharma', phone: '9845671234', address: 'Flat 201, River View' },
    location: 'River View Society',
    distance: '4.1 km',
    date: 'Sep 16',
    time: '3:00 PM',
    estimatedEarnings: 200,
    priority: 'normal',
    description: 'Kitchen tap replaced. Old tap was leaking from the base.',
    status: 'completed',
    completedAt: '2026-09-16T15:45:00',
    paymentStatus: 'paid',
    jobVerificationStatus: 'verified',
    rating: 4,
  },
  {
    jobId: 'JB-1760',
    serviceType: 'Carpentry',
    problemType: 'Wardrobe Repair',
    customer: { name: 'Anita Rao', phone: '9812309876', address: 'Flat 303, Sunrise Apartments' },
    location: 'Sunrise Apartments',
    distance: '2.1 km',
    date: 'Sep 15',
    time: '10:30 AM',
    estimatedEarnings: 450,
    priority: 'normal',
    description: 'Wardrobe sliding door track repaired. Door latch fixed.',
    status: 'completed',
    completedAt: '2026-09-15T12:00:00',
    paymentStatus: 'paid',
    jobVerificationStatus: 'verified',
    rating: 5,
    ratingComment: 'Neatly done. Would recommend.',
  },
];

// ------------------------------------------------------------------
// MOCK CANCELLED JOBS
// ------------------------------------------------------------------
export const MOCK_CANCELLED_JOBS: WorkerJobRequest[] = [
  {
    jobId: 'JB-1700',
    serviceType: 'Cleaning',
    problemType: 'Bathroom Cleaning',
    customer: { name: 'Rohit Verma', phone: '9876001234', address: 'Flat 108, Blue Bell Tower' },
    location: 'Blue Bell Tower',
    distance: '3.2 km',
    date: 'Sep 14',
    time: '8:00 AM',
    estimatedEarnings: 250,
    priority: 'normal',
    description: 'Bathroom deep clean requested.',
    status: 'cancelled',
    cancellationReason: 'Customer cancelled — rescheduled for next week.',
  },
];

// ------------------------------------------------------------------
// WORKER NOTIFICATIONS (mock)
// ------------------------------------------------------------------
export interface WorkerNotification {
  id: string;
  type: 'new_job' | 'job_accepted' | 'job_cancelled' | 'payment' | 'announcement' | 'emergency' | 'support' | 'schedule_change';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedJobId?: string;
}

export const MOCK_WORKER_NOTIFICATIONS: WorkerNotification[] = [
  {
    id: 'WN-001',
    type: 'new_job',
    title: '🔔 New Job Request',
    message: 'Plumbing job at Green Residency (Flat 304) assigned to you. Accept within 2 minutes.',
    timestamp: '2 min ago',
    read: false,
    relatedJobId: 'JR-2001',
  },
  {
    id: 'WN-002',
    type: 'payment',
    title: '💰 Payment Received',
    message: 'Payment of ₹380 received for Electrical Repair job (JB-1801). Transferred to your account.',
    timestamp: 'Yesterday, 4:30 PM',
    read: false,
    relatedJobId: 'JB-1801',
  },
  {
    id: 'WN-003',
    type: 'job_accepted',
    title: '✅ Job Confirmed',
    message: 'Your upcoming Carpentry job at Palm Grove Society on Sep 19 is confirmed.',
    timestamp: 'Yesterday, 11:00 AM',
    read: true,
    relatedJobId: 'JB-1901',
  },
  {
    id: 'WN-004',
    type: 'announcement',
    title: '📢 Cooperative Announcement',
    message: 'Monthly cooperative meeting on Sep 22 at 6:00 PM. Attendance is important for all members.',
    timestamp: 'Sep 17',
    read: true,
  },
  {
    id: 'WN-005',
    type: 'emergency',
    title: '🚨 Emergency Job Near You',
    message: 'Emergency electrical repair request at Sunrise Apartments. Distance: 2.1 km. High priority.',
    timestamp: 'Sep 17, 2:15 PM',
    read: true,
    relatedJobId: 'JR-2002',
  },
  {
    id: 'WN-006',
    type: 'support',
    title: '🤝 Support Response',
    message: 'Your query about tool bank usage has been resolved. See FAQs for more info.',
    timestamp: 'Sep 16',
    read: true,
  },
  {
    id: 'WN-007',
    type: 'schedule_change',
    title: '📅 Schedule Change',
    message: 'Cleaning job (JB-1900) rescheduled from Sep 18 to Sep 20 by customer request.',
    timestamp: 'Sep 16',
    read: true,
  },
];

// ------------------------------------------------------------------
// EARNINGS MOCK DATA (Integration point for Person 3)
// ------------------------------------------------------------------
export interface EarningsData {
  todayEarnings: number;
  todayJobsCount: number;
  weeklyEarnings: number;
  weeklyJobsCount: number;
  monthlyEarnings: number;
  monthlyJobsCount: number;
  pendingAmount: number;
  pendingJobsCount: number;
  totalLifetimeEarnings: number;
  workerSharePercent: number; // cooperative split
  recentPayments: {
    id: string;
    jobId: string;
    serviceType: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending';
  }[];
}

// TODO (Person 3): Replace this mock with real API calls to the payments module
export const MOCK_EARNINGS: EarningsData = {
  todayEarnings: 550,
  todayJobsCount: 1,
  weeklyEarnings: 2450,
  weeklyJobsCount: 6,
  monthlyEarnings: 9800,
  monthlyJobsCount: 23,
  pendingAmount: 550,
  pendingJobsCount: 1,
  totalLifetimeEarnings: 47040,
  workerSharePercent: 70,
  recentPayments: [
    { id: 'PAY-091', jobId: 'JB-1801', serviceType: 'Electrical Repair', amount: 380, date: 'Sep 17', status: 'paid' },
    { id: 'PAY-090', jobId: 'JB-1780', serviceType: 'Plumbing', amount: 200, date: 'Sep 16', status: 'paid' },
    { id: 'PAY-089', jobId: 'JB-1760', serviceType: 'Carpentry', amount: 450, date: 'Sep 15', status: 'paid' },
    { id: 'PAY-088', jobId: 'JB-1740', serviceType: 'Cleaning', amount: 600, date: 'Sep 13', status: 'paid' },
    { id: 'PAY-087', jobId: 'JB-1720', serviceType: 'Appliance Repair', amount: 820, date: 'Sep 11', status: 'paid' },
    { id: 'PAY-CUR', jobId: 'JB-1850', serviceType: 'Appliance Repair', amount: 550, date: 'Today', status: 'pending' },
  ],
};

// ------------------------------------------------------------------
// BREAK OPTIONS
// ------------------------------------------------------------------
export interface BreakOption {
  id: string;
  label: string;
  durationMinutes: number;
  icon: string;
}

export const BREAK_OPTIONS: BreakOption[] = [
  { id: 'short', label: 'Short Break', durationMinutes: 15, icon: '☕' },
  { id: 'lunch', label: 'Lunch Break', durationMinutes: 45, icon: '🍽️' },
  { id: 'custom', label: 'Custom Break', durationMinutes: 0, icon: '⏱️' },
];

// ------------------------------------------------------------------
// DEMAND HEATMAP PLACEHOLDER DATA (Person 5 — Predictive Heatmap)
// ------------------------------------------------------------------
export interface DemandArea {
  area: string;
  demandLevel: 'high' | 'medium' | 'low';
  serviceType: string;
  distance: string;
}

// TODO (Person 5): Replace with real predictive demand heatmap API
export const MOCK_DEMAND_AREAS: DemandArea[] = [
  { area: 'Green Residency', demandLevel: 'high', serviceType: 'Plumbing', distance: '0.8 km' },
  { area: 'Sunrise Apartments', demandLevel: 'medium', serviceType: 'Electrical', distance: '2.1 km' },
  { area: 'Palm Grove Society', demandLevel: 'low', serviceType: 'Carpentry', distance: '3.5 km' },
];
