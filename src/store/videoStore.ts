import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Participant {
  id: string
  name: string
  isHost: boolean
  isMuted: boolean
  isVideoEnabled: boolean
  stream?: MediaStream
}

export interface VideoStoreState {
  participants: Participant[]
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  currentRoom: string | null
  
  // Actions
  addParticipant: (participant: Participant) => void
  removeParticipant: (participantId: string) => void
  toggleVideo: () => void
  toggleAudio: () => void
  toggleScreenShare: () => void
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
}

export const useVideoStore = create<VideoStoreState>()(
  persist(
    (set, get) => ({
      participants: [],
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      currentRoom: null,
      
      addParticipant: (participant) => set((state) => ({
        participants: [...state.participants, participant]
      })),
      
      removeParticipant: (participantId) => set((state) => ({
        participants: state.participants.filter(p => p.id !== participantId)
      })),
      
      toggleVideo: () => set((state) => ({
        isVideoEnabled: !state.isVideoEnabled
      })),
      
      toggleAudio: () => set((state) => ({
        isAudioEnabled: !state.isAudioEnabled
      })),
      
      toggleScreenShare: () => set((state) => ({
        isScreenSharing: !state.isScreenSharing
      })),
      
      joinRoom: (roomId) => set({
        currentRoom: roomId
      }),
      
      leaveRoom: () => set({
        currentRoom: null,
        participants: []
      })
    }),
    {
      name: 'video-store',
      partialize: (state) => ({
        isVideoEnabled: state.isVideoEnabled,
        isAudioEnabled: state.isAudioEnabled
      })
    }
  )
)