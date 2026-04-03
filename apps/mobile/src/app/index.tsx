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
  const totalMinutes       = useSessionStore(selectTotalMinutes)
  const sessionCount       = useSessionStore(selectSessionCount)
  const streak             = useSessionStore(selectCurrentStreak)
  const totalMss           = useSessionStore((s) =>
    s.completedSessions.reduce((acc, s) => acc + s.mssDelta, 0)
  )
  const hasHistory         = sessionCount > 0

  if (!onboardingComplete) return <Redirect href="/onboarding" />

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        {/* Atmospheric ambient glow */}
        <View style={styles.ambientGlow} pointerEvents="none" />

        <View style={styles.heroTop}>
          <Text style={styles.title}>{t.appTitle}</Text>
          <View style={styles.heroActions}>
            <Pressable style={styles.iconButton} onPress={() => router.push('/profile')} hitSlop={8}>
              <Text style={styles.iconButtonText}>👤</Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => router.push('/settings')} hitSlop={8}>
              <Text style={styles.iconButtonText}>⚙️</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      {/* Buddha Level card */}
      {hasHistory && (
        <BuddhaLevelCard totalMinutes={totalMinutes} mss={totalMss} />
      )}

      {/* Stats row */}
      {hasHistory && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.statValueStreak]}>{streak}</Text>
            <Text style={styles.statLabel}>{t.dayStreak} 🔥</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.statValueSessions]}>{sessionCount}</Text>
            <Text style={styles.statLabel}>{t.sessions}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.statValueMinutes]}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>{t.minutes}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {/* Primary CTA */}
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/timer')}
        >
          <Text style={styles.primaryButtonText}>
            {hasHistory ? t.ctaMeditate : t.ctaFirst}
          </Text>
          <Text style={styles.primaryButtonArrow}>→</Text>
        </Pressable>

        {/* Secondary actions grid */}
        {hasHistory ? (
          <View style={styles.actionGrid}>
            <Pressable
              style={[styles.secondaryButton, styles.actionGridItem]}
              onPress={() => router.push('/history')}
            >
              <Text style={styles.secondaryButtonIcon}>📊</Text>
              <Text style={styles.secondaryButtonText}>{t.yourJourney}</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, styles.actionGridItem]}
              onPress={() => router.push('/programs')}
            >
              <Text style={styles.secondaryButtonIcon}>📅</Text>
              <Text style={styles.secondaryButtonText}>Programs</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/programs')}>
            <Text style={styles.secondaryButtonIcon}>📅</Text>
            <Text style={styles.secondaryButtonText}>21-Day Programs</Text>
          </Pressable>
        )}

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/guided')}>
          <Text style={styles.secondaryButtonIcon}>🎧</Text>
          <Text style={styles.secondaryButtonText}>Guided Sessions</Text>
        </Pressable>
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
    gap: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Hero
  hero: {
    gap: 10,
  },
  ambientGlow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: theme.colors.primary,
    opacity: 0.05,
    top: -110,
    left: -80,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 52,
    flex: 1,
    paddingRight: 12,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 18,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statValueStreak: {
    color: theme.colors.gold,
  },
  statValueSessions: {
    color: theme.colors.primary,
  },
  statValueMinutes: {
    color: theme.colors.sky,
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

  // Actions
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    elevation: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    shadowOpacity: 0.45,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryButtonArrow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 18,
    fontWeight: '400',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionGridItem: {
    flex: 1,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonIcon: {
    fontSize: 18,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
})
