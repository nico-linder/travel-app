import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import { Atlas, Fonts, Radii, Shadows, eyebrow, display, accentWord } from '../constants/atlas';

const HERO = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2400&auto=format&fit=crop';

const PHASES = [
  { label: 'Discovery', sub: 'Swipe to find spots' },
  { label: 'Curation', sub: 'Vote together' },
  { label: 'Assembly', sub: 'Build your route' },
  { label: 'Final', sub: 'Day-by-day plan' },
];

const SOCIAL = [
  { initials: 'EM', color: Atlas.avatarPalette[0] },
  { initials: 'JR', color: Atlas.avatarPalette[1] },
  { initials: 'YO', color: Atlas.avatarPalette[2] },
  { initials: 'KS', color: Atlas.avatarPalette[3] },
];

const WelcomeScreen = () => {
  const router = useRouter();
  const setOnboardingStep = useAppStore((state) => state.setOnboardingStep);

  const handleCreateTrip = () => {
    setOnboardingStep(1);
    router.push('/(auth)/create');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full-bleed hero image */}
      <ImageBackground source={{ uri: HERO }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(14,12,10,0.95)', 'rgba(14,12,10,0.55)', 'rgba(14,12,10,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo / brand mark */}
          <Animated.View entering={FadeIn.duration(800)} style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>A</Text>
            </View>
            <Text style={styles.brandWord}>Atlas</Text>
          </Animated.View>

          {/* Hero copy */}
          <Animated.View entering={FadeInUp.duration(900)} style={styles.hero}>
            <Text style={styles.hEyebrow}>Plan together · Travel further</Text>
            <Text style={styles.hHeadline}>
              The trips you{'\n'}
              <Text style={styles.hAccent}>actually take.</Text>
            </Text>
            <Text style={styles.hLede}>
              Atlas turns "we should plan that trip" into a real itinerary — together. Swipe places, vote on stops,
              sequence days, and let an AI assistant fill in the rest.
            </Text>
          </Animated.View>

          {/* CTAs */}
          <Animated.View entering={FadeInUp.delay(220).duration(900)} style={styles.ctaRow}>
            <TouchableOpacity onPress={handleCreateTrip} activeOpacity={0.92} style={[styles.primaryBtn, Shadows.amberGlow]}>
              <Text style={styles.primaryBtnText}>Start a trip</Text>
              <ArrowRight color={Atlas.inkOnAmber} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/join')}
              activeOpacity={0.85}
              style={styles.ghostBtn}
            >
              <Users color={Atlas.paper} size={18} />
              <Text style={styles.ghostBtnText}>Join existing</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Social proof */}
          <Animated.View entering={FadeIn.delay(420).duration(900)} style={styles.social}>
            <View style={styles.avatarStack}>
              {SOCIAL.map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.socialAvatar,
                    { backgroundColor: s.color, marginLeft: i ? -10 : 0 },
                  ]}
                >
                  <Text style={styles.socialAvatarText}>{s.initials}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.socialText}>
              <Text style={styles.socialStrong}>40,000+ travelers</Text> planned trips together this year.
            </Text>
          </Animated.View>

          {/* Feature pills (the four phases) */}
          <Animated.View entering={FadeInUp.delay(540).duration(900)} style={styles.phaseRow}>
            {PHASES.map((p, i) => (
              <View key={i} style={styles.phasePill}>
                <View style={styles.phasePillHeader}>
                  <Text style={styles.phaseLabel}>{p.label}</Text>
                  <Text style={styles.phaseOrdinal}>{`0${i + 1}`}</Text>
                </View>
                <Text style={styles.phaseSub}>{p.sub}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Sign in footer */}
          <Animated.View entering={FadeIn.delay(720)} style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Atlas.ink },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },

  // Brand
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 64 },
  brandMark: {
    width: 32, height: 32, borderRadius: Radii.r1, backgroundColor: Atlas.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  brandMarkText: { fontFamily: Fonts.serif, color: Atlas.inkOnAmber, fontSize: 19, lineHeight: 22 },
  brandWord: { fontFamily: Fonts.serif, fontSize: 22, color: Atlas.paper },

  // Hero
  hero: { marginTop: 24 },
  hEyebrow: { ...eyebrow, color: Atlas.amber, marginBottom: 16 },
  hHeadline: { ...display(56), letterSpacing: -1.6, lineHeight: 56 },
  hAccent: { ...accentWord, fontSize: 56, lineHeight: 56 },
  hLede: {
    marginTop: 20, fontFamily: Fonts.sans, fontSize: 16, lineHeight: 24,
    color: Atlas.paperDim, maxWidth: 540,
  },

  // CTAs
  ctaRow: { marginTop: 32, gap: 12 },
  primaryBtn: {
    height: 56, borderRadius: Radii.r2, backgroundColor: Atlas.amber,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingHorizontal: 24,
  },
  primaryBtnText: { fontFamily: Fonts.sans, color: Atlas.inkOnAmber, fontSize: 15, fontWeight: '700' },
  ghostBtn: {
    height: 56, borderRadius: Radii.r2,
    backgroundColor: 'rgba(245,239,230,0.06)',
    borderWidth: 1, borderColor: 'rgba(245,239,230,0.18)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingHorizontal: 24,
  },
  ghostBtnText: { fontFamily: Fonts.sans, color: Atlas.paper, fontSize: 15, fontWeight: '600' },

  // Social proof
  social: { marginTop: 36, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarStack: { flexDirection: 'row' },
  socialAvatar: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Atlas.ink,
  },
  socialAvatarText: { fontFamily: Fonts.sans, color: Atlas.inkOnAmber, fontWeight: '700', fontSize: 11 },
  socialText: { flex: 1, fontFamily: Fonts.sans, fontSize: 13, color: Atlas.paperDim, lineHeight: 19 },
  socialStrong: { color: Atlas.paper, fontWeight: '700' },

  // Phase pills
  phaseRow: { marginTop: 40, gap: 10 },
  phasePill: {
    padding: 14,
    backgroundColor: 'rgba(22,19,16,0.7)',
    borderWidth: 1, borderColor: 'rgba(245,239,230,0.12)',
    borderRadius: Radii.r3,
  },
  phasePillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  phaseLabel: { fontFamily: Fonts.serif, fontSize: 18, color: Atlas.paper },
  phaseOrdinal: { fontFamily: Fonts.mono, fontSize: 11, color: Atlas.amber },
  phaseSub: { fontFamily: Fonts.sans, fontSize: 12, color: Atlas.paperMute },

  // Footer
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontFamily: Fonts.sans, color: Atlas.paperMute, fontSize: 14 },
  signInLink: { fontFamily: Fonts.sans, color: Atlas.paper, fontWeight: '700', fontSize: 14 },
});

export default WelcomeScreen;
