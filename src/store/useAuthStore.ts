import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useCallSessionStore } from './useCallSessionStore'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  githubProfile?: string
  interestDescription?: string
  isOnline: boolean
  createdAt: Date
  lastLoginAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  signup: (userData: { name: string; email: string; password: string }) => Promise<boolean>
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  initializeAuth: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
}

let authStateSubscription: { unsubscribe: () => void } | null = null

const mapSupabaseUserToUser = (supabaseUser: SupabaseUser, profile?: any): User => {
  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
    githubProfile: profile?.github_profile || profile?.github_url || supabaseUser.user_metadata?.github_profile,
    interestDescription: profile?.interest_description || profile?.bio || supabaseUser.user_metadata?.interest_description,
    isOnline: true,
    createdAt: new Date(supabaseUser.created_at),
    lastLoginAt: new Date(),
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      initializeAuth: async () => {
        try {
          set({ isInitialized: false })
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Fetch user profile from database
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            const user = mapSupabaseUserToUser(session.user, profile)
            set({ user, isAuthenticated: true })
          }

          // Listen for auth changes
          authStateSubscription?.unsubscribe()
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              const user = mapSupabaseUserToUser(session.user, profile)
              set({ user, isAuthenticated: true })
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, isAuthenticated: false })
            }
          })
          authStateSubscription = subscription
        } catch (error) {
          console.error('Error initializing auth:', error)
        } finally {
          set({ isInitialized: true })
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null })

        try {
          // Validate input
          if (!userData.name.trim() || !userData.email.trim() || !userData.password) {
            set({ 
              isLoading: false, 
              error: 'All fields are required' 
            })
            return false
          }

          if (userData.password.length < 6) {
            set({ 
              isLoading: false, 
              error: 'Password must be at least 6 characters long' 
            })
            return false
          }

          if (!userData.email.includes('@')) {
            set({ 
              isLoading: false, 
              error: 'Please enter a valid email address' 
            })
            return false
          }

          // Sign up with Supabase
          const { data, error } = await supabase.auth.signUp({
            email: userData.email.toLowerCase().trim(),
            password: userData.password,
            options: {
              data: {
                name: userData.name.trim(),
              },
            },
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return false
          }

          if (data.user) {
            // Create profile in database
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

            if (profileError) {
              console.error('Error creating profile:', profileError)
            }

            const user = mapSupabaseUserToUser(data.user, { name: userData.name.trim() })
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          }

          set({ isLoading: false })
          return true
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to create account. Please try again.' 
          })
          return false
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email.toLowerCase().trim(),
            password: credentials.password,
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return false
          }

          if (data.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            const user = mapSupabaseUserToUser(data.user, profile)
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          }

          return true
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to login. Please try again.' 
          })
          return false
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          useCallSessionStore.getState().clearActiveCall()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        } catch (error) {
          console.error('Error signing out:', error)
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (error) {
            set({ isLoading: false, error: error.message })
            return false
          }

          set({ isLoading: false })
          return true
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to send reset email' 
          })
          return false
        }
      },

      clearError: () => {
        set({ error: null })
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return

        try {
          // Update profile in database
          const { error } = await supabase
            .from('profiles')
            .update({
              name: updates.name,
              avatar_url: updates.avatar,
              github_profile: updates.githubProfile,
              interest_description: updates.interestDescription,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (error) throw error

          const updatedUser = { ...user, ...updates }
          set({ user: updatedUser })
        } catch (error) {
          console.error('Error updating profile:', error)
        }
      },

    }),
    {
      name: 'striim-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.user = {
            ...state.user,
            createdAt: new Date(state.user.createdAt),
            lastLoginAt: new Date(state.user.lastLoginAt),
          }
        }
      },
    }
  )
)
