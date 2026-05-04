const API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_KEY || 'fsq3pdSgU6eytTP5kgMd2qVHg/IGR2asJVXG9mBJAK3SSdE=';
const BASE_URL = 'https://api.foursquare.com/v3';

export interface FoursquarePlace {
  fsq_id: string;
  name: string;
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
    formatted_address?: string;
  };
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  description?: string;
  tel?: string;
  website?: string;
  rating?: number;
  price?: number;
  photos?: Array<{
    id: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
}

export const foursquareService = {
  /**
   * Search for places near a location
   */
  searchPlaces: async (lat: number, lon: number, query?: string, categories?: string, limit: number = 20) => {
    const params = new URLSearchParams({
      ll: `${lat},${lon}`,
      limit: limit.toString(),
      // Simplified fields for search to ensure maximum reliability across tiers
      fields: 'fsq_id,name,categories,location,geocodes,rating,price',
      // Mandatory cache buster to clear the "410 Gone (from disk cache)" loop
      cb: Date.now().toString(),
    });

    if (query) params.append('query', query);
    if (categories) params.append('categories', categories);

    const response = await fetch(`${BASE_URL}/places/nearby?${params.toString()}`, {
      headers: {
        Authorization: API_KEY,
        Accept: 'application/json',
        'X-Places-Api-Version': '20220101', // Stable version
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Foursquare Search Error:', error);
      throw new Error('Failed to fetch places from Foursquare');
    }

    const data = await response.json();
    return data.results as FoursquarePlace[];
  },

  /**
   * Get details for a specific place
   */
  getPlaceDetails: async (fsq_id: string) => {
    const response = await fetch(`${BASE_URL}/places/${fsq_id}?fields=fsq_id,name,categories,location,geocodes,description,photos,rating,price,website,tel`, {
      headers: {
        Authorization: API_KEY,
        Accept: 'application/json',
        'X-Places-Api-Version': '20220101',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch place details from Foursquare');
    return await response.json() as FoursquarePlace;
  },

  /**
   * Map our app vibes to Foursquare categories
   * Full list: https://location.foursquare.com/places/docs/categories
   */
  mapVibesToCategories: (vibes: string[]): string => {
    const mapping: Record<string, string> = {
      'natural': '16000', // Landmarks and Outdoors
      'mountains': '16027', // Mountain
      'beaches': '16003', // Beach
      'forests': '16015', // Forest
      'waterfalls': '16043', // Waterfall
      'lakes': '16023', // Lake
      'cultural': '10000', // Arts and Entertainment
      'museums': '10027', // Museum
      'theatres': '10035', // Theater
      'urban_art': '10001', // Amusement Park or Public Art
      'historic': '16026', // Monument / Landmark
      'castles': '16012', // Castle
      'monuments': '16026',
      'architecture': '16026',
      'restaurants': '13000', // Dining and Drinking
      'cafes': '13032', // Cafe
      'bars': '13003', // Bar
      'nightlife': '10032', // Night Club
      'shopping': '17000', // Retail
    };

    const categories = vibes
      .map(v => mapping[v.toLowerCase()])
      .filter(id => id);

    return categories.length > 0 ? categories.join(',') : '16000'; // Default to Landmarks
  },

  /**
   * Helper to format photo URL
   */
  getPhotoUrl: (photo: any, size: string = 'original') => {
    if (!photo) return null;
    return `${photo.prefix}${size}${photo.suffix}`;
  }
};
