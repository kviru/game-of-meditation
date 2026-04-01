import { useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  useSessionStore,
  selectLastSession,
  selectTotalMinutes,
  selectSessionCount,
} from '@/store/sessionStore'
import { theme } from '@/theme'

const MESSAGES = [
  'Every second was real.',
  'You showed up. That\'s everything.',
  'Stillness is always here. So are you.',
  'One breath at a time. You did it.',
  'The practice grows quietly. Like a forest.',
  'You cannot lose what you\'ve given yourself.',
]

function randomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (s === 0) return `${m} minute${m === 1 ? '' : 's'}`
  return `${m}m ${s}s`
}

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets()
  const lastSession = useSessionStore(selectLastSession)
  const totalMinutes = useSessionStore(selectTotalMinutes)
  const sessionCount = useSessionStore(selectSessionCount)
  const resetTimer = useSessionStore((s) => s.resetTimer)

  const cardScale = useSharedValue(0.88)
  const cardOpacity = useSharedValue(0)
  const statsOpacity = useSharedValue(0)

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 100 })
    cardOpacity.value = withTiming(1, { duration: 500 })
    statsOpacity.value = withDelay(400, withTiming(1, { duration: 600 }))
  }, [])

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }))

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }))

  const handlePlayAgain = () => {
    resetTimer()
    router.replace('/timer')
  }

  const handleHome = () => {
    resetTimer()
    router.replace('/')
  }

  if (!lastSession) {
    router.replace('/')
    return null
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Main card */}
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.emoji}>
          {lastSession.durationSeconds < 60 ? '🌱' :
           lastSession.durationSeconds < 600 ? '🌿' :
           lastSession.durationSeconds < 1800 ? '🌳' : '🏔️'}
        </Text>
        <Text style={styles.duration}>{formatDuration(lastSession.durationSeconds)}</Text>
        <Text style={styles.message}>{randomMessage()}</Text>

        <View style={styles.mssBadge}>
          <Text style={styles.mssLabel}>Mind Stability</Text>
          <Text style={styles.mssValue}>+{lastSession.mssDelta}</Text>
        </View>
      </Animated.View>

      {/* Running totals */}
      <Animated.View style={[styles.stats, statsStyle]}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{sessionCount}</Text>
          <Text style={styles.statLabel}>{sessionCount === 1 ? 'Session' : 'Sessions'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>{totalMinutes === 1 ? 'Minute' : 'Minutes'}</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handlePlayAgain}>
          <Text style={styles.primaryButtonText}>Meditate again</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleHome}>
          <Text style={styles.secondaryButtonText}>Return home</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 40,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: 40,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emoji: {
    fontSize: 52,
  },
  duration: {
    fontSize: 36,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  message: {
    fontSize: 17,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  mssBadge: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radii.full,
  },
  mssLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  mssValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gold,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 17,
  },
})
