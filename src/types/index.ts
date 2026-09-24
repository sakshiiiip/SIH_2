export type UserRole =
  | 'customer'
  | 'worker'
  | 'society_manager'
  | 'federation_admin'
  | 'federation_manager'
  | 'platform_admin';

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

export * from './location';

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
  // Geolocation Telemetry
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  locationAddress?: string;
  googleMapsUrl?: string;
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
  | 'MANAGER_VERIFIED'
  | 'VERIFIED'
  | 'FAILED'
  | 'CORRECTION_REQUIRED'
  | 'REJECTED'
  | 'MANAGER_REJECTED'
  | 'FEDERATION_REJECTED';

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

export interface WorkerSkillEntry {
  id: string;
  workerId?: string;
  name: string; // Primary Skill / Trade (e.g. Electrician, Plumber, Carpenter, Painter, Cleaner, etc.)
  experienceYears: number; // 0-50 years
  description: string; // 20-500 characters
  certificateUrl?: string; // Uploaded certificate file
  certificateName?: string;
  serviceArea: string; // Area / City / PIN
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

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

  // Level 1: Personal KYC details
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  aadhaarNumber?: string;
  aadhaarCardUrl?: string;
  address?: string;
  pinCode?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  personalKycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  personalKycNotes?: string;
  personalKycVerifiedBy?: string;
  personalKycVerifiedAt?: string;

  // Level 2: Skill Information Entries
  skillEntries?: WorkerSkillEntry[];

  // Geolocation & Operational Tracking
  latitude?: number;
  longitude?: number;
  locationUpdatedAt?: string;
  locationStatus?: WorkerLocationStatus;
  currentBookingId?: string;
  lastKnownArea?: string;
  // Verification Documents & Audit Trail
  documents?: WorkerDocument[];
  managerVerification?: {
    verifiedBy: string;
    verifiedAt: string;
    status: 'APPROVED' | 'REJECTED';
    notes?: string;
  };
  federationVerification?: {
    approvedBy: string;
    approvedAt: string;
    status: 'APPROVED' | 'REJECTED';
    notes?: string;
  };
  rejectionReason?: string;
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
  | 'PENDING_ASSIGNMENT'
  | 'WORKER_ASSIGNED'
  | 'PENDING_WORKER_ACCEPTANCE'
  | 'CONFIRMED'
  | 'TRAVELLING'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'WORKER_ON_BREAK'
  | 'WORKER_ON_BREAK'
  | 'AWAITING_VERIFICATION'
  | 'WORKER_ON_BREAK'
  | 'WORKER_ON_BREAK'
  | 'COMPLETED'
  | 'PAID'
  | 'RATED'
  | 'REJECTED'
  | 'RE_MATCHING'
  | 'QUALITY_ISSUE'
  | 'REVIEW'
  | 'REVISIT'
  | 'REVISIT_REQUESTED'
  | 'REVISIT_SCHEDULED'
  | 'REASSIGNED'
  | 'CANCELLED';

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
  // Before/After job photo evidence
  beforeImage?: string;
  afterImage?: string;
  // Customer confirms work was done satisfactorily
  customerConfirmation?: boolean;
  customerConfirmedAt?: string;
  // Manager verification record
  managerVerification?: {
    verifiedBy: string;
    status: 'APPROVED' | 'REJECTED' | 'REVISIT_NEEDED';
    notes?: string;
    verifiedAt?: string;
  };
  // Revisit flow details
  revisitDetails?: {
    reason: string;
    scheduledDate?: string;
    status: 'PENDING' | 'SCHEDULED' | 'COMPLETED';
    requestedAt?: string;
  };
  // Cancellation audit
  cancellationDetails?: {
    cancelledBy: string;
    reason: string;
    cancelledAt?: string;
  };
  // Geolocation & Spatial Routing
  customerLatitude?: number;
  customerLongitude?: number;
  customerLocationAccuracy?: number;
  customerLocality?: string;
  customerPostalCode?: string;
  workerLatitude?: number;
  workerLongitude?: number;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  // Compatibility aliases
  category?: string;
  workerId?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
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
  recipientRole: 'customer' | 'worker' | 'society_manager' | 'federation_manager' | 'federation_admin' | 'platform_admin' | 'all';
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
  cooperativeVerificationStatus?: 'VERIFIED' | 'PENDING_AUDIT' | 'SUSPENDED';
  verifiedAt?: string;
  verifiedBy?: string;
  registrationDocUrl?: string;
}

export type FederationApplicationStatus =
  | 'PENDING_VERIFICATION'
  | 'CHANGES_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type FederationAuthorizedDesignation =
  | 'Federation Manager'
  | 'President'
  | 'Secretary'
  | 'CEO / Chief Executive'
  | 'Chief Operating Officer'
  | 'Director'
  | 'Other';

export interface FederationDocumentItem {
  id: string;
  documentType: 'registration_certificate' | 'authorization_letter' | 'bye_laws' | 'address_proof' | 'other';
  title: string;
  fileName: string;
  fileUrl?: string;
  fileSize?: string;
  uploadedAt: string;
  status?: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'NEEDS_CORRECTION' | 'REJECTED';
}

export interface DeclaredSocietyItem {
  id: string;
  name: string;
  code?: string;
  district?: string;
  pincode?: string;
  totalHouseholds?: number;
  isVerifiedByManager?: boolean;
}

export interface FederationApplication {
  id: string;
  federationId?: string;
  // A. Federation Basic Details
  federationName: string;
  federationType: string;
  registrationNumber: string;
  registrationDate: string;
  state: string;
  district: string;
  fullAddress: string;
  officialEmail: string;
  officialPhone: string;
  website?: string;
  // B. Authorized Person Details
  authorizedPersonName: string;
  authorizedPersonDesignation: FederationAuthorizedDesignation;
  authorizedPersonEmail: string;
  authorizedPersonPhone: string;
  authorizedPersonIdType: string;
  authorizedPersonIdNumber?: string;
  // C. Federation Documents
  documents: FederationDocumentItem[];
  // D. Federation Structure
  societiesCount: number;
  declaredSocieties: DeclaredSocietyItem[];
  // E. Services / Areas
  selectedServices: string[];
  // Status & Timestamps
  status: FederationApplicationStatus;
  operatingStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  changeRequestReason?: string;
  adminNotes?: string;
  applicantUserId?: string;
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
  applicationId?: string;
  verificationStatus?: FederationApplicationStatus;
  operatingStatus?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  federationType?: string;
  registrationNumber?: string;
  state?: string;
  district?: string;
  fullAddress?: string;
  officialEmail?: string;
  officialPhone?: string;
  website?: string;
  authorizedPersonName?: string;
  authorizedPersonDesignation?: FederationAuthorizedDesignation;
  authorizedPersonEmail?: string;
  authorizedPersonPhone?: string;
  selectedServices?: string[];
  documents?: FederationDocumentItem[];
  declaredSocieties?: DeclaredSocietyItem[];
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface PlatformSystemMetrics {
  totalUsers: number;
  totalWorkers: number;
  totalSocieties: number;
  totalFederations: number;
  pendingFederationApplications: number;
  approvedFederations: number;
  allTimeGMV: number;
  platformUptimePercent: number;
  activeSessions: number;
}

export type ManagerActionType =
  | 'ADD_WORKER'
  | 'UPDATE_WORKER_PROFILE'
  | 'SUBMIT_WORKER_KYC'
  | 'VERIFY_WORKER_KYC'
  | 'VERIFY_PERSONAL_KYC'
  | 'REJECT_WORKER'
  | 'ADD_WORKER_SKILL'
  | 'VERIFY_WORKER_SKILL'
  | 'UPDATE_WORKER_DOCS'
  | 'ASSIGN_WORKER_JOB'
  | 'CHANGE_WORKER_STATUS'
  | 'DEACTIVATE_WORKER'
  | 'MANAGER_ENDORSE'
  | 'FEDERATION_APPROVE'
  | 'FEDERATION_REJECT'
  | 'SOCIETY_AUDIT'
  | 'FEDERATION_APPLY'
  | 'FEDERATION_APP_UPDATE'
  | 'FEDERATION_APP_RESUBMIT'
  | 'FEDERATION_CHANGES_REQUESTED'
  | 'FEDERATION_APPROVED'
  | 'FEDERATION_APPLICATION_REJECTED'
  | 'WEIGHTS_CONFIG'
  | 'REVENUE_SPLIT_CONFIG'
  | 'FUND_ALLOCATION'
  | 'OTHER';

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  actionType?: ManagerActionType;
  workerId?: string;
  workerName?: string;
  societyId?: string;
  societyName?: string;
  federationId?: string;
  federationName?: string;
  managerId?: string;
  managerName?: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  notes?: string;
  skillName?: string;
  bookingId?: string;
  applicationId?: string;
}


