import React, { useState } from 'react';
import { SocietyData, Worker, Booking } from '../../types';
import { CooperativeMap } from '../common/Map/CooperativeMap';
import { MapMarkerEntity } from '../../types/location';
import {
  Network,
  Compass,
  Filter,
  Users,
  HardHat,
  Building2,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface FederationMapOverviewProps {
  societies: SocietyData[];
  workers: Worker[];
  bookings: Booking[];
  onSelectSociety?: (society: SocietyData) => void;
  onSelectWorker?: (worker: Worker) => void;
}

export const FederationMapOverview: React.FC<FederationMapOverviewProps> = ({
  societies,
  workers,
  bookings,
  onSelectSociety,
  onSelectWorker,
}) => {
  const [selectedProfession, setSelectedProfession] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'WORKERS' | 'SOCIETIES' | 'DEMAND'>('ALL');
  const [focusedCenter, setFocusedCenter] = useState<[number, number] | undefined>(undefined);
  const [focusedZoom, setFocusedZoom] = useState<number>(12);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Society coordinates directory
  const societyGeoCoords: Record<string, { lat: number; lng: number }> = {
    soc_gr: { lat: 18.5590, lng: 73.7868 }, // Baner
    soc_ls: { lat: 18.5362, lng: 73.7925 }, // Pashan
    soc_sa: { lat: 18.5074, lng: 73.8077 }, // Kothrud
    soc_ph: { lat: 18.5742, lng: 73.7725 }, // Balewadi
    soc_rv: { lat: 18.5629, lng: 73.8087 }, // Aundh
    soc_ht: { lat: 18.5987, lng: 73.7628 }, // Wakad
    soc_so: { lat: 18.5135, lng: 73.7742 }, // Bavdhan
    soc_eh: { lat: 18.5912, lng: 73.7389 }, // Hinjewadi
  };

  // Filtered workers
  const filteredWorkers = workers.filter((w) => {
    if (selectedProfession !== 'ALL' && !w.skills.some((s) => s.toLowerCase() === selectedProfession.toLowerCase())) {
      return false;
    }
    if (selectedStatus === 'AVAILABLE' && w.locationStatus !== 'AVAILABLE') return false;
    if (selectedStatus === 'ON_JOB' && w.locationStatus !== 'ON_JOB') return false;
    if (selectedStatus === 'OFFLINE' && w.locationStatus !== 'OFFLINE' && w.availability !== 'offline') return false;
    return true;
  });

  // Build map markers
  const markers: MapMarkerEntity[] = [];

  // 1. Society Markers
  if (activeLayer === 'ALL' || activeLayer === 'SOCIETIES') {
    societies.forEach((soc) => {
      const coords = societyGeoCoords[soc.id] || { lat: 18.5590, lng: 73.7868 };
      markers.push({
        id: `soc_${soc.id}`,
        type: 'society',
        title: soc.name,
        subtitle: `${soc.activeWorkersCount} specialists · ${soc.totalHouseholds} homes`,
        coordinates: coords,
        data: soc,
      });
    });
  }

  // 2. Worker Markers
  if (activeLayer === 'ALL' || activeLayer === 'WORKERS') {
    filteredWorkers.forEach((w) => {
      if (w.latitude && w.longitude) {
        markers.push({
          id: `worker_${w.id}`,
          type: 'worker',
          title: w.name,
          profession: w.skills[0] || 'Worker',
          status: w.locationStatus,
          avatar: w.avatar,
          coordinates: { lat: w.latitude, lng: w.longitude },
          data: w,
        });
      }
    });
  }

  // 3. Active Job Demand Markers
  if (activeLayer === 'ALL' || activeLayer === 'DEMAND') {
    bookings
      .filter((b) => ['SUBMITTED', 'MATCHING', 'TRAVELLING', 'IN_PROGRESS'].includes(b.state))
      .forEach((b) => {
        const socId = b.societyId || 'soc_gr';
        const base = societyGeoCoords[socId] || { lat: 18.5590, lng: 73.7868 };
        markers.push({
          id: `job_${b.id}`,
          type: 'job',
          title: `${b.serviceCategory} · ${b.urgencyTier}`,
          urgencyTier: b.urgencyTier,
          coordinates: {
            lat: b.customerLatitude || base.lat + 0.002,
            lng: b.customerLongitude || base.lng + 0.002,
          },
          data: b,
        });
      });
  }

  const handleMarkerClick = (marker: MapMarkerEntity) => {
    setSelectedMarkerId(marker.id);
    if (marker.type === 'society' && onSelectSociety && marker.data) {
      onSelectSociety(marker.data);
      setFocusedCenter([marker.coordinates.lat, marker.coordinates.lng]);
      setFocusedZoom(14);
    } else if (marker.type === 'worker' && onSelectWorker && marker.data) {
      onSelectWorker(marker.data);
    }
  };

  const handleZoomToSociety = (soc: SocietyData) => {
    const coords = societyGeoCoords[soc.id];
    if (coords) {
      setFocusedCenter([coords.lat, coords.lng]);
      setFocusedZoom(15);
      setSelectedMarkerId(`soc_${soc.id}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FCF9F3] p-4 rounded-2xl border border-[#E8E2D5]">
        <div>
          <h3 className="text-sm font-extrabold text-[#292824] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#504161]" />
            <span>Regional Federation Geographical Hub</span>
          </h3>
          <p className="text-xs text-[#77736B] mt-0.5">
            Real-time coverage and cooperative workforce distribution across 8 affiliated societies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Layer Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8E2D5]">
            {[
              { id: 'ALL', label: 'All Layers' },
              { id: 'SOCIETIES', label: 'Societies' },
              { id: 'WORKERS', label: 'Workers' },
              { id: 'DEMAND', label: 'Live Demand' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLayer(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeLayer === tab.id
                    ? 'bg-[#EFEBF4] text-[#504161] shadow-2xs'
                    : 'text-[#77736B] hover:text-[#292824]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profession Filter */}
          <select
            value={selectedProfession}
            onChange={(e) => setSelectedProfession(e.target.value)}
            className="p-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-bold text-[#292824] focus:outline-none focus:ring-1 focus:ring-[#504161]"
          >
            <option value="ALL">All Professions</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Painting">Painting</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 bg-white border border-[#E8E2D5] rounded-xl text-xs font-bold text-[#292824] focus:outline-none focus:ring-1 focus:ring-[#504161]"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_JOB">On Job</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Societies Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEAFLET MAP CANVAS */}
        <div className="lg:col-span-3">
          <CooperativeMap
            height={460}
            markers={markers}
            center={focusedCenter || [18.5590, 73.7868]}
            zoom={focusedZoom}
            selectedMarkerId={selectedMarkerId}
            autoFitBounds={!focusedCenter}
            showInspectorPanel={true}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* SOCIETIES QUICK JUMP ROSTER */}
        <div className="p-4 bg-[#FCF9F3] border border-[#E8E2D5] rounded-3xl shadow-card space-y-3 flex flex-col justify-between max-h-[460px] overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#504161] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Societies Hub</span>
              </span>
              <span className="text-[10px] text-[#77736B] font-mono">{societies.length} Units</span>
            </div>

            <div className="space-y-1.5 mt-2.5 overflow-y-auto max-h-[340px] pr-1">
              {societies.map((soc) => (
                <div
                  key={soc.id}
                  onClick={() => handleZoomToSociety(soc)}
                  className="p-2.5 bg-white hover:bg-[#EFEBF4]/70 border border-[#E8E2D5] hover:border-[#DFD8E8] rounded-xl cursor-pointer transition-all flex items-center justify-between group text-xs"
                >
                  <div className="truncate min-w-0 pr-1">
                    <strong className="text-[#292824] block truncate font-bold group-hover:text-[#504161]">
                      {soc.name}
                    </strong>
                    <span className="text-[10px] text-[#77736B] block truncate">
                      {soc.activeWorkersCount} Specialists · {soc.totalHouseholds} Flats
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9A958B] group-hover:text-[#504161] shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E2D5] text-[11px] text-[#77736B] flex items-center justify-between">
            <span>Active Demand: <strong className="text-[#80432E]">{bookings.filter((b) => !['COMPLETED', 'PAID', 'CANCELLED'].includes(b.state)).length}</strong> jobs</span>
            <span className="text-[#6E8B67] font-semibold">100% Coverage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
