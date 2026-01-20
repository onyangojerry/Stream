import React from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Monitor, FileVideo } from 'lucide-react';
import RecordingControls from '../components/RecordingControls';
import { useRecordingStore } from '../store/useRecordingStore';
import { Link } from 'react-router-dom';

const RecordingTestPage: React.FC = () => {
  const { recordings, isRecording, recordingDuration } = useRecordingStore();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Screen Recording Test
          </h1>
          <p className="text-white/70 text-lg">
            Test the screen recording functionality and view recordings
          </p>
        </motion.div>

        {/* Recording Status */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-semibold">Recording in Progress</span>
            </div>
            <div className="text-white font-mono text-2xl">
              {formatDuration(recordingDuration)}
            </div>
          </motion.div>
        )}

        {/* Recording Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 border border-white/20 mb-8"
        >
          <div className="text-center mb-6">
            <Monitor className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Screen Recording</h2>
            <p className="text-white/70">
              Click "Start Recording" to record your screen. You'll be able to select which screen or application to record.
            </p>
          </div>
          
          <div className="flex justify-center">
            <RecordingControls 
              meetingId={`test-${Date.now()}`}
              className=""
            />
          </div>
        </motion.div>

        {/* Recordings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileVideo className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Your Recordings</h2>
            </div>
            <Link 
              to="/recordings" 
              className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
            >
              <Play size={16} />
              View All
            </Link>
          </div>
          
          {recordings.length > 0 ? (
            <div className="space-y-3">
              {recordings.slice(0, 3).map((recording, index) => (
                <motion.div
                  key={recording.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <img 
                    src={recording.thumbnail} 
                    alt={recording.title}
                    className="w-16 h-10 object-cover rounded bg-gray-800"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{recording.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>{formatDuration(recording.duration)}</span>
                      <span>{recording.size}</span>
                      <span>{recording.date.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (recording.downloadUrl.startsWith('blob:')) {
                        window.open(recording.downloadUrl, '_blank');
                      }
                    }}
                    className="control-button p-2"
                  >
                    <Play size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No recordings yet. Start recording to see them here!</p>
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
        >
          <h3 className="text-blue-400 font-semibold mb-2">How to Test:</h3>
          <ul className="text-white/70 text-sm space-y-1">
            <li>1. Click "Start Recording" above</li>
            <li>2. Select which screen/application to record when prompted</li>
            <li>3. The recording will start and you'll see a timer</li>
            <li>4. Click the stop button or close the screen share to end recording</li>
            <li>5. Your recording will appear in the list below</li>
            <li>6. Click the play button to view your recording</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default RecordingTestPage;