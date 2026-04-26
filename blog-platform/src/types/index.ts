// =============================================
// DATABASE TYPE DEFINITIONS
// Mirrors the schema.sql exactly.
// =============================================

export type UserRole = 'viewer' | 'author' | 'admin'

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
  // Joined relations (when fetched with select)
  profiles?: Profile
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  comment_text: string
  created_at: string
  // Joined relations
  profiles?: Profile
}

// =============================================
// SUPABASE DATABASE GENERIC TYPE
// Used to type the Supabase client (createServerClient<Database>)
// =============================================
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'profiles'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Post, 'id' | 'profiles'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at' | 'profiles'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Comment, 'id' | 'profiles'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
  }
}

// =============================================
// API / FORM TYPES
// =============================================

export interface AuthFormState {
  error: string | null
  success: string | null
}
