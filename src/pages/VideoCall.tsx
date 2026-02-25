import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVideoStore } from '../store/useVideoStore'
import { useAuthStore } from '../store/useAuthStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
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
  const [isApproved, setIsApproved] = useState(false)
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
    isHost,
    setHostStatus,
    waitingRoom,
    participants,
    addToWaitingRoom,

    startMeeting,
    endMeeting,
    leaveMeeting,
    reset
  } = useVideoStore()
  const hasSidePanel = showWaitingRoom || showChat || showTranscription || (!!roomId && isHost)

  const { user: currentUser } = useAuthStore()
  const { getMeetingByRoomId, startMeeting: startScheduledMeeting, endMeeting: endScheduledMeeting } = useSchedulerStore()

  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId)
      // Don't automatically initialize call - wait for user to start it
    }

    return () => {
      cleanupCall()
    }
  }, [roomId])

  // Monitor if user gets approved from waiting room
  useEffect(() => {
    if (currentUser && !isHost) {
      const isUserApproved = participants.some(p => p.id === currentUser.id)
      
      if (isUserApproved && !isApproved) {
        setIsApproved(true)
        toast.success('You have been approved! Joining the meeting...')
        // Initialize media and join the call
        setTimeout(async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setLocalStream(stream)
          } catch (error) {
            console.error('Error accessing media:', error)
            toast.error('Could not access camera/microphone')
          }
        }, 1000)
      }
    }
  }, [participants, waitingRoom, currentUser, isHost, isApproved])

  const initializeCall = async () => {
    try {
      let effectiveUser = currentUser

      if (!currentUser) {
        // Prompt user to login or continue as guest
        const shouldLogin = window.confirm(
          'To access all features, please log in. Click OK to go to login page, or Cancel to continue as guest.'
        );
        
        if (shouldLogin) {
          // Save the room ID for after login
          sessionStorage.setItem('pendingJoin', JSON.stringify({
            meetingId: roomId,
            displayName: 'Guest User',
            isVideoEnabled: true,
            isAudioEnabled: true
          }));
          navigate('/login');
          return;
        } else {
          // Continue as guest - create a temporary user
          const guestUser = {
            id: `guest-${Date.now()}`,
            name: 'Guest User',
            email: '',
            isOnline: true,
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
          effectiveUser = guestUser
          setCurrentUser(guestUser)
          console.log('Continuing as guest:', guestUser)
        }
      } else {
        setCurrentUser(currentUser)
      }

      // Check if user is joining via link (not the host)
      const urlParams = new URLSearchParams(window.location.search)
      const isJoining = urlParams.get('join') === 'true'
      
      console.log('VideoCall - isJoining:', isJoining, 'isHost:', isHost, 'currentUser:', effectiveUser)
      
      if (isJoining) {
        if (!effectiveUser) {
          toast.error('Unable to join waiting room without a user identity')
          return
        }
        // User is joining via link - add to waiting room
        console.log('Adding user to waiting room:', effectiveUser)
        addToWaitingRoom(effectiveUser)
        toast.success('Waiting for host approval to join the call')
        return
      }

      // User is the host (starting the call)
      setHostStatus(true)
      startMeeting()
      
      // Check if this is a scheduled meeting
      const scheduledMeeting = getMeetingByRoomId(roomId || '')
      if (scheduledMeeting && scheduledMeeting.hostId === effectiveUser?.id) {
        startScheduledMeeting(scheduledMeeting.id)
      }
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      setIsCallStarted(true)
      toast.success('Call started! Share the link to invite others.')
      
      // Request notification permission for host
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          console.log('Notification permission granted')
        }
      }
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
      // Check if this is a scheduled meeting and end it
      const scheduledMeeting = getMeetingByRoomId(roomId || '')
      if (scheduledMeeting && scheduledMeeting.hostId === currentUser?.id) {
        endScheduledMeeting(scheduledMeeting.id)
      }
      
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

  // Show dashboard if call hasn't started yet
  if (!isCallStarted) {
    return (
      <CallDashboard
        roomId={roomId || ''}
        callType="one-on-one"
        onStartCall={initializeCall}
      />
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-950 text-white flex flex-col">
      <WaitingRoomNotification />
      <WaitingRoomChat />
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/80 px-4 py-3 backdrop-blur sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="font-semibold text-white">Room: {roomId}</h1>
          <div className="flex items-center space-x-2 text-gray-300">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <span className="text-sm">Connected</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isHost && (
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

      {/* Main Content */}
      <div className="relative flex min-h-0 flex-1">
        {/* Video Area */}
        <div className="relative flex-1 min-w-0 pb-24">
          <VideoGrid />
          
          {/* Floating Controls */}
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <div className="flex max-w-[calc(100vw-1rem)] items-center space-x-2 rounded-full border border-white/10 bg-gray-900/85 px-3 py-2 backdrop-blur sm:space-x-3 sm:px-4">
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
                onClick={handleEndCall}
                title="End Call and Leave Meeting"
                variant="danger"
              >
                <PhoneOff />
              </ControlButton>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div
          className={`pointer-events-none absolute right-2 top-2 bottom-20 z-10 w-[min(22rem,calc(100%-1rem))] transition-opacity sm:right-4 sm:top-4 sm:w-80 ${
            hasSidePanel ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="pointer-events-auto h-full overflow-y-auto rounded-2xl border border-white/10 bg-gray-950/55 p-2 backdrop-blur">
          <div className="flex flex-col space-y-2">
          {showWaitingRoom && (
            <div>
              <WaitingRoom />
            </div>
          )}

          {isHost && roomId && (
            <div>
              <MeetingJoinRequestsPanel roomId={roomId} title="Guest join requests" />
            </div>
          )}
          
          {showChat && (
            <div>
              <ChatPanel />
            </div>
          )}
          
          {showTranscription && (
            <div>
              <TranscriptionPanel />
            </div>
          )}
          
          {/* Whiteboard is rendered as a modal overlay */}
          </div>
          </div>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Meeting</h3>
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
