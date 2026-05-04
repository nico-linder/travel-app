const API_KEY = process.env.EXPO_PUBLIC_OPENTRIPMAP_KEY || '5ae2e3f221c38a28845f05b636c29104de0e99cfa6ae3c351cfee350';
const BASE_URL = 'https://api.opentripmap.com/0.1/en';

export interface OTMPlace {
  xid: string;
  name: string;
  dist?: number;
  rate: number;
  kinds: string;
  point: {
    lon: number;
    lat: number;
  };
}

export interface OTMPlaceDetails {
  xid: string;
  name: string;
  address: any;
  kinds: string;
  otm: string;
  wikipedia_extracts?: {
    title: string;
    text: string;
    html: string;
  };
  preview?: {
    source: string;
    height: number;
    width: number;
  };
  wikipedia?: string;
  image?: string;
}

const VIBE_TO_OTM_KIND: Record<string, string> = {
  'mountains': 'mountain_peaks',
  'viewpoints': 'view_points',
  'urban_art': 'monuments',
  'archaeology': 'archaeological_sites',
  'hiking': 'nature_reserves',
  'climbing': 'mountain_peaks',
  'diving': 'beaches',
  'festivals': 'theatres',
  'local_food': 'restaurants',
  'forests': 'natural',
  'beaches': 'beaches',
  'waterfalls': 'waterfalls',
  'lakes': 'lakes',
  'museums': 'museums',
  'theatres': 'theatres',
  'cinemas': 'cinemas',
  'castles': 'castles',
  'fortifications': 'fortifications',
  'monuments': 'monuments',
  'ruins': 'ruins',
  'skyscrapers': 'skyscrapers',
  'bridges': 'bridges',
  'historic_architecture': 'historic_architecture',
  'cafes': 'cafes',
  'restaurants': 'restaurants',
  'shops': 'shops',
  'amusement_parks': 'amusement_parks',
  'islands': 'islands',
  'reefs': 'reefs',
  'art_galleries': 'art_galleries',
  'history_museums': 'history_museums',
  'science_museums': 'science_museums',
  'palaces': 'palaces',
  'manors': 'manors',
  'chateaus': 'chateaus',
  'bars': 'bars',
  'wineries': 'wineries',
  'urban_art': 'monuments',
  'cultural': 'museums',
  'historic': 'historic',
  'architecture': 'architecture',
  'natural': 'natural',
};

export const openTripMapService = {
  /**
   * Map user-friendly vibes to OTM kinds
   */
  mapVibesToKinds: (vibes: string[]): string => {
    if (!vibes || vibes.length === 0) return 'interesting_places';
    
    const kinds = vibes.map(v => {
      const normalized = v.toLowerCase().replace(/ /g, '_');
      return VIBE_TO_OTM_KIND[normalized] || normalized;
    });
    
    // Remove duplicates and join
    return Array.from(new Set(kinds)).join(',');
  },

  /**
   * Search for a place by name (geocoding)
   */
  getGeoname: async (name: string) => {
    const response = await fetch(`${BASE_URL}/places/geoname?name=${encodeURIComponent(name)}&apikey=${API_KEY}`);
    if (response.status === 429) return null;
    if (!response.ok) throw new Error('Failed to fetch geoname');
    return response.json();
  },

  /**
   * Get places within a radius of a point
   */
  getPlacesInRadius: async (lat: number, lon: number, radius: number = 10000, limit: number = 20) => {
    const response = await fetch(
      `${BASE_URL}/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&limit=${limit}&apikey=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch places in radius');
    const data = await response.json();
    return data.features as any[]; // GeoJSON features
  },

  /**
   * Get popular places by kinds and bbox (e.g. for macro discovery)
   */
  getPlacesByBbox: async (lonMin: number, latMin: number, lonMax: number, latMax: number, kinds: string = 'interesting_places', limit: number = 20) => {
    const response = await fetch(
      `${BASE_URL}/places/bbox?lon_min=${lonMin}&lat_min=${latMin}&lon_max=${lonMax}&lat_max=${latMax}&kinds=${kinds}&format=json&limit=${limit}&apikey=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch places in bbox');
    return response.json() as Promise<OTMPlace[]>;
  },

  /**
   * Get full details for a specific place (xid)
   */
  getPlaceDetails: async (xid: string): Promise<OTMPlaceDetails> => {
    const response = await fetch(`${BASE_URL}/places/xid/${xid}?apikey=${API_KEY}`);
    if (response.status === 429) {
      // Fallback for rate limiting
      return {
        xid,
        name: 'Spot Details (Rate Limited)',
        kinds: 'tourist_object',
        otm: '',
        wikipedia_extracts: { title: '', text: 'OpenTripMap API rate limit reached. Please try again in a moment.', html: '' }
      } as OTMPlaceDetails;
    }
    if (!response.ok) throw new Error('Failed to fetch place details');
    return response.json();
  }
};
