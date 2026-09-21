export type LocationPermissionStatus =
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // In meters
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface LocationAddress {
  formattedAddress: string;
  locality?: string;
  sublocality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  landmark?: string;
  displayName?: string;
}

export type SavedLocationTag = 'home' | 'work' | 'other';

export interface UserSavedLocation {
  id: string;
  label: string;
  tag: SavedLocationTag;
  coordinates: GeoCoordinates;
  address: LocationAddress;
  isDefault?: boolean;
}

export interface WorkerTrackingState {
  isSharing: boolean;
  workerId: string;
  status: 'online' | 'busy' | 'offline';
  lastCoordinates?: GeoCoordinates;
  lastUpdated?: string;
  accuracyMeters?: number;
  activeBookingId?: string;
}

export interface ActiveJobLocationTelemetry {
  bookingId: string;
  customerCoordinates: GeoCoordinates;
  workerCoordinates?: GeoCoordinates;
  distanceMeters: number;
  distanceFormatted: string;
  etaMinutes: number;
  etaFormatted: string;
  workerStatus: 'CONFIRMED' | 'TRAVELLING' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
  lastUpdated: number;
}

export interface EmergencyLocationSnapshot {
  ticketId: string;
  bookingId?: string;
  reporterRole: 'customer' | 'worker';
  reporterName: string;
  coordinates: GeoCoordinates;
  address: string;
  googleMapsUrl: string;
  timestamp: string;
}

export interface MapMarkerEntity {
  id: string;
  type: 'user' | 'worker' | 'job' | 'society' | 'cluster';
  title: string;
  subtitle?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status?: string;
  badge?: string;
  avatar?: string;
  profession?: string;
  urgencyTier?: 'STANDARD' | 'URGENT' | 'EMERGENCY';
  isDraggable?: boolean;
  data?: any;
}
