import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVideoStore } from '../store/useVideoStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
import { useAuthStore } from '../store/useAuthStore'
import VideoGrid from '../components/VideoGrid'
import ChatPanel from '../components/ChatPanel'
import TranscriptionPanel from '../components/TranscriptionPanel'
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  MessageSquare, FileText, Settings, Users, Presentation, BarChart3 
} from 'lucide-react'
import toast from 'react-hot-toast'

const Webinar = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isPresenter, setIsPresenter] = useState(false)
  const [, setShowPoll] = useState(false)
  
  const {
    setCurrentRoom,
    localStream,
    setLocalStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    isRecording,
    startRecording,
    stopRecording,
    reset
  } = useVideoStore()

  const { user: currentUser } = useAuthStore()
  const { getMeetingById, joinMeeting, leaveMeeting } = useSchedulerStore()

  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId)
      initializeWebinar()
    }

    return () => {
      cleanupWebinar()
    }
  }, [roomId])

  const initializeWebinar = async () => {
    try {
      if (!currentUser) {
        // User should be authenticated to access this page
        toast.error('Please log in to join a webinar')
        navigate('/login')
        return
      }

      // Check if this is a scheduled meeting
      const scheduledMeeting = getMeetingById(roomId || '')
      if (scheduledMeeting) {
        // Check attendee limit
        if (scheduledMeeting.currentAttendees >= scheduledMeeting.attendeeLimit) {
          toast.error('Webinar is full. Cannot join.')
          navigate('/')
          return
        }

        // Try to join the meeting
        const joined = joinMeeting(roomId || '')
        if (!joined) {
          toast.error('Failed to join webinar. It may be full.')
          navigate('/')
          return
        }

        toast.success(`Joined scheduled webinar: ${scheduledMeeting.title}`)
      }

      // Check if user is presenter (first to join or has presenter role)
      const urlParams = new URLSearchParams(window.location.search)
      const role = urlParams.get('role')
      setIsPresenter(role === 'presenter' || !currentUser)

      if (isPresenter) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
      }
      
      toast.success(`Joined webinar as ${isPresenter ? 'presenter' : 'attendee'}`)
    } catch (error) {
      console.error('Error initializing webinar:', error)
      toast.error('Failed to join webinar')
    }
  }

  const cleanupWebinar = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    // Leave scheduled meeting if applicable
    const scheduledMeeting = getMeetingById(roomId || '')
    if (scheduledMeeting && currentUser) {
      leaveMeeting(roomId || '')
    }
    
    reset()
  }

  const handleEndWebinar = () => {
    cleanupWebinar()
    navigate('/')
    toast.success('Webinar ended')
  }

  const handleScreenShare = async () => {
    if (!isPresenter) {
      toast.error('Only presenters can share screen')
      return
    }

    try {
      if (!isScreenSharing) {
        await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        toast.success('Screen sharing started')
      } else {
        toast.success('Screen sharing stopped')
      }
      toggleScreenShare()
    } catch (error) {
      console.error('Error with screen sharing:', error)
      toast.error('Failed to start screen sharing')
    }
  }

  const handleRecording = () => {
    if (!isPresenter) {
      toast.error('Only presenters can record')
      return
    }

    if (!isRecording) {
      startRecording()
      toast.success('Recording started')
    } else {
      stopRecording()
      toast.success('Recording stopped')
    }
  }

  const createPoll = () => {
    if (!isPresenter) {
      toast.error('Only presenters can create polls')
      return
    }
    setShowPoll(true)
    toast.success('Poll created')
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Presentation className="w-5 h-5 text-purple-400" />
            <h1 className="text-white font-semibold">Webinar: {roomId}</h1>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
          {isPresenter && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
              Presenter
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="control-button"
            title="Participants"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="control-button"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          <VideoGrid />
          
          {/* Floating Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-full px-6 py-3">
              {isPresenter && (
                <>
                  <button
                    onClick={toggleAudio}
                    className={`control-button ${!isAudioEnabled ? 'muted' : ''}`}
                    title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                  >
                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={toggleVideo}
                    className={`control-button ${!isVideoEnabled ? 'muted' : ''}`}
                    title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
                  >
                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={handleScreenShare}
                    className={`control-button ${isScreenSharing ? 'active' : ''}`}
                    title={isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
                  >
                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={handleRecording}
                    className={`control-button ${isRecording ? 'active' : ''}`}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 ${isRecording ? 'bg-red-500 border-red-500' : 'border-white'}`}></div>
                  </button>
                  
                  <button
                    onClick={createPoll}
                    className="control-button"
                    title="Create Poll"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => setShowChat(!showChat)}
                className={`control-button ${showChat ? 'active' : ''}`}
                title="Toggle Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowTranscription(!showTranscription)}
                className={`control-button ${showTranscription ? 'active' : ''}`}
                title="Toggle Transcription"
              >
                <FileText className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleEndWebinar}
                className="control-button bg-red-600 hover:bg-red-700"
                title="Leave Webinar"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="flex flex-col space-y-2 p-4">
          {showChat && (
            <div className="w-80 bg-white rounded-lg shadow-lg">
              <ChatPanel />
            </div>
          )}
          
          {showTranscription && (
            <div className="w-80 bg-white rounded-lg shadow-lg">
              <TranscriptionPanel />
            </div>
          )}
          
          {showParticipants && (
            <div className="w-80 bg-white rounded-lg shadow-lg">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="text-sm font-medium">Presenter</span>
                    <span className="text-xs text-gray-500">1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Attendees</span>
                    <span className="text-xs text-gray-500">24</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Webinar
