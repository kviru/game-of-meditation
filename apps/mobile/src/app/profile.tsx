import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  useSessionStore,
  selectTotalMinutes,
  selectSessionCount,
  selectCurrentStreak,
} from '@/store/sessionStore'
import { useOnboardingStore, LANGUAGES } from '@/store/onboardingStore'
import { BuddhaLevelCard } from '@/components/BuddhaLevelCard'
import { theme } from '@/theme'

export default function ProfileScreen() {
  const insets       = useSafeAreaInsets()

  const totalMinutes = useSessionStore(selectTotalMinutes)
  const sessionCount = useSessionStore(selectSessionCount)
  const streak       = useSessionStore(selectCurrentStreak)
  const totalMss     = useSessionStore((s) =>
    s.completedSessions.reduce((acc, s) => acc + s.mssDelta, 0)
  )

  const languageCode = useOnboardingStore((s) => s.languageCode)
  const setLanguage  = useOnboardingStore((s) => s.setLanguage)
  const name         = useOnboardingStore((s) => s.name)
  const setName      = useOnboardingStore((s) => s.setName)

  const [editingName, setEditingName] = useState(false)
  const [nameInput,   setNameInput]   = useState(name)

  const saveName = useCallback(() => {
    const trimmed = nameInput.trim()
    setName(trimmed)
    setEditingName(false)
  }, [nameInput, setName])

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Identity */}
      <View style={styles.identityCard}>
        <Text style={styles.avatar}>🧘</Text>
        <View style={styles.identityInfo}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                maxLength={32}
                returnKeyType="done"
                onSubmitEditing={saveName}
              />
              <Pressable onPress={saveName}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)}>
              <Text style={styles.displayName}>{name || 'Tap to set name'} ✏️</Text>
            </Pressable>
          )}
          <Text style={styles.localNote}>📱 Your data is stored privately on this device</Text>
        </View>
      </View>

      {/* Buddha Level */}
      <BuddhaLevelCard totalMinutes={totalMinutes} mss={totalMss} />

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{sessionCount}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.gold }]}>{streak} 🔥</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{totalMss}</Text>
          <Text style={styles.statLabel}>Total MSS</Text>
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Language</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              style={[styles.langChip, languageCode === lang.code && styles.langChipActive]}
              onPress={() => setLanguage(lang.code)}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={[styles.langLabel, languageCode === lang.code && styles.langLabelActive]}>
                {lang.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 16,
  },
  avatar: {
    fontSize: 48,
  },
  identityInfo: {
    flex: 1,
    gap: 6,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingBottom: 4,
  },
  saveText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  localNote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  langRow: {
    gap: 8,
    paddingBottom: 4,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  langChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceElevated,
  },
  langFlag: {
    fontSize: 18,
  },
  langLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  langLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
})
