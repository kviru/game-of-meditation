import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PROGRAMS, useProgramStore } from '@/store/programStore'
import { theme } from '@/theme'

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     '#3da63d',
  intermediate: '#c8a000',
  advanced:     '#c84040',
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
}

export default function ProgramsScreen() {
  const insets       = useSafeAreaInsets()
  const isEnrolled   = useProgramStore((s) => s.isEnrolled)
  const getDaysCompleted = useProgramStore((s) => s.getDaysCompleted)

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>21-Day Programs</Text>
        <Text style={styles.subtitle}>
          Choose a structured path. Show up every day. Watch yourself change.
        </Text>
      </View>

      {/* Program cards */}
      {PROGRAMS.map((program) => {
        const enrolled     = isEnrolled(program.id)
        const daysComplete = getDaysCompleted(program.id)
        const progress     = daysComplete / program.durationDays

        return (
          <Pressable
            key={program.id}
            style={styles.card}
            onPress={() => router.push(`/programs/${program.id}`)}
          >
            {/* Card top row */}
            <View style={styles.cardTop}>
              <Text style={styles.cardEmoji}>{program.coverEmoji}</Text>
              <View style={styles.cardBadges}>
                <View style={[styles.badge, { borderColor: DIFFICULTY_COLOR[program.difficulty] }]}>
                  <Text style={[styles.badgeText, { color: DIFFICULTY_COLOR[program.difficulty] }]}>
                    {DIFFICULTY_LABEL[program.difficulty]}
                  </Text>
                </View>
                {enrolled && (
                  <View style={styles.enrolledBadge}>
                    <Text style={styles.enrolledBadgeText}>Enrolled</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Title + meta */}
            <Text style={styles.cardTitle}>{program.title}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaItem}>📅 {program.durationDays} days</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaItem}>⏱ {program.dailyMinutes} min/day</Text>
            </View>

            <Text style={styles.cardDesc} numberOfLines={3}>
              {program.description}
            </Text>

            {/* Progress bar (only when enrolled) */}
            {enrolled && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {daysComplete}/{program.durationDays} days complete
                </Text>
              </View>
            )}

            {/* CTA */}
            <View style={styles.cardFooter}>
              <Text style={styles.cardCta}>
                {enrolled
                  ? daysComplete >= program.durationDays
                    ? '✓ Completed'
                    : 'Continue →'
                  : 'View Program →'}
              </Text>
            </View>
          </Pressable>
        )
      })}

      {/* Coming soon */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>
          More programs from teachers coming in Phase 2.
        </Text>
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
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  back: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  enrolledBadge: {
    backgroundColor: theme.colors.primary + '33',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  enrolledBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 26,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  metaDot: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  cardDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
  progressSection: {
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  cardFooter: {
    paddingTop: 4,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  comingSoonText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
})
