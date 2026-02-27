import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  deleteScheduledMeeting as deleteScheduledMeetingRemote,
  fetchScheduledMeetings,
  upsertScheduledMeeting,
} from '../services/schedulerApi'

export interface ScheduledMeeting {
  id: string
  title: string
  description: string
  type: 'one-on-one' | 'group' | 'webinar'
  startTime: Date
  endTime: Date
  hostId: string
  hostName: string
  attendeeLimit: number
  currentAttendees: number
  roomId: string
  isPublicListing: boolean
  joinedUserIds: string[]
  isActive: boolean
  isStarted: boolean
  isEnded: boolean
  actualStartTime?: Date
  actualEndTime?: Date
  duration?: number // in seconds
  createdAt: Date
  updatedAt: Date
  settings: {
    allowScreenShare: boolean
    allowRecording: boolean
    allowChat: boolean
    allowTranscription: boolean
    autoMuteOnJoin: boolean
    waitingRoom: boolean
  }
}

interface SchedulerState {
  scheduledMeetings: ScheduledMeeting[]
  activeMeetings: ScheduledMeeting[]
  initializeScheduler: () => Promise<void>
  addMeeting: (meeting: Omit<ScheduledMeeting, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMeeting: (id: string, updates: Partial<ScheduledMeeting>) => void
  deleteMeeting: (id: string) => void
  getMeetingById: (id: string) => ScheduledMeeting | undefined
  getMeetingByRoomId: (roomId: string) => ScheduledMeeting | undefined
  getMyOngoingMeetings: (userId: string) => ScheduledMeeting[]
  getUserActiveMeeting: (userId: string) => ScheduledMeeting | undefined
  getUpcomingMeetings: () => ScheduledMeeting[]
  getPastMeetings: () => ScheduledMeeting[]
  getActiveMeetings: () => ScheduledMeeting[]
  startMeeting: (meetingId: string) => void
  endMeeting: (meetingId: string) => void
  joinMeeting: (meetingId: string, userId?: string) => boolean
  leaveMeeting: (meetingId: string, userId?: string) => void
  updateMeetingDuration: (meetingId: string) => void
}

const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const useSchedulerStore = create<SchedulerState>()(
  persist(
    (set, get) => ({
      scheduledMeetings: [],
      activeMeetings: [],
      initializeScheduler: async () => {
        try {
          const remoteMeetings = await fetchScheduledMeetings()
          if (!remoteMeetings.length) return
          set({ scheduledMeetings: remoteMeetings })
        } catch (error) {
          console.warn('Failed to load scheduled meetings', error)
        }
      },
      
      addMeeting: (meetingData) => {
        const newMeeting: ScheduledMeeting = {
          ...meetingData,
          id: `meeting-${Date.now()}`,
          roomId: generateRoomId(),
          isPublicListing: meetingData.isPublicListing ?? false,
          joinedUserIds: meetingData.joinedUserIds ?? [],
          currentAttendees: 0,
          isActive: false,
          isStarted: false,
          isEnded: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          scheduledMeetings: [...state.scheduledMeetings, newMeeting]
        }))
        void upsertScheduledMeeting(newMeeting).catch((error) => {
          console.warn('Failed to persist scheduled meeting', error)
        })
      },
      
      updateMeeting: (id, updates) => {
        set((state) => ({
          scheduledMeetings: state.scheduledMeetings.map(meeting => {
            if (meeting.id !== id) return meeting
            const nextMeeting = { ...meeting, ...updates, updatedAt: new Date() }
            void upsertScheduledMeeting(nextMeeting).catch((error) => {
              console.warn('Failed to update scheduled meeting', error)
            })
            return nextMeeting
          })
        }))
      },
      
      deleteMeeting: (id) => {
        set((state) => ({
          scheduledMeetings: state.scheduledMeetings.filter(meeting => meeting.id !== id)
        }))
        void deleteScheduledMeetingRemote(id).catch((error) => {
          console.warn('Failed to delete scheduled meeting', error)
        })
      },
      
      getMeetingById: (id) => {
        return get().scheduledMeetings.find(meeting => meeting.id === id)
      },

      getMeetingByRoomId: (roomId) => {
        return get().scheduledMeetings.find(meeting => meeting.roomId === roomId)
      },

      getMyOngoingMeetings: (userId) => {
        return get().scheduledMeetings
          .filter((meeting) => meeting.isStarted && !meeting.isEnded && (meeting.hostId === userId || meeting.joinedUserIds.includes(userId)))
          .sort((a, b) => (b.actualStartTime || b.startTime).getTime() - (a.actualStartTime || a.startTime).getTime())
      },

      getUserActiveMeeting: (userId) => {
        return get().scheduledMeetings.find(
          (meeting) => meeting.isStarted && !meeting.isEnded && (meeting.hostId === userId || meeting.joinedUserIds.includes(userId)),
        )
      },
      
      getUpcomingMeetings: () => {
        const now = new Date()
        return get().scheduledMeetings
          .filter(meeting => meeting.startTime > now)
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      },
      
      getPastMeetings: () => {
        return get().scheduledMeetings
          .filter(meeting => meeting.isEnded)
          .sort((a, b) => (b.actualEndTime || b.endTime).getTime() - (a.actualEndTime || a.endTime).getTime())
      },

      getActiveMeetings: () => {
        const activeMeetings = get().scheduledMeetings
          .filter(meeting => meeting.isStarted && !meeting.isEnded)
          .sort((a, b) => (a.actualStartTime || a.startTime).getTime() - (b.actualStartTime || b.startTime).getTime())
        
        // Update the activeMeetings state
        set({ activeMeetings })
        return activeMeetings
      },

      startMeeting: (meetingId) => {
        const meeting = get().getMeetingById(meetingId)
        if (!meeting) return
        
        get().updateMeeting(meetingId, {
          isStarted: true,
          isActive: true,
          actualStartTime: new Date()
        })
      },

      endMeeting: (meetingId) => {
        const meeting = get().getMeetingById(meetingId)
        if (!meeting) return
        
        const actualEndTime = new Date()
        const duration = meeting.actualStartTime 
          ? Math.floor((actualEndTime.getTime() - meeting.actualStartTime.getTime()) / 1000)
          : 0
        
        get().updateMeeting(meetingId, {
          isEnded: true,
          isActive: false,
          actualEndTime,
          duration
        })
      },

      updateMeetingDuration: (meetingId) => {
        const meeting = get().getMeetingById(meetingId)
        if (!meeting || !meeting.isStarted || meeting.isEnded || !meeting.actualStartTime) return
        
        const duration = Math.floor((new Date().getTime() - meeting.actualStartTime.getTime()) / 1000)
        get().updateMeeting(meetingId, { duration })
      },
      
      joinMeeting: (meetingId, userId) => {
        const meeting = get().getMeetingById(meetingId)
        if (!meeting) return false
        
        if (meeting.currentAttendees >= meeting.attendeeLimit) {
          return false // Meeting is full
        }

        if (userId) {
          const existing = get().getUserActiveMeeting(userId)
          if (existing && existing.id !== meetingId) {
            return false
          }
          if (meeting.joinedUserIds.includes(userId) || meeting.hostId === userId) {
            return true
          }
        }
        
        get().updateMeeting(meetingId, {
          currentAttendees: meeting.currentAttendees + 1,
          joinedUserIds: userId ? [...meeting.joinedUserIds, userId] : meeting.joinedUserIds,
        })
        
        return true
      },
      
      leaveMeeting: (meetingId, userId) => {
        const meeting = get().getMeetingById(meetingId)
        if (!meeting) return
        
        get().updateMeeting(meetingId, {
          currentAttendees: Math.max(0, meeting.currentAttendees - 1),
          joinedUserIds: userId ? meeting.joinedUserIds.filter((id) => id !== userId) : meeting.joinedUserIds,
        })
      },
    }),
    {
      name: 'striim-scheduler',
      onRehydrateStorage: () => (state) => {
        if (!state) return

        const reviveMeeting = (meeting: ScheduledMeeting): ScheduledMeeting => ({
          ...meeting,
          isPublicListing: typeof meeting.isPublicListing === 'boolean' ? meeting.isPublicListing : false,
          joinedUserIds: Array.isArray(meeting.joinedUserIds) ? meeting.joinedUserIds : [],
          startTime: new Date(meeting.startTime),
          endTime: new Date(meeting.endTime),
          createdAt: new Date(meeting.createdAt),
          updatedAt: new Date(meeting.updatedAt),
          actualStartTime: meeting.actualStartTime ? new Date(meeting.actualStartTime) : undefined,
          actualEndTime: meeting.actualEndTime ? new Date(meeting.actualEndTime) : undefined,
        })

        state.scheduledMeetings = state.scheduledMeetings.map(reviveMeeting)
        state.activeMeetings = state.activeMeetings.map(reviveMeeting)
      },
    }
  )
)
