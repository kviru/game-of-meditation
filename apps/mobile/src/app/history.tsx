import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSessionStore, selectCurrentStreak, selectTotalMinutes } from '@/store/sessionStore'
import type { CompletedSession } from '@/store/sessionStore'
import { useT } from '@/hooks/useT'
import type { Strings } from '@/lib/translations'
import { MeditationHeatmap } from '@/components/MeditationHeatmap'
import { SESSION_TYPES } from '@/store/sessionStore'
import { theme } from '@/theme'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function relativeDate(iso: string, t: Strings): string {
  const d     = new Date(iso)
  const today = new Date()
  const diff  = Math.floor((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return t.today
  if (diff === 1) return t.yesterday
  if (diff < 7)  return t.daysAgo.replace('{n}', String(diff))
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function sessionEmoji(seconds: number): string {
  if (seconds < 60)   return '🌱'
  if (seconds < 600)  return '🌿'
  if (seconds < 1800) return '🌳'
  return '🏔️'
}

// Group sessions by relative date heading
function groupSessions(sessions: CompletedSession[], t: Strings) {
  const groups: { heading: string; data: CompletedSession[] }[] = []
  let lastHeading = ''
  for (const s of sessions) {
    const heading = relativeDate(s.completedAt, t)
    if (heading !== lastHeading) {
      groups.push({ heading, data: [s] })
      lastHeading = heading
    } else {
      groups[groups.length - 1].data.push(s)
    }
  }
  return groups
}

function SessionRow({ session }: { session: CompletedSession }) {
  const time = new Date(session.completedAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <View style={styles.row}>
      <Text style={styles.rowEmoji}>
        {SESSION_TYPES.find(t => t.key === session.sessionType)?.emoji ?? sessionEmoji(session.durationSeconds)}
      </Text>
      <View style={styles.rowMain}>
        <View style={styles.rowTop}>
          <Text style={styles.rowDuration}>{formatDuration(session.durationSeconds)}</Text>
          {session.presetLabel && (
            <View style={styles.presetTag}>
              <Text style={styles.presetTagText}>{session.presetLabel}</Text>
            </View>
          )}
          {session.goalReached && (
            <View style={styles.goalTag}>
              <Text style={styles.goalTagText}>✦ Goal</Text>
            </View>
          )}
        </View>
        <Text style={styles.rowTime}>{time}</Text>
      </View>
      <View style={styles.rowMss}>
        <Text style={styles.rowMssValue}>+{session.mssDelta}</Text>
        <Text style={styles.rowMssLabel}>MSS</Text>
      </View>
    </View>
  )
}

export default function HistoryScreen() {
  const insets         = useSafeAreaInsets()
  const t              = useT()
  const sessions       = useSessionStore((s) => s.completedSessions)
  const streak         = useSessionStore(selectCurrentStreak)
  const totalMinutes   = useSessionStore(selectTotalMinutes)
  const totalMss       = useSessionStore((s) =>
    s.completedSessions.reduce((acc, s) => acc + s.mssDelta, 0)
  )

  const groups = groupSessions(sessions, t)

  // Flat list data: mix of heading strings and session objects
  type ListItem = { type: 'heading'; text: string } | { type: 'session'; session: CompletedSession }
  const listData: ListItem[] = groups.flatMap(g => [
    { type: 'heading' as const, text: g.heading },
    ...g.data.map(s => ({ type: 'session' as const, session: s })),
  ])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>← {t.back}</Text>
        </Pressable>
        <Text style={styles.title}>{t.yourJourney}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>{t.sessions}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>{t.minutes}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.colors.gold }]}>{streak}</Text>
          <Text style={styles.statLabel}>{t.dayStreak}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{totalMss}</Text>
          <Text style={styles.statLabel}>{t.totalMss}</Text>
        </View>
      </View>

      {/* Activity heatmap */}
      {sessions.length > 0 && (
        <View style={styles.heatmapCard}>
          <Text style={styles.heatmapTitle}>Activity — last 12 weeks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <MeditationHeatmap sessions={sessions} />
          </ScrollView>
        </View>
      )}

      {/* Session list */}
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyText}>Your first session will appear here.</Text>
          <Text style={styles.emptyHint}>Every breath counts.</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, i) =>
            item.type === 'heading' ? `h-${i}` : item.session.id
          }
          renderItem={({ item }) =>
            item.type === 'heading' ? (
              <Text style={styles.groupHeading}>{item.text}</Text>
            ) : (
              <SessionRow session={item.session} />
            )
          }
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  heatmapCard: {
    marginHorizontal: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  heatmapTitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  groupHeading: {
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingTop: 20,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  rowEmoji: {
    fontSize: 28,
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  rowDuration: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  presetTag: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  presetTagText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  goalTag: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  goalTagText: {
    fontSize: 11,
    color: theme.colors.gold,
  },
  rowTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  rowMss: {
    alignItems: 'center',
    gap: 2,
  },
  rowMssValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rowMssLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
})
