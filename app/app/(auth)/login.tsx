import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';

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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: Platform.OS === 'web' ? window.location.origin : 'travel-app://'
      }
    });
    if (error) alert(error.message);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#94a3b8" size={24} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Forecast your next journey's cost with AI</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Origin (Email)</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. name@example.com"
                placeholderTextColor="#475569"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                selectionColor="#818cf8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Destination (Password)</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                style={styles.input}
                secureTextEntry
                selectionColor="#818cf8"
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.submitButton}
            >
              <LinearGradient
                colors={['#818cf8', '#60a5fa', '#22d3ee']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonInner}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Authenticating...' : 'Get Analysis'}
                </Text>
                {!loading && <ArrowRight color="#ffffff" size={18} />}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              style={styles.googleButton}
            >
              <View style={styles.googleIconContainer}>
                 <Text style={styles.googleG}>G</Text>
              </View>
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
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 40,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ededed',
    fontSize: 15,
    fontWeight: '500',
    outlineStyle: 'none',
  } as any,
  submitButton: {
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  signInLink: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  dividerText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  googleButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LoginScreen;
