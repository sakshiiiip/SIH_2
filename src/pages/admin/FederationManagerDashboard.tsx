import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { SocietyData, Worker, WorkerVerificationStatus, PlatformAuditLog, ManagerActionType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { WorkerProfileModal } from '../customer/WorkerProfileModal';
import { FederationWorkerReviewModal } from '../../components/admin/FederationWorkerReviewModal';
import {
  Network,
  DollarSign,
  Search,
  ChevronRight,
  X,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Camera,
  ImageIcon,
  CheckCircle2,
  RotateCcw,
  Clock,
  Building2,
  Users,
  Filter,
  Award,
  Check,
  AlertTriangle,
  Send,
  Eye,
  Star,
  History,
  Activity,
  UserCheck,
  UserX,
  UserPlus,
  FileText,
  Wrench,
  CheckSquare,
  Calendar,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface FederationManagerDashboardProps {
  onSelectTab?: (tab: string) => void;
}

export const FederationManagerDashboard: React.FC<FederationManagerDashboardProps> = () => {
  const {
    federations,
    societies,
    workers,
    bookings,
    cooperativeFund,
    toolBank,
    config,
    auditLogs,
    updatePlatformConfig,
    updateCooperativeVerification,
    getWorkersBySociety,
    getFederationWorkersCount,
    getFederationActiveJobsCount,
    getSocietyManagersCount,
    showToast,
  } = useCooperativeStore();

  const [matchingWeights, setMatchingWeights] = useState(config.matchingWeights);
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'manager_activity' | 'worker_verification' | 'worker_directory' | 'societies' | 'job_verification' | 'tool_bank' | 'coop_fund' | 'matching'
  >('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedSocietyForDrilldown, setSelectedSocietyForDrilldown] = useState<SocietyData | null>(null);
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<Worker | null>(null);

  // Federation Worker Accreditation Modal State
  const [selectedWorkerForAccreditation, setSelectedWorkerForAccreditation] = useState<Worker | null>(null);

  // Federation Worker Directory filters State
  const [directorySearch, setDirectorySearch] = useState('');
  const [directorySocietyFilter, setDirectorySocietyFilter] = useState('ALL');
  const [directoryTradeFilter, setDirectoryTradeFilter] = useState('ALL');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState('ALL');

  // Manager Activity & Audit filters State
  const [activitySearch, setActivitySearch] = useState('');
  const [activitySocietyFilter, setActivitySocietyFilter] = useState('ALL');
  const [activityActionFilter, setActivityActionFilter] = useState('ALL');

  // Cooperative Society Audit Modal State
  const [societyToAudit, setSocietyToAudit] = useState<SocietyData | null>(null);
  const [auditStatus, setAuditStatus] = useState<'VERIFIED' | 'PENDING_AUDIT' | 'SUSPENDED'>('VERIFIED');
  const [auditNotes, setAuditNotes] = useState('');

  // 1. Manager-verified candidates awaiting Federation approval (across all 8 societies)
  const federationWorkerQueue = workers.filter(
    (w) => w.verificationStatus === 'MANAGER_VERIFIED'
  );

  // Filtered Manager Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const q = activitySearch.toLowerCase();
    const matchesSearch =
      !q ||
      (log.workerName && log.workerName.toLowerCase().includes(q)) ||
      (log.workerId && log.workerId.toLowerCase().includes(q)) ||
      (log.managerName && log.managerName.toLowerCase().includes(q)) ||
      (log.actor && log.actor.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.reason && log.reason.toLowerCase().includes(q)) ||
      (log.notes && log.notes.toLowerCase().includes(q)) ||
      (log.skillName && log.skillName.toLowerCase().includes(q));

    const matchesSociety =
      activitySocietyFilter === 'ALL' ||
      log.societyId === activitySocietyFilter ||
      log.societyName === activitySocietyFilter;

    const matchesAction =
      activityActionFilter === 'ALL' ||
      log.actionType === activityActionFilter ||
      log.action === activityActionFilter;

    return matchesSearch && matchesSociety && matchesAction;
  });

  // 2. All trades available in system for directory filter
  const allTrades = Array.from(
    new Set(workers.flatMap((w) => w.skills).concat(['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Appliance Repairs', 'Painting']))
  ).sort();

  // 3. Unified Directory Workers across all 8 member societies
  const directoryWorkers = workers.filter((w) => {
    const matchesQuery =
      w.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      w.cooperativeMemberId.toLowerCase().includes(directorySearch.toLowerCase()) ||
      w.phone.includes(directorySearch);

    const matchesSociety =
      directorySocietyFilter === 'ALL' ||
      w.societyId === directorySocietyFilter ||
      w.societyName === directorySocietyFilter;

    const matchesTrade =
      directoryTradeFilter === 'ALL' ||
      w.skills.includes(directoryTradeFilter) ||
      w.profession === directoryTradeFilter;

    const matchesStatus =
      directoryStatusFilter === 'ALL' ||
      w.verificationStatus === directoryStatusFilter ||
      (directoryStatusFilter === 'REJECTED' &&
        (w.verificationStatus === 'MANAGER_REJECTED' || w.verificationStatus === 'FEDERATION_REJECTED'));

    return matchesQuery && matchesSociety && matchesTrade && matchesStatus;
  });

  const pendingVerificationJobs = bookings.filter(
    (b) =>
      ['AWAITING_VERIFICATION', 'REVISIT_REQUESTED', 'REVISIT_SCHEDULED'].includes(b.state) ||
      Boolean(b.managerVerification)
  );

  const currentFederation = federations[0] || {
    id: 'fed_mumbai_pune',
    name: 'Maharashtra Community Federation',
    adminName: 'Meera Nambiar',
    region: 'Mumbai - Pune Region',
  };

  const totalHouseholds = societies.reduce((acc, s) => acc + (s.totalHouseholds || 0), 0);
  const totalFederationWorkers = getFederationWorkersCount();
  const totalSocietyManagers = getSocietyManagersCount();
  const activeFederationBookingsCount = getFederationActiveJobsCount();

  const handleSaveWeights = () => {
    updatePlatformConfig({
      ...config,
      matchingWeights,
    });
    showToast({
      title: 'Matching Preferences Saved',
      message: `Algorithm weights re-calibrated across all ${societies.length} member societies.`,
      type: 'success',
    });
  };

  // Filter societies based on search
  const filteredSocieties = societies.filter((s) => {
    const q = globalSearch.toLowerCase();
    const matchesName = s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
    const matchesManager = s.managerName?.toLowerCase().includes(q) || s.coordinatorName?.toLowerCase().includes(q);
    const matchesWorker = workers.some(w => (w.societyId === s.id || w.societyName === s.name) && (w.name.toLowerCase().includes(q) || w.skills.some(sk => sk.toLowerCase().includes(q))));
    return matchesName || matchesManager || matchesWorker;
  });

  // Stationed workers for selected society drill-down
  const drilldownWorkers = selectedSocietyForDrilldown
    ? getWorkersBySociety(selectedSocietyForDrilldown.id)
    : [];

  const renderVerificationBadge = (status: WorkerVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#364A32] bg-[#E6ECE4] px-2.5 py-0.5 rounded-lg border border-[#CFDDD0]">
            <CheckCircle2 className="w-3 h-3 text-[#6E8B67]" />
            <span>✓ Verified</span>
          </span>
        );
      case 'MANAGER_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            <span>Endorsed · Awaiting Federation</span>
          </span>
        );
      case 'MANAGER_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
            <X className="w-3 h-3 text-rose-600" />
            <span>Manager Rejected</span>
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

  const renderCooperativeAuditBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Cooperative Verified</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <X className="w-3 h-3 text-rose-600" />
            <span>Suspended</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Pending Annual Audit</span>
          </span>
        );
    }
  };

  const renderActionTypeBadge = (actionType?: string, action?: string) => {
    const key = actionType || action || 'OTHER';
    switch (key) {
      case 'ADD_WORKER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            <UserPlus className="w-3 h-3 text-emerald-600" />
            <span>New Worker Registered</span>
          </span>
        );
      case 'UPDATE_WORKER_PROFILE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>Worker Profile Updated</span>
          </span>
        );
      case 'SUBMIT_WORKER_KYC':
      case 'UPDATE_WORKER_DOCS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
            <FileCheck className="w-3 h-3 text-indigo-600" />
            <span>Worker Documents Updated</span>
          </span>
        );
      case 'VERIFY_PERSONAL_KYC':
      case 'VERIFY_WORKER_KYC':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Personal KYC Verified</span>
          </span>
        );
      case 'REJECT_WORKER':
      case 'MANAGER_REJECT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
            <UserX className="w-3 h-3 text-rose-600" />
            <span>Worker Rejected by Manager</span>
          </span>
        );
      case 'ADD_WORKER_SKILL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
            <Wrench className="w-3 h-3 text-amber-600" />
            <span>New Skill Added</span>
          </span>
        );
      case 'VERIFY_WORKER_SKILL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
            <CheckSquare className="w-3 h-3 text-teal-600" />
            <span>Worker Skill Verified</span>
          </span>
        );
      case 'ASSIGN_WORKER_JOB':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
            <Calendar className="w-3 h-3 text-purple-600" />
            <span>Worker Assigned to Job</span>
          </span>
        );
      case 'CHANGE_WORKER_STATUS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            <RotateCcw className="w-3 h-3 text-slate-600" />
            <span>Worker Status Changed</span>
          </span>
        );
      case 'DEACTIVATE_WORKER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Worker Deactivated</span>
          </span>
        );
      case 'MANAGER_ENDORSE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
            <Award className="w-3 h-3 text-purple-600" />
            <span>Manager Endorsed to Federation</span>
          </span>
        );
      case 'FEDERATION_APPROVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Federation Accreditation Granted</span>
          </span>
        );
      case 'FEDERATION_REJECT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Federation Returned / Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            <Activity className="w-3 h-3 text-slate-500" />
            <span>{key.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. HEADER: FEDERATION ADMIN OVERVIEW */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEBF4] border border-[#DFD8E8] flex items-center justify-center text-[#504161] shadow-xs">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EFEBF4] text-[#504161] border border-[#DFD8E8]">
                Federation Admin
              </span>
              <span className="text-xs text-[#77736B]">{currentFederation.adminName || 'Meera Nambiar'}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#292824] tracking-tight leading-tight mt-0.5">
              {currentFederation.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#504161] bg-[#EFEBF4] border border-[#DFD8E8] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Regional Governance ({currentFederation.region || 'Maharashtra'})</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW: "MY FEDERATION" LIVE COUNTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveSubTab('societies')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Societies</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{societies.length}</span>
          <span className="text-[10px] text-[#504161] font-semibold">Federated Units</span>
        </div>

        <div
          onClick={() => setActiveSubTab('societies')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Society Managers</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{totalSocietyManagers}</span>
          <span className="text-[10px] text-[#80432E] font-semibold">Local Desks</span>
        </div>

        <div
          onClick={() => setActiveSubTab('worker_verification')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#504161] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Accreditation Queue</span>
          <span className={`text-2xl font-bold font-mono block mt-1 tracking-tight ${federationWorkerQueue.length > 0 ? 'text-[#504161]' : 'text-[#292824]'}`}>
            {federationWorkerQueue.length}
          </span>
          <span className="text-[10px] text-[#504161] font-semibold">Awaiting Approval</span>
        </div>

        <div
          onClick={() => setActiveSubTab('worker_directory')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Total Workforce</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{workers.length}</span>
          <span className="text-[10px] text-[#537895] font-semibold">
            {workers.filter((w) => w.verificationStatus === 'VERIFIED').length} Verified
          </span>
        </div>

        <div
          onClick={() => setActiveSubTab('job_verification')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Active Jobs</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{activeFederationBookingsCount}</span>
          <span className="text-[10px] text-[#6E8B67] font-semibold">Cross-Society</span>
        </div>

        <div
          onClick={() => setActiveSubTab('coop_fund')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Coop Fund</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">₹{cooperativeFund.balance.toLocaleString()}</span>
          <span className="text-[10px] text-[#6E8B67] font-semibold">25% Central Pool</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 3. WORKSPACE SUB-TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1 border-b border-[#E8E2D5] overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'manager_activity', label: `Manager Activity & Audit (${auditLogs.length})` },
          { key: 'worker_verification', label: `Worker Verification Queue (${federationWorkerQueue.length})` },
          { key: 'worker_directory', label: `Worker Directory (${workers.length})` },
          { key: 'societies', label: `Member Societies & Audit (${societies.length})` },
          { key: 'job_verification', label: `Job Review Queue (${pendingVerificationJobs.length})` },
          { key: 'matching', label: 'Matching Preferences' },
          { key: 'coop_fund', label: 'Cooperative Fund' },
          { key: 'tool_bank', label: `Shared Assets (${toolBank.length})` },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveSubTab(t.key as any)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === t.key
                ? 'bg-[#EFEBF4] text-[#504161] border border-[#DFD8E8] shadow-2xs font-extrabold'
                : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. SUB-TAB CONTENT */}
      {/* ========================================================================= */}

      {/* SUB-TAB: MANAGER ACTIVITY & AUDIT TRAIL */}
      {activeSubTab === 'manager_activity' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#504161]" />
                <h2 className="text-base font-extrabold text-[#292824] tracking-tight">
                  Society Manager Activity & Audit Trail
                </h2>
              </div>
              <p className="text-xs text-[#77736B] mt-0.5">
                Real-time visibility and central audit trail of worker registrations, document checks, skill updates, and dispatch actions across all 8 member societies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-[#EFEBF4] text-[#504161] rounded-xl border border-[#DFD8E8]">
                {filteredAuditLogs.length} Logged Actions
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">New Registrations</span>
              <span className="text-xl font-bold font-mono text-emerald-900 block mt-0.5">
                {auditLogs.filter((l) => l.actionType === 'ADD_WORKER' || l.action === 'ADD_WORKER').length}
              </span>
              <span className="text-[10px] text-emerald-700">Workers enrolled</span>
            </div>
            <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">KYC & Skill Checks</span>
              <span className="text-xl font-bold font-mono text-teal-900 block mt-0.5">
                {auditLogs.filter((l) => ['VERIFY_PERSONAL_KYC', 'VERIFY_WORKER_SKILL', 'UPDATE_WORKER_DOCS'].includes(l.actionType || l.action)).length}
              </span>
              <span className="text-[10px] text-teal-700">Verified by local managers</span>
            </div>
            <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">Manager Endorsements</span>
              <span className="text-xl font-bold font-mono text-purple-900 block mt-0.5">
                {auditLogs.filter((l) => l.actionType === 'MANAGER_ENDORSE' || l.action === 'MANAGER_ENDORSE').length}
              </span>
              <span className="text-[10px] text-purple-700">Escalated to Federation</span>
            </div>
            <div className="p-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">Manager Rejections</span>
              <span className="text-xl font-bold font-mono text-rose-900 block mt-0.5">
                {auditLogs.filter((l) => l.actionType === 'REJECT_WORKER' || l.action === 'MANAGER_REJECT').length}
              </span>
              <span className="text-[10px] text-rose-700">Returned with reasons</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by worker name, worker ID, manager, or keyword..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Society Filter */}
              <select
                value={activitySocietyFilter}
                onChange={(e) => setActivitySocietyFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              >
                <option value="ALL">All Member Societies</option>
                {societies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>

              {/* Action Type Filter */}
              <select
                value={activityActionFilter}
                onChange={(e) => setActivityActionFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              >
                <option value="ALL">All Action Types</option>
                <option value="ADD_WORKER">New Worker Registered</option>
                <option value="UPDATE_WORKER_PROFILE">Worker Profile Updated</option>
                <option value="UPDATE_WORKER_DOCS">Worker Documents Updated</option>
                <option value="VERIFY_PERSONAL_KYC">Personal KYC Verified</option>
                <option value="ADD_WORKER_SKILL">New Skill Added</option>
                <option value="VERIFY_WORKER_SKILL">Worker Skill Verified</option>
                <option value="MANAGER_ENDORSE">Manager Endorsed</option>
                <option value="REJECT_WORKER">Worker Rejected by Manager</option>
                <option value="ASSIGN_WORKER_JOB">Worker Assigned to Job</option>
                <option value="CHANGE_WORKER_STATUS">Worker Status Changed</option>
                <option value="DEACTIVATE_WORKER">Worker Deactivated</option>
              </select>

              {(activitySearch || activitySocietyFilter !== 'ALL' || activityActionFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setActivitySearch('');
                    setActivitySocietyFilter('ALL');
                    setActivityActionFilter('ALL');
                  }}
                  className="px-3 py-1.5 text-xs text-[#77736B] hover:text-[#292824] bg-white border border-[#E8E2D5] rounded-xl font-medium cursor-pointer transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Activity Cards List */}
          {filteredAuditLogs.length === 0 ? (
            <div className="p-10 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EEE4] text-[#77736B] flex items-center justify-center mx-auto border border-[#E8E2D5]">
                <Filter className="w-6 h-6 text-[#77736B]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#292824]">
                  No manager activities match your filters
                </h3>
                <p className="text-xs text-[#77736B] max-w-md mx-auto mt-1">
                  Try adjusting your search terms or clearing the selected society or action type filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAuditLogs.map((log) => {
                const targetWorker = log.workerId ? workers.find((w) => w.id === log.workerId) : undefined;
                return (
                  <div
                    key={log.id}
                    className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#504161] rounded-2xl shadow-card transition-all space-y-3"
                  >
                    {/* Top Row: Action Badge, Timestamp, Society */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renderActionTypeBadge(log.actionType, log.action)}
                        <span className="text-[10px] font-mono text-[#77736B]">#{log.id}</span>
                        {log.societyName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#504161] bg-[#EFEBF4] px-2 py-0.5 rounded-md border border-[#DFD8E8]">
                            <Building2 className="w-3 h-3" />
                            {log.societyName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#77736B]">
                        <Clock className="w-3.5 h-3.5 text-[#9A958B]" />
                        <span>{log.timestamp}</span>
                      </div>
                    </div>

                    {/* Middle Row: Worker & Manager Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Worker Details */}
                      {log.workerName && (
                        <div className="p-3 bg-white border border-[#E8E2D5] rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {targetWorker?.avatar ? (
                              <img
                                src={targetWorker.avatar}
                                alt={log.workerName}
                                className="w-9 h-9 rounded-full object-cover border border-[#E8E2D5] shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#EFEBF4] border border-[#DFD8E8] flex items-center justify-center text-xs font-bold text-[#504161] shrink-0">
                                {log.workerName.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="text-[10px] text-[#77736B] block">Target Worker:</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <strong className="text-xs font-bold text-[#292824] truncate">
                                  {log.workerName}
                                </strong>
                                {log.workerId && (
                                  <span className="text-[10px] font-mono text-[#77736B]">
                                    ({log.workerId})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {targetWorker && (
                            <button
                              type="button"
                              onClick={() => setSelectedWorkerForProfile(targetWorker)}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#504161] hover:text-white bg-[#EFEBF4] hover:bg-[#504161] rounded-lg border border-[#DFD8E8] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Profile</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Manager & Actor Details */}
                      <div className="p-3 bg-white border border-[#E8E2D5] rounded-xl flex flex-col justify-center">
                        <span className="text-[10px] text-[#77736B] block">Action Initiator:</span>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <strong className="text-xs font-bold text-[#80432E]">
                            {log.managerName || log.actor}
                          </strong>
                          <span className="text-[10px] text-[#77736B] font-mono">
                            IP: {log.ipAddress}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Transitions & Details */}
                    <div className="space-y-2 pt-1 border-t border-[#E8E2D5]">
                      <p className="text-xs text-[#292824] font-medium leading-relaxed">
                        {log.details}
                      </p>

                      {/* Status Transition Badges if applicable */}
                      {(log.previousStatus || log.newStatus) && (
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#77736B] bg-white p-2 rounded-lg border border-[#E8E2D5]">
                          <span className="font-semibold text-[#524E47]">Status Transition:</span>
                          {log.previousStatus && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                              {log.previousStatus}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-[#9A958B]" />
                          {log.newStatus && (
                            <span className="px-2 py-0.5 rounded bg-[#E6ECE4] text-[#364A32] font-mono text-[10px] font-bold">
                              {log.newStatus}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rejection Reason Alert Box */}
                      {log.reason && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Rejection / Return Rationale: </strong>
                            <span>"{log.reason}"</span>
                          </div>
                        </div>
                      )}

                      {/* Notes Callout */}
                      {log.notes && !log.reason && (
                        <div className="p-2.5 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47]">
                          <strong>Manager Notes: </strong>
                          <span>"{log.notes}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: SOCIETIES DRILL-DOWN (FEDERATION -> SOCIETY -> MANAGER -> WORKERS) */}
      {(activeSubTab === 'overview' || activeSubTab === 'societies') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search society, manager, or worker..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              />
            </div>
            <span className="text-xs text-[#77736B]">Click any society for detailed workforce roster</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredSocieties.map((soc) => {
              const socWorkers = getWorkersBySociety(soc.id);
              const verifiedSocWorkers = socWorkers.filter((w) => w.verificationStatus === 'VERIFIED').length;
              return (
                <div
                  key={soc.id}
                  onClick={() => setSelectedSocietyForDrilldown(soc)}
                  className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#504161] rounded-2xl shadow-card transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#504161] bg-[#EFEBF4] px-2 py-0.5 rounded-md">
                        {soc.code}
                      </span>
                      {renderCooperativeAuditBadge(soc.cooperativeVerificationStatus)}
                    </div>
                    <h3 className="font-extrabold text-xs text-[#292824] group-hover:text-[#504161]">
                      {soc.name}
                    </h3>
                    <p className="text-[11px] text-[#77736B] mt-0.5">
                      Manager: <strong className="text-[#80432E]">{soc.managerName || soc.coordinatorName}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8E2D5] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#77736B]">
                      <span><strong className="text-[#292824]">{socWorkers.length}</strong> Workers ({verifiedSocWorkers} Verified)</span>
                      <span className="text-[#6E8B67] font-semibold">{soc.totalHouseholds} Homes</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#E8E2D5]/50">
                      <span className="text-[10px] text-[#77736B]">Click to view roster</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSocietyToAudit(soc);
                          setAuditStatus(soc.cooperativeVerificationStatus || 'VERIFIED');
                          setAuditNotes('');
                        }}
                        className="px-2.5 py-0.5 bg-[#EFEBF4] hover:bg-[#504161] text-[#504161] hover:text-white rounded-md text-[10px] font-bold transition-colors cursor-pointer border border-[#DFD8E8]"
                      >
                        Audit Society
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overview Recent Activity Snapshot */}
          {activeSubTab === 'overview' && (
            <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl space-y-3.5 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#504161]" />
                  <h3 className="text-sm font-extrabold text-[#292824]">
                    Recent Society Manager Actions
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('manager_activity')}
                  className="text-xs font-bold text-[#504161] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Manager Activity ({auditLogs.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white rounded-xl border border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {renderActionTypeBadge(log.actionType, log.action)}
                      <span className="font-semibold text-[#292824] truncate">
                        {log.details}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#77736B] shrink-0">
                      <span className="text-[#80432E] font-medium">{log.managerName || log.actor}</span>
                      <span>{log.timestamp.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: FEDERATION WORKER ACCREDITATION QUEUE */}
      {activeSubTab === 'worker_verification' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#504161]" />
                <h2 className="text-base font-extrabold text-[#292824] tracking-tight">
                  Federation Worker Accreditation Queue
                </h2>
              </div>
              <p className="text-xs text-[#77736B] mt-0.5">
                Central regulatory review for candidates endorsed by Society Managers across all 8 member societies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-[#EFEBF4] text-[#504161] rounded-xl border border-[#DFD8E8]">
                {federationWorkerQueue.length} Awaiting Central Accreditation
              </span>
            </div>
          </div>

          {federationWorkerQueue.length === 0 ? (
            <div className="p-10 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E6ECE4] text-[#364A32] flex items-center justify-center mx-auto border border-[#CFDDD0]">
                <CheckCircle2 className="w-6 h-6 text-[#6E8B67]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#292824]">
                  Queue Cleared — Zero Endorsed Workers Awaiting Accreditation
                </h3>
                <p className="text-xs text-[#77736B] max-w-md mx-auto mt-1">
                  When a local Society Manager reviews and endorses a worker from their local society dashboard, the candidate will appear here for Federation Council credential audit and final accreditation.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {federationWorkerQueue.map((w) => {
                const approvedDocs = (w.documents || []).filter((d) => d.status === 'APPROVED').length;
                const totalDocs = (w.documents || []).length || 5;

                return (
                  <div
                    key={w.id}
                    className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#504161] rounded-2xl shadow-card transition-all space-y-3.5"
                  >
                    {/* Top: Avatar, Name, Society */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.avatar}
                          alt={w.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#E8E2D5] shadow-2xs shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-extrabold text-[#292824]">{w.name}</h3>
                            <span className="text-[10px] font-mono text-[#77736B]">#{w.cooperativeMemberId}</span>
                          </div>
                          <span className="text-xs text-[#537895] font-semibold block">{w.skills.join(' · ')}</span>
                          <div className="flex items-center gap-1 text-[11px] text-[#77736B] mt-0.5">
                            <Building2 className="w-3 h-3 text-[#504161]" />
                            <span>{w.societyName}</span>
                          </div>
                        </div>
                      </div>
                      {renderVerificationBadge(w.verificationStatus)}
                    </div>

                    {/* Manager Endorsement Audit Box */}
                    <div className="p-3 bg-[#EFEBF4]/60 border border-[#DFD8E8] rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#504161] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#504161]" />
                          Endorsed by Society Manager
                        </span>
                        <span className="text-[10px] text-[#77736B]">
                          {w.managerVerification?.verifiedAt || 'Recent'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#524E47] italic">
                        "{w.managerVerification?.notes || 'Local manager reviewed worker identity, trade competence, and KYC documents.'}"
                      </p>
                      <div className="text-[10px] text-[#77736B] pt-1 border-t border-[#DFD8E8]/60 flex items-center justify-between">
                        <span>Sign-off: <strong>{w.managerVerification?.verifiedBy || 'Society Manager'}</strong></span>
                        <span className="font-semibold text-blue-900">{approvedDocs}/{totalDocs} KYC Documents Approved</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E8E2D5]">
                      <button
                        type="button"
                        onClick={() => setSelectedWorkerForProfile(w)}
                        className="px-3 py-1.5 bg-white hover:bg-[#F3EEE4] text-[#292824] rounded-xl text-xs font-semibold border border-[#E8E2D5] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#77736B]" />
                        <span>Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedWorkerForAccreditation(w)}
                        className="px-4 py-1.5 bg-[#504161] hover:bg-[#3e324c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Accreditation Review</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: FEDERATION-WIDE WORKER DIRECTORY */}
      {activeSubTab === 'worker_directory' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#504161]" />
                <h2 className="text-base font-extrabold text-[#292824] tracking-tight">
                  Federation Worker Directory
                </h2>
              </div>
              <p className="text-xs text-[#77736B] mt-0.5">
                Centralized registry of all {workers.length} tradespersons across the 8 member societies.
              </p>
            </div>
            <span className="text-xs font-bold text-[#504161] bg-[#EFEBF4] px-3 py-1 rounded-xl border border-[#DFD8E8]">
              {directoryWorkers.length} Workers Filtered
            </span>
          </div>

          {/* Filter Bar */}
          <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, ID, phone..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              />
            </div>

            {/* Society Filter */}
            <div>
              <select
                value={directorySocietyFilter}
                onChange={(e) => setDirectorySocietyFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              >
                <option value="ALL">All 8 Member Societies</option>
                {societies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Trade Filter */}
            <div>
              <select
                value={directoryTradeFilter}
                onChange={(e) => setDirectoryTradeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              >
                <option value="ALL">All Trades & Skills</option>
                {allTrades.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={directoryStatusFilter}
                onChange={(e) => setDirectoryStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#504161]"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="VERIFIED">✓ Fully Verified ({workers.filter(w => w.verificationStatus === 'VERIFIED').length})</option>
                <option value="MANAGER_VERIFIED">⏳ Endorsed · Awaiting Fed. ({workers.filter(w => w.verificationStatus === 'MANAGER_VERIFIED').length})</option>
                <option value="PENDING">Pending Manager Review ({workers.filter(w => w.verificationStatus === 'PENDING' || w.verificationStatus === 'UNDER_REVIEW').length})</option>
                <option value="REJECTED">Rejected ({workers.filter(w => w.verificationStatus === 'MANAGER_REJECTED' || w.verificationStatus === 'FEDERATION_REJECTED').length})</option>
              </select>
            </div>
          </div>

          {/* Directory Worker Grid */}
          {directoryWorkers.length === 0 ? (
            <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-2">
              <Filter className="w-6 h-6 text-[#9A958B] mx-auto" />
              <p className="text-xs font-bold text-[#292824]">No workers match the selected criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setDirectorySearch('');
                  setDirectorySocietyFilter('ALL');
                  setDirectoryTradeFilter('ALL');
                  setDirectoryStatusFilter('ALL');
                }}
                className="text-xs text-[#504161] hover:underline font-semibold"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {directoryWorkers.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl shadow-card space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={w.avatar}
                          alt={w.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E8E2D5] shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-[#292824] truncate">{w.name}</h4>
                          <span className="text-[10px] font-mono text-[#77736B] block">#{w.cooperativeMemberId}</span>
                        </div>
                      </div>
                      {renderVerificationBadge(w.verificationStatus)}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#504161] font-medium">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{w.societyName}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {w.skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-white text-[10px] font-semibold text-[#524E47] border border-[#E8E2D5]">
                          {s}
                        </span>
                      ))}
                      {w.skills.length > 3 && (
                        <span className="text-[10px] text-[#77736B] self-center">+{w.skills.length - 3}</span>
                      )}
                    </div>

                    {w.rejectionReason && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800">
                        <strong>Rejection: </strong>{w.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-[#77736B]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-[#292824]">{w.rating || 4.8}</span>
                      <span>({w.completedJobs || 0} jobs)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {w.verificationStatus === 'MANAGER_VERIFIED' && (
                        <button
                          type="button"
                          onClick={() => setSelectedWorkerForAccreditation(w)}
                          className="px-2.5 py-1 bg-[#504161] hover:bg-[#3e324c] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Accredit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedWorkerForProfile(w)}
                        className="px-2.5 py-1 bg-white hover:bg-[#F3EEE4] text-[#292824] text-[10px] font-semibold rounded-lg border border-[#E8E2D5] transition-colors cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: MATCHING PREFERENCES */}
      {activeSubTab === 'matching' && (
        <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#504161]">
              Matching Preferences & Fair Allocation
            </h2>
            <p className="text-xs text-[#77736B] mt-0.5">
              Tune cooperative dispatch weights across all 8 member societies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'skillCompatibility' as const, label: 'Skill Compatibility Weight', val: matchingWeights.skillCompatibility },
              { key: 'proficiency' as const, label: 'Worker Proficiency Weight', val: matchingWeights.proficiency },
              { key: 'distance' as const, label: 'Proximity / Distance Weight', val: matchingWeights.distance },
              { key: 'availability' as const, label: 'Availability Weight', val: matchingWeights.availability },
              { key: 'workloadBalance' as const, label: 'Workload Balance (Fair Allocation)', val: matchingWeights.workloadBalance },
            ].map((param) => (
              <div key={param.key} className="p-3 bg-white rounded-xl border border-[#E8E2D5] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#292824]">{param.label}</span>
                  <span className="font-mono text-xs text-[#504161] font-bold">{param.val}</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  value={param.val}
                  onChange={(e) =>
                    setMatchingWeights({
                      ...matchingWeights,
                      [param.key]: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#504161]"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveWeights}
              className="px-5 py-2.5 bg-[#7A6A8E] hover:bg-[#655577] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Matching Preferences
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB: COOPERATIVE FUND */}
      {activeSubTab === 'coop_fund' && (
        <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#504161] block">
                25% Central Cooperative Reserve Fund
              </span>
              <span className="text-2xl font-extrabold text-[#292824] mt-0.5 block">
                ₹{cooperativeFund.balance.toLocaleString()}
              </span>
            </div>
            <Badge variant="coop" size="sm">Federation Solidarity Ledger</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#E8E2D5]">
              <span className="text-[10px] text-[#77736B] block">Emergency Aid Allocated</span>
              <strong className="text-sm font-bold text-[#80432E]">₹{cooperativeFund.emergencyAidAllocated.toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E8E2D5]">
              <span className="text-[10px] text-[#77736B] block">Tool Bank Procurement</span>
              <strong className="text-sm font-bold text-[#537895]">₹{cooperativeFund.toolBankAllocated.toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E8E2D5]">
              <span className="text-[10px] text-[#77736B] block">Worker Training Programs</span>
              <strong className="text-sm font-bold text-[#6E8B67]">₹{cooperativeFund.trainingAllocated.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: SHARED ASSETS TOOL BANK */}
      {activeSubTab === 'tool_bank' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#504161]">
              Federation Tool Bank Assets ({toolBank.length})
            </h2>
            <span className="text-xs text-[#77736B]">Zero-cost Shared Machinery</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {toolBank.map((t) => (
              <div key={t.id} className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-[#292824]">{t.name}</strong>
                  <Badge variant={t.status === 'available' ? 'verified' : 'pending'} size="sm">
                    {t.status}
                  </Badge>
                </div>
                <span className="text-[11px] text-[#77736B] block">SN: {t.serialNumber} · {t.category}</span>
                {t.borrowedByWorkerName && (
                  <span className="text-[10px] text-[#80432E] font-semibold block">
                    Issued to {t.borrowedByWorkerName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: REGIONAL JOB VERIFICATION QUEUE (Cross-Society Oversight) */}
      {activeSubTab === 'job_verification' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E2D5]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#504161] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#6E8B67]" />
                Regional Job Verification & Quality Audit
              </h2>
              <p className="text-xs text-[#77736B] mt-0.5">
                Federation-wide oversight of work completion evidence, before/after photo records, and society manager approvals.
              </p>
            </div>
            <span className="text-xs font-bold bg-[#EFEBF4] text-[#504161] border border-[#DFD8E8] px-3 py-1 rounded-xl">
              {pendingVerificationJobs.length} Active Records
            </span>
          </div>

          {/* Quick status counter summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">Pending Manager Sign-off</span>
              <span className="text-xl font-bold font-mono text-blue-900 block mt-0.5">
                {bookings.filter((b) => b.state === 'AWAITING_VERIFICATION').length}
              </span>
              <span className="text-[10px] text-blue-700">Awaiting local manager review</span>
            </div>
            <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">Revisit Queue</span>
              <span className="text-xl font-bold font-mono text-amber-900 block mt-0.5">
                {bookings.filter((b) => ['REVISIT_REQUESTED', 'REVISIT_SCHEDULED'].includes(b.state)).length}
              </span>
              <span className="text-[10px] text-amber-700">Resident or manager flagged</span>
            </div>
            <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">Manager Approved Total</span>
              <span className="text-xl font-bold font-mono text-[#445D3E] block mt-0.5">
                {bookings.filter((b) => b.managerVerification?.status === 'APPROVED').length}
              </span>
              <span className="text-[10px] text-[#6E8B67]">Zero-dispute approved jobs</span>
            </div>
          </div>

          {/* Verification Items List */}
          {pendingVerificationJobs.length === 0 ? (
            <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#6E8B67] mx-auto mb-1" />
              <strong className="text-xs font-bold text-[#292824] block">All regional jobs cleared.</strong>
              <p className="text-xs text-[#77736B]">No jobs pending verification or revisit across member societies.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingVerificationJobs.map((b) => (
                <div
                  key={b.id}
                  className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl shadow-card space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-[#504161] bg-[#EFEBF4] px-2 py-0.5 rounded-md">
                          {b.societyName}
                        </span>
                        <Badge
                          variant={
                            b.state === 'AWAITING_VERIFICATION'
                              ? 'coop'
                              : b.state === 'CANCELLED'
                              ? 'danger'
                              : 'urgent'
                          }
                          size="sm"
                        >
                          {b.state}
                        </Badge>
                        <span className="text-[10px] font-mono text-[#77736B]">#{b.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#292824]">
                        {b.serviceCategory} — {b.problemType}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-[#445D3E] block">
                        ₹{b.pricing.total}
                      </span>
                      <span className="text-[10px] text-[#77736B]">
                        Worker Share: ₹{b.pricing.workerShare}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#524E47]">
                    <div>
                      <span className="text-[10px] text-[#77736B] block">Resident:</span>
                      <strong>{b.customerName}</strong> ({b.customerAddress})
                    </div>
                    <div>
                      <span className="text-[10px] text-[#77736B] block">Worker:</span>
                      <strong>{b.matchedWorker?.name || 'Assigned Worker'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#77736B] block">Resident Confirmation:</span>
                      <span className={b.customerConfirmation ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                        {b.customerConfirmation ? '✓ Confirmed by Resident' : 'Pending Confirmation'}
                      </span>
                    </div>
                  </div>

                  {/* Photo Proof Evidence Comparison */}
                  {(b.beforeImage || b.afterImage || (b.workPhotos && b.workPhotos.length > 0)) && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 shrink-0">
                        <Camera className="w-3.5 h-3.5 text-[#6E8B67]" />
                        Photo Evidence:
                      </span>
                      <div className="flex items-center gap-2">
                        {b.beforeImage ? (
                          <div className="relative group">
                            <img
                              src={b.beforeImage}
                              alt="Before"
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center rounded-b-lg">
                              Before
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No Before Photo</span>
                        )}
                        {(b.afterImage || (b.workPhotos && b.workPhotos[0])) ? (
                          <div className="relative group">
                            <img
                              src={b.afterImage || (b.workPhotos && b.workPhotos[0])}
                              alt="After"
                              className="w-14 h-14 object-cover rounded-lg border border-[#6E8B67]"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-[#445D3E] text-white text-[8px] text-center rounded-b-lg">
                              After ✓
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No After Photo</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manager verification record if already reviewed */}
                  {b.managerVerification && (
                    <div className="p-2.5 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl text-xs text-[#524E47] flex items-center justify-between">
                      <div>
                        <strong>Manager Verification: </strong>
                        <span className="font-semibold text-[#80432E]">{b.managerVerification.status}</span>
                        {b.managerVerification.notes && <span> — "{b.managerVerification.notes}"</span>}
                      </div>
                      <span className="text-[10px] text-[#77736B]">By: {b.managerVerification.verifiedBy}</span>
                    </div>
                  )}

                  {/* Revisit details */}
                  {b.revisitDetails && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <strong>Revisit Request: </strong>
                      <span>"{b.revisitDetails.reason}"</span>
                      {b.revisitDetails.scheduledDate && (
                        <span className="ml-2 font-bold text-amber-800">
                          (Scheduled: {b.revisitDetails.scheduledDate})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROGRESSIVE DRILL-DOWN MODAL FOR SELECTED SOCIETY */}
      {/* ========================================================================= */}
      {selectedSocietyForDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292824]/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#FCF9F3] border border-[#E8E2D5] rounded-[28px] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E2D5]">
              <div>
                <span className="text-[10px] font-bold text-[#504161] bg-[#EFEBF4] px-2 py-0.5 rounded-md">
                  {selectedSocietyForDrilldown.code}
                </span>
                <h3 className="text-lg font-black text-[#292824] mt-1">
                  {selectedSocietyForDrilldown.name}
                </h3>
                <p className="text-xs text-[#77736B] mt-0.5">
                  Society Manager: <strong className="text-[#80432E]">{selectedSocietyForDrilldown.managerName || selectedSocietyForDrilldown.coordinatorName}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedSocietyForDrilldown(null)}
                className="p-1.5 rounded-xl text-[#77736B] hover:text-[#292824] hover:bg-[#E8E2D5]/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workers in this Society */}
            <div className="space-y-2 overflow-y-auto pr-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#504161] block">
                Stationed Workforce ({drilldownWorkers.length})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {drilldownWorkers.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorkerForProfile(w)}
                    className="p-3 bg-white rounded-xl border border-[#E8E2D5] hover:border-[#CFDDD0] flex items-center justify-between gap-2.5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#E8E2D5] shrink-0"
                      />
                      <div className="min-w-0">
                        <strong className="text-xs font-bold text-[#292824] truncate block">
                          {w.name}
                        </strong>
                        <span className="text-[11px] text-[#537895] font-medium truncate block">
                          {w.skills[0]}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9A958B] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WORKER PROFILE MODAL */}
      <WorkerProfileModal
        worker={selectedWorkerForProfile}
        isOpen={selectedWorkerForProfile !== null}
        onClose={() => setSelectedWorkerForProfile(null)}
      />

      {/* FEDERATION WORKER ACCREDITATION REVIEW MODAL */}
      <FederationWorkerReviewModal
        worker={selectedWorkerForAccreditation}
        isOpen={selectedWorkerForAccreditation !== null}
        onClose={() => setSelectedWorkerForAccreditation(null)}
      />

      {/* MEMBER SOCIETY AUDIT MODAL */}
      {societyToAudit && (
        <Modal
          isOpen={societyToAudit !== null}
          onClose={() => setSocietyToAudit(null)}
          title={
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#504161]" />
              <span>Audit Cooperative: {societyToAudit.name}</span>
            </div>
          }
          subtitle={`Code: ${societyToAudit.code} · Manager: ${societyToAudit.managerName || societyToAudit.coordinatorName || 'Assigned Manager'}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#E8E2D5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Current Accreditation:</span>
                {renderCooperativeAuditBadge(societyToAudit.cooperativeVerificationStatus)}
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Households:</span>
                <strong className="text-slate-900">{societyToAudit.totalHouseholds}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Stationed Workforce:</span>
                <strong className="text-slate-900">{getWorkersBySociety(societyToAudit.id).length} workers</strong>
              </div>
              {societyToAudit.verifiedAt && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Last Audit:</span>
                  <span>{societyToAudit.verifiedAt} by {societyToAudit.verifiedBy || 'Federation Council'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Accreditation & Audit Status
              </label>
              <select
                value={auditStatus}
                onChange={(e) => setAuditStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#504161]"
              >
                <option value="VERIFIED">✓ VERIFIED — Cooperative in Full Regulatory Compliance</option>
                <option value="PENDING_AUDIT">⏳ PENDING_AUDIT — Annual Cooperative Audit Due</option>
                <option value="SUSPENDED">⚠ SUSPENDED — Operations Temporarily Paused</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Audit Findings / Regulatory Notes
              </label>
              <textarea
                rows={3}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Enter compliance observations, AGM minutes check, or license review notes..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#504161] placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={() => setSocietyToAudit(null)}
                className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (societyToAudit) {
                    updateCooperativeVerification(societyToAudit.id, auditStatus, auditNotes);
                    setSocietyToAudit(null);
                  }
                }}
                className="px-4 py-2 bg-[#504161] hover:bg-[#3f334d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Save Audit Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
