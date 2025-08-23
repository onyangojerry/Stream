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
  MessageSquare, FileText, Settings, Users, UserPlus, UserMinus, 
  Grid, List, MoreHorizontal
} from 'lucide-react'
import toast from 'react-hot-toast'

const GroupCall = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [, setShowBreakoutRooms] = useState(false)
  
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
      initializeGroupCall()
    }

    return () => {
      cleanupGroupCall()
    }
  }, [roomId])

  const initializeGroupCall = async () => {
    try {
      if (!currentUser) {
        // User should be authenticated to access this page
        toast.error('Please log in to join a call')
        navigate('/login')
        return
      }

      // Check if this is a scheduled meeting
      const scheduledMeeting = getMeetingById(roomId || '')
      if (scheduledMeeting) {
        // Check attendee limit
        if (scheduledMeeting.currentAttendees >= scheduledMeeting.attendeeLimit) {
          toast.error('Meeting is full. Cannot join.')
          navigate('/')
          return
        }

        // Try to join the meeting
        const joined = joinMeeting(roomId || '')
        if (!joined) {
          toast.error('Failed to join meeting. It may be full.')
          navigate('/')
          return
        }

        toast.success(`Joined scheduled meeting: ${scheduledMeeting.title}`)
      }

      // Check if user is host (first to join or has host role)
      const urlParams = new URLSearchParams(window.location.search)
      const role = urlParams.get('role')
      setIsHost(role === 'host' || !currentUser)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      
      toast.success(`Joined group call as ${isHost ? 'host' : 'participant'}`)
    } catch (error) {
      console.error('Error initializing group call:', error)
      toast.error('Failed to join group call')
    }
  }

  const cleanupGroupCall = () => {
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

  const handleEndCall = () => {
    cleanupGroupCall()
    navigate('/')
    toast.success('Group call ended')
  }

  const handleScreenShare = async () => {
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
    if (!isHost) {
      toast.error('Only hosts can record')
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

  const createBreakoutRooms = () => {
    if (!isHost) {
      toast.error('Only hosts can create breakout rooms')
      return
    }
    setShowBreakoutRooms(true)
    toast.success('Breakout rooms created')
  }

  const muteAllParticipants = () => {
    if (!isHost) {
      toast.error('Only hosts can mute all participants')
      return
    }
    toast.success('All participants muted')
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-400" />
            <h1 className="text-white font-semibold">Group Call: {roomId}</h1>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Connected</span>
          </div>
          {isHost && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              Host
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="control-button"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
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
                onClick={handleEndCall}
                className="control-button bg-red-600 hover:bg-red-700"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Host Controls */}
          {isHost && (
            <div className="absolute top-6 right-6 flex space-x-2">
              <button
                onClick={muteAllParticipants}
                className="control-button bg-yellow-600 hover:bg-yellow-700"
                title="Mute All"
              >
                <UserMinus className="w-4 h-4" />
              </button>
              <button
                onClick={createBreakoutRooms}
                className="control-button bg-blue-600 hover:bg-blue-700"
                title="Create Breakout Rooms"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          )}
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
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">Host</span>
                    <span className="text-xs text-gray-500">1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Participants</span>
                    <span className="text-xs text-gray-500">8</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Total</span>
                    <span className="text-xs text-gray-500">9</span>
                  </div>
                </div>
                
                {/* Participant List */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Online</div>
                  {[
                    { name: 'John Doe', role: 'host', isMuted: false },
                    { name: 'Jane Smith', role: 'participant', isMuted: true },
                    { name: 'Bob Johnson', role: 'participant', isMuted: false },
                    { name: 'Alice Brown', role: 'participant', isMuted: false },
                  ].map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{participant.name}</span>
                        {participant.role === 'host' && (
                          <span className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">Host</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {participant.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                        <MoreHorizontal className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupCall
