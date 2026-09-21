import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GeoCoordinates,
  LocationAddress,
  LocationPermissionStatus,
  UserSavedLocation,
  SavedLocationTag,
  WorkerTrackingState,
  EmergencyLocationSnapshot,
} from '../types/location';
import { geolocationService, DEFAULT_COORDINATES } from '../services/geolocationService';
import { geocodingService, PRESET_LOCALITIES } from '../services/geocodingService';
import { generateGoogleMapsUrl } from '../utils/geoUtils';

const SAVED_LOCATIONS_STORAGE_KEY = 'cooperative_saved_locations_v2';
const WORKER_TRACKING_STORAGE_KEY = 'cooperative_worker_tracking_v2';

const DEFAULT_SAVED_LOCATIONS: UserSavedLocation[] = [
  {
    id: 'loc_home_gr',
    label: 'Home (Tower B)',
    tag: 'home',
    coordinates: {
      latitude: 18.5590,
      longitude: 73.7868,
      accuracy: 10,
      timestamp: Date.now(),
    },
    address: {
      formattedAddress: 'Flat 402, Tower B, Green Residency, Baner Rd, Pune 411045',
      locality: 'Baner',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      displayName: 'Green Residency, Baner',
    },
    isDefault: true,
  },
  {
    id: 'loc_work_balewadi',
    label: 'Office (High Street)',
    tag: 'work',
    coordinates: {
      latitude: 18.5742,
      longitude: 73.7725,
      accuracy: 15,
      timestamp: Date.now(),
    },
    address: {
      formattedAddress: 'Unit 304, High Street Plaza, Balewadi, Pune 411045',
      locality: 'Balewadi',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      displayName: 'Balewadi High St',
    },
  },
];

interface LocationContextType {
  // Current active location for booking and discovery
  currentCoordinates: GeoCoordinates;
  currentAddress: LocationAddress;
  permissionStatus: LocationPermissionStatus;
  isLoadingAddress: boolean;
  isDetectingGPS: boolean;
  
  // Saved bookmarks
  savedLocations: UserSavedLocation[];
  selectedLocation: UserSavedLocation | null;
  
  // Worker Live Tracking
  workerTracking: WorkerTrackingState;
  
  // Actions
  requestLocationPermission: (reason?: string) => Promise<boolean>;
  detectCurrentGPSLocation: (silent?: boolean) => Promise<GeoCoordinates | null>;
  setManualLocation: (lat: number, lng: number, addressOverride?: Partial<LocationAddress>) => Promise<void>;
  selectSavedLocation: (locationId: string) => void;
  saveUserLocation: (label: string, tag: SavedLocationTag, coords: GeoCoordinates, address: LocationAddress) => UserSavedLocation;
  deleteSavedLocation: (id: string) => void;
  toggleWorkerLocationSharing: (workerId: string, enabled?: boolean) => void;
  updateWorkerLivePosition: (workerId: string, lat: number, lng: number) => void;
  captureSOSSnapshot: (bookingId?: string, reporterRole?: 'customer' | 'worker', reporterName?: string) => Promise<EmergencyLocationSnapshot>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCoordinates, setCurrentCoordinates] = useState<GeoCoordinates>(() => {
    return { ...DEFAULT_COORDINATES, timestamp: Date.now() };
  });

  const [currentAddress, setCurrentAddress] = useState<LocationAddress>(() => {
    return PRESET_LOCALITIES[0].address;
  });

  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('prompt');
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);

  // Saved locations
  const [savedLocations, setSavedLocations] = useState<UserSavedLocation[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SAVED_LOCATIONS;
    } catch {
      return DEFAULT_SAVED_LOCATIONS;
    }
  });

  const [selectedLocation, setSelectedLocation] = useState<UserSavedLocation | null>(() => {
    return savedLocations.find((l) => l.isDefault) || savedLocations[0] || null;
  });

  // Worker live location tracking state
  const [workerTracking, setWorkerTracking] = useState<WorkerTrackingState>(() => {
    try {
      const stored = localStorage.getItem(WORKER_TRACKING_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      isSharing: true,
      workerId: 'w_rahul',
      status: 'online',
      lastCoordinates: { ...DEFAULT_COORDINATES, timestamp: Date.now() },
      lastUpdated: 'Just now',
      accuracyMeters: 12,
    };
  });

  // Worker GPS watcher ref
  const workerWatchStopRef = useRef<(() => void) | null>(null);

  // Persist saved locations
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(savedLocations));
    } catch {}
  }, [savedLocations]);

  // Persist worker tracking
  useEffect(() => {
    try {
      localStorage.setItem(WORKER_TRACKING_STORAGE_KEY, JSON.stringify(workerTracking));
    } catch {}
  }, [workerTracking]);

  // Check initial permission status silently without prompting user
  useEffect(() => {
    geolocationService.queryPermissionStatus().then((status) => {
      setPermissionStatus(status);
    });
  }, []);

  /**
   * Resolves address from coordinates and caches it.
   */
  const resolveAddressForCoords = useCallback(async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const addr = await geocodingService.reverseGeocode(lat, lng);
      setCurrentAddress(addr);
    } catch (err) {
      console.warn('Address resolve warning:', err);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  /**
   * Explicit user-triggered permission request.
   */
  const requestLocationPermission = useCallback(async (_reason?: string): Promise<boolean> => {
    setIsDetectingGPS(true);
    try {
      const result = await geolocationService.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      });

      setPermissionStatus(result.status);
      if (result.status === 'granted') {
        setCurrentCoordinates(result.coordinates);
        await resolveAddressForCoords(result.coordinates.latitude, result.coordinates.longitude);
        return true;
      }
      return false;
    } catch {
      setPermissionStatus('unavailable');
      return false;
    } finally {
      setIsDetectingGPS(false);
    }
  }, [resolveAddressForCoords]);

  /**
   * Detect current GPS location
   */
  const detectCurrentGPSLocation = useCallback(async (silent = false): Promise<GeoCoordinates | null> => {
    if (!silent) setIsDetectingGPS(true);
    try {
      const result = await geolocationService.getCurrentPosition();
      setPermissionStatus(result.status);
      if (result.status === 'granted') {
        setCurrentCoordinates(result.coordinates);
        await resolveAddressForCoords(result.coordinates.latitude, result.coordinates.longitude);
        return result.coordinates;
      }
      return null;
    } catch {
      return null;
    } finally {
      if (!silent) setIsDetectingGPS(false);
    }
  }, [resolveAddressForCoords]);

  /**
   * Set manual location (via map pin drag or address search)
   */
  const setManualLocation = useCallback(
    async (lat: number, lng: number, addressOverride?: Partial<LocationAddress>) => {
      const newCoords: GeoCoordinates = {
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        accuracy: 10,
        timestamp: Date.now(),
      };
      setCurrentCoordinates(newCoords);

      if (addressOverride && addressOverride.formattedAddress) {
        setCurrentAddress((prev) => ({
          ...prev,
          ...addressOverride,
          formattedAddress: addressOverride.formattedAddress!,
        }));
      } else {
        await resolveAddressForCoords(lat, lng);
      }
    },
    [resolveAddressForCoords]
  );

  /**
   * Select a saved location
   */
  const selectSavedLocation = useCallback((locationId: string) => {
    const loc = savedLocations.find((l) => l.id === locationId);
    if (loc) {
      setSelectedLocation(loc);
      setCurrentCoordinates(loc.coordinates);
      setCurrentAddress(loc.address);
    }
  }, [savedLocations]);

  /**
   * Add a new saved bookmark
   */
  const saveUserLocation = useCallback(
    (label: string, tag: SavedLocationTag, coords: GeoCoordinates, address: LocationAddress): UserSavedLocation => {
      const newLoc: UserSavedLocation = {
        id: `loc_${Date.now()}`,
        label,
        tag,
        coordinates: coords,
        address,
      };

      setSavedLocations((prev) => [newLoc, ...prev]);
      setSelectedLocation(newLoc);
      return newLoc;
    },
    []
  );

  /**
   * Delete saved bookmark
   */
  const deleteSavedLocation = useCallback((id: string) => {
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
    setSelectedLocation((prev) => (prev?.id === id ? null : prev));
  }, []);

  /**
   * Toggle worker live location telemetry
   */
  const toggleWorkerLocationSharing = useCallback((workerId: string, enabled?: boolean) => {
    setWorkerTracking((prev) => {
      const nextState = enabled !== undefined ? enabled : !prev.isSharing;
      if (!nextState && workerWatchStopRef.current) {
        workerWatchStopRef.current();
        workerWatchStopRef.current = null;
      }
      return {
        ...prev,
        workerId,
        isSharing: nextState,
        status: nextState ? 'online' : 'offline',
        lastUpdated: nextState ? 'Just now' : 'Location paused',
      };
    });
  }, []);

  /**
   * Update worker coordinates
   */
  const updateWorkerLivePosition = useCallback((workerId: string, lat: number, lng: number) => {
    setWorkerTracking((prev) => ({
      ...prev,
      workerId,
      lastCoordinates: {
        latitude: lat,
        longitude: lng,
        accuracy: 12,
        timestamp: Date.now(),
      },
      lastUpdated: 'Just now',
    }));
  }, []);

  /**
   * Capture high-priority instant snapshot for SOS emergency
   */
  const captureSOSSnapshot = useCallback(
    async (
      bookingId?: string,
      reporterRole: 'customer' | 'worker' = 'customer',
      reporterName = 'User'
    ): Promise<EmergencyLocationSnapshot> => {
      // Attempt fresh GPS reading, fallback to currentCoordinates
      let coords = currentCoordinates;
      try {
        const fresh = await geolocationService.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000,
        });
        if (fresh.status === 'granted') {
          coords = fresh.coordinates;
        }
      } catch {}

      const addr = currentAddress.formattedAddress || `${coords.latitude}, ${coords.longitude}`;
      const mapsUrl = generateGoogleMapsUrl(coords.latitude, coords.longitude, `SOS Emergency - ${reporterName}`);

      return {
        ticketId: `SOS-${Date.now().toString().slice(-6)}`,
        bookingId,
        reporterRole,
        reporterName,
        coordinates: coords,
        address: addr,
        googleMapsUrl: mapsUrl,
        timestamp: new Date().toISOString(),
      };
    },
    [currentCoordinates, currentAddress]
  );

  return (
    <LocationContext.Provider
      value={{
        currentCoordinates,
        currentAddress,
        permissionStatus,
        isLoadingAddress,
        isDetectingGPS,
        savedLocations,
        selectedLocation,
        workerTracking,
        requestLocationPermission,
        detectCurrentGPSLocation,
        setManualLocation,
        selectSavedLocation,
        saveUserLocation,
        deleteSavedLocation,
        toggleWorkerLocationSharing,
        updateWorkerLivePosition,
        captureSOSSnapshot,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
