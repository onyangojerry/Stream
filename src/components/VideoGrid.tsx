import { useRef, useEffect } from 'react'
import { useVideoStore } from '../store/useVideoStore'
import { Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react'

const VideoGrid = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)
  const { localStream, remoteStreams, currentUser, screenShare } = useVideoStore()

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (screenShareRef.current && screenShare) {
      screenShareRef.current.srcObject = screenShare.stream
    }
  }, [screenShare])

  const totalStreams = remoteStreams.length + (localStream ? 1 : 0) + (screenShare ? 1 : 0)
  
  const getGridClass = () => {
    if (totalStreams <= 1) return 'grid-cols-1'
    if (totalStreams <= 2) return 'grid-cols-1 sm:grid-cols-2'
    if (totalStreams <= 4) return 'grid-cols-1 sm:grid-cols-2'
    if (totalStreams <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    if (totalStreams <= 9) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div className="h-full p-2 sm:p-4">
      <div className={`grid ${getGridClass()} gap-2 sm:gap-4 h-full`}>
        {/* Local Video */}
        {localStream && (
          <div className="video-container relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {currentUser?.name || 'You'}
            </div>
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-1 sm:space-x-2">
              <div className="bg-black bg-opacity-50 p-1.5 sm:p-2 rounded-full">
                <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-black bg-opacity-50 p-1.5 sm:p-2 rounded-full">
                <Video className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Remote Videos */}
        {remoteStreams.map((stream) => (
          <div key={stream.id} className="video-container relative">
            <video
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
              ref={(el) => {
                if (el) el.srcObject = stream.stream
              }}
            />
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {stream.user.name}
            </div>
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-1 sm:space-x-2">
              {!stream.isAudioEnabled && (
                <div className="bg-red-600 p-1.5 sm:p-2 rounded-full">
                  <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
              {!stream.isVideoEnabled && (
                <div className="bg-red-600 p-1.5 sm:p-2 rounded-full">
                  <VideoOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
              {stream.isScreenShare && (
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-full">
                  <Monitor className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Screen Share */}
        {screenShare && (
          <div className="video-container relative col-span-full">
            <video
              ref={screenShareRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain rounded-lg bg-black"
            />
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {screenShare.user.name} - Screen Share
            </div>
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-full">
                <Monitor className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for empty state */}
        {totalStreams === 0 && (
          <div className="col-span-full flex items-center justify-center h-full">
            <div className="text-center text-gray-400 p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Video className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-base sm:text-lg font-medium">No video streams available</p>
              <p className="text-xs sm:text-sm">Start your camera to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGrid
