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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (currentUser && !isHost) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          userId: 'system',
          userName: 'System',
          message: `Hi ${currentUser.name}! You can chat with the host while waiting for approval.`,
          timestamp: new Date(),
          isHost: false,
        },
      ])
    }
  }, [currentUser, isHost])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        message: newMessage.trim(),
        timestamp: new Date(),
        isHost,
      },
    ])
    setNewMessage('')

    if (!isHost) toast.success('Message sent to host')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (!isExpanded) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-20 right-4 z-40 rounded-2xl border border-gray-200 bg-white p-3 text-gray-700 shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
        title="Open waiting room chat"
      >
        <div className="relative">
          <MessageCircle className="h-5 w-5" />
          {messages.length > 1 && (
            <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] text-white dark:bg-white dark:text-gray-900">
              {messages.length - 1}
            </span>
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isHost ? 'Waiting Room Chat' : 'Chat with Host'}</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          ×
        </button>
      </div>

      <div className="h-64 space-y-3 overflow-y-auto px-4 py-4">
        <AnimatePresence>
          {messages.map((message) => {
            const isMine = message.userId === currentUser?.id
            const isSystem = message.userId === 'system'
            return (
              <motion.div key={message.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl border px-3 py-2 ${
                    isMine
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                      : isSystem
                        ? 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        : 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                  }`}
                >
                  {!isSystem && (
                    <div className="mb-1 flex items-center gap-1 text-xs opacity-75">
                      <User className="h-3 w-3" />
                      <span>{message.userName}{message.isHost ? ' (Host)' : ''}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs opacity-60">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isHost ? 'Type a message to attendees...' : 'Type a message to host...'}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-600"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="rounded-xl border border-gray-900 bg-gray-900 px-3 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:bg-white dark:text-gray-900"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default WaitingRoomChat
