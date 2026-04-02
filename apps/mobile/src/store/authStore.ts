import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthStore {
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null

  // Actions
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  loading: false,
  error: null,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  clearError: () => set({ error: null }),

  signUp: async (email, password, username) => {
    if (!isSupabaseConfigured) { set({ error: 'Supabase not configured.' }); return }
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, language_code: 'en' },
      },
    })
    if (error) {
      set({ loading: false, error: error.message })
    } else {
      set({ loading: false })
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) { set({ error: 'Supabase not configured.' }); return }
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ loading: false, error: error.message })
    } else {
      set({ loading: false, session: data.session, user: data.user })
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    await supabase.auth.signOut()
    set({ loading: false, session: null, user: null })
  },
}))
