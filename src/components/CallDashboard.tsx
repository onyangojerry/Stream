import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  LogOut,
  MoreVertical,
  Presentation,
  Settings,
  User,
  Users,
  Video,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'
import RecordingControls from './RecordingControls'

interface CallDashboardProps {
  roomId: string
  callType: 'one-on-one' | 'group' | 'webinar'
  onStartCall: () => void
}

const CallDashboard = ({ roomId, callType, onStartCall }: CallDashboardProps) => {
  const navigate = useNavigate()
  const { user: currentUser, logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showStartConfirmation, setShowStartConfirmation] = useState(false)

  const callInfo = {
    'one-on-one': {
      title: 'One-on-one call',
      description: 'Private meeting room',
      icon: Video,
    },
    group: {
      title: 'Group call',
      description: 'Collaborative meeting room',
      icon: Users,
    },
    webinar: {
      title: 'Webinar',
      description: 'Presenter-led session',
      icon: Presentation,
    },
  }[callType]

  const Icon = callInfo.icon

  const handleConfirmStart = () => {
    setShowStartConfirmation(false)
    onStartCall()
    toast.success(`${callInfo.title} started`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Signed out')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{callInfo.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Room {roomId}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setShowStartConfirmation(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Video className="h-4 w-4" />
                    Start call
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      navigate('/scheduler')
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Calendar className="h-4 w-4" />
                    Scheduler
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      navigate('/scheduler')
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                    Meeting settings
                  </button>
                  <div className="my-1 border-t border-gray-200 dark:border-gray-800" />
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                Ready when you are
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Start the room, share the link, and manage recording before participants join.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 sm:block">
              {callInfo.description}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                Room
              </p>
              <p className="mt-2 break-all text-sm font-medium text-gray-900 dark:text-white">{roomId}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                Account
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span>{currentUser?.name || 'Guest'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Recording</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Optional screen recording before or during the call.</p>
              </div>
            </div>
            <RecordingControls meetingId={roomId} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setShowStartConfirmation(true)}
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Start {callInfo.title}
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStartConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowStartConfirmation(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Start this room now?</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                You can invite participants after the room starts by sharing the meeting link.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowStartConfirmation(false)}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStart}
                  className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Start
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CallDashboard
