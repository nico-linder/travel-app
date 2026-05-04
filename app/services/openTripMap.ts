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

export const openTripMapService = {
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
