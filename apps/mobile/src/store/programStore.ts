/**
 * 21-Day Program Store
 * Local-first: progress tracked in AsyncStorage.
 * Syncs to Supabase when user is signed in.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Data Types ────────────────────────────────────────────────

export interface Program {
  id: string
  title: string
  description: string
  tradition: string           // maps to SESSION_TYPES key
  durationDays: number
  dailyMinutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  coverEmoji: string
  languageCode: string
}

export interface DayCompletion {
  dayNumber: number
  completedAt: string         // ISO string
  sessionId?: string
  durationSeconds: number
}

export interface Enrollment {
  programId: string
  enrolledAt: string          // ISO string
  completedAt?: string
  dayCompletions: DayCompletion[]
}

// ─── Local seed data — matches 0002_programs.sql ──────────────

export const PROGRAMS: Program[] = [
  {
    id: 'prog_21days_presence',
    title: '21 Days of Presence',
    description:
      'A foundational program to establish a daily meditation habit. Each day you sit for 10 minutes in open awareness — observing thoughts without attachment. Simple, powerful, life-changing.',
    tradition: 'open',
    durationDays: 21,
    dailyMinutes: 10,
    difficulty: 'beginner',
    coverEmoji: '🌿',
    languageCode: 'en',
  },
  {
    id: 'prog_breath_focus',
    title: 'Breath & Focus Challenge',
    description:
      'Strengthen your concentration with daily breathwork sessions. Over 21 days you will develop the ability to direct and sustain attention — a core skill that benefits every area of life.',
    tradition: 'breathwork',
    durationDays: 21,
    dailyMinutes: 15,
    difficulty: 'intermediate',
    coverEmoji: '🌬️',
    languageCode: 'en',
  },
  {
    id: 'prog_loving_kindness',
    title: 'Loving-Kindness Journey',
    description:
      'Transform your relationship with yourself and others through 21 days of Metta meditation. Begin with self-compassion and gradually extend warmth to family, community, and all beings.',
    tradition: 'metta',
    durationDays: 21,
    dailyMinutes: 10,
    difficulty: 'beginner',
    coverEmoji: '💚',
    languageCode: 'en',
  },
]

// ─── Store ─────────────────────────────────────────────────────

/** Set before launching timer from a program — cleared after session completes. */
export interface ActiveProgramSession {
  programId: string
  dayNumber: number
}

interface ProgramStore {
  enrollments: Record<string, Enrollment>   // keyed by programId

  /** Non-null when a timer session was started from a program detail screen. */
  activeProgramSession: ActiveProgramSession | null

  enroll: (programId: string) => void
  unenroll: (programId: string) => void
  completeDay: (programId: string, dayNumber: number, sessionId: string, durationSeconds: number) => void
  isDayCompleted: (programId: string, dayNumber: number) => boolean
  getEnrollment: (programId: string) => Enrollment | undefined
  getDaysCompleted: (programId: string) => number
  isEnrolled: (programId: string) => boolean
  setActiveProgramSession: (session: ActiveProgramSession | null) => void
  resetAllData: () => void   // full wipe — used on onboarding reset

  /** The day number the user should work on next (1-based). Returns null if not enrolled or program complete. */
  nextDay: (programId: string, totalDays: number) => number | null
}

export const useProgramStore = create<ProgramStore>()(
  persist(
    (set, get) => ({
      enrollments: {},
      activeProgramSession: null,

      setActiveProgramSession: (session) => set({ activeProgramSession: session }),

      resetAllData: () => set({ enrollments: {}, activeProgramSession: null }),

      enroll: (programId) =>
        set((s) => {
          if (s.enrollments[programId]) return s   // already enrolled
          return {
            enrollments: {
              ...s.enrollments,
              [programId]: {
                programId,
                enrolledAt: new Date().toISOString(),
                dayCompletions: [],
              },
            },
          }
        }),

      unenroll: (programId) =>
        set((s) => {
          const next = { ...s.enrollments }
          delete next[programId]
          return { enrollments: next }
        }),

      completeDay: (programId, dayNumber, sessionId, durationSeconds) =>
        set((s) => {
          const enrollment = s.enrollments[programId]
          if (!enrollment) return s
          // idempotent — don't double-count the same day
          if (enrollment.dayCompletions.some((d) => d.dayNumber === dayNumber)) return s

          const newCompletion: DayCompletion = {
            dayNumber,
            completedAt: new Date().toISOString(),
            sessionId,
            durationSeconds,
          }
          const updatedDays = [...enrollment.dayCompletions, newCompletion]

          // Check if program is fully complete
          const program = PROGRAMS.find((p) => p.id === programId)
          const completedAt =
            program && updatedDays.length >= program.durationDays
              ? new Date().toISOString()
              : enrollment.completedAt

          return {
            enrollments: {
              ...s.enrollments,
              [programId]: { ...enrollment, dayCompletions: updatedDays, completedAt },
            },
          }
        }),

      isDayCompleted: (programId, dayNumber) => {
        const e = get().enrollments[programId]
        return e?.dayCompletions.some((d) => d.dayNumber === dayNumber) ?? false
      },

      getEnrollment: (programId) => get().enrollments[programId],

      getDaysCompleted: (programId) =>
        get().enrollments[programId]?.dayCompletions.length ?? 0,

      isEnrolled: (programId) => Boolean(get().enrollments[programId]),

      nextDay: (programId, totalDays) => {
        const e = get().enrollments[programId]
        if (!e) return null
        const completed = new Set(e.dayCompletions.map((d) => d.dayNumber))
        for (let d = 1; d <= totalDays; d++) {
          if (!completed.has(d)) return d
        }
        return null   // all days done
      },
    }),
    {
      name: 'programs',
      storage: createJSONStorage(() => AsyncStorage),
      // activeProgramSession is ephemeral — never persist it
      partialize: (s) => ({ enrollments: s.enrollments }),
    }
  )
)
