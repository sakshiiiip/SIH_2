import React, { useState } from 'react';
import { Worker, WorkerLocationStatus } from '../../types';
import { Badge } from '../common/Badge';
import {
  MapPin,
  HardHat,
  Star,
  CheckCircle2,
  Clock,
  Compass,
  Phone,
  ChevronRight,
  Filter,
  Users,
  Navigation,
  Activity,
  Layers,
} from 'lucide-react';

interface SocietyWorkerMapProps {
  societyName: string;
  workers: Worker[];
  onSelectWorker: (worker: Worker) => void;
}

type FilterStatus = 'ALL' | 'AVAILABLE' | 'ON_JOB' | 'TRAVELLING' | 'OFFLINE';

export const SocietyWorkerMap: React.FC<SocietyWorkerMapProps> = ({
  societyName,
  workers,
  onSelectWorker,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('ALL');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(
    workers[0]?.id || null
  );

  const filteredWorkers = workers.filter((w) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'AVAILABLE') return w.locationStatus === 'AVAILABLE';
    if (selectedFilter === 'ON_JOB') return w.locationStatus === 'ON_JOB';
    if (selectedFilter === 'TRAVELLING') return w.locationStatus === 'TRAVELLING';
    if (selectedFilter === 'OFFLINE') return w.locationStatus === 'OFFLINE' || w.availability === 'offline';
    return true;
  });

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  const getStatusColor = (status?: WorkerLocationStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-[#6E8B67]', border: 'border-[#445D3E]', text: 'text-[#445D3E]', ring: 'ring-[#CFDDD0]', badge: 'verified' as const };
      case 'ON_JOB':
        return { bg: 'bg-[#537895]', border: 'border-[#324F66]', text: 'text-[#324F66]', ring: 'ring-[#CDE0EC]', badge: 'urgent' as const };
      case 'TRAVELLING':
        return { bg: 'bg-[#B37055]', border: 'border-[#80432E]', text: 'text-[#80432E]', ring: 'ring-[#F4DCD3]', badge: 'pending' as const };
      default:
        return { bg: 'bg-[#9A958B]', border: 'border-[#77736B]', text: 'text-[#77736B]', ring: 'ring-[#E8E2D5]', badge: 'neutral' as const };
    }
  };

  const getStatusLabel = (status?: WorkerLocationStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return '● Available';
      case 'ON_JOB':
        return '● On Job';
      case 'TRAVELLING':
        return '● Travelling';
      default:
        return '○ Offline';
    }
  };

  // Map pin position offsets for realistic visualization across society sectors
  const sectorPositions = [
    { top: '28%', left: '26%', label: 'Tower A (Residential)' },
    { top: '35%', left: '68%', label: 'Tower B (Residential)' },
    { top: '65%', left: '32%', label: 'Tower C & Clubhouse' },
    { top: '72%', left: '62%', label: 'Tower D & Parking Bay' },
    { top: '48%', left: '48%', label: 'Central Maintenance Depot' },
    { top: '20%', left: '50%', label: 'North Gate & Commercial Plaza' },
    { top: '80%', left: '45%', label: 'South Utility & Tool Bank Hub' },
    { top: '55%', left: '80%', label: 'East Visitor Reception' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-extrabold text-[#292824] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#80432E]" />
            <span>Where are my workers? — {societyName} Live Map</span>
          </h3>
          <p className="text-xs text-[#77736B] mt-0.5">
            Operational visibility for stationed specialists. Private to Society Desk.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'ALL', label: `All (${workers.length})` },
            { key: 'AVAILABLE', label: 'Available' },
            { key: 'ON_JOB', label: 'On Job' },
            { key: 'TRAVELLING', label: 'Travelling' },
            { key: 'OFFLINE', label: 'Offline' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedFilter(tab.key as FilterStatus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === tab.key
                  ? 'bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8] shadow-2xs font-extrabold'
                  : 'bg-[#FCF9F3] text-[#77736B] border border-[#E8E2D5] hover:text-[#292824]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map Canvas + Worker Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MAP CANVAS */}
        <div className="lg:col-span-2 bg-[#FCF9F3] border-2 border-[#E8E2D5] rounded-3xl p-4 shadow-card relative overflow-hidden h-[380px] sm:h-[440px] flex flex-col justify-between select-none">
          {/* Subtle Sector Grid Overlay Background */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8E2D5" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Society Sector Zone Landmarks */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Tower A */}
            <div className="absolute top-[20%] left-[18%] p-2 rounded-2xl bg-[#E6ECE4]/50 border border-[#CFDDD0] text-[10px] font-bold text-[#445D3E]">
              Tower A & B
            </div>
            {/* Central Depot */}
            <div className="absolute top-[45%] left-[40%] p-2 rounded-2xl bg-[#FAEDE8]/60 border border-[#F3C5B8] text-[10px] font-bold text-[#80432E] flex items-center gap-1">
              <HardHat className="w-3 h-3" />
              <span>Coop Depot & Tool Bank</span>
            </div>
            {/* Tower C & D */}
            <div className="absolute top-[68%] left-[58%] p-2 rounded-2xl bg-[#E4EDF4]/50 border border-[#CDE0EC] text-[10px] font-bold text-[#324F66]">
              Tower C & D
            </div>
          </div>

          {/* Map Top Compass & Legend */}
          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1 bg-white/90 backdrop-blur-xs rounded-xl border border-[#E8E2D5] text-[11px] font-bold text-[#292824] shadow-2xs">
              📍 {societyName} Campus
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#E8E2D5]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6E8B67]" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#537895]" /> On Job</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#B37055]" /> Travelling</span>
            </div>
          </div>

          {/* Interactive Worker Map Markers */}
          <div className="absolute inset-0">
            {filteredWorkers.map((w, idx) => {
              const pos = sectorPositions[idx % sectorPositions.length];
              const isSelected = selectedWorkerId === w.id;
              const colorInfo = getStatusColor(w.locationStatus);

              return (
                <div
                  key={w.id}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => setSelectedWorkerId(w.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 group ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                  }`}
                >
                  {/* Pin Avatar Bubble */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-2xl p-0.5 bg-white border-2 shadow-md transition-all ${
                        isSelected
                          ? 'border-[#80432E] ring-4 ring-[#F3C5B8]'
                          : 'border-[#E8E2D5] hover:border-[#80432E]'
                      }`}
                    >
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    </div>

                    {/* Status Dot Ring */}
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${colorInfo.bg} border-2 border-white shadow-xs`}
                    />

                    {/* Label Pill */}
                    <div
                      className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-xs transition-colors ${
                        isSelected
                          ? 'bg-[#292824] text-white'
                          : 'bg-white/95 text-[#292824] border border-[#E8E2D5]'
                      }`}
                    >
                      {w.name.split(' ')[0]} ({w.skills[0] || 'Worker'})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Bottom Metadata */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-[#77736B] pointer-events-none">
            <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8E2D5]">
              Showing <span className="font-mono font-bold text-[#292824]">{filteredWorkers.length}</span> stationed workers
            </span>
            <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8E2D5]">
              GPS Accuracy: ±15m
            </span>
          </div>
        </div>

        {/* SELECTED WORKER BOTTOM SHEET / DETAIL CARD */}
        {selectedWorker ? (
          <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8]">
                  Worker Telemetry
                </span>
                <Badge variant={getStatusColor(selectedWorker.locationStatus).badge} size="sm">
                  {getStatusLabel(selectedWorker.locationStatus)}
                </Badge>
              </div>

              {/* Worker Header */}
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorker.avatar}
                  alt={selectedWorker.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E8E2D5] shadow-xs"
                />
                <div>
                  <h4 className="text-base font-extrabold text-[#292824]">{selectedWorker.name}</h4>
                  <p className="text-xs text-[#80432E] font-semibold">{selectedWorker.skills.join(' · ')}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#77736B] mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#B37055] text-[#B37055]" />
                    <span className="font-bold font-mono text-[#292824]">{selectedWorker.rating}</span>
                    <span>· <span className="font-mono">{selectedWorker.completedJobs}</span> jobs completed</span>
                  </div>
                </div>
              </div>

              {/* Location telemetry specs */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">Current Sector:</span>
                  <strong className="text-[#292824]">{selectedWorker.lastKnownArea || societyName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">Last Ping:</span>
                  <span className="font-semibold text-[#524E47] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#77736B]" />
                    <span>{selectedWorker.locationUpdatedAt || '2 min ago'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">Verification:</span>
                  <span className="text-[#445D3E] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedWorker.verificationStatus}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">GPS Coordinates:</span>
                  <span className="font-mono text-[10px] text-[#77736B]">
                    {selectedWorker.latitude || 18.5590}° N, {selectedWorker.longitude || 73.7868}° E
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: View Worker Full Profile / Documents */}
            <div className="pt-2 border-t border-[#E8E2D5] flex items-center gap-2">
              <a
                href={`tel:${selectedWorker.phone}`}
                className="p-2.5 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#524E47] rounded-xl transition-colors flex items-center justify-center text-xs font-bold"
                title="Call Worker"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => onSelectWorker(selectedWorker)}
                className="flex-1 py-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Profile & KYC</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl text-center text-xs text-[#77736B] flex items-center justify-center">
            Tap any worker marker on the map to inspect location telemetry.
          </div>
        )}
      </div>
    </div>
  );
};
