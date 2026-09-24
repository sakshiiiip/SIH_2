import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { MapMarkerEntity } from '../../../types/location';
import { calculateBoundingBox } from '../../../utils/geoUtils';
import {
  MapPin,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Phone,
  Star,
  HardHat,
  ShieldCheck,
  Zap,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface CooperativeMapProps {
  markers?: MapMarkerEntity[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  allowPinDrop?: boolean;
  selectedMarkerId?: string | null;
  height?: string | number;
  className?: string;
  autoFitBounds?: boolean;
  showLocateControl?: boolean;
  showLegend?: boolean;
  showInspectorPanel?: boolean;
  onMarkerClick?: (marker: MapMarkerEntity) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onPinDragEnd?: (lat: number, lng: number) => void;
  onLocateUser?: () => void;
}

export const CooperativeMap: React.FC<CooperativeMapProps> = ({
  markers = [],
  center = [18.5590, 73.7868],
  zoom = 14,
  interactive = true,
  allowPinDrop = false,
  selectedMarkerId = null,
  height = '400px',
  className = '',
  autoFitBounds = true,
  showLocateControl = true,
  showLegend = true,
  showInspectorPanel = false,
  onMarkerClick,
  onMapClick,
  onPinDragEnd,
  onLocateUser,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeSelectedMarker, setActiveSelectedMarker] = useState<MapMarkerEntity | null>(null);

  // Sync selected marker from prop
  useEffect(() => {
    if (selectedMarkerId) {
      const found = markers.find((m) => m.id === selectedMarkerId);
      if (found) setActiveSelectedMarker(found);
    }
  }, [selectedMarkerId, markers]);

  // Create custom HTML divIcon for markers
  const createMarkerIcon = useCallback((marker: MapMarkerEntity, isSelected: boolean) => {
    const isDraggable = marker.isDraggable;
    let html = '';

    if (marker.type === 'user') {
      html = `
        <div class="relative flex flex-col items-center custom-map-pin ${isDraggable ? 'cursor-grab' : 'cursor-pointer'}">
          <div class="absolute -inset-2 rounded-full bg-[#6E8B67]/20 animate-ping"></div>
          <div class="w-8 h-8 rounded-full bg-[#6E8B67] border-3 border-white shadow-lg flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          ${
            marker.title
              ? `<div class="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#292824] text-white whitespace-nowrap shadow-sm">
                  ${marker.title}
                </div>`
              : ''
          }
        </div>
      `;
    } else if (marker.type === 'worker') {
      const statusBg =
        marker.status === 'AVAILABLE'
          ? 'bg-[#6E8B67]'
          : marker.status === 'ON_JOB'
          ? 'bg-[#537895]'
          : marker.status === 'TRAVELLING'
          ? 'bg-[#80432E]'
          : 'bg-[#9A958B]';

      html = `
        <div class="relative flex flex-col items-center custom-map-pin group cursor-pointer transition-transform ${
          isSelected ? 'scale-115 z-30' : 'hover:scale-105'
        }">
          <div class="w-10 h-10 rounded-2xl p-0.5 bg-white border-2 ${
            isSelected ? 'border-[#80432E] ring-3 ring-[#F3C5B8]' : 'border-[#E8E2D5]'
          } shadow-md overflow-hidden relative">
            <img src="${marker.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}" 
                 class="w-full h-full object-cover rounded-xl" />
          </div>
          <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${statusBg} border-2 border-white shadow-xs"></span>
          <div class="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-xs ${
            isSelected ? 'bg-[#292824] text-white' : 'bg-white text-[#292824] border border-[#E8E2D5]'
          }">
            ${marker.title.split(' ')[0]} ${marker.profession ? `· ${marker.profession}` : ''}
          </div>
        </div>
      `;
    } else if (marker.type === 'job') {
      const urgencyBg =
        marker.urgencyTier === 'EMERGENCY'
          ? 'bg-[#C93B2B]'
          : marker.urgencyTier === 'URGENT'
          ? 'bg-[#80432E]'
          : 'bg-[#537895]';

      html = `
        <div class="relative flex flex-col items-center custom-map-pin cursor-pointer ${
          isSelected ? 'scale-110' : 'hover:scale-105'
        }">
          <div class="w-9 h-9 rounded-2xl ${urgencyBg} text-white flex items-center justify-center border-2 border-white shadow-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-[#292824] border border-[#E8E2D5] shadow-xs whitespace-nowrap">
            ${marker.title}
          </div>
        </div>
      `;
    } else if (marker.type === 'society') {
      html = `
        <div class="relative flex flex-col items-center custom-map-pin cursor-pointer">
          <div class="w-8 h-8 rounded-xl bg-[#504161] text-white border-2 border-white shadow-md flex items-center justify-center font-bold text-xs">
            🏢
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#EFEBF4] text-[#504161] border border-[#DFD8E8] shadow-xs whitespace-nowrap">
            ${marker.title}
          </div>
        </div>
      `;
    }

    return L.divIcon({
      html,
      className: 'custom-map-pin-container',
      iconSize: [40, 48],
      iconAnchor: [20, 24],
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
      });

      // Warm, high-clarity OpenStreetMap Carto tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[9px] text-[#9A958B]">© OpenStreetMap · Cooperative</span>',
        })
        .addTo(map);

      const markerGroup = L.layerGroup().addTo(map);
      markerLayersGroupRef.current = markerGroup;
      mapInstanceRef.current = map;

      // Handle map click
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (allowPinDrop && onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markerLayersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const points: Array<{ lat: number; lng: number }> = [];

    markers.forEach((marker) => {
      points.push(marker.coordinates);
      const isSelected = activeSelectedMarker?.id === marker.id || selectedMarkerId === marker.id;
      const icon = createMarkerIcon(marker, isSelected);

      const leafletMarker = L.marker([marker.coordinates.lat, marker.coordinates.lng], {
        icon,
        draggable: Boolean(marker.isDraggable),
        zIndexOffset: isSelected ? 1000 : marker.type === 'user' ? 500 : 100,
      });

      if (marker.isDraggable) {
        leafletMarker.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          if (onPinDragEnd) onPinDragEnd(latlng.lat, latlng.lng);
        });
      }

      leafletMarker.on('click', () => {
        setActiveSelectedMarker(marker);
        if (onMarkerClick) onMarkerClick(marker);
      });

      leafletMarker.addTo(group);

      // Render society radius circle if society marker
      if (marker.type === 'society') {
        L.circle([marker.coordinates.lat, marker.coordinates.lng], {
          radius: 800,
          color: '#504161',
          weight: 1.5,
          opacity: 0.4,
          fillColor: '#EFEBF4',
          fillOpacity: 0.15,
        }).addTo(group);
      }
    });

    // Auto-fit bounds if requested and markers exist
    if (autoFitBounds && points.length > 0) {
      const bounds = calculateBoundingBox(points, 0.008);
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 16,
        animate: true,
      });
    } else if (center) {
      map.setView(center, zoom, { animate: true });
    }

    // Invalidate size to prevent grey tiles after tab or modal transitions
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [markers, selectedMarkerId, activeSelectedMarker?.id, autoFitBounds, center, zoom, createMarkerIcon, allowPinDrop, onPinDragEnd, onMarkerClick]);

  // Handle Zoom In/Out
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-[#E8E2D5] bg-[#F8F4EC] shadow-card ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* MAP CANVAS CONTAINER */}
      <div ref={containerRef} className="w-full h-full" />

      {/* TOP CONTROLS BAR */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        {showLegend && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl border border-[#E8E2D5] text-[11px] font-bold text-[#292824] shadow-xs pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[#6E8B67]" />
            <span>{t('map.liveMap', 'Cooperative Live Map')}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto pointer-events-auto">
          {showLocateControl && (
            <button
              type="button"
              onClick={() => {
                if (onLocateUser) onLocateUser();
              }}
              title={t('map.locatePosition', 'Locate my position')}
              className="p-2 bg-white/95 hover:bg-[#F3EEE4] text-[#292824] rounded-xl border border-[#E8E2D5] shadow-xs transition-colors cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-[#6E8B67]" />
            </button>
          )}

          <div className="flex items-center bg-white/95 rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              title={t('map.zoomIn', 'Zoom in')}
              className="p-2 hover:bg-[#F3EEE4] text-[#292824] transition-colors border-r border-[#E8E2D5] cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title={t('map.zoomOut', 'Zoom out')}
              className="p-2 hover:bg-[#F3EEE4] text-[#292824] transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PIN DROP INSTRUCTION BANNER IF ENABLED */}
      {allowPinDrop && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#CFDDD0] text-xs font-semibold text-[#292824] shadow-md flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#6E8B67] shrink-0 animate-bounce" />
            <span>{t('map.pinDropInstruction', 'Tap map or drag pin to choose exact service location')}</span>
          </div>
          <span className="text-[10px] text-[#77736B] uppercase tracking-wider font-mono">{t('map.gpsPrecision', 'GPS Precision')}</span>
        </div>
      )}

      {/* INSPECTION BOTTOM SHEET / DETAIL POPUP (IF ENABLED) */}
      {showInspectorPanel && activeSelectedMarker && activeSelectedMarker.type === 'worker' && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 z-[400] p-4 bg-[#FCF9F3]/95 backdrop-blur-md rounded-2xl border border-[#E8E2D5] shadow-lg animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAEDE8] text-[#80432E]">
              {t('map.stationedSpecialist', 'Stationed Specialist')}
            </span>
            <button
              type="button"
              onClick={() => setActiveSelectedMarker(null)}
              className="text-xs text-[#77736B] hover:text-[#292824] font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={activeSelectedMarker.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
              alt={activeSelectedMarker.title}
              className="w-12 h-12 rounded-2xl object-cover border border-[#E8E2D5]"
            />
            <div>
              <h4 className="font-bold text-sm text-[#292824]">{activeSelectedMarker.title}</h4>
              <p className="text-xs text-[#80432E] font-semibold">{activeSelectedMarker.profession || t('map.specialist', 'Specialist')}</p>
              <div className="flex items-center gap-1 text-[11px] text-[#77736B] mt-0.5">
                <Star className="w-3 h-3 fill-[#B37055] text-[#B37055]" />
                <span className="font-bold font-mono text-[#292824]">4.9</span>
                <span>· {t('map.status', 'Status:')} <strong className="text-[#6E8B67]">{activeSelectedMarker.status || t('map.active', 'Active')}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
