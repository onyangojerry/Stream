import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchedulerStore } from '../store/useSchedulerStore'
import { useAuthStore } from '../store/useAuthStore'
import { Video, Users, Presentation, Calendar, Square, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MeetingDuration from './MeetingDuration'
import toast from 'react-hot-toast'

const RealMeetings = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const { 
    getActiveMeetings, 
    getPastMeetings, 
    endMeeting,
    updateMeetingDuration 
  } = useSchedulerStore()
  
  const [activeMeetings, setActiveMeetings] = useState(getActiveMeetings())
  const [pastMeetings, setPastMeetings] = useState(getPastMeetings())

  // Update meetings every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMeetings(getActiveMeetings())
      setPastMeetings(getPastMeetings())
      
      // Update durations for active meetings
      activeMeetings.forEach(meeting => {
        updateMeetingDuration(meeting.id)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [activeMeetings, pastMeetings])



  const handleEndMeeting = (meeting: any) => {
    if (!currentUser) {
      toast.error('Please log in to end a meeting')
      return
    }

    if (meeting.hostId !== currentUser.id) {
      toast.error('Only the host can end this meeting')
      return
    }

    endMeeting(meeting.id)
    toast.success('Meeting ended!')
  }

  const handleJoinMeeting = (meeting: any) => {
    if (!currentUser) {
      toast.error('Please log in to join a meeting')
      return
    }

    // Navigate to the appropriate meeting type with join parameter
    switch (meeting.type) {
      case 'one-on-one':
        navigate(`/call/${meeting.roomId}?join=true`)
        break
      case 'group':
        navigate(`/group/${meeting.roomId}?join=true`)
        break
      case 'webinar':
        navigate(`/webinar/${meeting.roomId}?join=true`)
        break
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'one-on-one':
        return Video
      case 'group':
        return Users
      case 'webinar':
        return Presentation
      default:
        return Video
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'one-on-one':
        return 'text-blue-600 dark:text-blue-400'
      case 'group':
        return 'text-green-600 dark:text-green-400'
      case 'webinar':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`
    }
    return `${minutes}:00`
  }

  const hasMeetings = activeMeetings.length > 0 || pastMeetings.length > 0

  if (!hasMeetings) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Meetings Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start your first meeting to see it appear here
          </p>
          <button
            onClick={() => navigate('/scheduler')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Meetings */}
      {activeMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Active Meetings ({activeMeetings.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {activeMeetings.map((meeting) => {
                const Icon = getTypeIcon(meeting.type)
                return (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${getTypeColor(meeting.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {meeting.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Hosted by {meeting.hostName}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {meeting.currentAttendees}/{meeting.attendeeLimit} participants
                            </span>
                            {meeting.actualStartTime && (
                              <MeetingDuration 
                                startTime={meeting.actualStartTime} 
                                isActive={meeting.isActive} 
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {currentUser?.id === meeting.hostId ? (
                          <button
                            onClick={() => handleEndMeeting(meeting)}
                            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                            title="End Meeting"
                          >
                            <Square className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinMeeting(meeting)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                            title="Join Meeting"
                          >
                            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Meetings ({pastMeetings.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {pastMeetings.slice(0, 5).map((meeting) => {
                const Icon = getTypeIcon(meeting.type)
                return (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${getTypeColor(meeting.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {meeting.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Hosted by {meeting.hostName}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateTime(meeting.actualEndTime || meeting.endTime)}
                            </span>
                            {meeting.duration && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Duration: {formatDuration(meeting.duration)}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {meeting.currentAttendees} participants
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

export default RealMeetings
