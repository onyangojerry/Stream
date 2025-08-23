import { useVideoStore } from '../store/useVideoStore'
import { Users, X, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WaitingRoomNotification = () => {
  const { 
    waitingRoom, 
    showWaitingRoomNotification, 
    dismissWaitingRoomNotification,
    isHost 
  } = useVideoStore()

  if (!isHost || !showWaitingRoomNotification || waitingRoom.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Attendees Waiting
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {waitingRoom.length} {waitingRoom.length === 1 ? 'person' : 'people'} waiting to join
                </p>
              </div>
            </div>
            <button
              onClick={dismissWaitingRoomNotification}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Attendee List */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {waitingRoom.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
            {waitingRoom.length > 3 && (
              <div className="text-center py-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{waitingRoom.length - 3} more waiting...
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={dismissWaitingRoomNotification}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Review All
            </button>
            <button
              onClick={dismissWaitingRoomNotification}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WaitingRoomNotification
