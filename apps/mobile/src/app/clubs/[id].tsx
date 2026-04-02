import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { theme } from '@/theme'

interface ClubDetail {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  language_code: string
  member_count: number
  total_minutes: number
  is_public: boolean
}

export default function ClubDetailScreen() {
  const insets  = useSafeAreaInsets()
  const { id }  = useLocalSearchParams<{ id: string }>()
  const user    = useAuthStore((s) => s.user)

  const [club,      setClub]      = useState<ClubDetail | null>(null)
  const [isMember,  setIsMember]  = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [joining,   setJoining]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [clubRes, memberRes] = await Promise.all([
      supabase
        .from('clubs')
        .select('id, name, description, avatar_url, language_code, member_count, total_minutes, is_public')
        .eq('id', id)
        .single(),
      user
        ? supabase
            .from('club_members')
            .select('club_id')
            .eq('club_id', id)
            .eq('user_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    if (clubRes.error) {
      setError('Could not load club details.')
    } else {
      setClub(clubRes.data)
      setIsMember(!!memberRes.data)
    }
    setLoading(false)
  }, [id, user])

  useEffect(() => { load() }, [load])

  const handleJoin = useCallback(async () => {
    if (!user) { router.push('/auth'); return }
    setJoining(true)
    const { error } = await supabase
      .from('club_members')
      .insert({ club_id: id, user_id: user.id })
    if (!error) setIsMember(true)
    setJoining(false)
  }, [id, user])

  const handleLeave = useCallback(async () => {
    if (!user) return
    setJoining(true)
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', id)
      .eq('user_id', user.id)
    if (!error) setIsMember(false)
    setJoining(false)
  }, [id, user])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error || !club ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Club not found.'}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Club hero */}
          <View style={styles.hero}>
            <Text style={styles.avatar}>{club.avatar_url ?? '🧘'}</Text>
            <Text style={styles.clubName}>{club.name}</Text>
            {club.description && (
              <Text style={styles.clubDesc}>{club.description}</Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{club.member_count}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{club.total_minutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{club.language_code.toUpperCase()}</Text>
              <Text style={styles.statLabel}>Language</Text>
            </View>
          </View>

          {/* Join / Leave */}
          {isMember ? (
            <Pressable
              style={styles.leaveButton}
              onPress={handleLeave}
              disabled={joining}
            >
              {joining
                ? <ActivityIndicator color="#ff6666" />
                : <Text style={styles.leaveButtonText}>Leave club</Text>
              }
            </Pressable>
          ) : (
            <Pressable
              style={styles.joinButton}
              onPress={handleJoin}
              disabled={joining}
            >
              {joining
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.joinButtonText}>
                    {user ? 'Join this club' : 'Sign in to join'}
                  </Text>
              }
            </Pressable>
          )}

          {isMember && (
            <Text style={styles.memberNote}>
              You're part of this sangha. 🙏
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  backLink: {
    fontSize: 15,
    color: theme.colors.primary,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  avatar: {
    fontSize: 72,
  },
  clubName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  clubDesc: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  leaveButton: {
    paddingVertical: 18,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  leaveButtonText: {
    fontSize: 16,
    color: '#ff6666',
    fontWeight: '500',
  },
  memberNote: {
    textAlign: 'center',
    fontSize: 15,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
})
