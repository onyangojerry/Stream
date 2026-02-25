import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Loader,
  Lock,
  Mic,
  MicOff,
  Settings,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

interface JoinMeetingProps {
  meetingId?: string
  onJoin?: (config: JoinConfig) => void
  onCancel?: () => void
}

interface JoinConfig {
  meetingId: string
  displayName: string
  password?: string
  isVideoEnabled: boolean
  isAudioEnabled: boolean
}

const JoinMeeting: React.FC<JoinMeetingProps> = ({ meetingId: initialMeetingId, onJoin, onCancel }) => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [config, setConfig] = useState<JoinConfig>({
    meetingId: initialMeetingId || '',
    displayName: isAuthenticated && user ? user.name : '',
    isVideoEnabled: true,
    isAudioEnabled: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [meetingInfo, setMeetingInfo] = useState<any>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent')
  const previewRef = React.useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!config.isVideoEnabled || !previewRef.current) return
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (previewRef.current) previewRef.current.srcObject = stream
      })
      .catch(() => {})
  }, [config.isVideoEnabled])

  useEffect(() => {
    if (config.meetingId.length >= 9) {
      setIsValidating(true)
      setValidationStatus('validating')
      setTimeout(() => {
        const isValid = config.meetingId.includes('-')
        if (isValid) {
          setValidationStatus('valid')
          setMeetingInfo({
            title: 'Team Standup Meeting',
            host: 'John Doe',
            participants: 5,
            duration: '45 min',
            requiresPassword: config.meetingId.includes('secure'),
          })
          setShowPassword(config.meetingId.includes('secure'))
        } else {
          setValidationStatus('invalid')
          setMeetingInfo(null)
        }
        setIsValidating(false)
      }, 900)
    } else {
      setValidationStatus('idle')
      setMeetingInfo(null)
    }
  }, [config.meetingId])

  useEffect(() => {
    const interval = setInterval(() => {
      const qualities = ['excellent', 'good', 'poor'] as const
      setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleJoin = async () => {
    if (validationStatus !== 'valid' || !config.displayName.trim()) return

    if (!isAuthenticated) {
      const shouldCreateAccount = window.confirm(
        'Would you like to create an account for the best experience? Click OK to sign up, or Cancel to continue as a guest.'
      )
      if (shouldCreateAccount) {
        sessionStorage.setItem('pendingJoin', JSON.stringify(config))
        navigate('/signup')
        return
      }
    }

    setIsJoining(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (onJoin) {
      onJoin(config)
    } else {
      navigate(`/call/${config.meetingId}`)
    }
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    else navigate('/')
  }

  const getConnectionIndicator = () => {
    if (connectionQuality === 'excellent') return <Wifi className="h-4 w-4 text-emerald-500" />
    if (connectionQuality === 'good') return <Wifi className="h-4 w-4 text-amber-500" />
    return <WifiOff className="h-4 w-4 text-red-500" />
  }

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Loader className="h-4 w-4 animate-spin text-gray-500" />
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Join meeting</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Preview your setup before entering the room.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
              {getConnectionIndicator()}
              {connectionQuality}
            </div>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950">
            {config.isVideoEnabled ? (
              <video ref={previewRef} autoPlay muted className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                    {config.displayName ? (
                      <span className="text-xl font-semibold">{config.displayName.charAt(0).toUpperCase()}</span>
                    ) : (
                      <VideoOff className="h-6 w-6" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{config.displayName || 'Preview hidden'}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Camera is off</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setConfig((prev) => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }))}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  config.isVideoEnabled
                    ? 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
                }`}
              >
                {config.isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setConfig((prev) => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }))}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  config.isAudioEnabled
                    ? 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
                }`}
              >
                {config.isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Details</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Meeting ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.meetingId}
                    onChange={(e) => setConfig((prev) => ({ ...prev, meetingId: e.target.value.replace(/\s/g, '') }))}
                    placeholder="123-456-789"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-9 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-gray-400"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">{getValidationIcon()}</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Display name</label>
                <input
                  type="text"
                  value={config.displayName}
                  onChange={(e) => setConfig((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-gray-400"
                />
              </div>

              {showPassword && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={config.password || ''}
                      onChange={(e) => setConfig((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Meeting password"
                      className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {meetingInfo && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Meeting</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium text-gray-900 dark:text-white">{meetingInfo.title}</p>
                <p className="text-gray-600 dark:text-gray-400">Host: {meetingInfo.host}</p>
                <p className="text-gray-600 dark:text-gray-400">{meetingInfo.participants} participants • {meetingInfo.duration}</p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-3">
              <button
                onClick={handleJoin}
                disabled={validationStatus !== 'valid' || !config.displayName.trim() || isJoining}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isJoining ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join meeting
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default JoinMeeting
