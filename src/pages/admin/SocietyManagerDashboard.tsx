import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { Worker } from '../../types';
import { WorkerProfileModal } from '../customer/WorkerProfileModal';
import { SocietyWorkerMap } from '../../components/admin/SocietyWorkerMap';
import { AddWorkerModal } from '../../components/admin/AddWorkerModal';
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
} from 'lucide-react';

interface SocietyManagerDashboardProps {
  onSelectTab?: (tab: string) => void;
}

export const SocietyManagerDashboard: React.FC<SocietyManagerDashboardProps> = () => {
  const {
    currentUser,
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
  } = useCooperativeStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'locations' | 'workers' | 'job_verification' | 'verification' | 'bookings' | 'quality' | 'fund'
  >('overview');
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<Worker | null>(null);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [showCredentialsDesk, setShowCredentialsDesk] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedCredentialId, setCopiedCredentialId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});
  const [revisitDates, setRevisitDates] = useState<Record<string, string>>({});

  const registeredWorkerAccounts = workerAuthService.getRegisteredWorkers();

  // Society-scoped data
  const currentSocietyId = currentUser.societyId || 'soc_green';
  const currentSocietyName = currentUser.societyName || 'Green Residency';
  const managerName = currentUser.name || 'Priya Sharma';

  // Live computed metrics for this society
  const societyWorkers = getWorkersBySociety(currentSocietyId);
  const societyWorkersCount = getSocietyWorkersCount(currentSocietyId);
  const activeJobsCount = getSocietyActiveBookingsCount(currentSocietyId);

  // Society bookings
  const societyBookings = bookings.filter(
    (b) => b.societyId === currentSocietyId || b.societyName === currentSocietyName
  );
  const completedTodayBookings = societyBookings.filter(
    (b) => ['COMPLETED', 'PAID', 'RATED'].includes(b.state)
  );
  const pendingWorkers = societyWorkers.filter(
    (w) => w.verificationStatus === 'PENDING' || w.verificationStatus === 'UNDER_REVIEW' || (w.documents && w.documents.some(d => d.status === 'PENDING'))
  );
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
      w.skills.some((s) => s.toLowerCase().includes(workerSearch.toLowerCase())) ||
      w.phone.includes(workerSearch);
    const matchesTrade = selectedTrade === 'All' || w.skills.includes(selectedTrade) || w.profession === selectedTrade;
    return matchesSearch && matchesTrade;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. HEADER: SOCIETY MANAGER OVERVIEW (MY SOCIETY) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
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
                              {acc.avatar ? (
                                <img
                                  src={acc.avatar}
                                  alt={acc.name}
                                  className="w-8 h-8 rounded-full object-cover border border-[#E8E2D5]"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#FAEDE8] text-[#80432E] flex items-center justify-center font-bold text-xs">
                                  {acc.name[0]}
                                </div>
                              )}
                              <div>
                                <strong className="font-bold text-[#292824] block">{acc.name}</strong>
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
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs font-bold text-[#292824] truncate">{w.name}</strong>
                        <span className="text-[10px] text-[#445D3E] bg-[#E6ECE4] px-1.5 py-0.2 rounded font-bold">
                          ✓
                        </span>
                      </div>
                      <span className="text-[11px] text-[#80432E] font-medium block truncate">
                        {w.skills[0]}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-[#77736B]">
                        <Star className="w-3 h-3 fill-[#B37055] text-[#B37055]" />
                        <span className="font-bold text-[#80432E]">{w.rating}</span>
                        <span>· {w.completedJobs} jobs</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
                    <span className={`text-[10px] font-bold ${w.availability === 'online' ? 'text-[#364A32]' : 'text-[#77736B]'}`}>
                      ● {w.availability === 'online' ? 'Available' : 'Busy'}
                    </span>
                    <span className="text-[11px] font-bold text-[#537895] group-hover:underline flex items-center gap-0.5">
                      <span>KYC ({approvedDocs}/{totalDocs})</span>
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

      {/* TAB: VERIFICATION QUEUE (Sections 13 - 17) */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#80432E]">
                Pending Verification Queue
              </h2>
              <p className="text-xs text-[#77736B] mt-0.5">
                Review worker credentials, address proof, and police clearances for {currentSocietyName}.
              </p>
            </div>
            <span className="text-xs text-[#77736B]">{pendingWorkers.length} Pending</span>
          </div>

          {pendingWorkers.length > 0 ? (
            <div className="space-y-2.5">
              {pendingWorkers.map((w) => {
                const approvedDocs = (w.documents || []).filter((d) => d.status === 'APPROVED').length;
                const totalDocs = (w.documents || []).length;
                return (
                  <div
                    key={w.id}
                    className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-[#E8E2D5]"
                      />
                      <div>
                        <strong className="text-xs font-bold text-[#292824] block">{w.name}</strong>
                        <span className="text-[11px] text-[#77736B]">
                          Trade: <span className="font-semibold text-[#80432E]">{w.skills.join(', ')}</span> · Member ID: {w.cooperativeMemberId}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#80432E] bg-[#FAEDE8] px-2 py-0.5 rounded-md">
                            {approvedDocs} / {totalDocs} Documents Approved
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedWorkerForProfile(w)}
                        className="px-4 py-2 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Documents</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#6E8B67] mx-auto mb-2" />
              <strong className="text-xs font-bold text-[#292824] block">All workers are verified.</strong>
              <p className="text-xs text-[#77736B]">No pending verification or credential submissions in this society.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: BOOKINGS QUEUE */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#80432E]">
              Society Service Requests
            </h2>
            <span className="text-xs text-[#77736B]">{societyBookings.length} Total</span>
          </div>

          <div className="space-y-2">
            {societyBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-[#292824]">{b.serviceCategory} — {b.problemType}</strong>
                    <span className="text-[10px] text-[#77736B]">#{b.id}</span>
                  </div>
                  <span className="text-[11px] text-[#77736B]">
                    Resident: {b.customerName} ({b.customerAddress}) · Worker: {b.matchedWorker ? b.matchedWorker.name : 'Pending Assignment'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={['COMPLETED', 'PAID', 'RATED'].includes(b.state) ? 'completed' : 'pending'} size="sm">
                    {b.state}
                  </Badge>
                  <span className="font-bold text-[#292824]">₹{b.pricing.total}</span>
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
    </div>
  );
};
