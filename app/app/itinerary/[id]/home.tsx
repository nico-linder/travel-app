import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ImageBackground, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft, MessageCircle, Sparkles, Map, Calendar, Settings as SettingsIcon, Compass, Share2,
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
      const progress = phase / 4;
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
                  <TouchableOpacity onPress={() => router.back()} style={styles.heroBtn} activeOpacity={0.85}>
                    <ChevronLeft color={Atlas.paper} size={16} />
                    <Text style={styles.heroBtnText}>All trips</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85}>
                    <Share2 color={Atlas.paper} size={14} />
                    <Text style={styles.heroBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.heroBottom}>
                  <View style={[styles.tag, { backgroundColor: tagTones.amber.bg, borderColor: tagTones.amber.border }]}>
                    <Text style={[styles.tagText, { color: tagTones.amber.color }]}>
                      Phase {phase} · {cur.title}
                    </Text>
                  </View>
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

          {/* Phase rail */}
          <View style={styles.railWrap}>
            <View style={styles.railLine} />
            <View style={[styles.railFill, { width: `${(progress - 0.25) * 100}%` }]} />
            <View style={styles.rail}>
              {PHASES.map(p => {
                const isActive = phase === p.id;
                const isDone = phase > p.id;
                const Icon = p.Icon;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPhase(p.id)}
                    style={styles.railItem}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.railDot,
                        isActive && styles.railDotActive,
                        isDone && styles.railDotDone,
                      ]}
                    >
                      <Icon
                        size={16}
                        color={isActive ? Atlas.inkOnAmber : isDone ? Atlas.amber : Atlas.paperMute}
                      />
                    </View>
                    <Text style={[styles.railLabel, isActive && styles.railLabelActive]}>{p.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Phase header */}
          <Animated.View key={phase} entering={FadeIn.duration(300)} style={styles.phaseHeader}>
            <Text style={styles.eyebrow}>Phase {phase} of 4</Text>
            <Text style={styles.phaseTitle}>{cur.title}.</Text>
            <Text style={styles.phaseSub}>{cur.subtitle}</Text>
          </Animated.View>

          {/* Phase body */}
          <View style={styles.phaseBody}>{renderPhaseContent()}</View>

          {/* Right-rail-style activity card (mobile: stacked) */}
          <View style={styles.contextCard}>
            <View style={styles.contextHead}>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>A</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contextTitle}>Atlas</Text>
                <Text style={styles.contextOnline}>● online</Text>
              </View>
            </View>
            <Text style={styles.contextBody}>
              Em added Sintra. There's a 09:42 train from Rossio that arrives 10:25 — easy day trip from Lisbon.
            </Text>
            <View style={styles.contextActions}>
              <TouchableOpacity style={styles.contextPrimary} activeOpacity={0.9}>
                <Text style={styles.contextPrimaryText}>Add as Day 4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contextGhost} activeOpacity={0.9}>
                <Text style={styles.contextGhostText}>Ask follow-up</Text>
              </TouchableOpacity>
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
