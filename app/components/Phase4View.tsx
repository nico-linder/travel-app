import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar as CalendarIcon, Clock, Plus, ChevronRight, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { tripService } from '../services/tripService';
import { supabase } from '../lib/supabase';
import { DashboardSkeleton } from './Skeleton';

export const Phase4View = ({ tripId }: { tripId: string }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getTrip(tripId),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations', tripId],
    queryFn: () => tripService.getDestinations(tripId),
  });

  // Fetch activities (Mocking the fetch for now as we might not have many yet)
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .in('destination_id', destinations.map(d => d.id));
      if (error) return [];
      return data;
    },
    enabled: destinations.length > 0
  });

  const generateDays = () => {
    if (!trip?.start_date || !trip?.end_date) return [];
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const days = [];
    const curr = new Date(start);
    while (curr <= end) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const days = generateDays();

  const renderActivity = (activity: any, index: number) => (
    <Animated.View key={activity.id} entering={FadeInUp.delay(index * 100)} style={styles.activityCard}>
      <Image source={{ uri: activity.image_url || 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80' }} style={styles.activityImage} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.typeTag}>{activity.category || 'Activity'}</Text>
          <View style={styles.duration}>
            <Clock size={12} color="#818cf8" />
            <Text style={styles.durationText}>Planned</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Plus size={20} color="#818cf8" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (loadingActivities && destinations.length > 0) return <DashboardSkeleton />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {days.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarStrip} contentContainerStyle={styles.calendarContent}>
            {days.map((date, i) => (
              <TouchableOpacity 
                key={i} 
                onPress={() => setSelectedDay(i)}
                style={[styles.dayCard, i === selectedDay && styles.dayCardActive]}
              >
                <Text style={[styles.dayNum, i === selectedDay && styles.dayNumActive]}>{date.getDate()}</Text>
                <Text style={[styles.dayMonth, i === selectedDay && styles.dayMonthActive]}>
                  {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {destinations[0]?.name || 'Your Itinerary'}
            </Text>
            <TouchableOpacity style={styles.actionLink}>
              <Text style={styles.actionLinkText}>Details</Text>
              <ChevronRight size={14} color="#818cf8" />
            </TouchableOpacity>
          </View>

          {activities.length > 0 ? (
            activities.map((activity, index) => renderActivity(activity, index))
          ) : (
            <View style={styles.emptyCard}>
              <Sparkles size={32} color="#1e293b" />
              <Text style={styles.emptyCardText}>No activities added for this day.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.summary}>
          <CalendarIcon size={18} color="#818cf8" />
          <Text style={styles.summaryText}>{activities.length} Items Fixed</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton}>
          <LinearGradient
            colors={['#818cf8', '#60a5fa']}
            style={styles.confirmInner}
          >
            <Text style={styles.confirmText}>Confirm Plan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  calendarStrip: {
    marginBottom: 40,
    marginHorizontal: -24,
  },
  calendarContent: {
    paddingHorizontal: 24,
  },
  dayCard: {
    width: 64,
    height: 72,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayCardActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  dayNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  dayNumActive: {
    color: '#0a0a0a',
  },
  dayMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    marginTop: 2,
  },
  dayMonthActive: {
    color: '#475569',
  },
  section: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLinkText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  activityImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  activityName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeTag: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  emptyCard: {
    padding: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 12,
  },
  emptyCardText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  confirmButton: {
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmInner: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
