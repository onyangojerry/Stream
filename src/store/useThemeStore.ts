import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  const systemTheme = getSystemTheme()
  const resolvedTheme = theme === 'system' ? systemTheme : theme
  
  if (resolvedTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  
  return resolvedTheme === 'dark'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDark: false,
      
      setTheme: (theme: Theme) => {
        const isDark = applyTheme(theme)
        set({ theme, isDark })
      },
      
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        const isDark = applyTheme(newTheme)
        set({ theme: newTheme, isDark })
      },
    }),
    {
      name: 'striim-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on hydration
          const isDark = applyTheme(state.theme)
          state.isDark = isDark
        }
      },
    }
  )
)

// Initialize theme on module load
if (typeof window !== 'undefined') {
  const store = useThemeStore.getState()
  applyTheme(store.theme)
  
  // Listen to system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState()
    if (theme === 'system') {
      const isDark = applyTheme('system')
      useThemeStore.setState({ isDark })
    }
  })
}
