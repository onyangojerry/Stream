import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, PlayCircle, Presentation, Users, Video } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
import toast from 'react-hot-toast'

type CallType = 'one-on-one' | 'group' | 'webinar'
type StartMode = 'instant' | 'schedule'

const STORAGE_KEY = 'striim-call-launch-preferences'

const callTypeMeta: Record<CallType, { label: string; icon: typeof Video }> = {
  'one-on-one': { label: 'One-on-One', icon: Video },
  group: { label: 'Group', icon: Users },
  webinar: { label: 'Webinar', icon: Presentation },
}

const createRoomId = () => Math.random().toString(36).slice(2, 10)

export default function Calls() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const { getUserActiveMeeting } = useSchedulerStore()
  const [callType, setCallType] = useState<CallType>('one-on-one')
  const [startMode, setStartMode] = useState<StartMode>('instant')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { callType?: CallType; startMode?: StartMode }
        if (parsed.callType && callTypeMeta[parsed.callType]) setCallType(parsed.callType)
        if (parsed.startMode && ['instant', 'schedule'].includes(parsed.startMode)) setStartMode(parsed.startMode)
      } catch {
        // ignore invalid persisted data
      }
    }

    const queryType = searchParams.get('type') as CallType | null
    const queryMode = searchParams.get('mode') as StartMode | null
    if (queryType && callTypeMeta[queryType]) setCallType(queryType)
    if (queryMode && ['instant', 'schedule'].includes(queryMode)) setStartMode(queryMode)
  }, [searchParams])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ callType, startMode }))
  }, [callType, startMode])

  const goToCall = () => {
    if (!isAuthenticated) {
      toast.error('Sign in or create an account to start a call')
      navigate('/login', { state: { from: { pathname: '/calls', search: `?mode=${startMode}&type=${callType}` } } })
      return
    }

    const authUserId = useAuthStore.getState().user?.id
    if (authUserId) {
      const activeMeeting = getUserActiveMeeting(authUserId)
      if (activeMeeting) {
        toast('You already have an active call. Returning you there.')
        if (activeMeeting.type === 'group') {
          navigate(`/group/${activeMeeting.roomId}`)
          return
        }
        if (activeMeeting.type === 'webinar') {
          navigate(`/webinar/${activeMeeting.roomId}`)
          return
        }
        navigate(`/call/${activeMeeting.roomId}`)
        return
      }
    }

    if (startMode === 'schedule') {
      navigate(`/scheduler?type=${callType}`)
      return
    }

    const roomId = createRoomId()
    if (callType === 'one-on-one') {
      navigate(`/call/${roomId}`)
      return
    }

    navigate(callType === 'group' ? `/group/${roomId}` : `/webinar/${roomId}`)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    goToCall()
  }

  const TypeIcon = callTypeMeta[callType].icon

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Calls</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Pick a call type and start instantly or schedule for later.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Type
          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value as CallType)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          >
            <option value="one-on-one">One-on-One</option>
            <option value="group">Group</option>
            <option value="webinar">Webinar</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Mode
          <select
            value={startMode}
            onChange={(e) => setStartMode(e.target.value as StartMode)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          >
            <option value="instant">Instant</option>
            <option value="schedule">Schedule</option>
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2.5 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-gray-900"
        >
          {startMode === 'instant' ? <PlayCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
          {startMode === 'instant' ? 'Start now' : 'Open scheduler'}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
        <span className="inline-flex items-center gap-1">
          <TypeIcon className="h-3.5 w-3.5" /> {callTypeMeta[callType].label}
        </span>
        <span className="mx-2">·</span>
        <span>{startMode === 'instant' ? 'Instant launch' : 'Scheduled flow'}</span>
      </div>
    </section>
  )
}
