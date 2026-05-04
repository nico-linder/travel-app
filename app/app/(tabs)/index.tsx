import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Plus, Calendar, Settings, ArrowRight, Compass, Map, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tripService, Trip } from '../../services/tripService';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/Skeleton';

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: trips = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['user-trips', userId],
    queryFn: () => userId ? tripService.getUserTrips(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Flexible Dates';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderTripCard = (trip: Trip, index: number) => (
    <Animated.View key={trip.id} entering={FadeInUp.delay(index * 100).duration(800)}>
      <TouchableOpacity 
        onPress={() => router.push(`/itinerary/${trip.id}/home`)}
        activeOpacity={0.9}
        style={styles.tripCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>Phase {trip.current_phase}</Text>
          </View>
          <Calendar size={18} color="#818cf8" />
        </View>

        <Text style={styles.tripTitle}>{trip.name}</Text>
        <Text style={styles.tripDate}>
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.avatarStack}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>YOU</Text>
            </View>
            <View style={styles.avatarAdd}>
              <Plus size={14} color="#94a3b8" />
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push(`/itinerary/${trip.id}/home`)}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={['#818cf8', '#60a5fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonInner}
            >
              <Text style={styles.actionButtonText}>Open</Text>
              <ArrowRight size={16} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#818cf8" />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>Forecast Regression V1</Text>
              <Text style={styles.headerTitle}>Dashboard</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Settings color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>

          {/* Trips Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Journeys</Text>
              <Sparkles size={14} color="#818cf8" />
            </View>

            {isLoading ? (
              <View style={{ gap: 20 }}>
                <Skeleton width="100%" height={220} borderRadius={24} />
                <Skeleton width="100%" height={220} borderRadius={24} />
              </View>
            ) : trips.length > 0 ? (
              <View style={{ gap: 20 }}>
                {trips.map((trip, index) => renderTripCard(trip, index))}
              </View>
            ) : (
              <Animated.View entering={FadeIn} style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Compass size={40} color="#1e293b" />
                </View>
                <Text style={styles.emptyTitle}>No trips found</Text>
                <Text style={styles.emptySubtitle}>Start planning your next adventure today.</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/create')}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Create First Trip</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {/* Grid Actions */}
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>Operations</Text>
            <View style={styles.grid}>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/create')}
                style={styles.gridCard}
              >
                <View style={styles.iconCircle}>
                  <Plus color="#818cf8" size={24} />
                </View>
                <Text style={styles.gridLabel}>Plan New</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridCard}>
                <View style={styles.iconCircle}>
                  <Map color="#94a3b8" size={24} />
                </View>
                <Text style={styles.gridLabelMuted}>History</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerSubtitle: {
    color: '#64748b',
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ededed',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -2,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#64748b',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tripCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  cardBadge: {
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.15)',
  },
  cardBadgeText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tripTitle: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -2,
    marginBottom: 8,
  },
  tripDate: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 32,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -12,
  },
  avatarText: {
    color: '#ededed',
    fontSize: 10,
    fontWeight: '900',
  },
  avatarAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  actionButton: {
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridLabel: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  gridLabelMuted: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#818cf8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
