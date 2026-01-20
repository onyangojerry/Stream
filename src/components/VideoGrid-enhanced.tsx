import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Pin,
  PinOff,
  MoreVertical,
  User,
  VolumeX,
  Volume2,
  Maximize,
  Share,
  UserPlus,
  Wifi,
  WifiOff,
  Signal,
  Crown,
  Hand,
  MessageCircle
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isPinned: boolean;
  isHost: boolean;
  isLocalUser: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  hasRaisedHand: boolean;
  isSpeaking: boolean;
  videoStream?: MediaStream;
}

interface VideoGridProps {
  participants: Participant[];
  onPinParticipant: (participantId: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onVolumeChange?: (participantId: string, volume: number) => void;
  layout: 'grid' | 'speaker' | 'gallery' | 'sidebar';
  maxParticipantsVisible: number;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  onPinParticipant,
  onRemoveParticipant,
  onVolumeChange,
  layout = 'grid',
  maxParticipantsVisible = 9,
}) => {
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [showParticipantMenu, setShowParticipantMenu] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Auto-assign video streams to video elements
  useEffect(() => {
    participants.forEach((participant) => {
      const videoElement = videoRefs.current[participant.id];
      if (videoElement && participant.videoStream) {
        videoElement.srcObject = participant.videoStream;
      }
    });
  }, [participants]);

  const getGridLayout = () => {
    const count = Math.min(participants.length, maxParticipantsVisible);
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const getConnectionIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return <Wifi className="text-green-400" size={12} />;
      case 'good':
        return <Signal className="text-yellow-400" size={12} />;
      case 'poor':
        return <WifiOff className="text-red-400" size={12} />;
      case 'disconnected':
        return <WifiOff className="text-gray-400" size={12} />;
      default:
        return <Wifi className="text-green-400" size={12} />;
    }
  };

  const getConnectionColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'border-green-500/50 shadow-glow-green';
      case 'good':
        return 'border-yellow-500/50 shadow-glow-yellow';
      case 'poor':
        return 'border-red-500/50 shadow-glow-red';
      case 'disconnected':
        return 'border-gray-500/50';
      default:
        return 'border-green-500/50 shadow-glow-green';
    }
  };

  const handleParticipantClick = (participantId: string) => {
    if (selectedParticipant === participantId) {
      setSelectedParticipant(null);
    } else {
      setSelectedParticipant(participantId);
    }
  };

  const ParticipantCard: React.FC<{ participant: Participant; index: number }> = ({ participant, index }) => {
    const isHovered = hoveredParticipant === participant.id;
    const isSelected = selectedParticipant === participant.id;
    const isPinned = participant.isPinned;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          zIndex: isSelected ? 10 : isPinned ? 5 : 1
        }}
        exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.1,
          type: 'spring',
          stiffness: 300
        }}
        whileHover={{ 
          scale: 1.02, 
          y: -4,
          rotateX: 2,
          transition: { duration: 0.2 }
        }}
        className={`
          relative group cursor-pointer card-3d
          ${
            isPinned
              ? 'col-span-2 row-span-2'
              : isSelected
              ? 'col-span-2'
              : ''
          }
        `}
        onMouseEnter={() => setHoveredParticipant(participant.id)}
        onMouseLeave={() => setHoveredParticipant(null)}
        onClick={() => handleParticipantClick(participant.id)}
      >
        {/* Video Container */}
        <div className={`
          video-container aspect-video relative overflow-hidden border-2 transition-all duration-300
          ${
            participant.isSpeaking
              ? 'border-purple-500/70 shadow-glow-purple'
              : getConnectionColor(participant.connectionQuality)
          }
        `}>
          {/* Video Element */}
          {participant.isVideoEnabled ? (
            <video
              ref={(el) => (videoRefs.current[participant.id] = el)}
              autoPlay
              playsInline
              muted={participant.isLocalUser}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className={`
                w-16 h-16 rounded-full bg-gradient-to-r flex items-center justify-center text-white text-xl font-bold shadow-2xl
                ${
                  participant.isHost
                    ? 'from-yellow-500 to-orange-500'
                    : 'from-purple-500 to-pink-500'
                }
              `}>
                {participant.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Overlay Controls */}
          <AnimatePresence>
            {(isHovered || isSelected) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
              >
                {/* Top Controls */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Host Badge */}
                    {participant.isHost && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                      >
                        <Crown size={10} />
                        Host
                      </motion.div>
                    )}
                    
                    {/* Pin Badge */}
                    {isPinned && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-purple-500/80 text-white p-1 rounded-full"
                      >
                        <Pin size={10} />
                      </motion.div>
                    )}

                    {/* Raised Hand */}
                    {participant.hasRaisedHand && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className="bg-yellow-500/80 text-white p-1 rounded-full"
                      >
                        <Hand size={10} />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Connection Quality */}
                    <div className="bg-black/50 p-1 rounded-full">
                      {getConnectionIcon(participant.connectionQuality)}
                    </div>

                    {/* More Options */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowParticipantMenu(
                          showParticipantMenu === participant.id ? null : participant.id
                        );
                      }}
                      className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <MoreVertical size={12} />
                    </motion.button>
                  </div>
                </div>

                {/* Center Controls */}
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinParticipant(participant.id);
                    }}
                    className="control-button p-3"
                  >
                    {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </motion.button>

                  {!participant.isLocalUser && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="control-button p-3"
                    >
                      <MessageCircle size={16} />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="control-button p-3"
                  >
                    <Maximize size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Participant Menu */}
          <AnimatePresence>
            {showParticipantMenu === participant.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-12 right-3 glass-card p-2 min-w-[150px] z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">
                    View Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">
                    Send Message
                  </button>
                  {!participant.isLocalUser && (
                    <>
                      <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">
                        Mute Audio
                      </button>
                      {participant.isHost && (
                        <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          Remove Participant
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm truncate max-w-[120px]">
                  {participant.name}
                </span>
                {participant.isLocalUser && (
                  <span className="text-xs text-green-400 font-medium">(You)</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Audio Indicator */}
                <div className={`
                  p-1 rounded-full transition-all duration-200
                  ${
                    participant.isAudioEnabled
                      ? participant.isSpeaking
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-green-500/50'
                      : 'bg-red-500/50'
                  }
                `}>
                  {participant.isAudioEnabled ? (
                    <Mic size={10} className="text-white" />
                  ) : (
                    <MicOff size={10} className="text-white" />
                  )}
                </div>

                {/* Video Indicator */}
                <div className={`
                  p-1 rounded-full transition-all duration-200
                  ${
                    participant.isVideoEnabled
                      ? 'bg-blue-500/50'
                      : 'bg-red-500/50'
                  }
                `}>
                  {participant.isVideoEnabled ? (
                    <Video size={10} className="text-white" />
                  ) : (
                    <VideoOff size={10} className="text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Speaking Indicator */}
          {participant.isSpeaking && (
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 border-4 border-purple-500 rounded-2xl pointer-events-none"
            />
          )}
        </div>
      </motion.div>
    );
  };

  const visibleParticipants = participants.slice(0, maxParticipantsVisible);
  const hiddenParticipants = participants.slice(maxParticipantsVisible);

  return (
    <div className="w-full h-full p-4">
      {/* Main Grid */}
      <motion.div
        layout
        className={`
          grid gap-4 h-full
          ${
            layout === 'grid'
              ? `${getGridLayout()} auto-rows-fr`
              : layout === 'speaker'
              ? 'grid-cols-4 grid-rows-3'
              : layout === 'gallery'
              ? 'grid-cols-6 grid-rows-4'
              : 'grid-cols-3 grid-rows-3'
          }
        `}
      >
        <AnimatePresence mode="popLayout">
          {visibleParticipants.map((participant, index) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Hidden Participants Indicator */}
      {hiddenParticipants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-32 left-6 glass-card rounded-xl p-3 border border-white/20"
        >
          <div className="flex items-center gap-2 text-white text-sm">
            <UserPlus size={16} />
            <span>+{hiddenParticipants.length} more participants</span>
          </div>
        </motion.div>
      )}

      {/* Click outside to close menus */}
      {showParticipantMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowParticipantMenu(null)}
        />
      )}
    </div>
  );
};

export default VideoGrid;