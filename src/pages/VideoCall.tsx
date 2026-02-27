import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVideoStore } from '../store/useVideoStore'
import { useRecordingStore } from '../store/useRecordingStore'
import { useAuthStore } from '../store/useAuthStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
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
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, FileText, Settings, Share2, Copy, Check, Users, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'

type ToolWindowKey = 'waitingRoom' | 'joinRequests' | 'chat' | 'transcription'
type ToolWindowSize = 'compact' | 'expanded'
type ToolWindowState = Record<ToolWindowKey, {
  open: boolean
  pinned: boolean
  size: ToolWindowSize
  position: { x: number; y: number }
}>

const VideoCall = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false)
  const [toolWindows, setToolWindows] = useState<ToolWindowState>({
    waitingRoom: { open: false, pinned: false, size: 'compact', position: { x: 24, y: 96 } },
    joinRequests: { open: false, pinned: false, size: 'compact', position: { x: 360, y: 96 } },
    chat: { open: false, pinned: false, size: 'compact', position: { x: 24, y: 370 } },
    transcription: { open: false, pinned: false, size: 'compact', position: { x: 360, y: 370 } },
  })
  const [draggingTool, setDraggingTool] = useState<{ key: ToolWindowKey; offsetX: number; offsetY: number } | null>(null)
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
  const {
    isRecording,
    startRecording,
    stopRecording,
  } = useRecordingStore()
  const { user: currentUser } = useAuthStore()
  const { getMeetingByRoomId, startMeeting: startScheduledMeeting, endMeeting: endScheduledMeeting } = useSchedulerStore()
  const { setActiveCall, clearActiveCall } = useCallSessionStore()

  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId)
      // Don't automatically initialize call - wait for user to start it
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

  useEffect(() => {
    if (!draggingTool) return
    const handleMouseMove = (event: MouseEvent) => {
      setToolWindows((prev) => ({
        ...prev,
        [draggingTool.key]: {
          ...prev[draggingTool.key],
          position: {
            x: Math.max(12, event.clientX - draggingTool.offsetX),
            y: Math.max(70, event.clientY - draggingTool.offsetY),
          },
        },
      }))
    }
    const handleMouseUp = () => setDraggingTool(null)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingTool])

  const initializeCall = async () => {
    try {
      if (!currentUser) {
        toast.error('Sign in or create an account to start or join a call')
        navigate('/login', { state: { from: { pathname: `/call/${roomId || ''}`, search: window.location.search } } })
        return
      }
      const effectiveUser = currentUser
      setCurrentUser(currentUser)

      // Check if user is joining via link (not the host)
      const urlParams = new URLSearchParams(window.location.search)
      const isJoining = urlParams.get('join') === 'true'
      
      if (isJoining) {
        if (!effectiveUser) {
          toast.error('Unable to join waiting room without a user identity')
          return
        }
        if (roomId) {
          setActiveCall({
            roomId,
            type: 'one-on-one',
            route: `/call/${roomId}`,
            title: 'One-on-One Call',
          })
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
      if (roomId) {
        setActiveCall({
          roomId,
          type: 'one-on-one',
          route: `/call/${roomId}`,
          title: 'One-on-One Call',
        })
      }
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
      clearActiveCall()
      cleanupCall()
      navigate('/')
      toast.success('Call ended')
    } else {
      leaveMeeting()
      clearActiveCall()
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

  const handleRecording = async () => {
    if (!roomId) {
      toast.error('Missing room id for recording')
      return
    }
    if (!isRecording) {
      try {
        await startRecording(roomId, `${currentUser?.name || 'Host'} - ${roomId}`)
        toast.success('Recording started')
      } catch {
        toast.error('Failed to start recording')
      }
      return
    }
    stopRecording()
    toast.success('Recording stopped')
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

  const openToolWindow = (key: ToolWindowKey) => {
    setToolWindows((prev) => {
      const next = { ...prev }
      ;(Object.keys(next) as ToolWindowKey[]).forEach((entry) => {
        if (!next[entry].pinned) {
          next[entry] = { ...next[entry], open: false }
        }
      })
      next[key] = { ...next[key], open: true }
      return next
    })
    setShowToolsMenu(false)
  }

  const closeToolWindow = (key: ToolWindowKey) => {
    setToolWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], open: false },
    }))
  }

  const togglePinToolWindow = (key: ToolWindowKey) => {
    setToolWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], pinned: !prev[key].pinned },
    }))
  }

  const toggleToolWindowSize = (key: ToolWindowKey) => {
    setToolWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], size: prev[key].size === 'compact' ? 'expanded' : 'compact' },
    }))
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
        
        <div />
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-0 flex-1">
        {/* Video Area */}
        <div className="relative flex-1 min-w-0 pb-24">
          <VideoGrid />

          <div className="absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
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
                    <button
                      onClick={() => openToolWindow('waitingRoom')}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                    >
                      <Users className="h-4 w-4" />
                      Waiting room
                    </button>
                  )}
                  {isHost && roomId && (
                    <button
                      onClick={() => openToolWindow('joinRequests')}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                    >
                      <Users className="h-4 w-4" />
                      Join requests
                    </button>
                  )}
                  <button
                    onClick={() => { handleShareMeeting(); setShowToolsMenu(false) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <Share2 className="h-4 w-4" />
                    Share link
                  </button>
                  <button
                    onClick={() => { void handleScreenShare(); setShowToolsMenu(false) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    {isScreenSharing ? 'Stop screen share' : 'Start screen share'}
                  </button>
                  <button
                    onClick={() => { void handleRecording(); setShowToolsMenu(false) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <div className={`h-3.5 w-3.5 rounded-full border ${isRecording ? 'border-red-500 bg-red-500' : 'border-gray-300'}`} />
                    {isRecording ? 'Stop recording' : 'Start recording'}
                  </button>
                  <button
                    onClick={() => openToolWindow('chat')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </button>
                  <button
                    onClick={() => openToolWindow('transcription')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <FileText className="h-4 w-4" />
                    Transcription
                  </button>
                  <button
                    onClick={() => { setShowDocument((v) => !v); setShowToolsMenu(false) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <FileText className="h-4 w-4" />
                    {showDocument ? 'Hide document' : 'Collaborative doc'}
                  </button>
                  <button
                    onClick={() => { setShowSettings((v) => !v); setShowToolsMenu(false) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                    {showSettings ? 'Hide settings' : 'Settings'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Floating Controls */}
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <div className="flex max-w-[calc(100vw-1rem)] items-center space-x-1 rounded-full border border-white/10 bg-gray-900/85 px-3 py-2 backdrop-blur sm:space-x-2 sm:px-4">
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
        </div>

        {(Object.keys(toolWindows) as ToolWindowKey[]).map((key) => {
          const tool = toolWindows[key]
          if (!tool.open) return null
          const width = tool.size === 'expanded' ? 420 : 320
          const height = tool.size === 'expanded' ? 320 : 240
          const titleMap: Record<ToolWindowKey, string> = {
            waitingRoom: 'Waiting Room',
            joinRequests: 'Join Requests',
            chat: 'Chat',
            transcription: 'Transcription',
          }
          const renderContent = () => {
            if (key === 'waitingRoom') return <WaitingRoom />
            if (key === 'joinRequests' && roomId && isHost) return <MeetingJoinRequestsPanel roomId={roomId} title="Guest join requests" />
            if (key === 'chat') return <ChatPanel />
            if (key === 'transcription') return <TranscriptionPanel />
            return null
          }

          return (
            <div
              key={key}
              className="absolute z-20 overflow-hidden rounded-xl border border-white/15 bg-gray-900/85 backdrop-blur"
              style={{ left: tool.position.x, top: tool.position.y, width, height }}
            >
              <div
                className="flex cursor-move items-center justify-between border-b border-white/10 px-2 py-1.5 text-xs text-gray-200"
                onMouseDown={(event) => setDraggingTool({ key, offsetX: event.clientX - tool.position.x, offsetY: event.clientY - tool.position.y })}
              >
                <span className="font-medium">{titleMap[key]}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleToolWindowSize(key)} className="rounded px-1.5 py-0.5 hover:bg-gray-800">{tool.size === 'expanded' ? '−' : '+'}</button>
                  <button onClick={() => togglePinToolWindow(key)} className={`rounded px-1.5 py-0.5 hover:bg-gray-800 ${tool.pinned ? 'text-emerald-300' : ''}`}>{tool.pinned ? 'Pinned' : 'Pin'}</button>
                  <button onClick={() => closeToolWindow(key)} className="rounded px-1.5 py-0.5 hover:bg-gray-800">×</button>
                </div>
              </div>
              <div className="h-[calc(100%-2rem)] overflow-auto p-1">
                {renderContent()}
              </div>
            </div>
          )
        })}
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
