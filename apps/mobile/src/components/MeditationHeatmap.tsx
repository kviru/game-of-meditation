/**
 * MeditationHeatmap — GitHub-style 12-week activity grid.
 * Shows which days had meditation sessions, colored by duration.
 */
import { View, Text, StyleSheet } from 'react-native'
import type { CompletedSession } from '@/store/sessionStore'
import { theme } from '@/theme'

const WEEKS     = 12
const DAYS      = 7
const CELL_SIZE = 14
const CELL_GAP  = 3

// Build a map of dateString → total seconds
function buildDayMap(sessions: CompletedSession[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of sessions) {
    const key = new Date(s.completedAt).toDateString()
    map.set(key, (map.get(key) ?? 0) + s.durationSeconds)
  }
  return map
}

// Color intensity based on total seconds that day
function cellColor(seconds: number): string {
  if (seconds === 0)      return theme.colors.surface
  if (seconds < 5 * 60)  return '#1a4a1a'   // < 5 min
  if (seconds < 15 * 60) return '#2d7a2d'   // 5–15 min
  if (seconds < 30 * 60) return '#3da63d'   // 15–30 min
  return theme.colors.primary               // 30+ min
}

interface Props {
  sessions: CompletedSession[]
}

export function MeditationHeatmap({ sessions }: Props) {
  const dayMap = buildDayMap(sessions)

  // Build grid: WEEKS columns, each has DAYS rows (Sun→Sat)
  // Start from today, go back WEEKS * 7 days
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (WEEKS * DAYS - 1))

  // Align startDate to Sunday
  const dayOfWeek = startDate.getDay() // 0=Sun
  startDate.setDate(startDate.getDate() - dayOfWeek)

  const weeks: Date[][] = []
  const cursor = new Date(startDate)
  for (let w = 0; w < WEEKS; w++) {
    const week: Date[] = []
    for (let d = 0; d < DAYS; d++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  // Month labels: emit month name when it changes across weeks
  const monthLabels: { weekIdx: number; label: string }[] = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const m = week[0].getMonth()
    if (m !== lastMonth) {
      monthLabels.push({
        weekIdx: i,
        label: week[0].toLocaleString('default', { month: 'short' }),
      })
      lastMonth = m
    }
  })

  return (
    <View style={styles.container}>
      {/* Month row */}
      <View style={styles.monthRow}>
        {monthLabels.map(({ weekIdx, label }) => (
          <Text
            key={weekIdx}
            style={[
              styles.monthLabel,
              { left: weekIdx * (CELL_SIZE + CELL_GAP) },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekCol}>
            {week.map((date, di) => {
              const key      = date.toDateString()
              const secs     = dayMap.get(key) ?? 0
              const isFuture = date > today
              return (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    { backgroundColor: isFuture ? 'transparent' : cellColor(secs) },
                    isFuture && styles.cellFuture,
                  ]}
                />
              )
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        {(['#1a2e1a', '#1a4a1a', '#2d7a2d', '#3da63d', theme.colors.primary] as const).map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  monthRow: {
    height: 16,
    position: 'relative',
    marginLeft: 0,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  weekCol: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cellFuture: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
})
