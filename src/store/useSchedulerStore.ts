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
  addMeeting: (meeting: Omit<ScheduledMeeting, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMeeting: (id: string, updates: Partial<ScheduledMeeting>) => void
  deleteMeeting: (id: string) => void
  getMeetingById: (id: string) => ScheduledMeeting | undefined
  getUpcomingMeetings: () => ScheduledMeeting[]
  getPastMeetings: () => ScheduledMeeting[]
  joinMeeting: (meetingId: string) => boolean
  leaveMeeting: (meetingId: string) => void
}

const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const useSchedulerStore = create<SchedulerState>()(
  persist(
    (set, get) => ({
      scheduledMeetings: [],
      
      addMeeting: (meetingData) => {
        const newMeeting: ScheduledMeeting = {
          ...meetingData,
          id: `meeting-${Date.now()}`,
          roomId: generateRoomId(),
          currentAttendees: 0,
          isActive: false,
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
        const now = new Date()
        return get().scheduledMeetings
          .filter(meeting => meeting.endTime < now)
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
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
