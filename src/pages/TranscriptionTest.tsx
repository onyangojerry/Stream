import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TranscriptionPanel from '../components/TranscriptionPanel';

const TranscriptionTest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Mic className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Real-time Transcription Test
                  </h1>
                  <p className="text-sm text-gray-400">
                    Test Web Speech API transcription functionality
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                Chrome, Edge, or Safari required
              </span>
              <div className="p-2 bg-gray-700/50 rounded-lg">
                <Settings size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
          {/* Instructions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 h-full"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                How to Test Transcription
              </h2>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Enable Microphone</h3>
                    <p className="text-sm">Allow microphone access when prompted by your browser.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Set Speaker Name</h3>
                    <p className="text-sm">Enter your name in the speaker field to identify your voice.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Start Transcription</h3>
                    <p className="text-sm">Click the microphone button to begin real-time transcription.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Speak Clearly</h3>
                    <p className="text-sm">Speak clearly and at a moderate pace for best results.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <h4 className="text-yellow-300 font-medium mb-2">Browser Support</h4>
                <div className="space-y-1 text-sm text-yellow-200">
                  <p>✅ Chrome 25+</p>
                  <p>✅ Edge 79+</p>
                  <p>✅ Safari 14.1+</p>
                  <p>❌ Firefox (not supported)</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-300 font-medium mb-2">Features</h4>
                <div className="space-y-1 text-sm text-blue-200">
                  <p>• Real-time speech-to-text</p>
                  <p>• Confidence scoring</p>
                  <p>• Live interim results</p>
                  <p>• Download transcription</p>
                  <p>• Speaker identification</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transcription Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 h-full overflow-hidden"
            >
              <TranscriptionPanel />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionTest;