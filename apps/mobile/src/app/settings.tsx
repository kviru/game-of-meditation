import { useState } from 'react'
import {
  View, Text, StyleSheet, Pressable, Switch, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useReminderStore, MICRO_INTERVALS } from '@/store/reminderStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useSessionStore } from '@/store/sessionStore'
import { useProgramStore } from '@/store/programStore'
import { theme } from '@/theme'

// ─── Hour picker (hour-only, 1h steps) ────────────────────────
function HourPicker({
  label, hour, onChange,
}: {
  label: string
  hour: number
  onChange: (h: number) => void
}) {
  const fmt = (h: number) => {
    const ampm = h < 12 ? 'AM' : 'PM'
    const display = h % 12 === 0 ? 12 : h % 12
    return `${display} ${ampm}`
  }

  return (
    <View style={pickerStyles.hourRow}>
      <Text style={pickerStyles.hourLabel}>{label}</Text>
      <View style={pickerStyles.hourControl}>
        <Pressable onPress={() => onChange((hour - 1 + 24) % 24)} hitSlop={14}>
          <Text style={pickerStyles.arrow}>◀</Text>
        </Pressable>
        <Text style={pickerStyles.hourValue}>{fmt(hour)}</Text>
        <Pressable onPress={() => onChange((hour + 1) % 24)} hitSlop={14}>
          <Text style={pickerStyles.arrow}>▶</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ─── HH:MM picker (for daily reminder) ────────────────────────
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
  row:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unit:         { alignItems: 'center', gap: 8 },
  value:        { fontSize: 36, fontWeight: '200', color: theme.colors.textPrimary, width: 56, textAlign: 'center' },
  arrow:        { fontSize: 18, color: theme.colors.textMuted },
  colon:        { fontSize: 36, fontWeight: '200', color: theme.colors.textSecondary, marginBottom: 4 },
  ampm:         { fontSize: 14, color: theme.colors.textMuted, alignSelf: 'flex-end', marginBottom: 8 },
  hourRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hourLabel:    { fontSize: 14, color: theme.colors.textSecondary, flex: 1 },
  hourControl:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hourValue:    { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, minWidth: 64, textAlign: 'center' },
})

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()

  const {
    enabled, hour, minute, setReminder, disableReminder,
    microEnabled, microStartHour, microEndHour, microIntervalHours,
    setMicroReminders, disableMicroReminders,
  } = useReminderStore()

  const resetOnboarding  = useOnboardingStore((s) => s.resetOnboarding)
  const resetSessions    = useSessionStore((s) => s.resetAllData)
  const resetPrograms    = useProgramStore((s) => s.resetAllData)

  // Daily reminder local state
  const [localHour,   setLocalHour]   = useState(hour)
  const [localMinute, setLocalMinute] = useState(minute)
  const [saving,      setSaving]      = useState(false)

  // Micro-reminder local state
  const [microStart,    setMicroStart]    = useState(microStartHour)
  const [microEnd,      setMicroEnd]      = useState(microEndHour)
  const [microInterval, setMicroInterval] = useState(microIntervalHours)
  const [microSaving,   setMicroSaving]   = useState(false)

  const handleDailyToggle = async (value: boolean) => {
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

  const handleMicroToggle = async (value: boolean) => {
    if (value) {
      setMicroSaving(true)
      await setMicroReminders(microStart, microEnd, microInterval)
      setMicroSaving(false)
    } else {
      await disableMicroReminders()
    }
  }

  const handleSaveMicro = async () => {
    if (!microEnabled) return
    setMicroSaving(true)
    await setMicroReminders(microStart, microEnd, microInterval)
    setMicroSaving(false)
  }

  const microChanged =
    microStart !== microStartHour ||
    microEnd !== microEndHour ||
    microInterval !== microIntervalHours

  // Calculate how many nudges will fire per day
  const nudgeCount = microStart < microEnd
    ? Math.floor((microEnd - microStart) / microInterval) + 1
    : 0

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

      {/* ── Reminders section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Reminders</Text>

        {/* Daily reminder */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardMeta}>
              <Text style={styles.cardTitle}>Daily reminder</Text>
              <Text style={styles.cardHint}>A gentle nudge at the same time each day.</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleDailyToggle}
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

        {/* Micro-meditation vibration nudges */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardMeta}>
              <Text style={styles.cardTitle}>✨ Vibration nudges</Text>
              <Text style={styles.cardHint}>
                "Uplift your vibrations — 1 minute of meditation." A gentle buzz between morning and evening.
              </Text>
            </View>
            <Switch
              value={microEnabled}
              onValueChange={handleMicroToggle}
              trackColor={{ true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {microEnabled && (
            <>
              <View style={styles.divider} />

              {/* Start / End hour */}
              <HourPicker
                label="From"
                hour={microStart}
                onChange={(h) => setMicroStart(Math.min(h, microEnd - 1))}
              />
              <HourPicker
                label="Until"
                hour={microEnd}
                onChange={(h) => setMicroEnd(Math.max(h, microStart + 1))}
              />

              <View style={styles.divider} />

              {/* Interval chips */}
              <Text style={styles.intervalLabel}>How often</Text>
              <View style={styles.intervalChips}>
                {MICRO_INTERVALS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.intervalChip,
                      microInterval === opt.value && styles.intervalChipActive,
                    ]}
                    onPress={() => setMicroInterval(opt.value)}
                  >
                    <Text style={[
                      styles.intervalChipText,
                      microInterval === opt.value && styles.intervalChipTextActive,
                    ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Preview */}
              {nudgeCount > 0 && (
                <View style={styles.nudgePreview}>
                  <Text style={styles.nudgePreviewText}>
                    📳 {nudgeCount} nudge{nudgeCount !== 1 ? 's' : ''} per day
                  </Text>
                </View>
              )}

              {microChanged && (
                <Pressable style={styles.saveButton} onPress={handleSaveMicro} disabled={microSaving}>
                  <Text style={styles.saveButtonText}>{microSaving ? 'Saving…' : 'Save nudge settings'}</Text>
                </Pressable>
              )}
            </>
          )}

          {!microEnabled && (
            <Text style={styles.cardHint} numberOfLines={2}>
              Vibration only — no sound. Works even when your phone is on silent.
            </Text>
          )}
        </View>
      </View>

      {/* ── Privacy section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardMeta}>
              <Text style={styles.cardTitle}>Local-only mode</Text>
              <Text style={styles.cardHint}>
                All your sessions, streaks, and progress are stored privately on this device only. Nothing is sent to any server.
              </Text>
            </View>
            <Switch
              value={true}
              disabled={true}
              trackColor={{ true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <Text style={styles.localModeNote}>
            🔒 Your meditation practice is yours alone. Cloud sync will be an optional, opt-in feature in a future release.
          </Text>
        </View>
      </View>

      {/* ── About section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutIconWrap}>
              <Text style={styles.aboutIcon}>🧘</Text>
            </View>
            <View style={styles.aboutTitleBlock}>
              <Text style={styles.aboutAppName}>Game of Meditation</Text>
              <Text style={styles.aboutTagline}>Conquer Yourself. One Breath At A Time.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Developed by</Text>
            <Text style={styles.aboutValue}>Viru Kulkarni</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Role</Text>
            <Text style={styles.aboutValue}>Software Consultant</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Contact</Text>
            <Text style={[styles.aboutValue, styles.aboutContact]}>+91 9980504921</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.aboutFooterRow}>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutBadgeText}>MIT License</Text>
            </View>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutBadgeText}>Open Source</Text>
            </View>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutBadgeText}>Free for All</Text>
            </View>
          </View>
          <Text style={styles.aboutMission}>
            Built for humanity. No ads. No data selling. No pay-to-win. Ever.
          </Text>
        </View>
      </View>

      {/* ── Developer section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Developer</Text>
        <Pressable
          style={styles.card}
          onPress={() => {
            resetSessions()
            resetPrograms()
            resetOnboarding()
            router.replace('/onboarding')
          }}
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
  // Interval chips
  intervalLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  intervalChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  intervalChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceElevated,
  },
  intervalChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  intervalChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  // Nudge preview
  nudgePreview: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  nudgePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  // About section
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  aboutIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutIcon: {
    fontSize: 28,
  },
  aboutTitleBlock: {
    flex: 1,
    gap: 3,
  },
  aboutAppName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  aboutTagline: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  aboutContact: {
    color: theme.colors.sky,
  },
  aboutFooterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  aboutBadge: {
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.primary + '50',
    backgroundColor: theme.colors.primary + '14',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  aboutBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: 0.3,
  },
  aboutMission: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Local mode
  localModeNote: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontStyle: 'italic',
  },
})
