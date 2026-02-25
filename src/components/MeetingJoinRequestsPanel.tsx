import { useEffect } from 'react'
import { Check, Github, X } from 'lucide-react'
import { useCommunityStore } from '../store/useCommunityStore'
import toast from 'react-hot-toast'

interface Props {
  roomId: string
  title?: string
}

const MeetingJoinRequestsPanel = ({ roomId, title = 'Join requests' }: Props) => {
  const joinRequests = useCommunityStore((s) => s.joinRequests)
  const refreshJoinRequests = useCommunityStore((s) => s.refreshJoinRequests)
  const updateJoinRequestStatus = useCommunityStore((s) => s.updateJoinRequestStatus)

  useEffect(() => {
    if (!roomId) return
    void refreshJoinRequests(roomId)
    const timer = window.setInterval(() => {
      void refreshJoinRequests(roomId)
    }, 15000)
    return () => window.clearInterval(timer)
  }, [roomId, refreshJoinRequests])

  const roomRequests = joinRequests
    .filter((r) => r.roomId === roomId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const pending = roomRequests.filter((r) => r.status === 'pending')
  const recent = roomRequests.filter((r) => r.status !== 'pending').slice(0, 5)

  const moderate = (id: string, status: 'approved' | 'rejected') => {
    updateJoinRequestStatus(id, status)
    toast.success(`Request ${status}`)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Guest requests with profile context</p>
        </div>
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {pending.length} pending
        </span>
      </div>

      {roomRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
          No join requests for this room yet.
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((request) => (
            <div key={request.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{request.requesterName}</p>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <Github className="h-3.5 w-3.5" />
                    <span className="truncate">{request.requesterGithub}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">{request.interestDescription}</p>
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{request.createdAt.toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moderate(request.id, 'approved')}
                    className="rounded-lg border border-gray-900 bg-gray-900 p-2 text-white dark:border-white dark:bg-white dark:text-gray-900"
                    title="Approve request"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moderate(request.id, 'rejected')}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                    title="Reject request"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pending.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
              No pending requests. Recent decisions appear below.
            </div>
          )}

          {recent.length > 0 && (
            <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Recent decisions</p>
              <div className="space-y-2">
                {recent.map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800">
                    <span className="truncate text-gray-700 dark:text-gray-200">{request.requesterName}</span>
                    <span className={`rounded-full px-2 py-1 capitalize ${request.status === 'approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MeetingJoinRequestsPanel
