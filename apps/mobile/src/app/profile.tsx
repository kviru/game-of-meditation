import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/authStore'
import {
  useSessionStore,
  selectTotalMinutes,
  selectSessionCount,
  selectCurrentStreak,
} from '@/store/sessionStore'
import { useOnboardingStore, LANGUAGES } from '@/store/onboardingStore'
import { BuddhaLevelCard } from '@/components/BuddhaLevelCard'
import { supabase } from '@/lib/supabase'
import { theme } from '@/theme'

export default function ProfileScreen() {
  const insets       = useSafeAreaInsets()
  const user         = useAuthStore((s) => s.user)
  const signOut      = useAuthStore((s) => s.signOut)

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
  const [saving,      setSaving]      = useState(false)

  const saveName = useCallback(async () => {
    const trimmed = nameInput.trim()
    setName(trimmed)
    setEditingName(false)

    // Sync to Supabase profile if signed in
    if (user) {
      setSaving(true)
      await supabase.from('profiles').update({ display_name: trimmed }).eq('id', user.id)
      setSaving(false)
    }
  }, [nameInput, user, setName])

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
              <Pressable onPress={saveName} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={theme.colors.primary} />
                  : <Text style={styles.saveText}>Save</Text>
                }
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)}>
              <Text style={styles.displayName}>{name || 'Tap to set name'} ✏️</Text>
            </Pressable>
          )}
          {user
            ? <Text style={styles.email}>{user.email}</Text>
            : <Text style={styles.anonNote}>Playing anonymously</Text>
          }
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

      {/* Account actions */}
      {user ? (
        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.signInButton} onPress={() => router.push('/auth')}>
          <Text style={styles.signInText}>Sign in to sync across devices</Text>
        </Pressable>
      )}
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
  email: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  anonNote: {
    fontSize: 13,
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
  signOutButton: {
    paddingVertical: 16,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  signOutText: {
    fontSize: 16,
    color: '#ff6666',
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
