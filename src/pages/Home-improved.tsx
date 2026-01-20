import { Video, Users, Calendar, Play, Sparkles, Zap, Globe, Shield, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const meetingTypes = [
  {
    id: "instant",
    icon: Video,
    title: "Instant Meeting",
    description: "Start an impromptu meeting instantly",
    gradient: "from-purple-600 via-blue-600 to-cyan-500",
    shadowColor: "shadow-purple-500/25",
    features: ["HD Video", "Crystal Audio", "Screen Share"]
  },
  {
    id: "join",
    icon: Users,
    title: "Join Meeting", 
    description: "Enter meeting with invitation code",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    shadowColor: "shadow-green-500/25",
    features: ["Quick Join", "Waiting Room", "Chat"]
  },
  {
    id: "schedule",
    icon: Calendar,
    title: "Schedule Meeting",
    description: "Plan your meeting for later",
    gradient: "from-orange-500 via-red-500 to-pink-500",
    shadowColor: "shadow-red-500/25",
    features: ["Calendar Sync", "Reminders", "Recurring"]
  },
  {
    id: "recordings",
    icon: Play,
    title: "View Recordings",
    description: "Access previous meeting recordings", 
    gradient: "from-indigo-600 via-purple-600 to-pink-600",
    shadowColor: "shadow-indigo-500/25",
    features: ["HD Recording", "Transcripts", "Analytics"]
  },
  {
    id: "test-transcription",
    icon: Mic,
    title: "Test Transcription",
    description: "Try real-time speech-to-text", 
    gradient: "from-teal-500 via-blue-500 to-indigo-500",
    shadowColor: "shadow-teal-500/25",
    features: ["Live Speech-to-Text", "Web Speech API", "Confidence Scoring"]
  },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Features",
    description: "Real-time transcription, sign language detection, and smart meeting insights",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Ultra-low latency WebRTC connections with adaptive quality streaming",
    gradient: "from-blue-400 to-purple-500"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with anyone, anywhere with our worldwide infrastructure",
    gradient: "from-green-400 to-blue-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, privacy controls, and compliance ready",
    gradient: "from-red-400 to-pink-500"
  }
];

export default function Home() {
  const navigate = useNavigate();

  const handleMeetingAction = (type: string) => {
    switch (type) {
      case "instant": {
        const meetingId = Math.random().toString(36).substring(2, 15);
        navigate(`/call/${meetingId}`);
        break;
      }
      case "join":
        navigate("/join");
        break; 
      case "schedule":
        navigate("/scheduler");
        break;
      case "recordings":
        navigate("/recordings");
        break;
      case "test-transcription":
        navigate("/test-transcription");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">Next-Gen Video Communication</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent leading-tight">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Stream
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Experience the future of video communication with AI-powered features,
            crystal-clear quality, and seamless collaboration tools.
          </p>
        </motion.div>

        {/* Meeting Types Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {meetingTypes.map((meeting, index) => {
            const Icon = meeting.icon;
            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative cursor-pointer`}
                onClick={() => handleMeetingAction(meeting.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${meeting.gradient} rounded-2xl ${meeting.shadowColor} shadow-2xl transform group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105`}></div>
                
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full transform transition-all duration-300 group-hover:bg-white/15">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
                      <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform group-hover:scale-110 transition-transform duration-300">
                        <Icon size={32} className="text-white" />
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-2 text-white group-hover:text-white/90 transition-colors">
                      {meeting.title}
                    </h3>
                    
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">
                      {meeting.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {meeting.features.map((feature, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full bg-white/20 text-xs text-white/80 font-medium">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Join Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mb-20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 mb-6">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white/90">Quick Access</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join Instantly
              </h2>
              
              <p className="text-white/70 text-lg mb-8">
                Have a meeting ID? Enter it below for instant access
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter meeting ID"
                    className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/15 transition-all duration-300"
                  />
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Join Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-sm transform group-hover:bg-white/10 transition-all duration-300"></div>
                
                <div className="relative p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  
                  <h3 className="font-bold text-lg text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}