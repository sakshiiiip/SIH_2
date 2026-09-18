import React, { useState } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import { SocietyData, Worker } from '../../types';
import { WorkerProfileModal } from '../customer/WorkerProfileModal';
import {
  Network,
  DollarSign,
  Search,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';

interface FederationManagerDashboardProps {
  onSelectTab?: (tab: string) => void;
}

export const FederationManagerDashboard: React.FC<FederationManagerDashboardProps> = () => {
  const {
    federations,
    societies,
    workers,
    cooperativeFund,
    toolBank,
    config,
    updatePlatformConfig,
    getWorkersBySociety,
    getFederationWorkersCount,
    getFederationActiveJobsCount,
    getSocietyManagersCount,
    showToast,
  } = useCooperativeStore();

  const [matchingWeights, setMatchingWeights] = useState(config.matchingWeights);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'societies' | 'tool_bank' | 'coop_fund' | 'matching'>('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedSocietyForDrilldown, setSelectedSocietyForDrilldown] = useState<SocietyData | null>(null);
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<Worker | null>(null);

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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
          onClick={() => setActiveSubTab('societies')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Total Workforce</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{totalFederationWorkers}</span>
          <span className="text-[10px] text-[#537895] font-semibold">Verified Specialists</span>
        </div>

        <div
          onClick={() => setActiveSubTab('overview')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Active Jobs</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">{activeFederationBookingsCount}</span>
          <span className="text-[10px] text-[#6E8B67] font-semibold">Cross-Society</span>
        </div>

        <div
          onClick={() => setActiveSubTab('coop_fund')}
          className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl cursor-pointer transition-all shadow-card col-span-2 sm:col-span-1"
        >
          <span className="text-[11px] font-semibold text-[#77736B] uppercase tracking-wider block">Coop Fund</span>
          <span className="text-2xl font-bold font-mono text-[#292824] block mt-1 tracking-tight">₹{cooperativeFund.balance.toLocaleString()}</span>
          <span className="text-[10px] text-[#6E8B67] font-semibold">25% Central Pool</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WORKSPACE SUB-TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1 border-b border-[#E8E2D5] overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'societies', label: `Member Societies (${societies.length})` },
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
              return (
                <div
                  key={soc.id}
                  onClick={() => setSelectedSocietyForDrilldown(soc)}
                  className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] hover:border-[#CFDDD0] rounded-2xl shadow-card transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-[#504161] bg-[#EFEBF4] px-2 py-0.5 rounded-md">
                        {soc.code}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#9A958B] group-hover:text-[#292824] group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#292824] group-hover:text-[#504161]">
                      {soc.name}
                    </h3>
                    <p className="text-[11px] text-[#77736B] mt-0.5">
                      Manager: <strong className="text-[#80432E]">{soc.managerName || soc.coordinatorName}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] text-[#77736B]">
                    <span><strong className="text-[#292824]">{socWorkers.length}</strong> Workers</span>
                    <span className="text-[#6E8B67] font-semibold">{soc.totalHouseholds} Homes</span>
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
  );
};
