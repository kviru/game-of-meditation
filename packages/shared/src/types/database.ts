/**
 * Database type definitions — generated shape matching the Supabase schema.
 * Keep in sync with supabase/migrations/.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      sessions: {
        Row: MeditationSession
        Insert: Omit<MeditationSession, 'id' | 'created_at'>
        Update: Partial<Omit<MeditationSession, 'id' | 'user_id'>>
      }
      clubs: {
        Row: Club
        Insert: Omit<Club, 'id' | 'created_at'>
        Update: Partial<Omit<Club, 'id'>>
      }
      club_members: {
        Row: ClubMember
        Insert: Omit<ClubMember, 'joined_at'>
        Update: Partial<ClubMember>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      buddha_level: BuddhaLevel
      session_status: SessionStatus
      club_role: ClubRole
    }
  }
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type BuddhaLevel =
  | 'seed'          // Just beginning — 0 to 100 mins total
  | 'sprout'        // 100 to 500 mins
  | 'sapling'       // 500 to 1500 mins
  | 'tree'          // 1500 to 5000 mins
  | 'elder_tree'    // 5000 to 15000 mins
  | 'forest'        // 15000 to 50000 mins
  | 'mountain'      // 50000+ mins
  | 'sky'           // Special — facilitator certified
  | 'infinite'      // Master teacher

export type SessionStatus = 'completed' | 'abandoned' | 'in_progress'

export type ClubRole = 'member' | 'moderator' | 'admin'

// ─── Core entities ────────────────────────────────────────────────────────────

export interface Profile {
  id: string                      // matches auth.users.id
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  language_code: string           // e.g. 'en', 'hi', 'es'
  country_code: string | null
  buddha_level: BuddhaLevel
  mind_stability_score: number    // MSS — 0 to 1000
  total_minutes: number           // cumulative meditation time
  current_streak_days: number
  longest_streak_days: number
  is_anonymous: boolean           // anonymous participation option
  created_at: string
  updated_at: string
}

export interface MeditationSession {
  id: string
  user_id: string
  duration_seconds: number        // minimum: 10 seconds
  status: SessionStatus
  theme: string | null            // session theme program
  mss_delta: number               // change in Mind Stability Score
  notes: string | null
  biometric_data: Json | null     // optional wearable data
  created_at: string
}

export interface Club {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  language_code: string
  country_code: string | null
  is_public: boolean
  member_count: number
  total_minutes: number           // collective club minutes
  created_by: string              // profile.id
  created_at: string
}

export interface ClubMember {
  club_id: string
  user_id: string
  role: ClubRole
  joined_at: string
}
