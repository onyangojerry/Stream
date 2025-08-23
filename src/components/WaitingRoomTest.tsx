import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import { Plus, Minus } from 'lucide-react'

const WaitingRoomTest = () => {
  const { 
    waitingRoom, 
    isHost, 
    showWaitingRoomNotification,
    addToWaitingRoom, 
    removeFromWaitingRoom,
    setHostStatus,
    dismissWaitingRoomNotification 
  } = useVideoStore()
  
  const { user } = useAuthStore()

  const addTestUser = () => {
    if (user) {
      const testUser = {
        ...user,
        id: `test-${Date.now()}`,
        name: `Test User ${waitingRoom.length + 1}`,
        email: `test${waitingRoom.length + 1}@example.com`
      }
      addToWaitingRoom(testUser)
    }
  }

  const removeLastUser = () => {
    if (waitingRoom.length > 0) {
      const lastUser = waitingRoom[waitingRoom.length - 1]
      removeFromWaitingRoom(lastUser.id)
    }
  }

  const toggleHostStatus = () => {
    setHostStatus(!isHost)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Waiting Room Test
      </h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-400">Host:</span>
          <span className={`px-2 py-1 rounded text-white ${isHost ? 'bg-green-500' : 'bg-red-500'}`}>
            {isHost ? 'Yes' : 'No'}
          </span>
          <button
            onClick={toggleHostStatus}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Toggle
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-400">Notification:</span>
          <span className={`px-2 py-1 rounded text-white ${showWaitingRoomNotification ? 'bg-green-500' : 'bg-red-500'}`}>
            {showWaitingRoomNotification ? 'Shown' : 'Hidden'}
          </span>
          {showWaitingRoomNotification && (
            <button
              onClick={dismissWaitingRoomNotification}
              className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Dismiss
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-400">Waiting:</span>
          <span className="px-2 py-1 bg-yellow-500 text-white rounded">
            {waitingRoom.length}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <button
          onClick={addTestUser}
          className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
        >
          <Plus className="w-3 h-3" />
          <span>Add User</span>
        </button>
        <button
          onClick={removeLastUser}
          className="flex items-center space-x-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
        >
          <Minus className="w-3 h-3" />
          <span>Remove</span>
        </button>
      </div>
      
      {waitingRoom.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Waiting Users:</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {waitingRoom.map((user) => (
              <div key={user.id} className="text-xs text-gray-700 dark:text-gray-300">
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WaitingRoomTest
