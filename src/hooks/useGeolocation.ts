import { useLocationContext } from '../context/LocationContext';
import {
  calculateHaversineDistanceKm,
  formatDistance,
  estimateETA,
  generateGoogleMapsUrl,
  generateGoogleDirectionsUrl,
} from '../utils/geoUtils';

/**
 * Convenient custom hook for accessing platform geolocation services and utilities.
 */
export const useGeolocation = () => {
  const locationCtx = useLocationContext();

  /**
   * Calculates distance between user's current location and a target.
   */
  const getDistanceFromUser = (targetLat: number, targetLng: number) => {
    const km = calculateHaversineDistanceKm(
      locationCtx.currentCoordinates.latitude,
      locationCtx.currentCoordinates.longitude,
      targetLat,
      targetLng
    );
    return {
      km,
      formatted: formatDistance(km),
      eta: estimateETA(km),
    };
  };

  /**
   * Calculates distance and ETA between any two points.
   */
  const getDistanceBetween = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const km = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
    return {
      km,
      formatted: formatDistance(km),
      eta: estimateETA(km),
    };
  };

  return {
    ...locationCtx,
    getDistanceFromUser,
    getDistanceBetween,
    formatDistance,
    estimateETA,
    generateGoogleMapsUrl,
    generateGoogleDirectionsUrl,
  };
};
