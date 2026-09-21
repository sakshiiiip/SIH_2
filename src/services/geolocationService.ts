import { GeoCoordinates, LocationPermissionStatus } from '../types/location';

export interface GeolocationPositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const DEFAULT_COORDINATES: GeoCoordinates = {
  latitude: 18.5590,
  longitude: 73.7868,
  accuracy: 15,
  timestamp: Date.now(),
};

class GeolocationService {
  private activeWatchId: number | null = null;

  /**
   * Queries current permission state if supported by the browser.
   */
  public async queryPermissionStatus(): Promise<LocationPermissionStatus> {
    if (typeof window === 'undefined' || !navigator) {
      return 'unsupported';
    }

    if (!navigator.geolocation) {
      return 'unsupported';
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (result.state === 'granted') return 'granted';
        if (result.state === 'denied') return 'denied';
        return 'prompt';
      } catch {
        // Fall back to prompt if permissions API fails
        return 'prompt';
      }
    }

    return 'prompt';
  }

  /**
   * Requests current GPS position with high accuracy and a graceful low-accuracy fallback.
   */
  public getCurrentPosition(
    options: GeolocationPositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }
  ): Promise<{ coordinates: GeoCoordinates; status: LocationPermissionStatus }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve({
          coordinates: { ...DEFAULT_COORDINATES, timestamp: Date.now() },
          status: 'unsupported',
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeoCoordinates = {
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
            accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : 15,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp || Date.now(),
          };
          resolve({ coordinates: coords, status: 'granted' });
        },
        (error) => {
          // If high accuracy timed out, retry once with low accuracy (standard battery-saver cellular triangulation)
          if (error.code === error.TIMEOUT && options.enableHighAccuracy) {
            navigator.geolocation.getCurrentPosition(
              (fallbackPos) => {
                resolve({
                  coordinates: {
                    latitude: parseFloat(fallbackPos.coords.latitude.toFixed(6)),
                    longitude: parseFloat(fallbackPos.coords.longitude.toFixed(6)),
                    accuracy: Math.round(fallbackPos.coords.accuracy || 80),
                    timestamp: fallbackPos.timestamp || Date.now(),
                  },
                  status: 'granted',
                });
              },
              () => {
                resolve({
                  coordinates: { ...DEFAULT_COORDINATES, timestamp: Date.now() },
                  status: 'timeout',
                });
              },
              { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
            );
            return;
          }

          let mappedStatus: LocationPermissionStatus = 'unavailable';
          if (error.code === error.PERMISSION_DENIED) {
            mappedStatus = 'denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            mappedStatus = 'unavailable';
          } else if (error.code === error.TIMEOUT) {
            mappedStatus = 'timeout';
          }

          resolve({
            coordinates: { ...DEFAULT_COORDINATES, timestamp: Date.now() },
            status: mappedStatus,
          });
        },
        options
      );
    });
  }

  /**
   * Subscribes to live position updates (e.g. for worker active job transit).
   */
  public watchPosition(
    onSuccess: (coords: GeoCoordinates) => void,
    onError?: (status: LocationPermissionStatus) => void,
    options: GeolocationPositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    }
  ): () => void {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (onError) onError('unsupported');
      return () => {};
    }

    // Clear existing watch if active
    this.stopWatching();

    this.activeWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: GeoCoordinates = {
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy || 15),
          altitude: pos.coords.altitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp || Date.now(),
        };
        onSuccess(coords);
      },
      (err) => {
        let status: LocationPermissionStatus = 'unavailable';
        if (err.code === err.PERMISSION_DENIED) status = 'denied';
        else if (err.code === err.TIMEOUT) status = 'timeout';
        if (onError) onError(status);
      },
      options
    );

    return () => this.stopWatching();
  }

  public stopWatching(): void {
    if (this.activeWatchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.activeWatchId);
      this.activeWatchId = null;
    }
  }
}

export const geolocationService = new GeolocationService();
