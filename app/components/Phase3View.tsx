import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronUp, ChevronDown, Clock, Sparkles } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/tripService';
import { DashboardSkeleton } from './Skeleton';
import { supabase } from '../lib/supabase';

export const Phase3View = ({ tripId }: { tripId: string }) => {
  const queryClient = useQueryClient();

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations', tripId],
    queryFn: () => tripService.getDestinations(tripId),
  });

  const updateDurationMutation = useMutation({
    mutationFn: async ({ id, duration }: { id: string, duration: number }) => {
      const { error } = await supabase
        .from('destinations')
        .update({ duration_days: duration })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations', tripId] });
    }
  });

  const handleUpdateDuration = (id: string, current: number, delta: number) => {
    const next = Math.max(1, current + delta);
    updateDurationMutation.mutate({ id, duration: next });
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.item}>
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Sequence {index + 1}</Text>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.meta}>
            <Clock size={12} color="#818cf8" />
            <Text style={styles.metaText}>{item.duration_days || 1} Days Planned</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            onPress={() => handleUpdateDuration(item.id, item.duration_days || 1, -1)}
            style={styles.control}
          >
            <ChevronDown color="#94a3b8" size={18} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleUpdateDuration(item.id, item.duration_days || 1, 1)}
            style={styles.controlPrimary}
          >
            <LinearGradient
              colors={['#818cf8', '#60a5fa']}
              style={styles.controlInner}
            >
              <ChevronUp color="#ffffff" size={18} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) return <DashboardSkeleton />;

  return (
    <View style={styles.container}>
      {destinations.length > 0 ? (
        <FlashList
          data={destinations}
          renderItem={renderItem}
          estimatedItemSize={120}
          ListHeaderComponent={<View style={styles.listSpacer} />}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.totalText}>
                Trip Span: <Text style={styles.totalValue}>{destinations.reduce((s, d) => s + (d.duration_days || 1), 0)} Days</Text>
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.empty}>
           <Sparkles size={40} color="#1e293b" />
           <Text style={styles.emptyTitle}>No Destinations Yet</Text>
           <Text style={styles.emptySubtitle}>Go back to Discovery to pick some spots.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
  },
  item: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    gap: 4,
    flex: 1,
  },
  cardLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  control: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  controlPrimary: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controlInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listSpacer: {
    height: 8,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  totalText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    color: '#ffffff',
    fontWeight: '900',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 100,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  emptySubtitle: {
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
