export type UserRole =
  | 'customer'
  | 'worker'
  | 'society_manager'
  | 'federation_admin'
  | 'federation_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address: string;
  societyId?: string;
  societyName: string;
  federationId?: string;
  federationName?: string;
  designation?: string;
  tradeProfession?: string; // For worker profession communities
}

export interface CommunityMessage {
  id: string;
  channelId: string;
  authorName: string;
  senderName?: string;
  authorRole: 'customer' | 'worker' | 'society_manager' | 'federation_manager';
  senderRole?: 'customer' | 'worker' | 'society_manager' | 'federation_manager';
  authorAvatar?: string;
  authorProfession?: string;
  senderTrade?: string;
  content: string;
  text?: string;
  timestamp: string;
  isOfficial?: boolean;
}

export interface CommunityChannel {
  id: string;
  name: string;
  scope: 'society' | 'profession';
  targetRoles?: Array<'customer' | 'worker' | 'society_manager' | 'federation_manager' | 'all'>;
  professionCategory?: string;
  memberCount: number;
  description: string;
  lastActive: string;
}

export interface ActiveJobSOSTicket {
  id: string;
  bookingId: string;
  jobId?: string;
  societyId?: string;
  reportedBy: 'customer' | 'worker';
  reporterRole?: 'customer' | 'worker';
  reporterName: string;
  reporterPhone?: string;
  reason: string;
  details?: string;
  reportedAt: string;
  createdAt?: string;
  status: 'active_emergency' | 'investigating' | 'resolved' | 'OPEN' | 'RESPONDING';
  assignedManager?: string;
  resolutionNotes?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'emergency' | 'info';
  duration?: number;
}

export type WorkerVerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'FAILED'
  | 'CORRECTION_REQUIRED';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED';

export type DocumentType =
  | 'identity'
  | 'address'
  | 'skill'
  | 'membership'
  | 'background';

export interface WorkerDocument {
  id: string;
  workerId: string;
  documentType: DocumentType;
  title: string;
  fileUrl?: string;
  uploadedAt: string;
  status: DocumentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export type WorkerLocationStatus = 'AVAILABLE' | 'ON_JOB' | 'TRAVELLING' | 'OFFLINE';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  profession?: string;
  societyId?: string;
  societyName?: string;
  managerId?: string;
  managerName?: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  hourlyRate: number;
  distanceKm: number;
  availability: 'online' | 'busy' | 'offline';
  currentWorkload: number; // 0 to 100 (percentage)
  proficiencyScore: number; // 0 to 100
  skills: string[];
  certificates: string[];
  verificationStatus: WorkerVerificationStatus;
  kycDocumentsCount: number; // e.g. 4/4
  localVerificationStatus: 'verified' | 'pending';
  cooperativeMemberId: string;
  joinedDate: string;
  bio?: string;
  // Geolocation & Operational Tracking
  latitude?: number;
  longitude?: number;
  locationUpdatedAt?: string;
  locationStatus?: WorkerLocationStatus;
  currentBookingId?: string;
  lastKnownArea?: string;
  // Verification Documents
  documents?: WorkerDocument[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  basePrice: number;
  problems: string[];
}

export type UrgencyTier = 'STANDARD' | 'URGENT' | 'EMERGENCY';

export type BookingState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MATCHING'
  | 'MATCHED'
  | 'PENDING_WORKER_ACCEPTANCE'
  | 'CONFIRMED'
  | 'TRAVELLING'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'WORKER_ON_BREAK'
  | 'COMPLETED'
  | 'PAID'
  | 'RATED'
  | 'REJECTED'
  | 'RE_MATCHING'
  | 'QUALITY_ISSUE'
  | 'REVIEW'
  | 'REVISIT'
  | 'REASSIGNED';

export interface CandidateScore {
  worker: Worker;
  matchScore: number; // 0 - 100
  skillCompatibility: number; // 0 - 100
  proficiency: number; // 0 - 100
  distanceScore: number; // 0 - 100
  availabilityScore: number; // 0 - 100
  workloadBalance: number; // 0 - 100
}

export interface PaymentBreakdown {
  total: number;
  workerShare: number;
  societyShare: number;
  cooperativeFund: number;
}

export interface QualityIssue {
  id: string;
  type: 'incomplete_work' | 'poor_quality' | 'worker_issue' | 'damage' | 'other';
  description: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'revisit_assigned' | 'resolved';
  reassignedWorkerId?: string;
  reassignedWorkerName?: string;
  revisitCompletedAt?: string;
  adminResolutionNotes?: string;
}

export interface BookingRating {
  stars: number;
  comment: string;
  ratedAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  societyId?: string;
  societyName: string;
  serviceCategory: string;
  problemType: string;
  details: string;
  photos: string[];
  urgencyTier: UrgencyTier;
  state: BookingState;
  createdAt: string;
  updatedAt: string;
  otp: string; // 4-digit verification code
  pricing: PaymentBreakdown;
  matchedWorkerId?: string;
  matchedWorker?: Worker;
  candidateScores?: CandidateScore[];
  rejectedWorkerIds?: string[];
  qualityIssue?: QualityIssue;
  rating?: BookingRating;
  notes?: string;
  workPhotos?: string[];
  startedAt?: string;
  completedAt?: string;
  /** Populated when booking state is WORKER_ON_BREAK */
  breakDetails?: {
    startedAt: string;
    estimatedDurationMins: number;
    reason?: string;
  };
}

export type ServiceRequest = Booking;

export interface CommunityBooking {
  id: string;
  societyName: string;
  serviceCategory: string;
  description: string;
  participantCount: number;
  targetDiscountPercent: number;
  scheduledDate: string;
  status: 'open' | 'confirmed' | 'in_progress' | 'completed';
  participants: Array<{
    id: string;
    customerName: string;
    flatNumber: string;
    joinedAt: string;
  }>;
}

export interface FundTransaction {
  id: string;
  date: string;
  type: 'credit' | 'debit';
  category: 'booking_share' | 'emergency_aid' | 'tool_purchase' | 'dividend' | 'training';
  amount: number;
  description: string;
  relatedBookingId?: string;
}

export interface CooperativeFund {
  balance: number;
  monthlyContributions: number;
  workerSupportAllocated: number;
  toolBankAllocated: number;
  emergencyAidAllocated: number;
  trainingAllocated: number;
  transactions: FundTransaction[];
}

export interface ToolBankItem {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  condition: 'excellent' | 'good' | 'maintenance_required';
  status: 'available' | 'borrowed' | 'maintenance';
  borrowedByWorkerId?: string;
  borrowedByWorkerName?: string;
  borrowedDate?: string;
  returnDate?: string;
}

export interface WorkerEmergencyAidRequest {
  id: string;
  workerId: string;
  workerName: string;
  reason: string;
  requestedAmount: number;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: 'customer' | 'worker' | 'society_manager' | 'federation_manager' | 'all';
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  read: boolean;
  relatedBookingId?: string;
}

export interface PlatformConfig {
  workerSharePercent: number; // e.g. 70
  societySharePercent: number; // e.g. 5
  cooperativeFundPercent: number; // e.g. 25
  matchingWeights: {
    skillCompatibility: number;
    proficiency: number;
    distance: number;
    availability: number;
    workloadBalance: number;
  };
}

export interface SocietyManagerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  societyId: string;
  societyName: string;
  workersCount: number;
}

export interface SocietyData {
  id: string;
  name: string;
  code: string;
  address: string;
  totalHouseholds: number;
  activeWorkersCount: number;
  activeBookingsCount: number;
  monthlyRevenue: number;
  satisfactionRate: number;
  societyFundBalance: number;
  coordinatorName: string;
  coordinatorPhone: string;
  managerId?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  managerAvatar?: string;
  federationId?: string;
  federationName?: string;
}

export interface FederationData {
  id: string;
  name: string;
  region: string;
  totalSocieties: number;
  totalWorkers: number;
  monthlyGMV: number;
  federationReliefFund: number;
  crossSocietyRequests: number;
  leadCoordinator: string;
  adminId?: string;
  adminName?: string;
  adminPhone?: string;
  adminEmail?: string;
  adminAvatar?: string;
}

export interface PlatformSystemMetrics {
  totalUsers: number;
  totalWorkers: number;
  totalSocieties: number;
  totalFederations: number;
  allTimeGMV: number;
  platformUptimePercent: number;
  activeSessions: number;
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
}
