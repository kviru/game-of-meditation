import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { router, Redirect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useT } from '@/hooks/useT'
import {
  useSessionStore,
  selectTotalMinutes,
  selectSessionCount,
  selectCurrentStreak,
} from '@/store/sessionStore'
import { BuddhaLevelCard } from '@/components/BuddhaLevelCard'
import { theme } from '@/theme'

export default function HomeScreen() {
  const insets             = useSafeAreaInsets()
  const onboardingComplete = useOnboardingStore((s) => s.completed)
  const t                  = useT()

  if (!onboardingComplete) return <Redirect href="/onboarding" />
  const totalMinutes = useSessionStore(selectTotalMinutes)
  const sessionCount = useSessionStore(selectSessionCount)
  const streak       = useSessionStore(selectCurrentStreak)
  const totalMss     = useSessionStore((s) =>
    s.completedSessions.reduce((acc, s) => acc + s.mssDelta, 0)
  )
  const hasHistory   = sessionCount > 0

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.title}>{t.appTitle}</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      {/* Buddha Level card — shown once player has history */}
      {hasHistory && (
        <BuddhaLevelCard totalMinutes={totalMinutes} mss={totalMss} />
      )}

      {/* Streak + session quick stats */}
      {hasHistory && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>{t.dayStreak} 🔥</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{sessionCount}</Text>
            <Text style={styles.statLabel}>{t.sessions}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>{t.minutes}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/timer')}
        >
          <Text style={styles.primaryButtonText}>
            {hasHistory ? t.ctaMeditate : t.ctaFirst}
          </Text>
        </Pressable>

        {hasHistory && (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.secondaryButtonText}>{t.yourJourney}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: 24,
    gap: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    gap: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 56,
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    lineHeight: 28,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
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
