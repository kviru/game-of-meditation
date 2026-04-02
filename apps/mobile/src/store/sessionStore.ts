import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { TimerState } from '@/hooks/useTimer'

export interface CompletedSession {
  id: string
  durationSeconds: number
  completedAt: string
  mssDelta: number
  presetLabel: string | null   // 'Free', '5 min', '10 min', etc.
  goalReached: boolean
}

export interface Preset {
  label: string
  seconds: number | null       // null = free / no target
}

export const PRESETS: Preset[] = [
  { label: 'Free',   seconds: null },
  { label: '5 min',  seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '20 min', seconds: 20 * 60 },
  { label: '30 min', seconds: 30 * 60 },
]

interface SessionStore {
  // Timer state (not persisted)
  timerState: TimerState
  elapsedSeconds: number
  sessionStartedAt: string | null

  // Active preset (not persisted)
  activePreset: Preset
  goalReachedAt: number | null

  // History (persisted)
  completedSessions: CompletedSession[]
  totalSeconds: number
  currentStreak: number
  lastSessionDate: string | null

  // Timer actions
  setTimerState: (state: TimerState) => void
  setPreset: (preset: Preset) => void
  incrementSecond: () => void
  startSession: () => void
  endSession: () => void
  resetTimer: () => void
}

/**
 * Calculate Mind Stability Score delta for a session.
 * Short sessions earn proportionally — no session is worthless.
 */
function calcMssDelta(durationSeconds: number): number {
  if (durationSeconds < 10)   return 0
  if (durationSeconds < 60)   return 1   // < 1 min
  if (durationSeconds < 300)  return 2   // 1–5 min
  if (durationSeconds < 600)  return 5   // 5–10 min
  if (durationSeconds < 1800) return 10  // 10–30 min
  if (durationSeconds < 3600) return 20  // 30–60 min
  return 30                              // 60+ min
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      timerState: 'idle',
      elapsedSeconds: 0,
      sessionStartedAt: null,
      activePreset: PRESETS[0],
      goalReachedAt: null,
      completedSessions: [],
      totalSeconds: 0,
      currentStreak: 0,
      lastSessionDate: null,

      setTimerState: (state) => set({ timerState: state }),

      setPreset: (preset) => set({ activePreset: preset }),

      incrementSecond: () =>
        set((s) => {
          const next = s.elapsedSeconds + 1
          const target = s.activePreset.seconds
          const justHitGoal =
            target !== null &&
            s.goalReachedAt === null &&
            next >= target
          return {
            elapsedSeconds: next,
            goalReachedAt: justHitGoal ? next : s.goalReachedAt,
          }
        }),

      startSession: () =>
        set({ sessionStartedAt: new Date().toISOString(), elapsedSeconds: 0, goalReachedAt: null }),

      endSession: () => {
        const {
          elapsedSeconds, activePreset, goalReachedAt,
          completedSessions, totalSeconds, currentStreak, lastSessionDate,
        } = get()

        const mssDelta   = calcMssDelta(elapsedSeconds)
        const goalReached = goalReachedAt !== null

        const session: CompletedSession = {
          id: Math.random().toString(36).slice(2),
          durationSeconds: elapsedSeconds,
          completedAt: new Date().toISOString(),
          mssDelta,
          presetLabel: activePreset.label === 'Free' ? null : activePreset.label,
          goalReached,
        }

        // Streak logic
        const today     = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const last      = lastSessionDate ? new Date(lastSessionDate).toDateString() : null
        let newStreak   = currentStreak
        if (last === today) {
          // already meditated today — streak unchanged
        } else if (last === yesterday) {
          newStreak = currentStreak + 1
        } else {
          newStreak = 1
        }

        set({
          completedSessions: [session, ...completedSessions],
          totalSeconds: totalSeconds + elapsedSeconds,
          currentStreak: newStreak,
          lastSessionDate: new Date().toISOString(),
        })
      },

      resetTimer: () =>
        set({
          timerState: 'idle',
          elapsedSeconds: 0,
          sessionStartedAt: null,
          goalReachedAt: null,
          activePreset: PRESETS[0],
        }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist history — never the live timer state
      partialize: (s) => ({
        completedSessions: s.completedSessions,
        totalSeconds:      s.totalSeconds,
        currentStreak:     s.currentStreak,
        lastSessionDate:   s.lastSessionDate,
      }),
    }
  )
)

// ─── Selectors ─────────────────────────────────────────────────

export const selectLastSession    = (s: SessionStore) => s.completedSessions[0] ?? null
export const selectTotalMinutes   = (s: SessionStore) => Math.floor(s.totalSeconds / 60)
export const selectSessionCount   = (s: SessionStore) => s.completedSessions.length
export const selectCurrentStreak  = (s: SessionStore) => s.currentStreak
export const selectGoalReached    = (s: SessionStore) => s.goalReachedAt !== null
