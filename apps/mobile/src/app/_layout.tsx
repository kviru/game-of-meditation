import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { syncLocalSessionsToCloud } from '@/lib/syncSessions'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    SplashScreen.hideAsync()

    if (!isSupabaseConfigured) return

    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' && session?.user) {
        syncLocalSessionsToCloud(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0d1f0d' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="onboarding"
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen
            name="timer"
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen
            name="session-complete"
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen
            name="history"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="feedback"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="auth"
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen
            name="auth-confirm"
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen
            name="settings"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="profile"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="clubs"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="clubs/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="guided"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="programs"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="programs/[id]"
            options={{ animation: 'slide_from_right' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
