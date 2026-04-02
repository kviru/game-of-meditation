import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type MoodRating = 1 | 2 | 3 | 4 | 5

export interface FeedbackEntry {
  id: string
  submittedAt: string
  mood: MoodRating           // 1 = rough, 5 = peaceful
  tags: string[]             // e.g. ['focused', 'calm', 'distracted']
  note: string               // free text, optional
  sessionId: string | null   // linked session if submitted right after one
}

interface FeedbackStore {
  entries: FeedbackEntry[]
  submitFeedback: (entry: Omit<FeedbackEntry, 'id' | 'submittedAt'>) => void
}

export const EXPERIENCE_TAGS = [
  'Calm',
  'Focused',
  'Peaceful',
  'Restless',
  'Distracted',
  'Sleepy',
  'Energised',
  'Emotional',
  'Grateful',
  'Anxious',
]

export const MOOD_LABELS: Record<MoodRating, string> = {
  1: 'Rough',
  2: 'Unsettled',
  3: 'Neutral',
  4: 'Good',
  5: 'Peaceful',
}

export const MOOD_EMOJIS: Record<MoodRating, string> = {
  1: '😔',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '🧘',
}

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set) => ({
      entries: [],

      submitFeedback: (entry) =>
        set((s) => ({
          entries: [
            {
              ...entry,
              id: Math.random().toString(36).slice(2),
              submittedAt: new Date().toISOString(),
            },
            ...s.entries,
          ],
        })),
    }),
    {
      name: 'feedback',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
