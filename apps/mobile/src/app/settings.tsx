import { useState } from 'react'
import {
  View, Text, StyleSheet, Pressable, Switch, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useReminderStore } from '@/store/reminderStore'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { theme } from '@/theme'

// Simple HH:MM picker using +/- buttons (no native picker needed)
function TimePicker({
  hour, minute, onChange,
}: {
  hour: number
  minute: number
  onChange: (h: number, m: number) => void
}) {
  const pad = (n: number) => String(n).padStart(2, '0')

  const adjustHour = (delta: number) =>
    onChange((hour + delta + 24) % 24, minute)

  const adjustMinute = (delta: number) => {
    let m = minute + delta
    if (m < 0) { m = 45; onChange((hour - 1 + 24) % 24, m) }
    else if (m >= 60) { m = 0; onChange((hour + 1) % 24, m) }
    else onChange(hour, m)
  }

  return (
    <View style={pickerStyles.row}>
      <View style={pickerStyles.unit}>
        <Pressable onPress={() => adjustHour(1)} hitSlop={12}><Text style={pickerStyles.arrow}>▲</Text></Pressable>
        <Text style={pickerStyles.value}>{pad(hour)}</Text>
        <Pressable onPress={() => adjustHour(-1)} hitSlop={12}><Text style={pickerStyles.arrow}>▼</Text></Pressable>
      </View>
      <Text style={pickerStyles.colon}>:</Text>
      <View style={pickerStyles.unit}>
        <Pressable onPress={() => adjustMinute(15)} hitSlop={12}><Text style={pickerStyles.arrow}>▲</Text></Pressable>
        <Text style={pickerStyles.value}>{pad(minute)}</Text>
        <Pressable onPress={() => adjustMinute(-15)} hitSlop={12}><Text style={pickerStyles.arrow}>▼</Text></Pressable>
      </View>
      <Text style={pickerStyles.ampm}>{hour < 12 ? 'AM' : 'PM'}</Text>
    </View>
  )
}

const pickerStyles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unit:   { alignItems: 'center', gap: 8 },
  value:  { fontSize: 36, fontWeight: '200', color: theme.colors.textPrimary, width: 56, textAlign: 'center' },
  arrow:  { fontSize: 18, color: theme.colors.textMuted },
  colon:  { fontSize: 36, fontWeight: '200', color: theme.colors.textSecondary, marginBottom: 4 },
  ampm:   { fontSize: 14, color: theme.colors.textMuted, alignSelf: 'flex-end', marginBottom: 8 },
})

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()

  const { enabled, hour, minute, setReminder, disableReminder } = useReminderStore()
  const signOut        = useAuthStore((s) => s.signOut)
  const user           = useAuthStore((s) => s.user)
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding)

  const [localHour,   setLocalHour]   = useState(hour)
  const [localMinute, setLocalMinute] = useState(minute)
  const [saving,      setSaving]      = useState(false)

  const handleToggle = async (value: boolean) => {
    if (value) {
      setSaving(true)
      await setReminder(localHour, localMinute)
      setSaving(false)
    } else {
      await disableReminder()
    }
  }

  const handleSaveTime = async () => {
    if (!enabled) return
    setSaving(true)
    await setReminder(localHour, localMinute)
    setSaving(false)
  }

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
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Daily reminder */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>Daily reminder</Text>
            <Text style={styles.cardHint}>A gentle nudge at the same time each day.</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {enabled && (
          <>
            <View style={styles.divider} />
            <TimePicker
              hour={localHour}
              minute={localMinute}
              onChange={(h, m) => { setLocalHour(h); setLocalMinute(m) }}
            />
            {(localHour !== hour || localMinute !== minute) && (
              <Pressable style={styles.saveButton} onPress={handleSaveTime} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save time'}</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        {user ? (
          <View style={styles.card}>
            <Text style={styles.accountEmail}>{user.email}</Text>
            <View style={styles.divider} />
            <Pressable onPress={signOut}>
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.card} onPress={() => router.push('/auth')}>
            <Text style={styles.cardTitle}>Sign in to sync your journey</Text>
            <Text style={styles.cardHint}>Free. Your data stays yours.</Text>
          </Pressable>
        )}
      </View>

      {/* Dev tools */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Developer</Text>
        <Pressable
          style={styles.card}
          onPress={() => { resetOnboarding(); router.replace('/onboarding') }}
        >
          <Text style={styles.cardTitle}>Reset onboarding</Text>
          <Text style={styles.cardHint}>Re-runs the first-launch flow.</Text>
        </Pressable>
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
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  cardHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  accountEmail: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  signOutText: {
    fontSize: 15,
    color: '#ff6666',
    fontWeight: '500',
  },
})
