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
import WaitingRoomChat from '../components/WaitingRoomChat'
import CollaborativeDocument from '../components/CollaborativeDocument'
import MeetingJoinRequestsPanel from '../components/MeetingJoinRequestsPanel'
import ControlButton from '../components/ControlButton'
import CallDashboard from '../components/CallDashboard'
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  MessageSquare, FileText, Settings, Users, Share2, Copy, Check
} from 'lucide-react'
import toast from 'react-hot-toast'

const Webinar = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPresenter, setIsPresenter] = useState(false)
  const [isCallStarted, setIsCallStarted] = useState(false)
  
  const {
    setCurrentRoom,
    setCurrentUser,
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
    setHostStatus,
    waitingRoom,
    addToWaitingRoom,
    startMeeting,
    endMeeting,
    leaveMeeting,
    reset
  } = useVideoStore()

  const { user: currentUser } = useAuthStore()
  const { getMeetingByRoomId, joinMeeting, leaveMeeting: leaveScheduledMeeting } = useSchedulerStore()

  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId)
      // Don't automatically initialize call - wait for user to start it
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
      setCurrentUser(currentUser)

      const urlParams = new URLSearchParams(window.location.search)
      const isJoining = urlParams.get('join') === 'true'
      
      if (isJoining) {
        addToWaitingRoom(currentUser)
        toast.success('Waiting for presenter approval to join the webinar')
        return
      }

      const scheduledMeeting = getMeetingByRoomId(roomId || '')
      if (scheduledMeeting) {
        if (scheduledMeeting.currentAttendees >= scheduledMeeting.attendeeLimit) {
          toast.error('Webinar is full. Cannot join.')
          navigate('/')
          return
        }
        joinMeeting(scheduledMeeting.id)
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      setIsPresenter(true)
      setHostStatus(true)
      startMeeting()
      setIsCallStarted(true)
      
      toast.success('Webinar started! Share the link to invite attendees.')
    } catch (error) {
      console.error('Error initializing webinar:', error)
      toast.error('Failed to start webinar')
    }
  }

  const cleanupWebinar = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    reset()
  }

  const handleEndWebinar = () => {
    if (isPresenter) {
      endMeeting()
    } else {
      leaveMeeting()
    }
    
    if (roomId) {
      const scheduledMeeting = getMeetingByRoomId(roomId)
      if (scheduledMeeting) {
        leaveScheduledMeeting(scheduledMeeting.id)
      }
    }
    
    cleanupWebinar()
    navigate('/')
    toast.success('Left webinar')
  }

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        stopScreenShare()
        toast.success('Screen sharing stopped')
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        if (!currentUser) {
          toast.error('User session unavailable for screen sharing')
          return
        }
        useVideoStore.getState().setScreenShare({
          id: `screen-share-${Date.now()}`,
          stream: screenStream,
          user: currentUser,
          isActive: true
        })
        toggleScreenShare()
        
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare()
        })
        
        toast.success('Screen sharing started')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error('Screen sharing permission denied')
      } else {
        toast.error('Failed to start screen sharing')
      }
    }
  }

  const handleRecording = () => {
    if (isRecording) {
      stopRecording()
      toast.success('Recording stopped')
    } else {
      startRecording()
      toast.success('Recording started')
    }
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
      toast.success('Meeting link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleShareNative = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my webinar',
          text: 'Click the link to join my webinar',
          url: getMeetingLink()
        })
      } else {
        handleCopyLink()
      }
    } catch (error) {
      handleCopyLink()
    }
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  // Show dashboard if call hasn't started yet
  if (!isCallStarted) {
    return (
      <CallDashboard
        roomId={roomId || ''}
        callType="webinar"
        onStartCall={initializeWebinar}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 border-b border-white/10 bg-gray-900/80 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold tracking-tight">Webinar</h1>
            <span className="text-sm text-gray-300">Room: {roomId}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isPresenter && (
              <ControlButton
                onClick={() => setShowWaitingRoom(!showWaitingRoom)}
                title="Manage Waiting Room - Approve/Reject Attendees"
                variant="warning"
                showBadge={waitingRoom.length > 0}
                badgeContent={waitingRoom.length}
                badgeColor="red"
              >
                <Users />
              </ControlButton>
            )}
            <ControlButton
              onClick={handleShareMeeting}
              title="Share Meeting Link with Others"
              variant="success"
            >
              <Share2 />
            </ControlButton>
            <ControlButton
              onClick={() => setShowSettings(!showSettings)}
              title="Meeting Settings and Configuration"
              variant="default"
            >
              <Settings />
            </ControlButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-32 px-4">
        <VideoGrid />
        
        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-3 rounded-full border border-white/10 bg-gray-900/80 px-4 py-2 backdrop-blur">
            <ControlButton
              onClick={toggleAudio}
              title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
              variant={!isAudioEnabled ? 'muted' : 'default'}
            >
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </ControlButton>
            
            <ControlButton
              onClick={toggleVideo}
              title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
              variant={!isVideoEnabled ? 'muted' : 'default'}
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </ControlButton>
            
            <ControlButton
              onClick={handleScreenShare}
              title={isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
              variant={isScreenSharing ? 'active' : 'default'}
            >
              {isScreenSharing ? <MonitorOff /> : <Monitor />}
            </ControlButton>
            
            <ControlButton
              onClick={handleRecording}
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
              variant={isRecording ? 'active' : 'default'}
            >
              <div className={`h-full w-full rounded-full border-2 ${isRecording ? 'border-red-500 bg-red-500' : 'border-current'}`}></div>
            </ControlButton>
            
            <ControlButton
              onClick={() => setShowChat(!showChat)}
              title="Toggle Chat Panel"
              variant={showChat ? 'active' : 'default'}
            >
              <MessageSquare />
            </ControlButton>
            
            <ControlButton
              onClick={() => setShowTranscription(!showTranscription)}
              title="Toggle Real-time Transcription"
              variant={showTranscription ? 'active' : 'default'}
            >
              <FileText />
            </ControlButton>
            
            <ControlButton
              onClick={() => setShowDocument(!showDocument)}
              title="Open Collaborative Document"
              variant={showDocument ? 'active' : 'default'}
            >
              <FileText />
            </ControlButton>
            
            <ControlButton
              onClick={handleEndWebinar}
              title="End Webinar and Leave Meeting"
              variant="danger"
            >
              <PhoneOff />
            </ControlButton>
          </div>
        </div>

        {/* Side Panels */}
        <div className="flex flex-col space-y-2 p-4">
          {showWaitingRoom && (
            <div className="w-80">
              <WaitingRoom />
            </div>
          )}

          {isPresenter && roomId && (
            <div className="w-80">
              <MeetingJoinRequestsPanel roomId={roomId} title="Attendee requests" />
            </div>
          )}
          
          {showChat && (
            <div className="w-80">
              <ChatPanel />
            </div>
          )}
          
          {showTranscription && (
            <div className="w-80">
              <TranscriptionPanel />
            </div>
          )}
        </div>
      </div>

      {/* Collaborative Document */}
      {showDocument && (
        <CollaborativeDocument />
      )}

      {/* Share Meeting Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Webinar</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
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
                    className="flex-1 rounded-l-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="rounded-r-xl border border-gray-900 bg-gray-900 px-4 py-2 text-white transition-colors dark:border-white dark:bg-white dark:text-gray-900"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleShareNative}
                  className="flex-1 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-white transition-colors dark:border-white dark:bg-white dark:text-gray-900"
                >
                  Share
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
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

      <WaitingRoomNotification />
      <WaitingRoomChat />
    </div>
  )
}

export default Webinar
