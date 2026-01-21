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

  const { user: currentUser } = useAuthStore()
  const { getMeetingById, startMeeting: startScheduledMeeting, endMeeting: endScheduledMeeting } = useSchedulerStore()

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
          };
          // Set the guest user temporarily (you might want to update the auth store to handle this)
          console.log('Continuing as guest:', guestUser);
        }
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
      
      // Check if this is a scheduled meeting
      const scheduledMeeting = getMeetingById(roomId || '')
      if (scheduledMeeting && scheduledMeeting.hostId === currentUser?.id) {
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
      const scheduledMeeting = getMeetingById(roomId || '')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <WaitingRoomNotification />
      <WaitingRoomChat />
      
      {/* Enhanced Header with subtle gradient */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/30"></div>
              <div className="flex flex-col">
                <h1 className="text-slate-800 dark:text-slate-100 font-semibold text-lg">Room: {roomId}</h1>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Connected & Ready</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isHost && (
              <ControlButton
                onClick={() => setShowWaitingRoom(!showWaitingRoom)}
                title="Manage Waiting Room - Approve/Reject Attendees"
                variant="warning"
                showBadge={waitingRoom.length > 0}
                badgeContent={waitingRoom.length}
                badgeColor="red"
              >
                <Users className="w-4 h-4" />
              </ControlButton>
            )}
            <ControlButton
              onClick={handleShareMeeting}
              title="Share Meeting Link with Others"
              variant="success"
            >
              <Share2 className="w-4 h-4" />
            </ControlButton>
            <ControlButton
              onClick={() => setShowSettings(!showSettings)}
              title="Meeting Settings and Configuration"
              variant="default"
            >
              <Settings className="w-4 h-4" />
            </ControlButton>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Video Area with improved styling */}
        <div className="flex-1 relative p-4">
          <div className="h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <VideoGrid />
          </div>
          
          {/* Enhanced Floating Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center space-x-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-8 py-4 shadow-2xl border border-white/20 dark:border-slate-700/50">
              <ControlButton
                onClick={toggleAudio}
                title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
                variant={isAudioEnabled ? "success" : "danger"}
                className="hover:scale-105 transition-all duration-200"
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </ControlButton>
              
              <ControlButton
                onClick={toggleVideo}
                title={isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
                variant={isVideoEnabled ? "success" : "danger"}
                className="hover:scale-105 transition-all duration-200"
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </ControlButton>
              
              <ControlButton
                onClick={handleScreenShare}
                title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
                variant={isScreenSharing ? "active" : "default"}
                className="hover:scale-105 transition-all duration-200"
              >
                {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </ControlButton>
              
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2"></div>
              
              <ControlButton
                onClick={() => setShowChat(!showChat)}
                title="Toggle Chat Panel"
                variant={showChat ? 'active' : 'default'}
                className="hover:scale-105 transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5" />
              </ControlButton>
              
              <ControlButton
                onClick={() => setShowTranscription(!showTranscription)}
                title="Toggle Live Transcription"
                variant={showTranscription ? 'active' : 'default'}
                className="hover:scale-105 transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
              </ControlButton>
              
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2"></div>
              
              <ControlButton
                onClick={handleEndCall}
                title="End Call and Leave Meeting"
                variant="danger"
                className="hover:scale-105 transition-all duration-200 bg-red-500/10 hover:bg-red-500/20 border-red-200 dark:border-red-800"
              >
                <PhoneOff className="w-5 h-5" />
              </ControlButton>
            </div>
          </div>
        </div>

        {/* Enhanced Side Panels */}
        <div className="flex flex-col space-y-4 p-4 w-80">
          {showWaitingRoom && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <WaitingRoom />
            </div>
          )}
          
          {showChat && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <ChatPanel />
            </div>
          )}
          
          {showTranscription && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <TranscriptionPanel />
            </div>
          )}
        </div>
      </div>

      {/* Collaborative Document */}
      {showDocument && (
        <CollaborativeDocument />
      )}

      {/* Enhanced Share Meeting Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Share Meeting</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Meeting Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={getMeetingLink()}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-12"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleShareNative}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                >
                  Share Link
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  Cancel
                </button>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <div className="w-5 h-5 text-blue-500 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.351 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Secure Sharing</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Anyone with this link can join your meeting. Share it securely with your participants.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoCall
