import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, RefreshControl, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Plus, ArrowRight, Compass, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { tripService, Trip } from '../../services/tripService';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/Skeleton';
import { Atlas, Fonts, Radii, Shadows, eyebrow, display, accentWord, tagTones } from '../../constants/atlas';

const PHASE_LABELS = ['', 'Discovery', 'Curation', 'Assembly', 'Final'];

// Lightweight stand-in images / placeholder hero per trip until real cover photos exist.
const FALLBACK_HEROES = [
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1597212720128-c310f1c81b85?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop',
];

const TRENDING = [
  { name: 'Faroe Islands', tag: '6 friends went', img: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=900&auto=format&fit=crop' },
  { name: 'Patagonia',     tag: '4 friends went', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=900&auto=format&fit=crop' },
  { name: 'Dolomites',     tag: '8 friends went', img: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=900&auto=format&fit=crop' },
  { name: 'Kyoto',         tag: '12 friends went', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=900&auto=format&fit=crop' },
];

const today = () => {
  try {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
};

export default function HomeScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const { data: trips = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['user-trips', userId],
    queryFn: () => userId ? tripService.getUserTrips(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Flexible';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const daysUntil = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const target = new Date(dateStr).getTime();
    const diff = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const tripPitch = trips.length === 0
    ? 'Begin with a place, a date, or just a feeling. We\'ll do the rest.'
    : trips.length === 1
      ? 'You have one trip in flight.'
      : `You have ${trips.length} trips in flight.`;

  const renderTripCard = (trip: Trip, index: number) => {
    const phase = trip.current_phase || 1;
    const progress = Math.min(1, Math.max(0.05, phase / 4));
    const days = daysUntil(trip.start_date);
    const hero = FALLBACK_HEROES[index % FALLBACK_HEROES.length];

    return (
      <Animated.View key={trip.id} entering={FadeInUp.delay(index * 80).duration(700)}>
        <TouchableOpacity
          onPress={() => router.push(`/itinerary/${trip.id}/home`)}
          activeOpacity={0.92}
          style={styles.tripCard}
        >
          <ImageBackground source={{ uri: hero }} style={styles.tripHero} imageStyle={{ borderTopLeftRadius: Radii.r4, borderTopRightRadius: Radii.r4 }}>
            <LinearGradient
              colors={['transparent', 'rgba(14,12,10,0.85)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tripHeroTop}>
              <View style={[styles.tag, { backgroundColor: tagTones.amber.bg, borderColor: tagTones.amber.border }]}>
                <Text style={[styles.tagText, { color: tagTones.amber.color }]}>
                  Phase {phase} · {PHASE_LABELS[phase] || 'Discovery'}
                </Text>
              </View>
              {days !== null && (
                <View style={styles.daysPill}>
                  <Text style={styles.daysPillText}>{days} days</Text>
                </View>
              )}
            </View>
            <View style={styles.tripHeroBottom}>
              <Text style={styles.tripPlace}>Trip · {phase * 2} stops</Text>
              <Text style={styles.tripTitle}>{trip.name}</Text>
            </View>
          </ImageBackground>

          <View style={styles.tripBody}>
            {/* Progress */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.tripFooter}>
              <View style={styles.avatarStack}>
                {['YOU', 'EM', 'JR'].slice(0, 3).map((m, i) => (
                  <View
                    key={i}
                    style={[
                      styles.smallAvatar,
                      { backgroundColor: Atlas.avatarPalette[i % Atlas.avatarPalette.length], marginLeft: i ? -7 : 0 },
                    ]}
                  >
                    <Text style={styles.smallAvatarText}>{m}</Text>
                  </View>
                ))}
                <Text style={styles.tripDates}>
                  {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                </Text>
              </View>
              <View style={styles.openLink}>
                <Text style={styles.openLinkText}>Open</Text>
                <ArrowRight color={Atlas.amber} size={13} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Atlas.amber} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>{today()}</Text>
              <Text style={styles.greeting}>
                Hello, <Text style={styles.greetingAccent}>traveler.</Text>
              </Text>
              <Text style={styles.greetingSub}>{tripPitch}</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
              <Settings color={Atlas.paperMute} size={18} />
            </TouchableOpacity>
          </View>

          {/* Stats strip */}
          <View style={styles.statsRow}>
            {[
              { num: String(trips.length || 0), label: 'Active trips', sub: 'currently planning' },
              { num: '11', label: 'Past trips', sub: 'logged this year' },
              { num: '47', label: 'Places saved', sub: 'on your wishlist' },
              { num: '8',  label: 'Travel partners', sub: 'in your circle' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statNum}>{s.num}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>

          {/* Active trips */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Currently planning</Text>
              <Text style={styles.sectionTitle}>
                Active <Text style={styles.sectionTitleMute}>trips</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(auth)/create')} style={styles.newTripBtn} activeOpacity={0.9}>
              <Plus color={Atlas.inkOnAmber} size={15} />
              <Text style={styles.newTripBtnText}>New trip</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ gap: 16 }}>
              <Skeleton width="100%" height={300} borderRadius={Radii.r4} />
              <Skeleton width="100%" height={300} borderRadius={Radii.r4} />
            </View>
          ) : trips.length > 0 ? (
            <View style={{ gap: 16 }}>
              {trips.map((trip, i) => renderTripCard(trip, i))}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/create')}
                activeOpacity={0.9}
                style={styles.ghostCard}
              >
                <View style={styles.ghostIconCircle}>
                  <Plus color={Atlas.paperMute} size={22} />
                </View>
                <Text style={styles.ghostTitle}>Start a new trip</Text>
                <Text style={styles.ghostBody}>Begin with a place, a date, or just a feeling. We'll do the rest.</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.View entering={FadeIn} style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Compass size={36} color={Atlas.paperFaint} />
              </View>
              <Text style={styles.emptyTitle}>No trips yet.</Text>
              <Text style={styles.emptySubtitle}>Start planning your next adventure today.</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/create')}
                style={[styles.primaryBtn, Shadows.amberGlow]}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryBtnText}>Create first trip</Text>
                <ArrowRight color={Atlas.inkOnAmber} size={16} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Trending */}
          <View style={[styles.sectionHeader, { marginTop: 40 }]}>
            <View>
              <Text style={styles.eyebrow}>From your wishlist</Text>
              <Text style={styles.sectionTitle}>Trending with friends</Text>
            </View>
            <Text style={styles.sectionLink}>See all →</Text>
          </View>

          <View style={styles.trendingGrid}>
            {TRENDING.map((p, i) => (
              <TouchableOpacity key={p.name} activeOpacity={0.9} style={styles.trendingCard}>
                <ImageBackground source={{ uri: p.img }} style={styles.trendingImg} imageStyle={{ borderRadius: Radii.r3 }}>
                  <LinearGradient
                    colors={['transparent', 'rgba(14,12,10,0.9)']}
                    style={[StyleSheet.absoluteFill, { borderRadius: Radii.r3 }]}
                  />
                  <View style={styles.trendingFoot}>
                    <View style={[styles.tag, { backgroundColor: tagTones.paper.bg, borderColor: tagTones.paper.border, marginBottom: 6 }]}>
                      <Text style={[styles.tagText, { color: tagTones.paper.color }]}>{p.tag}</Text>
                    </View>
                    <Text style={styles.trendingName}>{p.name}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Atlas.ink },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 32, gap: 12 },
  eyebrow: { ...eyebrow, marginBottom: 8 },
  greeting: { ...display(40), letterSpacing: -1 },
  greetingAccent: { ...accentWord, fontSize: 40, lineHeight: 40 },
  greetingSub: { marginTop: 10, fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paperDim, lineHeight: 20 },
  iconButton: {
    width: 40, height: 40, borderRadius: Radii.r2, backgroundColor: Atlas.ink2,
    borderWidth: 1, borderColor: Atlas.hairline, alignItems: 'center', justifyContent: 'center',
  },

  // Stats
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  statCard: {
    flexBasis: '48%', flexGrow: 1, padding: 16, borderRadius: Radii.r3,
    backgroundColor: Atlas.ink2, borderWidth: 1, borderColor: Atlas.hairline,
  },
  statNum: { fontFamily: Fonts.serif, fontSize: 32, color: Atlas.paper, letterSpacing: -0.6, lineHeight: 34 },
  statLabel: { marginTop: 8, fontFamily: Fonts.sans, fontSize: 13, color: Atlas.paper, fontWeight: '600' },
  statSub: { marginTop: 2, fontFamily: Fonts.sans, fontSize: 11, color: Atlas.paperMute },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 },
  sectionTitle: { fontFamily: Fonts.serif, fontSize: 26, color: Atlas.paper, letterSpacing: -0.4 },
  sectionTitleMute: { ...accentWord, color: Atlas.paperMute, fontSize: 26 },
  sectionLink: { fontFamily: Fonts.sans, color: Atlas.amber, fontSize: 13, fontWeight: '600' },

  // New trip button
  newTripBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 40, paddingHorizontal: 16, borderRadius: Radii.r2,
    backgroundColor: Atlas.amber,
  },
  newTripBtnText: { fontFamily: Fonts.sans, color: Atlas.inkOnAmber, fontSize: 13, fontWeight: '700' },

  // Trip card
  tripCard: {
    backgroundColor: Atlas.ink2,
    borderWidth: 1, borderColor: Atlas.hairline,
    borderRadius: Radii.r4, overflow: 'hidden',
  },
  tripHero: { height: 200, justifyContent: 'space-between', padding: 14 },
  tripHeroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripHeroBottom: { },
  tripPlace: {
    fontFamily: Fonts.sans, fontSize: 11, color: Atlas.paperDim,
    textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: '600', marginBottom: 4,
  },
  tripTitle: { fontFamily: Fonts.serif, fontSize: 26, color: Atlas.paper, letterSpacing: -0.4, lineHeight: 28 },
  tag: {
    alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: Radii.pill, borderWidth: 1,
  },
  tagText: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  daysPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radii.pill,
    backgroundColor: 'rgba(14,12,10,0.65)', borderWidth: 1, borderColor: 'rgba(245,239,230,0.14)',
  },
  daysPillText: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '600', color: Atlas.paperDim },

  tripBody: { padding: 16 },
  progressTrack: { height: 3, backgroundColor: Atlas.ink3, borderRadius: 2, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: 3, backgroundColor: Atlas.amber },
  tripFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarStack: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallAvatar: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Atlas.ink2,
  },
  smallAvatarText: { fontFamily: Fonts.sans, fontSize: 9.5, fontWeight: '700', color: Atlas.inkOnAmber },
  tripDates: { fontFamily: Fonts.sans, fontSize: 12, color: Atlas.paperMute, marginLeft: 4 },
  openLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  openLinkText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', color: Atlas.amber },

  // Ghost / new-trip
  ghostCard: {
    borderRadius: Radii.r4, paddingVertical: 36, paddingHorizontal: 24,
    borderWidth: 1.5, borderColor: Atlas.hairline2, borderStyle: 'dashed',
    alignItems: 'center', gap: 10,
  },
  ghostIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Atlas.ink2, borderWidth: 1, borderColor: Atlas.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  ghostTitle: { fontFamily: Fonts.serif, fontSize: 20, color: Atlas.paper },
  ghostBody: { fontFamily: Fonts.sans, fontSize: 13, color: Atlas.paperMute, textAlign: 'center', maxWidth: 240 },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingVertical: 56,
    backgroundColor: Atlas.ink2, borderRadius: Radii.r4,
    borderWidth: 1, borderColor: Atlas.hairline, borderStyle: 'dashed',
    gap: 14,
  },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Atlas.ink, borderWidth: 1, borderColor: Atlas.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: Fonts.serif, fontSize: 26, color: Atlas.paper, letterSpacing: -0.3 },
  emptySubtitle: { fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paperMute, textAlign: 'center', paddingHorizontal: 32 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 48, paddingHorizontal: 22, borderRadius: Radii.r2,
    backgroundColor: Atlas.amber,
  },
  primaryBtnText: { fontFamily: Fonts.sans, color: Atlas.inkOnAmber, fontSize: 14, fontWeight: '700' },

  // Trending
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trendingCard: { flexBasis: '48%', flexGrow: 1 },
  trendingImg: { height: 200, justifyContent: 'flex-end', borderRadius: Radii.r3, overflow: 'hidden' },
  trendingFoot: { padding: 12 },
  trendingName: { fontFamily: Fonts.serif, fontSize: 20, color: Atlas.paper, letterSpacing: -0.3 },
});
