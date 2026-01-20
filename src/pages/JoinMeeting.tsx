import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Users,
  Copy,
  Share,
  ArrowRight,
  Camera,
  Headphones,
  Wifi,
  WifiOff,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  Clock,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface JoinMeetingProps {
  meetingId?: string;
  onJoin?: (config: JoinConfig) => void;
  onCancel?: () => void;
}

interface JoinConfig {
  meetingId: string;
  displayName: string;
  password?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const JoinMeeting: React.FC<JoinMeetingProps> = ({ meetingId: initialMeetingId, onJoin, onCancel }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [config, setConfig] = useState<JoinConfig>({
    meetingId: initialMeetingId || '',
    displayName: isAuthenticated && user ? user.name : '',
    isVideoEnabled: true,
    isAudioEnabled: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  
  const previewRef = React.useRef<HTMLVideoElement>(null);

  // Initialize camera preview
  useEffect(() => {
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

  // Validate meeting ID
  useEffect(() => {
    if (config.meetingId.length >= 9) {
      setIsValidating(true);
      setValidationStatus('validating');
      
      // Simulate API call
      setTimeout(() => {
        const isValid = config.meetingId.includes('-'); // Simple validation
        if (isValid) {
          setValidationStatus('valid');
          setMeetingInfo({
            title: 'Team Standup Meeting',
            host: 'John Doe',
            participants: 5,
            duration: '45 min',
            requiresPassword: config.meetingId.includes('secure'),
            isRecording: true,
          });
          setShowPassword(config.meetingId.includes('secure'));
        } else {
          setValidationStatus('invalid');
          setMeetingInfo(null);
        }
        setIsValidating(false);
      }, 1500);
    } else {
      setValidationStatus('idle');
      setMeetingInfo(null);
    }
  }, [config.meetingId]);

  // Monitor connection quality
  useEffect(() => {
    const interval = setInterval(() => {
      const qualities = ['excellent', 'good', 'poor'] as const;
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async () => {
    if (validationStatus !== 'valid' || !config.displayName.trim()) return;
    
    // If not authenticated, offer to join as guest or sign up
    if (!isAuthenticated) {
      const shouldCreateAccount = window.confirm(
        'Would you like to create an account for the best experience? Click OK to sign up, or Cancel to continue as a guest.'
      );
      
      if (shouldCreateAccount) {
        // Save join data and redirect to signup
        sessionStorage.setItem('pendingJoin', JSON.stringify(config));
        navigate('/signup');
        return;
      }
    }
    
    setIsJoining(true);
    // Simulate joining process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (onJoin) {
      onJoin(config);
    } else {
      // Direct navigation when used as a route
      navigate(`/call/${config.meetingId}`);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Navigate back when used as a route
      navigate('/');
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="text-green-400" size={16} />;
      case 'good':
        return <Wifi className="text-yellow-400" size={16} />;
      case 'poor':
        return <WifiOff className="text-red-400" size={16} />;
    }
  };

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Loader className="animate-spin text-blue-400" size={16} />;
      case 'valid':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'invalid':
        return <AlertCircle className="text-red-400" size={16} />;
      default:
        return null;
    }
  };

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
          <h1 className="text-4xl font-bold text-gradient mb-2">Join Meeting</h1>
          <p className="text-white/70 text-lg">Enter meeting details and configure your preferences</p>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-xl flex items-center gap-2">
                  <Camera className="text-purple-400" size={20} />
                  Preview
                </h3>
                
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  connectionQuality === 'excellent'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : connectionQuality === 'good'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {getConnectionIcon()}
                  Connection: {connectionQuality}
                </div>
              </div>
              
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
                {config.isVideoEnabled ? (
                  <>
                    <video
                      ref={previewRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Name overlay */}
                    {config.displayName && (
                      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                        <span className="text-white text-sm font-medium">{config.displayName}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        {config.displayName ? (
                          <span className="text-white text-2xl font-bold">
                            {config.displayName.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <VideoOff size={28} className="text-white" />
                        )}
                      </div>
                      <p className="text-white font-medium">
                        {config.displayName || 'Your Name'}
                      </p>
                      <p className="text-white/70 text-sm mt-1">Camera is turned off</p>
                    </div>
                  </div>
                )}
                
                {/* Preview Controls */}
                <div className="absolute bottom-4 right-4 flex gap-3">
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

          {/* Join Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Meeting Details */}
            <div className="glass-card p-6 border border-white/20 card-3d">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Globe className="text-cyan-400" size={20} />
                Meeting Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Meeting ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.meetingId}
                      onChange={(e) => setConfig(prev => ({ ...prev, meetingId: e.target.value.replace(/\\s/g, '') }))}
                      className="input-modern w-full pr-10"
                      placeholder="123-456-789"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getValidationIcon()}
                    </div>
                  </div>
                  
                  {validationStatus === 'invalid' && (
                    <p className="text-red-400 text-sm mt-1">Invalid meeting ID format</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={config.displayName}
                    onChange={(e) => setConfig(prev => ({ ...prev, displayName: e.target.value }))}
                    className="input-modern w-full"
                    placeholder="Enter your name"
                  />
                </div>
                
                <AnimatePresence>
                  {showPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                        <Lock size={14} className="text-red-400" />
                        Meeting Password
                      </label>
                      <input
                        type="password"
                        value={config.password || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                        className="input-modern w-full"
                        placeholder="Enter meeting password"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Meeting Info */}
            <AnimatePresence>
              {meetingInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6 border border-white/20 card-3d border-green-500/30 bg-green-500/5"
                >
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={20} />
                    Meeting Found
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Title:</span>
                      <span className="text-white font-medium">{meetingInfo.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Host:</span>
                      <span className="text-white font-medium">{meetingInfo.host}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Participants:</span>
                      <span className="text-white font-medium">{meetingInfo.participants} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Duration:</span>
                      <span className="text-white font-medium">{meetingInfo.duration}</span>
                    </div>
                    
                    {meetingInfo.isRecording && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 text-xs">This meeting is being recorded</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Device Settings */}
            <div className="glass-card p-6 border border-white/20 card-3d">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Settings className="text-purple-400" size={20} />
                Device Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video size={16} className="text-blue-400" />
                    <span className="text-white">Join with Video</span>
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
                    <span className="text-white">Join with Audio</span>
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: validationStatus === 'valid' && config.displayName.trim() ? 1.02 : 1, y: validationStatus === 'valid' && config.displayName.trim() ? -2 : 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={validationStatus !== 'valid' || !config.displayName.trim() || isJoining}
                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <>
                    <div className="loading-spinner" />
                    Joining Meeting...
                  </>
                ) : (
                  <>
                    Join Meeting
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
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

export default JoinMeeting;