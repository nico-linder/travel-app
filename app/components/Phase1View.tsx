import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { SwipeCard } from './SwipeCard';
import { openTripMapService } from '../services/openTripMap';
import { tripService } from '../services/tripService';
import { supabase } from '../lib/supabase';
import { DashboardSkeleton } from './Skeleton';

const fetchPlaceDetails = async (places: any[]) => {
  const detailPromises = places.slice(0, 10).map(place => 
    openTripMapService.getPlaceDetails(place.xid)
  );
  return Promise.all(detailPromises);
};

export const Phase1View = ({ tripId }: { tripId: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getTrip(tripId),
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations', tripId],
    queryFn: () => tripService.getDestinations(tripId),
  });

  const { data: places, isLoading, error } = useQuery({
    queryKey: ['otm-places', tripId, destinations?.length, trip?.description],
    enabled: !!destinations && !!trip,
    queryFn: async () => {
      let lat = 35.6762, lon = 139.6503; // Default Tokyo
      
      // 1. Get coordinates from the first destination
      if (destinations && destinations.length > 0) {
        const firstDest = destinations[0];
        // If we don't have lat/lon in the DB, fetch them from OTM using the xid
        const details = await openTripMapService.getPlaceDetails(firstDest.otm_xid || firstDest.place_id);
        if (details?.point) {
          lat = details.point.lat;
          lon = details.point.lon;
        }
      }

      // 2. Use trip tags as filters (OpenTripMap 'kinds')
      // Fallback to 'interesting_places' if no tags are set
      const kinds = trip?.description || 'interesting_places';
      
      // Create a small bbox around the destination (approx 50km)
      const offset = 0.5;
      const lonMin = lon - offset, latMin = lat - offset, lonMax = lon + offset, latMax = lat + offset;
      
      const initialList = await openTripMapService.getPlacesByBbox(lonMin, latMin, lonMax, latMax, kinds, 20);
      const namedPlaces = initialList.filter(p => p.name && p.name.length > 3);
      return fetchPlaceDetails(namedPlaces);
    }
  });

  const handleVote = async (locationId: string, liked: boolean) => {
    if (!userId) return;
    try {
      // For Phase 1, we might want to "propose" these as destinations if liked
      // but the current schema uses destination_votes. 
      // We need to ensure the place exists in 'destinations' table first.
      
      // Simplified: Just log for now, or implement a "sync to destinations" logic
      console.log('Voted', liked, 'on', locationId);
      setCurrentIndex((prev) => prev + 1);
    } catch (e) {
      console.error('Error voting:', e);
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Failed to load destinations</Text>
    </View>
  );

  const locations = (places || []).map(p => ({
    id: p.xid,
    name: p.name,
    image: p.preview?.source || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80',
    description: p.wikipedia_extracts?.text || 'Discover the beauty of this place.',
    tags: p.kinds.split(',').slice(0, 2).map(k => k.replace(/_/g, ' ')),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.stack}>
        {locations.length > 0 ? (
          <>
            {locations.map((location, index) => {
              if (index < currentIndex) return null;
              if (index > currentIndex + 2) return null;

              return (
                <SwipeCard
                  key={location.id}
                  location={location}
                  onVote={(liked) => handleVote(location.id, liked)}
                  isTop={index === currentIndex}
                />
              );
            }).reverse()}

            {currentIndex >= locations.length ? (
              <View style={styles.empty}>
                <Sparkles size={40} color="#818cf8" />
                <Text style={styles.emptyTitle}>All Caught Up.</Text>
                <Text style={styles.emptySubtitle}>Waiting for other members to finish.</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.empty}>
            <Sparkles size={40} color="#818cf8" />
            <Text style={styles.emptyTitle}>No spots found.</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or area.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  emptySubtitle: {
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
});
