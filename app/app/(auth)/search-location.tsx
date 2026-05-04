import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Search, MapPin, Sparkles, Navigation, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { openTripMapService, OTMPlace } from '../../services/openTripMap';
import { Skeleton } from '../../components/Skeleton';
import { Atlas, Fonts, Radii, eyebrow } from '../../constants/atlas';

const SearchLocationScreen = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(name || '');
  const [results, setResults] = useState<OTMPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularPlaces, setPopularPlaces] = useState<OTMPlace[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    if (name) {
      handleSearch(name);
    }
    loadPopularPlaces();
  }, [name]);

  const loadPopularPlaces = async () => {
    setLoadingPopular(true);
    try {
      const lonMin = 139.0, latMin = 35.0, lonMax = 140.0, latMax = 36.0;
      const places = await openTripMapService.getPlacesByBbox(lonMin, latMin, lonMax, latMax, 'interesting_places', 6);
      setPopularPlaces(places || []);
    } catch (error) {
      console.error(error);
      setPopularPlaces([]);
    }
    setLoadingPopular(false);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await openTripMapService.getGeoname(query);
      if (data) {
        const places = await openTripMapService.getPlacesInRadius(data.lon, data.lat, 5000, 'interesting_places', 10);
        setResults(places || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Atlas.paperDim} size={24} />
            </TouchableOpacity>
            <View style={styles.searchWrapper}>
              <Search color={Atlas.paperFaint} size={18} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearch(searchQuery)}
                placeholder="Search location..."
                placeholderTextColor={Atlas.paperFaint}
                style={styles.searchInput}
                selectionColor={Atlas.amber}
              />
              {loading && <ActivityIndicator size="small" color={Atlas.amber} />}
            </View>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {searchQuery && (results?.length ?? 0) > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {results.map((place, index) => (
                  <Animated.View key={place.xid} entering={FadeInUp.delay(index * 50)}>
                    <TouchableOpacity 
                      style={styles.placeCard}
                      onPress={() => router.replace('/(tabs)')}
                    >
                      <View style={styles.placeIconContainer}>
                        <MapPin color={Atlas.amber} size={18} />
                      </View>
                      <View style={styles.placeInfo}>
                        <Text style={styles.placeName}>{place.name}</Text>
                        <Text style={styles.placeKinds}>
                          {(place.kinds || '').split(',').slice(0, 2).join(' • ').replace(/_/g, ' ')}
                        </Text>
                      </View>
                      <ArrowRight color="#334155" size={18} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Suggestions</Text>
                    <Sparkles size={14} color={Atlas.amber} />
                  </View>
                  
                  {loadingPopular ? (
                    <View style={{ gap: 12 }}>
                      <Skeleton width="100%" height={72} borderRadius={12} />
                      <Skeleton width="100%" height={72} borderRadius={12} />
                      <Skeleton width="100%" height={72} borderRadius={12} />
                    </View>
                  ) : (
                    (popularPlaces || []).map((place, index) => (
                      <Animated.View key={place.xid} entering={FadeInRight.delay(index * 100)}>
                        <TouchableOpacity 
                          style={styles.placeCard}
                          onPress={() => router.replace('/(tabs)')}
                        >
                          <View style={styles.placeIconContainer}>
                            <Navigation color={Atlas.teal} size={18} />
                          </View>
                          <View style={styles.placeInfo}>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <Text style={styles.placeKinds}>
                              {(place.kinds || '').split(',').slice(0, 2).join(' • ').replace(/_/g, ' ')}
                            </Text>
                          </View>
                          <ArrowRight color={Atlas.paperFaint} size={18} />
                        </TouchableOpacity>
                      </Animated.View>
                    ))
                  )}
                </View>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Atlas.ink },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 28, gap: 12 },
  backButton: {
    width: 40, height: 40, borderRadius: Radii.r2,
    backgroundColor: Atlas.ink2, borderWidth: 1, borderColor: Atlas.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  searchWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Atlas.ink2,
    height: 48, borderRadius: Radii.r2,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  searchInput: { flex: 1, fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paper } as any,
  scroll: { flex: 1 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 },
  sectionTitle: { ...eyebrow },
  placeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Atlas.ink2, padding: 14, borderRadius: Radii.r3,
    marginBottom: 10,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  placeIconContainer: {
    width: 40, height: 40, borderRadius: Radii.r2,
    backgroundColor: Atlas.ink3,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  placeInfo: { flex: 1 },
  placeName: { fontFamily: Fonts.serif, fontSize: 18, color: Atlas.paper, letterSpacing: -0.3, marginBottom: 2 },
  placeKinds: { fontFamily: Fonts.sans, fontSize: 11, color: Atlas.paperMute, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '600' },
});

export default SearchLocationScreen;
