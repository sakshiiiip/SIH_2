import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { Worker, WorkerVerificationStatus, Booking } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { WorkerProfileModal } from '../customer/WorkerProfileModal';
import { SocietyWorkerMap } from '../../components/admin/SocietyWorkerMap';
import { AddWorkerModal } from '../../components/admin/AddWorkerModal';
import { AddSkillModal } from '../../components/admin/AddSkillModal';
import { workerAuthService } from '../../services/workerAuthService';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ShieldAlert,
  Search,
  Star,
  ChevronRight,
  MapPin,
  Compass,
  HardHat,
  FileCheck,
  Eye,
  EyeOff,
  UserPlus,
  Key,
  Copy,
  Check,
  Lock,
  RotateCcw,
  Camera,
  ImageIcon,
  Calendar,
  X,
  AlertTriangle,
  Send,
  Plus,
  User,
  Briefcase,
} from 'lucide-react';

interface SocietyManagerDashboardProps {
  onSelectTab?: (tab: string) => void;
}

export const SocietyManagerDashboard: React.FC<SocietyManagerDashboardProps> = () => {
  const { t } = useTranslation();
  const {
    currentUser,
    societies,
    bookings,
    sosTickets,
    getWorkersBySociety,
    getSocietyWorkersCount,
    getSocietyActiveBookingsCount,
    resolveSOSTicket,
    adminReviewQualityIssue,
    verifyJobByManager,
    scheduleRevisit,
    showToast,
    endorseWorkerByManager,
    rejectWorkerByManager,
    verifyWorkerPersonalKyc,
    verifyWorkerSkill,
    assignWorkerToBooking,
  } = useCooperativeStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'locations' | 'workers' | 'job_verification' | 'verification' | 'bookings' | 'quality' | 'fund'
  >('overview');
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<Worker | null>(null);
  const [workerToAddSkill, setWorkerToAddSkill] = useState<Worker | null>(null);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [showCredentialsDesk, setShowCredentialsDesk] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedCredentialId, setCopiedCredentialId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});
  const [revisitDates, setRevisitDates] = useState<Record<string, string>>({});

  // Two-Tier Verification Actions State
  const [workerToEndorse, setWorkerToEndorse] = useState<Worker | null>(null);
  const [endorseNotes, setEndorseNotes] = useState('');
  const [workerToReject, setWorkerToReject] = useState<Worker | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'endorsed' | 'rejected'>('all');

  // Bookings Worker Assignment State
  const [bookingToAssign, setBookingToAssign] = useState<Booking | null>(null);
  const [selectedAssignWorkerId, setSelectedAssignWorkerId] = useState<string>('');

  const registeredWorkerAccounts = workerAuthService.getRegisteredWorkers();

  // Society-scoped data
  const currentSociety =
    societies.find(
      (s) =>
        (currentUser.societyId && s.id === currentUser.societyId) ||
        (currentUser.societyName && s.name.toLowerCase() === currentUser.societyName.toLowerCase())
    ) ||
    societies.find((s) => s.id === 'soc_gr') ||
    societies[0];

  const currentSocietyId = currentSociety?.id || currentUser.societyId || 'soc_gr';
  const currentSocietyName = currentSociety?.name || currentUser.societyName || 'Green Residency';
  const managerName = currentUser.name || currentSociety?.managerName || 'Priya Sharma';

  // Live computed metrics for this society
  const societyWorkers = getWorkersBySociety(currentSocietyId);
  const societyWorkersCount = getSocietyWorkersCount(currentSocietyId);
  const activeJobsCount = getSocietyActiveBookingsCount(currentSocietyId);

  // Society bookings
  const societyBookings = bookings.filter(
    (b) =>
      b.societyId === currentSocietyId ||
      (b.societyName && currentSocietyName && b.societyName.toLowerCase() === currentSocietyName.toLowerCase())
  );
  const completedTodayBookings = societyBookings.filter(
    (b) => ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );

  // Verification lists
  const pendingReviewWorkers = societyWorkers.filter(
    (w) =>
      w.verificationStatus === 'PENDING' ||
      w.verificationStatus === 'UNDER_REVIEW' ||
      w.verificationStatus === 'CORRECTION_REQUIRED' ||
      w.personalKycStatus === 'PENDING' ||
      (w.skillEntries && w.skillEntries.some((s) => s.status === 'PENDING')) ||
      (w.documents && w.documents.some((d) => d.status === 'PENDING'))
  );
  const endorsedWorkers = societyWorkers.filter(
    (w) => w.verificationStatus === 'MANAGER_VERIFIED'
  );
  const rejectedWorkers = societyWorkers.filter(
    (w) =>
      w.verificationStatus === 'MANAGER_REJECTED' ||
      w.verificationStatus === 'FEDERATION_REJECTED' ||
      w.personalKycStatus === 'REJECTED' ||
      (w.skillEntries && w.skillEntries.some((s) => s.status === 'REJECTED'))
  );

  const displayedVerificationWorkers = societyWorkers.filter((w) => {
    if (verificationFilter === 'pending') {
      return (
        w.verificationStatus === 'PENDING' ||
        w.verificationStatus === 'UNDER_REVIEW' ||
        w.verificationStatus === 'CORRECTION_REQUIRED' ||
        w.personalKycStatus === 'PENDING' ||
        (w.skillEntries && w.skillEntries.some((s) => s.status === 'PENDING')) ||
        (w.documents && w.documents.some((d) => d.status === 'PENDING'))
      );
    }
    if (verificationFilter === 'endorsed') {
      return w.verificationStatus === 'MANAGER_VERIFIED';
    }
    if (verificationFilter === 'rejected') {
      return (
        w.verificationStatus === 'MANAGER_REJECTED' ||
        w.verificationStatus === 'FEDERATION_REJECTED' ||
        w.personalKycStatus === 'REJECTED' ||
        (w.skillEntries && w.skillEntries.some((s) => s.status === 'REJECTED'))
      );
    }
    return true;
  });

  const pendingWorkers = pendingReviewWorkers;
  const awaitingJobVerifications = societyBookings.filter(
    (b) => b.state === 'AWAITING_VERIFICATION'
  );
  const revisitRequests = societyBookings.filter(
    (b) => b.state === 'REVISIT_REQUESTED'
  );
  const qualityDisputes = societyBookings.filter(
    (b) => b.state === 'QUALITY_ISSUE' || b.state === 'REVISIT' || b.qualityIssue
  );

  // Active SOS tickets in this society
  const activeSOSTickets = sosTickets.filter(
    (t) => (t.status === 'OPEN' || t.status === 'RESPONDING') && (t.societyId === currentSocietyId || !t.societyId)
  );

  // Filtered workers list
  const filteredWorkers = societyWorkers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
      (w.skills && w.skills.some((s) => s.toLowerCase().includes(workerSearch.toLowerCase()))) ||
      (w.skillEntries && w.skillEntries.some((s) => s.name.toLowerCase().includes(workerSearch.toLowerCase()))) ||
      w.phone.includes(workerSearch);
    const matchesTrade =
      selectedTrade === 'All' ||
      (w.skills && w.skills.includes(selectedTrade)) ||
      (w.skillEntries && w.skillEntries.some((s) => s.name === selectedTrade)) ||
      w.profession === selectedTrade;
    return matchesSearch && matchesTrade;
  });

  const renderVerificationBadge = (status: WorkerVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#364A32] bg-[#E6ECE4] px-2.5 py-0.5 rounded-lg border border-[#CFDDD0]">
            <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
            <span>Verified</span>
          </span>
        );
      case 'MANAGER_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            <span>Endorsed · Awaiting Federation Approval</span>
          </span>
        );
      case 'MANAGER_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
            <X className="w-3 h-3 text-rose-600" />
            <span>Rejected by Manager</span>
          </span>
        );
      case 'FEDERATION_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-300">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Federation Rejected</span>
          </span>
        );
      case 'CORRECTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
            <span>Correction Required</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
            <span>Under Manager Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            <span>Pending Manager Review</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. HEADER: SOCIETY MANAGER OVERVIEW (MY SOCIETY) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAEDE8] border border-[#F3C5B8] flex items-center justify-center text-[#80432E] shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8]">
                Society Manager
              </span>
              <span className="text-xs text-[#77736B]">{managerName}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#292824] tracking-tight leading-tight mt-0.5">
              {currentSocietyName} Desk
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#80432E] bg-[#FAEDE8] border border-[#F3C5B8] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local Governance Active</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW: "MY SOCIETY" LIVE COUNTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setActiveTab('workers')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Workers</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{societyWorkersCount}</span>
          <span className="text-[10px] text-[#537895] font-semibold">Stationed</span>
        </div>

        <div
          onClick={() => setActiveTab('locations')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Locations</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{societyWorkers.filter(w => w.locationStatus === 'AVAILABLE').length}</span>
          <span className="text-[10px] text-[#6E8B67] font-semibold">● Available Now</span>
        </div>

        <div
          onClick={() => setActiveTab('verification')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Verification</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{pendingWorkers.length}</span>
          <span className="text-[10px] text-[#80432E] font-semibold">Docs Pending</span>
        </div>

        <div
          onClick={() => setActiveTab('bookings')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Active Jobs</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{activeJobsCount}</span>
          <span className="text-[10px] text-[#6E8B67] font-semibold">In Progress</span>
        </div>

        <div
          onClick={() => setActiveTab('quality')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card col-span-2 sm:col-span-1"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Service Issues</span>
          <span className={`text-2xl font-bold font-mono block mt-1 tracking-tight ${qualityDisputes.length > 0 ? 'text-[#B86B6B]' : 'text-[#6E8B67]'}`}>
            {qualityDisputes.length}
          </span>
          <span className="text-[10px] text-[#C93B2B] font-semibold">Review Required</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE SOS TICKETS ALERT */}
      {/* ========================================================================= */}
      {activeSOSTickets.length > 0 && (
        <div className="p-4 bg-[#FAEDE8] border-2 border-[#C93B2B] rounded-2xl shadow-card space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#C93B2B] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Active SOS Incident Alert ({activeSOSTickets.length})</span>
            </span>
            <Badge variant="emergency" size="sm">Urgent Intervention</Badge>
          </div>

          <div className="space-y-2">
            {activeSOSTickets.map((t) => (
              <div key={t.id} className="p-3 bg-white rounded-xl border border-[#F3C5B8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <strong className="text-[#292824] block">{t.reportedBy === 'customer' ? 'Resident Escalation' : 'Worker Safety Alert'}: {t.reason}</strong>
                  <span className="text-[11px] text-[#77736B]">Reported by {t.reporterName} · Booking #{t.bookingId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resolveSOSTicket(t.id, 'Resolved and verified by Society Manager.');
                    showToast({
                      title: 'SOS Incident Closed',
                      message: `Ticket #${t.id} resolved.`,
                      type: 'success',
                    });
                  }}
                  className="px-3 py-1.5 bg-[#C93B2B] hover:bg-[#B33224] text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WORKSPACE NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1 border-b border-[#E8E2D5] overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'locations', label: `Worker Locations (${societyWorkers.length})` },
          { key: 'workers', label: `Workers (${societyWorkersCount})` },
          { key: 'job_verification', label: `Job Verification (${awaitingJobVerifications.length + revisitRequests.length})` },
          { key: 'verification', label: `Worker KYC (${pendingWorkers.length})` },
          { key: 'bookings', label: `Bookings (${societyBookings.length})` },
          { key: 'quality', label: `Service Issues (${qualityDisputes.length})` },
          { key: 'fund', label: 'Cooperative Fund' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] shadow-2xs font-extrabold'
                : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 5. TAB CONTENT AREAS */}
      {/* ========================================================================= */}

      {/* TAB: WORKER LOCATIONS / GEOLOCATION MAP (Sections 8 - 12) */}
      {activeTab === 'locations' && (
        <div className="animate-fade-in">
          <SocietyWorkerMap
            societyName={currentSocietyName}
            workers={societyWorkers}
            onSelectWorker={(w) => setSelectedWorkerForProfile(w)}
          />
        </div>
      )}

      {/* TAB: OVERVIEW & WORKERS ROSTER */}
      {(activeTab === 'overview' || activeTab === 'workers') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search worker by name, skill, phone..."
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#80432E]"
              />
            </div>

            {/* Right side actions: Credentials View & + Add Worker */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowCredentialsDesk(!showCredentialsDesk)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showCredentialsDesk
                    ? 'bg-[#80432E] text-white shadow-xs'
                    : 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] hover:bg-[#F3C5B8]'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showCredentialsDesk ? 'Show Cards View' : 'Credentials & Passwords'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddWorkerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#B37055] hover:bg-[#9C583E] text-white shadow-xs cursor-pointer transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Worker</span>
              </button>
            </div>
          </div>

          {/* CREDENTIALS DESK TABLE VIEW */}
          {showCredentialsDesk ? (
            <div className="bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl p-4 sm:p-5 space-y-4 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D5]">
                <div>
                  <h3 className="text-sm font-bold text-[#292824] flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#80432E]" />
                    <span>Worker Credentials Ledger ({registeredWorkerAccounts.length} Accounts)</span>
                  </h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Share registered Worker ID and Temporary Password with workers for their first-time login.
                  </p>
                </div>
                <Badge variant="pending" size="sm">Manager Vault</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E2D5] text-[#77736B] font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Worker</th>
                      <th className="py-2.5 px-3">Worker ID</th>
                      <th className="py-2.5 px-3">Registered Email</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Temporary Password</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5]">
                    {registeredWorkerAccounts.map((acc) => {
                      const isRevealed = revealedPasswords[acc.workerId];
                      const isCopied = copiedCredentialId === acc.workerId;
                      return (
                        <tr key={acc.workerId} className="hover:bg-[#F3EEE4]/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#FAEDE8] text-[#80432E] flex items-center justify-center font-bold text-xs shrink-0">
                                {(acc.name.includes('Priya') ? t('demoUsers.priyaPatel', acc.name) : acc.name)[0]}
                              </div>
                              <div>
                                <strong className="font-bold text-[#292824] block">{acc.name.includes('Priya') ? t('demoUsers.priyaPatel', acc.name) : acc.name}</strong>
                                <span className="text-[11px] text-[#80432E]">{acc.skills[0]}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#292824]">
                            {acc.workerId}
                          </td>
                          <td className="py-3 px-3 text-[#524E47]">
                            {acc.email}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                acc.firstLogin
                                  ? 'bg-[#FFF3D6] text-[#8F6B00] border border-[#F5E2B3]'
                                  : 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0]'
                              }`}
                            >
                              {acc.firstLogin ? 'Temp Pass' : 'Activated'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {acc.firstLogin ? (
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="bg-[#FAEDE8] px-2 py-1 rounded-lg border border-[#F3C5B8] text-[#80432E] font-bold">
                                  {isRevealed ? (acc.tempPasswordPlain || 'temp123') : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedPasswords((prev) => ({
                                      ...prev,
                                      [acc.workerId]: !isRevealed,
                                    }))
                                  }
                                  className="p-1 text-[#9A958B] hover:text-[#524E47]"
                                  aria-label={isRevealed ? 'Hide' : 'Show'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[#9A958B] text-[11px] italic flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B67]" />
                                Set by worker
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const pass = acc.tempPasswordPlain || (acc.firstLogin ? 'temp123' : '[Private]');
                                navigator.clipboard.writeText(`Worker ID: ${acc.workerId}\nEmail: ${acc.email}\nPassword: ${pass}`);
                                setCopiedCredentialId(acc.workerId);
                                setTimeout(() => setCopiedCredentialId(null), 2000);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D5] hover:border-[#80432E] text-[#80432E] font-bold text-[11px] transition-colors"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-[#364A32]" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? 'Copied' : 'Copy All'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Workers Grid with Progressive Disclosure */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWorkers.map((w) => {
                const approvedDocs = (w.documents || []).filter((d) => d.status === 'APPROVED').length;
                const totalDocs = (w.documents || []).length;
                const isPersonalKycVerified = w.personalKycStatus === 'VERIFIED';
                const skillEntries = w.skillEntries || [];
                const verifiedSkillsCount = skillEntries.filter((s) => s.status === 'VERIFIED').length;

                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorkerForProfile(w)}
                    className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl shadow-card transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#E8E2D5] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-xs font-bold text-[#292824] truncate">{w.name}</strong>
                          {renderVerificationBadge(w.verificationStatus)}
                        </div>
                        <span className="text-[11px] text-[#80432E] font-medium block truncate">
                          {w.skills.join(', ')}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-[#77736B] mt-0.5">
                          <Star className="w-3 h-3 fill-[#B37055] text-[#B37055]" />
                          <span className="font-bold text-[#80432E]">{w.rating}</span>
                          <span>· {w.completedJobs} jobs</span>
                        </div>
                      </div>
                    </div>

                    {/* Level 1 & Level 2 Status Badges */}
                    <div className="space-y-1.5 pt-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#77736B]">Personal KYC:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                            isPersonalKycVerified
                              ? 'bg-[#E6ECE4] text-[#364A32]'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {isPersonalKycVerified ? '✓ Verified' : 'Pending Review'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#77736B]">Verified Skills:</span>
                        <span className="font-bold text-[#80432E]">
                          {verifiedSkillsCount} / {skillEntries.length || w.skills.length}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkerToAddSkill(w);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-[#FAF7F2] text-[#80432E] border border-[#E8E2D5] hover:border-[#80432E] text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Skill</span>
                      </button>

                      <span className="text-[11px] font-bold text-[#537895] group-hover:underline flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
        )}

        {filteredWorkers.length === 0 && !showCredentialsDesk && (
            <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center text-xs text-[#77736B]">
              No workers matched your search filter.
            </div>
          )}
        </div>
      )}

      {/* TAB: JOB VERIFICATION QUEUE (Person 2 Deliverable) */}
      {activeTab === 'job_verification' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E2D5]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#80432E] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#6E8B67]" />
                Job Verification & Revisit Queue
              </h2>
              <p className="text-xs text-[#77736B] mt-0.5">
                Inspect before & after photo evidence, verify resident sign-off, and approve settlements or schedule revisits.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] px-3 py-1 rounded-xl">
                {awaitingJobVerifications.length} Awaiting Sign-off
              </span>
              <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                {revisitRequests.length} Revisit Requests
              </span>
            </div>
          </div>

          {/* Section 1: Jobs Awaiting Manager Sign-Off */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#292824] uppercase tracking-wider">
              1. Jobs Pending Manager Verification ({awaitingJobVerifications.length})
            </h3>

            {awaitingJobVerifications.length === 0 ? (
              <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-[#6E8B67] mx-auto mb-1" />
                <strong className="text-xs font-bold text-[#292824] block">Verification queue clear.</strong>
                <p className="text-xs text-[#77736B]">
                  No completed jobs are currently waiting for manager sign-off in {currentSocietyName}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {awaitingJobVerifications.map((b) => {
                  return (
                    <div
                      key={b.id}
                      className="p-5 bg-[#FCF9F3] border-2 border-blue-200 rounded-2xl shadow-card space-y-4"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D5]">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded-md">
                              {b.serviceCategory}
                            </span>
                            <Badge variant="coop" size="sm">Awaiting Sign-off</Badge>
                            <span className="text-[11px] font-mono text-[#77736B]">#{b.id}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-[#292824]">{b.problemType}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {b.customerConfirmation ? (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Resident Confirmed
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                              Resident Confirmation Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#77736B] block">Customer</span>
                          <strong className="text-[#292824] block">{b.customerName}</strong>
                          <span className="text-[#524E47] block truncate">{b.customerAddress}</span>
                          <span className="text-[#77736B]">{b.customerPhone}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#77736B] block">Assigned Worker</span>
                          <strong className="text-[#292824] block">{b.matchedWorker?.name || 'Assigned Worker'}</strong>
                          <span className="text-[#524E47] block">Worker Share: ₹{b.pricing.workerShare}</span>
                          <span className="text-[#77736B]">Completed: {b.completedAt?.split('T')[0] || 'Today'}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#77736B] block">Billing Breakdown</span>
                          <strong className="text-[#445D3E] font-mono text-sm block">Total: ₹{b.pricing.total}</strong>
                          <span className="text-[#77736B] block text-[11px]">
                            Society: ₹{b.pricing.societyShare} · Fund: ₹{b.pricing.cooperativeFund}
                          </span>
                        </div>
                      </div>

                      {/* Photo Evidence Side-by-Side */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-[#524E47] flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#6E8B67]" />
                          Work Execution Evidence (Before & After)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="relative rounded-2xl overflow-hidden border border-[#E8E2D5] bg-white h-36 flex flex-col justify-between p-2">
                            {b.beforeImage ? (
                              <img
                                src={b.beforeImage}
                                alt="Before Repair"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                                <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                                No Before Photo Uploaded
                              </div>
                            )}
                            <span className="relative z-10 self-start bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Before Work Started
                            </span>
                          </div>

                          <div className="relative rounded-2xl overflow-hidden border-2 border-[#6E8B67] bg-[#F6FAF5] h-36 flex flex-col justify-between p-2">
                            {b.afterImage || (b.workPhotos && b.workPhotos[0]) ? (
                              <img
                                src={b.afterImage || (b.workPhotos && b.workPhotos[0])}
                                alt="After Repair"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                                <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                                No After Photo Uploaded
                              </div>
                            )}
                            <span className="relative z-10 self-start bg-[#445D3E] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              After Work Completed ✓
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Worker notes */}
                      {b.notes && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-[#524E47]">
                          <strong className="text-[#292824]">Worker Notes: </strong>
                          <span>{b.notes}</span>
                        </div>
                      )}

                      {/* Manager Review Notes & Actions */}
                      <div className="space-y-2 pt-2 border-t border-[#E8E2D5]">
                        <label className="text-xs font-semibold text-[#524E47] block">
                          Manager Verification Notes / Instructions:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Work confirmed in person. Pressure seals verified."
                          value={verificationNotes[b.id] || ''}
                          onChange={(e) =>
                            setVerificationNotes({ ...verificationNotes, [b.id]: e.target.value })
                          }
                          className="w-full p-2.5 border border-[#E8E2D5] rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <span className="text-[11px] text-[#77736B]">
                            Approving unlocks customer settlement & updates cooperative books.
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                verifyJobByManager(b.id, {
                                  verifiedBy: managerName,
                                  status: 'REJECTED',
                                  notes: verificationNotes[b.id] || 'Quality requirements not satisfied',
                                })
                              }
                              className="px-3 py-2 bg-[#FAEDE8] hover:bg-[#F3C5B8] text-[#80432E] border border-[#F3C5B8] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              Reject Job
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                verifyJobByManager(b.id, {
                                  verifiedBy: managerName,
                                  status: 'REVISIT_NEEDED',
                                  notes: verificationNotes[b.id] || 'Manager flagged job for revisit',
                                })
                              }
                              className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Flag for Revisit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                verifyJobByManager(b.id, {
                                  verifiedBy: managerName,
                                  status: 'APPROVED',
                                  notes: verificationNotes[b.id],
                                })
                              }
                              className="px-4 py-2 bg-[#445D3E] hover:bg-[#33472F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Sign-Off</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Revisit Requests & Scheduling */}
          <div className="space-y-3 pt-3 border-t border-[#E8E2D5]">
            <h3 className="text-xs font-bold text-[#292824] uppercase tracking-wider">
              2. Resident Revisit Requests ({revisitRequests.length})
            </h3>

            {revisitRequests.length === 0 ? (
              <div className="p-6 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center text-xs text-[#77736B]">
                No pending customer revisit requests in this society.
              </div>
            ) : (
              <div className="space-y-3">
                {revisitRequests.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl shadow-card space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="urgent" size="sm">Revisit Requested</Badge>
                          <span className="text-[11px] font-mono text-[#77736B]">#{b.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#292824] mt-1">
                          {b.serviceCategory} — {b.problemType}
                        </h4>
                        <p className="text-xs text-[#524E47]">
                          Resident: <strong>{b.customerName}</strong> ({b.customerAddress}) · Worker: {b.matchedWorker?.name || ' राहुल'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-950">
                      <strong className="block font-bold mb-0.5">Resident Reason for Revisit:</strong>
                      <p>"{b.revisitDetails?.reason || 'Service quality issue needs inspection'}"</p>
                    </div>

                    {/* Schedule Revisit Form */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                      <label className="text-xs font-semibold text-[#524E47] flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        Schedule Revisit Date:
                      </label>
                      <input
                        type="date"
                        value={revisitDates[b.id] || ''}
                        onChange={(e) => setRevisitDates({ ...revisitDates, [b.id]: e.target.value })}
                        className="p-2 border border-[#E8E2D5] rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const date = revisitDates[b.id] || new Date().toISOString().split('T')[0];
                          scheduleRevisit(b.id, date);
                        }}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Confirm Revisit Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: VERIFICATION QUEUE (Level 1 KYC & Level 2 Skills) */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E2D5]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#80432E] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#6E8B67]" />
                <span>Worker KYC & Skill Information Desk</span>
              </h2>
              <p className="text-xs text-[#77736B] mt-0.5">
                Manage worker records for {currentSocietyName}. Verify Level 1 Personal KYC and Level 2 Skill records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                {pendingReviewWorkers.length} Pending
              </span>
              <span className="text-xs font-bold bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] px-3 py-1 rounded-xl">
                {societyWorkers.filter((w) => w.verificationStatus === 'VERIFIED').length} Customer Eligible
              </span>
            </div>
          </div>

          {/* Verification Sub-Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-2 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setVerificationFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                verificationFilter === 'all'
                  ? 'bg-[#80432E] text-white'
                  : 'bg-[#FCF9F3] text-[#77736B] hover:text-[#292824] border border-[#E8E2D5]'
              }`}
            >
              All Workers ({societyWorkers.length})
            </button>
            <button
              type="button"
              onClick={() => setVerificationFilter('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                verificationFilter === 'pending'
                  ? 'bg-[#80432E] text-white'
                  : 'bg-[#FCF9F3] text-[#77736B] hover:text-[#292824] border border-[#E8E2D5]'
              }`}
            >
              Needs Review ({pendingReviewWorkers.length})
            </button>
            <button
              type="button"
              onClick={() => setVerificationFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                verificationFilter === 'rejected'
                  ? 'bg-[#80432E] text-white'
                  : 'bg-[#FCF9F3] text-[#77736B] hover:text-[#292824] border border-[#E8E2D5]'
              }`}
            >
              Needs Attention ({rejectedWorkers.length})
            </button>
          </div>

          {displayedVerificationWorkers.length > 0 ? (
            <div className="space-y-4">
              {displayedVerificationWorkers.map((w) => {
                const isPersonalKycVerified = w.personalKycStatus === 'VERIFIED';
                const skillEntries = w.skillEntries || [];
                const verifiedSkillsCount = skillEntries.filter((s) => s.status === 'VERIFIED').length;
                const isCustomerEligible = w.verificationStatus === 'VERIFIED';

                return (
                  <div
                    key={w.id}
                    className={`p-4 bg-[#FCF9F3] border rounded-2xl shadow-card space-y-3.5 transition-all ${
                      isCustomerEligible
                        ? 'border-[#CFDDD0]'
                        : 'border-amber-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.avatar}
                          alt={w.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#E8E2D5] shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-bold text-[#292824]">{w.name}</strong>
                            {renderVerificationBadge(w.verificationStatus)}
                          </div>
                          <span className="text-[11px] text-[#77736B] block mt-0.5">
                            Member ID: <span className="font-mono font-bold text-[#524E47]">{w.cooperativeMemberId}</span> · Phone: {w.phone}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => setWorkerToAddSkill(w)}
                          className="px-3.5 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#80432E] border border-[#80432E] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Skill</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedWorkerForProfile(w)}
                          className="px-3.5 py-1.5 bg-[#445D3E] hover:bg-[#33472F] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Full Record</span>
                        </button>
                      </div>
                    </div>

                    {/* Level 1 & Level 2 Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Level 1: Personal KYC */}
                      <div className="p-3 bg-white rounded-xl border border-[#E8E2D5] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#80432E] flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            Level 1: Personal KYC
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              isPersonalKycVerified
                                ? 'bg-[#E6ECE4] text-[#364A32]'
                                : 'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {isPersonalKycVerified ? '✓ Verified' : 'Pending Check'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#524E47] space-y-0.5">
                          <p>Aadhaar: <span className="font-mono">{w.aadhaarNumber ? `XXXX-XXXX-${w.aadhaarNumber.slice(-4)}` : 'On File'}</span></p>
                          <p className="truncate">Address: {w.address || 'Local residence'}</p>
                          <p>Emergency Contact: {w.emergencyContactName || 'Family'} ({w.emergencyContactNumber || w.phone})</p>
                        </div>
                        {!isPersonalKycVerified && (
                          <div className="pt-1 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => verifyWorkerPersonalKyc(w.id, 'VERIFIED')}
                              className="px-2.5 py-1 bg-[#445D3E] text-white rounded-lg text-[11px] font-bold hover:bg-[#33472F]"
                            >
                              ✓ Verify Personal KYC
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Level 2: Skill Information Records */}
                      <div className="p-3 bg-white rounded-xl border border-[#E8E2D5] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#80432E] flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            Level 2: Skill Records ({skillEntries.length})
                          </span>
                          <span className="text-[11px] font-bold text-[#80432E]">
                            {verifiedSkillsCount} Verified
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-28 overflow-y-auto">
                          {skillEntries.length > 0 ? (
                            skillEntries.map((sk) => (
                              <div
                                key={sk.id}
                                className="p-1.5 bg-[#FCF9F3] rounded-lg border border-[#E8E2D5] flex items-center justify-between text-[11px]"
                              >
                                <div>
                                  <strong className="text-[#292824] block">{sk.name}</strong>
                                  <span className="text-[10px] text-[#77736B]">{sk.experienceYears} yrs · {sk.serviceArea}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {sk.status === 'VERIFIED' ? (
                                    <span className="text-[#364A32] font-bold text-[10px] bg-[#E6ECE4] px-1.5 py-0.5 rounded">✓ Verified</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => verifyWorkerSkill(w.id, sk.id, 'VERIFIED')}
                                      className="px-2 py-0.5 bg-[#445D3E] text-white rounded text-[10px] font-bold"
                                    >
                                      Verify
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-[#77736B] italic">No skills registered yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer matching eligibility note */}
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                        isCustomerEligible
                          ? 'bg-[#E6ECE4]/50 border-[#CFDDD0] text-[#2A3927]'
                          : 'bg-amber-50/70 border-amber-200 text-amber-950'
                      }`}
                    >
                      <span className="font-semibold">
                        {isCustomerEligible
                          ? '✓ Active & Visible for Customer Bookings'
                          : '● Inactive: Worker requires Personal KYC Verified + at least 1 Verified Skill'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#6E8B67] mx-auto mb-2" />
              <strong className="text-xs font-bold text-[#292824] block">No workers in this view.</strong>
              <p className="text-xs text-[#77736B]">All current applicants in {currentSocietyName} have been processed.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: BOOKINGS QUEUE WITH MANUAL WORKER DISPATCH */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#80432E]">
                Society Service Requests & Dispatch
              </h2>
              <p className="text-xs text-[#77736B] mt-0.5">
                Assign and reassign jobs to fully verified cooperative workers.
              </p>
            </div>
            <span className="text-xs font-bold bg-[#FAF7F2] border border-[#E8E2D5] px-3 py-1 rounded-xl text-[#77736B]">
              {societyBookings.length} Total Bookings
            </span>
          </div>

          <div className="space-y-2.5">
            {societyBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-card"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm font-bold text-[#292824]">{b.serviceCategory} — {b.problemType}</strong>
                    <span className="text-[10px] font-mono text-[#77736B]">#{b.id}</span>
                    <Badge variant={['COMPLETED', 'PAID', 'RATED'].includes(b.state) ? 'completed' : 'pending'} size="sm">
                      {b.state}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[#77736B] block mt-1">
                    Resident: <strong className="text-[#292824]">{b.customerName}</strong> ({b.customerAddress}) · Worker:{' '}
                    <strong className="text-[#445D3E]">{b.matchedWorker ? b.matchedWorker.name : 'Unassigned (Needs Dispatch)'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-end">
                  <span className="font-mono font-bold text-sm text-[#292824]">₹{b.pricing.total}</span>
                  {!['COMPLETED', 'PAID', 'RATED', 'CANCELLED'].includes(b.state) && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingToAssign(b);
                        setSelectedAssignWorkerId(b.matchedWorkerId || '');
                      }}
                      className="px-3 py-1.5 bg-[#445D3E] hover:bg-[#33472F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{b.matchedWorker ? 'Reassign' : 'Assign Worker'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: QUALITY CONTROL */}
      {activeTab === 'quality' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#80432E]">
              Service Issues & Dispute Resolution
            </h2>
            <span className="text-xs text-[#77736B]">{qualityDisputes.length} Active</span>
          </div>

          {qualityDisputes.length > 0 ? (
            <div className="space-y-2.5">
              {qualityDisputes.map((b) => (
                <div key={b.id} className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-[#292824]">{b.serviceCategory} Issue · Booking #{b.id}</strong>
                      <p className="text-xs text-[#C93B2B] mt-0.5">
                        Feedback: {b.qualityIssue ? b.qualityIssue.description : 'Customer flagged quality revisit.'}
                      </p>
                    </div>
                    <Badge variant="danger" size="sm">Action Required</Badge>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D5]">
                    <button
                      type="button"
                      onClick={() => {
                        adminReviewQualityIssue(b.id, 'Reviewed and closed with resident satisfaction.');
                        showToast({
                          title: 'Dispute Resolved',
                          message: 'Issue closed and recorded in quality audit.',
                          type: 'success',
                        });
                      }}
                      className="px-3.5 py-1.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Resolve & Close Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#6E8B67] mx-auto mb-2" />
              <strong className="text-xs font-bold text-[#292824] block">No active service disputes.</strong>
              <p className="text-xs text-[#77736B]">Customer satisfaction in {currentSocietyName} is at 98.4%.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: COOPERATIVE FUND */}
      {activeTab === 'fund' && (
        <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#80432E] block">
                5% Society Maintenance Pool
              </span>
              <span className="text-2xl font-extrabold text-[#292824] mt-0.5 block">₹14,850</span>
            </div>
            <Badge variant="coop" size="sm">Local Society Retained Share</Badge>
          </div>

          <p className="text-xs text-[#77736B] leading-relaxed">
            Every completed service booking directly deposits 5% into the {currentSocietyName} resident welfare ledger to maintain common area tool depots, battery charging bays, and coordinator desks.
          </p>
        </div>
      )}

      {/* WORKER PROFILE & KYC REVIEW DRAWER/MODAL */}
      <WorkerProfileModal
        worker={selectedWorkerForProfile}
        isOpen={selectedWorkerForProfile !== null}
        onClose={() => setSelectedWorkerForProfile(null)}
      />

      {/* SOCIETY MANAGER: ADD WORKER MODAL */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        societyId={currentSocietyId}
        societyName={currentSocietyName}
      />

      {/* ENDORSE WORKER TO FEDERATION MODAL */}
      {workerToEndorse && (
        <Modal
          isOpen={workerToEndorse !== null}
          onClose={() => setWorkerToEndorse(null)}
          title={`Endorse ${workerToEndorse.name} to Federation`}
          subtitle="Escalate verified worker credentials to Federation Council for final sign-off"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
              <strong className="text-blue-950 font-bold block">Two-Tier Governance Notice:</strong>
              <p className="text-blue-900 leading-relaxed">
                Endorsing will transition <strong>{workerToEndorse.name}</strong> to{' '}
                <span className="font-bold text-blue-950">MANAGER_VERIFIED</span> status.
                In accordance with cooperative bylaws, the candidate will <strong>NOT</strong> become eligible for AI job dispatch until the Federation Council conducts final regulatory compliance audit and grants full VERIFIED accreditation.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#524E47] block">
                Manager Recommendation / Endorsement Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={endorseNotes}
                onChange={(e) => setEndorseNotes(e.target.value)}
                placeholder="e.g. Conducted in-person trade interview and tools audit. Aadhaar, local address proof, and police clearance verified."
                className="w-full p-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs focus:ring-2 focus:ring-[#6E8B67] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={() => setWorkerToEndorse(null)}
                className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  endorseWorkerByManager(workerToEndorse.id, endorseNotes);
                  setWorkerToEndorse(null);
                  setEndorseNotes('');
                }}
                className="px-5 py-2 bg-[#445D3E] hover:bg-[#33472F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Endorse to Federation</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT WORKER APPLICATION MODAL */}
      {workerToReject && (
        <Modal
          isOpen={workerToReject !== null}
          onClose={() => {
            setWorkerToReject(null);
            setRejectReason('');
          }}
          title={`Reject Application · ${workerToReject.name}`}
          subtitle="Provide reason for rejecting or returning worker verification application"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Manager Rejection Action</strong>
                <span>
                  A rejection reason is required. The applicant and cooperative records will be updated with this feedback so documents can be corrected.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#524E47] block">
                Rejection Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Police verification certificate stamp unreadable; please re-upload clear scanned copy."
                className="w-full p-2.5 bg-white border border-[#E8E2D5] rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={() => {
                  setWorkerToReject(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  if (rejectReason.trim()) {
                    rejectWorkerByManager(workerToReject.id, rejectReason.trim());
                    setWorkerToReject(null);
                    setRejectReason('');
                  }
                }}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DISPATCH / ASSIGN WORKER MODAL (Strictly VERIFIED Workers Only) */}
      {bookingToAssign && (() => {
        // Requirement 8: Only fully VERIFIED workers can be assigned. MANAGER_VERIFIED are excluded!
        const verifiedWorkers = societyWorkers.filter((w) => w.verificationStatus === 'VERIFIED');
        const matchingWorkers = verifiedWorkers.filter(
          (w) =>
            w.skills.some(
              (s) =>
                s.toLowerCase().includes(bookingToAssign.serviceCategory.toLowerCase()) ||
                bookingToAssign.serviceCategory.toLowerCase().includes(s.toLowerCase())
            ) ||
            w.profession?.toLowerCase().includes(bookingToAssign.serviceCategory.toLowerCase()) ||
            w.skills.includes('General Maintenance')
        );
        const otherVerified = verifiedWorkers.filter((w) => !matchingWorkers.some((m) => m.id === w.id));

        return (
          <Modal
            isOpen={bookingToAssign !== null}
            onClose={() => setBookingToAssign(null)}
            title={`Dispatch Tradesperson · Booking #${bookingToAssign.id}`}
            subtitle={`${bookingToAssign.serviceCategory} — ${bookingToAssign.problemType} for ${bookingToAssign.customerName}`}
            maxWidth="lg"
          >
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                <strong className="text-emerald-950 font-bold block">Compliance Dispatch Filter Active:</strong>
                <p className="text-emerald-900 leading-relaxed">
                  Only cooperative workers with full <strong>VERIFIED</strong> status approved by the Federation Council are eligible for customer bookings. Unverified or manager-endorsed applicants awaiting federation review are excluded.
                </p>
              </div>

              {verifiedWorkers.length === 0 ? (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2 text-xs text-amber-950">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                  <strong className="block font-bold">No Federation-Verified Workers in Roster</strong>
                  <p>
                    All workers in this society are either pending verification or awaiting Federation Council review. Only fully VERIFIED workers can be dispatched to customer jobs.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {matchingWorkers.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#445D3E] uppercase tracking-wider block">
                        Matching Trade Specialists ({matchingWorkers.length})
                      </span>
                      {matchingWorkers.map((w) => (
                        <div
                          key={w.id}
                          onClick={() => setSelectedAssignWorkerId(w.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            selectedAssignWorkerId === w.id
                              ? 'bg-[#E6ECE4] border-[#445D3E] shadow-2xs'
                              : 'bg-white border-[#E8E2D5] hover:border-[#CFDDD0]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="assignWorkerRadio"
                              checked={selectedAssignWorkerId === w.id}
                              onChange={() => setSelectedAssignWorkerId(w.id)}
                              className="text-[#445D3E] focus:ring-[#445D3E]"
                            />
                            <div className="w-10 h-10 rounded-xl bg-[#E4EDF4] border border-slate-200 text-[#324F66] flex items-center justify-center font-bold text-sm shrink-0">
                              {(w.name.includes('Priya') ? t('demoUsers.priyaPatel', w.name) : w.name)[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-xs font-bold text-[#292824]">{w.name.includes('Priya') ? t('demoUsers.priyaPatel', w.name) : w.name}</strong>
                                <Badge variant="verified" size="sm">✓ Verified</Badge>
                              </div>
                              <span className="text-[11px] text-[#80432E] font-medium block">
                                {w.skills.join(', ')} · <Star className="w-3 h-3 inline fill-[#B37055] text-[#B37055]" /> {w.rating} ({w.completedJobs} jobs)
                              </span>
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold ${w.availability === 'online' ? 'text-emerald-700' : 'text-slate-500'}`}>
                            ● {w.availability === 'online' ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {otherVerified.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#E8E2D5]">
                      <span className="text-xs font-semibold text-[#77736B] uppercase tracking-wider block">
                        Other Verified Society Tradespeople ({otherVerified.length})
                      </span>
                      {otherVerified.map((w) => (
                        <div
                          key={w.id}
                          onClick={() => setSelectedAssignWorkerId(w.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            selectedAssignWorkerId === w.id
                              ? 'bg-[#E6ECE4] border-[#445D3E] shadow-2xs'
                              : 'bg-white border-[#E8E2D5] hover:border-[#CFDDD0]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="assignWorkerRadio"
                              checked={selectedAssignWorkerId === w.id}
                              onChange={() => setSelectedAssignWorkerId(w.id)}
                              className="text-[#445D3E] focus:ring-[#445D3E]"
                            />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {(w.name.includes('Priya') ? t('demoUsers.priyaPatel', w.name) : w.name)[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-xs font-bold text-[#292824]">{w.name.includes('Priya') ? t('demoUsers.priyaPatel', w.name) : w.name}</strong>
                                <Badge variant="verified" size="sm">✓ Verified</Badge>
                              </div>
                              <span className="text-[11px] text-[#77736B] block">
                                {w.skills.join(', ')} · <Star className="w-3 h-3 inline fill-[#B37055] text-[#B37055]" /> {w.rating}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold ${w.availability === 'online' ? 'text-emerald-700' : 'text-slate-500'}`}>
                            ● {w.availability === 'online' ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setBookingToAssign(null)}
                  className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedAssignWorkerId}
                  onClick={() => {
                    if (selectedAssignWorkerId && bookingToAssign) {
                      assignWorkerToBooking(bookingToAssign.id, selectedAssignWorkerId);
                      showToast({
                        title: 'Worker Dispatched',
                        message: `Booking #${bookingToAssign.id} successfully assigned.`,
                        type: 'success',
                      });
                      setBookingToAssign(null);
                    }
                  }}
                  className="px-5 py-2 bg-[#445D3E] hover:bg-[#33472F] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* ADD SKILL MODAL */}
      {workerToAddSkill && (
        <AddSkillModal
          isOpen={workerToAddSkill !== null}
          onClose={() => setWorkerToAddSkill(null)}
          workerId={workerToAddSkill.id}
          workerName={workerToAddSkill.name}
          onSkillAdded={(skillName) => {
            showToast({
              title: 'Skill Added',
              message: `${skillName} added for ${workerToAddSkill.name}.`,
              type: 'success',
            });
          }}
        />
      )}
    </div>
  );
};
