import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Key, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';

const JoinTripScreen = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const setTripId = useAppStore((state) => state.setTripId);

  const handleJoin = () => {
    if (code.length < 4) {
      alert('Please enter a valid join code');
      return;
    }
    setTripId(code);
    router.replace(`/itinerary/${code}/home`);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color="#94a3b8" size={24} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Join Trip</Text>
              <Text style={styles.subtitle}>Enter the invitation code to join your friends.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Invitation Code</Text>
                <View style={styles.inputWrapper}>
                  <Key color="#475569" size={20} />
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="e.g. X7R-92B"
                    placeholderTextColor="#475569"
                    style={styles.input}
                    autoCapitalize="characters"
                    maxLength={10}
                    selectionColor="#818cf8"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleJoin}
                disabled={code.length < 4}
                activeOpacity={0.8}
                style={styles.joinButton}
              >
                <LinearGradient
                  colors={['#818cf8', '#60a5fa', '#22d3ee']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.buttonInner, code.length < 4 && { opacity: 0.5 }]}
                >
                  <Text style={styles.joinButtonText}>Join Journey</Text>
                  <ArrowRight color="#ffffff" size={18} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                The organizer can find the code in the trip dashboard settings.
              </Text>
            </View>
          </ScrollView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    letterSpacing: -2.5,
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
    gap: 32,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    height: 60,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    outlineStyle: 'none',
  } as any,
  joinButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  infoCard: {
    marginTop: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default JoinTripScreen;
