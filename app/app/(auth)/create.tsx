import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Compass, ArrowRight, Search, MapPin, Calendar, User, Mail, Lock, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { openTripMapService, OTMPlace } from '../../services/openTripMap';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/Skeleton';
import { CustomDatePicker } from '../../components/ui/CustomDatePicker';
import { tripService } from '../../services/tripService';
import { camundaService } from '../../services/camundaService';


const { width } = Dimensions.get('window');

const CreateTripScreen = () => {
  const router = useRouter();
  
  // Onboarding State
  const [currentStep, setCurrentStep] = useState(1);
  const [knowWhereGoing, setKnowWhereGoing] = useState<boolean | null>(null);
  const [destination, setDestination] = useState<OTMPlace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OTMPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [discoveredTags, setDiscoveredTags] = useState<string[]>(['Natural', 'Cultural', 'Historic', 'Architecture', 'Other']);
  const [customTripName, setCustomTripName] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  // Date State
  const [possibleTime, setPossibleTime] = useState<'specific' | 'any'>('specific');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;


  const handleTagSelect = async (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
      
      // Discover new tags from Camunda Server
      try {
        const related = await camundaService.getVibeSuggestions(tag);
        if (related.length > 0) {
          const newTags = related.filter(t => !discoveredTags.includes(t)).slice(0, 3);
          if (newTags.length > 0) {
            setDiscoveredTags(prev => {
              const index = prev.indexOf(tag);
              const nextTags = [...prev];
              nextTags.splice(index + 1, 0, ...newTags);
              return nextTags;
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch vibe suggestions:', error);
      }
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await openTripMapService.getGeoname(query);
      if (data) {
        setSearchResults([{ name: data.name, lat: data.lat, lon: data.lon, xid: 'geoname-' + data.name } as any]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error(error);
    }
    setIsSearching(false);
  };

  const handleNext = () => {
    if (currentStep === 1 && knowWhereGoing !== null) {
      setCurrentStep(2);
    } else if (currentStep === 2 && (destination || selectedTags.length > 0)) {
      if (destination) {
        setCustomTripName(`Trip to ${destination.name}`);
      } else if (selectedTags.length > 0) {
        setCustomTripName(`${selectedTags[0].replace(/_/g, ' ').charAt(0).toUpperCase() + selectedTags[0].replace(/_/g, ' ').slice(1)} Explorer`);
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (authMode === 'register' && !fullName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          // If auto-logged in (no confirmation needed)
          if (data.session) {
            handleFinalize(data.user.id);
          } else {
            setRegistrationSuccess(true);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          handleFinalize(data.user.id);
        }
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      let msg = error.message;
      if (msg.includes('invalid_credentials')) msg = 'Invalid email or password.';
      if (msg.includes('User already registered')) msg = 'This email is already in use.';
      if (msg.includes('Email not confirmed')) msg = 'Please check your inbox and confirm your email address before logging in.';
      
      if (authMode === 'register' && !error.message.includes('already in use')) {
        setRegistrationSuccess(true);
      } else {
        Alert.alert('Auth Error', msg);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFinalize = async (overrideUserId?: string) => {
    const finalUserId = overrideUserId || user?.id;
    if (!finalUserId) return;

    setIsFinalizing(true);
    try {
      // 1. Create Trip
      const name = customTripName || (destination ? `Trip to ${destination.name}` : 'My Adventure');
      const trip = await tripService.createTrip({
        name,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        creator_id: finalUserId,
        description: selectedTags.join(','), // Store tags in description for now
        fullName: fullName || undefined
      });

      // 2. If destination exists, add it as the first destination
      if (destination) {
        await tripService.proposeDestination(trip.id, {
          name: destination.name,
          otm_xid: destination.xid,
          proposed_by: finalUserId
        });
      } else if (selectedTags.length > 0) {
        // Log the selected vibes
        console.log('User vibes:', selectedTags);
      }

      router.replace(`/itinerary/${trip.id}/home`);
    } catch (error: any) {
      Alert.alert('Creation Error', error.message);
    } finally {
      setIsFinalizing(false);
    }
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Do you know where you want to go?</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity 
          style={[styles.optionCard, knowWhereGoing === true && styles.optionCardActive]}
          onPress={() => setKnowWhereGoing(true)}
        >
          <View style={[styles.optionIconContainer, knowWhereGoing === true && styles.optionIconContainerActive]}>
            <Compass size={24} color={knowWhereGoing === true ? '#ffffff' : '#475569'} />
          </View>
          <View>
            <Text style={[styles.optionText, knowWhereGoing === true && styles.optionTextActive]}>Yes, I have a place</Text>
            <Text style={styles.optionSubtext}>Search for specific cities or regions</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, knowWhereGoing === false && styles.optionCardActive]}
          onPress={() => setKnowWhereGoing(false)}
        >
          <View style={[styles.optionIconContainer, knowWhereGoing === false && styles.optionIconContainerActive]}>
            <Sparkles size={24} color={knowWhereGoing === false ? '#ffffff' : '#475569'} />
          </View>
          <View>
            <Text style={[styles.optionText, knowWhereGoing === false && styles.optionTextActive]}>No, help me decide</Text>
            <Text style={styles.optionSubtext}>Use AI to find your next destination</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.primaryButton, knowWhereGoing === null && { opacity: 0.5 }]} 
        onPress={handleNext}
        disabled={knowWhereGoing === null}
      >
        <LinearGradient
          colors={['#818cf8', '#60a5fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ArrowRight size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
      {knowWhereGoing ? (
        <>
          <Text style={styles.stepTitle}>Where are we heading?</Text>
          <View style={styles.searchBox}>
            <View style={styles.searchInputWrapper}>
              <Search size={20} color="#475569" />
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  handleSearch(text);
                }}
                placeholder="Search country or city..."
                placeholderTextColor="#475569"
                style={styles.input}
                selectionColor="#818cf8"
              />
            </View>

            <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
              {isSearching ? (
                <View style={{ gap: 12, marginTop: 12 }}>
                  <Skeleton width="100%" height={68} borderRadius={16} />
                  <Skeleton width="100%" height={68} borderRadius={16} />
                </View>
              ) : (
                searchResults.map((res) => (
                  <TouchableOpacity 
                    key={res.xid} 
                    style={[styles.resultItem, destination?.xid === res.xid && styles.resultItemActive]}
                    onPress={() => setDestination(res)}
                  >
                    <View style={[styles.resultIcon, destination?.xid === res.xid && styles.resultIconActive]}>
                      <MapPin size={18} color={destination?.xid === res.xid ? '#ffffff' : '#475569'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.resultText, destination?.xid === res.xid && styles.resultTextActive]}>{res.name}</Text>
                      <Text style={styles.resultSubtext}>Location Found</Text>
                    </View>
                    {destination?.xid === res.xid ? <CheckCircle2 size={20} color="#818cf8" /> : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.stepTitle}>Pick your vibe</Text>
          <Text style={styles.stepSubtitle}>Select what you enjoy, and we'll discover more related tags for you.</Text>
          
          <View style={styles.tagCloud}>
            {discoveredTags.map((tag, idx) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Animated.View 
                  key={tag} 
                  entering={FadeIn.delay(idx * 50)}
                >
                  <TouchableOpacity
                    style={[styles.tag, isSelected && styles.tagActive]}
                    onPress={() => handleTagSelect(tag)}
                  >
                    {isSelected && <CheckCircle2 size={14} color="#ffffff" style={{ marginRight: 6 }} />}
                    <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>
                      {tag.replace(/_/g, ' ').charAt(0).toUpperCase() + tag.replace(/_/g, ' ').slice(1)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {selectedTags.length > 0 && (
            <Animated.View entering={FadeIn} style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>{selectedTags.length} vibes selected</Text>
            </Animated.View>
          )}
        </>
      )}

      <TouchableOpacity 
        style={[styles.primaryButton, !(destination || selectedTags.length > 0) && { opacity: 0.5 }]} 
        onPress={handleNext}
        disabled={!(destination || selectedTags.length > 0)}
      >
        <LinearGradient
          colors={['#818cf8', '#60a5fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ArrowRight size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>When could you go?</Text>
      <Text style={styles.stepSubtitle}>Select a possible timeframe for your journey.</Text>
      
      <View style={styles.dateTypeContainer}>
        <TouchableOpacity 
          style={[styles.dateTypeButton, possibleTime === 'specific' && styles.dateTypeButtonActive]}
          onPress={() => setPossibleTime('specific')}
        >
          <Calendar size={20} color={possibleTime === 'specific' ? '#fff' : '#475569'} />
          <Text style={[styles.dateTypeText, possibleTime === 'specific' && styles.dateTypeTextActive]}>Specific Dates</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dateTypeButton, possibleTime === 'any' && styles.dateTypeButtonActive]}
          onPress={() => setPossibleTime('any')}
        >
          <Sparkles size={20} color={possibleTime === 'any' ? '#fff' : '#475569'} />
          <Text style={[styles.dateTypeText, possibleTime === 'any' && styles.dateTypeTextActive]}>No Specific Time</Text>
        </TouchableOpacity>
      </View>

      {possibleTime === 'specific' ? (
        <View style={styles.calendarWrapper}>
          <CustomDatePicker 
            startDate={startDate}
            endDate={endDate}
            onSelect={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
          {!!(startDate || endDate) ? (
            <View style={styles.selectedDatesDisplay}>
              <View style={styles.dateInfo}>
                <Text style={styles.dateInfoLabel}>DEPARTURE</Text>
                <Text style={styles.dateInfoValue}>{startDate || 'Select date'}</Text>
              </View>
              <View style={styles.dateSeparator} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateInfoLabel}>RETURN</Text>
                <Text style={styles.dateInfoValue}>{endDate || 'Select date'}</Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.anyTimeCard}>
           <Sparkles size={48} color="rgba(129, 140, 248, 0.2)" />
           <Text style={styles.anyTimeTitle}>Flexible Journey</Text>
           <Text style={styles.anyTimeSubtitle}>You'll be able to set specific dates later once the itinerary is more defined.</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.primaryButton, (possibleTime === 'specific' && !endDate) || isFinalizing ? { opacity: 0.5 } : {}]} 
        onPress={handleNext}
        disabled={(possibleTime === 'specific' && !endDate) || isFinalizing}
      >
        <LinearGradient
          colors={['#818cf8', '#60a5fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ArrowRight size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {user ? 'Ready to Go?' : (authMode === 'register' ? 'Join the Journey' : 'Welcome Back')}
      </Text>
      <Text style={styles.stepSubtitle}>
        {user ? "Everything looks good! Finalize your trip to start planning." : "Register or log in to save your trip and invite friends."}
      </Text>

      {user ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TRIP NAME</Text>
              <View style={styles.nameInputWrapper}>
                <TextInput
                  value={customTripName}
                  onChangeText={setCustomTripName}
                  placeholder="Give your trip a name..."
                  placeholderTextColor="#475569"
                  style={styles.nameInput}
                  selectionColor="#818cf8"
                />
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>DESTINATION</Text>
              <Text style={styles.summaryValue}>
                {destination?.name || (selectedTags.length > 0 ? selectedTags.slice(0, 2).map(t => t.replace(/_/g, ' ')).join(', ') + '...' : 'Discovery')}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>DATES</Text>
              <Text style={styles.summaryValue}>{startDate ? `${startDate} - ${endDate}` : 'Flexible'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>ACCOUNT</Text>
              <Text style={styles.summaryValue}>{user.email}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, isFinalizing && { opacity: 0.7 }]} 
            onPress={() => handleFinalize()}
            disabled={isFinalizing}
          >
            <LinearGradient
              colors={['#818cf8', '#60a5fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isFinalizing ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.buttonText}>Create Trip</Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => supabase.auth.signOut().then(() => setUser(null))} style={styles.switchAuth}>
             <Text style={styles.switchAuthText}>Not you? Switch account</Text>
          </TouchableOpacity>
        </View>
      ) : registrationSuccess ? (
          <Animated.View entering={FadeIn} style={styles.successState}>
            <View style={styles.successIconCircle}>
              <Mail size={40} color="#818cf8" />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successSubtitle}>
              We've sent a confirmation link to {email}. Please verify your email to continue.
            </Text>
            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => setRegistrationSuccess(false)}
            >
              <Text style={styles.successButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.authForm}>
            <View style={styles.summaryItem} style={{ marginBottom: 20 }}>
              <Text style={styles.summaryLabel}>TRIP NAME</Text>
              <View style={styles.nameInputWrapper}>
                <TextInput
                  value={customTripName}
                  onChangeText={setCustomTripName}
                  placeholder="Give your trip a name..."
                  placeholderTextColor="#475569"
                  style={styles.nameInput}
                  selectionColor="#818cf8"
                />
              </View>
            </View>

            {authMode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.authInputWrapper}>
                  <User size={18} color="#475569" />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Doe"
                    placeholderTextColor="#475569"
                    style={styles.authInput}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.authInputWrapper}>
                <Mail size={18} color="#475569" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#475569"
                  style={styles.authInput}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.authInputWrapper}>
                <Lock size={18} color="#475569" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  style={styles.authInput}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, (authLoading || isFinalizing) && { opacity: 0.7 }]} 
              onPress={handleAuth}
              disabled={authLoading || isFinalizing}
            >
              <LinearGradient
                colors={['#818cf8', '#60a5fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {(authLoading || isFinalizing) ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.buttonText}>{authMode === 'register' ? 'Register & Finish' : 'Login & Finish'}</Text>
                    <ArrowRight size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
              style={styles.switchAuth}
            >
              <Text style={styles.switchAuthText}>
                {authMode === 'register' ? 'Already have an account? Log in' : "Don't have an account? Register"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ChevronLeft color="#94a3b8" size={24} />
            </TouchableOpacity>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#818cf8',
    borderRadius: 3,
  },
  progressText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 12,
    marginTop: 20,
  },
  stepSubtitle: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionContainer: {
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 20,
  },
  optionCardActive: {
    borderColor: '#818cf8',
    backgroundColor: 'rgba(129, 140, 248, 0.08)',
  },
  optionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  optionIconContainerActive: {
    backgroundColor: '#818cf8',
    borderColor: '#818cf8',
  },
  optionText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  optionTextActive: {
    color: '#ffffff',
  },
  optionSubtext: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  primaryButton: {
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 32,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    outlineStyle: 'none',
  } as any,
  textAreaWrapper: {
    position: 'relative',
    marginBottom: 40,
  },
  textArea: {
    height: 160,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  aiBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  aiBadgeText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchBox: {
    flex: 1,
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 24,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultItemActive: {
    backgroundColor: 'rgba(129, 140, 248, 0.08)',
    borderColor: '#818cf8',
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  resultIconActive: {
    backgroundColor: '#818cf8',
    borderColor: '#818cf8',
  },
  resultText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
  resultTextActive: {
    color: '#ffffff',
  },
  resultSubtext: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  dateTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  dateTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10,
  },
  dateTypeButtonActive: {
    backgroundColor: '#818cf8',
    borderColor: '#818cf8',
  },
  dateTypeText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  dateTypeTextActive: {
    color: '#ffffff',
  },
  calendarWrapper: {
    gap: 20,
    marginBottom: 20,
  },
  selectedDatesDisplay: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: {
    flex: 1,
    gap: 4,
  },
  dateInfoLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dateInfoValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dateSeparator: {
    width: 1,
    height: 32,
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
  },
  anyTimeCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    gap: 16,
  },
  anyTimeTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  anyTimeSubtitle: {
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  authForm: {
    gap: 20,
    marginBottom: 40,
  },
  authInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  authInput: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: 16,
    outlineStyle: 'none',
  } as any,
  switchAuth: {
    alignItems: 'center',
    marginTop: 12,
  },
  switchAuthText: {
    color: '#818cf8',
    fontWeight: '700',
    fontSize: 14,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 24,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },
  successSubtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  successButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 24,
  },
  summaryInfo: {
    gap: 20,
  },
  summaryItem: {
    gap: 4,
  },
  summaryLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  nameInputWrapper: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  nameInput: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    outlineStyle: 'none',
  } as any,
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tagActive: {
    backgroundColor: '#818cf8',
    borderColor: '#818cf8',
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  tagTextActive: {
    color: '#ffffff',
  },
  selectedCount: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  selectedCountText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default CreateTripScreen;
