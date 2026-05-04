import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, Filter, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Atlas, Fonts, Radii, eyebrow, display, accentWord, tagTones } from '../../constants/atlas';

const DESTINATIONS = [
  { id: '1', name: 'Kyoto, Japan',     image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070', tag: 'Cultural'  },
  { id: '2', name: 'Swiss Alps',       image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=1965', tag: 'Adventure' },
  { id: '3', name: 'Santorini, Greece',image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2038', tag: 'Coastal'   },
  { id: '4', name: 'Marrakech',        image: 'https://images.unsplash.com/photo-1597212720128-c310f1c81b85?q=80&w=2070', tag: 'Cultural'  },
];

const CATEGORIES = ['All', 'Trending', 'Nature', 'City', 'Coastal'];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Discover</Text>
            <Text style={styles.title}>
              Hot <Text style={styles.titleAccent}>spots.</Text>
            </Text>
            <Text style={styles.lede}>Curated places worth a trip — handpicked from the Atlas community.</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search color={Atlas.paperMute} size={16} />
            <Text style={styles.searchPlaceholder}>Search any city, region, or landmark…</Text>
            <View style={styles.divider} />
            <Filter color={Atlas.amber} size={16} />
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsStrip}
            contentContainerStyle={styles.tabsContent}
          >
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity key={cat} style={[styles.tab, i === 0 && styles.tabActive]}>
                <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cards */}
          <View style={styles.grid}>
            {DESTINATIONS.map((dest, i) => (
              <Animated.View key={dest.id} entering={FadeInUp.delay(i * 80).duration(700)}>
                <TouchableOpacity activeOpacity={0.9} style={styles.card}>
                  <Image source={{ uri: dest.image }} style={styles.cardImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(14,12,10,0.95)']}
                    style={styles.cardOverlay}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.tag, { backgroundColor: tagTones.paper.bg, borderColor: tagTones.paper.border }]}>
                        <Text style={[styles.tagText, { color: tagTones.paper.color }]}>{dest.tag}</Text>
                      </View>
                      <View style={styles.arrowIcon}>
                        <ArrowUpRight color={Atlas.paper} size={15} />
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
  container: { flex: 1, backgroundColor: Atlas.ink },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 28 },

  header: { marginBottom: 24 },
  eyebrow: { ...eyebrow, marginBottom: 8 },
  title: { ...display(40), letterSpacing: -1 },
  titleAccent: { ...accentWord, fontSize: 40, lineHeight: 40 },
  lede: { marginTop: 12, fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paperDim, lineHeight: 20, maxWidth: 480 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Atlas.ink2,
    height: 52, borderRadius: Radii.r2,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: Atlas.hairline,
    marginBottom: 24,
  },
  searchPlaceholder: { marginLeft: 10, color: Atlas.paperMute, fontFamily: Fonts.sans, fontSize: 14, flex: 1 },
  divider: { width: 1, height: 22, backgroundColor: Atlas.hairline, marginHorizontal: 12 },

  tabsStrip: { marginBottom: 24, marginHorizontal: -24 },
  tabsContent: { paddingHorizontal: 24, gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radii.pill,
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: Atlas.hairline2,
  },
  tabActive: { backgroundColor: Atlas.paper, borderColor: Atlas.paper },
  tabText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: Atlas.paperDim, letterSpacing: 0.4 },
  tabTextActive: { color: Atlas.inkOnAmber, fontWeight: '700' },

  grid: { gap: 16 },
  card: {
    width: '100%', height: 280,
    borderRadius: Radii.r4, overflow: 'hidden',
    backgroundColor: Atlas.ink2,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', inset: 0 as any, top: 0, bottom: 0, left: 0, right: 0, padding: 18, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: {
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radii.pill, borderWidth: 1, alignSelf: 'flex-start',
  },
  tagText: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  arrowIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(14,12,10,0.6)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(245,239,230,0.16)',
  },
  cardTitle: { fontFamily: Fonts.serif, color: Atlas.paper, fontSize: 30, letterSpacing: -0.6, lineHeight: 32 },
});
