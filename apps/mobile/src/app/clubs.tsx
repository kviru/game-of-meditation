import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, FlatList,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { theme } from '@/theme'

interface Club {
  id: string
  name: string
  description: string | null
  language_code: string
  is_public: boolean
  member_count: number
  total_minutes: number
  avatar_url: string | null
}

interface ClubMembership {
  club_id: string
}

function ClubCard({
  club,
  isMember,
  onPress,
}: {
  club: Club
  isMember: boolean
  onPress: () => void
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardAvatar}>{club.avatar_url ?? '🧘'}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{club.name}</Text>
          {club.description && (
            <Text style={styles.cardDesc} numberOfLines={1}>{club.description}</Text>
          )}
          <View style={styles.cardStats}>
            <Text style={styles.cardStat}>👥 {club.member_count}</Text>
            <Text style={styles.cardStat}>⏱ {club.total_minutes}m</Text>
            <Text style={styles.cardStat}>🌐 {club.language_code.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      {isMember && (
        <View style={styles.memberBadge}>
          <Text style={styles.memberBadgeText}>Joined</Text>
        </View>
      )}
    </Pressable>
  )
}

export default function ClubsScreen() {
  const insets = useSafeAreaInsets()
  const user   = useAuthStore((s) => s.user)

  const [clubs,       setClubs]       = useState<Club[]>([])
  const [memberships, setMemberships] = useState<Set<string>>(new Set())
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [error,       setError]       = useState<string | null>(null)

  const fetchClubs = useCallback(async () => {
    setError(null)
    const { data, error: err } = await supabase
      .from('clubs')
      .select('id, name, description, language_code, is_public, member_count, total_minutes, avatar_url')
      .eq('is_public', true)
      .order('member_count', { ascending: false })
      .limit(50)

    if (err) {
      setError('Could not load clubs. Check your connection.')
    } else {
      setClubs(data ?? [])
    }
  }, [])

  const fetchMemberships = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', user.id)

    if (data) {
      setMemberships(new Set(data.map((m: ClubMembership) => m.club_id)))
    }
  }, [user])

  const load = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchClubs(), fetchMemberships()])
    setLoading(false)
  }, [fetchClubs, fetchMemberships])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchClubs(), fetchMemberships()])
    setRefreshing(false)
  }, [fetchClubs, fetchMemberships])

  useEffect(() => { load() }, [load])

  const filtered = clubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Clubs</Text>
        {user && (
          <Pressable onPress={() => router.push('/clubs/create')} hitSlop={12}>
            <Text style={styles.createText}>+ Create</Text>
          </Pressable>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs…"
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Not signed in notice */}
      {!user && (
        <Pressable style={styles.authNotice} onPress={() => router.push('/auth')}>
          <Text style={styles.authNoticeText}>
            Sign in to join clubs and build your sangha. →
          </Text>
        </Pressable>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <ClubCard
              club={item}
              isMember={memberships.has(item.id)}
              onPress={() => router.push({ pathname: '/clubs/[id]', params: { id: item.id } })}
            />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyText}>
                {search ? 'No clubs match your search.' : 'No clubs yet. Be the first!'}
              </Text>
            </View>
          }
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    width: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  createText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  searchRow: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  authNotice: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authNoticeText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 4,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardAvatar: {
    fontSize: 32,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  cardStat: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  memberBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  memberBadgeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  retryText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
})
