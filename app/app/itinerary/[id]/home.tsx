import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Dimensions, BlurView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageCircle, Sparkles, Map, Calendar, Users, Share2, Info, Settings as SettingsIcon, Vote } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { tripService } from '../../../services/tripService';
import { Phase1View } from '../../../components/Phase1View';
import { Phase2View } from '../../../components/Phase2View';
import { Phase3View } from '../../../components/Phase3View';
import { Phase4View } from '../../../components/Phase4View';
import { DashboardSkeleton } from '../../../components/Skeleton';
import { AIChatAssistant } from '../../../components/AIChatAssistant';

const { width, height } = Dimensions.get('window');

const PHASES = [
  { id: 1, title: 'Discovery', subtitle: 'Swipe to like potential spots', icon: Sparkles },
  { id: 2, title: 'Curation', subtitle: 'Propose and finalize destinations', icon: Map },
  { id: 3, title: 'Assembly', subtitle: 'Plan your route and duration', icon: Calendar },
  { id: 4, title: 'Finalize', subtitle: 'Daily activity breakdown', icon: Info },
];

const ItineraryHomeScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('voting'); // 'voting', 'ai', 'settings'
  const [phase, setPhase] = useState(1);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getTrip(id as string),
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentPhaseData = PHASES.find(p => p.id === phase)!;

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

    switch (activeTab) {
      case 'voting':
        return (
          <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Hero Section */}
            <View style={styles.heroContainer}>
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80' }}
                style={styles.heroImage}
              >
                <LinearGradient
                  colors={['rgba(10, 10, 10, 0.2)', 'rgba(10, 10, 10, 1)']}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroContent}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>PHASE {trip?.current_phase || 1} ACTIVE</Text>
                    </View>
                    <Text style={styles.tripName}>{trip?.name || 'My Trip'}</Text>
                    <View style={styles.tripMeta}>
                      <Text style={styles.tripDate}>
                        {formatDate(trip?.start_date)} - {formatDate(trip?.end_date)}
                      </Text>
                      <View style={styles.dot} />
                      <Text style={styles.tripDate}>Collaborative</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>

            {/* Phase Navigation - Sticky */}
            <View style={styles.phaseNavContainer}>
              <View style={styles.phaseNav}>
                {PHASES.map((p) => {
                  const Icon = p.icon;
                  const isActive = phase === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.phaseItem, isActive && styles.phaseItemActive]}
                      onPress={() => setPhase(p.id)}
                    >
                      <View style={[styles.phaseIcon, isActive && styles.phaseIconActive]}>
                        <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                      </View>
                      {isActive && (
                        <Animated.Text entering={FadeIn.duration(200)} style={styles.phaseItemText}>
                          {p.title}
                        </Animated.Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Content Section */}
            <Animated.View key={phase} entering={FadeIn.duration(400)} style={styles.contentSection}>
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseTitle}>{currentPhaseData.title}.</Text>
                <Text style={styles.phaseSubtitle}>{currentPhaseData.subtitle}</Text>
              </View>
              
              <View style={styles.phaseContent}>
                {renderPhaseContent()}
              </View>
            </Animated.View>
          </ScrollView>
        );
      case 'ai':
        return (
          <View style={styles.tabView}>
            <AIChatAssistant 
              isOpen={true} 
              onClose={() => setActiveTab('voting')} 
              tripId={id as string}
              tripName={trip?.name || 'My Trip'}
              inline={true}
            />
          </View>
        );
      case 'settings':
        return (
          <View style={styles.tabView}>
            <SafeAreaView style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
            </SafeAreaView>
            <ScrollView contentContainerStyle={styles.settingsContent}>
              <View style={styles.settingsGroup}>
                <Text style={styles.groupLabel}>General</Text>
                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingText}>Edit Trip Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingText}>Manage Members</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.settingsGroup}>
                <Text style={styles.groupLabel}>Preferences</Text>
                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingText}>Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingText}>Currency Display</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.leaveButton}
                onPress={() => router.replace('/(tabs)')}
              >
                <Text style={styles.leaveButtonText}>Exit Itinerary</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.mainContent}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBarContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(10, 10, 10, 0.95)', '#0a0a0a']}
          style={styles.bottomGradient}
        />
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'voting' && styles.tabButtonActive]}
            onPress={() => setActiveTab('voting')}
          >
            <Vote size={22} color={activeTab === 'voting' ? '#818cf8' : '#64748b'} />
            <Text style={[styles.tabLabel, activeTab === 'voting' && styles.tabLabelActive]}>Planning</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'ai' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ai')}
          >
            <View style={styles.aiIconContainer}>
               <MessageCircle size={22} color={activeTab === 'ai' ? '#ffffff' : '#64748b'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'ai' && styles.tabLabelActive]}>AI Assistant</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('settings')}
          >
            <SettingsIcon size={22} color={activeTab === 'settings' ? '#818cf8' : '#64748b'} />
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    height: 320,
    width: '100%',
  },
  heroImage: {
    flex: 1,
  },
  heroGradient: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  heroContent: {
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(129, 140, 248, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  badgeText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tripName: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripDate: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  phaseNavContainer: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  phaseNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'space-between',
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  phaseItemActive: {
    backgroundColor: '#1e293b',
  },
  phaseIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  phaseIconActive: {
    backgroundColor: '#3b82f6',
  },
  phaseItemText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  contentSection: {
    flex: 1,
    paddingTop: 24,
  },
  phaseHeader: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  phaseTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  phaseSubtitle: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  phaseContent: {
    flex: 1,
  },
  tabView: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  settingsHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  settingsTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  settingsContent: {
    padding: 24,
    gap: 32,
  },
  settingsGroup: {
    gap: 12,
  },
  groupLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  settingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
  },
  bottomGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  tabButtonActive: {
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#818cf8',
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    borderWidth: 4,
    borderColor: '#0a0a0a',
  },
});

export default ItineraryHomeScreen;
