import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor,
  MonitorOff,
  Settings, 
  MessageSquare, 
  Users,
  Share2,
  FileText
} from 'lucide-react';
import VideoGrid from '../components/VideoGrid';
import ControlButton from '../components/ControlButton';
import ChatPanel from '../components/ChatPanel';
import TranscriptionPanel from '../components/TranscriptionPanel';
import WaitingRoom from '../components/WaitingRoom';
import WaitingRoomNotification from '../components/WaitingRoomNotification';
import WaitingRoomChat from '../components/WaitingRoomChat';
import CollaborativeDocument from '../components/CollaborativeDocument';
import MeetingConfirmationModal from '../components/MeetingConfirmationModal';
import { useAuthStore } from '../store/useAuthStore';
import { useVideoStore } from '../store/videoStore';
import { showNotification } from '../utils/notifications';

interface Participant {
  id: string;
  name: string;
  isHost?: boolean;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  joinedAt?: Date;
  avatar?: string;
}

export default function VideoCall() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    isVideoEnabled, 
    isAudioEnabled, 
    isScreenSharing,
    toggleVideo, 
    toggleAudio, 
    toggleScreenShare 
  } = useVideoStore();
  
  // Local state
  const [isHost] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [waitingRoom, setWaitingRoom] = useState<Participant[]>([]);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMeetingConfirm, setShowMeetingConfirm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // WebRTC refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Initialize WebRTC
  const initializeCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      showNotification('Connected to meeting room', 'success');
    } catch (error) {
      console.error('Failed to initialize call:', error);
      showNotification('Failed to access camera/microphone', 'error');
    }
  }, [isVideoEnabled, isAudioEnabled]);

  // Handle screen sharing
  const handleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        toggleScreenShare();
        showNotification('Screen sharing started', 'success');
      } else {
        toggleScreenShare();
        showNotification('Screen sharing stopped', 'info');
      }
    } catch (error) {
      console.error('Screen sharing failed:', error);
      showNotification('Screen sharing failed', 'error');
    }
  }, [isScreenSharing, toggleScreenShare]);

  // Handle share meeting
  const handleShareMeeting = useCallback(() => {
    setShowShareModal(true);
  }, []);

  // Handle copy meeting link
  const copyMeetingLink = useCallback(() => {
    const meetingLink = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(meetingLink);
    showNotification('Meeting link copied to clipboard', 'success');
    setShowShareModal(false);
  }, [roomId]);

  // Handle end call
  const handleEndCall = useCallback(() => {
    setShowMeetingConfirm(true);
  }, []);

  const confirmEndCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    showNotification('Call ended', 'info');
    navigate('/');
  }, [navigate]);

  // Initialize on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    initializeCall();
    
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user, navigate, initializeCall]);

  // Show meeting confirmation before starting if needed
  if (!roomId) {
    return (
      <MeetingConfirmationModal
        isOpen={true}
        onClose={() => navigate('/')}
        onConfirm={initializeCall}
        roomId={roomId || 'new-room'}
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
                title="Manage Waiting Room"
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
              title="Share Meeting Link"
              variant="success"
            >
              <Share2 className="w-4 h-4" />
            </ControlButton>
            <ControlButton
              onClick={() => setShowSettings(!showSettings)}
              title="Meeting Settings"
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
                className="hover:scale-105 transition-all duration-200"
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
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Share Meeting</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Meeting Link
                </label>
                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                  <input
                    type="text"
                    value={`${window.location.origin}/join/${roomId}`}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-slate-600 dark:text-slate-300"
                  />
                  <button
                    onClick={copyMeetingLink}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                Share this link with participants to let them join your meeting.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting End Confirmation Modal */}
      <MeetingConfirmationModal
        isOpen={showMeetingConfirm}
        onClose={() => setShowMeetingConfirm(false)}
        onConfirm={confirmEndCall}
        roomId={roomId || ''}
        callType="end-call"
        onStartCall={() => {}}
      />
    </div>
  );
}