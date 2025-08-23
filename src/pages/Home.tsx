import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Users, Presentation, Calendar, ArrowRight, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState('')

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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 dark:text-white"
        >
          Welcome to Striim
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          The ultimate video streaming platform for webinars, one-on-one calls, and group meetings with advanced features like real-time transcription and sign language support.
        </motion.p>
      </div>

      {/* Quick Join */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Join Meeting</h2>
        <div className="flex space-x-4">
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
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </div>
      </motion.div>

      {/* Call Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {callTypes.map((type, index) => {
          const Icon = type.icon
          return (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(type.href)}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{type.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{type.description}</p>
              <ul className="space-y-1 mb-4">
                {type.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full btn-primary flex items-center justify-center space-x-2">
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Meetings</h2>
        <div className="space-y-3">
          {recentMeetings.map((meeting) => (
            <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{meeting.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
    </div>
  )
}

export default Home
