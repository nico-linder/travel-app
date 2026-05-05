import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SwipeCard } from './SwipeCard';
import { openTripMapService } from '../services/openTripMap';
import { yelpService } from '../services/yelpService';
import { tripService } from '../services/tripService';
import { camundaService } from '../services/camundaService';
import { supabase } from '../lib/supabase';
import { DashboardSkeleton } from './Skeleton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Atlas, Fonts, display } from '../constants/atlas';

export const Phase1View = ({ tripId }: { tripId: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionVotedIds, setSessionVotedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });

    // Load locally saved votes
    const loadVotedIds = async () => {
      try {
        const stored = await AsyncStorage.getItem(`voted_ids_${tripId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSessionVotedIds(new Set(parsed));
        }
      } catch (e) {
        console.error('Failed to load voted ids', e);
      }
    };
    loadVotedIds();

    // Deploy Phase 1 Voting Process to Camunda
    const deployBPMN = async () => {
      const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Phase1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.44.0">
  <bpmn:process id="phase1-voting" name="Phase 1 Voting Analysis" isExecutable="true" camunda:historyTimeToLive="P180D">
    <bpmn:startEvent id="StartEvent_Voting" name="Voting Phase Started">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_Voting" targetRef="Activity_Init" />
    <bpmn:scriptTask id="Activity_Init" name="Initialize Votes Array" scriptFormat="javascript">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
      <bpmn:script>
        execution.setVariable('votesJson', '[]');
        execution.setVariable('votingResults', '[]');
      </bpmn:script>
    </bpmn:scriptTask>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_Init" targetRef="Gateway_Merge" />
    <bpmn:exclusiveGateway id="Gateway_Merge">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:incoming>Flow_LoopBack</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gateway_Merge" targetRef="Event_Catch_Vote" />
    <bpmn:intermediateCatchEvent id="Event_Catch_Vote" name="Vote Received">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
      <bpmn:messageEventDefinition messageRef="Message_VoteReceived" />
    </bpmn:intermediateCatchEvent>
    <bpmn:scriptTask id="Activity_AddVote" name="Add Vote to State &#38; Rank" scriptFormat="javascript">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_LoopBack</bpmn:outgoing>
      <bpmn:script>
        var votesRaw = execution.getVariable('votesJson') || '[]';
        var votes = JSON.parse(votesRaw);
        var newVoteRaw = execution.getVariable('singleVoteJson');
        if (newVoteRaw) {
           var newVote = JSON.parse(newVoteRaw);
           votes.push(newVote);
           execution.setVariable('votesJson', JSON.stringify(votes));
        }
        var counts = {};
        votes.forEach(function(vote) {
          if (vote.is_liked) {
            var key = vote.otm_xid || vote.destination_id || vote.name;
            if (!counts[key]) {
              counts[key] = { id: key, likes: 0, name: vote.name || 'Spot' };
            }
            counts[key].likes += 1;
          }
        });
        var ranked = Object.values(counts).sort(function(a, b) { return b.likes - a.likes; });
        execution.setVariable('votingResults', JSON.stringify(ranked));
      </bpmn:script>
    </bpmn:scriptTask>
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Event_Catch_Vote" targetRef="Activity_AddVote" />
    <bpmn:sequenceFlow id="Flow_LoopBack" sourceRef="Activity_AddVote" targetRef="Gateway_Merge" />
  </bpmn:process>
  <bpmn:message id="Message_VoteReceived" name="VoteReceived" />
</bpmn:definitions>`;
      await camundaService.deployProcess(bpmnXml, 'phase1_voting.bpmn');
      // Ensure the process is actively running for this trip!
      await camundaService.ensureProcessStarted(tripId);
    };
    deployBPMN();
  }, []);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getTrip(tripId),
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations', tripId],
    queryFn: () => tripService.getDestinations(tripId),
  });

  const { data: camundaVotes } = useQuery({
    queryKey: ['camunda-votes', tripId, userId],
    enabled: !!userId,
    queryFn: () => camundaService.getLiveRawVotes(tripId),
    refetchInterval: 2000 // Poll every 2s to keep it somewhat live if others vote
  });

  const { data: places, isLoading, error } = useQuery({
    queryKey: ['yelp-places', tripId, destinations?.length, trip?.vibes],
    enabled: !!destinations && !!trip,
    queryFn: async () => {
      let lat = 48.8566, lon = 2.3522;
      if (destinations && destinations.length > 0) {
        const firstDest = destinations[0];
        lat = firstDest.lat;
        lon = firstDest.lon;
      } else if (trip?.destination) {
        const geoData = await openTripMapService.getGeoname(trip.destination);
        if (geoData) {
          lat = geoData.lat || geoData.point?.lat || lat;
          lon = geoData.lon || geoData.point?.lon || lon;
        }
      }

      const categories = yelpService.mapVibesToCategories(trip?.vibes || []);
      const businesses = await yelpService.searchPlaces(lat, lon, categories, 20);
      
      return businesses.map(b => ({
        id: b.id,
        name: b.name,
        displayImage: b.image_url || `https://source.unsplash.com/featured/?${encodeURIComponent(b.name)},travel`,
        description: `Explore ${b.name}, rated ${b.rating}/5. ${b.location.display_address.join(', ')}.`,
        kinds: b.categories.map(c => c.title).join(', '),
        rating: b.rating,
        price: b.price,
        xid: b.id
      }));
    }
  });
  // Filter out places the user has already voted on
  const filteredPlaces = (places || []).filter(place => {
    // Keep places we just voted on in this session so the array doesn't shrink and cause skipping
    if (sessionVotedIds.has(place.xid)) return true;

    // If Camunda hasn't loaded yet, show all or none (let's default to show all)
    if (!camundaVotes) return true;
    
    // Check if there's any vote in Camunda from THIS user for THIS exact place (by otm_xid)
    const alreadyVoted = camundaVotes.some(v => v.user_id === userId && (v.otm_xid === place.xid || v.name === place.name));
    
    return !alreadyVoted;
  });

  // Auto-process results if everything is already voted on
  useEffect(() => {
    if (filteredPlaces.length === 0 && places?.length && !isProcessing && results.length === 0) {
      const runFinalAnalysis = async () => {
        setIsProcessing(true);
        // Get live results from the continuously running process!
        const rankedResults = await camundaService.getLiveResults(tripId);
        setResults(rankedResults);
        setIsProcessing(false);
      };
      runFinalAnalysis();
    }
  }, [filteredPlaces.length, places?.length, results.length]);

  const handleVote = async (locationId: string, liked: boolean) => {
    if (!userId) return;
    
    // 1. Update state immediately (Optimistic UI) & Save to local storage
    setSessionVotedIds(prev => {
      const newSet = new Set(prev).add(locationId);
      AsyncStorage.setItem(`voted_ids_${tripId}`, JSON.stringify(Array.from(newSet))).catch(console.error);
      return newSet;
    });
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    try {
      const place = places?.find(p => p.xid === locationId);
      let votePromise = Promise.resolve();

      if (place) {
        // 1. Send vote IMMEDIATELY to the Camunda Engine
        camundaService.sendVote(tripId, {
          is_liked: liked,
          otm_xid: place.xid,
          name: place.name,
          user_id: userId
        });

        // 2. Perform DB save (for both likes and dislikes)
        votePromise = tripService.proposeDestination(tripId, {
          name: place.name,
          image_url: place.displayImage || '',
          description: place.description || '',
          otm_xid: place.xid,
          proposed_by: userId,
        }, liked);
      }
      
      // If we've reached the end, process results via Camunda
      if (nextIndex >= (filteredPlaces?.length || 0)) {
        setIsProcessing(true);
        await votePromise;
        
        const rankedResults = await camundaService.getLiveResults(tripId);
        setResults(rankedResults);
        setIsProcessing(false);
        queryClient.invalidateQueries({ queryKey: ['camunda-votes', tripId, userId] });
        queryClient.invalidateQueries({ queryKey: ['destinations', tripId] });
      } else {
        // Otherwise fire and forget (background)
        votePromise.then(() => {
           queryClient.invalidateQueries({ queryKey: ['camunda-votes', tripId, userId] });
           queryClient.invalidateQueries({ queryKey: ['destinations', tripId] });
        });
      }
    } catch (e) {
      console.error('Error voting:', e);
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Failed to load destinations</Text>
    </View>
  );

  const locations = (filteredPlaces || []).map(p => ({
    id: p.id,
    name: p.name,
    image: p.displayImage,
    description: p.description,
    tags: p.kinds.split(',').slice(0, 2),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.stack}>
        {locations.length > 0 ? (
          <>
            {locations.map((location, index) => {
              // Keep currentIndex - 1 mounted so the swipe-off animation can finish
              if (index < currentIndex - 1) return null;
              if (index > currentIndex + 2) return null;

              return (
                <SwipeCard
                  key={location.id}
                  location={location}
                  onVote={(liked) => handleVote(location.id, liked)}
                  isTop={index === currentIndex}
                />
              );
            }).reverse()}

            {currentIndex >= locations.length ? (
              <View style={styles.empty}>
                {isProcessing ? (
                  <ActivityIndicator size="large" color={Atlas.amber} />
                ) : results.length > 0 ? (
                  <View style={styles.resultsContainer}>
                    <Sparkles size={32} color={Atlas.amber} style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>Top Picks</Text>
                    <Text style={styles.emptySubtitle}>Calculated by Camunda</Text>
                    <View style={styles.resultsList}>
                      {results.slice(0, 3).map((res, i) => (
                        <View key={res.id} style={styles.resultItem}>
                          <Text style={styles.resultRank}>#{i + 1}</Text>
                          <Text style={styles.resultName}>{res.name}</Text>
                          <Text style={styles.resultLikes}>{res.likes} likes</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <>
                    <Sparkles size={40} color={Atlas.amber} />
                    <Text style={styles.emptyTitle}>All Caught Up.</Text>
                    <Text style={styles.emptySubtitle}>Waiting for other members to finish.</Text>
                  </>
                )}
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.empty}>
            <Sparkles size={40} color={Atlas.amber} />
            <Text style={styles.emptyTitle}>No spots found.</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or area.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: Atlas.red, fontFamily: Fonts.sans, fontWeight: '600' },
  empty: { alignItems: 'center', gap: 14, paddingHorizontal: 32 },
  emptyTitle: { ...display(28), letterSpacing: -0.6, color: Atlas.paper },
  emptySubtitle: { fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paperMute, textAlign: 'center' },
  resultsContainer: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  resultsList: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Atlas.ink2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Atlas.hairline,
  },
  resultRank: {
    color: Atlas.amber,
    fontFamily: Fonts.sans,
    fontWeight: '900',
    fontSize: 16,
    width: 40,
  },
  resultName: {
    color: Atlas.paper,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  resultLikes: {
    color: Atlas.paperMute,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 14,
  },
});
