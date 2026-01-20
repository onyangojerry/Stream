import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Grid,
  List,
  Download,
  Share,
  Star,
  StarOff,
  Play,
  Pause,
  Calendar,
  Users,
  FileVideo,
  Video,
  Clock,
  Tag,
  ChevronDown,
  X,
  Copy,
  Eye,
} from 'lucide-react';
import ResponsivePageLayout from '../components/ResponsivePageLayout';
import { useRecordingStore } from '../store/useRecordingStore';

interface ViewRecordingsProps {
  onBack: () => void;
}

const ViewRecordings: React.FC<ViewRecordingsProps> = ({ onBack }) => {
  const { 
    recordings, 
    toggleStarRecording, 
    downloadRecording, 
    deleteRecording 
  } = useRecordingStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);

  // Get all unique tags
  const allTags = [...new Set(recordings.flatMap(r => r.tags))];

  // Filter and sort recordings
  const filteredRecordings = recordings
    .filter(recording => {
      const matchesSearch = recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recording.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recording.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => recording.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'size':
          comparison = parseFloat(a.size) - parseFloat(b.size);
          break;
        case 'date':
        default:
          comparison = a.date.getTime() - b.date.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const handleDownload = (recording: any) => {
    downloadRecording(recording.id);
  };

  const handleDelete = (recordingId: string) => {
    deleteRecording(recordingId);
  };

  const RecordingCard: React.FC<{ recording: any; index: number }> = ({ recording, index }) => {
    const isPlaying = playingRecording === recording.id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass-card p-3 sm:p-4 border border-white/20 card-3d cursor-pointer transition-all duration-300"
        onClick={() => setSelectedRecording(recording)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 sm:mb-4 group">
          <img
            src={recording.thumbnail}
            alt={recording.title}
            className="w-full h-full object-cover"
          />
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setPlayingRecording(isPlaying ? null : recording.id);
                if (recording.downloadUrl.startsWith('blob:')) {
                  // For actual recorded videos, open in new tab or play inline
                  window.open(recording.downloadUrl, '_blank');
                }
              }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/30"
            >
              {isPlaying ? <Pause size={20} className="text-white sm:w-6 sm:h-6" /> : <Play size={20} className="text-white sm:w-6 sm:h-6 ml-1" />}
            </motion.button>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black/70 backdrop-blur-sm px-1 sm:px-2 py-0.5 sm:py-1 rounded text-white text-xs font-medium">
            {formatDuration(recording.duration)}
          </div>
          
          {/* Quality Badge */}
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-gradient-to-r from-purple-500 to-pink-500 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-white text-xs font-bold">
            {recording.quality}
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-white font-semibold text-sm sm:text-lg line-clamp-2 flex-1">
              {recording.title}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleStarRecording(recording.id);
              }}
              className="text-yellow-400 hover:text-yellow-300 ml-2 flex-shrink-0"
            >
              {recording.isStarred ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
            </motion.button>
          </div>
          
          {recording.description && (
            <p className="text-white/70 text-xs sm:text-sm line-clamp-2">
              {recording.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/60">
            <div className="flex items-center gap-1">
              <Calendar size={10} className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{formatDate(recording.date)}</span>
              <span className="sm:hidden">{formatDate(recording.date).split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={10} className="sm:w-3 sm:h-3" />
              <span>{recording.participants}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileVideo size={10} className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{recording.size}</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {recording.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-1 sm:px-2 py-0.5 sm:py-1 bg-white/10 text-white/70 text-xs rounded-full border border-white/20"
              >
                {tag}
              </span>
            ))}
            {recording.tags.length > 3 && (
              <span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-white/10 text-white/70 text-xs rounded-full border border-white/20">
                +{recording.tags.length - 3}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(recording);
              }}
              className="flex-1 btn-secondary py-1 sm:py-2 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Download size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Download</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                // Copy share link to clipboard
                navigator.clipboard.writeText(recording.streamUrl || recording.downloadUrl);
              }}
              className="flex-1 btn-secondary py-1 sm:py-2 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Share size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Share</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <ResponsivePageLayout
      title="Recordings"
      subtitle={`${filteredRecordings.length} recording${filteredRecordings.length !== 1 ? 's' : ''} available`}
      onBack={onBack}
      backLabel="Back to Home"
    >
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-3 sm:p-4 lg:p-6 border border-white/20"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-10 w-full text-sm sm:text-base"
              placeholder="Search recordings..."
            />
          </div>
          
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`flex-1 sm:flex-none p-2 rounded transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-purple' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Grid size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-none p-2 rounded transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-purple' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <List size={16} />
              </motion.button>
            </div>
            
            {/* Sort */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="input-modern pr-8 appearance-none w-full text-sm sm:text-base"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="duration-desc">Longest First</option>
                <option value="duration-asc">Shortest First</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
            </div>
            
            {/* Filters */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`control-button p-3 relative ${
                selectedTags.length > 0 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-glow-cyan' 
                  : ''
              }`}
            >
              <Filter size={16} />
              {selectedTags.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {selectedTags.length}
                </span>
              )}
            </motion.button>
          </div>
          
          {/* Tag Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="text-white/60" size={16} />
                  <span className="text-white/80 font-medium text-sm sm:text-base">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <motion.button
                        key={tag}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedTags(prev => 
                            isSelected 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-glow-cyan'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                        }`}
                      >
                        {tag}
                      </motion.button>
                    );
                  })}
                  {selectedTags.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTags([])}
                      className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    >
                      Clear All
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recordings Grid/List */}
      <AnimatePresence mode="wait">
        {filteredRecordings.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
              : 'space-y-3 sm:space-y-4'
            }
          >
            {filteredRecordings.map((recording, index) => (
              <RecordingCard key={recording.id} recording={recording} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileVideo size={24} className="text-white/50 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No recordings found</h3>
            <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">
              {searchQuery || selectedTags.length > 0
                ? 'Try adjusting your search or filter criteria'
                : 'Start recording meetings to see them here'
              }
            </p>
            {(searchQuery || selectedTags.length > 0) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags([]);
                }}
                className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
              >
                Clear Filters
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Detail Modal */}
      <AnimatePresence>
        {selectedRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
            onClick={() => setSelectedRecording(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card border border-white/20 rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex-1 pr-4">
                    <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">{selectedRecording.title}</h2>
                    <p className="text-white/70 text-sm sm:text-base">{selectedRecording.description}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedRecording(null)}
                    className="control-button p-2 flex-shrink-0"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
                
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6">
                  {selectedRecording.downloadUrl.startsWith('blob:') ? (
                    <video 
                      controls 
                      className="w-full h-full object-cover" 
                      poster={selectedRecording.thumbnail}
                    >
                      <source src={selectedRecording.downloadUrl} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <>
                      <img
                        src={selectedRecording.thumbnail}
                        alt={selectedRecording.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/30"
                        >
                          <Play size={24} className="text-white sm:w-8 sm:h-8 ml-1" />
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6 text-sm">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-cyan-400" size={16} />
                      <span className="text-white/70">Date:</span>
                      <span className="text-white font-medium">{formatDate(selectedRecording.date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="text-green-400" size={16} />
                      <span className="text-white/70">Duration:</span>
                      <span className="text-white font-medium">{formatDuration(selectedRecording.duration)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="text-purple-400" size={16} />
                      <span className="text-white/70">Participants:</span>
                      <span className="text-white font-medium">{selectedRecording.participants}</span>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-3">
                      <FileVideo className="text-orange-400" size={16} />
                      <span className="text-white/70">Size:</span>
                      <span className="text-white font-medium">{selectedRecording.size}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Video className="text-pink-400" size={16} />
                      <span className="text-white/70">Quality:</span>
                      <span className="text-white font-medium">{selectedRecording.quality}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Copy className="text-yellow-400" size={16} />
                      <span className="text-white/70">Meeting ID:</span>
                      <span className="text-white font-medium font-mono text-xs sm:text-sm">{selectedRecording.meetingId}</span>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecording.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 sm:px-3 py-1 bg-white/10 text-white/70 text-xs sm:text-sm rounded-full border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(selectedRecording)}
                    className="flex-1 btn-primary py-2 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Download size={16} />
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedRecording.streamUrl || selectedRecording.downloadUrl);
                    }}
                    className="flex-1 btn-secondary py-2 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Share size={16} />
                    Share Link
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      toggleStarRecording(selectedRecording.id);
                      setSelectedRecording({...selectedRecording, isStarred: !selectedRecording.isStarred});
                    }}
                    className="control-button p-2 sm:p-3"
                  >
                    {selectedRecording.isStarred ? 
                      <Star size={16} className="text-yellow-400" fill="currentColor" /> : 
                      <StarOff size={16} className="text-yellow-400" />
                    }
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ResponsivePageLayout>
  );
};

export default ViewRecordings;