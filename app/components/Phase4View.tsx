import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Calendar as CalendarIcon, MapPin, Sparkles, Plus } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { tripService } from '../services/tripService';
import { supabase } from '../lib/supabase';
import { DashboardSkeleton } from './Skeleton';
import { Atlas, Fonts, Radii, eyebrow, display, tagTones } from '../constants/atlas';

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

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .in('destination_id', destinations.map((d: any) => d.id));
      if (error) return [];
      return data;
    },
    enabled: destinations.length > 0,
  });

  const generateDays = () => {
    if (!trip?.start_date || !trip?.end_date) return [];
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const days: Date[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const days = generateDays();
  const sel = days[selectedDay];

  const renderActivity = (activity: any, index: number) => (
    <Animated.View key={activity.id} entering={FadeInUp.delay(index * 80)} style={styles.row}>
      <Text style={styles.timeCol}>{activity.time || '—'}</Text>
      <View style={styles.activityCard}>
        <Image
          source={{
            uri:
              activity.image_url ||
              'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80',
          }}
          style={styles.activityImage}
        />
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{activity.name}</Text>
          <View style={styles.meta}>
            <View style={[styles.tag, { backgroundColor: tagTones.paper.bg, borderColor: tagTones.paper.border }]}>
              <Text style={[styles.tagText, { color: tagTones.paper.color }]}>
                {activity.category || 'Activity'}
              </Text>
            </View>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{activity.duration || 'Planned'}</Text>
            {activity.location ? (
              <>
                <Text style={styles.metaSep}>·</Text>
                <MapPin size={11} color={Atlas.paperMute} />
                <Text style={styles.metaText}>{activity.location}</Text>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  if (loadingActivities && destinations.length > 0) return <DashboardSkeleton />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {days.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dayStrip}
            contentContainerStyle={styles.dayStripContent}
          >
            {days.map((date, i) => {
              const isActive = i === selectedDay;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedDay(i)}
                  style={[styles.dayCard, isActive && styles.dayCardActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>Day {i + 1}</Text>
                  <Text style={[styles.dayDate, isActive && styles.dayDateActive]}>
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              {sel ? sel.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Itinerary'} ·{' '}
              {destinations[selectedDay]?.name || destinations[0]?.name || 'Stop'}
            </Text>
            <Text style={styles.sectionTitle}>Day {selectedDay + 1}.</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
            <Plus color={Atlas.amber} size={13} />
            <Text style={styles.addBtnText}>Add activity</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 10 }}>
          {activities.length > 0 ? (
            activities.map((a: any, i: number) => renderActivity(a, i))
          ) : (
            <View style={styles.emptyCard}>
              <Sparkles size={28} color={Atlas.paperFaint} />
              <Text style={styles.emptyCardText}>No activities added for this day yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.summary}>
          <CalendarIcon size={16} color={Atlas.amber} />
          <Text style={styles.summaryText}>
            {activities.length} activit{activities.length === 1 ? 'y' : 'ies'} planned
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} activeOpacity={0.9}>
          <Text style={styles.confirmText}>Confirm plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 220 },

  dayStrip: { marginBottom: 24, marginHorizontal: -24 },
  dayStripContent: { paddingHorizontal: 24, gap: 8 },
  dayCard: {
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: Atlas.ink2,
    borderRadius: Radii.r2,
    borderWidth: 1, borderColor: Atlas.hairline,
    minWidth: 88,
  },
  dayCardActive: { backgroundColor: Atlas.amber, borderColor: Atlas.amber },
  dayLabel: {
    fontFamily: Fonts.sans, fontSize: 10, fontWeight: '600',
    color: Atlas.paperMute, letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayLabelActive: { color: 'rgba(26,20,16,0.7)' },
  dayDate: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700', color: Atlas.paper },
  dayDateActive: { color: Atlas.inkOnAmber },

  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  eyebrow: { ...eyebrow, marginBottom: 4 },
  sectionTitle: { fontFamily: Fonts.serif, fontSize: 26, color: Atlas.paper, letterSpacing: -0.5 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 36, paddingHorizontal: 12, borderRadius: Radii.r1,
    backgroundColor: Atlas.amberSoft, borderWidth: 1, borderColor: Atlas.amberLine,
  },
  addBtnText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', color: Atlas.amber },

  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  timeCol: {
    width: 56, paddingTop: 16,
    fontFamily: Fonts.mono, fontSize: 12, color: Atlas.paperMute, textAlign: 'right',
  },
  activityCard: {
    flex: 1, padding: 14,
    backgroundColor: Atlas.ink2, borderWidth: 1, borderColor: Atlas.hairline,
    borderRadius: Radii.r3,
    flexDirection: 'row', gap: 12, alignItems: 'center',
  },
  activityImage: { width: 56, height: 56, borderRadius: Radii.r2 },
  activityInfo: { flex: 1, gap: 4 },
  activityName: { fontFamily: Fonts.sans, fontSize: 15, color: Atlas.paper, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radii.pill, borderWidth: 1 },
  tagText: { fontFamily: Fonts.sans, fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  metaSep: { color: Atlas.paperFaint, fontSize: 12 },
  metaText: { fontFamily: Fonts.sans, fontSize: 12, color: Atlas.paperMute },

  emptyCard: {
    padding: 36, borderRadius: Radii.r4,
    backgroundColor: Atlas.ink2,
    borderWidth: 1.5, borderColor: Atlas.hairline2, borderStyle: 'dashed',
    alignItems: 'center', gap: 12,
  },
  emptyCardText: { fontFamily: Fonts.sans, color: Atlas.paperMute, fontSize: 13, textAlign: 'center' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 92, paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: Atlas.ink, borderTopWidth: 1, borderTopColor: Atlas.hairline,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { fontFamily: Fonts.sans, color: Atlas.paper, fontWeight: '600', fontSize: 13 },
  confirmButton: {
    height: 44, paddingHorizontal: 22, borderRadius: Radii.r2,
    backgroundColor: Atlas.amber, alignItems: 'center', justifyContent: 'center',
  },
  confirmText: { fontFamily: Fonts.sans, color: Atlas.inkOnAmber, fontSize: 13, fontWeight: '700' },
});
