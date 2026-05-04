import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MoveRight, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';

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
      
      {/* Background decoration - EXACT from flight-app */}
      <View style={styles.decorationContainer}>
        <View style={styles.glowIndigo} />
        <View style={styles.glowBlue} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.duration(1000)} style={styles.header}>
            <Text style={styles.title}>
              Travel Together
            </Text>
            <Text style={styles.subtitle}>
              Forecast your next journey's cost with AI (Regression V1)
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(1000)} style={styles.cardWrapper}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Start your journey</Text>
              
              {/* EXACT Gradient border button from flight-app */}
              <TouchableOpacity 
                onPress={handleCreateTrip} 
                activeOpacity={0.9} 
                style={styles.gradientButton}
              >
                <LinearGradient
                  colors={['#818cf8', '#60a5fa', '#22d3ee']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButtonOuter}
                >
                  <View style={styles.gradientButtonInner}>
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                    <MoveRight color="#f1f5f9" size={20} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/join')}
                activeOpacity={0.7}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Join Existing Trip</Text>
                <Users color="#94a3b8" size={20} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(600)} style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // EXACT background from globals.css
  },
  decorationContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  glowIndigo: {
    position: 'absolute',
    top: '-25%',
    left: '-10%',
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(49, 46, 129, 0.15)',
    borderRadius: 1000,
  },
  glowBlue: {
    position: 'absolute',
    top: '60%',
    right: '-10%',
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 1000,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2.5,
    lineHeight: 52,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#94a3b8', // text-slate-400
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: '90%',
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // bg-slate-900/40
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1e293b', // border-slate-800
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  gradientButton: {
    height: 60,
    width: '100%',
  },
  gradientButtonOuter: {
    flex: 1,
    padding: 1,
    borderRadius: 14,
  },
  gradientButtonInner: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButtonText: {
    color: '#ededed', // foreground
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    marginTop: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontWeight: '500',
  },
  signInLink: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default WelcomeScreen;
