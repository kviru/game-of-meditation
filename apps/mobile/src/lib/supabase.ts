import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '@shared/types/database'

const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL     ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing env vars — auth and cloud sync are disabled. ' +
    'Create apps/mobile/.env with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  )
}

// Use Expo SecureStore for secure token persistence on mobile
const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient<Database>(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage:           ExpoSecureStoreAdapter,
      autoRefreshToken:  true,
      persistSession:    true,
      detectSessionInUrl: false,
    },
  }
)

/** True only when real Supabase credentials are configured. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
