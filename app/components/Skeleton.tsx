import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const Skeleton = ({ width, height, borderRadius = 8, style = {} }: { width: any, height: any, borderRadius?: number, style?: any }) => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          opacity,
          backgroundColor: '#2A2520', // border-slate-800 color for consistency
        },
        style
      ]}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Hero Skeleton */}
      <Skeleton width="100%" height={320} borderRadius={0} style={{ marginHorizontal: -24, marginTop: -32 }} />
      
      <View style={{ marginTop: 24 }}>
        <Skeleton width={120} height={16} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={100} borderRadius={20} style={{ marginBottom: 32 }} />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Skeleton width={100} height={16} />
          <Skeleton width={40} height={16} />
        </View>
        <Skeleton width="100%" height={8} borderRadius={4} style={{ marginBottom: 24 }} />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={{ alignItems: 'center', gap: 8 }}>
              <Skeleton width={12} height={12} borderRadius={6} />
              <Skeleton width={50} height={10} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const Phase3Skeleton = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={200} height={32} style={{ marginBottom: 12 }} />
      <Skeleton width={250} height={20} style={{ marginBottom: 40 }} />
      
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.row}>
          <View style={styles.indicatorCol}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={styles.connector} />
          </View>
          <Skeleton width="80%" height={100} borderRadius={20} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  indicatorCol: {
    alignItems: 'center',
    marginRight: 16,
  },
  connector: {
    width: 2,
    height: 48,
    backgroundColor: '#2A2520',
    marginTop: 8,
  },
});
