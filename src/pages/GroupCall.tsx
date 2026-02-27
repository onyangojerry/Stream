import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVideoStore } from '../store/useVideoStore'
import { useRecordingStore } from '../store/useRecordingStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
import { useAuthStore } from '../store/useAuthStore'
import { useCallSessionStore } from '../store/useCallSessionStore'
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
  MessageSquare, FileText, Settings, Users, Share2, Copy, Check, MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

const GroupCall = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isHost, setIsHost] = useState(false)
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
    setHostStatus,
    addToWaitingRoom,
    startMeeting,
    endMeeting,
    leaveMeeting,
    reset
  } = useVideoStore()
  const {
    isRecording,
    startRecording,
    stopRecording,
  } = useRecordingStore()

  const { user: currentUser } = useAuthStore()
  const { getMeetingByRoomId, joinMeeting, leaveMeeting: leaveScheduledMeeting } = useSchedulerStore()
  const { setActiveCall, clearActiveCall } = useCallSessionStore()

  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId)
      // Don't automatically initialize call - wait for user to start it
    }
  }, [roomId])

  const initializeGroupCall = async () => {
    try {
      if (!currentUser) {
        toast.error('Please log in to join a call')
        navigate('/login')
        return
      }
      setCurrentUser(currentUser)

      const urlParams = new URLSearchParams(window.location.search)
      const isJoining = urlParams.get('join') === 'true'
      
      if (isJoining) {
        if (roomId) {
          setActiveCall({
            roomId,
            type: 'group',
            route: `/group/${roomId}`,
            title: 'Group Call',
          })
        }
        addToWaitingRoom(currentUser)
        toast.success('Waiting for host approval to join the group call')
        return
      }

      const scheduledMeeting = getMeetingByRoomId(roomId || '')
      if (scheduledMeeting) {
        if (scheduledMeeting.currentAttendees >= scheduledMeeting.attendeeLimit) {
          toast.error('Meeting is full. Cannot join.')
          navigate('/')
          return
        }
        const joined = joinMeeting(scheduledMeeting.id, currentUser.id)
        if (!joined) {
          toast.error('You can only be in one active call at a time.')
          navigate('/')
          return
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      setIsHost(true)
      setHostStatus(true)
      startMeeting()
      setIsCallStarted(true)
      if (roomId) {
        setActiveCall({
          roomId,
          type: 'group',
          route: `/group/${roomId}`,
          title: 'Group Call',
        })
      }
      
      toast.success('Group call started! Share the link to invite others.')
    } catch (error) {
      console.error('Error initializing group call:', error)
      toast.error('Failed to start group call')
    }
  }

  const cleanupGroupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    reset()
  }

  const handleEndCall = () => {
    if (isHost) {
      endMeeting()
    } else {
      leaveMeeting()
    }
    clearActiveCall()
    
    if (roomId) {
      const scheduledMeeting = getMeetingByRoomId(roomId)
      if (scheduledMeeting) {
        leaveScheduledMeeting(scheduledMeeting.id, currentUser?.id)
      }
    }
    
    cleanupGroupCall()
    navigate('/')
    toast.success('Left group call')
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

  const handleRecording = async () => {
    if (!roomId) {
      toast.error('Missing room id for recording')
      return
    }
    if (isRecording) {
      stopRecording()
      toast.success('Recording stopped')
      return
    }
    try {
      await startRecording(roomId, `${currentUser?.name || 'Host'} - ${roomId}`)
      toast.success('Recording started')
    } catch {
      toast.error('Failed to start recording')
    }
  }

  const getMeetingLink = () => {
    return `${window.location.origin}/group/${roomId}?join=true`
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
          title: 'Join my group call',
          text: 'Click the link to join my group call',
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
        callType="group"
        onStartCall={initializeGroupCall}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 border-b border-white/10 bg-gray-900/80 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold tracking-tight">Group Call</h1>
            <span className="text-sm text-gray-300">Room: {roomId}</span>
          </div>
          
          <div />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-32 px-4">
        <VideoGrid />

        <div className="absolute left-3 top-24 z-20 sm:left-4">
          <div className="relative">
            <button
              onClick={() => setShowToolsMenu((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-gray-900/85 px-3 py-2 text-xs font-medium text-white backdrop-blur hover:bg-gray-800/85"
            >
              <MoreVertical className="h-3.5 w-3.5" />
              Tools
            </button>
            {showToolsMenu && (
              <div className="mt-2 w-56 rounded-xl border border-white/10 bg-gray-900/95 p-1 shadow-lg backdrop-blur">
                {isHost && (
                  <button onClick={() => { setShowWaitingRoom((v) => !v); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                    <Users className="h-4 w-4" />
                    {showWaitingRoom ? 'Hide waiting room' : 'Waiting room'}
                  </button>
                )}
                <button onClick={() => { handleShareMeeting(); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                  <Share2 className="h-4 w-4" />
                  Share link
                </button>
                <button onClick={() => { void handleScreenShare(); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                  {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  {isScreenSharing ? 'Stop screen share' : 'Start screen share'}
                </button>
                <button onClick={() => { void handleRecording(); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                  <div className={`h-3.5 w-3.5 rounded-full border ${isRecording ? 'border-red-500 bg-red-500' : 'border-gray-300'}`} />
                  {isRecording ? 'Stop recording' : 'Start recording'}
                </button>
                <button onClick={() => { setShowChat((v) => !v); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                  <MessageSquare className="h-4 w-4" />
                  {showChat ? 'Hide chat' : 'Show chat'}
                </button>
                <button onClick={() => { setShowTranscription((v) => !v); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                  <FileText className="h-4 w-4" />
                  {showTranscription ? 'Hide transcription' : 'Show transcription'}
                </button>
                <button onClick={() => { setShowDocument((v) => !v); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                  <FileText className="h-4 w-4" />
                  {showDocument ? 'Hide document' : 'Collaborative doc'}
                </button>
                <button onClick={() => { setShowSettings((v) => !v); setShowToolsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800">
                  <Settings className="h-4 w-4" />
                  {showSettings ? 'Hide settings' : 'Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1 rounded-full border border-white/10 bg-gray-900/80 px-4 py-2 backdrop-blur">
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
              onClick={() => setShowEndCallConfirm(true)}
              title="End Call"
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

          {isHost && roomId && (
            <div className="w-80">
              <MeetingJoinRequestsPanel roomId={roomId} title="Guest join requests" />
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

      {showEndCallConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:text-white">
            <h3 className="text-base font-semibold">End call?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">This will disconnect you from the current meeting.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowEndCallConfirm(false)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Cancel</button>
              <button onClick={() => { setShowEndCallConfirm(false); handleEndCall() }} className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-sm font-medium text-white">End call</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Meeting Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Group Call</h3>
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
                Anyone with this link can join your group call. Share it securely with your participants.
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

export default GroupCall
