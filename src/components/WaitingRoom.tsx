import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import { User, Check, X, Clock, Users, AlertCircle, MessageCircle, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const WaitingRoom = () => {
  const { waitingRoom, isHost, approveAttendee, rejectAttendee, participants } = useVideoStore()
  const { user: currentUser } = useAuthStore()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
  const [waitingTime, setWaitingTime] = useState(0)

  // Track waiting time for non-host users
  useEffect(() => {
    if (!isHost) {
      const interval = setInterval(() => {
        setWaitingTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isHost])

  // Simulate connection status for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(prev => {
        const statuses: ('connected' | 'connecting' | 'disconnected')[] = ['connected', 'connecting']
        const currentIndex = statuses.indexOf(prev)
        return statuses[(currentIndex + 1) % statuses.length]
      })
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6">
          {/* Header with status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Clock className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Waiting Room</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">You're in the queue</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : connectionStatus === 'connecting' ? (
                <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Wifi className="w-5 h-5 text-yellow-500" />
                </motion.div>
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          
          {/* Status Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{currentUser?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">Waiting time: {formatWaitingTime(waitingTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">Connected</span>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Approval Required</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  The host has been notified of your request to join. Please wait for approval.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">What happens next?</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll automatically join the meeting once the host approves your request.
                </p>
              </div>
            </div>
          </div>

          {/* Meeting Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{participants.length} {participants.length === 1 ? 'participant' : 'participants'} in meeting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Clock className="w-5 h-5 text-yellow-500" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting Room</h3>
          </div>
          {waitingRoom.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg"
            >
              {waitingRoom.length}
            </motion.span>
          )}
        </div>
        
        {waitingRoom.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">All clear!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              No one is waiting to join the meeting
            </p>
          </motion.div>
        ) : (
          <>
            {/* Summary with pulse animation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {waitingRoom.length} {waitingRoom.length === 1 ? 'person is' : 'people are'} waiting for approval
                </span>
              </div>
            </motion.div>
            
            {/* Attendee List with staggered animations */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {waitingRoom.map((user, index) => (
                  <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-lg hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        whileHover={{ rotate: 10 }}
                        className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <User className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleApprove(user.id, user.name)}
                        className="p-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 rounded-full transition-all duration-200 shadow-lg"
                        title="Approve"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReject(user.id, user.name)}
                        className="p-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-full transition-all duration-200 shadow-lg"
                        title="Reject"
                      >
                        <X className="w-4 h-4 text-white" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Enhanced Bulk Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
            >
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    waitingRoom.forEach(user => handleApprove(user.id, user.name))
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Approve All</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    waitingRoom.forEach(user => handleReject(user.id, user.name))
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>Reject All</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default WaitingRoom
