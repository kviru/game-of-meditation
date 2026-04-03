import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleMicroReminders,
  cancelMicroReminders,
} from '@/lib/notifications'

// Interval options (in hours) between nudges
export const MICRO_INTERVALS = [
  { label: 'Every 30 min', value: 0.5 },
  { label: 'Every hour',   value: 1 },
  { label: 'Every 2 hrs',  value: 2 },
  { label: 'Every 3 hrs',  value: 3 },
  { label: 'Every 4 hrs',  value: 4 },
]

interface ReminderStore {
  // ── Daily reminder ─────────────────────────────────────────
  enabled: boolean
  hour: number
  minute: number
  notificationId: string | null

  setReminder: (hour: number, minute: number) => Promise<void>
  disableReminder: () => Promise<void>

  // ── Micro-meditation nudges ────────────────────────────────
  microEnabled: boolean
  microStartHour: number    // e.g. 7  = 7:00 AM
  microEndHour: number      // e.g. 21 = 9:00 PM
  microIntervalHours: number
  microNotificationIds: string[]

  setMicroReminders: (startHour: number, endHour: number, intervalHours: number) => Promise<void>
  disableMicroReminders: () => Promise<void>
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      // ── Daily reminder defaults ──────────────────────────────
      enabled: false,
      hour: 7,
      minute: 0,
      notificationId: null,

      setReminder: async (hour, minute) => {
        const id = await scheduleDailyReminder(hour, minute)
        if (id) {
          set({ enabled: true, hour, minute, notificationId: id })
        }
      },

      disableReminder: async () => {
        await cancelDailyReminder()
        set({ enabled: false, notificationId: null })
      },

      // ── Micro-reminder defaults ──────────────────────────────
      microEnabled: false,
      microStartHour: 8,       // 8:00 AM
      microEndHour: 20,        // 8:00 PM
      microIntervalHours: 2,
      microNotificationIds: [],

      setMicroReminders: async (startHour, endHour, intervalHours) => {
        const ids = await scheduleMicroReminders(startHour, endHour, intervalHours)
        if (ids.length > 0) {
          set({
            microEnabled: true,
            microStartHour: startHour,
            microEndHour: endHour,
            microIntervalHours: intervalHours,
            microNotificationIds: ids,
          })
        }
      },

      disableMicroReminders: async () => {
        const { microNotificationIds } = get()
        await cancelMicroReminders(microNotificationIds)
        set({ microEnabled: false, microNotificationIds: [] })
      },
    }),
    {
      name: 'reminder',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
