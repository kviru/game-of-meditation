import { useState, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, TextInput,
  FlatList, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, runOnJS,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboardingStore, LANGUAGES } from '@/store/onboardingStore'
import { BreathingCircle } from '@/components/BreathingCircle'
import { theme } from '@/theme'

type Step = 'welcome' | 'name' | 'language' | 'breath' | 'ready'
const STEPS: Step[] = ['welcome', 'name', 'language', 'breath', 'ready']

// ─── Shared animated transition ──────────────────────────────

function useStepTransition() {
  const opacity    = useSharedValue(1)
  const translateY = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  const transition = useCallback((next: () => void) => {
    opacity.value    = withTiming(0,  { duration: 220 })
    translateY.value = withTiming(-16, { duration: 220 }, () => {
      runOnJS(next)()
      translateY.value = 16
      opacity.value    = withTiming(1,  { duration: 280 })
      translateY.value = withSpring(0, { damping: 18 })
    })
  }, [])

  return { animatedStyle, transition }
}

// ─── Step 1: Welcome ─────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.step, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.welcomeHero}>
        <Text style={styles.welcomeEmoji}>🧘</Text>
        <Text style={styles.welcomeTitle}>Game of{'\n'}Meditation</Text>
        <Text style={styles.welcomeTagline}>
          The world's most thrilling{'\n'}and peaceful game.
        </Text>
      </View>
      <View style={styles.welcomeBottom}>
        <Text style={styles.welcomeQuote}>
          "Your only competitor is yesterday's you."
        </Text>
        <Pressable style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.primaryButtonText}>Begin your journey</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Step 2: Name ─────────────────────────────────────────────

function NameStep({ onNext }: { onNext: () => void }) {
  const insets   = useSafeAreaInsets()
  const name     = useOnboardingStore((s) => s.name)
  const setName  = useOnboardingStore((s) => s.setName)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.step, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.stepContent}>
          <Text style={styles.stepLabel}>Step 1 of 3</Text>
          <Text style={styles.stepTitle}>What shall we call you?</Text>
          <Text style={styles.stepHint}>
            Just your first name. This stays on your device.
          </Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => { Keyboard.dismiss(); onNext() }}
            maxLength={32}
          />
        </View>
        <View style={styles.stepActions}>
          <Pressable style={styles.primaryButton} onPress={() => { Keyboard.dismiss(); onNext() }}>
            <Text style={styles.primaryButtonText}>
              {name.trim() ? `Continue, ${name.trim()}` : 'Continue'}
            </Text>
          </Pressable>
          <Pressable onPress={() => { setName(''); Keyboard.dismiss(); onNext() }}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

// ─── Step 3: Language ────────────────────────────────────────

function LanguageStep({ onNext }: { onNext: () => void }) {
  const insets      = useSafeAreaInsets()
  const selected    = useOnboardingStore((s) => s.languageCode)
  const setLanguage = useOnboardingStore((s) => s.setLanguage)

  return (
    <View style={[styles.step, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.stepContent}>
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.stepTitle}>Choose your language</Text>
        <Text style={styles.stepHint}>
          Peace speaks every tongue.
        </Text>
      </View>

      <FlatList
        data={LANGUAGES}
        keyExtractor={(l) => l.code}
        style={styles.langList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = item.code === selected
          return (
            <Pressable
              style={[styles.langRow, active && styles.langRowActive]}
              onPress={() => setLanguage(item.code)}
            >
              <Text style={styles.langFlag}>{item.flag}</Text>
              <View style={styles.langText}>
                <Text style={[styles.langLabel, active && styles.langLabelActive]}>
                  {item.label}
                </Text>
                {item.label !== item.english && (
                  <Text style={styles.langEnglish}>{item.english}</Text>
                )}
              </View>
              {active && <Text style={styles.langCheck}>✓</Text>}
            </Pressable>
          )
        }}
      />

      <View style={[styles.stepActions, { paddingTop: 12 }]}>
        <Pressable style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Step 4: First breath ─────────────────────────────────────

function BreathStep({ onNext }: { onNext: () => void }) {
  const insets    = useSafeAreaInsets()
  const [started, setStarted] = useState(false)
  const [done,    setDone]    = useState(false)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countRef  = useRef(0)
  const [count,   setCount]   = useState(0)

  const handleStart = useCallback(() => {
    setStarted(true)
    countRef.current = 0
    timerRef.current = setInterval(() => {
      countRef.current += 1
      setCount(countRef.current)
      if (countRef.current >= 10) {
        clearInterval(timerRef.current!)
        setDone(true)
      }
    }, 1000)
  }, [])

  return (
    <View style={[styles.step, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.stepContent}>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.stepTitle}>
          {done ? 'You did it. 🌱' : 'Your first breath'}
        </Text>
        <Text style={styles.stepHint}>
          {done
            ? "That's all it takes. Every session starts with one breath."
            : 'Sit still for 10 seconds. That is brave.'}
        </Text>
      </View>

      <View style={styles.breathVisual}>
        <BreathingCircle isRunning={started && !done} isPaused={false} size={200} />
        {started && !done && (
          <Text style={styles.breathCount}>{count}</Text>
        )}
        {done && <Text style={styles.breathDone}>✦</Text>}
      </View>

      <View style={styles.stepActions}>
        {!started && (
          <Pressable style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Begin — 10 seconds</Text>
          </Pressable>
        )}
        {started && !done && (
          <View style={[styles.primaryButton, styles.primaryButtonMuted]}>
            <Text style={styles.primaryButtonText}>Breathe…</Text>
          </View>
        )}
        {done && (
          <Pressable style={styles.primaryButton} onPress={onNext}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        )}
        {!done && (
          <Pressable onPress={onNext}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

// ─── Step 5: Ready ───────────────────────────────────────────

function ReadyStep({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets()
  const name   = useOnboardingStore((s) => s.name)
  const greeting = name.trim() ? `You're ready, ${name.trim()}.` : "You're ready."

  return (
    <View style={[styles.step, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.readyContent}>
        <Text style={styles.readyEmoji}>🌱</Text>
        <Text style={styles.readyTitle}>{greeting}</Text>
        <Text style={styles.readyLevel}>You begin as a Seed.</Text>
        <Text style={styles.readyDesc}>
          With every breath, you grow.{'\n'}
          There is no rush. There is no failure.{'\n'}
          Only the next session.
        </Text>

        <View style={styles.readyStats}>
          <View style={styles.readyStat}>
            <Text style={styles.readyStatValue}>10s</Text>
            <Text style={styles.readyStatLabel}>minimum session</Text>
          </View>
          <View style={styles.readyStatDivider} />
          <View style={styles.readyStat}>
            <Text style={styles.readyStatValue}>∞</Text>
            <Text style={styles.readyStatLabel}>no maximum</Text>
          </View>
          <View style={styles.readyStatDivider} />
          <View style={styles.readyStat}>
            <Text style={styles.readyStatValue}>9</Text>
            <Text style={styles.readyStatLabel}>levels ahead</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={onDone}>
        <Text style={styles.primaryButtonText}>Let's play</Text>
      </Pressable>
    </View>
  )
}

// ─── Root onboarding navigator ────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('welcome')
  const { animatedStyle, transition } = useStepTransition()
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding)

  const goTo = useCallback((next: Step) => {
    transition(() => setStep(next))
  }, [transition])

  const handleDone = useCallback(() => {
    transition(() => {
      completeOnboarding()
      router.replace('/')
    })
  }, [transition, completeOnboarding])

  return (
    <View style={styles.container}>
      {/* Step dots */}
      {step !== 'welcome' && step !== 'ready' && (
        <View style={styles.dots}>
          {(['name', 'language', 'breath'] as Step[]).map((s) => (
            <View
              key={s}
              style={[styles.dot, step === s && styles.dotActive]}
            />
          ))}
        </View>
      )}

      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {step === 'welcome'  && <WelcomeStep  onNext={() => goTo('name')} />}
        {step === 'name'     && <NameStep     onNext={() => goTo('language')} />}
        {step === 'language' && <LanguageStep onNext={() => goTo('breath')} />}
        {step === 'breath'   && <BreathStep   onNext={() => goTo('ready')} />}
        {step === 'ready'    && <ReadyStep    onDone={handleDone} />}
      </Animated.View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 18,
  },

  // Common step layout
  step: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  stepContent: {
    gap: 10,
  },
  stepLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 40,
  },
  stepHint: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginTop: 4,
  },
  stepActions: {
    gap: 14,
  },

  // Welcome
  welcomeHero: {
    gap: 20,
    alignItems: 'flex-start',
  },
  welcomeEmoji: {
    fontSize: 56,
  },
  welcomeTitle: {
    fontSize: 44,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 52,
  },
  welcomeTagline: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    lineHeight: 28,
  },
  welcomeBottom: {
    gap: 20,
  },
  welcomeQuote: {
    fontSize: 15,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primary,
    paddingLeft: 14,
  },

  // Name input
  nameInput: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingBottom: 8,
  },

  // Language list
  langList: {
    flex: 1,
    marginTop: 16,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.radii.md,
    gap: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langRowActive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
  },
  langFlag: {
    fontSize: 24,
  },
  langText: {
    flex: 1,
    gap: 2,
  },
  langLabel: {
    fontSize: 17,
    color: theme.colors.textSecondary,
  },
  langLabelActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  langEnglish: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  langCheck: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  // Breath step
  breathVisual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  breathCount: {
    fontSize: 48,
    fontWeight: '200',
    color: theme.colors.textSecondary,
  },
  breathDone: {
    fontSize: 40,
    color: theme.colors.gold,
  },

  // Ready step
  readyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  readyEmoji: {
    fontSize: 64,
  },
  readyTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  readyLevel: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  readyDesc: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  readyStats: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginTop: 8,
    width: '100%',
  },
  readyStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  readyStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  readyStatLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  readyStatDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },

  // Shared buttons
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  primaryButtonMuted: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipText: {
    textAlign: 'center',
    fontSize: 15,
    color: theme.colors.textMuted,
    paddingVertical: 8,
  },
})
