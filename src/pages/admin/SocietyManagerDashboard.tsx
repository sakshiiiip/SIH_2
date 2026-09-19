import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { Worker } from '../../types';
import { WorkerProfileModal } from '../customer/WorkerProfileModal';
import { SocietyWorkerMap } from '../../components/admin/SocietyWorkerMap';
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
    showToast,
  } = useCooperativeStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'workers' | 'bookings' | 'verification' | 'quality' | 'fund'>('overview');
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<Worker | null>(null);

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
          { key: 'verification', label: `Verification Queue (${pendingWorkers.length})` },
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

            {/* Trade Filters */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {['All', 'Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Appliance Repairs'].map((trade) => (
                <button
                  key={trade}
                  type="button"
                  onClick={() => setSelectedTrade(trade)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedTrade === trade
                      ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8]'
                      : 'bg-[#FCF9F3] text-[#77736B] border border-[#E8E2D5] hover:text-[#292824]'
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>
          </div>

          {/* Workers Grid with Progressive Disclosure */}
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

          {filteredWorkers.length === 0 && (
            <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl text-center text-xs text-[#77736B]">
              No workers matched your search filter.
            </div>
          )}
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
    </div>
  );
};
