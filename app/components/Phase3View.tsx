import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/tripService';
import { DashboardSkeleton } from './Skeleton';
import { supabase } from '../lib/supabase';
import { Atlas, Fonts, Radii, eyebrow, display } from '../constants/atlas';

export const Phase3View = ({ tripId }: { tripId: string }) => {
  const queryClient = useQueryClient();

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations', tripId],
    queryFn: () => tripService.getDestinations(tripId),
  });

  const updateDurationMutation = useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
      const { error } = await supabase.from('destinations').update({ duration_days: duration }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations', tripId] });
    },
  });

  const handleUpdateDuration = (id: string, current: number, delta: number) => {
    const next = Math.max(1, current + delta);
    updateDurationMutation.mutate({ id, duration: next });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const days = item.duration_days || 1;
    return (
      <View style={styles.row}>
        <View style={styles.timelineCol}>
          <View style={styles.timelineDot} />
          {index < destinations.length - 1 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardLabel}>Stop {index + 1}</Text>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => handleUpdateDuration(item.id, days, -1)}
              style={styles.controlMinus}
              activeOpacity={0.85}
            >
              <Text style={styles.controlMinusText}>−</Text>
            </TouchableOpacity>
            <View style={styles.daysDisplay}>
              <Text style={styles.daysNum}>{days}</Text>
              <Text style={styles.daysUnit}>NT</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleUpdateDuration(item.id, days, 1)}
              style={styles.controlPlus}
              activeOpacity={0.85}
            >
              <Text style={styles.controlPlusText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) return <DashboardSkeleton />;

  const total = destinations.reduce((s: number, d: any) => s + (d.duration_days || 1), 0);

  return (
    <View style={styles.container}>
      {destinations.length > 0 ? (
        <>
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>Drag to reorder · {total} nights planned</Text>
          </View>
          <FlashList data={destinations} renderItem={renderItem} />
          <View style={styles.totalCard}>
            <View>
              <Text style={[styles.eyebrow, { color: Atlas.amber }]}>Total</Text>
              <Text style={styles.totalNum}>{total} nights · {destinations.length} stops</Text>
            </View>
            <TouchableOpacity style={styles.lockBtn} activeOpacity={0.9}>
              <Text style={styles.lockBtnText}>Lock in</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Sparkles size={36} color={Atlas.paperFaint} />
          <Text style={styles.emptyTitle}>No destinations yet.</Text>
          <Text style={styles.emptySubtitle}>Go back to Discovery to pick some spots.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24, paddingHorizontal: 24 },
  intro: { marginBottom: 14 },
  eyebrow: { ...eyebrow },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  timelineCol: { width: 16, alignItems: 'center', paddingTop: 24 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Atlas.amber, borderWidth: 3, borderColor: Atlas.ink },
  timelineLine: { flex: 1, width: 1, backgroundColor: Atlas.hairline2, marginTop: 4 },

  card: {
    flex: 1,
    backgroundColor: Atlas.ink2, padding: 14, borderRadius: Radii.r3,
    borderWidth: 1, borderColor: Atlas.hairline,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  cardLeft: { flex: 1, gap: 2 },
  cardLabel: { ...eyebrow, color: Atlas.paperMute, fontSize: 10 },
  cardTitle: { fontFamily: Fonts.serif, fontSize: 22, color: Atlas.paper, letterSpacing: -0.4 },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  controlMinus: {
    width: 32, height: 32, borderRadius: Radii.r1,
    backgroundColor: Atlas.ink3, borderWidth: 1, borderColor: Atlas.hairline2,
    alignItems: 'center', justifyContent: 'center',
  },
  controlMinusText: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700', color: Atlas.paperDim },
  daysDisplay: { minWidth: 50, alignItems: 'center' },
  daysNum: { fontFamily: Fonts.serif, fontSize: 20, color: Atlas.paper },
  daysUnit: { fontFamily: Fonts.sans, fontSize: 9, fontWeight: '700', color: Atlas.paperMute, letterSpacing: 1.2, marginTop: -2 },
  controlPlus: {
    width: 32, height: 32, borderRadius: Radii.r1,
    backgroundColor: Atlas.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  controlPlusText: { fontFamily: Fonts.sans, fontSize: 18, fontWeight: '700', color: Atlas.inkOnAmber },

  totalCard: {
    marginTop: 8, padding: 18, borderRadius: Radii.r3,
    backgroundColor: Atlas.amberSoft, borderWidth: 1, borderColor: Atlas.amberLine,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  totalNum: { fontFamily: Fonts.serif, fontSize: 22, color: Atlas.paper, letterSpacing: -0.4, marginTop: 4 },
  lockBtn: {
    height: 44, paddingHorizontal: 18, borderRadius: Radii.r2,
    backgroundColor: Atlas.amber, alignItems: 'center', justifyContent: 'center',
  },
  lockBtnText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700', color: Atlas.inkOnAmber },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 80 },
  emptyTitle: { ...display(24), letterSpacing: -0.5 },
  emptySubtitle: { fontFamily: Fonts.sans, color: Atlas.paperMute, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
});
