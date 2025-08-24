import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import { Bell, User, Settings, TestTube } from 'lucide-react'
import { motion } from 'framer-motion'
import { playNotificationSound, showBrowserNotification } from '../utils/notifications'
import toast from 'react-hot-toast'

const NotificationDebug = () => {
  const { user: currentUser } = useAuthStore()
  const { 
    isHost, 
    setHostStatus, 
    waitingRoom, 
    showWaitingRoomNotification, 
    addToWaitingRoom,
    dismissWaitingRoomNotification 
  } = useVideoStore()

  const testNotification = () => {
    playNotificationSound()
    showBrowserNotification(
      'Test Notification',
      {
        body: 'This is a test notification from Striim',
        icon: '/favicon.ico',
        tag: 'test-notification'
      }
    )
    toast.success('Test notification sent!')
  }

  const testWaitingRoomNotification = () => {
    if (currentUser) {
      addToWaitingRoom({
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'test@example.com',
        isOnline: true,
        createdAt: new Date(),
        lastLoginAt: new Date()
      })
      toast.success('Test user added to waiting room!')
    }
  }

  const toggleHostStatus = () => {
    setHostStatus(!isHost)
    toast.success(`Host status: ${!isHost ? 'Enabled' : 'Disabled'}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center space-x-2 mb-4">
        <TestTube className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Debug</h3>
      </div>

      <div className="space-y-4">
        {/* Current Status */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-gray-600 dark:text-gray-300">
                User: {currentUser?.name || 'Not logged in'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className={`font-medium ${isHost ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
                Host Status: {isHost ? 'Host' : 'Attendee'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="text-gray-600 dark:text-gray-300">
                Waiting Room: {waitingRoom.length} users
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-300">
                Notification Shown: {showWaitingRoomNotification ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="space-y-2">
          <button
            onClick={toggleHostStatus}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Toggle Host Status
          </button>
          
          <button
            onClick={testNotification}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Test Browser Notification
          </button>
          
          <button
            onClick={testWaitingRoomNotification}
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Test User to Waiting Room
          </button>
          
          {showWaitingRoomNotification && (
            <button
              onClick={dismissWaitingRoomNotification}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Dismiss Notification
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Testing Instructions</h4>
          <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>1. Set yourself as host</li>
            <li>2. Open another browser/incognito</li>
            <li>3. Join the meeting with ?join=true</li>
            <li>4. Check for notifications</li>
          </ol>
        </div>
      </div>
    </motion.div>
  )
}

export default NotificationDebug
