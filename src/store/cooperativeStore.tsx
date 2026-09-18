import { useState, useEffect, createContext, useContext } from 'react';
import {
  User,
  UserRole,
  Worker,
  Booking,
  BookingState,
  CommunityBooking,
  CooperativeFund,
  ToolBankItem,
  WorkerEmergencyAidRequest,
  NotificationItem,
  PlatformConfig,
  WorkerVerificationStatus,
  DocumentStatus,
  WorkerLocationStatus,
  UrgencyTier,
  ToastMessage,
  SocietyData,
  SocietyManagerInfo,
  FederationData,
  PlatformSystemMetrics,
  PlatformAuditLog,
  CommunityChannel,
  CommunityMessage,
  ActiveJobSOSTicket,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_CONFIG,
  INITIAL_SERVICES,
  INITIAL_WORKERS,
  INITIAL_BOOKINGS,
  INITIAL_COMMUNITY_BOOKINGS,
  INITIAL_COOPERATIVE_FUND,
  INITIAL_TOOL_BANK,
  INITIAL_EMERGENCY_AID_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SOCIETIES,
  INITIAL_SOCIETY_MANAGERS,
  INITIAL_FEDERATIONS,
  INITIAL_PLATFORM_METRICS,
  INITIAL_AUDIT_LOGS,
  INITIAL_COMMUNITY_CHANNELS,
  INITIAL_COMMUNITY_MESSAGES,
} from './initialData';
import { calculateCandidateScores } from '../utils/matchingEngine';

const STORAGE_KEY = 'cooperative_platform_state_v4';

interface CooperativeStoreContextType {
  // Session & Authentication
  isAuthenticated: boolean;
  currentRole: UserRole;
  currentUser: User;
  login: (role: UserRole, userOverride?: User) => void;
  logout: () => void;
  setRole: (role: UserRole, userOverride?: User) => void;
  setCurrentUser: (user: User) => void;
  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  // Platform configuration
  config: PlatformConfig;
  updateConfig: (newConfig: Partial<PlatformConfig>) => void;
  updatePlatformConfig: (newConfig: PlatformConfig) => void;
  updatePlatformWeights: (weights: PlatformConfig['matchingWeights']) => void;
  updateRevenueSplit: (worker: number, society: number, fund: number) => void;
  // Multi-society & Federation
  societies: SocietyData[];
  societyManagers: SocietyManagerInfo[];
  federations: FederationData[];
  platformMetrics: PlatformSystemMetrics;
  auditLogs: PlatformAuditLog[];
  allocateFederationGrant: (federationId: string, societyId: string, amount: number, purpose: string) => void;
  addAuditLog: (action: string, details: string) => void;
  // Workers & Verification
  workers: Worker[];
  updateWorkerVerification: (workerId: string, status: WorkerVerificationStatus) => void;
  reviewWorkerDocument: (workerId: string, documentId: string, status: DocumentStatus, notes?: string) => void;
  updateWorkerLocation: (workerId: string, lat: number, lng: number, status?: WorkerLocationStatus) => void;
  toggleWorkerAvailability: (workerId: string) => void;
  // Bookings
  bookings: Booking[];
  createBooking: (data: {
    serviceCategory: string;
    problemType: string;
    details: string;
    photos?: string[];
    urgencyTier: UrgencyTier;
    societyName?: string;
    customAddress?: string;
  }) => Booking;
  acceptBookingByWorker: (bookingId: string, workerId: string) => void;
  rejectBookingByWorker: (bookingId: string, workerId: string) => void;
  updateBookingState: (bookingId: string, newState: BookingState) => void;
  verifyBookingOTP: (bookingId: string, enteredOtp: string) => boolean;
  verifyOTPAndStartJob: (bookingId: string, enteredOtp: string) => boolean;
  completeBooking: (bookingId: string, notes?: string, photos?: string[]) => void;
  payBooking: (bookingId: string) => void;
  rateBooking: (bookingId: string, stars: number, comment: string) => void;
  reportQualityIssue: (
    bookingId: string,
    type: 'incomplete_work' | 'poor_quality' | 'worker_issue' | 'damage' | 'other',
    description: string
  ) => void;
  adminReviewQualityIssue: (bookingId: string, notes?: string) => void;
  adminReassignQualityIssue: (bookingId: string, newWorkerId: string) => void;
  completeRevisit: (bookingId: string) => void;
  adminManualAssignWorker: (bookingId: string, workerId: string) => void;
  // Community & Role-Aware Discussions
  communityBookings: CommunityBooking[];
  joinCommunityBooking: (communityBookingId: string, customerName: string, flatNumber: string) => void;
  createCommunityBooking: (data: {
    societyName: string;
    serviceCategory: string;
    description: string;
    scheduledDate: string;
  }) => void;
  communityChannels: CommunityChannel[];
  communityMessages: CommunityMessage[];
  postCommunityMessage: (
    channelId: string,
    arg2?: string,
    arg3?: any,
    arg4?: string,
    arg5?: string
  ) => void;
  // Context-Aware Emergency SOS
  sosTickets: ActiveJobSOSTicket[];
  triggerActiveJobSOS: (
    bookingId: string,
    reportedBy: 'customer' | 'worker',
    reason: string,
    details?: string
  ) => ActiveJobSOSTicket;
  resolveSOSTicket: (ticketId: string, notes?: string) => void;
  // Cooperative Fund
  cooperativeFund: CooperativeFund;
  requestEmergencyAid: (workerId: string, workerName: string, reason: string, amount: number) => void;
  emergencyAidRequests: WorkerEmergencyAidRequest[];
  approveEmergencyAidRequest: (requestId: string) => void;
  rejectEmergencyAidRequest: (requestId: string) => void;
  // Tool Bank
  toolBank: ToolBankItem[];
  borrowTool: (toolId: string, workerId: string, workerName: string, returnDays?: number) => void;
  returnTool: (toolId: string) => void;
  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (
    notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ) => void;
  // System Reset
  resetToDemoData: () => void;
  // Dynamic Hierarchy Getters
  getWorkersBySociety: (societyName: string) => Worker[];
  getSocietyWorkersCount: (societyName: string) => number;
  getSocietyActiveBookingsCount: (societyName: string) => number;
  getSocietyManagersCount: () => number;
  getFederationWorkersCount: () => number;
  getFederationActiveJobsCount: () => number;
}

const CooperativeStoreContext = createContext<CooperativeStoreContextType | null>(null);

export function CooperativeStoreProvider({ children }: { children: React.ReactNode }) {
  // Authentication & Role Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_auth');
    return saved === 'true';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_role');
    return (saved as UserRole) || 'customer';
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    const duration = toast.duration || 4000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [config, setConfig] = useState<PlatformConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });
  const [communityBookings, setCommunityBookings] = useState<CommunityBooking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_community');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_BOOKINGS;
  });
  const [communityChannels, setCommunityChannels] = useState<CommunityChannel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_channels');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_CHANNELS;
  });
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_messages');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_MESSAGES;
  });
  const [sosTickets, setSosTickets] = useState<ActiveJobSOSTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sos');
    return saved ? JSON.parse(saved) : [];
  });
  const [cooperativeFund, setCooperativeFund] = useState<CooperativeFund>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_fund');
    return saved ? JSON.parse(saved) : INITIAL_COOPERATIVE_FUND;
  });
  const [emergencyAidRequests, setEmergencyAidRequests] = useState<WorkerEmergencyAidRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_aid');
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_AID_REQUESTS;
  });
  const [toolBank, setToolBank] = useState<ToolBankItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_tools');
    return saved ? JSON.parse(saved) : INITIAL_TOOL_BANK;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [societies, setSocieties] = useState<SocietyData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_societies');
    return saved ? JSON.parse(saved) : INITIAL_SOCIETIES;
  });
  const [societyManagers, setSocietyManagers] = useState<SocietyManagerInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_society_managers');
    return saved ? JSON.parse(saved) : INITIAL_SOCIETY_MANAGERS;
  });
  const [federations, setFederations] = useState<FederationData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_federations');
    return saved ? JSON.parse(saved) : INITIAL_FEDERATIONS;
  });
  const [platformMetrics, setPlatformMetrics] = useState<PlatformSystemMetrics>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_metrics');
    return saved ? JSON.parse(saved) : INITIAL_PLATFORM_METRICS;
  });
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Current user based on session and role
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY + '_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {}
    }
    const savedRole = (localStorage.getItem(STORAGE_KEY + '_role') as UserRole) || 'customer';
    return DEMO_USERS[savedRole] || DEMO_USERS.customer;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_auth', isAuthenticated ? 'true' : 'false');
      localStorage.setItem(STORAGE_KEY + '_role', currentRole);
      localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEY + '_config', JSON.stringify(config));
      localStorage.setItem(STORAGE_KEY + '_workers', JSON.stringify(workers));
      localStorage.setItem(STORAGE_KEY + '_bookings', JSON.stringify(bookings));
      localStorage.setItem(STORAGE_KEY + '_community', JSON.stringify(communityBookings));
      localStorage.setItem(STORAGE_KEY + '_channels', JSON.stringify(communityChannels));
      localStorage.setItem(STORAGE_KEY + '_messages', JSON.stringify(communityMessages));
      localStorage.setItem(STORAGE_KEY + '_sos', JSON.stringify(sosTickets));
      localStorage.setItem(STORAGE_KEY + '_fund', JSON.stringify(cooperativeFund));
      localStorage.setItem(STORAGE_KEY + '_aid', JSON.stringify(emergencyAidRequests));
      localStorage.setItem(STORAGE_KEY + '_tools', JSON.stringify(toolBank));
      localStorage.setItem(STORAGE_KEY + '_notifs', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEY + '_societies', JSON.stringify(societies));
      localStorage.setItem(STORAGE_KEY + '_society_managers', JSON.stringify(societyManagers));
      localStorage.setItem(STORAGE_KEY + '_federations', JSON.stringify(federations));
      localStorage.setItem(STORAGE_KEY + '_metrics', JSON.stringify(platformMetrics));
      localStorage.setItem(STORAGE_KEY + '_audit', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [isAuthenticated, currentRole, currentUser, config, workers, bookings, communityBookings, communityChannels, communityMessages, sosTickets, cooperativeFund, emergencyAidRequests, toolBank, notifications, societies, societyManagers, federations, platformMetrics, auditLogs]);

  // Login handler with optional specific account override
  const login = (role: UserRole, userOverride?: User) => {
    const user = userOverride || DEMO_USERS[role] || DEMO_USERS.customer;
    setCurrentRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY + '_auth', 'true');
    localStorage.setItem(STORAGE_KEY + '_role', role);
    localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(user));
    showToast({
      title: `Signed in as ${user.name}`,
      message: `Accessing ${user.role === 'worker' ? `${user.tradeProfession || 'Worker'} Hub` : user.role === 'society_manager' ? `Manager Desk (${user.societyName})` : `${user.role.replace('_', ' ')} Workspace`}.`,
      type: 'success',
    });
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEY + '_auth', 'false');
    showToast({
      title: 'Signed Out',
      message: 'Session cleared. Choose your role to continue.',
      type: 'info',
    });
  };

  const setRole = (role: UserRole, userOverride?: User) => {
    const user = userOverride || DEMO_USERS[role] || DEMO_USERS.customer;
    setCurrentRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY + '_role', role);
    localStorage.setItem(STORAGE_KEY + '_auth', 'true');
    localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(user));
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog: PlatformAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${currentUser.name} (${currentRole})`,
      role: currentRole,
      action,
      details,
      ipAddress: '127.0.0.1',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updatePlatformWeights = (weights: PlatformConfig['matchingWeights']) => {
    setConfig((prev) => ({ ...prev, matchingWeights: weights }));
    addAuditLog('WEIGHTS_CONFIG', 'Updated fair matching engine component weights');
    showToast({
      title: 'Algorithm Weights Updated',
      message: 'Fair matching weights applied across all societies.',
      type: 'success',
    });
  };

  const updateRevenueSplit = (worker: number, society: number, fund: number) => {
    setConfig((prev) => ({
      ...prev,
      workerSharePercent: worker,
      societySharePercent: society,
      cooperativeFundPercent: fund,
    }));
    addAuditLog('REVENUE_SPLIT_CONFIG', `Configured: ${worker}% Worker, ${society}% Society, ${fund}% Fund`);
    showToast({
      title: 'Revenue Distribution Updated',
      message: `Worker: ${worker}%, Society: ${society}%, Fund: ${fund}%`,
      type: 'success',
    });
  };

  const allocateFederationGrant = (
    federationId: string,
    societyId: string,
    amount: number,
    purpose: string
  ) => {
    setFederations((prev) =>
      prev.map((f) =>
        f.id === federationId
          ? { ...f, federationReliefFund: f.federationReliefFund - amount }
          : f
      )
    );
    setSocieties((prev) =>
      prev.map((s) =>
        s.id === societyId
          ? { ...s, societyFundBalance: s.societyFundBalance + amount }
          : s
      )
    );
    addAuditLog('FEDERATION_GRANT', `Allocated ₹${amount} grant to Society ${societyId} for ${purpose}`);
    showToast({
      title: 'Federation Grant Disbursed',
      message: `₹${amount} transferred to local society reserve.`,
      type: 'success',
    });
  };

  // Notification helper
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const updateConfig = (newConfig: Partial<PlatformConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updateWorkerVerification = (workerId: string, status: WorkerVerificationStatus) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              verificationStatus: status,
              localVerificationStatus: status === 'VERIFIED' ? 'verified' : w.localVerificationStatus,
            }
          : w
      )
    );
    addNotification({
      recipientRole: 'worker',
      title: `Verification Status: ${status}`,
      message: `Your cooperative worker status has been updated to ${status}.`,
      type: status === 'VERIFIED' ? 'success' : 'warning',
    });
  };

  const reviewWorkerDocument = (
    workerId: string,
    documentId: string,
    status: DocumentStatus,
    notes?: string
  ) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        const currentDocs = w.documents || [];
        const updatedDocs = currentDocs.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status,
                reviewedBy: currentUser.name,
                reviewedAt: new Date().toISOString().split('T')[0],
                reviewNotes: notes || doc.reviewNotes,
              }
            : doc
        );

        const approvedCount = updatedDocs.filter((d) => d.status === 'APPROVED').length;
        const totalCount = updatedDocs.length;
        const allApproved = totalCount > 0 && approvedCount === totalCount;
        const hasRejection = updatedDocs.some((d) => d.status === 'REJECTED');
        const hasCorrection = updatedDocs.some((d) => d.status === 'CORRECTION_REQUIRED');

        const nextStatus: WorkerVerificationStatus = allApproved
          ? 'VERIFIED'
          : hasRejection
          ? 'FAILED'
          : hasCorrection
          ? 'CORRECTION_REQUIRED'
          : 'UNDER_REVIEW';

        return {
          ...w,
          documents: updatedDocs,
          verificationStatus: nextStatus,
          localVerificationStatus: allApproved ? 'verified' : 'pending',
          kycDocumentsCount: approvedCount,
        };
      })
    );

    addNotification({
      recipientRole: 'worker',
      title: `Document ${status === 'APPROVED' ? 'Approved ✓' : status === 'REJECTED' ? 'Rejected' : 'Needs Correction'}`,
      message: `A verification document has been reviewed by your Society Manager.`,
      type: status === 'APPROVED' ? 'success' : 'warning',
    });

    addAuditLog('DOC_REVIEW', `Reviewed worker ${workerId} document ${documentId}: ${status}`);
  };

  const updateWorkerLocation = (
    workerId: string,
    lat: number,
    lng: number,
    status?: WorkerLocationStatus
  ) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              latitude: lat,
              longitude: lng,
              locationUpdatedAt: 'Just now',
              locationStatus: status || w.locationStatus || 'AVAILABLE',
            }
          : w
      )
    );
  };

  const toggleWorkerAvailability = (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const next = w.availability === 'online' ? 'offline' : 'online';
          return {
            ...w,
            availability: next,
            locationStatus: next === 'online' ? 'AVAILABLE' : 'OFFLINE',
          };
        }
        return w;
      })
    );
  };

  // CREATE BOOKING
  const createBooking = (data: {
    serviceCategory: string;
    problemType: string;
    details: string;
    photos?: string[];
    urgencyTier: UrgencyTier;
    societyName?: string;
    customAddress?: string;
  }) => {
    const service = INITIAL_SERVICES.find(
      (s) => s.name.toLowerCase() === data.serviceCategory.toLowerCase()
    );
    const baseAmount = service ? service.basePrice : 500;
    const urgencyMultiplier =
      data.urgencyTier === 'EMERGENCY' ? 1.5 : data.urgencyTier === 'URGENT' ? 1.25 : 1.0;
    const totalAmount = Math.round(baseAmount * urgencyMultiplier);

    const workerShare = Math.round((totalAmount * config.workerSharePercent) / 100);
    const societyShare = Math.round((totalAmount * config.societySharePercent) / 100);
    const cooperativeFundShare = totalAmount - workerShare - societyShare;

    // Run AI / Fair Matching Engine
    const candidates = calculateCandidateScores(
      data.serviceCategory,
      workers,
      config.matchingWeights,
      []
    );

    const matchedCandidate = candidates[0];
    const matchedWorker = matchedCandidate ? matchedCandidate.worker : undefined;

    // 4-digit OTP for secure customer-worker arrival verification
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      id: `BKG-${Math.floor(2000 + Math.random() * 8000)}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      customerAddress: data.customAddress || currentUser.address,
      societyName: data.societyName || currentUser.societyName,
      serviceCategory: data.serviceCategory,
      problemType: data.problemType,
      details: data.details,
      photos: data.photos || [],
      urgencyTier: data.urgencyTier,
      state: 'PENDING_WORKER_ACCEPTANCE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      otp: randomOtp,
      pricing: {
        total: totalAmount,
        workerShare,
        societyShare,
        cooperativeFund: cooperativeFundShare,
      },
      candidateScores: candidates,
      matchedWorkerId: matchedWorker?.id,
      matchedWorker,
      rejectedWorkerIds: [],
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Notifications
    addNotification({
      recipientRole: 'customer',
      title: data.urgencyTier === 'EMERGENCY' ? '🚨 Emergency Request Queued' : 'Request Submitted',
      message: matchedWorker
        ? `Matched with ${matchedWorker.name} (${matchedWorker.distanceKm} km away). Awaiting confirmation.`
        : 'Finding the right verified worker for your request...',
      type: data.urgencyTier === 'EMERGENCY' ? 'emergency' : 'info',
      relatedBookingId: newBooking.id,
    });

    if (matchedWorker) {
      addNotification({
        recipientRole: 'worker',
        title: data.urgencyTier === 'EMERGENCY' ? '🚨 Urgent Job Request' : 'New Job Match Available',
        message: `${data.serviceCategory} at ${newBooking.societyName}. Payout: ₹${workerShare}.`,
        type: data.urgencyTier === 'EMERGENCY' ? 'emergency' : 'info',
        relatedBookingId: newBooking.id,
      });
    }

    return newBooking;
  };

  // ACCEPT BOOKING
  const acceptBookingByWorker = (bookingId: string, workerId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const worker = workers.find((w) => w.id === workerId) || b.matchedWorker;
          return {
            ...b,
            state: 'CONFIRMED',
            matchedWorkerId: workerId,
            matchedWorker: worker,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addNotification({
      recipientRole: 'customer',
      title: 'Worker Confirmed!',
      message: `Your booking has been accepted by verified cooperative worker.`,
      type: 'success',
      relatedBookingId: bookingId,
    });
  };

  // REJECT BOOKING & AUTOMATIC REMATCH
  const rejectBookingByWorker = (bookingId: string, workerId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const updatedRejected = [...(b.rejectedWorkerIds || []), workerId];
          const freshCandidates = calculateCandidateScores(
            b.serviceCategory,
            workers,
            config.matchingWeights,
            updatedRejected
          );
          const nextCandidate = freshCandidates[0];
          const nextWorker = nextCandidate ? nextCandidate.worker : undefined;

          setTimeout(() => {
            addNotification({
              recipientRole: 'customer',
              title: 'Re-matching with Verified Worker',
              message: nextWorker
                ? `Worker was unavailable. Auto-matched with ${nextWorker.name} (${nextWorker.distanceKm} km away).`
                : 'Searching for next available verified cooperative specialist...',
              type: 'warning',
              relatedBookingId: bookingId,
            });
            if (nextWorker) {
              addNotification({
                recipientRole: 'worker',
                title: 'New Service Request Available',
                message: `${b.serviceCategory} request at ${b.societyName}.`,
                type: 'info',
                relatedBookingId: bookingId,
              });
            }
          }, 300);

          return {
            ...b,
            rejectedWorkerIds: updatedRejected,
            candidateScores: freshCandidates,
            matchedWorkerId: nextWorker?.id,
            matchedWorker: nextWorker,
            state: nextWorker ? 'PENDING_WORKER_ACCEPTANCE' : 'RE_MATCHING',
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );
  };

  // UPDATE STATE
  const updateBookingState = (bookingId: string, newState: BookingState) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            state: newState,
            updatedAt: new Date().toISOString(),
            startedAt: newState === 'IN_PROGRESS' && !b.startedAt ? new Date().toISOString() : b.startedAt,
            completedAt: newState === 'COMPLETED' ? new Date().toISOString() : b.completedAt,
          };
        }
        return b;
      })
    );

    if (newState === 'TRAVELLING') {
      addNotification({
        recipientRole: 'customer',
        title: 'Worker Travelling',
        message: 'Your cooperative worker has started travelling to your location.',
        type: 'info',
        relatedBookingId: bookingId,
      });
    } else if (newState === 'ARRIVED') {
      addNotification({
        recipientRole: 'customer',
        title: 'Worker Arrived At Your Society',
        message: 'Share your 4-digit verification OTP with the worker to begin.',
        type: 'success',
        relatedBookingId: bookingId,
      });
    }
  };

  // OTP VERIFICATION
  const verifyBookingOTP = (bookingId: string, enteredOtp: string): boolean => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    if (booking.otp === enteredOtp.trim()) {
      updateBookingState(bookingId, 'IN_PROGRESS');
      addNotification({
        recipientRole: 'customer',
        title: 'Job Started',
        message: 'OTP verified successfully. Work is now in progress.',
        type: 'success',
        relatedBookingId: bookingId,
      });
      return true;
    }
    return false;
  };

  // COMPLETE BOOKING
  const completeBooking = (bookingId: string, notes?: string, photos?: string[]) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            state: 'COMPLETED',
            notes: notes || b.notes,
            workPhotos: photos || b.workPhotos,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addNotification({
      recipientRole: 'customer',
      title: 'Job Completed!',
      message: 'Service has been marked complete. Please review and approve payment.',
      type: 'success',
      relatedBookingId: bookingId,
    });
  };

  // PAY BOOKING
  const payBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, state: 'PAID', updatedAt: new Date().toISOString() } : b))
    );

    const fundShare = booking.pricing.cooperativeFund;
    setCooperativeFund((prev) => ({
      ...prev,
      balance: prev.balance + fundShare,
      transactions: [
        {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split('T')[0],
          type: 'credit',
          category: 'booking_share',
          amount: fundShare,
          description: `Cooperative fund contribution from Booking ${booking.id} (${booking.serviceCategory})`,
          relatedBookingId: booking.id,
        },
        ...prev.transactions,
      ],
    }));

    addNotification({
      recipientRole: 'worker',
      title: 'Payment Received',
      message: `₹${booking.pricing.workerShare} credited to your worker cooperative account.`,
      type: 'success',
      relatedBookingId: bookingId,
    });

    addNotification({
      recipientRole: 'customer',
      title: 'Payment Successful',
      message: `₹${booking.pricing.total} settled. Worker ₹${booking.pricing.workerShare}, Society ₹${booking.pricing.societyShare}, Cooperative Fund ₹${booking.pricing.cooperativeFund}.`,
      type: 'success',
      relatedBookingId: bookingId,
    });
  };

  // RATE BOOKING
  const rateBooking = (bookingId: string, stars: number, comment: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            state: 'RATED',
            rating: {
              stars,
              comment,
              ratedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addNotification({
      recipientRole: 'worker',
      title: 'New Rating Received',
      message: `Customer rated your service ${stars} ★: "${comment}"`,
      type: 'info',
      relatedBookingId: bookingId,
    });
  };

  // REPORT QUALITY ISSUE
  const reportQualityIssue = (
    bookingId: string,
    type: 'incomplete_work' | 'poor_quality' | 'worker_issue' | 'damage' | 'other',
    description: string
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            state: 'QUALITY_ISSUE',
            qualityIssue: {
              id: `QI-${Math.floor(1000 + Math.random() * 9000)}`,
              type,
              description,
              reportedAt: new Date().toISOString(),
              status: 'pending',
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addNotification({
      recipientRole: 'society_manager',
      title: '⚠️ Quality Dispute Flagged',
      message: `Booking ${bookingId}: ${type.replace('_', ' ').toUpperCase()} reported by customer.`,
      type: 'warning',
      relatedBookingId: bookingId,
    });

    addNotification({
      recipientRole: 'customer',
      title: 'Quality Issue Received',
      message: 'Our cooperative society coordinator is reviewing your report. A free revisit will be scheduled.',
      type: 'info',
      relatedBookingId: bookingId,
    });
  };

  // ADMIN REVIEW QUALITY ISSUE
  const adminReviewQualityIssue = (bookingId: string, notes?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId && b.qualityIssue) {
          return {
            ...b,
            qualityIssue: {
              ...b.qualityIssue,
              status: 'reviewed',
              adminResolutionNotes: notes,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );
  };

  // ADMIN REASSIGN WORKER FOR REVISIT
  const adminReassignQualityIssue = (bookingId: string, newWorkerId: string) => {
    const newWorker = workers.find((w) => w.id === newWorkerId);
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId && b.qualityIssue) {
          return {
            ...b,
            state: 'REVISIT',
            qualityIssue: {
              ...b.qualityIssue,
              status: 'revisit_assigned',
              reassignedWorkerId: newWorkerId,
              reassignedWorkerName: newWorker?.name,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addNotification({
      recipientRole: 'customer',
      title: 'Revisit Scheduled',
      message: `Senior cooperative technician ${newWorker?.name || 'Rahul'} has been assigned for a complimentary revisit.`,
      type: 'success',
      relatedBookingId: bookingId,
    });

    if (newWorker) {
      addNotification({
        recipientRole: 'worker',
        title: 'Priority Revisit Assigned',
        message: `Complimentary revisit ticket assigned for Booking ${bookingId}.`,
        type: 'warning',
        relatedBookingId: bookingId,
      });
    }
  };

  // COMPLETE REVISIT
  const completeRevisit = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId && b.qualityIssue) {
          return {
            ...b,
            state: 'COMPLETED',
            qualityIssue: {
              ...b.qualityIssue,
              status: 'resolved',
              revisitCompletedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addNotification({
      recipientRole: 'customer',
      title: 'Revisit Completed Successfully',
      message: 'Your quality dispute has been resolved to cooperative satisfaction standards.',
      type: 'success',
      relatedBookingId: bookingId,
    });
  };

  // ADMIN MANUAL OVERRIDE / ASSIGN
  const adminManualAssignWorker = (bookingId: string, workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            matchedWorkerId: worker.id,
            matchedWorker: worker,
            state: 'CONFIRMED',
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addNotification({
      recipientRole: 'worker',
      title: 'Admin Assigned Job',
      message: `Admin assigned Booking ${bookingId} to you directly.`,
      type: 'info',
      relatedBookingId: bookingId,
    });
  };

  // COMMUNITY BOOKINGS
  const joinCommunityBooking = (communityBookingId: string, customerName: string, flatNumber: string) => {
    setCommunityBookings((prev) =>
      prev.map((cb) => {
        if (cb.id === communityBookingId) {
          const alreadyJoined = cb.participants.some(
            (p) => p.customerName === customerName && p.flatNumber === flatNumber
          );
          if (alreadyJoined) return cb;

          const updatedParticipants = [
            ...cb.participants,
            {
              id: `p-${Date.now()}`,
              customerName,
              flatNumber,
              joinedAt: 'Just now',
            },
          ];
          return {
            ...cb,
            participants: updatedParticipants,
            participantCount: updatedParticipants.length,
          };
        }
        return cb;
      })
    );

    addNotification({
      recipientRole: 'customer',
      title: 'Joined Community Batch',
      message: `You joined the collective booking. Discount unlocked!`,
      type: 'success',
    });
  };

  const createCommunityBooking = (data: {
    societyName: string;
    serviceCategory: string;
    description: string;
    scheduledDate: string;
  }) => {
    const newCommunity: CommunityBooking = {
      id: `COMM-${Date.now()}`,
      societyName: data.societyName,
      serviceCategory: data.serviceCategory,
      description: data.description,
      participantCount: 1,
      targetDiscountPercent: 20,
      scheduledDate: data.scheduledDate,
      status: 'open',
      participants: [
        {
          id: `p-${Date.now()}`,
          customerName: currentUser.name,
          flatNumber: 'Flat 402',
          joinedAt: 'Just now',
        },
      ],
    };

    setCommunityBookings((prev) => [newCommunity, ...prev]);
    addNotification({
      recipientRole: 'customer',
      title: 'Community Booking Initiated',
      message: `Group request for ${data.societyName} created. Neighbours can now join!`,
      type: 'success',
    });
  };

  // WORKER EMERGENCY AID
  const requestEmergencyAid = (
    workerId: string,
    workerName: string,
    reason: string,
    amount: number
  ) => {
    const newAid: WorkerEmergencyAidRequest = {
      id: `AID-${Math.floor(100 + Math.random() * 900)}`,
      workerId,
      workerName,
      reason,
      requestedAmount: amount,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setEmergencyAidRequests((prev) => [newAid, ...prev]);

    addNotification({
      recipientRole: 'federation_manager',
      title: 'Emergency Aid Request Submitted',
      message: `${workerName} requested ₹${amount} for: ${reason}`,
      type: 'warning',
    });
  };

  const approveEmergencyAidRequest = (requestId: string) => {
    const req = emergencyAidRequests.find((r) => r.id === requestId);
    if (!req) return;

    setEmergencyAidRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );

    setCooperativeFund((prev) => ({
      ...prev,
      balance: prev.balance - req.requestedAmount,
      transactions: [
        {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split('T')[0],
          type: 'debit',
          category: 'emergency_aid',
          amount: req.requestedAmount,
          description: `Disbursed emergency aid grant to ${req.workerName}`,
        },
        ...prev.transactions,
      ],
    }));

    addNotification({
      recipientRole: 'worker',
      title: 'Emergency Aid Approved',
      message: `₹${req.requestedAmount} grant approved from the Cooperative Relief Fund.`,
      type: 'success',
    });
  };

  const rejectEmergencyAidRequest = (requestId: string) => {
    setEmergencyAidRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  // TOOL BANK
  const borrowTool = (
    toolId: string,
    workerId: string,
    workerName: string,
    returnDays: number = 3
  ) => {
    const retDate = new Date();
    retDate.setDate(retDate.getDate() + returnDays);

    setToolBank((prev) =>
      prev.map((t) =>
        t.id === toolId
          ? {
              ...t,
              status: 'borrowed',
              borrowedByWorkerId: workerId,
              borrowedByWorkerName: workerName,
              borrowedDate: new Date().toISOString().split('T')[0],
              returnDate: retDate.toISOString().split('T')[0],
            }
          : t
      )
    );

    addNotification({
      recipientRole: 'worker',
      title: 'Tool Checked Out',
      message: `Tool reserved successfully. Return by ${retDate.toISOString().split('T')[0]}.`,
      type: 'success',
    });
  };

  const returnTool = (toolId: string) => {
    setToolBank((prev) =>
      prev.map((t) =>
        t.id === toolId
          ? {
              ...t,
              status: 'available',
              borrowedByWorkerId: undefined,
              borrowedByWorkerName: undefined,
              borrowedDate: undefined,
              returnDate: undefined,
            }
          : t
      )
    );

    addNotification({
      recipientRole: 'society_manager',
      title: 'Tool Returned to Inventory',
      message: `Tool checked back into Cooperative Tool Bank Hub.`,
      type: 'info',
    });
  };

  const updatePlatformConfig = (newConfig: PlatformConfig) => {
    setConfig(newConfig);
    showToast({
      title: 'Platform Config Updated',
      message: 'Cooperative settings saved.',
      type: 'success',
    });
  };

  const verifyOTPAndStartJob = (bookingId: string, enteredOtp: string): boolean => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;
    if (booking.otp === enteredOtp.trim()) {
      updateBookingState(bookingId, 'IN_PROGRESS');
      return true;
    }
    return false;
  };

  // POST COMMUNITY MESSAGE
  const postCommunityMessage = (
    channelId: string,
    arg2?: string,
    arg3?: any,
    arg4?: string,
    arg5?: string
  ) => {
    const content = arg4 || arg2 || '';
    if (!content.trim()) return;
    const authorName = arg4 ? arg2 || currentUser.name : currentUser.name;
    const authorRole = arg4 ? arg3 || currentRole : currentRole;
    const authorProfession = arg5 || currentUser.tradeProfession;

    const newMsg: CommunityMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      authorName,
      senderName: authorName,
      authorRole,
      senderRole: authorRole,
      authorAvatar: currentUser.avatar,
      authorProfession,
      senderTrade: authorProfession,
      content: content.trim(),
      text: content.trim(),
      timestamp: 'Just now',
      isOfficial: authorRole === 'society_manager' || authorRole === 'federation_manager',
    };

    setCommunityMessages((prev) => [...prev, newMsg]);
    showToast({
      title: 'Message Posted',
      message: 'Your update has been shared with the community.',
      type: 'success',
    });
  };

  // TRIGGER ACTIVE JOB SOS
  const triggerActiveJobSOS = (
    bookingId: string,
    reportedBy: 'customer' | 'worker',
    reason: string,
    details?: string
  ): ActiveJobSOSTicket => {
    const newTicket: ActiveJobSOSTicket = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId,
      jobId: bookingId,
      reportedBy,
      reporterRole: reportedBy,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone,
      reason,
      details,
      reportedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'active_emergency',
      assignedManager: 'Suresh Menon (Society Manager)',
    };

    setSosTickets((prev) => [newTicket, ...prev]);

    // Dispatch real-time emergency alert
    addNotification({
      recipientRole: 'society_manager',
      title: `🚨 SOS TRIGGERED: Booking #${bookingId}`,
      message: `${reportedBy === 'customer' ? 'Customer' : 'Worker'} reported: ${reason}. Priority intervention required.`,
      type: 'emergency',
      relatedBookingId: bookingId,
    });

    addNotification({
      recipientRole: reportedBy,
      title: '🚨 Emergency Protocol Activated',
      message: 'Society Manager has been notified with high priority. Support is monitoring this active job.',
      type: 'emergency',
      relatedBookingId: bookingId,
    });

    showToast({
      title: '🚨 Emergency SOS Logged',
      message: 'Priority support activated. Society Manager notified.',
      type: 'emergency',
      duration: 6000,
    });

    return newTicket;
  };

  const resolveSOSTicket = (ticketId: string, notes?: string) => {
    setSosTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'resolved', resolutionNotes: notes } : t))
    );
    showToast({
      title: 'Emergency Ticket Resolved',
      message: `SOS ticket #${ticketId} marked as resolved.`,
      type: 'success',
    });
  };

  // Dynamic Hierarchy Getters
  const getWorkersBySociety = (societyIdOrName: string): Worker[] => {
    return workers.filter((w) => w.societyId === societyIdOrName || w.societyName === societyIdOrName);
  };

  const getSocietyWorkersCount = (societyIdOrName: string): number => {
    return workers.filter((w) => w.societyId === societyIdOrName || w.societyName === societyIdOrName).length;
  };

  const getSocietyActiveBookingsCount = (societyIdOrName: string): number => {
    return bookings.filter(
      (b) => (b.societyId === societyIdOrName || b.societyName === societyIdOrName) && !['COMPLETED', 'PAID', 'RATED'].includes(b.state)
    ).length;
  };

  const getSocietyManagersCount = (): number => {
    return societies.length;
  };

  const getFederationWorkersCount = (): number => {
    return workers.length;
  };

  const getFederationActiveJobsCount = (): number => {
    return bookings.filter((b) => !['COMPLETED', 'PAID', 'RATED'].includes(b.state)).length;
  };

  // RESET TO DEMO
  const resetToDemoData = () => {
    setConfig(INITIAL_CONFIG);
    setWorkers(INITIAL_WORKERS);
    setBookings(INITIAL_BOOKINGS);
    setCommunityBookings(INITIAL_COMMUNITY_BOOKINGS);
    setCommunityChannels(INITIAL_COMMUNITY_CHANNELS);
    setCommunityMessages(INITIAL_COMMUNITY_MESSAGES);
    setSosTickets([]);
    setCooperativeFund(INITIAL_COOPERATIVE_FUND);
    setEmergencyAidRequests(INITIAL_EMERGENCY_AID_REQUESTS);
    setToolBank(INITIAL_TOOL_BANK);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSocieties(INITIAL_SOCIETIES);
    setSocietyManagers(INITIAL_SOCIETY_MANAGERS);
    setFederations(INITIAL_FEDERATIONS);
    setPlatformMetrics(INITIAL_PLATFORM_METRICS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentRole('customer');
    setIsAuthenticated(false);
    localStorage.clear();
  };

  return (
    <CooperativeStoreContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        currentUser,
        login,
        logout,
        setRole,
        setCurrentUser,
        toasts,
        showToast,
        dismissToast,
        config,
        updateConfig,
        updatePlatformConfig,
        updatePlatformWeights,
        updateRevenueSplit,
        societies,
        societyManagers,
        federations,
        platformMetrics,
        auditLogs,
        allocateFederationGrant,
        addAuditLog,
        workers,
        updateWorkerVerification,
        reviewWorkerDocument,
        updateWorkerLocation,
        toggleWorkerAvailability,
        bookings,
        createBooking,
        acceptBookingByWorker,
        rejectBookingByWorker,
        updateBookingState,
        verifyBookingOTP,
        verifyOTPAndStartJob,
        completeBooking,
        payBooking,
        rateBooking,
        reportQualityIssue,
        adminReviewQualityIssue,
        adminReassignQualityIssue,
        completeRevisit,
        adminManualAssignWorker,
        communityBookings,
        joinCommunityBooking,
        createCommunityBooking,
        communityChannels,
        communityMessages,
        postCommunityMessage,
        sosTickets,
        triggerActiveJobSOS,
        resolveSOSTicket,
        cooperativeFund,
        requestEmergencyAid,
        emergencyAidRequests,
        approveEmergencyAidRequest,
        rejectEmergencyAidRequest,
        toolBank,
        borrowTool,
        returnTool,
        notifications,
        markNotificationAsRead,
        addNotification,
        resetToDemoData,
        getWorkersBySociety,
        getSocietyWorkersCount,
        getSocietyActiveBookingsCount,
        getSocietyManagersCount,
        getFederationWorkersCount,
        getFederationActiveJobsCount,
      }}
    >
      {children}
    </CooperativeStoreContext.Provider>
  );
}

export function useCooperativeStore() {
  const context = useContext(CooperativeStoreContext);
  if (!context) {
    throw new Error('useCooperativeStore must be used within a CooperativeStoreProvider');
  }
  return context;
}
