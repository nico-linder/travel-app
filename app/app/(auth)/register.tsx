import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { Atlas, Fonts, Radii, Shadows, eyebrow, display, accentWord } from '../../constants/atlas';

const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email to verify your account.');
      router.replace('/(auth)/login');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: Platform.OS === 'web' ? window.location.origin : 'travel-app://' },
    });
    if (error) alert(error.message);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.85}>
              <ChevronLeft color={Atlas.paperDim} size={20} />
            </TouchableOpacity>

            <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
              <Text style={styles.eyebrow}>Join Atlas</Text>
              <Text style={styles.title}>
                Create <Text style={styles.titleAccent}>account.</Text>
              </Text>
              <Text style={styles.subtitle}>Plan together. Travel further. Free for groups up to four.</Text>
            </Animated.View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full name</Text>
                <View style={styles.inputWrapper}>
                  <User color={Atlas.paperFaint} size={18} />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Nico Linder"
                    placeholderTextColor={Atlas.paperFaint}
                    style={styles.input}
                    selectionColor={Atlas.amber}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail color={Atlas.paperFaint} size={18} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    placeholderTextColor={Atlas.paperFaint}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    selectionColor={Atlas.amber}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock color={Atlas.paperFaint} size={18} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Atlas.paperFaint}
                    style={styles.input}
                    secureTextEntry
                    selectionColor={Atlas.amber}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
                style={[styles.submitButton, Shadows.amberGlow, loading && { opacity: 0.7 }]}
              >
                <Text style={styles.submitButtonText}>{loading ? 'Creating…' : 'Create account'}</Text>
                {!loading && <ArrowRight color={Atlas.inkOnAmber} size={17} />}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity onPress={handleGoogleLogin} activeOpacity={0.9} style={styles.googleButton}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Atlas.ink },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },

  backButton: {
    marginTop: 16, marginBottom: 28,
    width: 40, height: 40, borderRadius: Radii.r2,
    backgroundColor: Atlas.ink2, borderWidth: 1, borderColor: Atlas.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  header: { marginBottom: 28 },
  eyebrow: { ...eyebrow, marginBottom: 10 },
  title: { ...display(46), letterSpacing: -1.4 },
  titleAccent: { ...accentWord, fontSize: 46, lineHeight: 46 },
  subtitle: { marginTop: 12, fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paperDim, lineHeight: 20 },

  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: Atlas.paperMute, letterSpacing: 0.4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Atlas.ink2,
    height: 52, borderRadius: Radii.r2,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: Atlas.hairline,
    gap: 10,
  },
  input: { flex: 1, fontFamily: Fonts.sans, fontSize: 15, color: Atlas.paper } as any,

  submitButton: {
    height: 54, borderRadius: Radii.r2, backgroundColor: Atlas.amber,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: 8,
  },
  submitButtonText: { fontFamily: Fonts.sans, color: Atlas.inkOnAmber, fontSize: 15, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Atlas.hairline },
  dividerText: { fontFamily: Fonts.sans, color: Atlas.paperFaint, fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },

  googleButton: {
    height: 52, borderRadius: Radii.r2,
    backgroundColor: 'rgba(245,239,230,0.06)',
    borderWidth: 1, borderColor: 'rgba(245,239,230,0.18)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleG: { color: '#4285F4', fontSize: 16, fontWeight: '700', fontFamily: Fonts.sans },
  googleButtonText: { fontFamily: Fonts.sans, color: Atlas.paper, fontSize: 14, fontWeight: '600' },

  footer: { marginTop: 28, flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontFamily: Fonts.sans, color: Atlas.paperMute, fontSize: 13 },
  signInLink: { fontFamily: Fonts.sans, color: Atlas.paper, fontSize: 13, fontWeight: '700' },
});

export default RegisterScreen;
