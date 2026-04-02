import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  useFeedbackStore,
  EXPERIENCE_TAGS,
  MOOD_EMOJIS,
  MOOD_LABELS,
  type MoodRating,
} from '@/store/feedbackStore'
import { theme } from '@/theme'

const MOODS: MoodRating[] = [1, 2, 3, 4, 5]

export default function FeedbackScreen() {
  const insets         = useSafeAreaInsets()
  const params         = useLocalSearchParams<{ sessionId?: string }>()
  const submitFeedback = useFeedbackStore((s) => s.submitFeedback)

  const [mood,     setMood]     = useState<MoodRating>(3)
  const [tags,     setTags]     = useState<string[]>([])
  const [note,     setNote]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggleTag = useCallback((tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])

  const handleSubmit = useCallback(() => {
    submitFeedback({
      mood,
      tags,
      note: note.trim(),
      sessionId: params.sessionId ?? null,
    })
    Keyboard.dismiss()
    setSubmitted(true)
  }, [mood, tags, note, params.sessionId, submitFeedback])

  if (submitted) {
    return (
      <View style={[styles.container, styles.thankYou, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.thankYouEmoji}>🌱</Text>
        <Text style={styles.thankYouTitle}>Thank you.</Text>
        <Text style={styles.thankYouBody}>
          Your experience helps us grow this practice for everyone.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.primaryButtonText}>Return home</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Experience Center</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Mood picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How was your session?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <Pressable
                key={m}
                style={[styles.moodItem, mood === m && styles.moodItemActive]}
                onPress={() => setMood(m)}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
                <Text style={[styles.moodLabel, mood === m && styles.moodLabelActive]}>
                  {MOOD_LABELS[m]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What describes it best? <Text style={styles.optional}>(optional)</Text></Text>
          <View style={styles.tagGrid}>
            {EXPERIENCE_TAGS.map((tag) => {
              const active = tags.includes(tag)
              return (
                <Pressable
                  key={tag}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Free text note */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Anything else? <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.noteInput}
            placeholder="A thought, a feeling, a question…"
            placeholderTextColor={theme.colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{note.length}/500</Text>
        </View>

        {/* Submit */}
        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Share my experience</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={{ marginTop: 8 }}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: 24,
    gap: 28,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    width: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  section: {
    gap: 14,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  optional: {
    fontWeight: '400',
    color: theme.colors.textMuted,
    fontSize: 14,
  },

  // Mood
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
    backgroundColor: theme.colors.surface,
  },
  moodItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceElevated,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  moodLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Tags
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tagActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceElevated,
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tagTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Note
  noteInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 16,
    fontSize: 16,
    color: theme.colors.textPrimary,
    minHeight: 100,
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: -8,
  },

  // Actions
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipText: {
    textAlign: 'center',
    fontSize: 15,
    color: theme.colors.textMuted,
    paddingVertical: 8,
  },

  // Thank you
  thankYou: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  thankYouEmoji: {
    fontSize: 64,
  },
  thankYouTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  thankYouBody: {
    fontSize: 17,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
})
