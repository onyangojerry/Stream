import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchedulerStore } from '../store/useSchedulerStore'
import { useAuthStore } from '../store/useAuthStore'
import { Calendar, Clock, Users, Video, Presentation, Settings, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const MeetingScheduler = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const { addMeeting, getUpcomingMeetings } = useSchedulerStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'group' as 'one-on-one' | 'group' | 'webinar',
    startTime: '',
    endTime: '',
    attendeeLimit: 10,
    settings: {
      allowScreenShare: true,
      allowRecording: true,
      allowChat: true,
      allowTranscription: true,
      autoMuteOnJoin: false,
      waitingRoom: true,
    }
  })

  const upcomingMeetings = getUpcomingMeetings()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('Please log in to schedule a meeting')
      return
    }

    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const startTime = new Date(formData.startTime)
    const endTime = new Date(formData.endTime)
    
    if (startTime <= new Date()) {
      toast.error('Start time must be in the future')
      return
    }
    
    if (endTime <= startTime) {
      toast.error('End time must be after start time')
      return
    }

    const meetingData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startTime,
      endTime,
      hostId: currentUser.id,
      hostName: currentUser.name,
      attendeeLimit: formData.attendeeLimit,
      roomId: '',
      isActive: false,
      isStarted: false,
      isEnded: false,
      currentAttendees: 0,
      settings: formData.settings,
    }

    addMeeting(meetingData)
    toast.success('Meeting scheduled successfully!')
    setShowForm(false)
    setFormData({
      title: '',
      description: '',
      type: 'group',
      startTime: '',
      endTime: '',
      attendeeLimit: 10,
      settings: {
        allowScreenShare: true,
        allowRecording: true,
        allowChat: true,
        allowTranscription: true,
        autoMuteOnJoin: false,
        waitingRoom: true,
      }
    })
  }

  const getAttendeeLimitOptions = (type: string) => {
    switch (type) {
      case 'one-on-one':
        return [2]
      case 'group':
        return [5, 10, 20, 30, 50]
      case 'webinar':
        return [50, 100, 200, 500, 1000]
      default:
        return [10]
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'one-on-one':
        return <Video className="w-4 h-4" />
      case 'group':
        return <Users className="w-4 h-4" />
      case 'webinar':
        return <Presentation className="w-4 h-4" />
      default:
        return <Video className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'one-on-one':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'group':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'webinar':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting Scheduler</h2>
          <p className="text-gray-600 dark:text-gray-300">Schedule and manage your meetings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Meetings</h3>
        {upcomingMeetings.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No upcoming meetings</p>
            <p className="text-xs">Schedule your first meeting to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(meeting.type)}`}>
                    {getTypeIcon(meeting.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{meeting.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(meeting.startTime)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{meeting.currentAttendees}/{meeting.attendeeLimit}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(meeting.type)}`}>
                    {meeting.type}
                  </span>
                  <button
                    onClick={() => navigate(`/${meeting.type}/${meeting.roomId}`)}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Meeting Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Meeting</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter meeting title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter meeting description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meeting Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        type: e.target.value as 'one-on-one' | 'group' | 'webinar',
                        attendeeLimit: getAttendeeLimitOptions(e.target.value)[0]
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="one-on-one">One-on-One Call</option>
                      <option value="group">Group Call</option>
                      <option value="webinar">Webinar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attendee Limit
                    </label>
                    <select
                      value={formData.attendeeLimit}
                      onChange={(e) => setFormData({ ...formData, attendeeLimit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {getAttendeeLimitOptions(formData.type).map((limit) => (
                        <option key={limit} value={limit}>
                          {limit} {limit === 1 ? 'person' : 'people'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Meeting Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Meeting Settings</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowScreenShare}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, allowScreenShare: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Allow Screen Share</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowRecording}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, allowRecording: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Allow Recording</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowChat}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, allowChat: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Allow Chat</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowTranscription}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, allowTranscription: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Allow Transcription</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.autoMuteOnJoin}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, autoMuteOnJoin: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Auto-mute on Join</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.waitingRoom}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, waitingRoom: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Waiting Room</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MeetingScheduler
