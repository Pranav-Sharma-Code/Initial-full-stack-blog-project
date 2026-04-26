// =============================================
// DATABASE TYPE DEFINITIONS
// Shaped to match Supabase CLI auto-generated format
// for @supabase/supabase-js v2.104+
// =============================================

export type UserRole = 'viewer' | 'author' | 'admin'

// ── App-level types (used in components / pages) ──────────────────

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  body: string
  image_url: string | null
  summary: string | null
  author_id: string
  published: boolean
  created_at: string
  updated_at: string
  // Optional joined relation — only present when you .select('*, profiles(*)')
  profiles?: Profile | null
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  comment_text: string
  created_at: string
  // Optional joined relation
  profiles?: Profile | null
}

// =============================================
// SUPABASE DATABASE GENERIC
// Must match Supabase CLI output format exactly.
// Row types contain ONLY actual DB columns (no joined relations).
// =============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: UserRole
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          body: string
          image_url: string | null
          summary: string | null
          author_id: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          body: string
          image_url?: string | null
          summary?: string | null
          author_id: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          body?: string
          image_url?: string | null
          summary?: string | null
          author_id?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          comment_text: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          comment_text: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          comment_text?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
    CompositeTypes: Record<string, never>
  }
}

// =============================================
// API / FORM TYPES
// =============================================

export interface AuthFormState {
  error: string | null
  success: string | null
}
