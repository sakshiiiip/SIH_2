/**
 * Geospatial Utilities for Cooperative Platform
 * Production-ready calculations for distance, ETA estimation, bounding box,
 * privacy obfuscation, and Google Maps integration.
 */

const EARTH_RADIUS_KM = 6371.0;
const EARTH_RADIUS_METERS = 6371000.0;

/**
 * Calculates great-circle distance between two points on a sphere using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const toRad = (degree: number) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  return parseFloat(distance.toFixed(2));
}

/**
 * Calculates distance in meters.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const km = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
  return Math.round(km * 1000);
}

/**
 * Formats a distance in meters or kilometers into human-readable string.
 * Example: 450m -> "450 m", 2.34km -> "2.3 km"
 */
export function formatDistance(distanceInKm: number): string {
  if (isNaN(distanceInKm) || distanceInKm < 0) return '0 m';

  if (distanceInKm < 1.0) {
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}

/**
 * Dynamic ETA estimator based on realistic Indian city/urban transit speeds.
 * Uses ~22 km/h for cooperative worker two-wheelers with a 2-minute departure buffer.
 */
export function estimateETA(distanceKm: number): {
  minutes: number;
  formatted: string;
} {
  if (isNaN(distanceKm) || distanceKm <= 0.05) {
    return { minutes: 2, formatted: '< 3 mins' };
  }

  // Average urban speed: 22 km/h (including signals & turns)
  const averageSpeedKmH = 22;
  const travelHours = distanceKm / averageSpeedKmH;
  const travelMinutes = travelHours * 60;

  // Add 2 min preparation / elevator / gate access buffer
  const totalMinutes = Math.max(3, Math.round(travelMinutes + 2));

  if (totalMinutes < 60) {
    return {
      minutes: totalMinutes,
      formatted: `${totalMinutes} min${totalMinutes > 1 ? 's' : ''}`,
    };
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  return {
    minutes: totalMinutes,
    formatted: `${hours} hr ${remainingMins} min`,
  };
}

/**
 * Generates an intelligent bounding box for Leaflet map to fit multiple coordinate points.
 */
export function calculateBoundingBox(
  points: Array<{ lat: number; lng: number }>,
  paddingRatio = 0.005
): [[number, number], [number, number]] {
  if (!points || points.length === 0) {
    // Default to Pune Cooperative Centre
    return [
      [18.5204 - paddingRatio, 73.8567 - paddingRatio],
      [18.5204 + paddingRatio, 73.8567 + paddingRatio],
    ];
  }

  if (points.length === 1) {
    const p = points[0];
    const defaultOffset = 0.01;
    return [
      [p.lat - defaultOffset, p.lng - defaultOffset],
      [p.lat + defaultOffset, p.lng + defaultOffset],
    ];
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  points.forEach((p) => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  const latDelta = Math.max(0.005, (maxLat - minLat) * 0.15);
  const lngDelta = Math.max(0.005, (maxLng - minLng) * 0.15);

  return [
    [minLat - latDelta, minLng - lngDelta],
    [maxLat + latDelta, maxLng + lngDelta],
  ];
}

/**
 * Privacy protection: Obfuscates exact coordinates to an approximate cluster centroid
 * when exact worker coordinates should not be visible to public users.
 */
export function obfuscateCoordinates(
  lat: number,
  lng: number,
  offsetMeters = 250
): { lat: number; lng: number } {
  // Approximate conversion: 1 deg lat ~= 111km, 1 deg lon ~= 111km * cos(lat)
  const latOffset = (offsetMeters / 111000) * 0.5;
  const lonOffset = (offsetMeters / (111000 * Math.cos((lat * Math.PI) / 180))) * 0.5;

  return {
    lat: parseFloat((lat + latOffset).toFixed(4)),
    lng: parseFloat((lng + lonOffset).toFixed(4)),
  };
}

/**
 * Generates direct Google Maps URL for pinpointing a location or landmark.
 */
export function generateGoogleMapsUrl(
  lat: number,
  lng: number,
  label?: string
): string {
  const query = label ? encodeURIComponent(`${label} (${lat},${lng})`) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Generates turn-by-turn navigation / directions URL for workers travelling to customer residence.
 */
export function generateGoogleDirectionsUrl(
  destLat: number,
  destLng: number,
  originLat?: number,
  originLng?: number
): string {
  if (originLat !== undefined && originLng !== undefined) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=two-wheeler`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=two-wheeler`;
}

/**
 * Checks if a target location is within a given radius (km) of a center.
 */
export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean {
  return calculateHaversineDistanceKm(centerLat, centerLng, targetLat, targetLng) <= radiusKm;
}
