import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Eye, 
  Palette, 
  Mouse, 
  Layers,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

const UIShowcase: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: '3D Rendering Effects',
      description: 'Advanced CSS 3D transforms, depth layers, and perspective animations',
      gradient: 'from-purple-500 to-pink-500',
      demo: (
        <div className="relative">
          <div className="card-3d glass-card p-4 transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">3D Card</h4>
            <p className="text-white/70 text-sm">Hover to see the 3D effect in action</p>
          </div>
        </div>
      )
    },
    {
      icon: Palette,
      title: 'Modern Color Palette',
      description: 'Carefully curated gradients, glass morphism, and dynamic color schemes',
      gradient: 'from-blue-500 to-cyan-500',
      demo: (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-glow-purple"></div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-glow-cyan"></div>
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-glow-green"></div>
          </div>
          <div className="glass rounded-lg p-3 border border-white/20">
            <p className="text-white/80 text-sm">Glass morphism effect</p>
          </div>
        </div>
      )
    },
    {
      icon: Mouse,
      title: 'Interactive Elements',
      description: 'Smooth hover states, micro-interactions, and responsive feedback',
      gradient: 'from-green-500 to-emerald-500',
      demo: (
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary w-full"
          >
            Interactive Button
          </motion.button>
          <div className="grid grid-cols-3 gap-2">
            {['', '', ''].map((emoji, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.8 }}
                className="bg-white/10 rounded-lg p-2 text-center hover:bg-white/20 transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: Eye,
      title: 'Visual Hierarchy',
      description: 'Clear typography, proper spacing, and intuitive information architecture',
      gradient: 'from-orange-500 to-amber-500',
      demo: (
        <div className="space-y-3">
          <h4 className="text-gradient font-bold text-lg">Gradient Text</h4>
          <p className="text-white font-medium">Primary Text</p>
          <p className="text-white/70">Secondary Text</p>
          <p className="text-white/50 text-sm">Tertiary Text</p>
        </div>
      )
    },
    {
      icon: Layers,
      title: 'Layered Design',
      description: 'Depth through shadows, backdrop blur, and strategic layering',
      gradient: 'from-pink-500 to-rose-500',
      demo: (
        <div className="relative">
          <div className="glass-card p-4 relative z-10">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold z-20">
              5
            </div>
            <p className="text-white text-sm">Layered notification card</p>
          </div>
        </div>
      )
    },
    {
      icon: Zap,
      title: 'Smooth Animations',
      description: 'Framer Motion powered transitions and micro-interactions',
      gradient: 'from-yellow-500 to-orange-500',
      demo: (
        <div className="relative h-16 flex items-center justify-center">
          <motion.div
            animate={{
              x: [0, 20, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center"
          >
            <Zap size={16} className="text-white" />
          </motion.div>
        </div>
      )
    },
  ];

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
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-6xl font-bold text-gradient mb-4"
            animate={{ 
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            Modern UI/UX Design
          </motion.h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed">
            Experience cutting-edge user interface design with 3D rendering effects, 
            interactive elements, and beautiful visual aesthetics powered by modern web technologies.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card p-6 border border-white/20 card-3d"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} shadow-2xl`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
                
                {/* Demo Area */}
                <div className="mt-6 p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                  {feature.demo}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-8 border border-white/20 card-3d mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient mb-4">Interactive Component Demo</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Try out our enhanced components with real-time interactions and smooth animations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Control Button Demo */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Control Buttons</h4>
              <div className="flex gap-2 justify-center">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="control-button p-3 bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Play size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="control-button p-3"
                >
                  <Pause size={16} />
                </motion.button>
              </div>
            </div>

            {/* Glass Cards Demo */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Glass Morphism</h4>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass rounded-xl p-4 border border-white/20 text-center"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-2"></div>
                <p className="text-white/80 text-sm">Glass Effect</p>
              </motion.div>
            </div>

            {/* Animation Demo */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Animations</h4>
              <div className="relative h-16 bg-black/20 rounded-xl flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
                />
              </div>
            </div>

            {/* 3D Transform Demo */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">3D Transform</h4>
              <motion.div
                whileHover={{ 
                  rotateY: 15,
                  rotateX: 5,
                  scale: 1.05
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-center cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <p className="text-white font-medium text-sm">Hover me!</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <motion.a
            href="/video"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 btn-primary px-8 py-4 text-lg font-semibold"
          >
            Experience the Video Call
            <ArrowRight size={20} />
          </motion.a>
          <p className="text-white/60 mt-4">
            See all these design principles in action with our enhanced video calling interface.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default UIShowcase;