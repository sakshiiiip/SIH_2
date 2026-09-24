import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from '../../hooks/useGeolocation';
import { CooperativeMap } from './Map/CooperativeMap';
import { Modal } from './Modal';
import { geocodingService, PRESET_LOCALITIES } from '../../services/geocodingService';
import { SavedLocationTag, UserSavedLocation, LocationAddress } from '../../types/location';
import {
  MapPin,
  Crosshair,
  Search,
  Check,
  Bookmark,
  Home,
  Briefcase,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationConfirmed?: (coords: { lat: number; lng: number }, address: LocationAddress) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationConfirmed,
}) => {
  const { t } = useTranslation();
  const {
    currentCoordinates,
    currentAddress,
    permissionStatus,
    isLoadingAddress,
    isDetectingGPS,
    savedLocations,
    selectedLocation,
    requestLocationPermission,
    detectCurrentGPSLocation,
    setManualLocation,
    selectSavedLocation,
    saveUserLocation,
    deleteSavedLocation,
  } = useGeolocation();

  // Local state during modal interaction
  const [tempLat, setTempLat] = useState(currentCoordinates.latitude);
  const [tempLng, setTempLng] = useState(currentCoordinates.longitude);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; address: LocationAddress }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [saveTag, setSaveTag] = useState<SavedLocationTag>('home');
  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);

  // Sync temp coordinates when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempLat(currentCoordinates.latitude);
      setTempLng(currentCoordinates.longitude);
      setSearchQuery('');
      setSearchResults([]);
      setShowSaveForm(false);
      setPermissionAlert(null);
    }
  }, [isOpen, currentCoordinates.latitude, currentCoordinates.longitude]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await geocodingService.searchAddress(searchQuery);
        setSearchResults(res);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUseCurrentGPS = async () => {
    setPermissionAlert(null);
    const result = await requestLocationPermission('Find verified cooperative workers in your exact society sector.');
    if (!result) {
      if (permissionStatus === 'denied') {
        setPermissionAlert(t('location.permissionDenied', { defaultValue: 'Location permission is disabled in your browser. You can select your address from the search bar or move the pin on the map.' }));
      } else {
        setPermissionAlert(t('location.satelliteFailed', { defaultValue: 'Unable to acquire exact GPS satellite fix. Using approximate sector location.' }));
      }
    } else {
      setTempLat(currentCoordinates.latitude);
      setTempLng(currentCoordinates.longitude);
    }
  };

  const handleMapPinMove = async (lat: number, lng: number) => {
    setTempLat(lat);
    setTempLng(lng);
    await setManualLocation(lat, lng);
  };

  const handleSelectSearchResult = async (item: { lat: number; lng: number; address: LocationAddress }) => {
    setTempLat(item.lat);
    setTempLng(item.lng);
    setSearchQuery('');
    setSearchResults([]);
    await setManualLocation(item.lat, item.lng, item.address);
  };

  const handleSaveCurrentBookmark = () => {
    if (!saveLabel.trim()) return;
    saveUserLocation(
      saveLabel.trim(),
      saveTag,
      {
        latitude: tempLat,
        longitude: tempLng,
        accuracy: 10,
        timestamp: Date.now(),
      },
      currentAddress
    );
    setShowSaveForm(false);
    setSaveLabel('');
  };

  const handleConfirm = () => {
    if (onLocationConfirmed) {
      onLocationConfirmed({ lat: tempLat, lng: tempLng }, currentAddress);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('location.chooseTitle', { defaultValue: 'Choose Service Location' })}
      subtitle={t('location.chooseSubtitle', { defaultValue: 'Find stationed specialists and calculate exact arrival distance' })}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* TOP SEARCH & CURRENT GPS ACTION */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9A958B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={t('location.searchPlaceholder', { defaultValue: 'Search society, building, or area in Pune...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#6E8B67]"
              />
              {isSearching && (
                <div className="w-3.5 h-3.5 border-2 border-[#6E8B67] border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            <button
              type="button"
              onClick={handleUseCurrentGPS}
              disabled={isDetectingGPS}
              className="px-3.5 py-2.5 bg-[#E6ECE4] hover:bg-[#CFDDD0] text-[#364A32] border border-[#CFDDD0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Crosshair className={`w-4 h-4 ${isDetectingGPS ? 'animate-spin' : 'text-[#6E8B67]'}`} />
              <span className="hidden sm:inline">{t('location.useGPS', { defaultValue: 'Use GPS' })}</span>
            </button>
          </div>

          {/* PERMISSION ERROR ALERT IF ANY */}
          {permissionAlert && (
            <div className="p-3 bg-[#FAEDE8] border border-[#F3C5B8] rounded-xl flex items-start gap-2.5 text-xs text-[#80432E] animate-fade-in">
              <AlertCircle className="w-4 h-4 text-[#C93B2B] shrink-0 mt-0.5" />
              <span>{permissionAlert}</span>
            </div>
          )}

          {/* AUTOCOMPLETE SEARCH RESULTS */}
          {searchResults.length > 0 && (
            <div className="bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl overflow-hidden shadow-dropdown divide-y divide-[#E8E2D5] max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full p-3 text-left hover:bg-[#E6ECE4]/70 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
                >
                  <MapPin className="w-4 h-4 text-[#6E8B67] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#292824] block">{item.address.displayName || item.address.locality}</strong>
                    <span className="text-[#77736B] text-[11px] block">{item.address.formattedAddress}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INTERACTIVE LEAFLET MAP WITH DRAGGABLE PIN */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#77736B]">
            <span className="font-bold text-[#292824] uppercase text-[10px] tracking-wider">
              {t('location.interactiveMapPin', { defaultValue: 'Interactive Map Pin' })}
            </span>
            <span>{t('location.dragPinNotice', { defaultValue: 'Drag pin to fine-tune doorstep location' })}</span>
          </div>

          <CooperativeMap
            height={260}
            center={[tempLat, tempLng]}
            zoom={15}
            allowPinDrop={true}
            autoFitBounds={false}
            showLocateControl={true}
            onPinDragEnd={handleMapPinMove}
            onMapClick={handleMapPinMove}
            onLocateUser={handleUseCurrentGPS}
            markers={[
              {
                id: 'active_target_pin',
                type: 'user',
                title: t('location.selectedLocation', { defaultValue: 'Selected Location' }),
                coordinates: { lat: tempLat, lng: tempLng },
                isDraggable: true,
              },
            ]}
          />
        </div>

        {/* SELECTED ADDRESS CARD */}
        <div className="p-3.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#E6ECE4] border border-[#CFDDD0] flex items-center justify-center text-[#445D3E] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block leading-tight">
                {t('location.resolvedAddress', { defaultValue: 'Resolved Doorstep Address' })}
              </span>
              <strong className="text-xs text-[#292824] font-bold block truncate">
                {isLoadingAddress ? t('location.resolvingAddress', { defaultValue: 'Resolving street & society details...' }) : currentAddress.formattedAddress}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#E8E2D5] text-[#524E47] border border-[#E8E2D5] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#80432E]" />
            <span className="hidden sm:inline">{t('common.save', { defaultValue: 'Save' })}</span>
          </button>
        </div>

        {/* SAVE BOOKMARK MINI FORM */}
        {showSaveForm && (
          <div className="p-3.5 bg-[#FAEDE8]/50 border border-[#F3C5B8] rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#80432E]">{t('location.bookmarkLocation', { defaultValue: 'Bookmark this location' })}</span>
              <div className="flex items-center gap-1 text-xs">
                {(['home', 'work', 'other'] as SavedLocationTag[]).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSaveTag(tag)}
                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] cursor-pointer ${
                      saveTag === tag
                        ? 'bg-[#80432E] text-white'
                        : 'bg-white text-[#77736B] border border-[#E8E2D5]'
                    }`}
                  >
                    {tag === 'home' ? t('location.home', { defaultValue: 'home' }) : tag === 'work' ? t('location.work', { defaultValue: 'work' }) : t('location.other', { defaultValue: 'other' })}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('location.savePlaceholder', { defaultValue: 'e.g., Home (Flat 402), Parents Flat...' })}
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                className="flex-1 p-2 bg-white border border-[#E8E2D5] rounded-xl text-xs text-[#292824] focus:outline-none focus:ring-1 focus:ring-[#80432E]"
              />
              <button
                type="button"
                onClick={handleSaveCurrentBookmark}
                disabled={!saveLabel.trim()}
                className="px-3.5 py-2 bg-[#80432E] hover:bg-[#683625] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('common.save', { defaultValue: 'Save' })}
              </button>
            </div>
          </div>
        )}

        {/* SAVED BOOKMARKS LIST */}
        {savedLocations.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#77736B] block mb-1.5">
              {t('location.savedPlaces', { defaultValue: 'Saved Places' })}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {savedLocations.map((loc) => {
                const isSelected =
                  Math.abs(loc.coordinates.latitude - tempLat) < 0.0005 &&
                  Math.abs(loc.coordinates.longitude - tempLng) < 0.0005;

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      selectSavedLocation(loc.id);
                      setTempLat(loc.coordinates.latitude);
                      setTempLng(loc.coordinates.longitude);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#E6ECE4] border-[#6E8B67] text-[#2A3927]'
                        : 'bg-[#FCF9F3] border-[#E8E2D5] hover:border-[#CFDDD0] text-[#524E47]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {loc.tag === 'home' ? (
                        <Home className="w-3.5 h-3.5 text-[#6E8B67] shrink-0" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5 text-[#537895] shrink-0" />
                      )}
                      <div className="truncate">
                        <strong className="text-xs font-bold block truncate">{loc.label}</strong>
                        <span className="text-[10px] text-[#77736B] block truncate">{loc.address.locality}</span>
                      </div>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-[#6E8B67] shrink-0" />
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedLocation(loc.id);
                        }}
                        className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-[#9A958B]" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#292824] transition-colors cursor-pointer"
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-[#6E8B67] hover:bg-[#587352] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t('location.confirmLocation', { defaultValue: 'Confirm Service Location' })}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
