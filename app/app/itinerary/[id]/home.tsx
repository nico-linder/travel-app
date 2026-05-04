import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ImageBackground, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft, MessageCircle, Sparkles, Map, Calendar, Settings as SettingsIcon, Compass, Share2, Users, Info, Vote, ArrowRight,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { tripService } from '../../../services/tripService';
import { Phase1View } from '../../../components/Phase1View';
import { Phase2View } from '../../../components/Phase2View';
import { Phase3View } from '../../../components/Phase3View';
import { Phase4View } from '../../../components/Phase4View';
import { DashboardSkeleton } from '../../../components/Skeleton';
import { AIChatAssistant } from '../../../components/AIChatAssistant';
import { Atlas, Fonts, Radii, Shadows, eyebrow, display, accentWord, tagTones } from '../../../constants/atlas';

const PHASES = [
  { id: 1, title: 'Discovery', subtitle: 'Find spots that excite the group',  Icon: Sparkles },
  { id: 2, title: 'Curation',  subtitle: 'Propose places & vote together',     Icon: Compass  },
  { id: 3, title: 'Assembly',  subtitle: 'Sequence stops & set durations',     Icon: Map      },
  { id: 4, title: 'Final',     subtitle: 'Build day-by-day activities',        Icon: Calendar },
];

const HERO_IMG = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80';

const ItineraryHomeScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plan' | 'ai' | 'settings'>('plan');
  const [phase, setPhase] = useState<number>(1);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getTrip(id as string),
  });

  useEffect(() => {
    if (trip?.current_phase) {
      setPhase(trip.current_phase);
    }
  }, [trip?.current_phase]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const cur = PHASES.find(p => p.id === phase)!;

  const renderPhaseContent = () => {
    switch (phase) {
      case 1: return <Phase1View tripId={id as string} />;
      case 2: return <Phase2View tripId={id as string} />;
      case 3: return <Phase3View tripId={id as string} />;
      case 4: return <Phase4View tripId={id as string} />;
      default: return null;
    }
  };

  const renderTabContent = () => {
    if (isLoading) return <DashboardSkeleton />;

    if (activeTab === 'plan') {
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero band */}
          <View style={styles.hero}>
            <ImageBackground source={{ uri: HERO_IMG }} style={styles.heroImg}>
              <LinearGradient
                colors={['rgba(14,12,10,0.4)', 'rgba(14,12,10,0.2)', Atlas.ink]}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />
              <SafeAreaView style={styles.heroChrome}>
                <View style={styles.heroTopRow}>
                  <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.heroBtn} activeOpacity={0.85}>
                    <ChevronLeft color={Atlas.paper} size={16} />
                    <Text style={styles.heroBtnText}>Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85}>
                    <Share2 color={Atlas.paper} size={14} />
                    <Text style={styles.heroBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.heroBottom}>
                  <Text style={styles.heroTitle}>{trip?.name || 'My trip'}</Text>
                  <View style={styles.heroMeta}>
                    <Calendar color={Atlas.paperDim} size={13} />
                    <Text style={styles.heroMetaText}>
                      {formatDate(trip?.start_date) || 'Flexible'} – {formatDate(trip?.end_date) || ''}
                    </Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.heroMetaText}>Collaborative</Text>
                  </View>
                </View>
              </SafeAreaView>
            </ImageBackground>
          </View>

          {/* Next Action Card */}
          <Animated.View entering={FadeIn.delay(200)} style={{ paddingHorizontal: 24, marginTop: 16 }}>
            <Text style={{...eyebrow, marginBottom: 12}}>Next Action</Text>
            <TouchableOpacity 
              onPress={() => router.push(`/itinerary/${id}/destination`)}
              style={styles.contextCard}
            >
              <View style={styles.contextHead}>
                <View style={[styles.brandMark, { backgroundColor: Atlas.ink3 }]}><Vote color={Atlas.amber} size={16} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contextTitle}>
                    {trip?.current_phase === 1 ? 'Start Discovery' : 'Vote on Destinations'}
                  </Text>
                  <Text style={styles.contextBody}>
                    {trip?.current_phase === 1 ? 'Find the best spots for your trip.' : 'Help the group decide where to go.'}
                  </Text>
                </View>
                <ArrowRight size={20} color={Atlas.paperDim} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Phase Progress Bar */}
          <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={eyebrow}>Trip Progress</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700', color: Atlas.amber }}>
                {Math.round(((trip?.current_phase || 1) / 4) * 100)}%
              </Text>
            </View>
            
            <View style={styles.progressTrack}>
               <View style={[styles.progressFill, { width: `${((trip?.current_phase || 1) / 4) * 100}%` }]} />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {PHASES.map((p) => {
                const isActive = trip?.current_phase === p.id;
                const isCompleted = (trip?.current_phase || 1) > p.id;
                
                return (
                  <View key={p.id} style={{ alignItems: 'center', gap: 6 }}>
                    <View style={[
                      { width: 6, height: 6, borderRadius: 3, backgroundColor: Atlas.ink3 },
                      (isActive || isCompleted) && { backgroundColor: Atlas.amber, shadowColor: Atlas.amber, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 }
                    ]} />
                    <Text style={[
                      { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Atlas.paperMute },
                      isActive && { color: Atlas.paper }
                    ]}>
                      {p.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      );
    }

    if (activeTab === 'ai') {
      return (
        <View style={styles.tabView}>
          <AIChatAssistant
            isOpen={true}
            onClose={() => setActiveTab('plan')}
            tripId={id as string}
            tripName={trip?.name || 'My trip'}
            inline={true}
          />
        </View>
      );
    }

    // settings
    return (
      <View style={styles.tabView}>
        <SafeAreaView style={styles.settingsHeader}>
          <Text style={styles.eyebrow}>Trip</Text>
          <Text style={styles.settingsTitle}>
            Settings<Text style={styles.titleAccent}>.</Text>
          </Text>
        </SafeAreaView>
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <View style={styles.settingsGroup}>
            <Text style={styles.eyebrow}>General</Text>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Edit trip details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Manage members</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingsGroup}>
            <Text style={styles.eyebrow}>Preferences</Text>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Currency display</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.leaveButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.leaveButtonText}>Exit itinerary</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.mainContent}>{renderTabContent()}</View>

      {/* Bottom nav */}
      <View style={styles.bottomBarContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(14,12,10,0.95)', Atlas.ink]}
          style={styles.bottomGradient}
        />
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('plan')}
            activeOpacity={0.85}
          >
            <Compass size={22} color={activeTab === 'plan' ? Atlas.amber : Atlas.paperMute} />
            <Text style={[styles.tabLabel, activeTab === 'plan' && styles.tabLabelActive]}>Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('ai')}
            activeOpacity={0.85}
          >
            <View style={[styles.aiIconContainer, activeTab === 'ai' && styles.aiIconActive]}>
              <MessageCircle
                size={20}
                color={activeTab === 'ai' ? Atlas.inkOnAmber : Atlas.paperDim}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'ai' && styles.tabLabelActive]}>Atlas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('settings')}
            activeOpacity={0.85}
          >
            <SettingsIcon size={22} color={activeTab === 'settings' ? Atlas.amber : Atlas.paperMute} />
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Atlas.ink },
  mainContent: { flex: 1 },
  scrollContent: { paddingBottom: 110 },

  // Hero
  hero: { height: 320 },
  heroImg: { flex: 1 },
  heroChrome: { flex: 1, paddingHorizontal: 24, paddingTop: 8, justifyContent: 'space-between' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 34, paddingHorizontal: 12, borderRadius: Radii.r1,
    backgroundColor: 'rgba(14,12,10,0.5)',
    borderWidth: 1, borderColor: 'rgba(245,239,230,0.16)',
  },
  heroBtnText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: Atlas.paper },
  heroBottom: { paddingBottom: 24, gap: 10 },
  tag: {
    alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: Radii.pill, borderWidth: 1,
  },
  tagText: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  heroTitle: { ...display(40), letterSpacing: -1.2, color: Atlas.paper },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  heroMetaText: { fontFamily: Fonts.sans, fontSize: 13, color: Atlas.paperDim },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Atlas.paperFaint },

  // Phase rail
  railWrap: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8, position: 'relative' },
  railLine: { position: 'absolute', top: 24 + 22, left: 24 + 22, right: 24 + 22, height: 1, backgroundColor: Atlas.hairline },
  railFill: { position: 'absolute', top: 24 + 22, left: 24 + 22, height: 1, backgroundColor: Atlas.amber },
  rail: { flexDirection: 'row', justifyContent: 'space-between' },
  railItem: { alignItems: 'center', gap: 8, flex: 1 },
  railDot: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Atlas.ink2,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  railDotActive: {
    backgroundColor: Atlas.amber, borderColor: Atlas.amber,
    ...Shadows.amberGlow,
  },
  railDotDone: { backgroundColor: Atlas.ink3, borderColor: Atlas.amberLine },
  railLabel: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '600', color: Atlas.paperMute },
  railLabelActive: { color: Atlas.paper },

  // Phase header
  phaseHeader: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 },
  eyebrow: { ...eyebrow },
  phaseTitle: { ...display(32), letterSpacing: -1, marginTop: 6 },
  phaseSub: { fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paperMute, marginTop: 4 },
  titleAccent: { ...accentWord, fontSize: 32, lineHeight: 32 },

  phaseBody: { paddingTop: 8 },

  // Context / AI assistant card on plan view
  contextCard: {
    marginHorizontal: 24, marginTop: 16, padding: 18,
    backgroundColor: Atlas.ink2, borderWidth: 1, borderColor: Atlas.hairline,
    borderRadius: Radii.r3, gap: 12,
  },
  contextHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Atlas.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  brandMarkText: { fontFamily: Fonts.serif, fontSize: 16, color: Atlas.inkOnAmber, lineHeight: 18 },
  contextTitle: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: Atlas.paper },
  contextOnline: { fontFamily: Fonts.sans, fontSize: 11, color: Atlas.green },
  contextBody: { fontFamily: Fonts.sans, fontSize: 13, color: Atlas.paperDim, lineHeight: 19 },
  contextActions: { flexDirection: 'row', gap: 8 },
  contextPrimary: {
    flex: 1, height: 36, borderRadius: Radii.r1, backgroundColor: Atlas.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  contextPrimaryText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', color: Atlas.inkOnAmber },
  contextGhost: {
    flex: 1, height: 36, borderRadius: Radii.r1,
    borderWidth: 1, borderColor: Atlas.hairline2,
    alignItems: 'center', justifyContent: 'center',
  },
  contextGhostText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: Atlas.paper },

  // Settings tab
  tabView: { flex: 1, backgroundColor: Atlas.ink },
  settingsHeader: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Atlas.hairline,
  },
  settingsTitle: { ...display(36), letterSpacing: -1.2, marginTop: 4 },
  settingsContent: { padding: 24, gap: 28, paddingBottom: 120 },
  settingsGroup: { gap: 10 },
  settingItem: {
    backgroundColor: Atlas.ink2, padding: 16, borderRadius: Radii.r2,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  settingText: { fontFamily: Fonts.sans, fontSize: 15, color: Atlas.paper, fontWeight: '500' },
  leaveButton: {
    marginTop: 12, padding: 16, borderRadius: Radii.r2,
    backgroundColor: Atlas.redSoft,
    borderWidth: 1, borderColor: 'rgba(217, 83, 79, 0.28)',
    alignItems: 'center',
  },
  leaveButtonText: { fontFamily: Fonts.sans, color: Atlas.red, fontSize: 14, fontWeight: '700' },

  // Bottom bar
  bottomBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, justifyContent: 'flex-end' },
  bottomGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bottomBar: {
    flexDirection: 'row', height: 70,
    backgroundColor: 'rgba(14,12,10,0.92)',
    borderTopWidth: 1, borderTopColor: Atlas.hairline,
    paddingHorizontal: 16, paddingBottom: 10,
    alignItems: 'center', justifyContent: 'space-around',
  },
  tabButton: { alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 12 },
  tabLabel: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '600', color: Atlas.paperMute, letterSpacing: 0.4 },
  tabLabelActive: { color: Atlas.amber },
  aiIconContainer: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Atlas.ink2,
    borderWidth: 1, borderColor: Atlas.hairline,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -16,
  },
  aiIconActive: { backgroundColor: Atlas.amber, borderColor: Atlas.amber },
});

export default ItineraryHomeScreen;
