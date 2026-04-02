import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import { SESSION_TYPES, type SessionTypeKey } from '@/store/sessionStore'
import { theme } from '@/theme'

interface Props {
  selected: SessionTypeKey
  onSelect: (type: SessionTypeKey) => void
}

export function SessionTypeSelector({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SESSION_TYPES.map((t) => {
        const active = t.key === selected
        return (
          <Pressable
            key={t.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(t.key)}
          >
            <Text style={styles.chipEmoji}>{t.emoji}</Text>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {t.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceElevated,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  chipLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
})
