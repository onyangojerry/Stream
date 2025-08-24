import { useState, useEffect, useRef } from 'react'
import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import { Send, MessageCircle, User, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface WaitingRoomMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  isHost: boolean
}

const WaitingRoomChat = () => {
  const { user: currentUser } = useAuthStore()
  const { isHost } = useVideoStore()
  const [messages, setMessages] = useState<WaitingRoomMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-add welcome message when component mounts
  useEffect(() => {
    if (currentUser && !isHost) {
      const welcomeMessage: WaitingRoomMessage = {
        id: 'welcome-' + Date.now(),
        userId: 'system',
        userName: 'System',
        message: `Hi ${currentUser.name}! You can chat with the host while waiting for approval.`,
        timestamp: new Date(),
        isHost: false
      }
      setMessages([welcomeMessage])
    }
  }, [currentUser, isHost])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return

    const message: WaitingRoomMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date(),
      isHost: isHost
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Show toast for host when attendee sends message
    if (!isHost) {
      toast.success('Message sent to host')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isExpanded) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-20 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="Open waiting room chat"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {messages.length > 1 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messages.length - 1}
            </span>
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed bottom-20 right-4 z-40 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">
            {isHost ? 'Waiting Room Chat' : 'Chat with Host'}
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
        >
          <span className="text-lg">×</span>
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.userId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.userId === currentUser?.id ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-lg px-3 py-2 ${
                  message.userId === currentUser?.id 
                    ? 'bg-blue-500 text-white' 
                    : message.userId === 'system'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}>
                  {message.userId !== 'system' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium opacity-80">
                        {message.userName} {message.isHost && '(Host)'}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.message}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3 opacity-60" />
                    <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isHost ? "Type a message to attendees..." : "Type a message to host..."}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default WaitingRoomChat
