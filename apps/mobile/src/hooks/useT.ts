import { useOnboardingStore } from '@/store/onboardingStore'
import { getStrings } from '@/lib/translations'

/** Returns translated strings for the user's chosen language. */
export function useT() {
  const languageCode = useOnboardingStore((s) => s.languageCode)
  return getStrings(languageCode)
}
