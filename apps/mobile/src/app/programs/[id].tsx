import { useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Alert, Animated,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PROGRAMS, useProgramStore, type ActiveProgramSession } from '@/store/programStore'
import { useSessionStore, PRESETS, SESSION_TYPES } from '@/store/sessionStore'
import { theme } from '@/theme'

const COLS = 7   // days per row in the grid

export default function ProgramDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>()
  const insets   = useSafeAreaInsets()
  const program  = PROGRAMS.find((p) => p.id === id)

  const isEnrolled       = useProgramStore((s) => s.isEnrolled)
  const enroll           = useProgramStore((s) => s.enroll)
  const unenroll         = useProgramStore((s) => s.unenroll)
  const getEnrollment    = useProgramStore((s) => s.getEnrollment)
  const getDaysCompleted = useProgramStore((s) => s.getDaysCompleted)
  const isDayCompleted   = useProgramStore((s) => s.isDayCompleted)
  const nextDay          = useProgramStore((s) => s.nextDay)

  const setPreset               = useSessionStore((s) => s.setPreset)
  const setSessionType          = useSessionStore((s) => s.setSessionType)
  const setActiveProgramSession = useProgramStore((s) => s.setActiveProgramSession)

  // Pulse animation for the "Today" button
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  if (!program) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.errorText}>Program not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      </View>
    )
  }

  const enrolled     = isEnrolled(program.id)
  const enrollment   = getEnrollment(program.id)
  const daysComplete = getDaysCompleted(program.id)
  const todayDay     = nextDay(program.id, program.durationDays)
  const isComplete   = enrolled && todayDay === null
  const progress     = daysComplete / program.durationDays

  // Map tradition key → session type preset + minutes preset
  const sessionTypeKey = SESSION_TYPES.find((t) => t.key === program.tradition)?.key ?? 'open'
  const minutesPreset  = PRESETS.find((p) => p.seconds === program.dailyMinutes * 60)
    ?? { label: `${program.dailyMinutes} min`, seconds: program.dailyMinutes * 60 }

  function handleStartSession() {
    if (!enrolled || !todayDay) return
    // Pre-configure the timer for this program's requirements
    setPreset(minutesPreset)
    setSessionType(sessionTypeKey)
    // Mark this as an active program session so session-complete can credit it
    setActiveProgramSession({ programId: program.id, dayNumber: todayDay })
    router.push('/timer')
  }

  function handleEnroll() {
    enroll(program.id)
  }

  function handleUnenroll() {
    Alert.alert(
      'Leave Program',
      'Your progress will be lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => { unenroll(program.id); router.back() } },
      ]
    )
  }

  // Build day grid
  const days = Array.from({ length: program.durationDays }, (_, i) => i + 1)
  const rows: number[][] = []
  for (let i = 0; i < days.length; i += COLS) {
    rows.push(days.slice(i, i + COLS))
  }

  const traditionEmoji = SESSION_TYPES.find((t) => t.key === program.tradition)?.emoji ?? '🧘'

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back nav */}
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.back}>← Programs</Text>
      </Pressable>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{program.coverEmoji}</Text>
        <Text style={styles.heroTitle}>{program.title}</Text>
        <View style={styles.heroMeta}>
          <Text style={styles.metaChip}>📅 {program.durationDays} days</Text>
          <Text style={styles.metaChip}>⏱ {program.dailyMinutes} min/day</Text>
          <Text style={styles.metaChip}>{traditionEmoji} {program.tradition}</Text>
        </View>
        <Text style={styles.heroDesc}>{program.description}</Text>
      </View>

      {/* Progress card — shown when enrolled */}
      {enrolled && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressCount}>
              {daysComplete}/{program.durationDays}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          {isComplete ? (
            <Text style={styles.completedBanner}>
              🎉 Program Complete! Outstanding work.
            </Text>
          ) : (
            <Text style={styles.progressSub}>
              Day {todayDay} of {program.durationDays} — keep your streak alive!
            </Text>
          )}
        </View>
      )}

      {/* Today's session button */}
      {enrolled && !isComplete && (
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable style={styles.todayButton} onPress={handleStartSession}>
            <Text style={styles.todayButtonLabel}>Day {todayDay}</Text>
            <Text style={styles.todayButtonTitle}>Start Today's Session</Text>
            <Text style={styles.todayButtonSub}>
              {program.dailyMinutes} min · {program.tradition}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* 21-day grid */}
      {enrolled && (
        <View style={styles.gridSection}>
          <Text style={styles.gridTitle}>Day Grid</Text>
          <View style={styles.grid}>
            {rows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.gridRow}>
                {row.map((day) => {
                  const done    = isDayCompleted(program.id, day)
                  const isToday = day === todayDay
                  return (
                    <View
                      key={day}
                      style={[
                        styles.dayCell,
                        done    && styles.dayCellDone,
                        isToday && styles.dayCellToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayCellText,
                          done    && styles.dayCellTextDone,
                          isToday && styles.dayCellTextToday,
                        ]}
                      >
                        {done ? '✓' : day}
                      </Text>
                    </View>
                  )
                })}
                {/* Pad last row so grid is uniform */}
                {row.length < COLS &&
                  Array.from({ length: COLS - row.length }).map((_, i) => (
                    <View key={`pad-${i}`} style={styles.dayCell} />
                  ))}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Enroll / unenroll */}
      {!enrolled ? (
        <Pressable style={styles.enrollButton} onPress={handleEnroll}>
          <Text style={styles.enrollButtonText}>Start This Program</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.unenrollButton} onPress={handleUnenroll}>
          <Text style={styles.unenrollButtonText}>Leave Program</Text>
        </Pressable>
      )}

      {/* What to expect section */}
      <View style={styles.expectSection}>
        <Text style={styles.expectTitle}>What to expect</Text>
        <View style={styles.expectList}>
          <ExpectItem
            icon="🌅"
            text={`Sit for ${program.dailyMinutes} minutes every day — ideally the same time each morning.`}
          />
          <ExpectItem
            icon="📲"
            text="After each session, return here and mark the day complete. Your streak depends on it."
          />
          <ExpectItem
            icon="🔄"
            text="Missed a day? Don't quit. Skip it, mark it, and show up tomorrow."
          />
          <ExpectItem
            icon="🏆"
            text="Complete all 21 days and earn the Program completion badge on your profile."
          />
        </View>
      </View>
    </ScrollView>
  )
}

function ExpectItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.expectItem}>
      <Text style={styles.expectIcon}>{icon}</Text>
      <Text style={styles.expectText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: 20,
    gap: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    gap: 16,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  back: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  // Hero
  hero: {
    gap: 10,
    alignItems: 'flex-start',
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 34,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    fontSize: 13,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroDesc: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 23,
  },
  // Progress card
  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  progressCount: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  completedBanner: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  // Today button
  todayButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 4,
  },
  todayButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  todayButtonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  todayButtonSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  // Day grid
  gridSection: {
    gap: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  grid: {
    gap: 6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellDone: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayCellToday: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  dayCellText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  dayCellTextDone: {
    color: '#fff',
    fontWeight: '700',
  },
  dayCellTextToday: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  // Enroll / Unenroll
  enrollButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  enrollButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  unenrollButton: {
    borderRadius: theme.radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unenrollButtonText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  // What to expect
  expectSection: {
    gap: 12,
    paddingBottom: 8,
  },
  expectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  expectList: {
    gap: 12,
  },
  expectItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  expectIcon: {
    fontSize: 18,
    lineHeight: 24,
  },
  expectText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
})
