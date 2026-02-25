import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLegacyVideoStore as useVideoStore } from '../store/videoStore';
import VideoGrid from '../components/VideoGrid-enhanced';
import ControlPanel from '../components/ControlPanel-enhanced';
import Layout from '../components/Layout-enhanced';
import {
  MessageSquare,
  X,
  Send,
  Smile,
  Paperclip,
  Users,
  Settings,
  Monitor,
  Mic,
  Video,
  Phone,
  Copy,
  Share,
  Calendar,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'reaction';
}

const VideoCall: React.FC = () => {
  const {
    participants,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    addParticipant,
    removeParticipant,
    pinParticipant,
  } = useVideoStore();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'System',
      message: 'Welcome to the video call! ',
      timestamp: new Date(),
      type: 'system',
    },
    {
      id: '2',
      sender: 'John Doe',
      message: 'Hello everyone! Great to see you all here.',
      timestamp: new Date(),
      type: 'message',
    },
    {
      id: '3',
      sender: 'Jane Smith',
      message: 'Thanks for organizing this meeting! ',
      timestamp: new Date(),
      type: 'message',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [recording, setRecording] = useState(false);
  const [meetingInfo] = useState({
    title: 'Team Standup Meeting',
    id: 'meet-abc-123-def',
    startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
    participants: participants.length,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Update call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date(),
      type: 'message',
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // Implement end call logic
    window.location.href = '/';
  };

  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(meetingInfo.id);
    // Show success notification
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Layout>
      <div className="relative h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 rounded-3xl overflow-hidden">
        {/* Meeting Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 z-30 glass border-b border-white/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <h1 className="text-lg font-semibold">{meetingInfo.title}</h1>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatTime(callDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{participants.length} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={14} />
                    <span>ID: {meetingInfo.id}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCopyMeetingId}
                      className="ml-1 p-1 hover:bg-white/10 rounded"
                    >
                      <Copy size={12} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {recording && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Recording
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowParticipants(!showParticipants)}
                className="control-button p-2"
              >
                <Users size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="control-button p-2"
              >
                <Settings size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="control-button p-2"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex h-full pt-20 pb-4">
          {/* Video Grid */}
          <div className={`flex-1 transition-all duration-300 ${
            isChatOpen || showParticipants ? 'mr-80' : ''
          }`}>
            <VideoGrid
              participants={participants}
              onPinParticipant={pinParticipant}
              onRemoveParticipant={removeParticipant}
              layout="grid"
              maxParticipantsVisible={9}
            />
          </div>

          {/* Chat Sidebar */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-20 right-0 bottom-4 w-80 glass border-l border-white/10"
              >
                <div className="flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <MessageSquare size={16} />
                      Chat
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsChatOpen(false)}
                      className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                      {chatMessages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`
                            ${message.type === 'system'
                              ? 'text-center text-white/60 text-sm'
                              : message.sender === 'You'
                              ? 'flex justify-end'
                              : 'flex justify-start'
                            }
                          `}
                        >
                          {message.type !== 'system' && (
                            <div className={`
                              chat-bubble max-w-[85%]
                              ${message.sender === 'You' ? 'sent' : 'received'}
                            `}>
                              {message.sender !== 'You' && (
                                <div className="text-xs text-white/60 mb-1 font-medium">
                                  {message.sender}
                                </div>
                              )}
                              <div className="text-sm">{message.message}</div>
                              <div className="text-xs text-white/40 mt-1">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          )}
                          {message.type === 'system' && (
                            <div>{message.message}</div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          rows={1}
                          className="input-modern resize-none min-h-[2.5rem] max-h-24"
                        />
                      </div>
                      <div className="flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="control-button p-2"
                        >
                          <Smile size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="control-button p-2"
                        >
                          <Paperclip size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="btn-primary p-2 disabled:opacity-50"
                        >
                          <Send size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Participants Sidebar */}
          <AnimatePresence>
            {showParticipants && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-20 right-0 bottom-4 w-80 glass border-l border-white/10"
              >
                <div className="flex flex-col h-full">
                  {/* Participants Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Users size={16} />
                      Participants ({participants.length})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowParticipants(false)}
                      className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>

                  {/* Participants List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {participants.map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-3 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center text-white text-sm font-bold
                            ${participant.isHost ? 'from-yellow-500 to-orange-500' : 'from-purple-500 to-pink-500'}
                          `}>
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm">
                                {participant.name}
                              </span>
                              {participant.isHost && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                  Host
                                </span>
                              )}
                              {participant.isLocalUser && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`
                                w-2 h-2 rounded-full
                                ${participant.isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}
                              `} />
                              <Mic size={10} className={participant.isAudioEnabled ? 'text-green-400' : 'text-red-400'} />
                              <Video size={10} className={participant.isVideoEnabled ? 'text-blue-400' : 'text-gray-400'} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Panel */}
        <ControlPanel
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isScreenSharing={isScreenSharing}
          isChatOpen={isChatOpen}
          participantCount={participants.length}
          onVideoToggle={toggleVideo}
          onAudioToggle={toggleAudio}
          onScreenShareToggle={toggleScreenShare}
          onChatToggle={() => setIsChatOpen(!isChatOpen)}
          onEndCall={handleEndCall}
          onSettingsOpen={() => setShowSettings(true)}
        />
      </div>
    </Layout>
  );
};

export default VideoCall;
