import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Vote, Users, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../../../services/tripService';
import { supabase } from '../../../lib/supabase';
import { Phase1View } from '../../../components/Phase1View';
import { Phase2View } from '../../../components/Phase2View';
import { DashboardSkeleton } from '../../../components/Skeleton';

const DestinationPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const handleFinalize = async (destinationId: string) => {
    try {
      await tripService.finalizeDestination(id as string, destinationId);
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      router.replace(`/itinerary/${id}/home`);
    } catch (err) {
      console.error('Failed to finalize:', err);
    }
  };

  const { data: trip, isLoading: loadingTrip } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getTrip(id as string),
    enabled: !!id,
  });

  const { data: userVotes, isLoading: loadingVotes, refetch: refetchVotes } = useQuery({
    queryKey: ['user-votes', id, userId],
    queryFn: () => userId ? tripService.getUserVotes(id as string, userId) : Promise.resolve([]),
    enabled: !!id && !!userId,
  });

  const { data: allVotes } = useQuery({
    queryKey: ['trip-votes', id],
    queryFn: () => tripService.getTripVotes(id as string),
    enabled: !!id,
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations', id],
    queryFn: () => tripService.getDestinations(id as string),
    enabled: !!id,
  });

  const isLoading = loadingTrip || loadingVotes;

  if (isLoading) return <DashboardSkeleton />;

  // Logic: Has the user voted?
  // In Phase 1 (Discovery), "voted" might mean they've swiped through some.
  // In Phase 2 (Curation), "voted" means they've liked/disliked the proposed destinations.
  const hasVoted = userVotes && userVotes.length > 0;

  const renderContent = () => {
    if (!hasVoted) {
      if (trip?.current_phase === 1) {
        return <Phase1View tripId={id as string} />;
      }
      return <Phase2View tripId={id as string} />;
    }

    // Results View
    const { data: members = [] } = useQuery({
      queryKey: ['trip-members', id],
      queryFn: () => tripService.getTripMembers(id as string),
      enabled: !!id,
    });

    const rankedDestinations = [...(destinations || [])].sort((a, b) => {
      const likesA = allVotes?.filter((v: any) => v.destination_id === a.id && v.is_liked).length || 0;
      const likesB = allVotes?.filter((v: any) => v.destination_id === b.id && v.is_liked).length || 0;
      return likesB - likesA;
    });

    const membersPending = members.filter((m: any) => {
      const hasMemberVoted = allVotes?.some((v: any) => v.user_id === m.user_id);
      return !hasMemberVoted;
    });

    const allFinished = membersPending.length === 0;

    return (
      <ScrollView 
        contentContainerStyle={styles.resultsContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetchVotes} tintColor="#818cf8" />}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.resultsHeader}>
          <View style={styles.successIcon}>
            <Vote size={40} color="#818cf8" />
          </View>
          <Text style={styles.resultsTitle}>The Leaderboard.</Text>
          <Text style={styles.resultsSubtitle}>
            Here is where the group wants to go. Rank is based on consensus.
          </Text>
        </Animated.View>

        {/* Members Status */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionLabel}>Friend Status</Text>
          <View style={styles.membersGrid}>
            {members.map((m: any) => {
              const voted = allVotes?.some((v: any) => v.user_id === m.user_id);
              return (
                <View key={m.id} style={styles.memberStatusItem}>
                  <View style={[styles.statusDot, { backgroundColor: voted ? '#10b981' : '#f59e0b' }]} />
                  <Text style={styles.memberName}>{m.users?.display_name || 'Member'}</Text>
                  <Text style={styles.memberStatusText}>{voted ? 'Voted' : 'Thinking...'}</Text>
                </View>
              );
            })}
          </View>
          {!allFinished && (
            <View style={styles.pendingAlert}>
              <AlertCircle size={16} color="#f59e0b" />
              <Text style={styles.pendingText}>Waiting for {membersPending.length} more friends.</Text>
            </View>
          )}
        </View>

        {/* Ranked Destinations */}
        <View style={styles.votesSection}>
          <Text style={styles.sectionLabel}>Top Destinations</Text>
          {rankedDestinations.length > 0 ? (
            rankedDestinations.map((dest: any, index: number) => {
              const destVotes = allVotes?.filter((v: any) => v.destination_id === dest.id) || [];
              const likes = destVotes.filter((v: any) => v.is_liked).length;
              const total = destVotes.length;
              const percentage = total > 0 ? (likes / total) * 100 : 0;
              const isConsensus = likes === members.length && members.length > 1;

              return (
                <Animated.View key={dest.id} entering={FadeInDown.delay(index * 100)} style={styles.destCard}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.destMain}>
                    <View style={styles.destInfo}>
                      <Text style={styles.destName}>{dest.name}</Text>
                      {isConsensus && (
                        <View style={styles.consensusBadge}>
                          <CheckCircle2 size={12} color="#10b981" />
                          <Text style={styles.consensusText}>Consensus</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.progressBarBg}>
                      <LinearGradient
                        colors={['#818cf8', '#60a5fa']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${percentage}%` }]}
                      />
                    </View>
                    <Text style={styles.destVoteCount}>{likes} out of {members.length} friends like this</Text>
                    
                    {allFinished && isConsensus && (
                      <TouchableOpacity 
                        style={styles.pickButton}
                        onPress={() => handleFinalize(dest.id)}
                      >
                        <Text style={styles.pickButtonText}>Pick as Final Destination</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No destinations proposed yet.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.changeVoteButton}
          onPress={() => {
            // In a real app, we might reset votes or allow editing
          }}
        >
          <Text style={styles.changeVoteText}>Change My Votes</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Destinations</Text>
          <Text style={styles.headerSubtitle}>{trip?.name}</Text>
        </View>
        <TouchableOpacity style={styles.usersButton}>
          <Users color="#94a3b8" size={20} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  usersButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  content: {
    flex: 1,
  },
  resultsContent: {
    padding: 24,
    paddingBottom: 100,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  resultsTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  resultsSubtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  votesSection: {
    gap: 16,
  },
  sectionLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statusSection: {
    marginBottom: 32,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10, 10, 10, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  memberName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  memberStatusText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  pendingText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '600',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  rankText: {
    color: '#818cf8',
    fontSize: 16,
    fontWeight: '900',
  },
  destMain: {
    flex: 1,
    gap: 12,
  },
  destCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    gap: 16,
  },
  destInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  destName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  consensusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  consensusText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  destVoteCount: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  pickButton: {
    backgroundColor: '#818cf8',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  pickButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  changeVoteButton: {
    marginTop: 40,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  changeVoteText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DestinationPage;
