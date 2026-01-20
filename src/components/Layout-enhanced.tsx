import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Video, 
  Users, 
  Settings, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState(3);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Video Calls', href: '/video', icon: Video, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Team', href: '/team', icon: Users, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Settings', href: '/settings', icon: Settings, gradient: 'from-orange-500 to-amber-500' },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    }),
  };

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-20 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden control-button p-2"
            >
              <Menu size={20} />
            </motion.button>

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-glow-purple">
                  <Zap size={16} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <h1 className="text-xl font-bold text-gradient">Stream</h1>
            </motion.div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Online Status */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Online' : 'Offline'}
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="control-button p-3"
            >
              <motion.div
                animate={{ rotate: darkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative control-button p-3"
            >
              <Bell size={16} />
              {notifications > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {notifications}
                </motion.div>
              )}
            </motion.button>

            {/* User Menu */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="control-button p-3"
            >
              <User size={16} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 h-full w-80 glass border-r border-white/10 z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gradient">Stream</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(false)}
                  className="control-button p-2"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-6 py-6">
                <ul className="space-y-2">
                  {navigation.map((item, index) => (
                    <motion.li
                      key={item.name}
                      custom={index}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <motion.a
                        href={item.href}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon size={16} className="text-white" />
                        </div>
                        <span className="font-medium text-white group-hover:text-gradient transition-all duration-300">
                          {item.name}
                        </span>
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                  <LogOut size={16} />
                  <span className="font-medium">Sign Out</span>
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 glass border-r border-white/10 z-30">
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.1 }
                  }}
                >
                  <motion.a
                    href={item.href}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-white group-hover:text-gradient transition-all duration-300">
                      {item.name}
                    </span>
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Desktop Footer */}
          <div className="p-4 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
            >
              <LogOut size={16} />
              <span className="font-medium">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.9 }}
        className="fab"
      >
        <Video size={20} />
      </motion.button>
    </div>
  );
};

export default Layout;