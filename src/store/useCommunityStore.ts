import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  addMaterialReaction,
  createCollaborationInviteWithId,
  createCommunityWithId,
  createJoinRequestWithId,
  createPublicMaterialWithId,
  createThreadMessageWithId,
  createThreadWithId,
  deleteCommunityRecord,
  deletePublicMaterial,
  fetchCollaborationInvites,
  fetchCommunities,
  fetchJoinRequests,
  fetchPublicMaterials,
  fetchThreadMessages,
  fetchThreads,
  fetchPublicUsers,
  setUserActive as setUserActiveRemote,
  touchThread,
  updateCollaborationInviteStatus as updateCollaborationInviteStatusRemote,
  updateCommunityRecord,
  updateJoinRequestStatus as updateJoinRequestStatusRemote,
  updatePublicMaterial,
  upsertPublicUser as upsertPublicUserRemote,
} from '../services/communityApi'
import { useAuthStore } from './useAuthStore'

export type MaterialType = 'recording' | 'presentation' | 'image' | 'video' | 'object' | 'document' | 'project' | 'demo'
export type CollaborationRole = 'viewer' | 'commenter' | 'editor'
export type PublicationVisibility = 'public' | 'private' | 'invite-gated'

export interface PublicUserProfile {
  id: string
  name: string
  email?: string
  avatar?: string
  githubProfile?: string
  bio?: string
  isRegisteredUser: boolean
  isActive: boolean
  lastSeenAt: Date
}

export interface MeetingJoinRequest {
  id: string
  roomId: string
  meetingTitle?: string
  requesterUserId?: string
  requesterName: string
  requesterGithub: string
  interestDescription: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

export interface PublicMaterial {
  id: string
  title: string
  description: string
  type: MaterialType
  url: string
  githubUrl?: string
  demoUrl?: string
  ownerUserId?: string
  ownerName: string
  isPublic: boolean
  visibility: PublicationVisibility
  publishAfterInviteAccepted?: boolean
  reactions: Record<string, number>
  myReactions?: string[]
  collaboratorIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CollaborationInvite {
  id: string
  materialId: string
  materialTitle: string
  invitedUserId: string
  invitedUserName: string
  invitedByUserId: string
  invitedByName: string
  role: CollaborationRole
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

export interface CommunityGroup {
  id: string
  name: string
  description: string
  ownerUserId: string
  ownerName: string
  isPrivate: boolean
  memberIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CommunityThreadMessage {
  id: string
  threadId: string
  authorUserId?: string
  authorName: string
  content: string
  parentMessageId?: string
  createdAt: Date
}

export interface CommunityThread {
  id: string
  communityId?: string
  title: string
  authorUserId?: string
  authorName: string
  tags: string[]
  isOpen: boolean
  createdAt: Date
  updatedAt: Date
}

interface CommunityState {
  isSyncing: boolean
  lastSyncedAt: Date | null
  publicUsers: PublicUserProfile[]
  joinRequests: MeetingJoinRequest[]
  publicMaterials: PublicMaterial[]
  collaborationInvites: CollaborationInvite[]
  communities: CommunityGroup[]
  threads: CommunityThread[]
  threadMessages: CommunityThreadMessage[]

  initializeCommunity: () => Promise<void>
  refreshJoinRequests: (roomId?: string) => Promise<void>
  upsertPublicUser: (profile: Omit<PublicUserProfile, 'lastSeenAt'> & { lastSeenAt?: Date }) => void
  setUserActive: (userId: string, active: boolean) => void
  submitJoinRequest: (payload: Omit<MeetingJoinRequest, 'id' | 'status' | 'createdAt'>) => void
  updateJoinRequestStatus: (id: string, status: MeetingJoinRequest['status']) => void
  publishMaterial: (payload: Omit<PublicMaterial, 'id' | 'reactions' | 'collaboratorIds' | 'createdAt' | 'updatedAt'>) => void
  updateMaterial: (id: string, updates: Partial<PublicMaterial>) => void
  deleteMaterial: (id: string) => void
  reactToMaterial: (materialId: string, reaction: string, actorUserId?: string) => void
  inviteCollaborator: (payload: Omit<CollaborationInvite, 'id' | 'status' | 'createdAt'>) => void
  updateCollaborationInviteStatus: (id: string, status: CollaborationInvite['status']) => void
  createCommunity: (payload: Omit<CommunityGroup, 'id' | 'memberIds' | 'createdAt' | 'updatedAt'> & { memberIds?: string[] }) => void
  updateCommunity: (id: string, updates: Partial<CommunityGroup>) => void
  deleteCommunity: (id: string) => void
  createThread: (payload: Omit<CommunityThread, 'id' | 'createdAt' | 'updatedAt'>) => void
  addThreadMessage: (payload: Omit<CommunityThreadMessage, 'id' | 'createdAt'>) => void
}

const seedMaterials = (): PublicMaterial[] => [
  {
    id: 'mat-seed-1',
    title: 'Quarterly Product Demo Recording',
    description: 'Public recording and notes link for stakeholders.',
    type: 'recording',
    url: 'https://example.com/recordings/product-demo',
    visibility: 'public',
    ownerName: 'Striim Team',
    isPublic: true,
    reactions: { like: 4, helpful: 2 },
    collaboratorIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat-seed-2',
    title: 'Launch Deck',
    description: 'Presentation slides for the public launch review.',
    type: 'presentation',
    url: 'https://example.com/slides/launch-deck',
    visibility: 'public',
    ownerName: 'Striim Team',
    isPublic: true,
    reactions: { like: 3 },
    collaboratorIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      isSyncing: false,
      lastSyncedAt: null,
      publicUsers: [],
      joinRequests: [],
      publicMaterials: seedMaterials(),
      collaborationInvites: [],
      communities: [],
      threads: [],
      threadMessages: [],

      initializeCommunity: async () => {
        set({ isSyncing: true })
        try {
          const viewerUserId = useAuthStore.getState().user?.id
          const [users, requests, materials, invites, communities, threads, threadMessages] = await Promise.all([
            fetchPublicUsers().catch(() => []),
            fetchJoinRequests().catch(() => []),
            fetchPublicMaterials(viewerUserId).catch(() => []),
            fetchCollaborationInvites().catch(() => []),
            fetchCommunities().catch(() => []),
            fetchThreads().catch(() => []),
            fetchThreadMessages().catch(() => []),
          ])

          set((state) => ({
            publicUsers: users.length ? users : state.publicUsers,
            joinRequests: requests.length ? requests : state.joinRequests,
            publicMaterials: materials.length ? materials : state.publicMaterials,
            collaborationInvites: invites.length ? invites : state.collaborationInvites,
            communities: communities.length ? communities : state.communities,
            threads: threads.length ? threads : state.threads,
            threadMessages: threadMessages.length ? threadMessages : state.threadMessages,
            lastSyncedAt: new Date(),
          }))
        } finally {
          set({ isSyncing: false })
        }
      },

      refreshJoinRequests: async (roomId) => {
        try {
          const requests = await fetchJoinRequests(roomId)
          set((state) => ({
            joinRequests: roomId
              ? [
                  ...requests,
                  ...state.joinRequests.filter((r) => r.roomId !== roomId),
                ]
              : requests,
            lastSyncedAt: new Date(),
          }))
        } catch {
          // keep local state fallback
        }
      },

      upsertPublicUser: (profile) =>
        set((state) => {
          const next: PublicUserProfile = {
            ...profile,
            lastSeenAt: profile.lastSeenAt ?? new Date(),
          }
          void upsertPublicUserRemote(next).catch((error) => {
            console.warn('Failed to sync public user profile', error)
          })
          return {
            publicUsers: [...state.publicUsers.filter((u) => u.id !== next.id), next],
          }
        }),

      setUserActive: (userId, active) =>
        set((state) => ({
          publicUsers: state.publicUsers.map((user) => {
            if (user.id !== userId) return user
            const next = { ...user, isActive: active, lastSeenAt: new Date() }
            void setUserActiveRemote(userId, active).catch((error) => {
              console.warn('Failed to sync user active state', error)
            })
            return next
          }),
        })),

      submitJoinRequest: (payload) =>
        set((state) => ({
          joinRequests: (() => {
            const id = crypto.randomUUID()
            const next: MeetingJoinRequest = {
              ...payload,
              id,
              status: 'pending',
              createdAt: new Date(),
            }
            void createJoinRequestWithId(id, payload).catch((error) => {
              console.warn('Failed to persist join request', error)
            })
            return [next, ...state.joinRequests]
          })(),
        })),

      updateJoinRequestStatus: (id, status) =>
        set((state) => ({
          joinRequests: state.joinRequests.map((req) => {
            if (req.id !== id) return req
            void updateJoinRequestStatusRemote(id, status).catch((error) => {
              console.warn('Failed to update join request status', error)
            })
            return { ...req, status }
          }),
        })),

      publishMaterial: (payload) =>
        set((state) => ({
          publicMaterials: (() => {
            const next: PublicMaterial = {
              ...payload,
              id: crypto.randomUUID(),
              reactions: {},
              collaboratorIds: [],
              visibility: payload.visibility ?? (payload.isPublic ? 'public' : 'private'),
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            void createPublicMaterialWithId(next.id, payload).catch((error) => {
              console.warn('Failed to persist material', error)
            })
            return [next, ...state.publicMaterials]
          })(),
        })),

      updateMaterial: (id, updates) =>
        set((state) => {
          void updatePublicMaterial(id, updates).catch((error) => {
            console.warn('Failed to update material', error)
          })
          return {
            publicMaterials: state.publicMaterials.map((material) =>
              material.id === id
                ? {
                    ...material,
                    ...updates,
                    isPublic: updates.visibility ? updates.visibility === 'public' : (updates.isPublic ?? material.isPublic),
                    updatedAt: new Date(),
                  }
                : material,
            ),
          }
        }),

      deleteMaterial: (id) =>
        set((state) => {
          void deletePublicMaterial(id).catch((error) => {
            console.warn('Failed to delete material', error)
          })
          return {
            publicMaterials: state.publicMaterials.filter((material) => material.id !== id),
            collaborationInvites: state.collaborationInvites.filter((invite) => invite.materialId !== id),
          }
        }),

      reactToMaterial: (materialId, reaction, actorUserId) => {
        let shouldAdd = true

        set((state) => ({
          publicMaterials: state.publicMaterials.map((material) => {
            if (material.id !== materialId) return material

            const myReactions = material.myReactions ?? []
            const alreadyReacted = !!actorUserId && myReactions.includes(reaction)
            shouldAdd = !alreadyReacted
            const nextCount = Math.max(0, (material.reactions[reaction] ?? 0) + (shouldAdd ? 1 : -1))

            return {
              ...material,
              reactions: {
                ...material.reactions,
                [reaction]: nextCount,
              },
              myReactions: actorUserId
                ? (shouldAdd
                    ? [...myReactions, reaction]
                    : myReactions.filter((entry) => entry !== reaction))
                : myReactions,
              updatedAt: new Date(),
            }
          }),
        }))

        void addMaterialReaction(materialId, reaction, actorUserId, shouldAdd).catch((error) => {
          console.warn('Failed to persist material reaction', error)
        })
      },

      inviteCollaborator: (payload) =>
        set((state) => ({
          collaborationInvites: (() => {
            const next: CollaborationInvite = {
              ...payload,
              id: crypto.randomUUID(),
              status: 'pending',
              createdAt: new Date(),
            }
            void createCollaborationInviteWithId(next.id, payload).catch((error) => {
              console.warn('Failed to persist collaboration invite', error)
            })
            return [next, ...state.collaborationInvites]
          })(),
          publicMaterials: state.publicMaterials.map((material) =>
            material.id === payload.materialId && !material.collaboratorIds.includes(payload.invitedUserId)
              ? { ...material, collaboratorIds: [...material.collaboratorIds, payload.invitedUserId], updatedAt: new Date() }
              : material,
          ),
        })),

      updateCollaborationInviteStatus: (id, status) =>
        set((state) => {
          const target = state.collaborationInvites.find((invite) => invite.id === id)
          void updateCollaborationInviteStatusRemote(id, status).catch((error) => {
            console.warn('Failed to update invite status', error)
          })
          const shouldAutoPublish =
            !!target &&
            status === 'accepted' &&
            state.publicMaterials.some((m) => m.id === target.materialId && m.publishAfterInviteAccepted)
          if (shouldAutoPublish && target) {
            void updatePublicMaterial(target.materialId, { visibility: 'public', isPublic: true }).catch((error) => {
              console.warn('Failed to auto-publish material after invite acceptance', error)
            })
          }
          return {
            collaborationInvites: state.collaborationInvites.map((invite) =>
              invite.id === id ? { ...invite, status } : invite,
            ),
            publicMaterials: state.publicMaterials.map((material) => {
              if (
                !target ||
                material.id !== target.materialId ||
                status !== 'accepted' ||
                !material.publishAfterInviteAccepted
              ) {
                return material
              }
              return {
                ...material,
                isPublic: true,
                visibility: 'public',
                updatedAt: new Date(),
              }
            }),
          }
        }),

      createCommunity: (payload) =>
        set((state) => ({
          communities: [
            (() => {
              const next: CommunityGroup = {
              ...payload,
              id: crypto.randomUUID(),
              memberIds: payload.memberIds ?? [payload.ownerUserId],
              createdAt: new Date(),
              updatedAt: new Date(),
              }
              void createCommunityWithId(next.id, payload).catch((error) => {
                console.warn('Failed to persist community', error)
              })
              return next
            })(),
            ...state.communities,
          ],
        })),

      updateCommunity: (id, updates) =>
        set((state) => {
          void updateCommunityRecord(id, updates).catch((error) => {
            console.warn('Failed to update community', error)
          })
          return {
            communities: state.communities.map((community) =>
              community.id === id ? { ...community, ...updates, updatedAt: new Date() } : community,
            ),
          }
        }),

      deleteCommunity: (id) =>
        set((state) => {
          const removedThreadIds = state.threads.filter((thread) => thread.communityId === id).map((thread) => thread.id)
          void deleteCommunityRecord(id).catch((error) => {
            console.warn('Failed to delete community', error)
          })
          return {
            communities: state.communities.filter((community) => community.id !== id),
            threads: state.threads.filter((thread) => thread.communityId !== id),
            threadMessages: state.threadMessages.filter((message) => !removedThreadIds.includes(message.threadId)),
          }
        }),

      createThread: (payload) =>
        set((state) => ({
          threads: [
            (() => {
              const next: CommunityThread = {
              ...payload,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
              }
              void createThreadWithId(next.id, payload).catch((error) => {
                console.warn('Failed to persist thread', error)
              })
              return next
            })(),
            ...state.threads,
          ],
        })),

      addThreadMessage: (payload) =>
        set((state) => {
          const next: CommunityThreadMessage = {
            ...payload,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }
          void createThreadMessageWithId(next.id, payload)
            .then(() => touchThread(payload.threadId))
            .catch((error) => {
              console.warn('Failed to persist thread message', error)
            })
          return {
            threadMessages: [next, ...state.threadMessages],
            threads: state.threads.map((thread) =>
              thread.id === payload.threadId ? { ...thread, updatedAt: new Date() } : thread,
            ),
          }
        }),
    }),
    {
      name: 'striim-community',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.publicUsers = state.publicUsers.map((u) => ({ ...u, lastSeenAt: new Date(u.lastSeenAt) }))
        state.lastSyncedAt = state.lastSyncedAt ? new Date(state.lastSyncedAt) : null
        state.joinRequests = state.joinRequests.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }))
        state.publicMaterials = state.publicMaterials.map((m) => ({
          ...m,
          visibility: (m as any).visibility ?? (m.isPublic ? 'public' : 'private'),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        }))
        state.collaborationInvites = state.collaborationInvites.map((i) => ({ ...i, createdAt: new Date(i.createdAt) }))
        state.communities = state.communities.map((c) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }))
        state.threads = state.threads.map((t) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }))
        state.threadMessages = state.threadMessages.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }))
      },
    },
  ),
)
