import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Square, 
  Play, 
  Pause, 
  Download,
  Settings,
  Mic,
  MicOff,
  AlertCircle,
  Check
} from 'lucide-react';
import { useRecordingStore } from '../store/useRecordingStore';

interface RecordingControlsProps {
  meetingId: string;
  className?: string;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ 
  meetingId, 
  className = '' 
}) => {
  const {
    isRecording,
    isPaused,
    recordingDuration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  } = useRecordingStore();

  const [showSettings, setShowSettings] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setIsStarting(true);
      setError(null);
      
      const title = recordingTitle || `Meeting Recording - ${new Date().toLocaleDateString()}`;
      await startRecording(meetingId, title);
      
      setRecordingTitle('');
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    setError(null);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  if (!isRecording && !showSettings) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <motion.button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Video size={20} />
          Start Recording
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <AnimatePresence>
        {showSettings && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Video className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Start Recording
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Configure your screen recording
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recording Title
                  </label>
                  <input
                    type="text"
                    value={recordingTitle}
                    onChange={(e) => setRecordingTitle(e.target.value)}
                    placeholder={`Meeting Recording - ${new Date().toLocaleDateString()}`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mic className={micEnabled ? 'text-green-600' : 'text-gray-400'} size={20} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Include Microphone
                    </span>
                  </div>
                  <button
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      micEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      micEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartRecording}
                    disabled={isStarting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {isStarting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Video size={18} />
                        Start
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {/* Recording Status */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isPaused ? 'Paused' : 'Recording'}
            </span>
          </div>

          {/* Duration */}
          <div className="text-lg font-mono font-bold text-gray-900 dark:text-white min-w-[80px]">
            {formatDuration(recordingDuration)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handlePauseResume}
              className="p-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </motion.button>

            <motion.button
              onClick={handleStopRecording}
              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square size={18} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RecordingControls;