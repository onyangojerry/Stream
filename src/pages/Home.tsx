import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Users, Presentation, Calendar, ArrowRight, Clock, Share2, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Home = () => {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const callTypes = [
    {
      title: 'Meeting Scheduler',
      description: 'Schedule meetings with attendee limits and settings',
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      href: '/scheduler',
      features: ['Attendee Limits', 'Meeting Settings', 'Calendar Integration']
    },
    {
      title: 'One-on-One Call',
      description: 'Start a private video call with one person',
      icon: Video,
      color: 'from-blue-500 to-blue-600',
      href: '/call/new',
      features: ['HD Video', 'Crystal Clear Audio', 'Screen Sharing']
    },
    {
      title: 'Group Call',
      description: 'Host a meeting with multiple participants',
      icon: Users,
      color: 'from-green-500 to-green-600',
      href: '/group/new',
      features: ['Up to 50 Participants', 'Breakout Rooms', 'Meeting Recording']
    },
    {
      title: 'Webinar',
      description: 'Present to a large audience with interactive features',
      icon: Presentation,
      color: 'from-purple-500 to-purple-600',
      href: '/webinar/new',
      features: ['Live Polling', 'Q&A Sessions', 'Analytics Dashboard']
    }
  ]

  const recentMeetings = [
    {
      id: '1',
      title: 'Team Standup',
      type: 'Group Call',
      date: '2024-01-15',
      time: '09:00 AM',
      participants: 8
    },
    {
      id: '2',
      title: 'Client Presentation',
      type: 'Webinar',
      date: '2024-01-14',
      time: '02:00 PM',
      participants: 25
    },
    {
      id: '3',
      title: 'Design Review',
      type: 'One-on-One',
      date: '2024-01-13',
      time: '11:00 AM',
      participants: 2
    }
  ]

  const handleJoinMeeting = () => {
    if (roomId.trim()) {
      navigate(`/call/${roomId}`)
    }
  }

  const handleShareMeeting = () => {
    if (roomId.trim()) {
      setShowShareModal(true)
    } else {
      toast.error('Please enter a meeting ID first')
    }
  }

  const getMeetingLink = () => {
    return `${window.location.origin}/call/${roomId}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getMeetingLink())
      setCopied(true)
      toast.success('Meeting link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my meeting on Striim',
          text: 'Click the link to join my video call',
          url: getMeetingLink()
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 sm:space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white px-4"
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Striim
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4"
        >
          The ultimate video streaming platform for webinars, one-on-one calls, and group meetings with advanced features like real-time transcription and sign language support.
        </motion.p>
      </div>

      {/* Quick Join */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Join Meeting</h2>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Enter meeting ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleJoinMeeting}
            disabled={!roomId.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Join
          </button>
          <button
            onClick={handleShareMeeting}
            disabled={!roomId.trim()}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </motion.div>

      {/* Call Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {callTypes.map((type, index) => {
          const Icon = type.icon
          return (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(type.href)}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">{type.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">{type.description}</p>
              <ul className="space-y-1 mb-3 sm:mb-4">
                {type.features.map((feature) => (
                  <li key={feature} className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base">
                <span>Start {type.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Meetings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Meetings</h2>
        <div className="space-y-3">
          {recentMeetings.map((meeting) => (
            <div key={meeting.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{meeting.type}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{meeting.time}</span>
                </span>
                <span>{meeting.participants} participants</span>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Rejoin
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Share Meeting Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Meeting</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={getMeetingLink()}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleShareNative}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Anyone with this link can join your meeting. Share it securely with your participants.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
