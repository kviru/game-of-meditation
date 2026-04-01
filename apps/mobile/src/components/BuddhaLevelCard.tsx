import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { BUDDHA_LEVELS, getBuddhaLevel } from '@shared/constants/buddhaLevels'
import { theme } from '@/theme'

interface BuddhaLevelCardProps {
  totalMinutes: number
  mss: number
}

const LEVEL_EMOJI: Record<string, string> = {
  seed:       '🌱',
  sprout:     '🌿',
  sapling:    '🪴',
  tree:       '🌳',
  elder_tree: '🌲',
  forest:     '🏕️',
  mountain:   '🏔️',
  sky:        '☁️',
  infinite:   '✨',
}

export function BuddhaLevelCard({ totalMinutes, mss }: BuddhaLevelCardProps) {
  const currentLevelKey = getBuddhaLevel(totalMinutes, mss)
  const currentConfig   = BUDDHA_LEVELS.find(l => l.level === currentLevelKey)!

  // Find next level (skip sky/infinite as those are special)
  const normalLevels  = BUDDHA_LEVELS.filter(l => l.level !== 'sky' && l.level !== 'infinite')
  const currentIndex  = normalLevels.findIndex(l => l.level === currentLevelKey)
  const nextConfig    = normalLevels[currentIndex + 1] ?? null

  // Progress toward next level (by minutes)
  let progress = 1
  if (nextConfig) {
    const range = nextConfig.minMinutes - currentConfig.minMinutes
    const done  = totalMinutes - currentConfig.minMinutes
    progress    = range > 0 ? Math.min(done / range, 1) : 1
  }

  // Animate progress bar on mount / change
  const barWidth = useSharedValue(0)
  useEffect(() => {
    barWidth.value = withTiming(progress, { duration: 1000 })
  }, [progress])

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }))

  return (
    <View style={styles.card}>
      {/* Level identity */}
      <View style={styles.levelRow}>
        <Text style={styles.emoji}>{LEVEL_EMOJI[currentLevelKey] ?? '🌱'}</Text>
        <View style={styles.levelText}>
          <Text style={styles.levelName}>{currentConfig.label}</Text>
          <Text style={styles.levelDesc}>{currentConfig.description}</Text>
        </View>
        <View style={styles.mssBadge}>
          <Text style={styles.mssValue}>{mss}</Text>
          <Text style={styles.mssLabel}>MSS</Text>
        </View>
      </View>

      {/* Progress to next level */}
      {nextConfig && (
        <View style={styles.progressSection}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>
              {totalMinutes} / {nextConfig.minMinutes} min to {nextConfig.label}
            </Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, barStyle]} />
          </View>
        </View>
      )}

      {/* Max level */}
      {!nextConfig && (
        <Text style={styles.maxLevel}>You have reached the highest path. 🙏</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: {
    fontSize: 36,
  },
  levelText: {
    flex: 1,
    gap: 3,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  levelDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
  mssBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.md,
  },
  mssValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.gold,
  },
  mssLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  progressSection: {
    gap: 6,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  progressPct: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  progressTrack: {
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
  maxLevel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
