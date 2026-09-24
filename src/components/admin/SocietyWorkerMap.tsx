import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Worker, WorkerLocationStatus } from '../../types';
import { Badge } from '../common/Badge';
import { CooperativeMap } from '../common/Map/CooperativeMap';
import { MapMarkerEntity } from '../../types/location';
import {
  Compass,
  Phone,
  ChevronRight,
  Star,
  CheckCircle2,
  Clock,
  HardHat,
  Filter,
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
  const { t } = useTranslation();
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

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || filteredWorkers[0] || workers[0];

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
        return `● ${t('admin.mapAvailable', 'Available')}`;
      case 'ON_JOB':
        return `● ${t('admin.mapOnJob', 'On Job')}`;
      case 'TRAVELLING':
        return `● ${t('admin.mapTravelling', 'Travelling')}`;
      default:
        return `○ ${t('admin.mapOffline', 'Offline')}`;
    }
  };

  // Convert workers into MapMarkerEntity
  const mapMarkers: MapMarkerEntity[] = filteredWorkers.map((w) => ({
    id: w.id,
    type: 'worker',
    title: w.name,
    profession: w.skills[0] || 'Worker',
    status: w.locationStatus,
    avatar: w.avatar,
    coordinates: {
      lat: w.latitude || 18.5590,
      lng: w.longitude || 73.7868,
    },
    data: w,
  }));

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-extrabold text-[#292824] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#80432E]" />
            <span>{t('admin.workerMapTitle', { societyName, defaultValue: `Where are my workers? — ${societyName} Live Map` })}</span>
          </h3>
          <p className="text-xs text-[#77736B] mt-0.5">
            {t('admin.workerMapSubtitle', 'Operational visibility for stationed specialists. Private to Society Desk.')}
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'ALL', label: t('admin.mapFilterAll', { count: workers.length, defaultValue: `All (${workers.length})` }) },
            { key: 'AVAILABLE', label: t('admin.mapAvailable', 'Available') },
            { key: 'ON_JOB', label: t('admin.mapOnJob', 'On Job') },
            { key: 'TRAVELLING', label: t('admin.mapTravelling', 'Travelling') },
            { key: 'OFFLINE', label: t('admin.mapOffline', 'Offline') },
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
        {/* LEAFLET MAP CANVAS */}
        <div className="lg:col-span-2">
          <CooperativeMap
            height={440}
            markers={mapMarkers}
            selectedMarkerId={selectedWorkerId}
            center={
              selectedWorker?.latitude && selectedWorker?.longitude
                ? [selectedWorker.latitude, selectedWorker.longitude]
                : [18.5590, 73.7868]
            }
            zoom={15}
            autoFitBounds={true}
            onMarkerClick={(marker) => {
              setSelectedWorkerId(marker.id);
            }}
          />
        </div>

        {/* SELECTED WORKER TELEMETRY & KYC CARD */}
        {selectedWorker ? (
          <div className="p-5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAEDE8] text-[#80432E] border border-[#F3C5B8]">
                  {t('admin.workerTelemetry', 'Worker Telemetry')}
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
                    <span>· <span className="font-mono">{selectedWorker.completedJobs}</span> {t('admin.jobsCompleted', 'jobs completed')}</span>
                  </div>
                </div>
              </div>

              {/* Location telemetry specs */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">{t('admin.currentSector', 'Current Sector:')}</span>
                  <strong className="text-[#292824]">{selectedWorker.lastKnownArea || societyName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">{t('admin.lastPing', 'Last Ping:')}</span>
                  <span className="font-semibold text-[#524E47] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#77736B]" />
                    <span>{selectedWorker.locationUpdatedAt || t('admin.justNow', 'Just now')}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">{t('admin.verification', 'Verification:')}</span>
                  <span className="text-[#445D3E] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedWorker.verificationStatus}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#77736B]">{t('admin.gpsTelemetry', 'GPS Telemetry:')}</span>
                  <span className="font-mono text-[10px] text-[#77736B]">
                    {selectedWorker.latitude ? `${selectedWorker.latitude.toFixed(4)}° N, ${selectedWorker.longitude?.toFixed(4)}° E` : '18.5590° N, 73.7868° E'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: View Worker Full Profile / Documents */}
            <div className="pt-2 border-t border-[#E8E2D5] flex items-center gap-2">
              <a
                href={`tel:${selectedWorker.phone}`}
                className="p-2.5 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#524E47] rounded-xl transition-colors flex items-center justify-center text-xs font-bold"
                title={t('admin.callWorker', 'Call Worker')}
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => onSelectWorker(selectedWorker)}
                className="flex-1 py-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('admin.viewFullProfile', 'View Full Profile & KYC')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl text-center text-xs text-[#77736B] flex items-center justify-center">
            {t('admin.tapWorkerMarker', 'Tap any worker marker on the map to inspect location telemetry.')}
          </div>
        )}
      </div>
    </div>
  );
};
