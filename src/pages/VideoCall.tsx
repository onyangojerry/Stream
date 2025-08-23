import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import VideoGrid from '../components/VideoGrid'
import ChatPanel from '../components/ChatPanel'
import TranscriptionPanel from '../components/TranscriptionPanel'
import WaitingRoom from '../components/WaitingRoom'
import WaitingRoomNotification from '../components/WaitingRoomNotification'
import WaitingRoomTest from '../components/WaitingRoomTest'
import CollaborativeDocument from '../components/CollaborativeDocument'
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, FileText, Settings, Share2, Copy, Check, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const VideoCall = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [copied, setCopied] = useState(false)
  
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
    stopScreenShare,
    isRecording,
    startRecording,
    stopRecording,
    isHost,
    setHostStatus,
    waitingRoom,
    addToWaitingRoom,

    startMeeting,
    endMeeting,
    leaveMeeting,
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
      if (!currentUser) {
        toast.error('Please log in to join a call')
        navigate('/login')
        return
      }

      // Check if user is joining via link (not the host)
      const urlParams = new URLSearchParams(window.location.search)
      const isJoining = urlParams.get('join') === 'true'
      
      console.log('VideoCall - isJoining:', isJoining, 'isHost:', isHost, 'currentUser:', currentUser)
      
      if (isJoining) {
        // User is joining via link - add to waiting room
        console.log('Adding user to waiting room:', currentUser)
        addToWaitingRoom(currentUser)
        toast.success('Waiting for host approval to join the call')
        return
      }

      // User is the host (starting the call)
      setHostStatus(true)
      startMeeting()
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      toast.success('Call started! Share the link to invite others.')
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
    if (isHost) {
      endMeeting()
      cleanupCall()
      navigate('/')
      toast.success('Call ended')
    } else {
      leaveMeeting()
      cleanupCall()
      navigate('/')
      toast.success('Left the call')
    }
  }

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        // Add event listener to detect when user stops sharing
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare()
          toast.success('Screen sharing stopped')
        })
        
        // Store the screen share stream
        useVideoStore.getState().setScreenShare({
          id: 'screen-share-' + Date.now(),
          stream: screenStream,
          user: currentUser || { id: 'local', name: 'You', email: '', isOnline: true },
          isActive: true
        })
        
        toggleScreenShare()
        toast.success('Screen sharing started')
      } else {
        stopScreenShare()
        toast.success('Screen sharing stopped')
      }
    } catch (error) {
      console.error('Error with screen sharing:', error)
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error('Screen sharing permission denied')
      } else {
        toast.error('Failed to start screen sharing')
      }
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

  const getMeetingLink = () => {
    return `${window.location.origin}/call/${roomId}?join=true`
  }

  const handleShareMeeting = () => {
    setShowShareModal(true)
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
    <div className="h-screen bg-gray-900 flex flex-col">
      <WaitingRoomNotification />
      <WaitingRoomTest />
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
          {isHost && (
            <button
              onClick={() => setShowWaitingRoom(!showWaitingRoom)}
              className="control-button bg-yellow-600 hover:bg-yellow-700"
              title="Waiting Room"
            >
              <Users className="w-5 h-5" />
              {waitingRoom.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {waitingRoom.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={handleShareMeeting}
            className="control-button bg-blue-600 hover:bg-blue-700"
            title="Share Meeting"
          >
            <Share2 className="w-5 h-5" />
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
          {!isHost && waitingRoom.length > 0 ? (
            <div className="h-full flex items-center justify-center">
              <WaitingRoom />
            </div>
          ) : (
            <VideoGrid />
          )}
          
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
                onClick={() => setShowDocument(!showDocument)}
                className={`control-button ${showDocument ? 'active' : ''}`}
                title="Collaborative Document"
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
          {showWaitingRoom && (
            <div className="w-80 bg-white rounded-lg shadow-lg">
              <WaitingRoom />
            </div>
          )}
          
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
          
          {showDocument && (
            <div className="w-96 bg-white rounded-lg shadow-lg">
              <CollaborativeDocument />
            </div>
          )}
        </div>
      </div>

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

export default VideoCall
