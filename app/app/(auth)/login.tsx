import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { Atlas, Fonts, Radii, Shadows, eyebrow, display, accentWord } from '../../constants/atlas';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((state) => state.setUser);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      setUser(data.user);
      router.replace('/(tabs)');
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.85}>
            <ChevronLeft color={Atlas.paperDim} size={20} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.title}>
              Sign <Text style={styles.titleAccent}>in.</Text>
            </Text>
            <Text style={styles.subtitle}>Pick up where your group left off.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
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

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
              style={[styles.submitButton, Shadows.amberGlow, loading && { opacity: 0.7 }]}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Signing in…' : 'Continue'}</Text>
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
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signUpLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Atlas.ink },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },

  backButton: {
    marginTop: 16, marginBottom: 32,
    width: 40, height: 40, borderRadius: Radii.r2,
    backgroundColor: Atlas.ink2, borderWidth: 1, borderColor: Atlas.hairline,
    alignItems: 'center', justifyContent: 'center',
  },
  header: { marginBottom: 32 },
  eyebrow: { ...eyebrow, marginBottom: 10 },
  title: { ...display(48), letterSpacing: -1.4 },
  titleAccent: { ...accentWord, fontSize: 48, lineHeight: 48 },
  subtitle: { marginTop: 12, fontFamily: Fonts.sans, fontSize: 15, color: Atlas.paperDim },

  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: Atlas.paperMute, marginLeft: 2, letterSpacing: 0.4 },
  input: {
    backgroundColor: Atlas.ink2,
    height: 52, borderRadius: Radii.r2,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: Atlas.hairline,
    color: Atlas.paper,
    fontFamily: Fonts.sans, fontSize: 15,
  } as any,

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

  footer: { marginTop: 'auto', marginBottom: 32, flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontFamily: Fonts.sans, color: Atlas.paperMute, fontSize: 13 },
  signUpLink: { fontFamily: Fonts.sans, color: Atlas.paper, fontSize: 13, fontWeight: '700' },
});

export default LoginScreen;
