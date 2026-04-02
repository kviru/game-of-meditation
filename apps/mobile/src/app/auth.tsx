import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/authStore'
import { theme } from '@/theme'

type Mode = 'signin' | 'signup'

export default function AuthScreen() {
  const insets   = useSafeAreaInsets()
  const signIn   = useAuthStore((s) => s.signIn)
  const signUp   = useAuthStore((s) => s.signUp)
  const loading  = useAuthStore((s) => s.loading)
  const error    = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [mode,     setMode]     = useState<Mode>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const switchMode = useCallback((next: Mode) => {
    clearError()
    setMode(next)
  }, [clearError])

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss()
    if (mode === 'signin') {
      await signIn(email.trim(), password)
      if (!useAuthStore.getState().error) {
        router.replace('/')
      }
    } else {
      await signUp(email.trim(), password, username.trim())
      if (!useAuthStore.getState().error) {
        // Show confirmation — Supabase sends a verification email
        router.replace({ pathname: '/auth-confirm', params: { email: email.trim() } })
      }
    }
  }, [mode, email, password, username, signIn, signUp])

  const isValid = mode === 'signin'
    ? email.trim().length > 0 && password.length >= 6
    : email.trim().length > 0 && password.length >= 6 && username.trim().length >= 2

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {mode === 'signin' ? 'Welcome back.' : 'Join the practice.'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'signin'
              ? 'Sign in to sync your journey across devices.'
              : 'Create a free account. No cards. No tricks.'}
          </Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleTab, mode === 'signin' && styles.toggleTabActive]}
            onPress={() => switchMode('signin')}
          >
            <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>
              Sign in
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleTab, mode === 'signup' && styles.toggleTabActive]}
            onPress={() => switchMode('signup')}
          >
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
              Create account
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="your_username"
                placeholderTextColor={theme.colors.textMuted}
                value={username}
                onChangeText={(v) => { clearError(); setUsername(v) }}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={(v) => { clearError(); setEmail(v) }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={(v) => { clearError(); setPassword(v) }}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={isValid ? handleSubmit : undefined}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.primaryButton, (!isValid || loading) && styles.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Text>
          )}
        </Pressable>

        <Text style={styles.legal}>
          {mode === 'signup'
            ? 'By creating an account you agree to our Terms of Service. We never sell your data.'
            : 'Your data stays yours. Always.'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: 32,
    gap: 28,
    flexGrow: 1,
  },
  header: {
    marginBottom: -12,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  titleBlock: {
    gap: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 4,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  toggleTabActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  errorBox: {
    backgroundColor: '#2d1010',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: theme.radii.md,
    padding: 14,
  },
  errorText: {
    color: '#ff6666',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  legal: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
})
