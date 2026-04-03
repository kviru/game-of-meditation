import { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  BackHandler,
  Alert,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTimer } from '@/hooks/useTimer'
import { BreathingCircle } from '@/components/BreathingCircle'
import { TimerDisplay } from '@/components/TimerDisplay'
import { PresetSelector } from '@/components/PresetSelector'
import {
  useSessionStore,
  selectGoalReached,
  PRESETS,
} from '@/store/sessionStore'
import { SessionTypeSelector } from '@/components/SessionTypeSelector'
import { useT } from '@/hooks/useT'
import { theme } from '@/theme'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function formatTarget(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m} min`
}

export default function TimerScreen() {
  const insets = useSafeAreaInsets()
  const t      = useT()
  const { timerState, elapsedSeconds, start, pause, resume, end, isRunning, isPaused, isIdle } =
    useTimer()

  const activePreset       = useSessionStore((s) => s.activePreset)
  const setPreset          = useSessionStore((s) => s.setPreset)
  const activeSessionType  = useSessionStore((s) => s.activeSessionType)
  const setSessionType     = useSessionStore((s) => s.setSessionType)
  const goalReached        = useSessionStore(selectGoalReached)

  // Goal reached pulse animation
  const goalScale   = useSharedValue(1)
  const goalOpacity = useSharedValue(0)

  useEffect(() => {
    if (goalReached) {
      goalOpacity.value = withTiming(1, { duration: 400 })
      goalScale.value   = withRepeat(
        withSequence(
          withSpring(1.04, { damping: 8 }),
          withSpring(1.0,  { damping: 8 })
        ),
        3,
        false
      )
    }
  }, [goalReached])

  const goalStyle = useAnimatedStyle(() => ({
    opacity:   goalOpacity.value,
    transform: [{ scale: goalScale.value }],
  }))

  // Navigate to completion screen when session ends
  useEffect(() => {
    if (timerState === 'ended') {
      router.replace('/session-complete')
    }
  }, [timerState])

  // Intercept Android back button during an active session
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRunning || isPaused) {
        confirmEnd()
        return true
      }
      return false
    })
    return () => sub.remove()
  }, [isRunning, isPaused, elapsedSeconds])

  const confirmEnd = useCallback(() => {
    if (elapsedSeconds < 10) {
      router.back()
      return
    }
    Alert.alert(
      'End session?',
      `You've sat for ${formatDuration(elapsedSeconds)}. That's real.`,
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End session', onPress: end },
      ]
    )
  }, [elapsedSeconds, end])

  // Progress toward target
  const target    = activePreset.seconds
  const progress  = target ? Math.min(elapsedSeconds / target, 1) : null
  const remaining = target ? Math.max(target - elapsedSeconds, 0) : null

  const breathStateLabel =
    timerState === 'idle'    ? t.timerIdle :
    timerState === 'running' ? t.timerRunning :
    timerState === 'paused'  ? t.timerPaused : ''

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerActionPill}
          onPress={isIdle ? () => router.back() : confirmEnd}
          hitSlop={8}
        >
          <Text style={styles.headerActionText}>{isIdle ? t.back : t.end}</Text>
        </Pressable>
      </View>

      {/* Breathing visual with ambient rings */}
      <View style={styles.visualArea}>
        <View style={styles.glowRingOuter} pointerEvents="none" />
        <View style={styles.glowRingInner} pointerEvents="none" />
        <BreathingCircle isRunning={isRunning} isPaused={isPaused} size={240} />
        <Text style={styles.breathLabel}>{breathStateLabel}</Text>
      </View>

      {/* Timer + goal status */}
      <View style={styles.timerArea}>
        <TimerDisplay seconds={elapsedSeconds} />

        {/* Goal reached banner */}
        {goalReached && (
          <Animated.View style={[styles.goalBanner, goalStyle]}>
            <Text style={styles.goalBannerText}>{t.goalReached}</Text>
          </Animated.View>
        )}

        {/* Remaining time hint */}
        {!goalReached && target !== null && isRunning && remaining !== null && (
          <Text style={styles.targetHint}>
            {remaining > 0
              ? `${formatTarget(remaining)} ${t.remaining}`
              : `${formatTarget(target)} target`}
          </Text>
        )}

        {/* Progress bar */}
        {progress !== null && (isRunning || isPaused) && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>

      {/* Preset + session type selector (idle only) */}
      {isIdle && (
        <View style={styles.presetArea}>
          <PresetSelector selected={activePreset} onSelect={setPreset} />
          <SessionTypeSelector selected={activeSessionType} onSelect={setSessionType} />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {isIdle && (
          <Pressable style={styles.startButton} onPress={start}>
            <Text style={styles.startButtonText}>
              {activePreset.seconds ? `${t.begin} · ${activePreset.label}` : t.begin}
            </Text>
          </Pressable>
        )}

        {isRunning && (
          <Pressable style={styles.pauseButton} onPress={pause}>
            <Text style={styles.pauseButtonText}>{t.pause}</Text>
          </Pressable>
        )}

        {isPaused && (
          <View style={styles.pausedControls}>
            <Pressable style={styles.resumeButton} onPress={resume}>
              <Text style={styles.resumeButtonText}>{t.resume}</Text>
            </Pressable>
            <Pressable style={styles.endButton} onPress={end}>
              <Text style={styles.endButtonText}>{t.complete}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
  },

  // Header
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerActionPill: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerActionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Visual area with glow rings
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  glowRingOuter: {
    position: 'absolute',
    width: 316,
    height: 316,
    borderRadius: 158,
    borderWidth: 1,
    borderColor: theme.colors.primary + '18',
    backgroundColor: 'transparent',
  },
  glowRingInner: {
    position: 'absolute',
    width: 278,
    height: 278,
    borderRadius: 139,
    borderWidth: 1,
    borderColor: theme.colors.primary + '28',
    backgroundColor: 'transparent',
  },
  breathLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '500',
  },

  // Timer area
  timerArea: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  goalBanner: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.full,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  goalBannerText: {
    fontSize: 13,
    color: theme.colors.gold,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  targetHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },

  // Preset area
  presetArea: {
    paddingBottom: 16,
  },

  // Controls
  controls: {
    paddingBottom: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    elevation: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pauseButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '60',
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  pauseButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: '500',
  },
  pausedControls: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    shadowOpacity: 0.4,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  endButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  endButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: '500',
  },
})
