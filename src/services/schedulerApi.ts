import { supabase, isSupabaseConfigured } from '../lib/supabase'

export type RemoteScheduledMeeting = {
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
  duration?: number
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

const TABLE = 'scheduled_meetings'
const RSVP_TABLE = 'meeting_rsvps'

const configured = () => isSupabaseConfigured
const toDate = (value?: string | Date | null) => (value ? new Date(value) : undefined)

const toRow = (meeting: RemoteScheduledMeeting) => ({
  id: meeting.id,
  title: meeting.title,
  description: meeting.description,
  type: meeting.type,
  start_time: meeting.startTime.toISOString(),
  end_time: meeting.endTime.toISOString(),
  host_id: meeting.hostId,
  host_name: meeting.hostName,
  attendee_limit: meeting.attendeeLimit,
  current_attendees: meeting.currentAttendees,
  room_id: meeting.roomId,
  is_public_listing: meeting.isPublicListing,
  joined_user_ids: meeting.joinedUserIds,
  is_active: meeting.isActive,
  is_started: meeting.isStarted,
  is_ended: meeting.isEnded,
  actual_start_time: meeting.actualStartTime?.toISOString() ?? null,
  actual_end_time: meeting.actualEndTime?.toISOString() ?? null,
  duration: meeting.duration ?? null,
  settings: meeting.settings,
  created_at: meeting.createdAt.toISOString(),
  updated_at: meeting.updatedAt.toISOString(),
})

const fromRow = (row: any): RemoteScheduledMeeting => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  type: row.type,
  startTime: new Date(row.start_time),
  endTime: new Date(row.end_time),
  hostId: row.host_id,
  hostName: row.host_name,
  attendeeLimit: row.attendee_limit,
  currentAttendees: row.current_attendees,
  roomId: row.room_id,
  isPublicListing: Boolean(row.is_public_listing),
  joinedUserIds: row.joined_user_ids ?? [],
  isActive: Boolean(row.is_active),
  isStarted: Boolean(row.is_started),
  isEnded: Boolean(row.is_ended),
  actualStartTime: toDate(row.actual_start_time),
  actualEndTime: toDate(row.actual_end_time),
  duration: row.duration ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  settings: {
    allowScreenShare: Boolean(row.settings?.allowScreenShare),
    allowRecording: Boolean(row.settings?.allowRecording),
    allowChat: Boolean(row.settings?.allowChat),
    allowTranscription: Boolean(row.settings?.allowTranscription),
    autoMuteOnJoin: Boolean(row.settings?.autoMuteOnJoin),
    waitingRoom: Boolean(row.settings?.waitingRoom),
  },
})

export async function fetchScheduledMeetings(): Promise<RemoteScheduledMeeting[]> {
  if (!configured()) return []
  const { data, error } = await supabase.from(TABLE).select('*').order('start_time', { ascending: true })
  if (error) throw error
  return (data ?? []).map(fromRow)
}

export async function upsertScheduledMeeting(meeting: RemoteScheduledMeeting) {
  if (!configured()) return
  const { error } = await supabase.from(TABLE).upsert(toRow(meeting))
  if (error) throw error
}

export async function deleteScheduledMeeting(id: string) {
  if (!configured()) return
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export interface MeetingRsvpPayload {
  meetingId: string
  email: string
  userId?: string
  githubProfile?: string
  interestDescription?: string
}

export async function fetchMeetingRsvpsByEmail(email: string): Promise<string[]> {
  if (!configured() || !email) return []
  const { data, error } = await supabase
    .from(RSVP_TABLE)
    .select('meeting_id')
    .eq('email', email.toLowerCase())
  if (error) throw error
  return (data ?? []).map((row: any) => row.meeting_id)
}

export async function fetchMeetingRsvpCounts(): Promise<Record<string, number>> {
  if (!configured()) return {}
  const { data, error } = await supabase.from(RSVP_TABLE).select('meeting_id')
  if (error) throw error
  return (data ?? []).reduce((acc: Record<string, number>, row: any) => {
    acc[row.meeting_id] = (acc[row.meeting_id] ?? 0) + 1
    return acc
  }, {})
}

export async function upsertMeetingRsvp(payload: MeetingRsvpPayload) {
  if (!configured()) return
  const { error } = await supabase.from(RSVP_TABLE).upsert({
    meeting_id: payload.meetingId,
    email: payload.email.toLowerCase(),
    user_id: payload.userId ?? null,
    github_profile: payload.githubProfile ?? null,
    interest_description: payload.interestDescription ?? null,
    notify_on_start: true,
  }, { onConflict: 'meeting_id,email' })
  if (error) throw error
}
