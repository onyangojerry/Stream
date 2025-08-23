import { motion, AnimatePresence } from 'framer-motion'
import { Video, Users, Presentation, Play, X } from 'lucide-react'

interface MeetingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  meetingType: 'video' | 'group' | 'webinar'
}

const MeetingConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  meetingType 
}: MeetingConfirmationModalProps) => {
  const getMeetingInfo = () => {
    switch (meetingType) {
      case 'video':
        return {
          title: 'Start One-on-One Call',
          description: 'Begin a private video call with another person',
          icon: Video,
          color: 'blue',
          features: ['Private conversation', 'Screen sharing', 'Chat & transcription']
        }
      case 'group':
        return {
          title: 'Start Group Call',
          description: 'Host a group video call with multiple participants',
          icon: Users,
          color: 'green',
          features: ['Multiple participants', 'Breakout rooms', 'Host controls', 'Screen sharing']
        }
      case 'webinar':
        return {
          title: 'Start Webinar',
          description: 'Host a webinar with presenter and attendees',
          icon: Presentation,
          color: 'purple',
          features: ['Presenter mode', 'Attendee management', 'Polls & Q&A', 'Recording']
        }
    }
  }

  const meetingInfo = getMeetingInfo()
  const Icon = meetingInfo.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${meetingInfo.color}-100 dark:bg-${meetingInfo.color}-900/20 rounded-full flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${meetingInfo.color}-600 dark:text-${meetingInfo.color}-400`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {meetingInfo.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {meetingInfo.description}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Meeting Features:
                </h3>
                <ul className="space-y-2">
                  {meetingInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mt-0.5">
                    <Play className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      You'll be the host
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      As the host, you can control who joins, manage participants, and end the meeting when needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2 bg-${meetingInfo.color}-600 hover:bg-${meetingInfo.color}-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2`}
                >
                  <Play className="w-4 h-4" />
                  <span>Start Meeting</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default MeetingConfirmationModal
