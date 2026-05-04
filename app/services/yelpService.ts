const API_KEY = (process.env.EXPO_PUBLIC_YELP_KEY || 'bCyUoLncP_V25WcCBd-IF4wgOiAJHot28br_TJ1PdXOwJ7rwMbMK9DA0xYfBbEBB3zcEk96vjDORx8925lOjiHeNYw0xkMP14ybf9_OixvsUqECETjS8dFy5Ovj4aXYx').trim();
const BASE_URL = 'https://api.yelp.com/v3';

export interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  rating: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: {
    address1: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  display_phone: string;
  distance: number;
  price?: string;
}

export const yelpService = {
  /**
   * Search for businesses/places
   */
  searchPlaces: async (lat: number, lon: number, categories?: string, limit: number = 20) => {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      limit: limit.toString(),
      sort_by: 'best_match',
      radius: '10000', // 10km radius
    });

    if (categories) params.append('categories', categories);

    const response = await fetch(`${BASE_URL}/businesses/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Yelp Search Error:', errorText);
      throw new Error(`Yelp API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.businesses as YelpBusiness[];
  },

  /**
   * Map app vibes to Yelp category aliases
   * Full list: https://www.yelp.com/developers/documentation/v3/all_category_list
   */
  mapVibesToCategories: (vibes: string[]): string => {
    const mapping: Record<string, string> = {
      'natural': 'parks,beaches,lakes',
      'mountains': 'hiking,parks',
      'beaches': 'beaches',
      'forests': 'parks',
      'waterfalls': 'parks',
      'lakes': 'lakes',
      'cultural': 'arts,museums,galleries',
      'museums': 'museums',
      'theatres': 'theater',
      'urban_art': 'publicart',
      'historic': 'landmarks',
      'castles': 'landmarks',
      'monuments': 'landmarks',
      'architecture': 'landmarks',
      'restaurants': 'restaurants',
      'cafes': 'cafes',
      'bars': 'bars',
      'nightlife': 'nightlife',
      'shopping': 'shopping',
    };

    const allAliases = vibes
      .flatMap(v => (mapping[v.toLowerCase()] || '').split(','))
      .filter(alias => alias.length > 0);

    // Deduplicate aliases
    const uniqueAliases = Array.from(new Set(allAliases));

    return uniqueAliases.length > 0 ? uniqueAliases.join(',') : 'landmarks,parks';
  }
};
