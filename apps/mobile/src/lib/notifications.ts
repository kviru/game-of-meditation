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

// Android notification channel setup
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('reminders', {
    name: 'Daily Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4CAF50',
  })
}
