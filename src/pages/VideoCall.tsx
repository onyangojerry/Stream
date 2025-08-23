import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import VideoGrid from '../components/VideoGrid'
import ChatPanel from '../components/ChatPanel'
import TranscriptionPanel from '../components/TranscriptionPanel'
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, FileText, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

const VideoCall = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
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

  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId)
      initializeCall()
    }

    return () => {
      cleanupCall()
    }
  }, [roomId])

  const initializeCall = async () => {
    try {
      // Set a default user if none exists
      if (!currentUser) {
        // User should be authenticated to access this page
        toast.error('Please log in to join a call')
        navigate('/login')
        return
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      toast.success('Connected to call')
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast.error('Failed to access camera/microphone')
    }
  }

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    reset()
  }

  const handleEndCall = () => {
    cleanupCall()
    navigate('/')
    toast.success('Call ended')
  }

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        // Handle screen share stream
        toast.success('Screen sharing started')
      } else {
        // Stop screen sharing
        toast.success('Screen sharing stopped')
      }
      toggleScreenShare()
    } catch (error) {
      console.error('Error with screen sharing:', error)
      toast.error('Failed to start screen sharing')
    }
  }

  const handleRecording = () => {
    if (!isRecording) {
      startRecording()
      toast.success('Recording started')
    } else {
      stopRecording()
      toast.success('Recording stopped')
    }
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold">Room: {roomId}</h1>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Connected</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </div>
  )
}

export default VideoCall
