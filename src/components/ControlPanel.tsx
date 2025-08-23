import { useState } from 'react'
import { useVideoStore } from '../store/useVideoStore'
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  Settings, Volume2, VolumeX,
  MoreVertical
} from 'lucide-react'

const ControlPanel = () => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    stopScreenShare,
    isTranscriptionEnabled,
    toggleTranscription,
    isRecording,
    startRecording,
    stopRecording
  } = useVideoStore()

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        // Add event listener to detect when user stops sharing
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare()
        })
        
        // Store the screen share stream
        useVideoStore.getState().setScreenShare({
          id: 'screen-share-' + Date.now(),
          stream: screenStream,
          user: { id: 'local', name: 'You', email: '', isOnline: true },
          isActive: true
        })
        
        toggleScreenShare()
      } else {
        stopScreenShare()
      }
    } catch (error) {
      console.error('Error with screen sharing:', error)
    }
  }

  const handleRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  return (
    <div className="bg-gray-800 p-2 sm:p-4 rounded-lg">
      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4">
        <button
          onClick={toggleAudio}
          className={`control-button ${!isAudioEnabled ? 'muted' : ''}`}
          title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {isAudioEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`control-button ${!isVideoEnabled ? 'muted' : ''}`}
          title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
        >
          {isVideoEnabled ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        
        <button
          onClick={handleScreenShare}
          className={`control-button ${isScreenSharing ? 'active' : ''}`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
        >
          {isScreenSharing ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        
        <button
          onClick={handleRecording}
          className={`control-button ${isRecording ? 'active' : ''}`}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${isRecording ? 'bg-red-500 border-red-500' : 'border-white'}`}></div>
        </button>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="control-button"
          title="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="control-button"
          title="More Options"
        >
          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-300">Audio Level</label>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <VolumeX className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-300">Video Quality</label>
              <select className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600">
                <option value="720p">720p</option>
                <option value="1080p" selected>1080p</option>
                <option value="4k">4K</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <button
              onClick={toggleTranscription}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isTranscriptionEnabled
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {isTranscriptionEnabled ? 'Transcription ON' : 'Transcription OFF'}
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Camera</span>
              <select className="px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600">
                <option value="default">Default Camera</option>
                <option value="external">External Camera</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Auto-mute on join</span>
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Show video preview</span>
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Enable background blur</span>
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Noise suppression</span>
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" defaultChecked />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ControlPanel
