import { create } from 'zustand'
import { VideoStream, Message, TranscriptionResult, ScreenShare, Recording } from '../types'
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
  addParticipant: (participant: User) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<User>) => void;
  
  // Connection state
  isConnected: boolean;
  setConnectionState: (connected: boolean) => void;
  
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
  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
  toggleVideo: () => set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  
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
  
  // Connection state
  isConnected: false,
  setConnectionState: (connected) => set({ isConnected: connected }),
  
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
    isConnected: false,
  }),
}))
