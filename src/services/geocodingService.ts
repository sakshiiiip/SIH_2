import { LocationAddress } from '../types/location';

interface GeocodeCacheEntry {
  address: LocationAddress;
  timestamp: number;
}

// Pre-indexed local societies & localities for instant offline/fallback resolution
export const PRESET_LOCALITIES: Array<{
  name: string;
  societyId?: string;
  lat: number;
  lng: number;
  address: LocationAddress;
}> = [
  {
    name: 'Green Residency, Baner',
    societyId: 'soc_gr',
    lat: 18.5590,
    lng: 73.7868,
    address: {
      formattedAddress: 'Green Residency, Baner Road, Pune 411045',
      locality: 'Baner',
      sublocality: 'Sector 4',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      country: 'India',
      landmark: 'Near Baner Hill Footpath',
      displayName: 'Green Residency, Baner Rd',
    },
  },
  {
    name: 'Lakeview Society, Pashan',
    societyId: 'soc_ls',
    lat: 18.5362,
    lng: 73.7925,
    address: {
      formattedAddress: 'Lakeview Society, Pashan Lake Road, Pune 411021',
      locality: 'Pashan',
      sublocality: 'Lakeview Enclave',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411021',
      country: 'India',
      landmark: 'Opposite Pashan Bird Sanctuary',
      displayName: 'Lakeview Society, Pashan',
    },
  },
  {
    name: 'Sunrise Apartments, Kothrud',
    societyId: 'soc_sa',
    lat: 18.5074,
    lng: 73.8077,
    address: {
      formattedAddress: 'Sunrise Apartments, Paud Road, Kothrud, Pune 411038',
      locality: 'Kothrud',
      sublocality: 'Paud Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411038',
      country: 'India',
      landmark: 'Near Ideal Colony Metro Station',
      displayName: 'Sunrise Apartments, Kothrud',
    },
  },
  {
    name: 'Palm Heights, Balewadi',
    societyId: 'soc_ph',
    lat: 18.5742,
    lng: 73.7725,
    address: {
      formattedAddress: 'Palm Heights, High Street, Balewadi, Pune 411045',
      locality: 'Balewadi',
      sublocality: 'Balewadi High Street',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      country: 'India',
      landmark: 'Near Balewadi Stadium',
      displayName: 'Palm Heights, Balewadi',
    },
  },
  {
    name: 'River View, Aundh',
    societyId: 'soc_rv',
    lat: 18.5629,
    lng: 73.8087,
    address: {
      formattedAddress: 'River View Apartments, DP Road, Aundh, Pune 411007',
      locality: 'Aundh',
      sublocality: 'DP Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411007',
      country: 'India',
      landmark: 'Near Westend Mall',
      displayName: 'River View, Aundh',
    },
  },
  {
    name: 'Harmony Towers, Wakad',
    societyId: 'soc_ht',
    lat: 18.5987,
    lng: 73.7628,
    address: {
      formattedAddress: 'Harmony Towers, Dange Chowk, Wakad, Pune 411057',
      locality: 'Wakad',
      sublocality: 'Dange Chowk',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411057',
      country: 'India',
      landmark: 'Near Ginger Hotel',
      displayName: 'Harmony Towers, Wakad',
    },
  },
  {
    name: 'Silver Oaks, Bavdhan',
    societyId: 'soc_so',
    lat: 18.5135,
    lng: 73.7742,
    address: {
      formattedAddress: 'Silver Oaks, NDA Road, Bavdhan, Pune 411021',
      locality: 'Bavdhan',
      sublocality: 'Bavdhan Khurd',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411021',
      country: 'India',
      landmark: 'Near Chandani Chowk',
      displayName: 'Silver Oaks, Bavdhan',
    },
  },
  {
    name: 'Emerald Heights, Hinjewadi',
    societyId: 'soc_eh',
    lat: 18.5912,
    lng: 73.7389,
    address: {
      formattedAddress: 'Emerald Heights, Phase 1, Hinjewadi Rajiv Gandhi Infotech Park, Pune 411057',
      locality: 'Hinjewadi',
      sublocality: 'Phase 1',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411057',
      country: 'India',
      landmark: 'Near Infosys Circle',
      displayName: 'Emerald Heights, Hinjewadi',
    },
  },
];

class GeocodingService {
  private cache = new Map<string, GeocodeCacheEntry>();
  private lastRequestTime = 0;
  private readonly minRequestIntervalMs = 1100; // Nominatim compliance: 1 request/second max

  private getCacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(4)},${lng.toFixed(4)}`;
  }

  /**
   * Finds closest matching preset landmark if within 1.2km radius.
   */
  private findClosestPreset(lat: number, lng: number): LocationAddress | null {
    let closest: typeof PRESET_LOCALITIES[0] | null = null;
    let minDistance = Infinity;

    for (const preset of PRESET_LOCALITIES) {
      const dLat = preset.lat - lat;
      const dLng = preset.lng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = preset;
      }
    }

    // ~0.015 degrees is roughly ~1.6km
    if (closest && minDistance < 0.015) {
      return closest.address;
    }
    return null;
  }

  /**
   * Respectful rate limiter to prevent API 429 throttling
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestIntervalMs) {
      await new Promise((res) => setTimeout(res, this.minRequestIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Converts latitude & longitude coordinates into a human-readable structured address.
   */
  public async reverseGeocode(lat: number, lng: number): Promise<LocationAddress> {
    const cacheKey = this.getCacheKey(lat, lng);
    const cached = this.cache.get(cacheKey);

    // Use cached entry if fresher than 24 hours
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.address;
    }

    // Check preset landmark first for instant performance
    const preset = this.findClosestPreset(lat, lng);

    try {
      await this.throttle();
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CooperativePlatform/2.0 (GigServicesCoop)',
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocode failed with HTTP status ${response.status}`);
      }

      const data = await response.json();
      const addr = data.address || {};

      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        preset?.locality ||
        'Local Area';

      const city = addr.city || addr.state_district || addr.county || preset?.city || 'Pune';
      const state = addr.state || preset?.state || 'Maharashtra';
      const postalCode = addr.postcode || preset?.postalCode || '411045';
      const country = addr.country || 'India';

      const formattedParts = [
        addr.road || addr.pedestrian || preset?.displayName,
        locality,
        city,
        postalCode,
      ].filter(Boolean);

      const resolvedAddress: LocationAddress = {
        formattedAddress: formattedParts.length > 0 ? formattedParts.join(', ') : data.display_name || `${locality}, ${city}`,
        locality,
        sublocality: addr.suburb || addr.neighbourhood,
        city,
        state,
        postalCode,
        country,
        landmark: addr.building || addr.amenity || preset?.landmark,
        displayName: `${locality}, ${city}`,
      };

      this.cache.set(cacheKey, { address: resolvedAddress, timestamp: Date.now() });
      return resolvedAddress;
    } catch (err) {
      console.warn('Network geocode fallback triggered:', err);
      if (preset) {
        return preset;
      }
      // Clean fallback if completely offline
      return {
        formattedAddress: `Sector Sector (${lat.toFixed(4)}, ${lng.toFixed(4)}), Pune`,
        locality: 'Baner & Western Sector',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411045',
        country: 'India',
        displayName: `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      };
    }
  }

  /**
   * Searches places by text query with suggestions.
   */
  public async searchAddress(
    query: string
  ): Promise<Array<{ lat: number; lng: number; address: LocationAddress }>> {
    if (!query || query.trim().length < 2) return [];

    const qLower = query.toLowerCase().trim();

    // 1. Check local preset matches first
    const presetMatches = PRESET_LOCALITIES.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        p.address.formattedAddress.toLowerCase().includes(qLower) ||
        p.address.locality?.toLowerCase().includes(qLower)
    ).map((p) => ({
      lat: p.lat,
      lng: p.lng,
      address: p.address,
    }));

    if (presetMatches.length > 0 && query.length < 5) {
      return presetMatches;
    }

    try {
      await this.throttle();
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query + ', Maharashtra, India'
      )}&addressdetails=1&limit=5`;

      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CooperativePlatform/2.0 (GigServicesCoop)',
        },
      });

      if (!response.ok) return presetMatches;

      const results = await response.json();
      const mapped = results.map((item: any) => {
        const addr = item.address || {};
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.city_district ||
          addr.city ||
          'Local Area';

        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: {
            formattedAddress: item.display_name,
            locality,
            city: addr.city || addr.county || 'Pune',
            state: addr.state || 'Maharashtra',
            postalCode: addr.postcode,
            country: addr.country || 'India',
            displayName: item.name || locality,
          } as LocationAddress,
        };
      });

      // Combine presets + remote results (avoid duplicates)
      const combined = [...presetMatches, ...mapped];
      return combined.slice(0, 5);
    } catch {
      return presetMatches;
    }
  }
}

export const geocodingService = new GeocodingService();
