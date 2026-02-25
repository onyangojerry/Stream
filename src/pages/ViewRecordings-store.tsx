import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  Copy,
  Download,
  Grid,
  List,
  Pause,
  Play,
  Search,
  Share,
  Star,
  StarOff,
  Users,
  X,
} from 'lucide-react'
import ResponsivePageLayout from '../components/ResponsivePageLayout'
import { useRecordingStore } from '../store/useRecordingStore'

interface ViewRecordingsProps {
  onBack: () => void
}

const ViewRecordings: React.FC<ViewRecordingsProps> = ({ onBack }) => {
  const { recordings, toggleStarRecording, downloadRecording } = useRecordingStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null)
  const [playingRecording, setPlayingRecording] = useState<string | null>(null)
  const [showTagFilters, setShowTagFilters] = useState(false)

  const allTags = [...new Set(recordings.flatMap((r) => r.tags))].sort()

  const filteredRecordings = recordings
    .filter((recording) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        recording.title.toLowerCase().includes(q) ||
        recording.description?.toLowerCase().includes(q) ||
        recording.tags.some((tag) => tag.toLowerCase().includes(q))

      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => recording.tags.includes(tag))

      return matchesSearch && matchesTags
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'duration':
          comparison = a.duration - b.duration
          break
        case 'size':
          comparison = parseFloat(a.size) - parseFloat(b.size)
          break
        case 'date':
        default:
          comparison = a.date.getTime() - b.date.getTime()
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const copyShareLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore clipboard failures in browser-restricted contexts
    }
  }

  const openPlayback = (recording: any) => {
    setPlayingRecording((prev) => (prev === recording.id ? null : recording.id))
    if (recording.downloadUrl?.startsWith('blob:')) {
      window.open(recording.downloadUrl, '_blank')
    }
  }

  const Card = ({ recording }: { recording: any }) => {
    const isPlaying = playingRecording === recording.id

    if (viewMode === 'list') {
      return (
        <div
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          onClick={() => setSelectedRecording(recording)}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 md:w-56 md:flex-shrink-0">
              <img src={recording.thumbnail} alt={recording.title} className="h-full w-full object-cover" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openPlayback(recording)
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0 transition hover:opacity-100"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">{recording.title}</h3>
                  {recording.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{recording.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStarRecording(recording.id)
                  }}
                  className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  {recording.isStarred ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(recording.date)}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{recording.participants}</span>
                <span>{formatDuration(recording.duration)}</span>
                <span>{recording.size}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {recording.tags.slice(0, 4).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadRecording(recording.id)
                  }}
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyShareLink(recording.streamUrl || recording.downloadUrl)
                  }}
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  <Share className="h-3.5 w-3.5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        onClick={() => setSelectedRecording(recording)}
      >
        <div className="relative mb-3 aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <img src={recording.thumbnail} alt={recording.title} className="h-full w-full object-cover" />
          <button
            onClick={(e) => {
              e.stopPropagation()
              openPlayback(recording)
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0 transition hover:opacity-100"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
            {formatDuration(recording.duration)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{recording.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleStarRecording(recording.id)
            }}
            className="rounded-lg p-1 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
          >
            {recording.isStarred ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
          </button>
        </div>

        {recording.description && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{recording.description}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDate(recording.date)}</span>
          <span>•</span>
          <span>{recording.participants} ppl</span>
          <span>•</span>
          <span>{recording.size}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {recording.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              downloadRecording(recording.id)
            }}
            className="btn-secondary flex-1 px-3 py-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              copyShareLink(recording.streamUrl || recording.downloadUrl)
            }}
            className="btn-secondary flex-1 px-3 py-2 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      </div>
    )
  }

  return (
    <ResponsivePageLayout
      title="Recordings"
      subtitle={`${filteredRecordings.length} recording${filteredRecordings.length === 1 ? '' : 's'}`}
      onBack={onBack}
      backLabel="Back to Home"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recordings"
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-gray-400"
            />
          </div>

          <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as any)
                setSortOrder(order as any)
              }}
              className="min-w-[180px] appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-9 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-gray-400"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="duration-desc">Longest first</option>
              <option value="duration-asc">Shortest first</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={() => setShowTagFilters((v) => !v)}
            className="btn-secondary px-4 py-2.5 text-sm"
          >
            Tags {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
          </button>
        </div>

        <AnimatePresence>
          {showTagFilters && allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden border-t border-gray-200 pt-3 dark:border-gray-800"
            >
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        active
                          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                          : 'border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {filteredRecordings.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-white">No recordings found</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Adjust your search or filters to see more results.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
          {filteredRecordings.map((recording, index) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card recording={recording} />
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setSelectedRecording(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedRecording.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{selectedRecording.description || 'No description'}</p>
                </div>
                <button
                  onClick={() => setSelectedRecording(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                <img
                  src={selectedRecording.thumbnail}
                  alt={selectedRecording.title}
                  className="h-full max-h-72 w-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">{formatDuration(selectedRecording.duration)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">{formatDate(selectedRecording.date)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedRecording.participants}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedRecording.size}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedRecording.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => downloadRecording(selectedRecording.id)}
                  className="btn-primary flex-1 px-4 py-2.5 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => copyShareLink(selectedRecording.streamUrl || selectedRecording.downloadUrl)}
                  className="btn-secondary flex-1 px-4 py-2.5 text-sm"
                >
                  <Share className="h-4 w-4" />
                  Share link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ResponsivePageLayout>
  )
}

export default ViewRecordings
