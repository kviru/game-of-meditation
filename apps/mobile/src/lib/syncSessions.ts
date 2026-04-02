/**
 * Syncs locally-stored meditation sessions to Supabase after sign-in.
 * Runs once per auth event — idempotent (duplicate ids are ignored via ON CONFLICT).
 */
import { supabase } from '@/lib/supabase'
import { useSessionStore } from '@/store/sessionStore'

export async function syncLocalSessionsToCloud(userId: string): Promise<void> {
  const sessions = useSessionStore.getState().completedSessions
  if (sessions.length === 0) return

  const rows = sessions.map((s) => ({
    id:               s.id,
    user_id:          userId,
    duration_seconds: s.durationSeconds,
    status:           'completed' as const,
    mss_delta:        s.mssDelta,
    created_at:       s.completedAt,
  }))

  // Insert all local sessions — ignore conflicts (already synced on a previous login)
  const { error } = await supabase
    .from('sessions')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

  if (error) {
    console.warn('[syncSessions] Failed to sync local sessions:', error.message)
  }
}
