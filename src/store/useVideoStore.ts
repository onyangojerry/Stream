import { create } from 'zustand'
import { VideoStream, Message, TranscriptionResult, ScreenShare, Recording } from '../types'
import { playNotificationSound, showBrowserNotification } from '../utils/notifications'
import { User } from './useAuthStore'

interface VideoState {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  
  // Room state
  currentRoom: string | null;
  setCurrentRoom: (roomId: string) => void;
  
  // Media streams
  localStream: MediaStream | null;
  remoteStreams: VideoStream[];
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (stream: VideoStream) => void;
  removeRemoteStream: (userId: string) => void;
  updateRemoteStream: (userId: string, updates: Partial<VideoStream>) => void;
  
  // Media controls
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  stopScreenShare: () => void;
  
  // Chat
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  // Transcription
  transcriptionResults: TranscriptionResult[];
  isTranscriptionEnabled: boolean;
  transcriptionMode: 'speech' | 'sign-language' | 'both';
  addTranscriptionResult: (result: TranscriptionResult) => void;
  toggleTranscription: () => void;
  setTranscriptionMode: (mode: 'speech' | 'sign-language' | 'both') => void;
  clearTranscription: () => void;
  
  // Screen sharing
  screenShare: ScreenShare | null;
  setScreenShare: (screenShare: ScreenShare | null) => void;
  
  // Recording
  isRecording: boolean;
  recordings: Recording[];
  startRecording: () => void;
  stopRecording: () => void;
  addRecording: (recording: Recording) => void;
  
  // Participants
  participants: User[];
  waitingRoom: User[];
  isHost: boolean;
  showWaitingRoomNotification: boolean;
  addParticipant: (participant: User) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<User>) => void;
  addToWaitingRoom: (user: User) => void;
  removeFromWaitingRoom: (userId: string) => void;
  approveAttendee: (userId: string) => void;
  rejectAttendee: (userId: string) => void;
  setHostStatus: (isHost: boolean) => void;
  dismissWaitingRoomNotification: () => void;
  
  // Connection state
  isConnected: boolean;
  setConnectionState: (connected: boolean) => void;
  
  // Meeting lifecycle
  isMeetingActive: boolean;
  startMeeting: () => void;
  endMeeting: () => void;
  leaveMeeting: () => void;
  
  // Reset
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  // User state
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Room state
  currentRoom: null,
  setCurrentRoom: (roomId) => set({ currentRoom: roomId }),
  
  // Media streams
  localStream: null,
  remoteStreams: [],
  setLocalStream: (stream) => set({ localStream: stream }),
  addRemoteStream: (stream) => set((state) => ({
    remoteStreams: [...state.remoteStreams.filter(s => s.id !== stream.id), stream]
  })),
  removeRemoteStream: (userId) => set((state) => ({
    remoteStreams: state.remoteStreams.filter(s => s.user.id !== userId)
  })),
  updateRemoteStream: (userId, updates) => set((state) => ({
    remoteStreams: state.remoteStreams.map(s => 
      s.user.id === userId ? { ...s, ...updates } : s
    )
  })),
  
  // Media controls
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  toggleAudio: () => set((state) => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !state.isAudioEnabled;
      }
    }
    return { isAudioEnabled: !state.isAudioEnabled };
  }),
  toggleVideo: () => set((state) => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !state.isVideoEnabled;
      }
    }
    return { isVideoEnabled: !state.isVideoEnabled };
  }),
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  stopScreenShare: () => set((state) => {
    if (state.screenShare) {
      // Stop all tracks in the screen share stream
      state.screenShare.stream.getTracks().forEach(track => track.stop());
    }
    return { 
      isScreenSharing: false, 
      screenShare: null 
    };
  }),
  
  // Chat
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  
  // Transcription
  transcriptionResults: [],
  isTranscriptionEnabled: false,
  transcriptionMode: 'speech',
  addTranscriptionResult: (result) => set((state) => ({
    transcriptionResults: [...state.transcriptionResults, result]
  })),
  toggleTranscription: () => set((state) => ({ 
    isTranscriptionEnabled: !state.isTranscriptionEnabled 
  })),
  setTranscriptionMode: (mode) => set({ transcriptionMode: mode }),
  clearTranscription: () => set({ transcriptionResults: [] }),
  
  // Screen sharing
  screenShare: null,
  setScreenShare: (screenShare) => set({ screenShare }),
  
  // Recording
  isRecording: false,
  recordings: [],
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  addRecording: (recording) => set((state) => ({ 
    recordings: [...state.recordings, recording] 
  })),
  
  // Participants
  participants: [],
  waitingRoom: [],
  isHost: false,
  showWaitingRoomNotification: false,
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants.filter(p => p.id !== participant.id), participant]
  })),
  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== userId)
  })),
  updateParticipant: (userId, updates) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === userId ? { ...p, ...updates } : p
    )
  })),
  addToWaitingRoom: (user) => set((state) => {
    const isNewUser = !state.waitingRoom.find(u => u.id === user.id);
    
    console.log('addToWaitingRoom called:', { user, isNewUser, isHost: state.isHost, currentWaitingRoom: state.waitingRoom.length })
    
    if (isNewUser) {
      // Always trigger notification for new users
      // Play notification sound
      playNotificationSound();
      
      // Show browser notification if host
      if (state.isHost) {
        showBrowserNotification(
          'New Attendee Waiting',
          {
            body: `${user.name} is waiting to join the meeting`,
            icon: '/favicon.ico',
            tag: 'waiting-room-notification'
          }
        );
      }
    }
    
    const newState = {
      waitingRoom: [...state.waitingRoom.filter(u => u.id !== user.id), user],
      // Always trigger notification for new users
      ...(isNewUser && { showWaitingRoomNotification: true })
    };
    
    console.log('New waiting room state:', newState)
    return newState;
  }),
  removeFromWaitingRoom: (userId) => set((state) => ({
    waitingRoom: state.waitingRoom.filter(u => u.id !== userId)
  })),
  approveAttendee: (userId) => set((state) => {
    const user = state.waitingRoom.find(u => u.id === userId);
    if (user) {
      // Show browser notification to approved user
      if (!state.isHost && state.currentUser?.id === userId) {
        showBrowserNotification(
          'Welcome to the Meeting!',
          {
            body: 'You have been approved to join the meeting',
            icon: '/favicon.ico',
            tag: 'approval-notification'
          }
        );
        playNotificationSound();
      }
      
      return {
        participants: [...state.participants, user],
        waitingRoom: state.waitingRoom.filter(u => u.id !== userId)
      };
    }
    return state;
  }),
  rejectAttendee: (userId) => set((state) => ({
    waitingRoom: state.waitingRoom.filter(u => u.id !== userId)
  })),
  setHostStatus: (isHost) => set({ isHost }),
  dismissWaitingRoomNotification: () => set({ showWaitingRoomNotification: false }),
  
  // Connection state
  isConnected: false,
  setConnectionState: (connected) => set({ isConnected: connected }),
  
  // Meeting lifecycle
  isMeetingActive: false,
  startMeeting: () => set({ isMeetingActive: true }),
  endMeeting: () => set({ isMeetingActive: false }),
  leaveMeeting: () => set({ isMeetingActive: false }),
  
  // Reset
  reset: () => set({
    currentRoom: null,
    localStream: null,
    remoteStreams: [],
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    messages: [],
    transcriptionResults: [],
    isTranscriptionEnabled: false,
    screenShare: null,
    isRecording: false,
    participants: [],
    waitingRoom: [],
    isHost: false,
    showWaitingRoomNotification: false,
    isConnected: false,
    isMeetingActive: false,
  }),
}))
