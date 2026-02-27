import { ComponentType, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { useCommunityStore, MaterialType, CollaborationRole, PublicationVisibility } from '../store/useCommunityStore'
import { useSchedulerStore } from '../store/useSchedulerStore'
import { uploadPublicMaterialFile } from '../services/communityApi'
import { fetchMeetingRsvpCounts, fetchMeetingRsvpsByEmail, upsertMeetingRsvp } from '../services/schedulerApi'
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
  Lightbulb,
  Plus,
  Presentation,
  Radio,
  Save,
  ThumbsUp,
  Trash2,
  Unlock,
  Users,
  Video,
  MoreVertical,
  ChevronDown,
  UserPlus,
  UserCheck,
  Bell,
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
}

const collaborationRoles: CollaborationRole[] = ['viewer', 'commenter', 'editor']
const materialTypes: MaterialType[] = ['recording', 'presentation', 'image', 'video', 'object', 'document', 'project']
const threadParticipantThemes = [
  {
    avatar: 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
    bubble: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-100',
    meta: 'text-sky-700 dark:text-sky-300',
    text: 'text-sky-900 dark:text-sky-100',
  },
  {
    avatar: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    bubble: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100',
    meta: 'text-emerald-700 dark:text-emerald-300',
    text: 'text-emerald-900 dark:text-emerald-100',
  },
  {
    avatar: 'border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-900/40 dark:text-violet-200',
    bubble: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-100',
    meta: 'text-violet-700 dark:text-violet-300',
    text: 'text-violet-900 dark:text-violet-100',
  },
  {
    avatar: 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    bubble: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100',
    meta: 'text-amber-700 dark:text-amber-300',
    text: 'text-amber-900 dark:text-amber-100',
  },
  {
    avatar: 'border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
    bubble: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100',
    meta: 'text-rose-700 dark:text-rose-300',
    text: 'text-rose-900 dark:text-rose-100',
  },
] as const
const reactionStyleMap = {
  like: {
    label: 'Like',
    Icon: Heart,
    active: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-300',
    idle: 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-gray-900 dark:text-emerald-300 dark:hover:bg-emerald-900/10',
    iconClass: 'fill-current',
  },
  helpful: {
    label: 'Helpful',
    Icon: ThumbsUp,
    active: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-900/20 dark:text-sky-300',
    idle: 'border-sky-200 bg-white text-sky-700 hover:bg-sky-50 dark:border-sky-800/60 dark:bg-gray-900 dark:text-sky-300 dark:hover:bg-sky-900/10',
    iconClass: '',
  },
  insightful: {
    label: 'Insightful',
    Icon: Lightbulb,
    active: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-300',
    idle: 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-800/60 dark:bg-gray-900 dark:text-amber-300 dark:hover:bg-amber-900/10',
    iconClass: '',
  },
} as const

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))

export default function Community() {
  const { user, isAuthenticated } = useAuthStore()
  const schedulerMeetings = useSchedulerStore((s) => s.scheduledMeetings)
  const {
    publicUsers,
    joinRequests,
    publicMaterials,
    materialReactionEvents,
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
    toggleFollowUser,
    followedUserIds,
  } = useCommunityStore()
  const ONLINE_WINDOW_MS = 5 * 60 * 1000
  const GUEST_RSVP_EMAIL_KEY = 'striim-guest-rsvp-email'

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
  const visibleOngoingMeetings = useMemo(
    () => ongoingMeetings.filter((meeting) => meeting.isPublicListing || isAuthenticated),
    [ongoingMeetings, isAuthenticated],
  )
  const publicScheduledMeetings = useMemo(
    () =>
      schedulerMeetings
        .filter((m) => m.isPublicListing && !m.isStarted && !m.isEnded && m.startTime > new Date())
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, 8),
    [schedulerMeetings],
  )
  const visiblePublicMaterials = useMemo(
    () => publicMaterials.filter((m) => m.isPublic || m.visibility === 'public'),
    [publicMaterials],
  )
  const myMaterials = useMemo(() => publicMaterials.filter((m) => !!user && m.ownerUserId === user.id), [publicMaterials, user])
  const projectMaterials = useMemo(() => publicMaterials.filter((m) => m.type === 'project'), [publicMaterials])
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
  const [guestRsvpEmail, setGuestRsvpEmail] = useState('')
  const [myRsvpMeetingIds, setMyRsvpMeetingIds] = useState<string[]>([])
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({})
  const [notifiedMeetingIds, setNotifiedMeetingIds] = useState<string[]>([])

  const [publishTitle, setPublishTitle] = useState('')
  const [publishDescription, setPublishDescription] = useState('')
  const [publishType, setPublishType] = useState<MaterialType>('recording')
  const [publishUrl, setPublishUrl] = useState('')
  const [publishGithubUrl, setPublishGithubUrl] = useState('')
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
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [reactionPulseKey, setReactionPulseKey] = useState<string | null>(null)
  const [showDashboardMenu, setShowDashboardMenu] = useState(false)
  const [dashboardPanel, setDashboardPanel] = useState<'active-users' | 'publish' | 'manage' | 'invite' | 'community'>('active-users')
  const [communityExplorerInput, setCommunityExplorerInput] = useState('')
  const [exploringCommunityId, setExploringCommunityId] = useState<string | null>(null)
  const [projectExplorerInput, setProjectExplorerInput] = useState('')
  const [exploringProjectId, setExploringProjectId] = useState<string | null>(null)
  const [exploringMaterialId, setExploringMaterialId] = useState<string | null>(null)
  const [showMaterialsMenu, setShowMaterialsMenu] = useState(false)
  const [materialsPanelMode, setMaterialsPanelMode] = useState<'explore' | 'publish'>('explore')
  const [exploringThreadId, setExploringThreadId] = useState<string | null>(null)
  const [showThreadsMenu, setShowThreadsMenu] = useState(false)
  const [threadsPanelMode, setThreadsPanelMode] = useState<'explore' | 'post'>('explore')
  const [threadSeenAt, setThreadSeenAt] = useState<Record<string, number>>({})
  const threadChatScrollRef = useRef<HTMLDivElement>(null)
  const [activeCanvas, setActiveCanvas] = useState<
    'dashboard-tools' | 'ongoing-meetings' | 'public-materials' | 'threaded-chats' | 'activity' | 'communities-projects'
  >('dashboard-tools')
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
  const reactionTotals = useMemo(
    () =>
      visiblePublicMaterials.reduce(
        (acc, material) => {
          acc.like += material.reactions.like ?? 0
          acc.helpful += material.reactions.helpful ?? 0
          acc.insightful += material.reactions.insightful ?? 0
          return acc
        },
        { like: 0, helpful: 0, insightful: 0 },
      ),
    [visiblePublicMaterials],
  )
  const recentReactionEvents = useMemo(
    () => materialReactionEvents.slice(0, 12),
    [materialReactionEvents],
  )
  const unreadByThread = useMemo(() => {
    const latestByThread = new Map<string, number>()
    threadMessages.forEach((msg) => {
      const ts = new Date(msg.createdAt).getTime()
      const current = latestByThread.get(msg.threadId) ?? 0
      if (ts > current) latestByThread.set(msg.threadId, ts)
    })
    const unread = new Map<string, number>()
    recentThreads.forEach((thread) => {
      const latest = latestByThread.get(thread.id) ?? 0
      const seen = threadSeenAt[thread.id] ?? 0
      unread.set(thread.id, latest > seen ? 1 : 0)
    })
    return unread
  }, [threadMessages, recentThreads, threadSeenAt])

  useEffect(() => {
    void initializeCommunity()
  }, [initializeCommunity])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void initializeCommunity()
    }, 10000)
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
    const cachedEmail = window.localStorage.getItem(GUEST_RSVP_EMAIL_KEY) || ''
    setGuestRsvpEmail(cachedEmail)
    const hydrate = async () => {
      try {
        const [counts, myRsvps] = await Promise.all([
          fetchMeetingRsvpCounts(),
          (user?.email || cachedEmail) ? fetchMeetingRsvpsByEmail((user?.email || cachedEmail) as string) : Promise.resolve([]),
        ])
        setRsvpCounts(counts)
        setMyRsvpMeetingIds(myRsvps)
      } catch {
        // keep local fallback
      }
    }
    void hydrate()
  }, [user?.email])

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const counts = await fetchMeetingRsvpCounts()
        setRsvpCounts(counts)
      } catch {
        // ignore transient errors
      }
    }, 15000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!myRsvpMeetingIds.length) return
    const startedRsvps = schedulerMeetings.filter((meeting) =>
      myRsvpMeetingIds.includes(meeting.id) && meeting.isStarted && !meeting.isEnded,
    )
    if (!startedRsvps.length) return
    const unseen = startedRsvps.filter((meeting) => !notifiedMeetingIds.includes(meeting.id))
    if (!unseen.length) return
    unseen.forEach((meeting) => {
      toast.success(`RSVP alert: "${meeting.title}" just started`)
    })
    setNotifiedMeetingIds((prev) => [...prev, ...unseen.map((meeting) => meeting.id)])
  }, [myRsvpMeetingIds, schedulerMeetings, notifiedMeetingIds])

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
    const interval = window.setInterval(syncPresence, 15000)
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

  useEffect(() => {
    if (activeCanvas !== 'threaded-chats') return
    const threadId = selectedThread?.id
    if (!threadId) return
    const latestMessageTime = selectedThreadMessages[selectedThreadMessages.length - 1]
      ? new Date(selectedThreadMessages[selectedThreadMessages.length - 1].createdAt).getTime()
      : Date.now()
    setThreadSeenAt((prev) => {
      const current = prev[threadId] ?? 0
      if (current >= latestMessageTime) return prev
      return { ...prev, [threadId]: latestMessageTime }
    })
  }, [activeCanvas, selectedThread?.id, selectedThreadMessages])

  useEffect(() => {
    if (activeCanvas !== 'threaded-chats') return
    const interval = window.setInterval(() => {
      void initializeCommunity()
    }, 8000)
    return () => window.clearInterval(interval)
  }, [activeCanvas, initializeCommunity])

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
    toast.success(isAuthenticated ? 'Join request submitted' : 'Join request submitted. Please log in before participating.')
    setRequestingRoomId(null)
  }

  const handleMeetingRsvp = async (meetingId: string) => {
    const rsvpEmail = (user?.email || guestRsvpEmail || '').trim().toLowerCase()
    if (!rsvpEmail) {
      toast.error('Enter an email in your profile (or sign in) to RSVP')
      return
    }

    try {
      await upsertMeetingRsvp({
        meetingId,
        email: rsvpEmail,
        userId: user?.id,
        githubProfile: user?.githubProfile,
        interestDescription: user?.interestDescription,
      })
      if (!user?.email) {
        window.localStorage.setItem(GUEST_RSVP_EMAIL_KEY, rsvpEmail)
      }
      setGuestRsvpEmail(rsvpEmail)
      setMyRsvpMeetingIds((prev) => (prev.includes(meetingId) ? prev : [...prev, meetingId]))
      setRsvpCounts((prev) => ({ ...prev, [meetingId]: (prev[meetingId] ?? 0) + (myRsvpMeetingIds.includes(meetingId) ? 0 : 1) }))
      toast.success('RSVP saved. You will be notified when it starts.')
    } catch {
      toast.error('Failed to RSVP right now')
    }
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
        const uploaded = await uploadPublicMaterialFile(publishFile, publishType, user.id)
        materialUrl = uploaded.publicUrl
      }
      await publishMaterial({
        title: publishTitle.trim(),
        description: publishDescription.trim(),
        type: publishType,
        url: materialUrl,
        githubUrl: publishGithubUrl.trim() || undefined,
        ownerUserId: user.id,
        ownerName: user.name,
        isPublic: publishVisibility === 'public',
        visibility: publishVisibility,
        publishAfterInviteAccepted,
      })
      await initializeCommunity()
      toast.success('Publication created')
      setPublishTitle('')
      setPublishDescription('')
      setPublishType('recording')
      setPublishUrl('')
      setPublishGithubUrl('')
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
    if (!isAuthenticated || !user) {
      toast.error('Log in to post threads')
      return
    }
    if (!threadTitle.trim()) {
      toast.error('Thread title is required')
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
    toast.success('Thread posted')
    setThreadCommunityId('')
    setThreadTitle('')
    setThreadTags('')
  }

  const handleReply = (threadId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Log in to post replies')
      return
    }
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

  const handleReplyKeyDown = (event: KeyboardEvent<HTMLInputElement>, threadId: string) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    handleReply(threadId)
  }

  const handleMaterialReaction = (materialId: string, reaction: string, isAlreadySelected: boolean) => {
    if (!isAuthenticated || !user) {
      toast.error('Log in to react to materials')
      return
    }
    reactToMaterial(materialId, reaction, user?.id)
    if (!isAlreadySelected) {
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

  const getThreadParticipantTheme = (senderId?: string, senderName?: string) => {
    const key = `${senderId || ''}:${senderName || ''}` || 'anonymous'
    const hash = [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return threadParticipantThemes[Math.abs(hash) % threadParticipantThemes.length]
  }

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
      toast.success('Showing all projects')
      return
    }

    const numeric = Number(value)
    if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
      const target = projectMaterials[numeric - 1]
      if (!target) {
        toast.error('Unknown project number')
        return
      }
      setExploringProjectId(target.id)
      toast.success(`Exploring ${target.title}`)
      return
    }

    const normalized = value.replace(/^open\s+/, '')
    const target = projectMaterials.find((item) => item.title.toLowerCase() === normalized)
      || projectMaterials.find((item) => item.title.toLowerCase().includes(normalized))

    if (!target) {
      toast.error('Project not found')
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

  const openCanvas = (id: 'dashboard-tools' | 'ongoing-meetings' | 'public-materials' | 'threaded-chats' | 'activity' | 'communities-projects') => {
    setActiveCanvas(id)
  }
  const openDashboardTool = (panel: 'active-users' | 'publish' | 'manage' | 'invite' | 'community') => {
    setDashboardPanel(panel)
    setShowDashboardMenu(false)
    setActiveCanvas('dashboard-tools')
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#9d9a90] bg-[#ece8de] text-gray-900 shadow-[0_1px_0_#fff_inset,0_10px_24px_rgba(0,0,0,0.09)] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between border-b border-[#b4b0a5] bg-[#f3efe4] px-3 py-1.5 text-[13px] dark:border-gray-700 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-tight">Community OS</span>
            <button onClick={() => openCanvas('dashboard-tools')} className="text-[12px] text-gray-700 hover:underline dark:text-gray-300">Tools</button>
            <button onClick={() => openCanvas('public-materials')} className="text-[12px] text-gray-700 hover:underline dark:text-gray-300">Materials</button>
            <button onClick={() => openCanvas('threaded-chats')} className="text-[12px] text-gray-700 hover:underline dark:text-gray-300">Threads</button>
            <button onClick={() => openCanvas('communities-projects')} className="text-[12px] text-gray-700 hover:underline dark:text-gray-300">Directories</button>
          </div>
          <span className="rounded border border-amber-500 bg-amber-300 px-1.5 py-0.5 text-[11px] font-medium text-amber-900">retro mode</span>
        </div>

        <div className="relative grid grid-cols-1 gap-3 bg-[radial-gradient(circle_at_1px_1px,#d5d0c3_1px,transparent_1px)] [background-size:6px_6px] p-2 md:grid-cols-[70px_minmax(0,1fr)_70px] dark:bg-none">
          <aside className="hidden md:flex md:flex-col md:items-center md:gap-3">
            <button onClick={() => openCanvas('dashboard-tools')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <Users className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Tools</span>
            </button>
            <button onClick={() => openDashboardTool('active-users')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <Users className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Users</span>
            </button>
            <button onClick={() => openDashboardTool('publish')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <Plus className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Publish</span>
            </button>
            <button onClick={() => openCanvas('ongoing-meetings')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <Calendar className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Meetings</span>
            </button>
            <button onClick={() => openCanvas('threaded-chats')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <MessageSquarePlus className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Threads</span>
            </button>
          </aside>

          <div className="min-w-0 overflow-hidden rounded-md border border-[#8f8b80] bg-[#d8d6ce] shadow-[0_1px_0_#ffffff8a_inset] dark:border-gray-700 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-[#8f8b80] bg-[#c8c6be] px-3 py-1.5 text-[13px] font-medium dark:border-gray-700 dark:bg-gray-900">
              <span>Community suite</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm border border-gray-700 dark:border-gray-400" />
                <span className="h-2.5 w-2.5 rounded-sm border border-gray-700 dark:border-gray-400" />
                <span className="h-2.5 w-2.5 rounded-sm border border-gray-700 dark:border-gray-400" />
              </div>
            </div>

            <div className="max-h-[calc(100vh-11.5rem)] overflow-y-auto p-3 space-y-4">
      <section id="community-home" className="rounded-md border border-[#b4b0a5] bg-[#f4f3ed] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Community</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Live meetings, public materials, communities, threaded chats, and projects.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Radio className="h-4 w-4" />
            {visibleOngoingMeetings.length} live meetings · {activeUsers.length} active users
          </div>
        </div>
      </section>

          <div className="grid grid-cols-1 gap-6">
        <section className="order-2 space-y-6">
          {activeCanvas === 'ongoing-meetings' && (
          <div id="ongoing-meetings" className="rounded-md border border-[#b4b0a5] bg-[#f4f3ed] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Ongoing meetings</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">Guests can request access</span>
            </div>
            {visibleOngoingMeetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No meetings are live right now.</div>
            ) : (
              <div className="space-y-3">
                {visibleOngoingMeetings.map((meeting) => (
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
            {publicScheduledMeetings.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Public scheduled calls</p>
                {!isAuthenticated && (
                  <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">RSVP email (for start notifications)</label>
                    <input
                      value={guestRsvpEmail}
                      onChange={(e) => setGuestRsvpEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-xs dark:border-gray-700 dark:bg-gray-900"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {publicScheduledMeetings.map((meeting) => (
                    <div key={meeting.id} className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{meeting.title}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {meeting.type} · {formatTime(meeting.startTime)} · Host: {meeting.hostName}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{rsvpCounts[meeting.id] ?? 0} RSVPs</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => openJoinRequest(meeting.roomId)} className="rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs font-medium text-white dark:border-white dark:bg-white dark:text-gray-900">
                            Request to join
                          </button>
                          <button
                            onClick={() => void handleMeetingRsvp(meeting.id)}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                          >
                            <Bell className="h-3.5 w-3.5" />
                            {myRsvpMeetingIds.includes(meeting.id) ? 'RSVP saved' : 'RSVP'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {activeCanvas === 'public-materials' && (
          <div id="public-materials" className="rounded-md border border-[#b4b0a5] bg-[#f4f3ed] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Public materials</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMaterialsMenu((v) => !v)}
                  className="menu-trigger text-xs"
                >
                  <span>{materialsPanelMode === 'explore' ? 'Explore' : 'Publish'}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {showMaterialsMenu && (
                  <div className="dropdown-panel absolute right-0 top-full z-20 mt-2 w-40">
                    <button
                      type="button"
                      onClick={() => {
                        setMaterialsPanelMode('explore')
                        setShowMaterialsMenu(false)
                      }}
                      className={`dropdown-item ${materialsPanelMode === 'explore' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    >
                      Explore materials
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMaterialsPanelMode('publish')
                        setShowMaterialsMenu(false)
                      }}
                      className={`dropdown-item ${materialsPanelMode === 'publish' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    >
                      Publish material
                    </button>
                  </div>
                )}
              </div>
            </div>
            {materialsPanelMode === 'publish' && (
              <form onSubmit={handlePublishMaterial} className="mb-4 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
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
                {publishType === 'project' && (
                  <>
                    <input value={publishGithubUrl} onChange={(e) => setPublishGithubUrl(e.target.value)} placeholder="GitHub repo URL" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
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
                <button type="submit" disabled={isPublishing} className="rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:border-white dark:bg-white dark:text-gray-900">{isPublishing ? 'Publishing...' : 'Publish'}</button>
              </form>
            )}
            {materialsPanelMode === 'explore' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Published</p>
                {visiblePublicMaterials.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    No public materials yet.
                  </div>
                ) : (
                  <div className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
                    {visiblePublicMaterials.map((material) => {
                      const selected = exploringMaterialId === material.id || (!exploringMaterialId && visiblePublicMaterials[0]?.id === material.id)
                      return (
                        <button
                          key={material.id}
                          type="button"
                          onClick={() => setExploringMaterialId(material.id)}
                          className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
                            selected
                              ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                              : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/70'
                          }`}
                        >
                          <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">{material.title}</p>
                          <p className="mt-0.5 text-[11px] capitalize text-gray-500 dark:text-gray-400">{material.type}</p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              {(() => {
                const material = visiblePublicMaterials.find((m) => m.id === exploringMaterialId) ?? visiblePublicMaterials[0]
                if (!material) return null
                const Icon = materialTypeIcon[material.type]
                return (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
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
                      {(['like', 'helpful', 'insightful'] as const).map((reaction) => {
                        const styles = reactionStyleMap[reaction]
                        const ReactionIcon = styles.Icon
                        const selected = !!material.myReactions?.includes(reaction)
                        return (
                          <motion.button
                            key={reaction}
                            type="button"
                            onClick={() => handleMaterialReaction(material.id, reaction, selected)}
                            whileTap={{ scale: 0.96 }}
                            animate={
                              reactionPulseKey?.startsWith(`${material.id}:${reaction}:`)
                                ? { scale: [1, 1.08, 0.98, 1.04, 1], opacity: [1, 0.92, 1] }
                                : undefined
                            }
                            transition={{ duration: 0.42, ease: 'easeOut' }}
                            className={[
                              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                              selected ? styles.active : styles.idle,
                            ].join(' ')}
                          >
                            <ReactionIcon className={`h-3.5 w-3.5 ${styles.iconClass && selected ? styles.iconClass : ''}`} />
                            {styles.label} ({material.reactions[reaction] ?? 0})
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
            )}
          </div>
          )}

          {activeCanvas === 'threaded-chats' && (
          <div id="threaded-chats" className="rounded-md border border-[#b4b0a5] bg-[#f4f3ed] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Threaded chats</h2>
              <div className="relative ml-auto">
                <button
                  type="button"
                  onClick={() => setShowThreadsMenu((v) => !v)}
                  className="menu-trigger text-xs"
                >
                  <span>{threadsPanelMode === 'explore' ? 'Explore' : 'Post thread'}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {showThreadsMenu && (
                  <div className="dropdown-panel absolute right-0 top-full z-20 mt-2 w-40">
                    <button
                      type="button"
                      onClick={() => {
                        setThreadsPanelMode('explore')
                        setShowThreadsMenu(false)
                      }}
                      className={`dropdown-item ${threadsPanelMode === 'explore' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    >
                      Explore threads
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThreadsPanelMode('post')
                        setShowThreadsMenu(false)
                      }}
                      className={`dropdown-item ${threadsPanelMode === 'post' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    >
                      Post thread
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void initializeCommunity()}
                className="btn-compact text-xs"
                title="Refresh latest replies"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
            {threadsPanelMode === 'post' && (
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
              <input disabled={!isAuthenticated} value={threadTitle} onChange={(e) => setThreadTitle(e.target.value)} placeholder={isAuthenticated ? 'Thread title' : 'Log in to post threads'} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <input disabled={!isAuthenticated} value={threadTags} onChange={(e) => setThreadTags(e.target.value)} placeholder="Tags (comma-separated)" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Create thread first. Only replies appear as chat messages.</p>
              <button disabled={!isAuthenticated} type="submit" className="rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:border-white dark:bg-white dark:text-gray-900">Post thread</button>
            </form>
            )}

            {threadsPanelMode === 'explore' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Threads</p>
                {recentThreads.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    No threads yet.
                  </div>
                ) : (
                  <div className="max-h-[30rem] space-y-1 overflow-y-auto pr-1">
                    {recentThreads.map((thread) => {
                      const selected = exploringThreadId === thread.id || (!exploringThreadId && recentThreads[0]?.id === thread.id)
                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => setExploringThreadId(thread.id)}
                          className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
                            selected
                              ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                              : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/70'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <p className="min-w-0 flex-1 truncate text-xs font-medium text-gray-900 dark:text-gray-100">{thread.title}</p>
                            {(unreadByThread.get(thread.id) ?? 0) > 0 && (
                              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                new
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{thread.communityId ? 'community' : 'general'}</p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              {(() => {
                const thread = selectedThread
                if (!thread) return null
                const messages = selectedThreadMessages
                return (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
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
                          const theme = getThreadParticipantTheme(msg.authorUserId, msg.authorName)
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
                                <div className={`h-6 w-6 shrink-0 rounded-full border text-[10px] font-semibold ${showMeta ? 'opacity-100' : 'opacity-0'} ${theme.avatar} flex items-center justify-center`}>
                                  {getInitials(msg.authorName)}
                                </div>
                                <div
                                  className={`max-w-[88%] rounded-2xl border px-3 py-2 text-sm ${theme.bubble} ${isMine ? 'ring-1 ring-gray-300 dark:ring-gray-600' : ''}`}
                                >
                                  {showMeta && (
                                    <div className={`mb-1 flex flex-wrap items-center gap-2 text-xs ${theme.meta}`}>
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
                                  <p className={theme.text}>{msg.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyDrafts[thread.id] || ''}
                        onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                        onKeyDown={(e) => handleReplyKeyDown(e, thread.id)}
                        placeholder={isAuthenticated ? 'Reply to thread... (Enter to send)' : 'Log in to reply'}
                        disabled={!isAuthenticated}
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                      />
                      <button disabled={!isAuthenticated} onClick={() => handleReply(thread.id)} className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">Reply</button>
                    </div>
                  </div>
                )
              })()}
            </div>
            )}
          </div>
          )}
        </section>

        <section className="order-1 space-y-6">
          {activeCanvas === 'dashboard-tools' && (
          <div id="dashboard-tools" className="rounded-md border border-[#b4b0a5] bg-[#f4f3ed] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[11px] ${activeUser.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${activeUser.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {activeUser.isActive ? 'online' : 'recent'}
                          </span>
                          {isAuthenticated && user && activeUser.id !== user.id && (
                            <button
                              type="button"
                              onClick={() => toggleFollowUser(activeUser.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            >
                              {followedUserIds.includes(activeUser.id) ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                              {followedUserIds.includes(activeUser.id) ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>
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
                    {visibleOngoingMeetings.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No calls are live right now.</div>
                    ) : (
                      visibleOngoingMeetings.map((meeting) => (
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
                {publishType === 'project' && (
                  <>
                    <input value={publishGithubUrl} onChange={(e) => setPublishGithubUrl(e.target.value)} placeholder="GitHub repo URL" className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
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
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {activeCanvas === 'activity' && (
        <section id="activity" className="rounded-md border border-[#b4b0a5] bg-[#f4f3ed] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Reaction analytics</p>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <Heart className="h-3 w-3" /> Like {reactionTotals.like}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700 dark:border-sky-800/70 dark:bg-sky-900/20 dark:text-sky-300">
                    <ThumbsUp className="h-3 w-3" /> Helpful {reactionTotals.helpful}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700 dark:border-amber-800/70 dark:bg-amber-900/20 dark:text-amber-300">
                    <Lightbulb className="h-3 w-3" /> Insightful {reactionTotals.insightful}
                  </span>
                </div>
                {recentReactionEvents.length > 0 ? (
                  <div className="space-y-2">
                    {recentReactionEvents.map((event) => {
                      const actor = event.actorUserId ? publicUsers.find((entry) => entry.id === event.actorUserId) : undefined
                      const material = publicMaterials.find((entry) => entry.id === event.materialId)
                      const actionLabel = event.action === 'add' ? 'added' : 'removed'
                      return (
                        <div key={event.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900">
                          <span className="font-medium text-gray-900 dark:text-white">{actor?.name || 'Guest'}</span>{' '}
                          <span className="text-gray-600 dark:text-gray-300">{actionLabel} {event.reaction}</span>{' '}
                          <span className="text-gray-500 dark:text-gray-400">on {material?.title || 'material'}</span>
                          <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{formatTime(event.createdAt)}</div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    No reaction events yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        )}

        {activeCanvas === 'communities-projects' && (
        <section id="communities-projects" className="rounded-md border border-[#b4b0a5] bg-[#f4f3ed] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Projects</p>
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
                  {projectMaterials.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-200 p-3 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      No project posts yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {projectMaterials.map((item, index) => (
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

                  {projectMaterials.length > 0 && (
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
                  const selected = projectMaterials.find((item) => item.id === exploringProjectId)
                  if (!selected) {
                    return (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Type a number or `open project-name` to inspect a project. `all` returns to the full list.
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
        )}
            </div>
          </div>
          </div>

          <aside className="hidden md:flex md:flex-col md:items-center md:gap-3">
            <button onClick={() => openCanvas('public-materials')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <FolderPlus className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Directory</span>
            </button>
            <button onClick={() => openCanvas('activity')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <Radio className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Activity</span>
            </button>
            <button onClick={() => openCanvas('communities-projects')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <ExternalLink className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Explore</span>
            </button>
            <button onClick={() => openDashboardTool('manage')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <Edit3 className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Manage</span>
            </button>
            <button onClick={() => openDashboardTool('invite')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <MessageSquarePlus className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Invite</span>
            </button>
            <button onClick={() => openDashboardTool('community')} className="group flex w-full flex-col items-center rounded-md border border-transparent px-1 py-1.5 hover:border-[#b8b4a9] hover:bg-white/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/60">
              <FolderPlus className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px]">Create</span>
            </button>
          </aside>
        </div>
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
