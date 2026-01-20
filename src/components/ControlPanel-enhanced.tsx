import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Settings,
  Users,
  MessageSquare,
  MoreVertical,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
  Maximize,
  Minimize,
  Hand,
  Filter,
  Sparkles,
  Zap,
  Heart
} from 'lucide-react';

interface ControlPanelProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  participantCount: number;
  onVideoToggle: () => void;
  onAudioToggle: () => void;
  onScreenShareToggle: () => void;
  onChatToggle: () => void;
  onEndCall: () => void;
  onSettingsOpen: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isChatOpen,
  participantCount,
  onVideoToggle,
  onAudioToggle,
  onScreenShareToggle,
  onChatToggle,
  onEndCall,
  onSettingsOpen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasRaiseHand, setHasRaiseHand] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [volume, setVolume] = useState(80);
  const [videoFilter, setVideoFilter] = useState('none');

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleRaiseHand = useCallback(() => {
    setHasRaiseHand(!hasRaiseHand);
    // Show temporary feedback
    setTimeout(() => {
      if (hasRaiseHand) setHasRaiseHand(false);
    }, 5000);
  }, [hasRaiseHand]);

  const reactions = ['', '', '', '', '', ''];

  const handleReaction = (reaction: string) => {
    // Handle reaction logic here
    console.log('Reaction sent:', reaction);
    setShowReactions(false);
  };

  const primaryControls = [
    {
      id: 'audio',
      icon: isAudioEnabled ? Mic : MicOff,
      isActive: isAudioEnabled,
      onClick: onAudioToggle,
      label: isAudioEnabled ? 'Mute' : 'Unmute',
      gradient: isAudioEnabled ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500',
      glowColor: isAudioEnabled ? 'shadow-glow-green' : 'shadow-glow-pink',
    },
    {
      id: 'video',
      icon: isVideoEnabled ? Video : VideoOff,
      isActive: isVideoEnabled,
      onClick: onVideoToggle,
      label: isVideoEnabled ? 'Turn off video' : 'Turn on video',
      gradient: isVideoEnabled ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600',
      glowColor: isVideoEnabled ? 'shadow-glow-cyan' : 'shadow-glow-gray',
    },
    {
      id: 'screen',
      icon: isScreenSharing ? ScreenShareOff : ScreenShare,
      isActive: isScreenSharing,
      onClick: onScreenShareToggle,
      label: isScreenSharing ? 'Stop sharing' : 'Share screen',
      gradient: isScreenSharing ? 'from-orange-500 to-amber-500' : 'from-gray-500 to-gray-600',
      glowColor: isScreenSharing ? 'shadow-glow-orange' : 'shadow-glow-gray',
    },
    {
      id: 'end',
      icon: PhoneOff,
      isActive: false,
      onClick: onEndCall,
      label: 'End call',
      gradient: 'from-red-600 to-red-700',
      glowColor: 'shadow-glow-red',
      special: true,
    },
  ];

  const secondaryControls = [
    {
      id: 'chat',
      icon: MessageSquare,
      isActive: isChatOpen,
      onClick: onChatToggle,
      label: 'Chat',
      count: isChatOpen ? undefined : 3,
    },
    {
      id: 'participants',
      icon: Users,
      isActive: false,
      onClick: () => {},
      label: 'Participants',
      count: participantCount,
    },
    {
      id: 'hand',
      icon: Hand,
      isActive: hasRaiseHand,
      onClick: handleRaiseHand,
      label: hasRaiseHand ? 'Lower hand' : 'Raise hand',
    },
    {
      id: 'reactions',
      icon: Heart,
      isActive: showReactions,
      onClick: () => setShowReactions(!showReactions),
      label: 'Reactions',
    },
    {
      id: 'fullscreen',
      icon: isFullscreen ? Minimize : Maximize,
      isActive: isFullscreen,
      onClick: handleFullscreenToggle,
      label: isFullscreen ? 'Exit fullscreen' : 'Fullscreen',
    },
    {
      id: 'settings',
      icon: Settings,
      isActive: false,
      onClick: onSettingsOpen,
      label: 'Settings',
    },
  ];

  return (
    <div className="relative">
      {/* Main Control Panel */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="glass-card rounded-2xl p-4 border border-white/20 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            {/* Primary Controls */}
            {primaryControls.map((control) => {
              const IconComponent = control.icon;
              return (
                <motion.button
                  key={control.id}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={control.onClick}
                  className={`
                    relative p-4 rounded-xl transition-all duration-300 group
                    ${
                      control.special
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-glow-pink'
                        : control.isActive && control.id !== 'end'
                        ? `bg-gradient-to-r ${control.gradient} text-white ${control.glowColor}`
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }
                  `}
                  title={control.label}
                >
                  <motion.div
                    animate={{
                      rotate: control.special ? [0, 10, -10, 0] : 0,
                      scale: control.isActive && control.id !== 'end' ? 1.1 : 1,
                    }}
                    transition={{
                      rotate: { duration: 0.5, repeat: control.special ? Infinity : 0, repeatDelay: 2 },
                      scale: { duration: 0.2 },
                    }}
                  >
                    <IconComponent size={20} className="icon-interactive" />
                  </motion.div>

                  {/* Active indicator */}
                  {control.isActive && control.id !== 'end' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    />
                  )}
                </motion.button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-8 bg-white/20 mx-2" />

            {/* Secondary Controls Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="control-button p-3"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <MoreVertical size={16} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Expanded Secondary Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="glass-card rounded-2xl p-4 border border-white/20">
              <div className="grid grid-cols-6 gap-2">
                {secondaryControls.map((control, index) => {
                  const IconComponent = control.icon;
                  return (
                    <motion.button
                      key={control.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={control.onClick}
                      className={`
                        relative p-3 rounded-xl transition-all duration-300 group min-w-[3rem] min-h-[3rem] flex items-center justify-center
                        ${
                          control.isActive
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-purple'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }
                      `}
                      title={control.label}
                    >
                      <IconComponent size={16} className="icon-interactive" />
                      
                      {/* Count badge */}
                      {control.count && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                        >
                          {control.count}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactions Popup */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-52 left-1/2 transform -translate-x-1/2 z-60"
          >
            <div className="glass-card rounded-2xl p-4 border border-white/20">
              <div className="flex gap-2">
                {reactions.map((reaction, index) => (
                  <motion.button
                    key={reaction}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.2, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(reaction)}
                    className="text-2xl p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    {reaction}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volume Control (when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <div className="glass-card rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <button className="control-button p-2">
                  {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none slider"
                />
                <span className="text-xs text-white/80 w-8">{volume}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Filters (when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className="glass-card rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-white" />
                <select
                  value={videoFilter}
                  onChange={(e) => setVideoFilter(e.target.value)}
                  className="bg-white/10 text-white text-sm rounded-lg border border-white/20 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">No Filter</option>
                  <option value="blur">Blur Background</option>
                  <option value="vintage">Vintage</option>
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raised Hand Indicator */}
      <AnimatePresence>
        {hasRaiseHand && (
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            className="fixed top-32 right-6 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-glow-orange">
              <Hand size={16} className="animate-bounce" />
              <span className="text-sm font-medium">Hand Raised</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ControlPanel;