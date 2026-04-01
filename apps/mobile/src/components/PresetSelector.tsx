import { View, Text, Pressable, StyleSheet } from 'react-native'
import { PRESETS, type Preset } from '@/store/sessionStore'
import { theme } from '@/theme'

interface PresetSelectorProps {
  selected: Preset
  onSelect: (preset: Preset) => void
}

export function PresetSelector({ selected, onSelect }: PresetSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set a target</Text>
      <View style={styles.pills}>
        {PRESETS.map((preset) => {
          const active = preset.label === selected.label
          return (
            <Pressable
              key={preset.label}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onSelect(preset)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {preset.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
})
