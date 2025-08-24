import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import { User, Check, X, Clock, Users, AlertCircle, MessageCircle, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const WaitingRoom = () => {
  const { waitingRoom, isHost, approveAttendee, rejectAttendee, participants } = useVideoStore()
  const { user: currentUser } = useAuthStore()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
  const [waitingTime, setWaitingTime] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Mobile-optimized container */}
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 py-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Clock className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Waiting Room</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">You're in the queue</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {connectionStatus === 'connected' ? (
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                  </div>
                ) : connectionStatus === 'connecting' ? (
                  <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-5 h-5 text-yellow-500" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">Connecting</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Scrollable Content */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
            }}
          >
            {/* User Status Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white">{currentUser?.name}</h2>
                    <p className="text-blue-100 text-sm">{currentUser?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Waiting: {formatWaitingTime(waitingTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Information Cards */}
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      Approval Required
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                      The host has been notified of your request to join. Please wait for approval.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      What happens next?
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      You'll automatically join the meeting once the host approves your request.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Meeting Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {participants.length} {participants.length === 1 ? 'participant' : 'participants'} in meeting
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Meeting is live</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">LIVE</span>
                </div>
              </div>
            </motion.div>

            {/* Spacer for bottom padding */}
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Clock className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting Room</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage attendees</p>
            </div>
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
            <div 
              className="space-y-3 max-h-64 overflow-y-auto"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}
            >
              <AnimatePresence>
                {waitingRoom.map((user, index) => (
                  <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <motion.div 
                        whileHover={{ rotate: 10 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                      >
                        <User className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleApprove(user.id, user.name)}
                        className="p-2.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 rounded-full transition-all duration-200 shadow-lg"
                        title="Approve"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReject(user.id, user.name)}
                        className="p-2.5 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-full transition-all duration-200 shadow-lg"
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
