import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Mic,
  Shield,
  Globe,
  Copy,
  Share,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ArrowRight,
  Mail,
  Bell,
  Settings,
  Repeat,
  MapPin,
  Link,
  FileText,
  Sparkles,
  Zap
} from 'lucide-react';

interface ScheduledMeeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  timezone: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  participants: string[];
  requiresPassword: boolean;
  password?: string;
  allowRecording: boolean;
  enableWaitingRoom: boolean;
  meetingId: string;
}

interface ScheduleMeetingProps {
  onSchedule: (meeting: ScheduledMeeting) => void;
  onCancel: () => void;
}

const ScheduleMeeting: React.FC<ScheduleMeetingProps> = ({ onSchedule, onCancel }) => {
  const [meeting, setMeeting] = useState<Partial<ScheduledMeeting>>({
    title: '',
    description: '',
    date: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurring: 'none',
    participants: [],
    requiresPassword: false,
    allowRecording: true,
    enableWaitingRoom: true,
    meetingId: `${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 3)}`,
  });
  
  const [newParticipant, setNewParticipant] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const timezones = [
    'America/New_York',
    'America/Los_Angeles', 
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
  ];

  const addParticipant = () => {
    if (newParticipant && !meeting.participants?.includes(newParticipant)) {
      setMeeting(prev => ({
        ...prev,
        participants: [...(prev.participants || []), newParticipant]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (email: string) => {
    setMeeting(prev => ({
      ...prev,
      participants: prev.participants?.filter(p => p !== email) || []
    }));
  };

  const handleSchedule = async () => {
    if (!meeting.title || !meeting.date) return;
    
    setIsScheduling(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scheduledMeeting: ScheduledMeeting = {
      id: Math.random().toString(36).substr(2, 9),
      title: meeting.title!,
      description: meeting.description || '',
      date: meeting.date!,
      duration: meeting.duration || 60,
      timezone: meeting.timezone!,
      recurring: meeting.recurring!,
      participants: meeting.participants || [],
      requiresPassword: meeting.requiresPassword!,
      password: meeting.password,
      allowRecording: meeting.allowRecording!,
      enableWaitingRoom: meeting.enableWaitingRoom!,
      meetingId: meeting.meetingId!
    };
    
    onSchedule(scheduledMeeting);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const steps = [
    { id: 1, title: 'Basic Details', icon: FileText },
    { id: 2, title: 'Participants', icon: Users },
    { id: 3, title: 'Settings', icon: Settings },
    { id: 4, title: 'Review', icon: Sparkles }
  ];

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
          <h1 className="text-4xl font-bold text-gradient mb-2">Schedule Meeting</h1>
          <p className="text-white/70 text-lg">Plan and configure your upcoming meeting</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="glass rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-purple'
                          : isCompleted
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <IconComponent size={16} />
                      <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                    </motion.div>
                    
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-white/20" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-8 border border-white/20 card-3d"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <FileText className="text-purple-400" size={24} />
                    Meeting Details
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Meeting Title*</label>
                      <input
                        type="text"
                        value={meeting.title || ''}
                        onChange={(e) => setMeeting(prev => ({ ...prev, title: e.target.value }))}
                        className="input-modern w-full"
                        placeholder="Enter meeting title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={meeting.description || ''}
                        onChange={(e) => setMeeting(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="input-modern w-full resize-none"
                        placeholder="Add meeting description or agenda"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Date*</label>
                        <input
                          type="date"
                          value={meeting.date?.toISOString().split('T')[0] || ''}
                          onChange={(e) => {
                            const newDate = new Date(e.target.value + 'T' + (meeting.date?.toTimeString().split(' ')[0] || '12:00:00'));
                            setMeeting(prev => ({ ...prev, date: newDate }));
                          }}
                          className="input-modern w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Time*</label>
                        <input
                          type="time"
                          value={meeting.date?.toTimeString().split(' ')[0].substring(0, 5) || ''}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(meeting.date || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            setMeeting(prev => ({ ...prev, date: newDate }));
                          }}
                          className="input-modern w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Duration</label>
                        <select
                          value={meeting.duration || 60}
                          onChange={(e) => setMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          className="input-modern w-full"
                        >
                          {durations.map(duration => (
                            <option key={duration.value} value={duration.value}>
                              {duration.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Timezone</label>
                        <select
                          value={meeting.timezone || ''}
                          onChange={(e) => setMeeting(prev => ({ ...prev, timezone: e.target.value }))}
                          className="input-modern w-full"
                        >
                          {timezones.map(tz => (
                            <option key={tz} value={tz}>
                              {tz.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Recurring</label>
                      <div className="flex gap-2">
                        {(['none', 'daily', 'weekly', 'monthly'] as const).map(type => (
                          <motion.button
                            key={type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setMeeting(prev => ({ ...prev, recurring: type }))}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 capitalize ${
                              meeting.recurring === type
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-purple'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {type === 'none' ? 'No Repeat' : type}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Participants */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-8 border border-white/20 card-3d"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Users className="text-cyan-400" size={24} />
                    Participants
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Add Participants</label>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          value={newParticipant}
                          onChange={(e) => setNewParticipant(e.target.value)}
                          className="input-modern flex-1"
                          placeholder="Enter email address"
                          onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={addParticipant}
                          className="btn-secondary px-6"
                        >
                          <Plus size={16} />
                        </motion.button>
                      </div>
                    </div>
                    
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div>
                        <h3 className="text-white font-medium mb-3">Invited Participants ({meeting.participants.length})</h3>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {meeting.participants.map((email, index) => (
                              <motion.div
                                key={email}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 glass rounded-lg border border-white/10"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {email.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-white">{email}</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeParticipant(email)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <X size={14} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 glass rounded-xl border border-blue-500/30 bg-blue-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="text-blue-400" size={16} />
                        <span className="text-blue-400 font-medium">Invitation Settings</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        All participants will receive email invitations with meeting details and calendar events.
                        Reminders will be sent 24 hours and 1 hour before the meeting.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Settings */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-8 border border-white/20 card-3d"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Settings className="text-green-400" size={24} />
                    Meeting Settings
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        {
                          key: 'requiresPassword' as keyof typeof meeting,
                          icon: Shield,
                          label: 'Require Password',
                          description: 'Participants need a password to join',
                          color: 'text-red-400',
                          bgColor: 'bg-red-500'
                        },
                        {
                          key: 'enableWaitingRoom' as keyof typeof meeting,
                          icon: Users,
                          label: 'Enable Waiting Room',
                          description: 'Host must admit participants',
                          color: 'text-yellow-400',
                          bgColor: 'bg-yellow-500'
                        },
                        {
                          key: 'allowRecording' as keyof typeof meeting,
                          icon: Video,
                          label: 'Allow Recording',
                          description: 'Participants can record the meeting',
                          color: 'text-purple-400',
                          bgColor: 'bg-purple-500'
                        }
                      ].map(setting => {
                        const IconComponent = setting.icon;
                        const isEnabled = Boolean(meeting[setting.key]);
                        
                        return (
                          <div key={setting.key} className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg bg-gradient-to-r from-${setting.color.split('-')[1]}-500 to-${setting.color.split('-')[1]}-600`}>
                                <IconComponent size={20} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-white font-medium">{setting.label}</h3>
                                <p className="text-white/60 text-sm">{setting.description}</p>
                              </div>
                            </div>
                            
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setMeeting(prev => ({ ...prev, [setting.key]: !isEnabled }))}
                              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                                isEnabled ? setting.bgColor : 'bg-gray-600'
                              }`}
                            >
                              <motion.div
                                animate={{ x: isEnabled ? 24 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                              />
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>
                    
                    <AnimatePresence>
                      {meeting.requiresPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <label className="block text-white/80 text-sm font-medium">Meeting Password</label>
                          <input
                            type="text"
                            value={meeting.password || ''}
                            onChange={(e) => setMeeting(prev => ({ ...prev, password: e.target.value }))}
                            className="input-modern w-full"
                            placeholder="Enter meeting password"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-8 border border-white/20 card-3d"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Sparkles className="text-yellow-400" size={24} />
                    Review & Schedule
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="p-6 glass rounded-xl border border-green-500/30 bg-green-500/5">
                      <h3 className="text-xl font-bold text-white mb-4">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-white/80 mb-4">{meeting.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Calendar className="text-green-400" size={16} />
                          <span className="text-white">{formatDate(meeting.date!)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="text-blue-400" size={16} />
                          <span className="text-white">{formatTime(meeting.date!)} ({meeting.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="text-purple-400" size={16} />
                          <span className="text-white">{meeting.timezone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="text-cyan-400" size={16} />
                          <span className="text-white">{meeting.participants?.length || 0} participants</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <Link className="text-orange-400" size={16} />
                          <span className="text-white font-medium">Meeting ID: {meeting.meetingId}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigator.clipboard.writeText(meeting.meetingId!)}
                            className="text-white/60 hover:text-white"
                          >
                            <Copy size={14} />
                          </motion.button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {meeting.requiresPassword && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                              Password Protected
                            </span>
                          )}
                          {meeting.enableWaitingRoom && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                              Waiting Room
                            </span>
                          )}
                          {meeting.allowRecording && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                              Recording Enabled
                            </span>
                          )}
                          {meeting.recurring !== 'none' && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                              Recurring {meeting.recurring}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3">Participants will receive:</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                          <li> Calendar invitation with meeting details</li>
                          <li> Email reminder 24 hours before meeting</li>
                          <li> Email reminder 1 hour before meeting</li>
                          <li> Meeting link and access information</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onCancel()}
                className="btn-secondary px-6 py-3"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (currentStep < 4) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    handleSchedule();
                  }
                }}
                disabled={isScheduling || (currentStep === 1 && (!meeting.title || !meeting.date))}
                className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50"
              >
                {isScheduling ? (
                  <>
                    <div className="loading-spinner" />
                    Scheduling...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    Schedule Meeting
                    <Zap size={16} />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* Preview Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Preview */}
            <div className="glass-card p-6 border border-white/20 card-3d">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="text-purple-400" size={20} />
                Meeting Preview
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-white/60 text-sm">Title:</span>
                  <p className="text-white font-medium">
                    {meeting.title || 'Untitled Meeting'}
                  </p>
                </div>
                
                {meeting.date && (
                  <>
                    <div>
                      <span className="text-white/60 text-sm">Date:</span>
                      <p className="text-white font-medium">
                        {formatDate(meeting.date)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-white/60 text-sm">Time:</span>
                      <p className="text-white font-medium">
                        {formatTime(meeting.date)} ({meeting.duration} min)
                      </p>
                    </div>
                  </>
                )}
                
                <div>
                  <span className="text-white/60 text-sm">Participants:</span>
                  <p className="text-white font-medium">
                    {meeting.participants?.length || 0} invited
                  </p>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm">Meeting ID:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-cyan-400 font-mono text-sm">
                      {meeting.meetingId}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigator.clipboard.writeText(meeting.meetingId!)}
                      className="text-white/60 hover:text-white"
                    >
                      <Copy size={12} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card p-6 border border-white/20 card-3d">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="text-yellow-400" size={20} />
                Pro Tips
              </h3>
              
              <div className="space-y-3 text-sm text-white/70">
                <p> Add participants early to send calendar invites</p>
                <p> Enable waiting room for better security</p>
                <p> Set up passwords for sensitive meetings</p>
                <p> Test your audio/video before important calls</p>
                <p> Record meetings for absent participants</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeeting;