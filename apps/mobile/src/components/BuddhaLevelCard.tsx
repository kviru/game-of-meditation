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

  const normalLevels  = BUDDHA_LEVELS.filter(l => l.level !== 'sky' && l.level !== 'infinite')
  const currentIndex  = normalLevels.findIndex(l => l.level === currentLevelKey)
  const nextConfig    = normalLevels[currentIndex + 1] ?? null

  let progress = 1
  if (nextConfig) {
    const range = nextConfig.minMinutes - currentConfig.minMinutes
    const done  = totalMinutes - currentConfig.minMinutes
    progress    = range > 0 ? Math.min(done / range, 1) : 1
  }

  const barWidth = useSharedValue(0)
  useEffect(() => {
    barWidth.value = withTiming(progress, { duration: 1000 })
  }, [progress])

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }))

  const levelEmoji = LEVEL_EMOJI[currentLevelKey] ?? '🌱'
  const isHighLevel = currentIndex >= 4

  return (
    <View style={[styles.card, isHighLevel && styles.cardHighLevel]}>
      {/* Watermark emoji */}
      <Text style={styles.watermark} pointerEvents="none">{levelEmoji}</Text>

      {/* Level identity */}
      <View style={styles.levelRow}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{levelEmoji}</Text>
        </View>
        <View style={styles.levelText}>
          <Text style={styles.levelName}>{currentConfig.label}</Text>
          <Text style={styles.levelDesc}>{currentConfig.description}</Text>
        </View>
        <View style={[styles.mssBadge, isHighLevel && styles.mssBadgeHigh]}>
          <Text style={styles.mssValue}>{mss}</Text>
          <Text style={styles.mssLabel}>MSS</Text>
        </View>
      </View>

      {/* Progress to next level */}
      {nextConfig && (
        <View style={styles.progressSection}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>
              {totalMinutes} / {nextConfig.minMinutes} min → {nextConfig.label}
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
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 0.15,
  },
  cardHighLevel: {
    borderColor: theme.colors.gold + '50',
  },

  // Watermark
  watermark: {
    position: 'absolute',
    fontSize: 90,
    opacity: 0.055,
    right: -6,
    bottom: -10,
    lineHeight: 100,
  },

  // Level row
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emoji: {
    fontSize: 28,
  },
  levelText: {
    flex: 1,
    gap: 4,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  levelDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 17,
  },

  // MSS badge
  mssBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 54,
  },
  mssBadgeHigh: {
    borderColor: theme.colors.gold + '70',
    backgroundColor: theme.colors.gold + '10',
  },
  mssValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.gold,
  },
  mssLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    fontWeight: '600',
  },

  // Progress
  progressSection: {
    gap: 8,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    flex: 1,
  },
  progressPct: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
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
  maxLevel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
