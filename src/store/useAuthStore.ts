import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  createdAt: Date
  lastLoginAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signup: (userData: { name: string; email: string; password: string }) => Promise<boolean>
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  createDemoUser: () => Promise<void>
  initializeAuth: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
}

const mapSupabaseUserToUser = (supabaseUser: SupabaseUser, profile?: any): User => {
  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
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
      error: null,

      initializeAuth: async () => {
        try {
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
          supabase.auth.onAuthStateChange(async (event, session) => {
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
        } catch (error) {
          console.error('Error initializing auth:', error)
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

      createDemoUser: async () => {
        set({ isLoading: true })
        
        try {
          // Create a demo user without Supabase (temporary session)
          const userId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const demoUser: User = {
            id: userId,
            name: `Demo User ${Math.floor(Math.random() * 1000)}`,
            email: `demo${Math.floor(Math.random() * 10000)}@demo.com`,
            isOnline: true,
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
          
          set({ 
            user: demoUser, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
        } catch (error) {
          set({ isLoading: false, error: 'Failed to create demo user' })
        }
      },
    }),
    {
      name: 'striim-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
