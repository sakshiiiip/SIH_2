import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { FederationApplication } from '../../types';
import { PlatformFederationReviewModal } from '../../components/admin/PlatformFederationReviewModal';
import {
  Building2,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  Layers,
  Users,
  Eye,
  Sliders,
  History,
} from 'lucide-react';

export const PlatformAdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentUser,
    federationApplications,
    federations,
    societies,
    workers,
    auditLogs,
    config,
    updatePlatformWeights,
    updateRevenueSplit,
    showToast,
  } = useCooperativeStore();

  const [activeTab, setActiveTab] = useState<'applications' | 'federations' | 'audit' | 'system_config'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_VERIFICATION' | 'CHANGES_REQUIRED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<FederationApplication | null>(null);

  // System config state
  const [weights, setWeights] = useState(config.matchingWeights);
  const [workerSplit, setWorkerSplit] = useState(config.workerSharePercent);
  const [societySplit, setSocietySplit] = useState(config.societySharePercent);
  const [fundSplit, setFundSplit] = useState(config.cooperativeFundPercent);

  // Filtered Applications
  const filteredApplications = federationApplications.filter((app) => {
    const matchesSearch =
      app.federationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.authorizedPersonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = federationApplications.filter((a) => a.status === 'PENDING_VERIFICATION').length;
  const changesCount = federationApplications.filter((a) => a.status === 'CHANGES_REQUIRED').length;
  const approvedCount = federationApplications.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = federationApplications.filter((a) => a.status === 'REJECTED').length;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      showToast({
        title: 'Invalid Weights Sum',
        message: `Total weights must equal 100% (currently ${sum}%).`,
        type: 'warning',
      });
      return;
    }
    updatePlatformWeights(weights);
  };

  const handleSaveSplit = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = workerSplit + societySplit + fundSplit;
    if (sum !== 100) {
      showToast({
        title: 'Invalid Split Sum',
        message: `Revenue percentages must total 100% (currently ${sum}%).`,
        type: 'warning',
      });
      return;
    }
    updateRevenueSplit(workerSplit, societySplit, fundSplit);
  };

  const adminDisplayName = currentUser.name.replace(/^Dr\.\s*/i, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-7 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. HEADER: PLATFORM CENTRAL AUTHORITY DESK */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEBF4] border border-[#D5CBE5] flex items-center justify-center text-[#504161] shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EFEBF4] text-[#504161] border border-[#D5CBE5]">
                Platform Central Authority
              </span>
              <span className="text-xs text-[#77736B]">{adminDisplayName}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#292824] tracking-tight leading-tight mt-0.5">
              Platform Central Authority Desk
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#504161] bg-[#EFEBF4] border border-[#D5CBE5] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Regulatory Registry Online</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW: KEY PLATFORM METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Pending Verification */}
        <div
          onClick={() => setActiveTab('applications')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Pending Verification</span>
          <span className={`text-2xl font-bold font-mono block mt-1 tracking-tight ${pendingCount > 0 ? 'text-[#80432E]' : 'text-[#292824]'}`}>
            {pendingCount}
          </span>
          <span className="text-[10px] text-[#80432E] font-semibold">
            {changesCount > 0 ? `${changesCount} Revisions Pending` : 'Awaiting Audit'}
          </span>
        </div>

        {/* 2. Accredited Federations */}
        <div
          onClick={() => setActiveTab('federations')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Accredited Federations</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{approvedCount}</span>
          <span className="text-[10px] text-[#504161] font-semibold">{federations.length} Apex Bodies</span>
        </div>

        {/* 3. Member Cooperatives */}
        <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card">
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Member Cooperatives</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{societies.length}</span>
          <span className="text-[10px] text-[#537895] font-semibold">Across Federations</span>
        </div>

        {/* 4. Platform Workforce */}
        <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card">
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Platform Workforce</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{workers.length}</span>
          <span className="text-[10px] text-[#6E8B67] font-semibold">
            {workers.filter((w) => w.verificationStatus === 'VERIFIED').length} Verified & Active
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WORKSPACE NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1 border-b border-[#E8E2D5] overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {[
          {
            key: 'applications',
            label: t('admin.tabs.fedVerificationQueue', 'Federation Verification Queue'),
            count: pendingCount,
            icon: <ShieldCheck className="w-3.5 h-3.5" />,
          },
          {
            key: 'federations',
            label: t('admin.tabs.accreditedApexRegistry', 'Accredited Apex Registry'),
            count: approvedCount,
            icon: <Building2 className="w-3.5 h-3.5" />,
          },
          {
            key: 'audit',
            label: t('admin.tabs.centralAuditLog', 'Central Audit Log'),
            count: auditLogs.length,
            icon: <History className="w-3.5 h-3.5" />,
          },
          {
            key: 'system_config',
            label: t('admin.tabs.coopParameters', 'Platform Policy & Weights'),
            icon: <Sliders className="w-3.5 h-3.5" />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-[#EFEBF4] text-[#504161] border border-[#D5CBE5] shadow-2xs font-extrabold'
                : 'text-[#77736B] hover:text-[#292824] hover:bg-[#F3EEE4]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key
                    ? 'bg-[#504161] text-white'
                    : 'bg-[#E8E2D5] text-[#55524B]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB CONTENT: 1. FEDERATION APPLICATIONS QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] flex flex-col md:flex-row items-center justify-between gap-3 shadow-card">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77736B]" />
              <input
                type="text"
                placeholder="Search by Federation, Reg No, City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E2D5] bg-white text-[#292824] placeholder:text-[#77736B] focus:outline-none focus:ring-1 focus:ring-[#504161] focus:border-[#504161]"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-start md:justify-end text-xs">
              <span className="text-xs text-[#77736B] mr-1 flex items-center gap-1 font-medium">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#504161] text-white shadow-2xs'
                    : 'bg-white text-[#77736B] border border-[#E8E2D5] hover:bg-[#F3EEE4]'
                }`}
              >
                All ({federationApplications.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING_VERIFICATION')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'PENDING_VERIFICATION'
                    ? 'bg-[#C93B2B] text-white shadow-2xs'
                    : 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] hover:bg-[#F3DDD5]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('CHANGES_REQUIRED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'CHANGES_REQUIRED'
                    ? 'bg-[#B37055] text-white shadow-2xs'
                    : 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] hover:bg-[#F3DDD5]'
                }`}
              >
                Changes Required ({changesCount})
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'APPROVED'
                    ? 'bg-[#364A32] text-white shadow-2xs'
                    : 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0] hover:bg-[#D5E2D1]'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'REJECTED'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E2D5] text-[#77736B] font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Federation & Type</th>
                    <th className="p-3.5">Registration Info</th>
                    <th className="p-3.5">Authorized Person</th>
                    <th className="p-3.5">Declared Societies</th>
                    <th className="p-3.5">Doc Compliance</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => {
                      const docs = app.documents || [];
                      const verifiedDocs = docs.filter((d) => d.status === 'VERIFIED').length;
                      return (
                        <tr key={app.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-sm text-[#292824] flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-[#504161] shrink-0" />
                              {app.federationName}
                            </div>
                            <div className="text-[11px] text-[#77736B] mt-0.5">
                              {app.federationType} · {app.district}, {app.state}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-[#292824]">
                            <div className="font-semibold">{app.registrationNumber}</div>
                            <div className="text-[11px] text-[#77736B] font-sans">
                              Sub: {app.submittedAt?.split(' ')[0] || 'N/A'}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-[#292824]">{app.authorizedPersonName}</div>
                            <div className="text-[11px] text-[#77736B]">
                              {app.authorizedPersonDesignation} · {app.authorizedPersonPhone}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-[#292824]">
                              {app.declaredSocieties?.length || app.societiesCount || 0} Cooperatives
                            </span>
                            <div className="text-[11px] text-[#77736B]">
                              {app.selectedServices?.length || 0} service categories
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                                  verifiedDocs === docs.length && docs.length > 0
                                    ? 'bg-[#E6ECE4] text-[#364A32] border border-[#CFDDD0]'
                                    : 'bg-[#FAF7F2] text-[#77736B] border border-[#E8E2D5]'
                                }`}
                              >
                                {verifiedDocs}/{docs.length} Docs
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {app.status === 'APPROVED' && <Badge variant="success" size="sm">APPROVED</Badge>}
                            {app.status === 'PENDING_VERIFICATION' && <Badge variant="warning" size="sm">PENDING AUDIT</Badge>}
                            {app.status === 'CHANGES_REQUIRED' && <Badge variant="warning" size="sm">CHANGES REQUIRED</Badge>}
                            {app.status === 'REJECTED' && <Badge variant="danger" size="sm">REJECTED</Badge>}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="px-3 py-1.5 rounded-xl bg-[#504161] hover:bg-[#3E314D] text-white font-bold shadow-xs transition-all text-xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{app.status === 'PENDING_VERIFICATION' ? 'Audit & Verify' : 'View Audit'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-[#77736B]">
                        No federation applications match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB CONTENT: 2. ACCREDITED APEX REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === 'federations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-[#D5CBE5] bg-[#EFEBF4]/70 flex items-start gap-3 shadow-2xs">
            <Building2 className="w-5 h-5 text-[#504161] shrink-0 mt-0.5" />
            <div className="text-xs text-[#504161]">
              <span className="font-bold">Official Multi-State / State Apex Cooperative Registry:</span>
              <p className="mt-0.5 text-[#504161]/90">
                Federations listed here have received official Platform Central Authority certification. They hold administrative oversight of their declared member societies and cooperative relief funds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {federations.map((fed) => {
              const fedSocieties = societies.filter((s) => s.federationId === fed.id || fed.id === 'fed_mcf');
              return (
                <div key={fed.id} className="p-5 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] space-y-4 shadow-card hover:border-[#CFDDD0] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#EFEBF4] border border-[#D5CBE5] text-[#504161] flex items-center justify-center font-bold shadow-2xs">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-display font-bold text-[#292824]">{fed.name}</h3>
                        <p className="text-xs text-[#77736B]">{fed.region}</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">ACCREDITED APEX</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-[#E8E2D5] text-center text-xs">
                    <div>
                      <span className="text-[#77736B] block text-[10px] uppercase font-semibold">Societies</span>
                      <span className="font-bold font-mono text-[#292824] text-sm mt-0.5 block">{fed.totalSocieties || fedSocieties.length}</span>
                    </div>
                    <div>
                      <span className="text-[#77736B] block text-[10px] uppercase font-semibold">Relief Reserve</span>
                      <span className="font-bold font-mono text-[#292824] text-sm mt-0.5 block">₹{(fed.federationReliefFund || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[#77736B] block text-[10px] uppercase font-semibold">Cross-Requests</span>
                      <span className="font-bold font-mono text-[#292824] text-sm mt-0.5 block">{fed.crossSocietyRequests || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#77736B]">
                    <div className="flex justify-between">
                      <span>Lead Coordinator:</span>
                      <span className="font-semibold text-[#292824]">{fed.adminName || fed.leadCoordinator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Official Email:</span>
                      <span className="font-semibold text-[#292824]">{fed.adminEmail || fed.officialEmail || 'contact@coop.org'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration Number:</span>
                      <span className="font-mono text-[#292824]">{fed.registrationNumber || 'MSCS/CR/2023/8842'}</span>
                    </div>
                  </div>

                  {/* Member Societies Chips */}
                  <div className="pt-2 border-t border-[#E8E2D5]">
                    <span className="text-[11px] font-bold text-[#77736B] uppercase block mb-1.5">Member Societies:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {fed.declaredSocieties && fed.declaredSocieties.length > 0 ? (
                        fed.declaredSocieties.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-lg text-xs bg-white text-[#292824] border border-[#E8E2D5]">
                            {s.name}
                          </span>
                        ))
                      ) : (
                        fedSocieties.map((s) => (
                          <span key={s.id} className="px-2.5 py-0.5 rounded-lg text-xs bg-white text-[#292824] border border-[#E8E2D5]">
                            {s.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB CONTENT: 3. CENTRAL AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-card">
            <div>
              <h3 className="text-sm font-bold text-[#292824]">Platform Regulatory Audit Trail</h3>
              <p className="text-xs text-[#77736B] mt-0.5">
                Immutable log of all federation actions, society manager actions, and system certifications.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-[#EFEBF4] text-[#504161] border border-[#D5CBE5] shrink-0 self-start sm:self-auto">
              {auditLogs.length} Total Logs
            </span>
          </div>

          <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E2D5] text-[#77736B] font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor / Role</th>
                    <th className="p-3.5">Action Type</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">Entity Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {auditLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="p-3.5 font-mono text-[#77736B] whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-[#292824] block">{log.actor}</span>
                        <span className="text-[10px] text-[#77736B] uppercase font-medium">{log.role}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-[#EFEBF4] text-[#504161] border border-[#D5CBE5]">
                          {log.actionType || log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#292824] max-w-md">{log.details}</td>
                      <td className="p-3.5 text-[11px] text-[#77736B]">
                        {log.federationName && <div>Fed: {log.federationName}</div>}
                        {log.societyName && <div>Soc: {log.societyName}</div>}
                        {log.workerName && <div>Worker: {log.workerName}</div>}
                        {log.applicationId && <div className="font-mono">App: {log.applicationId}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB CONTENT: 4. PLATFORM POLICY & WEIGHTS */}
      {/* ========================================================================= */}
      {activeTab === 'system_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Distribution */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] space-y-4 shadow-card">
            <div>
              <h3 className="text-base font-display font-bold text-[#292824]">Platform Revenue Distribution Split</h3>
              <p className="text-xs text-[#77736B] mt-0.5">
                Configure mandatory cooperative distribution across all member societies.
              </p>
            </div>

            <form onSubmit={handleSaveSplit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 font-semibold text-[#292824]">
                  <span>Worker Payout Share</span>
                  <span className="text-emerald-700 font-mono font-bold">{workerSplit}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={workerSplit}
                  onChange={(e) => setWorkerSplit(Number(e.target.value))}
                  className="w-full accent-[#504161] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-semibold text-[#292824]">
                  <span>Local Society Administration Share</span>
                  <span className="text-[#80432E] font-mono font-bold">{societySplit}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={societySplit}
                  onChange={(e) => setSocietySplit(Number(e.target.value))}
                  className="w-full accent-[#504161] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-semibold text-[#292824]">
                  <span>Cooperative Relief & Emergency Fund</span>
                  <span className="text-[#504161] font-mono font-bold">{fundSplit}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={fundSplit}
                  onChange={(e) => setFundSplit(Number(e.target.value))}
                  className="w-full accent-[#504161] cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#E8E2D5] flex justify-between items-center text-xs font-semibold">
                <span className="text-[#77736B]">Total Allocation:</span>
                <span className={`font-mono font-bold ${workerSplit + societySplit + fundSplit === 100 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {workerSplit + societySplit + fundSplit}%
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#504161] hover:bg-[#3E314D] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Apply Revenue Distribution
              </button>
            </form>
          </div>

          {/* Fair Matching Engine Weights */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] bg-[#FCF9F3] space-y-4 shadow-card">
            <div>
              <h3 className="text-base font-display font-bold text-[#292824]">Fair Matching Algorithm Weights</h3>
              <p className="text-xs text-[#77736B] mt-0.5">
                Algorithmic dispatch tuning across cooperative member workforce.
              </p>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-3.5 text-xs">
              {Object.entries(weights).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1.5 font-semibold capitalize text-[#292824]">
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-[#504161] font-mono font-bold">{val}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={val}
                    onChange={(e) =>
                      setWeights((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#504161] cursor-pointer"
                  />
                </div>
              ))}

              <div className="p-3.5 bg-white rounded-xl border border-[#E8E2D5] flex justify-between items-center text-xs font-semibold">
                <span className="text-[#77736B]">Sum of Algorithmic Weights:</span>
                <span className={`font-mono font-bold ${Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {Object.values(weights).reduce((a, b) => a + b, 0)}%
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#504161] hover:bg-[#3E314D] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Update Algorithm Parameters
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal for Selected Application */}
      <PlatformFederationReviewModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onActionComplete={() => {
          if (selectedApplication) {
            const updated = federationApplications.find((a) => a.id === selectedApplication.id);
            if (updated) setSelectedApplication(updated);
          }
        }}
      />
    </div>
  );
};
