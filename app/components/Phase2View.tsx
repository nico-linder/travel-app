import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Plus } from 'lucide-react-native';
import { openTripMapService } from '../services/openTripMap';
import { tripService } from '../services/tripService';
import { supabase } from '../lib/supabase';
import { SwipeCard } from './SwipeCard';
import { Atlas, Fonts, Radii, eyebrow } from '../constants/atlas';

export const Phase2View = ({ tripId }: { tripId: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: proposedLocations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ['proposed-locations', tripId],
    queryFn: () => tripService.getDestinations(tripId),
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['otm-search', searchQuery],
    queryFn: () => searchQuery.length > 2 ? openTripMapService.getGeoname(searchQuery) : null,
    enabled: searchQuery.length > 2,
  });

  const handleAddLocation = async (place: any) => {
    if (!userId) return;
    try {
      const details = await openTripMapService.getPlaceDetails(place.xid || place.id);
      await tripService.proposeDestination(tripId, {
        name: details.name,
        image_url: details.preview?.source || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80',
        description: details.wikipedia_extracts?.text || 'Proposed spot.',
        otm_xid: details.xid,
        proposed_by: userId,
      });
      setSearchQuery('');
      queryClient.invalidateQueries({ queryKey: ['proposed-locations', tripId] });
      Alert.alert('Success', `${details.name} has been proposed!`);
    } catch (e: any) { 
      console.error(e);
      Alert.alert('Error', e.message);
    }
  };

  const handleVote = async (locationId: string, liked: boolean) => {
    if (!userId) return;
    try {
      await tripService.vote(locationId, userId, liked);
      setCurrentIndex(prev => prev + 1);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Vote Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <View style={styles.inputBar}>
          <Search color={Atlas.paperFaint} size={16} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Propose a place — search any city, region, or landmark…"
            placeholderTextColor={Atlas.paperMute}
            style={styles.input}
            selectionColor={Atlas.amber}
          />
          {isSearching && <ActivityIndicator size="small" color={Atlas.amber} />}
        </View>

        {searchQuery.length > 2 && searchResults && (
          <TouchableOpacity
            style={styles.result}
            onPress={() => handleAddLocation(searchResults)}
            activeOpacity={0.85}
          >
            <View style={styles.resultInfo}>
              <MapPin color={Atlas.amber} size={16} />
              <Text style={styles.resultText}>{searchResults.name}</Text>
            </View>
            <Plus color={Atlas.amber} size={18} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.stack}>
        {proposedLocations.length > 0 ? (
          proposedLocations.map((location, index) => {
            const idx = index - currentIndex;
            if (idx < 0 || idx > 2) return null;
            return (
              <SwipeCard
                key={location.id}
                location={{ 
                  ...location, 
                  image: location.image_url,
                  tags: [] // Schema doesn't support tags yet
                }}
                onVote={(liked) => handleVote(location.id, liked)}
                isTop={idx === 0}
              />
            );
          }).reverse()
        ) : (
          <View style={styles.empty}>
             <Text style={styles.emptyText}>Search to propose a spot.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  search: { marginBottom: 24, zIndex: 10 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Atlas.ink2,
    height: 48, borderRadius: Radii.r2,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  input: { flex: 1, fontFamily: Fonts.sans, color: Atlas.paper, fontSize: 14 } as any,
  result: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Atlas.ink2, padding: 14, borderRadius: Radii.r2,
    borderWidth: 1, borderColor: Atlas.amberLine,
    marginTop: 8,
  },
  resultInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultText: { fontFamily: Fonts.serif, fontSize: 18, color: Atlas.paper, letterSpacing: -0.3 },
  stack: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  empty: {
    padding: 36, borderRadius: Radii.r4,
    borderWidth: 1.5, borderColor: Atlas.hairline2, borderStyle: 'dashed',
    width: '100%', alignItems: 'center',
  },
  emptyText: { ...eyebrow },
});
