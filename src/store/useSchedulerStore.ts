import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  addMeeting: (meeting: Omit<ScheduledMeeting, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMeeting: (id: string, updates: Partial<ScheduledMeeting>) => void
  deleteMeeting: (id: string) => void
  getMeetingById: (id: string) => ScheduledMeeting | undefined
  getUpcomingMeetings: () => ScheduledMeeting[]
  getPastMeetings: () => ScheduledMeeting[]
  getActiveMeetings: () => ScheduledMeeting[]
  startMeeting: (meetingId: string) => void
  endMeeting: (meetingId: string) => void
  joinMeeting: (meetingId: string) => boolean
  leaveMeeting: (meetingId: string) => void
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
      
      addMeeting: (meetingData) => {
        const newMeeting: ScheduledMeeting = {
          ...meetingData,
          id: `meeting-${Date.now()}`,
          roomId: generateRoomId(),
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
      },
      
      updateMeeting: (id, updates) => {
        set((state) => ({
          scheduledMeetings: state.scheduledMeetings.map(meeting =>
            meeting.id === id
              ? { ...meeting, ...updates, updatedAt: new Date() }
              : meeting
          )
        }))
      },
      
      deleteMeeting: (id) => {
        set((state) => ({
          scheduledMeetings: state.scheduledMeetings.filter(meeting => meeting.id !== id)
        }))
      },
      
      getMeetingById: (id) => {
        return get().scheduledMeetings.find(meeting => meeting.id === id)
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
      
      joinMeeting: (meetingId) => {
        const meeting = get().getMeetingById(meetingId)
        if (!meeting) return false
        
        if (meeting.currentAttendees >= meeting.attendeeLimit) {
          return false // Meeting is full
        }
        
        get().updateMeeting(meetingId, {
          currentAttendees: meeting.currentAttendees + 1
        })
        
        return true
      },
      
      leaveMeeting: (meetingId) => {
        const meeting = get().getMeetingById(meetingId)
        if (!meeting) return
        
        get().updateMeeting(meetingId, {
          currentAttendees: Math.max(0, meeting.currentAttendees - 1)
        })
      },
    }),
    {
      name: 'striim-scheduler',
    }
  )
)
