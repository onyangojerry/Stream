import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ActiveCallType = 'one-on-one' | 'group' | 'webinar'

export interface ActiveCallSession {
  roomId: string
  type: ActiveCallType
  route: string
  title?: string
  startedAt: Date
}

interface CallSessionState {
  activeCall: ActiveCallSession | null
  setActiveCall: (session: Omit<ActiveCallSession, 'startedAt'> & { startedAt?: Date }) => void
  clearActiveCall: () => void
}

export const useCallSessionStore = create<CallSessionState>()(
  persist(
    (set) => ({
      activeCall: null,
      setActiveCall: (session) => {
        set({
          activeCall: {
            ...session,
            startedAt: session.startedAt ?? new Date(),
          },
        })
      },
      clearActiveCall: () => set({ activeCall: null }),
    }),
    {
      name: 'striim-active-call-session',
      onRehydrateStorage: () => (state) => {
        if (!state || !state.activeCall) return
        state.activeCall = {
          ...state.activeCall,
          startedAt: new Date(state.activeCall.startedAt),
        }
      },
    },
  ),
)
