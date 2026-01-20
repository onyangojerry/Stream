import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Monitor,
  Users,
  Calendar,
  Clock,
  Copy,
  Share,
  ArrowRight,
  Camera,
  Headphones,
  Wifi,
  Shield,
  Eye,
  EyeOff,
  Zap,
  Sparkles
} from 'lucide-react';

interface InstantMeetingProps {
  onStartMeeting: (config: MeetingConfig) => void;
  onCancel: () => void;
}

interface MeetingConfig {
  title: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  allowRecording: boolean;
  requirePassword: boolean;
  password?: string;
  maxParticipants: number;
}

const InstantMeeting: React.FC<InstantMeetingProps> = ({ onStartMeeting, onCancel }) => {
  const [config, setConfig] = useState<MeetingConfig>({
    title: 'Instant Meeting',
    isVideoEnabled: true,
    isAudioEnabled: true,
    allowRecording: true,
    requirePassword: false,
    maxParticipants: 50,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [meetingId] = useState(`${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 3)}`);

  const handleStartMeeting = async () => {
    setIsGeneratingId(true);
    // Simulate meeting creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    onStartMeeting(config);
  };

  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    // Show success feedback
  };

  const previewRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    // Initialize camera preview
    if (config.isVideoEnabled && previewRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (previewRef.current) {
            previewRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }
  }, [config.isVideoEnabled]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-20 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Create Instant Meeting</h1>
          <p className="text-white/70 text-lg">Set up your meeting preferences and start instantly</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-6 border border-white/20 card-3d">
              <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
                <Camera className="text-purple-400" size={20} />
                Camera Preview
              </h3>
              
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
                {config.isVideoEnabled ? (
                  <video
                    ref={previewRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <VideoOff size={24} className="text-white" />
                      </div>
                      <p className="text-white/70">Camera is turned off</p>
                    </div>
                  </div>
                )}
                
                {/* Preview Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfig(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }))}
                    className={`control-button p-3 ${
                      config.isVideoEnabled 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-glow-cyan' 
                        : 'bg-red-500/80 shadow-glow-red'
                    }`}
                  >
                    {config.isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfig(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }))}
                    className={`control-button p-3 ${
                      config.isAudioEnabled 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-glow-green' 
                        : 'bg-red-500/80 shadow-glow-red'
                    }`}
                  >
                    {config.isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="control-button p-3"
                  >
                    <Settings size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Meeting Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Meeting Details */}
            <div className="glass-card p-6 border border-white/20 card-3d">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="text-yellow-400" size={20} />
                Meeting Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Meeting Title</label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="input-modern w-full"
                    placeholder="Enter meeting title"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Meeting ID</label>
                  <div className="flex gap-2">
                    <div className="flex-1 input-modern bg-white/5 text-white/70 cursor-not-allowed">
                      {meetingId}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyMeetingId}
                      className="btn-secondary p-3"
                    >
                      <Copy size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="glass-card p-6 border border-white/20 card-3d">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="text-cyan-400" size={20} />
                Quick Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video size={16} className="text-blue-400" />
                    <span className="text-white">Enable Video</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfig(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      config.isVideoEnabled ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: config.isVideoEnabled ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                    />
                  </motion.button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic size={16} className="text-green-400" />
                    <span className="text-white">Enable Audio</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfig(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      config.isAudioEnabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: config.isAudioEnabled ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                    />
                  </motion.button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor size={16} className="text-orange-400" />
                    <span className="text-white">Allow Recording</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfig(prev => ({ ...prev, allowRecording: !prev.allowRecording }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      config.allowRecording ? 'bg-orange-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: config.allowRecording ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                    />
                  </motion.button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full text-left text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                </motion.button>
              </div>
            </div>

            {/* Advanced Settings */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-6 border border-white/20 card-3d"
                >
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Shield className="text-purple-400" size={20} />
                    Advanced Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield size={16} className="text-red-400" />
                        <span className="text-white">Require Password</span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setConfig(prev => ({ ...prev, requirePassword: !prev.requirePassword }))}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          config.requirePassword ? 'bg-red-500' : 'bg-gray-600'
                        }`}
                      >
                        <motion.div
                          animate={{ x: config.requirePassword ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                        />
                      </motion.button>
                    </div>
                    
                    {config.requirePassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-white/80 text-sm font-medium mb-2">Meeting Password</label>
                        <input
                          type="password"
                          value={config.password || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                          className="input-modern w-full"
                          placeholder="Enter password"
                        />
                      </motion.div>
                    )}
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Max Participants</label>
                      <select
                        value={config.maxParticipants}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                        className="input-modern w-full"
                      >
                        <option value={10}>10 participants</option>
                        <option value={25}>25 participants</option>
                        <option value={50}>50 participants</option>
                        <option value={100}>100 participants</option>
                        <option value={500}>500 participants</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartMeeting}
                disabled={isGeneratingId}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGeneratingId ? (
                  <>
                    <div className="loading-spinner" />
                    Creating Meeting...
                  </>
                ) : (
                  <>
                    Start Instant Meeting
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="w-full btn-secondary py-3"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InstantMeeting;