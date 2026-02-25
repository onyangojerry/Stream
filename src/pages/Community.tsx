import { ComponentType, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { useCommunityStore, MaterialType, CollaborationRole, PublicationVisibility } from '../store/useCommunityStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
import { uploadPublicMaterialFile } from '../services/communityApi'
import {
  Calendar,
  RefreshCw,
  Download,
  Edit3,
  ExternalLink,
  FolderPlus,
  Github,
  Heart,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquarePlus,
  Mic,
  Plus,
  Presentation,
  Radio,
  Save,
  Trash2,
  Unlock,
  Users,
  Video,
  MoreVertical,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

const materialTypeIcon: Record<MaterialType, ComponentType<{ className?: string }>> = {
  recording: Mic,
  presentation: Presentation,
  image: ImageIcon,
  video: Video,
  object: Layers,
  document: Calendar,
  project: Github,
  demo: Video,
}

const collaborationRoles: CollaborationRole[] = ['viewer', 'commenter', 'editor']
const materialTypes: MaterialType[] = ['recording', 'presentation', 'image', 'video', 'object', 'document', 'project', 'demo']

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))

export default function Community() {
  const { user, isAuthenticated } = useAuthStore()
  const schedulerMeetings = useSchedulerStore((s) => s.scheduledMeetings)
  const {
    publicUsers,
    joinRequests,
    publicMaterials,
    collaborationInvites,
    communities,
    threads,
    threadMessages,
    initializeCommunity,
    submitJoinRequest,
    publishMaterial,
    updateMaterial,
    deleteMaterial,
    reactToMaterial,
    inviteCollaborator,
    updateCollaborationInviteStatus,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    createThread,
    addThreadMessage,
    upsertPublicUser,
  } = useCommunityStore()
  const ONLINE_WINDOW_MS = 10 * 60 * 1000

  const activeUsers = useMemo(
    () =>
      publicUsers
        .filter((u) => Date.now() - new Date(u.lastSeenAt).getTime() < ONLINE_WINDOW_MS)
        .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime()),
    [publicUsers],
  )
  const ongoingMeetings = useMemo(
    () => schedulerMeetings.filter((m) => m.isStarted && !m.isEnded).sort((a, b) => (b.actualStartTime || b.startTime).getTime() - (a.actualStartTime || a.startTime).getTime()),
    [schedulerMeetings],
  )
  const visiblePublicMaterials = useMemo(
    () => publicMaterials.filter((m) => m.isPublic || m.visibility === 'public'),
    [publicMaterials],
  )
  const myMaterials = useMemo(() => publicMaterials.filter((m) => !!user && m.ownerUserId === user.id), [publicMaterials, user])
  const projectAndDemos = useMemo(() => publicMaterials.filter((m) => m.type === 'project' || m.type === 'demo'), [publicMaterials])
  const memberCommunityIds = useMemo(() => {
    if (!user) return new Set<string>()
    return new Set(
      communities
        .filter((community) => community.memberIds.includes(user.id))
        .map((community) => community.id),
    )
  }, [communities, user])

  const recentThreads = useMemo(
    () =>
      [...threads]
        .filter((thread) => {
          if (!thread.communityId) return true
          return memberCommunityIds.has(thread.communityId)
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 8),
    [threads, memberCommunityIds],
  )
  const myInvites = useMemo(() => collaborationInvites.filter((i) => !!user && i.invitedUserId === user.id), [collaborationInvites, user])
  const communityOnlineCounts = useMemo(() => {
    const activeSet = new Set(activeUsers.map((u) => u.id))
    const counts = new Map<string, number>()
    communities.forEach((community) => {
      counts.set(
        community.id,
        community.memberIds.reduce((count, memberId) => count + (activeSet.has(memberId) ? 1 : 0), 0),
      )
    })
    return counts
  }, [communities, activeUsers])

  const [requestingRoomId, setRequestingRoomId] = useState<string | null>(null)
  const [joinName, setJoinName] = useState('')
  const [joinGithub, setJoinGithub] = useState('')
  const [joinInterest, setJoinInterest] = useState('')

  const [publishTitle, setPublishTitle] = useState('')
  const [publishDescription, setPublishDescription] = useState('')
  const [publishType, setPublishType] = useState<MaterialType>('recording')
  const [publishUrl, setPublishUrl] = useState('')
  const [publishGithubUrl, setPublishGithubUrl] = useState('')
  const [publishDemoUrl, setPublishDemoUrl] = useState('')
  const [publishVisibility, setPublishVisibility] = useState<PublicationVisibility>('public')
  const [publishAfterInviteAccepted, setPublishAfterInviteAccepted] = useState(false)
  const [publishFile, setPublishFile] = useState<File | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const [inviteMaterialId, setInviteMaterialId] = useState('')
  const [inviteUserId, setInviteUserId] = useState('')
  const [inviteRole, setInviteRole] = useState<CollaborationRole>('viewer')

  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null)
  const [editMaterialTitle, setEditMaterialTitle] = useState('')
  const [editMaterialDescription, setEditMaterialDescription] = useState('')
  const [editMaterialVisibility, setEditMaterialVisibility] = useState<PublicationVisibility>('public')

  const [communityName, setCommunityName] = useState('')
  const [communityDescription, setCommunityDescription] = useState('')
  const [communityPrivate, setCommunityPrivate] = useState(false)

  const [threadCommunityId, setThreadCommunityId] = useState('')
  const [threadTitle, setThreadTitle] = useState('')
  const [threadTags, setThreadTags] = useState('')
  const [threadBody, setThreadBody] = useState('')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [reactionPulseKey, setReactionPulseKey] = useState<string | null>(null)
  const [showDashboardMenu, setShowDashboardMenu] = useState(false)
  const [dashboardPanel, setDashboardPanel] = useState<'active-users' | 'publish' | 'manage' | 'invite' | 'community'>('active-users')
  const [communityExplorerInput, setCommunityExplorerInput] = useState('')
  const [exploringCommunityId, setExploringCommunityId] = useState<string | null>(null)
  const [projectExplorerInput, setProjectExplorerInput] = useState('')
  const [exploringProjectId, setExploringProjectId] = useState<string | null>(null)
  const [materialExplorerInput, setMaterialExplorerInput] = useState('')
  const [exploringMaterialId, setExploringMaterialId] = useState<string | null>(null)
  const [threadExplorerInput, setThreadExplorerInput] = useState('')
  const [exploringThreadId, setExploringThreadId] = useState<string | null>(null)
  const threadChatScrollRef = useRef<HTMLDivElement>(null)
  const selectedThread = useMemo(
    () => recentThreads.find((t) => t.id === exploringThreadId) ?? recentThreads[0] ?? null,
    [recentThreads, exploringThreadId],
  )
  const selectedThreadMessages = useMemo(
    () =>
      selectedThread
        ? threadMessages
            .filter((m) => m.threadId === selectedThread.id)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        : [],
    [threadMessages, selectedThread],
  )

  useEffect(() => {
    void initializeCommunity()
  }, [initializeCommunity])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void initializeCommunity()
    }, 20000)
    const onFocus = () => {
      void initializeCommunity()
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [initializeCommunity])

  useEffect(() => {
    if (!user) return
    const syncPresence = () => {
      setJoinName(user.name)
      setJoinGithub(user.githubProfile || '')
      setJoinInterest(user.interestDescription || '')
      upsertPublicUser({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubProfile: user.githubProfile,
        bio: user.interestDescription,
        isRegisteredUser: true,
        isActive: navigator.onLine,
      })
    }

    syncPresence()
    const interval = window.setInterval(syncPresence, 30000)
    const onFocus = () => syncPresence()
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [user, upsertPublicUser])

  useEffect(() => {
    const el = threadChatScrollRef.current
    if (!el) return
    const raf = window.requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
    return () => window.cancelAnimationFrame(raf)
  }, [selectedThread?.id, selectedThreadMessages.length])

  const openJoinRequest = (roomId: string) => {
    setRequestingRoomId(roomId)
    if (!isAuthenticated) {
      setJoinName('')
      setJoinGithub('')
      setJoinInterest('')
    }
  }

  const handleSubmitJoinRequest = (e: FormEvent) => {
    e.preventDefault()
    if (!requestingRoomId) return
    if (!joinName.trim() || !joinGithub.trim() || !joinInterest.trim()) {
      toast.error('Name, GitHub profile, and interest description are required')
      return
    }

    const meeting = ongoingMeetings.find((m) => m.roomId === requestingRoomId)
    submitJoinRequest({
      roomId: requestingRoomId,
      meetingTitle: meeting?.title,
      requesterUserId: user?.id,
      requesterName: joinName.trim(),
      requesterGithub: joinGithub.trim(),
      interestDescription: joinInterest.trim(),
    })
    toast.success('Join request submitted')
    setRequestingRoomId(null)
  }

  const handlePublishMaterial = async (e: FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      toast.error('Log in to publish materials')
      return
    }
    if (!publishTitle.trim()) {
      toast.error('Title is required')
      return
    }
    if (!publishUrl.trim() && !publishFile) {
      toast.error('Provide a URL or upload a file')
      return
    }

    setIsPublishing(true)
    try {
      let materialUrl = publishUrl.trim()
      if (publishFile) {
        const uploaded = await uploadPublicMaterialFile(publishFile, user.id)
        materialUrl = uploaded.publicUrl
      }
      publishMaterial({
        title: publishTitle.trim(),
        description: publishDescription.trim(),
        type: publishType,
        url: materialUrl,
        githubUrl: publishGithubUrl.trim() || undefined,
        demoUrl: publishDemoUrl.trim() || undefined,
        ownerUserId: user.id,
        ownerName: user.name,
        isPublic: publishVisibility === 'public',
        visibility: publishVisibility,
        publishAfterInviteAccepted,
      })
      toast.success('Publication created')
      setPublishTitle('')
      setPublishDescription('')
      setPublishType('recording')
      setPublishUrl('')
      setPublishGithubUrl('')
      setPublishDemoUrl('')
      setPublishVisibility('public')
      setPublishAfterInviteAccepted(false)
      setPublishFile(null)
    } catch (error) {
      console.error(error)
      toast.error('Failed to publish material')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleInvite = (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Log in to invite collaborators')
      return
    }
    const material = publicMaterials.find((m) => m.id === inviteMaterialId)
    const invitee = publicUsers.find((u) => u.id === inviteUserId)
    if (!material || !invitee) {
      toast.error('Select a material and user')
      return
    }
    inviteCollaborator({
      materialId: material.id,
      materialTitle: material.title,
      invitedUserId: invitee.id,
      invitedUserName: invitee.name,
      invitedByUserId: user.id,
      invitedByName: user.name,
      role: inviteRole,
    })
    toast.success(`Invited ${invitee.name}`)
  }

  const startEditingMaterial = (materialId: string) => {
    const material = myMaterials.find((m) => m.id === materialId)
    if (!material) return
    setEditingMaterialId(material.id)
    setEditMaterialTitle(material.title)
    setEditMaterialDescription(material.description)
    setEditMaterialVisibility(material.visibility)
  }

  const saveMaterialEdits = () => {
    if (!editingMaterialId) return
    updateMaterial(editingMaterialId, {
      title: editMaterialTitle.trim() || 'Untitled',
      description: editMaterialDescription.trim(),
      visibility: editMaterialVisibility,
    })
    setEditingMaterialId(null)
    toast.success('Publication updated')
  }

  const handleCreateCommunity = (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Log in to create a community')
      return
    }
    if (!communityName.trim()) {
      toast.error('Community name is required')
      return
    }
    createCommunity({
      name: communityName.trim(),
      description: communityDescription.trim(),
      ownerUserId: user.id,
      ownerName: user.name,
      isPrivate: communityPrivate,
    })
    toast.success('Community created')
    setCommunityName('')
    setCommunityDescription('')
    setCommunityPrivate(false)
  }

  const handleCreateThread = (e: FormEvent) => {
    e.preventDefault()
    if (!threadTitle.trim() || !threadBody.trim()) {
      toast.error('Thread title and body are required')
      return
    }
    createThread({
      communityId: threadCommunityId || undefined,
      title: threadTitle.trim(),
      authorUserId: user?.id,
      authorName: user?.name || 'Guest',
      tags: threadTags.split(',').map((t) => t.trim()).filter(Boolean),
      isOpen: true,
    })
    const newThread = useCommunityStore.getState().threads[0]
    if (newThread) {
      addThreadMessage({
        threadId: newThread.id,
        authorUserId: user?.id,
        authorName: user?.name || 'Guest',
        content: threadBody.trim(),
      })
    }
    toast.success('Thread posted')
    setThreadCommunityId('')
    setThreadTitle('')
    setThreadTags('')
    setThreadBody('')
  }

  const handleReply = (threadId: string) => {
    const content = (replyDrafts[threadId] || '').trim()
    if (!content) return
    addThreadMessage({
      threadId,
      authorUserId: user?.id,
      authorName: user?.name || 'Guest',
      content,
    })
    setReplyDrafts((prev) => ({ ...prev, [threadId]: '' }))
    toast.success('Reply posted')
  }

  const handleMaterialReaction = (materialId: string, reaction: string, isAlreadySelected: boolean) => {
    reactToMaterial(materialId, reaction, user?.id)
    if (reaction === 'like' && !isAlreadySelected) {
      const key = `${materialId}:${reaction}:${Date.now()}`
      setReactionPulseKey(key)
      setTimeout(() => {
        setReactionPulseKey((current) => (current === key ? null : current))
      }, 500)
    }
  }

  const getThreadAuthorGithub = (authorUserId?: string) =>
    authorUserId ? publicUsers.find((u) => u.id === authorUserId)?.githubProfile : undefined

  const formatGithubLabel = (value?: string) => {
    if (!value) return null
    return value.startsWith('http') ? value.replace(/^https?:\/\/(www\.)?github\.com\//, '@') : value
  }

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'

  const executeCommunityExploreCommand = (raw: string) => {
    const value = raw.trim().toLowerCase()
    if (!value) return
    if (value === 'all' || value === 'list') {
      setExploringCommunityId(null)
      toast.success('Showing all communities')
      return
    }

    const asNumber = Number(value)
    if (!Number.isNaN(asNumber) && Number.isInteger(asNumber)) {
      const target = communities[asNumber - 1]
      if (target) {
        setExploringCommunityId(target.id)
        toast.success(`Exploring ${target.name}`)
      } else {
        toast.error('Unknown community number')
      }
      return
    }

    const normalized = value.replace(/^open\s+/, '')
    const target = communities.find((community) => community.name.toLowerCase() === normalized)
      || communities.find((community) => community.name.toLowerCase().includes(normalized))

    if (!target) {
      toast.error('Community not found')
      return
    }

    setExploringCommunityId(target.id)
    toast.success(`Exploring ${target.name}`)
  }

  const handleCommunityExplorerSubmit = (e: FormEvent) => {
    e.preventDefault()
    executeCommunityExploreCommand(communityExplorerInput)
    setCommunityExplorerInput('')
  }

  const executeProjectExploreCommand = (raw: string) => {
    const value = raw.trim().toLowerCase()
    if (!value) return
    if (value === 'all' || value === 'list') {
      setExploringProjectId(null)
      toast.success('Showing all projects and demos')
      return
    }

    const numeric = Number(value)
    if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
      const target = projectAndDemos[numeric - 1]
      if (!target) {
        toast.error('Unknown project/demo number')
        return
      }
      setExploringProjectId(target.id)
      toast.success(`Exploring ${target.title}`)
      return
    }

    const normalized = value.replace(/^open\s+/, '')
    const target = projectAndDemos.find((item) => item.title.toLowerCase() === normalized)
      || projectAndDemos.find((item) => item.title.toLowerCase().includes(normalized))

    if (!target) {
      toast.error('Project or demo not found')
      return
    }

    setExploringProjectId(target.id)
    toast.success(`Exploring ${target.title}`)
  }

  const handleProjectExplorerSubmit = (e: FormEvent) => {
    e.preventDefault()
    executeProjectExploreCommand(projectExplorerInput)
    setProjectExplorerInput('')
  }

  const executeMaterialExploreCommand = (raw: string) => {
    const value = raw.trim().toLowerCase()
    if (!value) return
    if (value === 'all' || value === 'list') {
      setExploringMaterialId(null)
      toast.success('Showing all public materials')
      return
    }
    const n = Number(value)
    if (!Number.isNaN(n) && Number.isInteger(n)) {
      const target = visiblePublicMaterials[n - 1]
      if (!target) return toast.error('Unknown material number')
      setExploringMaterialId(target.id)
      toast.success(`Exploring ${target.title}`)
      return
    }
    if (value.startsWith('open ')) {
      const term = value.replace(/^open\s+/, '')
      const target = visiblePublicMaterials.find((m) => m.title.toLowerCase().includes(term))
      if (!target) return toast.error('Material not found')
      window.open(target.url, '_blank', 'noopener,noreferrer')
      return
    }
    const target = visiblePublicMaterials.find((m) => m.title.toLowerCase().includes(value))
    if (!target) return toast.error('Material not found')
    setExploringMaterialId(target.id)
    toast.success(`Exploring ${target.title}`)
  }

  const handleMaterialExplorerSubmit = (e: FormEvent) => {
    e.preventDefault()
    executeMaterialExploreCommand(materialExplorerInput)
    setMaterialExplorerInput('')
  }

  const executeThreadExploreCommand = (raw: string) => {
    const value = raw.trim().toLowerCase()
    if (!value) return
    if (value === 'all' || value === 'list') {
      setExploringThreadId(null)
      toast.success('Showing all visible threads')
      return
    }
    if (value === 'refresh') {
      void initializeCommunity()
      toast.success('Refreshing threads')
      return
    }
    const n = Number(value)
    if (!Number.isNaN(n) && Number.isInteger(n)) {
      const target = recentThreads[n - 1]
      if (!target) return toast.error('Unknown thread number')
      setExploringThreadId(target.id)
      toast.success(`Exploring ${target.title}`)
      return
    }
    const normalized = value.replace(/^open\s+/, '')
    const target = recentThreads.find((t) => t.title.toLowerCase().includes(normalized))
    if (!target) return toast.error('Thread not found')
    setExploringThreadId(target.id)
    toast.success(`Exploring ${target.title}`)
  }

  const handleThreadExplorerSubmit = (e: FormEvent) => {
    e.preventDefault()
    executeThreadExploreCommand(threadExplorerInput)
    setThreadExplorerInput('')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Community</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Live meetings, public materials, communities, threaded chats, and project demos.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Radio className="h-4 w-4" />
            {ongoingMeetings.length} live meetings · {activeUsers.length} active users
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Ongoing meetings</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">Guests can request access</span>
            </div>
            {ongoingMeetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No meetings are live right now.</div>
            ) : (
              <div className="space-y-3">
                {ongoingMeetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{meeting.title}</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{meeting.description || 'Live meeting in progress'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="rounded-full border border-gray-200 bg-white px-2 py-1 capitalize dark:border-gray-700 dark:bg-gray-900">{meeting.type}</span>
                          <span>Host: {meeting.hostName}</span>
                          <span>{meeting.currentAttendees}/{meeting.attendeeLimit} attendees</span>
                          <span>Room: {meeting.roomId}</span>
                        </div>
                      </div>
                      <button onClick={() => openJoinRequest(meeting.roomId)} className="rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-gray-900">
                        Request to join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Public materials</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">React, open, and explore</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
              <div className="mb-2 text-[11px] font-mono text-gray-500 dark:text-gray-400">material.explorer</div>
              <div className="rounded-xl border border-gray-200 bg-white p-2 font-mono text-xs dark:border-gray-800 dark:bg-gray-900">
                {visiblePublicMaterials.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-200 p-3 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    No public materials yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {visiblePublicMaterials.map((material, index) => (
                      <button
                        key={material.id}
                        type="button"
                        onClick={() => setExploringMaterialId(material.id)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${
                          exploringMaterialId === material.id ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/70'
                        }`}
                      >
                        <span className="w-6 text-emerald-600 dark:text-emerald-400">{index + 1}.</span>
                        <span className="min-w-0 flex-1 truncate text-gray-900 dark:text-gray-100">{material.title}</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{material.type}</span>
                      </button>
                    ))}
                  </div>
                )}
                {visiblePublicMaterials.length > 0 && (
                  <form onSubmit={handleMaterialExplorerSubmit} className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-800">
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                      <span className="text-emerald-600 dark:text-emerald-400">$</span>
                      <input
                        value={materialExplorerInput}
                        onChange={(e) => setMaterialExplorerInput(e.target.value)}
                        placeholder="1 | open <title> | all"
                        className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                      />
                      <button type="submit" className="rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">run</button>
                    </div>
                  </form>
                )}
              </div>
              {(() => {
                const material = visiblePublicMaterials.find((m) => m.id === exploringMaterialId) ?? visiblePublicMaterials[0]
                if (!material) return null
                const Icon = materialTypeIcon[material.type]
                return (
                  <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1.5 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{material.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{material.description || 'No description provided.'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-1 capitalize dark:border-gray-700 dark:bg-gray-900">{material.type}</span>
                      <span>{material.ownerName}</span>
                      <span>{formatTime(material.updatedAt)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={material.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {material.githubUrl && (
                        <a href={material.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                          <Github className="h-3.5 w-3.5" /> GitHub
                        </a>
                      )}
                      {material.demoUrl && (
                        <a href={material.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                          <Video className="h-3.5 w-3.5" /> Demo
                        </a>
                      )}
                      {['like', 'helpful', 'insightful'].map((reaction) => {
                        const selected = !!material.myReactions?.includes(reaction)
                        const isLike = reaction === 'like'
                        return (
                          <motion.button
                            key={reaction}
                            type="button"
                            onClick={() => handleMaterialReaction(material.id, reaction, selected)}
                            whileTap={{ scale: 0.96 }}
                            animate={
                              isLike && reactionPulseKey?.startsWith(`${material.id}:${reaction}:`)
                                ? { scale: [1, 1.08, 0.98, 1.04, 1], opacity: [1, 0.92, 1] }
                                : undefined
                            }
                            transition={{ duration: 0.42, ease: 'easeOut' }}
                            className={[
                              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                              isLike
                                ? selected
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-300'
                                  : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-gray-900 dark:text-emerald-300 dark:hover:bg-emerald-900/10'
                                : selected
                                  ? 'border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                            ].join(' ')}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isLike && selected ? 'fill-current' : ''}`} />
                            {reaction} ({material.reactions[reaction] ?? 0})
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Threaded chats</h2>
              <button
                type="button"
                onClick={() => void initializeCommunity()}
                className="ml-auto btn-compact text-xs"
                title="Refresh latest replies"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="mb-4 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
              <select value={threadCommunityId} onChange={(e) => setThreadCommunityId(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                <option value="">General (no community)</option>
                {communities
                  .filter((community) => !user || community.memberIds.includes(user.id))
                  .map((community) => (
                  <option key={community.id} value={community.id}>{community.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Default publish target is <span className="font-medium">General</span>. Community chats are visible to members of that community.
              </p>
              <input value={threadTitle} onChange={(e) => setThreadTitle(e.target.value)} placeholder="Thread title" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <input value={threadTags} onChange={(e) => setThreadTags(e.target.value)} placeholder="Tags (comma-separated)" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <textarea value={threadBody} onChange={(e) => setThreadBody(e.target.value)} rows={3} placeholder="Start the discussion..." className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <button type="submit" className="rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-gray-900">Post thread</button>
            </form>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
              <div className="mb-2 text-[11px] font-mono text-gray-500 dark:text-gray-400">thread.explorer</div>
              <div className="rounded-xl border border-gray-200 bg-white p-2 font-mono text-xs dark:border-gray-800 dark:bg-gray-900">
                {recentThreads.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-200 p-3 text-gray-600 dark:border-gray-700 dark:text-gray-300">No threads yet.</div>
                ) : (
                  <div className="space-y-1">
                    {recentThreads.map((thread, index) => (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setExploringThreadId(thread.id)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${
                          exploringThreadId === thread.id ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/70'
                        }`}
                      >
                        <span className="w-6 text-emerald-600 dark:text-emerald-400">{index + 1}.</span>
                        <span className="min-w-0 flex-1 truncate text-gray-900 dark:text-gray-100">{thread.title}</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{thread.communityId ? 'community' : 'general'}</span>
                      </button>
                    ))}
                  </div>
                )}
                {recentThreads.length > 0 && (
                  <form onSubmit={handleThreadExplorerSubmit} className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-800">
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                      <span className="text-emerald-600 dark:text-emerald-400">$</span>
                      <input
                        value={threadExplorerInput}
                        onChange={(e) => setThreadExplorerInput(e.target.value)}
                        placeholder="1 | open <title> | refresh | all"
                        className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                      />
                      <button type="submit" className="rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">run</button>
                    </div>
                  </form>
                )}
              </div>

              {(() => {
                const thread = selectedThread
                if (!thread) return null
                const messages = selectedThreadMessages
                return (
                  <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{thread.title}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      by {thread.authorName}
                      {thread.communityId ? ` · ${communities.find((c) => c.id === thread.communityId)?.name || 'Community'}` : ' · General'}
                      {' · '}
                      {formatTime(thread.updatedAt)}
                    </p>
                    {thread.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {thread.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-950">
                      <div ref={threadChatScrollRef} className="max-h-80 space-y-2 overflow-y-auto pr-1">
                        {messages.slice(-20).map((msg, index, list) => {
                          const github = formatGithubLabel(getThreadAuthorGithub(msg.authorUserId))
                          const isMine = !!user && msg.authorUserId === user.id
                          const previous = list[index - 1]
                          const sameAsPrevious =
                            !!previous &&
                            (previous.authorUserId || previous.authorName) === (msg.authorUserId || msg.authorName) &&
                            (!!user && previous.authorUserId === user.id) === isMine
                          const showMeta = !sameAsPrevious
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${msg.parentMessageId ? 'pl-4' : ''} ${sameAsPrevious ? 'mt-1' : 'mt-2'}`}
                            >
                              <div className={`flex max-w-[94%] items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`h-6 w-6 shrink-0 rounded-full border text-[10px] font-semibold ${showMeta ? 'opacity-100' : 'opacity-0'} ${isMine ? 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200' : 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'} flex items-center justify-center`}>
                                  {getInitials(msg.authorName)}
                                </div>
                                <div
                                  className={`max-w-[88%] rounded-2xl border px-3 py-2 text-sm ${
                                    isMine
                                      ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                                      : 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                                  }`}
                                >
                                  {showMeta && (
                                    <div className={`mb-1 flex flex-wrap items-center gap-2 text-xs ${isMine ? 'text-white/75 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                      <span className="font-medium">{msg.authorName}</span>
                                      {github && (
                                        <span className="inline-flex items-center gap-1">
                                          <Github className="h-3 w-3" />
                                          {github}
                                        </span>
                                      )}
                                      <span>{formatTime(msg.createdAt)}</span>
                                      {msg.parentMessageId && <span className="rounded-full border px-1.5 py-0.5 text-[10px]">reply</span>}
                                    </div>
                                  )}
                                  <p className={`${isMine ? 'text-white dark:text-gray-900' : 'text-gray-700 dark:text-gray-300'}`}>{msg.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input value={replyDrafts[thread.id] || ''} onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))} placeholder="Reply to thread..." className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                      <button onClick={() => handleReply(thread.id)} className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Reply</button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Dashboard tools</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Open one panel at a time to keep the page clean.</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDashboardMenu((v) => !v)}
                  className="menu-trigger"
                >
                  <MoreVertical className="h-4 w-4" />
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {showDashboardMenu && (
                  <div className="dropdown-panel absolute right-0 top-full z-20 mt-2 w-56">
                    {[
                      { id: 'active-users', label: 'Active users', icon: Users },
                      { id: 'publish', label: 'Publish material', icon: Plus },
                      { id: 'manage', label: 'Manage publications', icon: Edit3 },
                      { id: 'invite', label: 'Invite collaborator', icon: MessageSquarePlus },
                      { id: 'community', label: 'Create community', icon: FolderPlus },
                    ].map((item) => {
                      const Icon = item.icon
                      const selected = dashboardPanel === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setDashboardPanel(item.id as typeof dashboardPanel)
                            setShowDashboardMenu(false)
                          }}
                          className={`dropdown-item ${selected ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {dashboardPanel === 'active-users' && <Users className="h-4 w-4" />}
              {dashboardPanel === 'publish' && <Plus className="h-4 w-4" />}
              {dashboardPanel === 'manage' && <Edit3 className="h-4 w-4" />}
              {dashboardPanel === 'invite' && <MessageSquarePlus className="h-4 w-4" />}
              {dashboardPanel === 'community' && <FolderPlus className="h-4 w-4" />}
              <span className="capitalize">{dashboardPanel.replace('-', ' ')}</span>
            </div>

            {dashboardPanel === 'active-users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Presence</p>
                  <button type="button" onClick={() => void initializeCommunity()} className="btn-compact text-xs">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                </div>
                <div className="space-y-2">
                  {activeUsers.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No active users listed yet.</div> : activeUsers.map((activeUser) => (
                    <div key={activeUser.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activeUser.name}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] ${activeUser.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${activeUser.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {activeUser.isActive ? 'online' : 'recent'}
                        </span>
                      </div>
                      {activeUser.githubProfile && <a href={activeUser.githubProfile.startsWith('http') ? activeUser.githubProfile : `https://github.com/${activeUser.githubProfile.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"><Github className="h-3.5 w-3.5" />{activeUser.githubProfile}</a>}
                      {activeUser.bio && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{activeUser.bio}</p>}
                      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">Seen {formatTime(activeUser.lastSeenAt)}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Live calls</p>
                  <div className="space-y-2">
                    {ongoingMeetings.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No calls are live right now.</div>
                    ) : (
                      ongoingMeetings.map((meeting) => (
                        <div key={meeting.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{meeting.title}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{meeting.type} · {meeting.currentAttendees}/{meeting.attendeeLimit} attendees</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Room: {meeting.roomId}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {dashboardPanel === 'publish' && (
              <form onSubmit={handlePublishMaterial} className="space-y-3">
                <input value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                <input value={publishUrl} onChange={(e) => setPublishUrl(e.target.value)} placeholder="Public URL (optional if uploading a file)" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                <label className="block rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Upload file to Supabase Storage (optional)</span>
                  <input type="file" onChange={(e) => setPublishFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" accept="image/*,video/*,.pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.zip" />
                  {publishFile && <span className="mt-2 block text-xs text-gray-500 dark:text-gray-400">Selected: {publishFile.name}</span>}
                </label>
                <select value={publishType} onChange={(e) => setPublishType(e.target.value as MaterialType)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                  {materialTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                {(publishType === 'project' || publishType === 'demo') && (
                  <>
                    <input value={publishGithubUrl} onChange={(e) => setPublishGithubUrl(e.target.value)} placeholder="GitHub repo URL" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                    <input value={publishDemoUrl} onChange={(e) => setPublishDemoUrl(e.target.value)} placeholder="Demo URL (optional)" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                  </>
                )}
                <select value={publishVisibility} onChange={(e) => setPublishVisibility(e.target.value as PublicationVisibility)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="invite-gated">Private until collaborator accepts invite</option>
                </select>
                <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <input type="checkbox" checked={publishAfterInviteAccepted} onChange={(e) => setPublishAfterInviteAccepted(e.target.checked)} />
                  Auto-publish after invite acceptance
                </label>
                <textarea value={publishDescription} onChange={(e) => setPublishDescription(e.target.value)} rows={3} placeholder="Description" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                <button type="submit" disabled={isPublishing} className="w-full rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:border-white dark:bg-white dark:text-gray-900">{isPublishing ? 'Publishing...' : 'Publish'}</button>
              </form>
            )}

            {dashboardPanel === 'manage' && (
              <div className="space-y-2">
                {myMaterials.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No publications yet.</div>}
                {myMaterials.map((material) => (
                  <div key={material.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    {editingMaterialId === material.id ? (
                      <div className="space-y-2">
                        <input value={editMaterialTitle} onChange={(e) => setEditMaterialTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                        <textarea value={editMaterialDescription} onChange={(e) => setEditMaterialDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                        <select value={editMaterialVisibility} onChange={(e) => setEditMaterialVisibility(e.target.value as PublicationVisibility)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="invite-gated">Invite-gated</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={saveMaterialEdits} className="inline-flex items-center gap-1 rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs text-white dark:border-white dark:bg-white dark:text-gray-900"><Save className="h-3.5 w-3.5" />Save</button>
                          <button onClick={() => setEditingMaterialId(null)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{material.title}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{material.type} · {material.visibility}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{material.visibility === 'public' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}{material.visibility}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a href={material.url} download className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><Download className="h-3.5 w-3.5" />Download</a>
                          <button onClick={() => startEditingMaterial(material.id)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><Edit3 className="h-3.5 w-3.5" />Edit</button>
                          <button onClick={() => { deleteMaterial(material.id); toast.success('Publication deleted') }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {dashboardPanel === 'invite' && (
              <form onSubmit={handleInvite} className="space-y-3">
                <select value={inviteMaterialId} onChange={(e) => setInviteMaterialId(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                  <option value="">Select material</option>
                  {publicMaterials.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
                <select value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                  <option value="">Select user</option>
                  {publicUsers.filter((u) => u.id !== user?.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as CollaborationRole)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                  {collaborationRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <button type="submit" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Send invite</button>
              </form>
            )}

            {dashboardPanel === 'community' && (
              <form onSubmit={handleCreateCommunity} className="space-y-3">
                <input value={communityName} onChange={(e) => setCommunityName(e.target.value)} placeholder="Community name" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                <textarea value={communityDescription} onChange={(e) => setCommunityDescription(e.target.value)} rows={3} placeholder="Description" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><input type="checkbox" checked={communityPrivate} onChange={(e) => setCommunityPrivate(e.target.checked)} />Private community</label>
                <button type="submit" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Create community</button>
              </form>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Activity</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Join requests</p>
              <div className="space-y-2">
                {joinRequests.slice(0, 6).map((request) => (
                  <div key={request.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{request.requesterName}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{request.meetingTitle || request.roomId} · {formatTime(request.createdAt)}</p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">GitHub: {request.requesterGithub}</p>
                  </div>
                ))}
                {joinRequests.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No join requests yet.</div>}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Invites</p>
              <div className="space-y-2">
                {collaborationInvites.slice(0, 6).map((invite) => (
                  <div key={invite.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{invite.materialTitle}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{invite.invitedByName} invited {invite.invitedUserName} as {invite.role}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatTime(invite.createdAt)} · {invite.status}</p>
                    {invite.invitedUserId === user?.id && invite.status === 'pending' && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => { updateCollaborationInviteStatus(invite.id, 'accepted'); toast.success('Invite accepted') }} className="rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs text-white dark:border-white dark:bg-white dark:text-gray-900">Accept</button>
                        <button onClick={() => { updateCollaborationInviteStatus(invite.id, 'declined'); toast.success('Invite declined') }} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Decline</button>
                      </div>
                    )}
                  </div>
                ))}
                {collaborationInvites.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No collaboration invites yet.</div>}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Communities & Projects</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Communities</p>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
                <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  <span>community.explorer</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExploringCommunityId(null)
                      setCommunityExplorerInput('')
                    }}
                    className="btn-compact px-2 py-1 text-[11px]"
                  >
                    reset
                  </button>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-2 font-mono text-xs dark:border-gray-800 dark:bg-gray-900">
                  {communities.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-200 p-3 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      No communities yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {communities.map((community, index) => {
                        const onlineCount = communityOnlineCounts.get(community.id) ?? 0
                        const selected = exploringCommunityId === community.id
                        return (
                          <button
                            key={community.id}
                            type="button"
                            onClick={() => setExploringCommunityId(community.id)}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                              selected ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/70'
                            }`}
                          >
                            <span className="w-6 text-emerald-600 dark:text-emerald-400">{index + 1}.</span>
                            <span className="min-w-0 flex-1 truncate text-gray-900 dark:text-gray-100">{community.name}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                              <span className={`h-1.5 w-1.5 rounded-full ${onlineCount > 0 ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-600'}`} />
                              {onlineCount}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {communities.length > 0 && (
                    <form onSubmit={handleCommunityExplorerSubmit} className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-800">
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-emerald-600 dark:text-emerald-400">$</span>
                        <input
                          value={communityExplorerInput}
                          onChange={(e) => setCommunityExplorerInput(e.target.value)}
                          placeholder="1 | open <name> | all"
                          className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                        />
                        <button type="submit" className="rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
                          run
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {(() => {
                  const selected = communities.find((community) => community.id === exploringCommunityId)
                  if (!selected) {
                    return (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Type a number or `open community-name` to explore a community. `all` returns to the full list.
                      </p>
                    )
                  }
                  const onlineCount = communityOnlineCounts.get(selected.id) ?? 0
                  const communityThreads = threads.filter((thread) => thread.communityId === selected.id)
                  return (
                    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900">
                      <div className="font-mono text-emerald-700 dark:text-emerald-300">$ exploring {selected.name.toLowerCase().replace(/\s+/g, '-')}</div>
                      <div className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                        <p>{selected.description || 'No description'}</p>
                        <p>{selected.memberIds.length} members · {onlineCount} online</p>
                        <p>{communityThreads.length} thread{communityThreads.length === 1 ? '' : 's'} in this community</p>
                      </div>
                      {selected.ownerUserId === user?.id && (
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => updateCommunity(selected.id, { isPrivate: !selected.isPrivate })} className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">{selected.isPrivate ? 'Make public' : 'Make private'}</button>
                          <button onClick={() => { deleteCommunity(selected.id); setExploringCommunityId((current) => (current === selected.id ? null : current)); toast.success('Community deleted') }} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">Delete</button>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Projects & demos</p>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
                <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  <span>project.explorer</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExploringProjectId(null)
                      setProjectExplorerInput('')
                    }}
                    className="btn-compact px-2 py-1 text-[11px]"
                  >
                    reset
                  </button>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-2 font-mono text-xs dark:border-gray-800 dark:bg-gray-900">
                  {projectAndDemos.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-200 p-3 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      No project or demo posts yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {projectAndDemos.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setExploringProjectId(item.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                            exploringProjectId === item.id ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/70'
                          }`}
                        >
                          <span className="w-6 text-emerald-600 dark:text-emerald-400">{index + 1}.</span>
                          <span className="min-w-0 flex-1 truncate text-gray-900 dark:text-gray-100">{item.title}</span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.type}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {projectAndDemos.length > 0 && (
                    <form onSubmit={handleProjectExplorerSubmit} className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-800">
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-emerald-600 dark:text-emerald-400">$</span>
                        <input
                          value={projectExplorerInput}
                          onChange={(e) => setProjectExplorerInput(e.target.value)}
                          placeholder="1 | open <title> | all"
                          className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                        />
                        <button type="submit" className="rounded border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
                          run
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {(() => {
                  const selected = projectAndDemos.find((item) => item.id === exploringProjectId)
                  if (!selected) {
                    return (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Type a number or `open project-name` to inspect a project/demo. `all` returns to the full list.
                      </p>
                    )
                  }
                  return (
                    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900">
                      <div className="font-mono text-emerald-700 dark:text-emerald-300">$ exploring {selected.title.toLowerCase().replace(/\s+/g, '-')}</div>
                      <div className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                        <p>{selected.type} · {selected.ownerName}</p>
                        <p>{selected.description || 'No description'}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.githubUrl && <a href={selected.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><Github className="h-3 w-3" />GitHub</a>}
                        {selected.demoUrl && <a href={selected.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><Video className="h-3 w-3" />Demo</a>}
                        <a href={selected.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><ExternalLink className="h-3 w-3" />Open</a>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {myInvites.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You have {myInvites.filter((invite) => invite.status === 'pending').length} pending invite(s). Review them in the Activity panel.
              </p>
            )}
          </div>
        </section>
      </div>

      {requestingRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request to join meeting</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Submit your name, GitHub profile, and a short note on your interest.</p>
            <form onSubmit={handleSubmitJoinRequest} className="mt-4 space-y-3">
              <input value={joinName} onChange={(e) => setJoinName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <div className="relative">
                <Github className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input value={joinGithub} onChange={(e) => setJoinGithub(e.target.value)} placeholder="GitHub username or URL" className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
              </div>
              <textarea value={joinInterest} onChange={(e) => setJoinInterest(e.target.value)} rows={4} placeholder="Short description of your interest in joining" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRequestingRoomId(null)} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Cancel</button>
                <button type="submit" className="rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-gray-900">Submit request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
