import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate, 
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Atlas, Fonts, Radii } from '../constants/atlas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

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
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD || Math.abs(event.velocityX) > 500) {
        const liked = event.translationX > 0;
        
        // Trigger vote immediately for better responsiveness
        runOnJS(onVote)(liked);
        
        // Parallel animation
        translateX.value = withTiming(liked ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100, {
          duration: 200,
        });
      } else {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      translateX.value,
      [-100, 0, 100],
      [Atlas.red, Atlas.hairline, Atlas.green]
    );

    const rotate = `${interpolate(translateX.value, [-200, 0, 200], [-15, 0, 15])}deg`;
    const opacity = interpolate(Math.abs(translateX.value), [0, SCREEN_WIDTH / 2], [1, 0.8]);

    return {
      borderColor,
      borderWidth: interpolate(Math.abs(translateX.value), [0, 50], [1, 3]),
      opacity,
      transform: [
        { translateX: translateX.value },
        { rotate },
        { scale: interpolate(Math.abs(translateX.value), [0, 100], [1, 1.02]) },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: location.image }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(14,12,10,0.95)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.tags}>
              {(location.tags || []).map((tag: string) => (
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
    borderRadius: Radii.r4,
    backgroundColor: Atlas.ink,
    borderWidth: 1,
    borderColor: Atlas.hairline,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  image: { width: '100%', height: '100%' },
  gradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    padding: 22, justifyContent: 'flex-end',
  },
  content: { gap: 10 },
  tags: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: 'rgba(245,239,230,0.08)',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1, borderColor: 'rgba(245,239,230,0.16)',
  },
  tagText: {
    fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700',
    color: Atlas.paperDim, letterSpacing: 0.8, textTransform: 'uppercase',
  },
  name: { fontFamily: Fonts.serif, fontSize: 32, color: Atlas.paper, letterSpacing: -0.8, lineHeight: 34 },
  desc: { fontFamily: Fonts.sans, fontSize: 14, color: Atlas.paperDim, lineHeight: 20 },
});
