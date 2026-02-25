import { useVideoStore } from '../store/useVideoStore'
import { Users, X, Check, UserCheck, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WaitingRoomNotification = () => {
  const {
    waitingRoom,
    showWaitingRoomNotification,
    dismissWaitingRoomNotification,
    approveAttendee,
    isHost,
  } = useVideoStore()

  const handleQuickApprove = (userId: string) => {
    approveAttendee(userId)
    if (waitingRoom.length === 1) dismissWaitingRoomNotification()
  }

  const handleApproveAll = () => {
    waitingRoom.forEach((user) => approveAttendee(user.id))
    dismissWaitingRoomNotification()
  }

  if (!isHost || !showWaitingRoomNotification || waitingRoom.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="fixed right-4 top-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <Bell className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Waiting room</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {waitingRoom.length} {waitingRoom.length === 1 ? 'person is' : 'people are'} waiting to join
              </p>
            </div>
          </div>
          <button
            onClick={dismissWaitingRoomNotification}
            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {waitingRoom.slice(0, 3).map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleQuickApprove(user.id)}
                className="rounded-lg border border-gray-900 bg-gray-900 p-1.5 text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                title={`Approve ${user.name}`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {waitingRoom.length > 3 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">+{waitingRoom.length - 3} more waiting</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleApproveAll}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-gray-900"
          >
            <UserCheck className="h-4 w-4" />
            Approve all
          </button>
          <button
            onClick={dismissWaitingRoomNotification}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Review
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WaitingRoomNotification
