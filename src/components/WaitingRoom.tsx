import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import { User, Check, X, Users, AlertCircle, MessageCircle, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const WaitingRoom = () => {
  const { waitingRoom, isHost, approveAttendee, rejectAttendee, participants } = useVideoStore()
  const { user: currentUser } = useAuthStore()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
  const [waitingTime, setWaitingTime] = useState(0)

  useEffect(() => {
    if (!isHost) {
      const interval = setInterval(() => setWaitingTime((prev) => prev + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [isHost])

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus((prev) => (prev === 'connected' ? 'connecting' : 'connected'))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatWaitingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleApprove = (userId: string, userName: string) => {
    approveAttendee(userId)
    toast.success(`${userName} has been approved to join the meeting`)
  }

  const handleReject = (userId: string, userName: string) => {
    rejectAttendee(userId)
    toast.success(`${userName} has been rejected`)
  }

  if (!isHost) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-xl space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Waiting room</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The host needs to approve your request.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {connectionStatus === 'disconnected' ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4" />}
                {connectionStatus}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name || 'Guest user'}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{currentUser?.email || 'Guest access'}</p>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  <div>Waiting</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formatWaitingTime(waitingTime)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Approval is required before you can enter the meeting.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>You’ll join automatically once the host approves your request.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{participants.length} in meeting</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Meeting is live</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Waiting room</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Approve or reject attendees</p>
        </div>
        <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {waitingRoom.length}
        </span>
      </div>

      {waitingRoom.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
          <Users className="mx-auto mb-2 h-5 w-5 text-gray-400" />
          <p className="text-sm text-gray-700 dark:text-gray-300">No one is waiting</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">New join requests will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {waitingRoom.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(user.id, user.name)}
                    className="rounded-lg border border-gray-900 bg-gray-900 p-2 text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReject(user.id, user.name)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/40"
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
            <button
              onClick={() => waitingRoom.forEach((user) => handleApprove(user.id, user.name))}
              className="rounded-xl border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-gray-900"
            >
              Approve all
            </button>
            <button
              onClick={() => waitingRoom.forEach((user) => handleReject(user.id, user.name))}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
            >
              Reject all
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default WaitingRoom
