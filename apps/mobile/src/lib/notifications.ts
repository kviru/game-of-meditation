/**
 * Notification helpers for Game of Meditation.
 * Handles permission requests, scheduling daily reminders,
 * and cancelling them.
 */
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// How notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

/** Request notification permissions. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false   // simulators can't receive push

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'

}

/** Schedule a daily local reminder at the given hour + minute (24h). */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  const granted = await requestNotificationPermission()
  if (!granted) return null

  // Cancel any existing daily reminder before scheduling a new one
  await cancelDailyReminder()

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to breathe. 🧘',
      body: "Your only competitor is yesterday's you.",
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })

  return id
}

/** Cancel all scheduled daily reminders. */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/** Get all currently scheduled notifications (for display in settings). */
export async function getScheduledReminders() {
  return Notifications.getAllScheduledNotificationsAsync()
}

// Android notification channels
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('reminders', {
    name: 'Daily Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4CAF50',
  })

  Notifications.setNotificationChannelAsync('micro-reminders', {
    name: 'Micro-Meditation Nudges',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 400, 200, 400],   // two gentle pulses
    lightColor: '#4CAF50',
    sound: null,   // vibration only
  })
}

// ─── Micro-Meditation Reminders ───────────────────────────────
// Schedules silent vibration nudges at regular intervals
// between a morning start time and evening end time.

const MICRO_TAG = 'micro-meditation'

/**
 * Schedule vibration nudges every `intervalHours` hours
 * from `startHour` to `endHour` (inclusive), daily.
 * Returns array of notification IDs.
 */
export async function scheduleMicroReminders(
  startHour: number,
  endHour: number,
  intervalHours: number,
): Promise<string[]> {
  const granted = await requestNotificationPermission()
  if (!granted) return []

  // Cancel existing micro reminders first
  await cancelMicroReminders()

  const ids: string[] = []

  for (let h = startHour; h <= endHour; h += intervalHours) {
    const hour = Math.floor(h)
    const minute = Math.round((h - hour) * 60)

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '✨ Uplift your vibrations',
        body: 'One minute of meditation — close your eyes, breathe, return.',
        sound: false,
        data: { type: MICRO_TAG },
        // Android: vibrate only via channel, no sound
        ...(Platform.OS === 'android' ? { channelId: 'micro-reminders' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })
    ids.push(id)
  }

  return ids
}

/** Cancel all micro-meditation reminders by ID list. */
export async function cancelMicroReminders(ids?: string[]): Promise<void> {
  if (ids && ids.length > 0) {
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)))
  } else {
    // Fallback: cancel all and let daily reminder re-schedule itself
    const all = await Notifications.getAllScheduledNotificationsAsync()
    const microIds = all
      .filter((n) => n.content.data?.type === MICRO_TAG)
      .map((n) => n.identifier)
    await Promise.all(microIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)))
  }
}
