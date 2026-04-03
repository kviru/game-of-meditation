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
        const isCompleted  = enrolled && daysComplete >= program.durationDays
        const accentColor  = DIFFICULTY_COLOR[program.difficulty]

        return (
          <Pressable
            key={program.id}
            style={styles.card}
            onPress={() => router.push(`/programs/${program.id}`)}
          >
            {/* Left difficulty accent bar */}
            <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

            {/* Card top row */}
            <View style={styles.cardTop}>
              <View style={styles.cardEmojiWrap}>
                <Text style={styles.cardEmoji}>{program.coverEmoji}</Text>
              </View>
              <View style={styles.cardBadges}>
                <View style={[styles.badge, { borderColor: accentColor, backgroundColor: accentColor + '18' }]}>
                  <Text style={[styles.badgeText, { color: accentColor }]}>
                    {DIFFICULTY_LABEL[program.difficulty]}
                  </Text>
                </View>
                {enrolled && !isCompleted && (
                  <View style={styles.enrolledBadge}>
                    <Text style={styles.enrolledBadgeText}>● Enrolled</Text>
                  </View>
                )}
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Done</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Title + meta */}
            <Text style={styles.cardTitle}>{program.title}</Text>
            <View style={styles.cardMeta}>
              <View style={styles.metaPill}>
                <Text style={styles.metaItem}>📅 {program.durationDays} days</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaItem}>⏱ {program.dailyMinutes} min/day</Text>
              </View>
            </View>

            <Text style={styles.cardDesc} numberOfLines={3}>
              {program.description}
            </Text>

            {/* Progress bar (only when enrolled) */}
            {enrolled && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%`, backgroundColor: isCompleted ? theme.colors.gold : theme.colors.primary },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {daysComplete}/{program.durationDays} days complete
                </Text>
              </View>
            )}

            {/* CTA button */}
            <View style={[styles.ctaButton, enrolled ? styles.ctaButtonEnrolled : styles.ctaButtonDefault]}>
              <Text style={[styles.ctaText, enrolled ? styles.ctaTextEnrolled : styles.ctaTextDefault]}>
                {isCompleted ? '✓  Completed' : enrolled ? 'Continue →' : 'View Program →'}
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

  // Header
  header: {
    gap: 8,
    marginBottom: 4,
  },
  back: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 6,
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

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    paddingLeft: 24,
    gap: 10,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    borderTopLeftRadius: theme.radii.lg,
    borderBottomLeftRadius: theme.radii.lg,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  enrolledBadge: {
    backgroundColor: theme.colors.primary + '22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary + '50',
  },
  enrolledBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: 0.3,
  },
  completedBadge: {
    backgroundColor: theme.colors.gold + '22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.gold + '60',
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.gold,
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 25,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaItem: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
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
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  // CTA button
  ctaButton: {
    marginTop: 2,
    borderRadius: theme.radii.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  ctaButtonDefault: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary + '50',
  },
  ctaButtonEnrolled: {
    backgroundColor: theme.colors.primary + '18',
    borderColor: theme.colors.primary + '70',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaTextDefault: {
    color: theme.colors.primary,
  },
  ctaTextEnrolled: {
    color: theme.colors.primary,
  },

  // Coming soon
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  comingSoonText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
})
