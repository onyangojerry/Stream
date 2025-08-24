import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { 
  MoreVertical, 
  User, 
  MessageCircle, 
  Video, 
  Users, 
  Presentation,
  Settings,
  LogOut,
  Send,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface CallDashboardProps {
  roomId: string
  callType: 'one-on-one' | 'group' | 'webinar'
  onStartCall: () => void
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  isPrivate: boolean
  recipientId?: string
}

const CallDashboard = ({ roomId, callType, onStartCall }: CallDashboardProps) => {
  const navigate = useNavigate()
  const { user: currentUser, logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showStartConfirmation, setShowStartConfirmation] = useState(false)
  const [chatType, setChatType] = useState<'group' | 'private'>('group')
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Mock attendees for demo
  const attendees = [
    { id: '1', name: 'John Doe', role: 'host' },
    { id: '2', name: 'Jane Smith', role: 'attendee' },
    { id: '3', name: 'Bob Johnson', role: 'attendee' },
  ]

  const getCallTypeInfo = () => {
    switch (callType) {
      case 'one-on-one':
        return {
          title: 'One-on-One Call',
          icon: Video,
          color: 'from-blue-500 to-blue-600',
          description: 'Private video call with one person'
        }
      case 'group':
        return {
          title: 'Group Call',
          icon: Users,
          color: 'from-green-500 to-green-600',
          description: 'Meeting with multiple participants'
        }
      case 'webinar':
        return {
          title: 'Webinar',
          icon: Presentation,
          color: 'from-purple-500 to-purple-600',
          description: 'Present to a large audience'
        }
    }
  }

  const callInfo = getCallTypeInfo()
  const Icon = callInfo.icon

  const handleStartCall = () => {
    setShowStartConfirmation(true)
  }

  const handleConfirmStart = () => {
    setShowStartConfirmation(false)
    onStartCall()
    toast.success(`${callInfo.title} started!`)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date(),
      isPrivate: chatType === 'private',
      recipientId: chatType === 'private' ? selectedRecipient : undefined
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    toast.success('Message sent!')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Room Info */}
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${callInfo.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {callInfo.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Room: {roomId}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Chat Button */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors ${
                  showChat 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Toggle Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentUser?.name}
                </span>
              </div>

              {/* Three Dot Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    >
                      <button
                        onClick={handleStartCall}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>Start Call</span>
                      </button>
                      <button
                        onClick={() => navigate('/scheduler')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Meeting Settings</span>
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className={`w-24 h-24 bg-gradient-to-r ${callInfo.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <Icon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {callInfo.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {callInfo.description}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Room ID: {roomId}</span>
                    <span>•</span>
                    <span>Ready to start</span>
                  </div>
                  <button
                    onClick={handleStartCall}
                    className={`px-8 py-3 bg-gradient-to-r ${callInfo.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    Start {callInfo.title}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96 flex flex-col"
                >
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
                      <button
                        onClick={() => setShowChat(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    
                    {/* Chat Type Selector */}
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => setChatType('group')}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          chatType === 'group'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        Group
                      </button>
                      <button
                        onClick={() => setChatType('private')}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          chatType === 'private'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        Private
                      </button>
                    </div>

                    {/* Private Chat Recipient Selector */}
                    {chatType === 'private' && (
                      <div className="mt-3">
                        <select
                          value={selectedRecipient}
                          onChange={(e) => setSelectedRecipient(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select recipient...</option>
                          {attendees.map(attendee => (
                            <option key={attendee.id} value={attendee.id}>
                              {attendee.name} ({attendee.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="flex flex-col">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {message.senderName}
                            </span>
                            {message.isPrivate && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                (Private)
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={chatType === 'private' && !selectedRecipient ? "Select a recipient first..." : "Type a message..."}
                        disabled={chatType === 'private' && !selectedRecipient}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || (chatType === 'private' && !selectedRecipient)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Start Call Confirmation Modal */}
      <AnimatePresence>
        {showStartConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${callInfo.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start {callInfo.title}?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will start the call and allow others to join. Are you sure you want to proceed?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowStartConfirmation(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStart}
                    className={`flex-1 px-4 py-2 bg-gradient-to-r ${callInfo.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200`}
                  >
                    Start Call
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CallDashboard
