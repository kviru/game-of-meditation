import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated'
import { theme } from '@/theme'

interface BreathingCircleProps {
  isRunning: boolean
  isPaused: boolean
  size?: number
}

const INHALE_MS = 4000
const EXHALE_MS = 4000

/**
 * A gently pulsing circle that guides breath.
 * Expands on inhale, contracts on exhale.
 * Stills completely when paused or idle.
 */
export function BreathingCircle({
  isRunning,
  isPaused,
  size = 220,
}: BreathingCircleProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.35)

  useEffect(() => {
    if (isRunning && !isPaused) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.28, { duration: INHALE_MS, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: EXHALE_MS, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.65, { duration: INHALE_MS, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: EXHALE_MS, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    } else {
      cancelAnimation(scale)
      cancelAnimation(opacity)
      scale.value = withTiming(1, { duration: 800 })
      opacity.value = withTiming(0.35, { duration: 800 })
    }
  }, [isRunning, isPaused])

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 0.72 }],
    opacity: opacity.value + 0.2,
  }))

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outermost glow ring */}
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2 },
          outerStyle,
        ]}
      />
      {/* Core circle */}
      <Animated.View
        style={[
          styles.core,
          { width: size * 0.58, height: size * 0.58, borderRadius: (size * 0.58) / 2 },
          innerStyle,
        ]}
      />
      {/* Fixed center dot — always visible, your anchor */}
      <View style={styles.centerDot} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
  },
  core: {
    position: 'absolute',
    backgroundColor: theme.colors.primaryLight,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    opacity: 0.9,
  },
})
