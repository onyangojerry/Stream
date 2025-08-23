import { useVideoStore } from '../store/useVideoStore'
import { Users, X, Check, UserCheck, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WaitingRoomNotification = () => {
  const { 
    waitingRoom, 
    showWaitingRoomNotification, 
    dismissWaitingRoomNotification,
    approveAttendee,
    isHost 
  } = useVideoStore()

  const handleQuickApprove = (userId: string) => {
    approveAttendee(userId)
    if (waitingRoom.length === 1) {
      dismissWaitingRoomNotification()
    }
  }

  const handleApproveAll = () => {
    waitingRoom.forEach(user => approveAttendee(user.id))
    dismissWaitingRoomNotification()
  }

  if (!isHost || !showWaitingRoomNotification || waitingRoom.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.4 
        }}
        className="fixed top-4 right-4 z-50 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Animated header bar */}
        <motion.div 
          className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />
        
        <div className="p-5">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Bell className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  New Attendees!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {waitingRoom.length} {waitingRoom.length === 1 ? 'person wants' : 'people want'} to join
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={dismissWaitingRoomNotification}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          </div>

          {/* Enhanced Attendee List */}
          <div className="space-y-3 max-h-40 overflow-y-auto">
            <AnimatePresence>
              {waitingRoom.slice(0, 3).map((user, index) => (
                <motion.div 
                  key={user.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuickApprove(user.id)}
                    className="p-1.5 bg-green-500 hover:bg-green-600 rounded-full transition-colors shadow-md"
                    title={`Approve ${user.name}`}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {waitingRoom.length > 3 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  +{waitingRoom.length - 3} more waiting in the queue
                </p>
              </motion.div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex space-x-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApproveAll}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Approve All</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={dismissWaitingRoomNotification}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              Review
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WaitingRoomNotification
