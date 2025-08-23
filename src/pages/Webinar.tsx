import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVideoStore } from '../store/useVideoStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
import { useAuthStore } from '../store/useAuthStore'
import VideoGrid from '../components/VideoGrid'
import ChatPanel from '../components/ChatPanel'
import TranscriptionPanel from '../components/TranscriptionPanel'
import WaitingRoom from '../components/WaitingRoom'
import WaitingRoomNotification from '../components/WaitingRoomNotification'
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  MessageSquare, FileText, Settings, Users, Presentation, BarChart3, Share2, Copy, Check
} from 'lucide-react'
import toast from 'react-hot-toast'

const Webinar = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPresenter, setIsPresenter] = useState(false)
  const [, setShowPoll] = useState(false)
  
  const {
    setCurrentRoom,
    localStream,
    setLocalStream,
    remoteStreams,
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

    setHostStatus,
    waitingRoom,
    addToWaitingRoom,
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
        toast.error('Please log in to join a webinar')
        navigate('/login')
        return
      }

      // Check if user is joining via link (not the presenter)
      const urlParams = new URLSearchParams(window.location.search)
      const isJoining = urlParams.get('join') === 'true'
      
      if (isJoining) {
        // User is joining via link - add to waiting room
        addToWaitingRoom(currentUser)
        toast.success('Waiting for presenter approval to join the webinar')
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

      // User is the presenter (starting the webinar)
      setHostStatus(true)
      setIsPresenter(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      
      toast.success('Webinar started! Share the link to invite attendees.')
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

  const getMeetingLink = () => {
    return `${window.location.origin}/webinar/${roomId}?join=true`
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
          title: 'Join my webinar on Striim',
          text: 'Click the link to join my webinar',
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
          {isPresenter && (
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
          {!isPresenter && waitingRoom.length > 0 ? (
            <div className="h-full flex items-center justify-center">
              <WaitingRoom />
            </div>
          ) : (
            <VideoGrid />
          )}
          
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
          
          {showParticipants && (
            <div className="w-80 bg-white rounded-lg shadow-lg">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
                
                {/* Real-time participant count */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="text-sm font-medium">Presenter</span>
                    <span className="text-xs text-gray-500">
                      {isPresenter ? 1 : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Attendees</span>
                    <span className="text-xs text-gray-500">
                      {remoteStreams.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Total</span>
                    <span className="text-xs text-gray-500">
                      {remoteStreams.length + (isPresenter ? 1 : 0)}
                    </span>
                  </div>
                </div>
                
                {/* Real participant list */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Online</div>
                  
                  {/* Show current user if they're the presenter */}
                  {isPresenter && currentUser && (
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{currentUser.name}</span>
                        <span className="px-1 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Presenter</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!isAudioEnabled && <MicOff className="w-3 h-3 text-red-500" />}
                        {!isVideoEnabled && <VideoOff className="w-3 h-3 text-red-500" />}
                      </div>
                    </div>
                  )}
                  
                  {/* Show remote participants */}
                  {remoteStreams.map((stream) => (
                    <div key={stream.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{stream.user.name}</span>
                        <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Attendee</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!stream.isAudioEnabled && <MicOff className="w-3 h-3 text-red-500" />}
                        {!stream.isVideoEnabled && <VideoOff className="w-3 h-3 text-red-500" />}
                        {stream.isScreenShare && <Monitor className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show message when no participants */}
                  {remoteStreams.length === 0 && !isPresenter && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No other attendees yet</p>
                      <p className="text-xs">Share the webinar link to invite others</p>
                    </div>
                  )}
                  
                  {remoteStreams.length === 0 && isPresenter && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">You're the only presenter</p>
                      <p className="text-xs">Share the webinar link to invite attendees</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Meeting Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Webinar</h3>
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
                Anyone with this link can join your webinar. Share it securely with your attendees.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Webinar
