import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Download,
  Share,
  Trash2,
  Edit3,
  Eye,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Video,
  FileVideo,
  Grid,
  List,
  MoreVertical,
  Star,
  StarOff,
  Copy,
  Link,
  Mail,
  Folder,
  Tag,
  SortAsc,
  SortDesc,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  duration: number;
  size: string;
  date: Date;
  participants: number;
  thumbnail: string;
  isStarred: boolean;
  tags: string[];
  quality: '720p' | '1080p' | '4K';
  format: 'mp4' | 'webm';
  meetingId: string;
  description?: string;
  downloadUrl: string;
  streamUrl: string;
}

interface ViewRecordingsProps {
  onBack: () => void;
}

const ViewRecordings: React.FC<ViewRecordingsProps> = ({ onBack }) => {
  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: '1',
      title: 'Team Standup - Weekly Review',
      duration: 3600, // 1 hour in seconds
      size: '2.4 GB',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      participants: 8,
      thumbnail: '/api/placeholder/320/180',
      isStarred: true,
      tags: ['standup', 'weekly', 'team'],
      quality: '1080p',
      format: 'mp4',
      meetingId: 'abc-123-def',
      description: 'Weekly team standup discussing project progress and blockers',
      downloadUrl: '#',
      streamUrl: '#'
    },
    {
      id: '2',
      title: 'Product Planning Session',
      duration: 5400, // 1.5 hours
      size: '3.8 GB',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      participants: 12,
      thumbnail: '/api/placeholder/320/180',
      isStarred: false,
      tags: ['planning', 'product', 'strategy'],
      quality: '1080p',
      format: 'mp4',
      meetingId: 'xyz-456-ghi',
      description: 'Q1 product roadmap planning and feature prioritization',
      downloadUrl: '#',
      streamUrl: '#'
    },
    {
      id: '3',
      title: 'Client Presentation - Walkthrough',
      duration: 2700, // 45 minutes
      size: '1.9 GB',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      participants: 5,
      thumbnail: '/api/placeholder/320/180',
      isStarred: true,
      tags: ['client', 'walkthrough', 'presentation'],
      quality: '720p',
      format: 'mp4',
      meetingId: 'jkl-789-mno',
      description: 'Product walkthrough for client showcasing new features',
      downloadUrl: '#',
      streamUrl: '#'
    },
    {
      id: '4',
      title: 'Training Session - New Features',
      duration: 4200, // 70 minutes
      size: '2.8 GB',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      participants: 15,
      thumbnail: '/api/placeholder/320/180',
      isStarred: false,
      tags: ['training', 'features', 'education'],
      quality: '1080p',
      format: 'webm',
      meetingId: 'pqr-012-stu',
      description: 'Training session covering the latest platform updates',
      downloadUrl: '#',
      streamUrl: '#'
    }
  ]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);

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
          // Simple size comparison (assuming GB format)
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

  const toggleStar = (recordingId: string) => {
    setRecordings(prev => prev.map(r => 
      r.id === recordingId ? { ...r, isStarred: !r.isStarred } : r
    ));
  };

  const handleDownload = (recording: Recording) => {
    // Simulate download
    console.log('Downloading:', recording.title);
  };

  const handleShare = (recording: Recording) => {
    navigator.clipboard.writeText(recording.streamUrl);
    // Show success message
  };

  const handleDelete = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
  };

  const handleBulkAction = (action: 'download' | 'delete' | 'share') => {
    console.log(`Bulk ${action}:`, selectedRecordings);
    if (action === 'delete') {
      setRecordings(prev => prev.filter(r => !selectedRecordings.includes(r.id)));
      setSelectedRecordings([]);
    }
  };

  const RecordingCard: React.FC<{ recording: Recording; index: number }> = ({ recording, index }) => {
    const isPlaying = playingRecording === recording.id;
    const isSelected = selectedRecordings.includes(recording.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className={`glass-card p-4 border card-3d cursor-pointer transition-all duration-300 ${
          isSelected ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/20'
        }`}
        onClick={() => setSelectedRecording(recording)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4 group">
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
              }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/30"
            >
              {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
            </motion.button>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium">
            {formatDuration(recording.duration)}
          </div>
          
          {/* Quality Badge */}
          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded text-white text-xs font-bold">
            {recording.quality}
          </div>
          
          {/* Selection Checkbox */}
          <div className="absolute top-2 right-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecordings(prev => 
                  isSelected 
                    ? prev.filter(id => id !== recording.id)
                    : [...prev, recording.id]
                );
              }}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'bg-purple-500 border-purple-500' 
                  : 'bg-white/20 border-white/40 hover:border-white/60'
              }`}
            >
              {isSelected && <CheckCircle size={14} className="text-white" />}
            </motion.button>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-white font-semibold text-lg line-clamp-2">
              {recording.title}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(recording.id);
              }}
              className="text-yellow-400 hover:text-yellow-300 ml-2"
            >
              {recording.isStarred ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
            </motion.button>
          </div>
          
          {recording.description && (
            <p className="text-white/70 text-sm line-clamp-2">
              {recording.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(recording.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{recording.participants}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileVideo size={12} />
              <span>{recording.size}</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {recording.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full border border-white/20"
              >
                {tag}
              </span>
            ))}
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
              className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Download
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShare(recording);
              }}
              className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-2"
            >
              <Share size={14} />
              Share
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  const RecordingRow: React.FC<{ recording: Recording; index: number }> = ({ recording, index }) => {
    const isSelected = selectedRecordings.includes(recording.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`glass p-4 border rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/5 ${
          isSelected ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'
        }`}
        onClick={() => setSelectedRecording(recording)}
      >
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRecordings(prev => 
                isSelected 
                  ? prev.filter(id => id !== recording.id)
                  : [...prev, recording.id]
              );
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-purple-500 border-purple-500' 
                : 'border-white/40 hover:border-white/60'
            }`}
          >
            {isSelected && <CheckCircle size={12} className="text-white" />}
          </motion.button>
          
          {/* Thumbnail */}
          <div className="relative w-20 h-12 bg-gray-900 rounded overflow-hidden flex-shrink-0">
            <img
              src={recording.thumbnail}
              alt={recording.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-white text-xs">
              {formatDuration(recording.duration)}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-medium truncate">{recording.title}</h3>
                <p className="text-white/60 text-sm truncate mt-1">
                  {recording.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(recording.id);
                  }}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  {recording.isStarred ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                </motion.button>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-2 text-sm text-white/60">
              <span>{formatDate(recording.date)}</span>
              <span>{recording.participants} participants</span>
              <span>{recording.size}</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                {recording.quality}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(recording);
              }}
              className="control-button p-2"
            >
              <Download size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShare(recording);
              }}
              className="control-button p-2"
            >
              <Share size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-20 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Recordings</h1>
            <p className="text-white/70 text-lg">
              {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''} available
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="btn-secondary px-6 py-3"
          >
            Back to Home
          </motion.button>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 border border-white/20 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern pl-10 w-full"
                placeholder="Search recordings..."
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-200 ${
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
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-purple' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <List size={16} />
                </motion.button>
              </div>
              
              {/* Sort */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="input-modern pr-8 appearance-none"
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
                className={`control-button p-3 ${
                  selectedTags.length > 0 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-glow-cyan' 
                    : ''
                }`}
              >
                <Filter size={16} />
                {selectedTags.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {selectedTags.length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
          
          {/* Tag Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="text-white/60" size={16} />
                  <span className="text-white/80 font-medium">Filter by tags:</span>
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
                        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
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
                      className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    >
                      Clear All
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Bulk Actions */}
          {selectedRecordings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
            >
              <span className="text-white font-medium">
                {selectedRecordings.length} recording{selectedRecordings.length !== 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('download')}
                  className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                >
                  <Download size={14} />
                  Download All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('share')}
                  className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                >
                  <Share size={14} />
                  Share All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRecordings([])}
                  className="control-button p-2"
                >
                  <X size={14} />
                </motion.button>
              </div>
            </motion.div>
          )}
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
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }
            >
              {filteredRecordings.map((recording, index) => 
                viewMode === 'grid' ? (
                  <RecordingCard key={recording.id} recording={recording} index={index} />
                ) : (
                  <RecordingRow key={recording.id} recording={recording} index={index} />
                )
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileVideo size={32} className="text-white/50" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No recordings found</h3>
              <p className="text-white/60 mb-6">
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
                  className="btn-secondary px-6 py-3"
                >
                  Clear Filters
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recording Detail Modal */}
      <AnimatePresence>
        {selectedRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedRecording(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedRecording.title}</h2>
                    <p className="text-white/70">{selectedRecording.description}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedRecording(null)}
                    className="control-button p-2 ml-4"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
                
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedRecording.thumbnail}
                    alt={selectedRecording.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/30"
                    >
                      <Play size={32} className="text-white ml-1" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="space-y-3">
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
                  <div className="space-y-3">
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
                      <Link className="text-yellow-400" size={16} />
                      <span className="text-white/70">Meeting ID:</span>
                      <span className="text-white font-medium font-mono">{selectedRecording.meetingId}</span>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecording.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/10 text-white/70 text-sm rounded-full border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(selectedRecording)}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleShare(selectedRecording)}
                    className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
                  >
                    <Share size={16} />
                    Share Link
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleStar(selectedRecording.id)}
                    className="control-button p-3"
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
    </div>
  );
};

export default ViewRecordings;
