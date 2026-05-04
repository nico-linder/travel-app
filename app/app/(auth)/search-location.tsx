import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Search, MapPin, Sparkles, Navigation, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { openTripMapService, OTMPlace } from '../../services/openTripMap';
import { Skeleton } from '../../components/Skeleton';

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
              <ChevronLeft color="#94a3b8" size={24} />
            </TouchableOpacity>
            <View style={styles.searchWrapper}>
              <Search color="#475569" size={18} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearch(searchQuery)}
                placeholder="Search location..."
                placeholderTextColor="#475569"
                style={styles.searchInput}
                selectionColor="#818cf8"
              />
              {loading && <ActivityIndicator size="small" color="#818cf8" />}
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
                        <MapPin color="#818cf8" size={18} />
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
                    <Sparkles size={14} color="#818cf8" />
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
                            <Navigation color="#3b82f6" size={18} />
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
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    outlineStyle: 'none',
  } as any,
  scroll: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#64748b',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  placeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  placeKinds: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default SearchLocationScreen;
