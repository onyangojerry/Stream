import { ReactNode, useState, useEffect, useRef, memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Video, Users, Presentation, Home, Calendar, LogOut, User, ChevronDown, Sun, Moon, Monitor } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuthStore } from '../store/useAuthStore'
import { requestNotificationPermission } from '../utils/notifications'
import { useThemeStore } from '../store/useThemeStore'
import { useCommunityStore } from '../store/useCommunityStore'

interface LayoutProps {
  children: ReactNode
}

const Layout = memo(({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [showMobileWorkspaceMenu, setShowMobileWorkspaceMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const workspaceMenuRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useThemeStore()
  const { upsertPublicUser, setUserActive } = useCommunityStore()

  const primaryNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Community', href: '/community', icon: Users },
  ]

  const workspaceNavigation = [
    { name: 'Scheduler', href: '/scheduler', icon: Calendar },
    { name: 'One-on-One', href: '/call/new', icon: Video },
    { name: 'Group Call', href: '/group/new', icon: Users },
    { name: 'Webinar', href: '/webinar/new', icon: Presentation },
  ]

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!user || !isAuthenticated) return

    const syncPresence = (active: boolean) => {
      upsertPublicUser({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubProfile: user.githubProfile,
        bio: user.interestDescription,
        isRegisteredUser: true,
        isActive: active && navigator.onLine,
      })
    }

    syncPresence(true)

    const heartbeat = window.setInterval(() => {
      syncPresence(true)
    }, 30000)

    const handleOnline = () => syncPresence(true)
    const handleOffline = () => setUserActive(user.id, false)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncPresence(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(heartbeat)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibility)
      setUserActive(user.id, false)
    }
  }, [user, isAuthenticated, upsertPublicUser, setUserActive])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
        setShowWorkspaceMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                  <Video className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
                <span className="text-lg font-semibold tracking-wide text-gray-900 dark:text-white hidden sm:block">STRIIM</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              {primaryNavigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {isAuthenticated && (
                <div className="relative" ref={workspaceMenuRef}>
                  <button
                    onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      workspaceNavigation.some((item) => location.pathname.startsWith(item.href.split('/:')[0] || item.href.split('/').slice(0, 2).join('/')))
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Work</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showWorkspaceMenu && (
                    <div className="absolute left-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                      {workspaceNavigation.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setShowWorkspaceMenu(false)}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right side - Theme toggle and user menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-gray-900" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                      {user.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/profile')
                          setShowUserMenu(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          logout()
                          setShowUserMenu(false)
                          navigate('/login')
                        }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                      <div className="mt-1 border-t border-gray-200 px-2 pt-2 dark:border-gray-800">
                        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                          Appearance
                        </p>
                        <div className="grid grid-cols-3 gap-1 p-1">
                          {themeOptions.map((option) => {
                            const Icon = option.icon
                            const active = theme === option.value
                            return (
                              <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={`flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors ${
                                  active
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                                title={`Switch to ${option.label.toLowerCase()} mode`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{option.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login/Signup buttons for unauthenticated users */
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
          <nav className="flex items-center justify-around py-2 px-2">
            {primaryNavigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowMobileWorkspaceMenu((prev) => !prev)}
                  className="flex flex-col items-center space-y-1 px-2.5 py-2 rounded-md text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <Video className="w-4 h-4" />
                  <span>Work</span>
                </button>
                {showMobileWorkspaceMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    {workspaceNavigation.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setShowMobileWorkspaceMenu(false)}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {children}
      </main>
    </div>
  )
})

export default Layout
