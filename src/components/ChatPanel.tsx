import { useState, useRef, useEffect } from 'react'
import { useVideoStore } from '../store/useVideoStore'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Message } from '../types'

const ChatPanel = () => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, addMessage, currentUser } = useVideoStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !currentUser) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      content: message.trim(),
      timestamp: new Date(),
      type: 'text',
    }

    addMessage(newMessage)
    setMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Chat</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{messages.length} messages</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <Send className="h-4 w-4" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">No messages yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.id === currentUser?.id
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl border px-3 py-2 ${
                    isMine
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                      : 'border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                  }`}
                >
                  {!isMine && <p className="mb-1 text-xs font-medium opacity-70">{msg.sender.name}</p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`mt-1 text-xs ${isMine ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <button className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800">
            <Paperclip className="h-4 w-4" />
          </button>
          <div className="relative flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="max-h-28 min-h-10 w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-600"
              rows={1}
            />
          </div>
          <button className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800">
            <Smile className="h-4 w-4" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="rounded-xl border border-gray-900 bg-gray-900 p-2 text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:bg-white dark:text-gray-900"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
