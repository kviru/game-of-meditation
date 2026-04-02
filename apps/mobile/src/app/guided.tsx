/**
 * Guided Meditation Player
 *
 * Plays audio-guided meditation sessions. Audio is streamed from Supabase
 * Storage (bucket: guided-meditations). Falls back gracefully if a network
 * error occurs. Registers as a meditation session on completion.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView,
} from 'react-native'
import { Audio, AVPlaybackStatus } from 'expo-av'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BreathingCircle } from '@/components/BreathingCircle'
import { theme } from '@/theme'

export interface GuidedSession {
  id: string
  title: string
  description: string
  teacher: string
  durationSeconds: number
  audioUrl: string
  tradition: string
  language: string
  coverEmoji: string
}

// Placeholder session — in production these come from Supabase
const SAMPLE_SESSIONS: GuidedSession[] = [
  {
    id: 'gs-001',
    title: 'Morning Stillness',
    description: 'A gentle 5-minute open-awareness session to start your day with clarity.',
    teacher: 'Game of Meditation',
    durationSeconds: 5 * 60,
    audioUrl: '', // populated from Supabase Storage
    tradition: 'Open Awareness',
    language: 'en',
    coverEmoji: '🌅',
  },
  {
    id: 'gs-002',
    title: 'Loving-Kindness (Metta)',
    description: 'Cultivate compassion for yourself and all beings in this 10-minute practice.',
    teacher: 'Game of Meditation',
    durationSeconds: 10 * 60,
    audioUrl: '',
    tradition: 'Metta',
    language: 'en',
    coverEmoji: '💚',
  },
  {
    id: 'gs-003',
    title: 'Breath Anchor',
    description: 'Use the breath as your anchor. A classic Vipassana entry point. 7 minutes.',
    teacher: 'Game of Meditation',
    durationSeconds: 7 * 60,
    audioUrl: '',
    tradition: 'Vipassana',
    language: 'en',
    coverEmoji: '👁️',
  },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function SessionCard({
  session,
  onSelect,
}: {
  session: GuidedSession
  onSelect: (s: GuidedSession) => void
}) {
  return (
    <Pressable style={styles.sessionCard} onPress={() => onSelect(session)}>
      <Text style={styles.sessionEmoji}>{session.coverEmoji}</Text>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={styles.sessionMeta}>
          {session.tradition} · {formatTime(session.durationSeconds)}
        </Text>
        <Text style={styles.sessionDesc} numberOfLines={2}>{session.description}</Text>
      </View>
    </Pressable>
  )
}

function PlayerView({
  session,
  onBack,
  onComplete,
}: {
  session: GuidedSession
  onBack: () => void
  onComplete: () => void
}) {
  const insets    = useSafeAreaInsets()
  const soundRef  = useRef<Audio.Sound | null>(null)

  const [status,   setStatus]   = useState<'loading' | 'playing' | 'paused' | 'done' | 'error'>('loading')
  const [position, setPosition] = useState(0)   // seconds
  const [duration, setDuration] = useState(session.durationSeconds)

  // Pulse animation
  const pulse = useSharedValue(1)
  useEffect(() => {
    if (status === 'playing') {
      pulse.value = withRepeat(
        withSequence(withTiming(1.04, { duration: 2000 }), withTiming(1, { duration: 2000 })),
        -1, true
      )
    } else {
      pulse.value = withTiming(1, { duration: 300 })
    }
  }, [status])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))

  // Audio setup
  useEffect(() => {
    let mounted = true

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    })

    const setup = async () => {
      // If no URL (placeholder), simulate with a timer
      if (!session.audioUrl) {
        setStatus('playing')
        return
      }

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: session.audioUrl },
          { shouldPlay: true },
          (s: AVPlaybackStatus) => {
            if (!mounted) return
            if (s.isLoaded) {
              setPosition((s.positionMillis ?? 0) / 1000)
              setDuration((s.durationMillis ?? session.durationSeconds * 1000) / 1000)
              if (s.didJustFinish) {
                setStatus('done')
                onComplete()
              } else if (s.isPlaying) {
                setStatus('playing')
              } else {
                setStatus('paused')
              }
            }
          }
        )
        soundRef.current = sound
        setStatus('playing')
      } catch {
        if (mounted) setStatus('error')
      }
    }

    setup()

    return () => {
      mounted = false
      soundRef.current?.unloadAsync()
    }
  }, [session.audioUrl])

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return
    if (status === 'playing') {
      await soundRef.current.pauseAsync()
      setStatus('paused')
    } else {
      await soundRef.current.playAsync()
      setStatus('playing')
    }
  }, [status])

  const progress = duration > 0 ? position / duration : 0

  return (
    <View style={[styles.playerContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.playerHeader}>
        <Pressable onPress={onBack} hitSlop={16}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      <View style={styles.playerHero}>
        <Animated.View style={pulseStyle}>
          <BreathingCircle isRunning={status === 'playing'} isPaused={status === 'paused'} size={220} />
        </Animated.View>
        <Text style={styles.playerEmoji}>{session.coverEmoji}</Text>
      </View>

      <View style={styles.playerMeta}>
        <Text style={styles.playerTitle}>{session.title}</Text>
        <Text style={styles.playerTeacher}>{session.teacher}</Text>
        <Text style={styles.playerTradition}>{session.tradition}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {status === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
        {status === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Could not load audio. Check your connection.</Text>
          </View>
        )}
        {(status === 'playing' || status === 'paused') && session.audioUrl && (
          <Pressable style={styles.playPauseButton} onPress={togglePlay}>
            <Text style={styles.playPauseIcon}>{status === 'playing' ? '⏸' : '▶'}</Text>
          </Pressable>
        )}
        {status === 'done' && (
          <Pressable style={styles.doneButton} onPress={onComplete}>
            <Text style={styles.doneButtonText}>Session complete 🌱</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export default function GuidedScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ sessionId?: string }>()

  // If a specific session ID is passed, auto-open it
  const preselected = params.sessionId
    ? SAMPLE_SESSIONS.find((s) => s.id === params.sessionId) ?? null
    : null

  const [selected, setSelected] = useState<GuidedSession | null>(preselected)

  const handleComplete = useCallback(() => {
    router.replace('/session-complete')
  }, [])

  if (selected) {
    return (
      <PlayerView
        session={selected}
        onBack={() => setSelected(null)}
        onComplete={handleComplete}
      />
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Guided Sessions</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listHint}>
          Choose a guided session. A teacher will lead you through every breath.
        </Text>

        {SAMPLE_SESSIONS.map((s) => (
          <SessionCard key={s.id} session={s} onSelect={setSelected} />
        ))}

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            More guided sessions from teachers worldwide — coming soon.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    width: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  list: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 4,
  },
  listHint: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  sessionEmoji: {
    fontSize: 40,
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sessionMeta: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  sessionDesc: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  comingSoon: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Player
  playerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  playerHeader: {
    height: 56,
    justifyContent: 'center',
  },
  playerHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerEmoji: {
    fontSize: 48,
    position: 'absolute',
    bottom: '30%',
  },
  playerMeta: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  playerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  playerTeacher: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  playerTradition: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  progressSection: {
    gap: 8,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  controls: {
    paddingBottom: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseIcon: {
    fontSize: 28,
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#2d1010',
    borderRadius: theme.radii.md,
    padding: 16,
  },
  errorText: {
    color: '#ff6666',
    fontSize: 14,
    textAlign: 'center',
  },
})
