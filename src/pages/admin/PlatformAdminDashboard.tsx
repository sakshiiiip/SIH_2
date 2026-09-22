import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { FederationApplication, FederationData, PlatformAuditLog } from '../../types';
import { PlatformFederationReviewModal } from '../../components/admin/PlatformFederationReviewModal';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Layers,
  Users,
  Eye,
  Sliders,
  Activity,
  History,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  FileText,
  DollarSign,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const PlatformAdminDashboard: React.FC = () => {
  const {
    currentUser,
    federationApplications,
    federations,
    societies,
    workers,
    platformMetrics,
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

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141413] pb-16">
      {/* Platform Admin Header */}
      <div className="bg-[#141413] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#2A2926]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF9F5]">
                  Platform Central Authority
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Platform Admin
                </span>
              </div>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                Apex Federation Accreditation & Multi-Tier Cooperative Governance Portal · {currentUser.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#21201D] border border-[#33322E] rounded-xl px-3.5 py-2 flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#77736B] tracking-wider block">Central Status</span>
                <span className="text-xs font-semibold text-green-400 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Regulatory Registry Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Pending Applications */}
          <div className={`p-4 rounded-xl border transition-all ${
            pendingCount > 0
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-[#D5D0C7]'
          }`}>
            <div className="flex items-center justify-between text-[#77736B]">
              <span className="text-xs font-medium uppercase tracking-wider">Pending Verification</span>
              <Clock className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-600' : 'text-[#77736B]'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-serif font-bold ${pendingCount > 0 ? 'text-amber-900' : 'text-[#141413]'}`}>
                {pendingCount}
              </span>
              <span className="text-xs text-[#77736B]">Applications</span>
            </div>
            <p className="text-[11px] text-[#77736B] mt-1">
              {changesCount > 0 ? `${changesCount} pending revisions` : 'Awaiting Platform Admin action'}
            </p>
          </div>

          {/* 2. Accredited Federations */}
          <div className="p-4 rounded-xl border border-[#D5D0C7] bg-white">
            <div className="flex items-center justify-between text-[#77736B]">
              <span className="text-xs font-medium uppercase tracking-wider">Accredited Federations</span>
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-serif font-bold text-[#141413]">
                {approvedCount}
              </span>
              <span className="text-xs text-[#77736B]">Apex Bodies</span>
            </div>
            <p className="text-[11px] text-[#77736B] mt-1">
              {federations.length} total federation records
            </p>
          </div>

          {/* 3. Member Cooperatives */}
          <div className="p-4 rounded-xl border border-[#D5D0C7] bg-white">
            <div className="flex items-center justify-between text-[#77736B]">
              <span className="text-xs font-medium uppercase tracking-wider">Member Cooperatives</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-serif font-bold text-[#141413]">
                {societies.length}
              </span>
              <span className="text-xs text-[#77736B]">Societies</span>
            </div>
            <p className="text-[11px] text-[#77736B] mt-1">
              Across all state federations
            </p>
          </div>

          {/* 4. Active Workforce */}
          <div className="p-4 rounded-xl border border-[#D5D0C7] bg-white">
            <div className="flex items-center justify-between text-[#77736B]">
              <span className="text-xs font-medium uppercase tracking-wider">Platform Workforce</span>
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-serif font-bold text-[#141413]">
                {workers.length}
              </span>
              <span className="text-xs text-[#77736B]">Workers</span>
            </div>
            <p className="text-[11px] text-[#77736B] mt-1">
              {workers.filter((w) => w.verificationStatus === 'VERIFIED').length} verified & active
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#D5D0C7] flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-white text-purple-900 border-t-2 border-l border-r border-t-purple-700 border-x-[#D5D0C7] shadow-sm'
                : 'text-[#77736B] hover:text-[#141413] hover:bg-white/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Federation Verification Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('federations')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'federations'
                ? 'bg-white text-purple-900 border-t-2 border-l border-r border-t-purple-700 border-x-[#D5D0C7] shadow-sm'
                : 'text-[#77736B] hover:text-[#141413] hover:bg-white/50'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Accredited Apex Registry</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-white text-purple-900 border-t-2 border-l border-r border-t-purple-700 border-x-[#D5D0C7] shadow-sm'
                : 'text-[#77736B] hover:text-[#141413] hover:bg-white/50'
            }`}
          >
            <History className="w-4 h-4 text-purple-600" />
            <span>Central Audit Log</span>
          </button>

          <button
            onClick={() => setActiveTab('system_config')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'system_config'
                ? 'bg-white text-purple-900 border-t-2 border-l border-r border-t-purple-700 border-x-[#D5D0C7] shadow-sm'
                : 'text-[#77736B] hover:text-[#141413] hover:bg-white/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Platform Policy & Weights</span>
          </button>
        </div>

        {/* Tab Content 1: Federation Applications Queue */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="p-4 rounded-xl border border-[#D5D0C7] bg-white flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77736B]" />
                <input
                  type="text"
                  placeholder="Search by Federation, Reg No, City..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
                <span className="text-xs text-[#77736B] mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Status:
                </span>
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-purple-700 text-white'
                      : 'bg-[#FAF9F5] text-[#77736B] border border-[#D5D0C7] hover:bg-[#F7F5F0]'
                  }`}
                >
                  All ({federationApplications.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING_VERIFICATION')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'PENDING_VERIFICATION'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('CHANGES_REQUIRED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'CHANGES_REQUIRED'
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Changes Required ({changesCount})
                </button>
                <button
                  onClick={() => setStatusFilter('APPROVED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'APPROVED'
                      ? 'bg-green-700 text-white'
                      : 'bg-green-50 text-green-900 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  Approved ({approvedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('REJECTED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === 'REJECTED'
                      ? 'bg-red-700 text-white'
                      : 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  Rejected ({rejectedCount})
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="border border-[#D5D0C7] rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF9F5] border-b border-[#D5D0C7] text-[#77736B] font-semibold">
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
                <tbody className="divide-y divide-[#E8E6DF]">
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => {
                      const docs = app.documents || [];
                      const verifiedDocs = docs.filter((d) => d.status === 'VERIFIED').length;
                      return (
                        <tr key={app.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-sm text-[#141413] flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                              {app.federationName}
                            </div>
                            <div className="text-[11px] text-[#77736B] mt-0.5">
                              {app.federationType} · {app.district}, {app.state}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-[#141413]">
                            <div className="font-semibold">{app.registrationNumber}</div>
                            <div className="text-[11px] text-[#77736B] font-sans">
                              Sub: {app.submittedAt?.split(' ')[0] || 'N/A'}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-[#141413]">{app.authorizedPersonName}</div>
                            <div className="text-[11px] text-[#77736B]">
                              {app.authorizedPersonDesignation} · {app.authorizedPersonPhone}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-[#141413]">
                              {app.declaredSocieties?.length || app.societiesCount || 0} Cooperatives
                            </span>
                            <div className="text-[11px] text-[#77736B]">
                              {app.selectedServices?.length || 0} service categories
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  verifiedDocs === docs.length && docs.length > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-700'
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
                              className="px-3 py-1.5 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 shadow-sm transition-all text-xs inline-flex items-center gap-1"
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
        )}

        {/* Tab Content 2: Accredited Apex Federations Registry */}
        {activeTab === 'federations' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-950">
                <span className="font-bold">Official Multi-State / State Apex Cooperative Registry:</span>
                <p className="mt-0.5 text-purple-900">
                  Federations listed here have received official Platform Central Authority certification. They hold administrative oversight of their declared member societies and cooperative relief funds.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {federations.map((fed) => {
                const fedSocieties = societies.filter((s) => s.federationId === fed.id || fed.id === 'fed_mcf');
                return (
                  <div key={fed.id} className="p-5 rounded-xl border border-[#D5D0C7] bg-white space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-serif font-bold text-[#141413]">{fed.name}</h3>
                          <p className="text-xs text-[#77736B]">{fed.region}</p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">ACCREDITED APEX</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E6DF] text-center text-xs">
                      <div>
                        <span className="text-[#77736B] block text-[10px] uppercase">Societies</span>
                        <span className="font-bold text-[#141413] text-sm">{fed.totalSocieties || fedSocieties.length}</span>
                      </div>
                      <div>
                        <span className="text-[#77736B] block text-[10px] uppercase">Relief Reserve</span>
                        <span className="font-bold text-[#141413] text-sm">₹{(fed.federationReliefFund || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#77736B] block text-[10px] uppercase">Cross-Requests</span>
                        <span className="font-bold text-[#141413] text-sm">{fed.crossSocietyRequests || 0}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#77736B]">
                      <div className="flex justify-between">
                        <span>Lead Coordinator:</span>
                        <span className="font-semibold text-[#141413]">{fed.adminName || fed.leadCoordinator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Official Email:</span>
                        <span className="font-semibold text-[#141413]">{fed.adminEmail || fed.officialEmail || 'contact@coop.org'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Registration Number:</span>
                        <span className="font-mono text-[#141413]">{fed.registrationNumber || 'MSCS/CR/2023/8842'}</span>
                      </div>
                    </div>

                    {/* Member Societies Chips */}
                    <div className="pt-2 border-t border-[#E8E6DF]">
                      <span className="text-[11px] font-bold text-[#77736B] uppercase block mb-1.5">Member Societies:</span>
                      <div className="flex flex-wrap gap-1">
                        {fed.declaredSocieties && fed.declaredSocieties.length > 0 ? (
                          fed.declaredSocieties.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-[#FAF9F5] text-[#141413] border border-[#D5D0C7]">
                              {s.name}
                            </span>
                          ))
                        ) : (
                          fedSocieties.map((s) => (
                            <span key={s.id} className="px-2 py-0.5 rounded text-[11px] bg-[#FAF9F5] text-[#141413] border border-[#D5D0C7]">
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

        {/* Tab Content 3: Platform Master Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#D5D0C7] bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#141413]">Platform Regulatory Audit Trail</h3>
                <p className="text-xs text-[#77736B] mt-0.5">
                  Immutable log of all federation actions, society manager actions, and system certifications.
                </p>
              </div>
              <Badge variant="neutral" size="md">{auditLogs.length} Total Logs</Badge>
            </div>

            <div className="border border-[#D5D0C7] rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF9F5] border-b border-[#D5D0C7] text-[#77736B] font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor / Role</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Entity Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E6DF]">
                  {auditLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3 font-mono text-[#77736B] whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3">
                        <span className="font-semibold text-[#141413] block">{log.actor}</span>
                        <span className="text-[10px] text-[#77736B] uppercase">{log.role}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200">
                          {log.actionType || log.action}
                        </span>
                      </td>
                      <td className="p-3 text-[#141413] max-w-md">{log.details}</td>
                      <td className="p-3 text-[11px] text-[#77736B]">
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
        )}

        {/* Tab Content 4: System Config & Weights */}
        {activeTab === 'system_config' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Distribution */}
            <div className="p-5 rounded-xl border border-[#D5D0C7] bg-white space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#141413]">Platform Revenue Distribution Split</h3>
                <p className="text-xs text-[#77736B] mt-0.5">
                  Configure mandatory cooperative distribution across all member societies.
                </p>
              </div>

              <form onSubmit={handleSaveSplit} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span>Worker Payout Share</span>
                    <span className="text-green-700">{workerSplit}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={workerSplit}
                    onChange={(e) => setWorkerSplit(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span>Local Society Administration Share</span>
                    <span className="text-blue-700">{societySplit}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={societySplit}
                    onChange={(e) => setSocietySplit(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span>Cooperative Relief & Emergency Fund</span>
                    <span className="text-purple-700">{fundSplit}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={fundSplit}
                    onChange={(e) => setFundSplit(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E6DF] flex justify-between items-center text-xs">
                  <span>Total Allocation:</span>
                  <span className={`font-bold ${workerSplit + societySplit + fundSplit === 100 ? 'text-green-700' : 'text-red-700'}`}>
                    {workerSplit + societySplit + fundSplit}%
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow"
                >
                  Apply Revenue Distribution
                </button>
              </form>
            </div>

            {/* Fair Matching Engine Weights */}
            <div className="p-5 rounded-xl border border-[#D5D0C7] bg-white space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#141413]">Fair Matching Algorithm Weights</h3>
                <p className="text-xs text-[#77736B] mt-0.5">
                  Algorithmic dispatch tuning across cooperative member workforce.
                </p>
              </div>

              <form onSubmit={handleSaveWeights} className="space-y-3 text-xs">
                {Object.entries(weights).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1 font-semibold capitalize">
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-purple-700">{val}%</span>
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
                      className="w-full"
                    />
                  </div>
                ))}

                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E6DF] flex justify-between items-center text-xs">
                  <span>Sum of Algorithmic Weights:</span>
                  <span className={`font-bold ${Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? 'text-green-700' : 'text-red-700'}`}>
                    {Object.values(weights).reduce((a, b) => a + b, 0)}%
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow"
                >
                  Update Algorithm Parameters
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal for Selected Application */}
      <PlatformFederationReviewModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onActionComplete={() => {
          // Re-sync or refresh selection if needed
          if (selectedApplication) {
            const updated = federationApplications.find((a) => a.id === selectedApplication.id);
            if (updated) setSelectedApplication(updated);
          }
        }}
      />
    </div>
  );
};
