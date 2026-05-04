import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  runOnJS 
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface SwipeCardProps {
  location: any;
  onVote: (liked: boolean) => void;
  isTop: boolean;
}

export const SwipeCard = ({ location, onVote, isTop }: SwipeCardProps) => {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 100) {
        const liked = event.translationX > 0;
        translateX.value = withSpring(liked ? 500 : -500);
        runOnJS(onVote)(liked);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${interpolate(translateX.value, [-200, 0, 200], [-10, 0, 10])}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: location.image }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(10, 10, 10, 0.95)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.tags}>
              {location.tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.name}>{location.name}</Text>
            <Text style={styles.desc} numberOfLines={2}>{location.description}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    height: 480,
    borderRadius: 24,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: 24,
    justifyContent: 'flex-end',
  },
  content: {
    gap: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  tagText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  desc: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
