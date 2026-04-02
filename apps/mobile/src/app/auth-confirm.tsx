import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/theme'

export default function AuthConfirmScreen() {
  const insets = useSafeAreaInsets()
  const { email } = useLocalSearchParams<{ email: string }>()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.title}>Check your email.</Text>
        <Text style={styles.body}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Text style={styles.hint}>
          Click the link in that email to activate your account. Then come back and sign in.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/auth')}
        >
          <Text style={styles.primaryButtonText}>Back to sign in</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.skipText}>Continue without account</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 44,
  },
  body: {
    fontSize: 17,
    color: theme.colors.textSecondary,
    lineHeight: 26,
  },
  email: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  hint: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    paddingLeft: 14,
  },
  actions: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipText: {
    textAlign: 'center',
    fontSize: 15,
    color: theme.colors.textMuted,
    paddingVertical: 8,
  },
})
