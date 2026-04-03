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
import { useProgramStore } from '@/store/programStore'
import { useT } from '@/hooks/useT'
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

function sessionEmojiAndGlow(seconds: number): { emoji: string; glow: string } {
  if (seconds < 60)   return { emoji: '🌱', glow: theme.colors.primary }
  if (seconds < 600)  return { emoji: '🌿', glow: theme.colors.primary }
  if (seconds < 1800) return { emoji: '🌳', glow: theme.colors.sky }
  return { emoji: '🏔️', glow: theme.colors.lotus }
}

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets()
  const lastSession = useSessionStore(selectLastSession)
  const totalMinutes = useSessionStore(selectTotalMinutes)
  const sessionCount = useSessionStore(selectSessionCount)
  const resetTimer            = useSessionStore((s) => s.resetTimer)
  const activeProgramSession  = useProgramStore((s) => s.activeProgramSession)
  const completeDay           = useProgramStore((s) => s.completeDay)
  const setActiveProgramSession = useProgramStore((s) => s.setActiveProgramSession)
  const t                     = useT()

  const completedProgramId = activeProgramSession?.programId ?? null

  const cardScale = useSharedValue(0.88)
  const cardOpacity = useSharedValue(0)
  const statsOpacity = useSharedValue(0)

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 100 })
    cardOpacity.value = withTiming(1, { duration: 500 })
    statsOpacity.value = withDelay(400, withTiming(1, { duration: 600 }))

    if (activeProgramSession && lastSession) {
      completeDay(
        activeProgramSession.programId,
        activeProgramSession.dayNumber,
        lastSession.id,
        lastSession.durationSeconds,
      )
      setActiveProgramSession(null)
    }
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

  const { emoji, glow } = sessionEmojiAndGlow(lastSession.durationSeconds)

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Main card */}
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Top accent bar */}
        <View style={[styles.cardAccent, { backgroundColor: glow }]} />

        {/* Emoji with radiant backdrop */}
        <View style={styles.emojiContainer}>
          <View style={[styles.emojiGlow, { backgroundColor: glow }]} />
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.duration}>{formatDuration(lastSession.durationSeconds)}</Text>
        <Text style={styles.message}>{randomMessage()}</Text>

        <View style={[styles.mssBadge, { borderColor: theme.colors.gold + '80' }]}>
          <Text style={styles.mssLabel}>{t.mindStability}</Text>
          <Text style={styles.mssValue}>+{lastSession.mssDelta}</Text>
        </View>
      </Animated.View>

      {/* Running totals */}
      <Animated.View style={[styles.stats, statsStyle]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{sessionCount}</Text>
          <Text style={styles.statLabel}>{t.sessions}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.sky }]}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>{t.minutes}</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        {completedProgramId && (
          <Pressable
            style={styles.programButton}
            onPress={() => {
              resetTimer()
              router.replace(`/programs/${completedProgramId}`)
            }}
          >
            <Text style={styles.programButtonText}>📅  View Program Progress</Text>
          </Pressable>
        )}
        <Pressable
          style={styles.feedbackButton}
          onPress={() => router.push({ pathname: '/feedback', params: { sessionId: lastSession.id } })}
        >
          <Text style={styles.feedbackButtonText}>🌿  Share your experience</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handlePlayAgain}>
          <Text style={styles.primaryButtonText}>{t.meditateAgain}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleHome}>
          <Text style={styles.secondaryButtonText}>{t.returnHome}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 32,
  },

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: 36,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    opacity: 0.9,
  },

  // Emoji with radiant glow
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
    height: 96,
  },
  emojiGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.12,
  },
  emoji: {
    fontSize: 52,
  },

  duration: {
    fontSize: 34,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 25,
    fontStyle: 'italic',
  },

  // MSS badge
  mssBadge: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radii.full,
    borderWidth: 1,
  },
  mssLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  mssValue: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.gold,
  },

  // Running totals
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: theme.colors.border,
  },

  // Action buttons
  actions: {
    gap: 10,
  },
  programButton: {
    paddingVertical: 15,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.primary + '60',
  },
  programButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  feedbackButton: {
    paddingVertical: 15,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '50',
  },
  feedbackButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 16,
    shadowOpacity: 0.45,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
})
