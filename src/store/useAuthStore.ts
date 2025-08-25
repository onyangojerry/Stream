import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  logout: () => void
  clearError: () => void
  updateProfile: (updates: Partial<User>) => void
}

// Simulated user database (in a real app, this would be an API)
let users: { [key: string]: User & { password: string } } = {}

// Load users from localStorage on initialization
try {
  const savedUsers = localStorage.getItem('striim-users')
  if (savedUsers) {
    users = JSON.parse(savedUsers)
  }
} catch (error) {
  console.error('Error loading users:', error)
  users = {}
}

const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const saveUsersToStorage = () => {
  try {
    localStorage.setItem('striim-users', JSON.stringify(users))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signup: async (userData) => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Check if user already exists
          const existingUser = Object.values(users).find(
            user => user.email.toLowerCase() === userData.email.toLowerCase()
          )

          if (existingUser) {
            set({ 
              isLoading: false, 
              error: 'User with this email already exists' 
            })
            return false
          }

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

          // Create new user
          const newUser: User = {
            id: generateUserId(),
            name: userData.name.trim(),
            email: userData.email.toLowerCase().trim(),
            isOnline: true,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          }

          // Store user in "database"
          users[newUser.id] = {
            ...newUser,
            password: userData.password // In real app, this would be hashed
          }
          saveUsersToStorage()

          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return true
        } catch (error) {
          set({ 
            isLoading: false, 
            error: 'Failed to create account. Please try again.' 
          })
          return false
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Find user by email
          const user = Object.values(users).find(
            user => user.email.toLowerCase() === credentials.email.toLowerCase()
          )

          if (!user) {
            set({ 
              isLoading: false, 
              error: 'Invalid email or password' 
            })
            return false
          }

          // Check password
          if (user.password !== credentials.password) {
            set({ 
              isLoading: false, 
              error: 'Invalid email or password' 
            })
            return false
          }

          // Update last login
          const updatedUser: User = {
            ...user,
            isOnline: true,
            lastLoginAt: new Date()
          }

          users[user.id] = {
            ...users[user.id],
            isOnline: true,
            lastLoginAt: new Date()
          }
          saveUsersToStorage()

          set({
            user: updatedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return true
        } catch (error) {
          set({ 
            isLoading: false, 
            error: 'Failed to login. Please try again.' 
          })
          return false
        }
      },

      logout: () => {
        const { user } = get()
        if (user) {
          // Update user status in "database"
                  if (users[user.id]) {
          users[user.id].isOnline = false
          saveUsersToStorage()
        }
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      },

      updateProfile: (updates) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...updates }
          set({ user: updatedUser })

          // Update in "database"
          if (users[user.id]) {
            users[user.id] = { ...users[user.id], ...updates }
            saveUsersToStorage()
          }
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
