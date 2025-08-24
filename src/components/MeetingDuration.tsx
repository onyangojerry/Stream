import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface MeetingDurationProps {
  startTime: Date
  isActive: boolean
}

const MeetingDuration = ({ startTime, isActive }: MeetingDurationProps) => {
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const updateDuration = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setDuration(diff)
    }

    // Update immediately
    updateDuration()

    // Update every second
    const interval = setInterval(updateDuration, 1000)

    return () => clearInterval(interval)
  }, [startTime, isActive])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!isActive) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">{formatDuration(duration)}</span>
    </div>
  )
}

export default MeetingDuration
