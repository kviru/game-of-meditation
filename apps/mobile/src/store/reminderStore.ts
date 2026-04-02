import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { scheduleDailyReminder, cancelDailyReminder } from '@/lib/notifications'

interface ReminderStore {
  enabled: boolean
  hour: number     // 0–23
  minute: number   // 0–59
  notificationId: string | null

  setReminder: (hour: number, minute: number) => Promise<void>
  disableReminder: () => Promise<void>
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'reminder',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
