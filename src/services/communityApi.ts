import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  CollaborationInvite,
  CommunityGroup,
  CommunityThread,
  CommunityThreadMessage,
  MeetingJoinRequest,
  PublicMaterial,
  PublicUserProfile,
} from '../store/useCommunityStore'

const TABLES = {
  profilesPublic: 'profiles_public',
  joinRequests: 'meeting_join_requests',
  materials: 'public_materials',
  reactions: 'material_reactions',
  invites: 'collaboration_invites',
  communities: 'communities',
  threads: 'community_threads',
  threadMessages: 'community_thread_messages',
} as const

export const COMMUNITY_BUCKET = 'public-materials'

const configured = () => isSupabaseConfigured

const normalizeDate = (value: string | Date | null | undefined) => (value ? new Date(value) : new Date())

export async function fetchPublicUsers(): Promise<PublicUserProfile[]> {
  if (!configured()) return []
  const { data, error } = await supabase
    .from(TABLES.profilesPublic)
    .select('*')
    .order('last_seen_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    avatar: row.avatar_url ?? undefined,
    githubProfile: row.github_profile ?? undefined,
    bio: row.bio ?? undefined,
    isRegisteredUser: Boolean(row.is_registered_user),
    isActive: Boolean(row.is_active),
    lastSeenAt: normalizeDate(row.last_seen_at),
  }))
}

export async function upsertPublicUser(profile: Omit<PublicUserProfile, 'lastSeenAt'> & { lastSeenAt?: Date }) {
  if (!configured()) return
  const payload = {
    id: profile.id,
    name: profile.name,
    email: profile.email ?? null,
    avatar_url: profile.avatar ?? null,
    github_profile: profile.githubProfile ?? null,
    bio: profile.bio ?? null,
    is_registered_user: profile.isRegisteredUser,
    is_active: profile.isActive,
    last_seen_at: (profile.lastSeenAt ?? new Date()).toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from(TABLES.profilesPublic).upsert(payload)
  if (error) throw error
}

export async function setUserActive(userId: string, active: boolean) {
  if (!configured()) return
  const { error } = await supabase
    .from(TABLES.profilesPublic)
    .update({ is_active: active, last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

export async function fetchJoinRequests(roomId?: string): Promise<MeetingJoinRequest[]> {
  if (!configured()) return []
  let query = supabase.from(TABLES.joinRequests).select('*').order('created_at', { ascending: false })
  if (roomId) query = query.eq('room_id', roomId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    roomId: row.room_id,
    meetingTitle: row.meeting_title ?? undefined,
    requesterUserId: row.requester_user_id ?? undefined,
    requesterName: row.requester_name,
    requesterGithub: row.requester_github,
    interestDescription: row.interest_description,
    status: row.status,
    createdAt: normalizeDate(row.created_at),
  }))
}

export async function createJoinRequest(payload: Omit<MeetingJoinRequest, 'id' | 'status' | 'createdAt'>) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.joinRequests).insert({
    room_id: payload.roomId,
    meeting_title: payload.meetingTitle ?? null,
    requester_user_id: payload.requesterUserId ?? null,
    requester_name: payload.requesterName,
    requester_github: payload.requesterGithub,
    interest_description: payload.interestDescription,
    status: 'pending',
  })
  if (error) throw error
}

export async function createJoinRequestWithId(id: string, payload: Omit<MeetingJoinRequest, 'id' | 'status' | 'createdAt'>) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.joinRequests).insert({
    id,
    room_id: payload.roomId,
    meeting_title: payload.meetingTitle ?? null,
    requester_user_id: payload.requesterUserId ?? null,
    requester_name: payload.requesterName,
    requester_github: payload.requesterGithub,
    interest_description: payload.interestDescription,
    status: 'pending',
  })
  if (error) throw error
}

export async function updateJoinRequestStatus(id: string, status: MeetingJoinRequest['status']) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.joinRequests).update({ status }).eq('id', id)
  if (error) throw error
}

export async function fetchPublicMaterials(viewerUserId?: string): Promise<PublicMaterial[]> {
  if (!configured()) return []
  const { data: materials, error } = await supabase.from(TABLES.materials).select('*').order('updated_at', { ascending: false })
  if (error) throw error

  const { data: reactions } = await supabase.from(TABLES.reactions).select('id,material_id,reaction,user_id')
  const reactionMap = new Map<string, Record<string, number>>()
  const myReactionMap = new Map<string, Set<string>>()
  const dedupeKeys = new Set<string>()
  ;(reactions ?? []).forEach((row: any) => {
    const dedupeKey = row.user_id ? `${row.material_id}:${row.reaction}:${row.user_id}` : row.id
    if (dedupeKeys.has(dedupeKey)) return
    dedupeKeys.add(dedupeKey)
    const current = reactionMap.get(row.material_id) ?? {}
    current[row.reaction] = (current[row.reaction] ?? 0) + 1
    reactionMap.set(row.material_id, current)
    if (viewerUserId && row.user_id === viewerUserId) {
      const mine = myReactionMap.get(row.material_id) ?? new Set<string>()
      mine.add(row.reaction)
      myReactionMap.set(row.material_id, mine)
    }
  })

  return (materials ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    type: row.type,
    url: row.url,
    githubUrl: row.github_url ?? undefined,
    demoUrl: row.demo_url ?? undefined,
    ownerUserId: row.owner_user_id ?? undefined,
    ownerName: row.owner_name,
    isPublic: Boolean(row.is_public),
    visibility: row.visibility ?? (row.is_public ? 'public' : 'private'),
    publishAfterInviteAccepted: Boolean(row.publish_after_invite_accepted),
    reactions: reactionMap.get(row.id) ?? {},
    myReactions: Array.from(myReactionMap.get(row.id) ?? []),
    collaboratorIds: row.collaborator_ids ?? [],
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at),
  }))
}

export async function createPublicMaterial(payload: Omit<PublicMaterial, 'id' | 'reactions' | 'collaboratorIds' | 'createdAt' | 'updatedAt'>) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.materials).insert({
    title: payload.title,
    description: payload.description,
    type: payload.type,
    url: payload.url,
    github_url: payload.githubUrl ?? null,
    demo_url: payload.demoUrl ?? null,
    owner_user_id: payload.ownerUserId ?? null,
    owner_name: payload.ownerName,
    is_public: payload.isPublic,
    visibility: payload.visibility,
    publish_after_invite_accepted: payload.publishAfterInviteAccepted ?? false,
    collaborator_ids: [],
  })
  if (error) throw error
}

export async function createPublicMaterialWithId(
  id: string,
  payload: Omit<PublicMaterial, 'id' | 'reactions' | 'collaboratorIds' | 'createdAt' | 'updatedAt'>,
) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.materials).insert({
    id,
    title: payload.title,
    description: payload.description,
    type: payload.type,
    url: payload.url,
    github_url: payload.githubUrl ?? null,
    demo_url: payload.demoUrl ?? null,
    owner_user_id: payload.ownerUserId ?? null,
    owner_name: payload.ownerName,
    is_public: payload.isPublic,
    visibility: payload.visibility,
    publish_after_invite_accepted: payload.publishAfterInviteAccepted ?? false,
    collaborator_ids: [],
  })
  if (error) throw error
}

export async function updatePublicMaterial(id: string, updates: Partial<PublicMaterial>) {
  if (!configured()) return
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.url !== undefined) payload.url = updates.url
  if (updates.type !== undefined) payload.type = updates.type
  if (updates.githubUrl !== undefined) payload.github_url = updates.githubUrl ?? null
  if (updates.demoUrl !== undefined) payload.demo_url = updates.demoUrl ?? null
  if (updates.visibility !== undefined) payload.visibility = updates.visibility
  if (updates.isPublic !== undefined) payload.is_public = updates.isPublic
  if (updates.publishAfterInviteAccepted !== undefined) payload.publish_after_invite_accepted = updates.publishAfterInviteAccepted
  if (updates.collaboratorIds !== undefined) payload.collaborator_ids = updates.collaboratorIds
  const { error } = await supabase.from(TABLES.materials).update(payload).eq('id', id)
  if (error) throw error
}

export async function deletePublicMaterial(id: string) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.materials).delete().eq('id', id)
  if (error) throw error
}

export async function addMaterialReaction(materialId: string, reaction: string, userId?: string, shouldAdd = true) {
  if (!configured()) return
  if (userId) {
    if (shouldAdd) {
      const { data: existing, error: readError } = await supabase
        .from(TABLES.reactions)
        .select('id')
        .eq('material_id', materialId)
        .eq('reaction', reaction)
        .eq('user_id', userId)
        .limit(1)
      if (readError) throw readError
      if ((existing ?? []).length > 0) return
    } else {
      const { error } = await supabase
        .from(TABLES.reactions)
        .delete()
        .eq('material_id', materialId)
        .eq('reaction', reaction)
        .eq('user_id', userId)
      if (error) throw error
      return
    }
  }

  const { error } = await supabase.from(TABLES.reactions).insert({
    material_id: materialId,
    reaction,
    user_id: userId ?? null,
  })
  if (error) throw error
}

export async function fetchCollaborationInvites(): Promise<CollaborationInvite[]> {
  if (!configured()) return []
  const { data, error } = await supabase.from(TABLES.invites).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    materialId: row.material_id,
    materialTitle: row.material_title,
    invitedUserId: row.invited_user_id,
    invitedUserName: row.invited_user_name,
    invitedByUserId: row.invited_by_user_id,
    invitedByName: row.invited_by_name,
    role: row.role,
    status: row.status,
    createdAt: normalizeDate(row.created_at),
  }))
}

export async function createCollaborationInvite(payload: Omit<CollaborationInvite, 'id' | 'status' | 'createdAt'>) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.invites).insert({
    material_id: payload.materialId,
    material_title: payload.materialTitle,
    invited_user_id: payload.invitedUserId,
    invited_user_name: payload.invitedUserName,
    invited_by_user_id: payload.invitedByUserId,
    invited_by_name: payload.invitedByName,
    role: payload.role,
    status: 'pending',
  })
  if (error) throw error
}

export async function createCollaborationInviteWithId(
  id: string,
  payload: Omit<CollaborationInvite, 'id' | 'status' | 'createdAt'>,
) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.invites).insert({
    id,
    material_id: payload.materialId,
    material_title: payload.materialTitle,
    invited_user_id: payload.invitedUserId,
    invited_user_name: payload.invitedUserName,
    invited_by_user_id: payload.invitedByUserId,
    invited_by_name: payload.invitedByName,
    role: payload.role,
    status: 'pending',
  })
  if (error) throw error
}

export async function updateCollaborationInviteStatus(id: string, status: CollaborationInvite['status']) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.invites).update({ status }).eq('id', id)
  if (error) throw error
}

export async function fetchCommunities(): Promise<CommunityGroup[]> {
  if (!configured()) return []
  const { data, error } = await supabase.from(TABLES.communities).select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name,
    isPrivate: Boolean(row.is_private),
    memberIds: row.member_ids ?? [],
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at),
  }))
}

export async function createCommunityWithId(
  id: string,
  payload: Omit<CommunityGroup, 'id' | 'memberIds' | 'createdAt' | 'updatedAt'> & { memberIds?: string[] },
) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.communities).insert({
    id,
    name: payload.name,
    description: payload.description,
    owner_user_id: payload.ownerUserId,
    owner_name: payload.ownerName,
    is_private: payload.isPrivate,
    member_ids: payload.memberIds ?? [payload.ownerUserId],
  })
  if (error) throw error
}

export async function updateCommunityRecord(id: string, updates: Partial<CommunityGroup>) {
  if (!configured()) return
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.isPrivate !== undefined) payload.is_private = updates.isPrivate
  if (updates.memberIds !== undefined) payload.member_ids = updates.memberIds
  const { error } = await supabase.from(TABLES.communities).update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteCommunityRecord(id: string) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.communities).delete().eq('id', id)
  if (error) throw error
}

export async function fetchThreads(): Promise<CommunityThread[]> {
  if (!configured()) return []
  const { data, error } = await supabase.from(TABLES.threads).select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    communityId: row.community_id ?? undefined,
    title: row.title,
    authorUserId: row.author_user_id ?? undefined,
    authorName: row.author_name,
    tags: row.tags ?? [],
    isOpen: Boolean(row.is_open),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at),
  }))
}

export async function createThreadWithId(id: string, payload: Omit<CommunityThread, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.threads).insert({
    id,
    community_id: payload.communityId ?? null,
    title: payload.title,
    author_user_id: payload.authorUserId ?? null,
    author_name: payload.authorName,
    tags: payload.tags,
    is_open: payload.isOpen,
  })
  if (error) throw error
}

export async function fetchThreadMessages(): Promise<CommunityThreadMessage[]> {
  if (!configured()) return []
  const { data, error } = await supabase.from(TABLES.threadMessages).select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    threadId: row.thread_id,
    authorUserId: row.author_user_id ?? undefined,
    authorName: row.author_name,
    content: row.content,
    parentMessageId: row.parent_message_id ?? undefined,
    createdAt: normalizeDate(row.created_at),
  }))
}

export async function createThreadMessageWithId(id: string, payload: Omit<CommunityThreadMessage, 'id' | 'createdAt'>) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.threadMessages).insert({
    id,
    thread_id: payload.threadId,
    author_user_id: payload.authorUserId ?? null,
    author_name: payload.authorName,
    content: payload.content,
    parent_message_id: payload.parentMessageId ?? null,
  })
  if (error) throw error
}

export async function touchThread(threadId: string) {
  if (!configured()) return
  const { error } = await supabase.from(TABLES.threads).update({ updated_at: new Date().toISOString() }).eq('id', threadId)
  if (error) throw error
}

export async function uploadPublicMaterialFile(file: File, ownerUserId?: string) {
  if (!configured()) throw new Error('Supabase is not configured')
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${ownerUserId || 'anonymous'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(COMMUNITY_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(COMMUNITY_BUCKET).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}
