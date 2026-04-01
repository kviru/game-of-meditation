import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Language {
  code: string
  label: string      // native name
  english: string    // english name for devs
  flag: string
}

/** Phase 1 languages from the PRD — Day One */
export const LANGUAGES: Language[] = [
  { code: 'en',  label: 'English',    english: 'English',    flag: '🌍' },
  { code: 'hi',  label: 'हिन्दी',       english: 'Hindi',      flag: '🇮🇳' },
  { code: 'es',  label: 'Español',    english: 'Spanish',    flag: '🇪🇸' },
  { code: 'ar',  label: 'العربية',     english: 'Arabic',     flag: '🇸🇦' },
  { code: 'fr',  label: 'Français',   english: 'French',     flag: '🇫🇷' },
  { code: 'pt',  label: 'Português',  english: 'Portuguese', flag: '🇧🇷' },
  { code: 'zh',  label: '中文',         english: 'Mandarin',   flag: '🇨🇳' },
  { code: 'ja',  label: '日本語',        english: 'Japanese',   flag: '🇯🇵' },
  { code: 'sw',  label: 'Kiswahili',  english: 'Swahili',    flag: '🌍' },
]

interface OnboardingStore {
  completed: boolean
  name: string
  languageCode: string

  setName: (name: string) => void
  setLanguage: (code: string) => void
  completeOnboarding: () => void
  resetOnboarding: () => void    // for testing
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      completed: false,
      name: '',
      languageCode: 'en',

      setName:     (name) => set({ name }),
      setLanguage: (code) => set({ languageCode: code }),

      completeOnboarding: () => set({ completed: true }),
      resetOnboarding:    () => set({ completed: false, name: '', languageCode: 'en' }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
