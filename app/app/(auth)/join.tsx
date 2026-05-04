import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Key, ArrowRight } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { Atlas, Fonts, Radii, Shadows, eyebrow, display, accentWord } from '../../constants/atlas';

const JoinTripScreen = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const setTripId = useAppStore((state) => state.setTripId);

  const handleJoin = () => {
    if (code.length < 4) {
      alert('Enter a valid join code.');
      return;
    }
    setTripId(code);
    router.replace(`/itinerary/${code}/home`);
  };

  const disabled = code.length < 4;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.85}>
              <ChevronLeft color={Atlas.paperDim} size={20} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.eyebrow}>Invitation</Text>
              <Text style={styles.title}>
                Join a <Text style={styles.titleAccent}>trip.</Text>
              </Text>
              <Text style={styles.subtitle}>Enter the code your group shared with you.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Invitation code</Text>
                <View style={styles.inputWrapper}>
                  <Key color={Atlas.paperFaint} size={18} />
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="X7R-92B"
                    placeholderTextColor={Atlas.paperFaint}
                    style={styles.input}
                    autoCapitalize="characters"
                    maxLength={10}
                    selectionColor={Atlas.amber}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleJoin}
                disabled={disabled}
                activeOpacity={0.9}
                style={[styles.joinButton, !disabled && Shadows.amberGlow, disabled && { opacity: 0.5 }]}
              >
                <Text style={styles.joinButtonText}>Join trip</Text>
                <ArrowRight color={Atlas.inkOnAmber} size={17} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                The organizer can find the code in the trip's settings panel.
              </Text>
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
    height: 60, borderRadius: Radii.r2,
    paddingHorizontal: 14,
    borderWidth: 1, borderColor: Atlas.hairline,
    gap: 10,
  },
  input: {
    flex: 1, fontFamily: Fonts.mono, fontSize: 18, color: Atlas.paper,
    fontWeight: '600', letterSpacing: 2,
  } as any,

  joinButton: {
    height: 54, borderRadius: Radii.r2, backgroundColor: Atlas.amber,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: 8,
  },
  joinButtonText: { fontFamily: Fonts.sans, color: Atlas.inkOnAmber, fontSize: 15, fontWeight: '700' },

  infoCard: {
    marginTop: 24, padding: 18, borderRadius: Radii.r3,
    backgroundColor: Atlas.ink2,
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  infoText: { fontFamily: Fonts.sans, color: Atlas.paperMute, fontSize: 13, textAlign: 'center', lineHeight: 19 },
});

export default JoinTripScreen;
