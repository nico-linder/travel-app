import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, Filter, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

const DESTINATIONS = [
  { id: '1', name: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070', tag: 'Cultural' },
  { id: '2', name: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=1965', tag: 'Adventure' },
  { id: '3', name: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2038', tag: 'Relax' },
];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>Discover</Text>
            <Text style={styles.headerTitle}>Hot Spots</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search color="#475569" size={18} />
            <Text style={styles.searchPlaceholder}>Search destinations...</Text>
            <View style={styles.divider} />
            <Filter color="#818cf8" size={18} />
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsStrip} contentContainerStyle={styles.tabsContent}>
            {['All', 'Trending', 'Nature', 'City'].map((cat, i) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.tab, i === 0 && styles.tabActive]}
              >
                <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cards */}
          <View style={styles.grid}>
            {DESTINATIONS.map((dest, i) => (
              <Animated.View key={dest.id} entering={FadeInUp.delay(i * 100)}>
                <TouchableOpacity activeOpacity={0.9} style={styles.card}>
                  <Image source={{ uri: dest.image }} style={styles.cardImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(10, 10, 10, 0.98)']}
                    style={styles.cardOverlay}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>{dest.tag}</Text>
                      </View>
                      <View style={styles.arrowIcon}>
                        <ArrowUpRight color="#ffffff" size={16} />
                      </View>
                    </View>
                    <Text style={styles.cardTitle}>{dest.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
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
    marginBottom: 32,
  },
  headerSubtitle: {
    color: '#64748b',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ededed',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -2.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 32,
  },
  searchPlaceholder: {
    marginLeft: 12,
    color: '#475569',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#1e293b',
    marginHorizontal: 12,
  },
  tabsStrip: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  tabsContent: {
    paddingHorizontal: 24,
  },
  tab: {
    marginRight: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#0a0a0a',
  },
  grid: {
    gap: 24,
  },
  card: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  cardOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.15)',
  },
  cardBadgeText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  arrowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -2,
  },
});
