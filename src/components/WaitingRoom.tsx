import { useVideoStore } from '../store/useVideoStore'
import { User, Check, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const WaitingRoom = () => {
  const { waitingRoom, isHost, approveAttendee, rejectAttendee } = useVideoStore()

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
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting Room</h3>
          </div>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Waiting for host approval</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The host will be notified and can approve your request to join
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting Room</h3>
          {waitingRoom.length > 0 && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
              {waitingRoom.length}
            </span>
          )}
        </div>
        
        {waitingRoom.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">No one waiting to join</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Attendees will appear here when they try to join
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitingRoom.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApprove(user.id, user.name)}
                    className="p-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-full transition-colors"
                    title="Approve"
                  >
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={() => handleReject(user.id, user.name)}
                    className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-full transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WaitingRoom
