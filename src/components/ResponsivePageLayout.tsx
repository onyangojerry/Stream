import React from 'react';
import { motion } from 'framer-motion';

interface ResponsivePageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
}

const ResponsivePageLayout: React.FC<ResponsivePageLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  onBack, 
  backLabel = "Back" 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4"
          >
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-950 dark:text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                  {subtitle}
                </p>
              )}
            </div>
            
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="btn-secondary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
              >
                <span className="hidden sm:inline">{backLabel}</span>
                <span className="sm:hidden">{backLabel.split(' ')[0]}</span>
              </motion.button>
            )}
          </motion.div>

          {/* Content */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsivePageLayout;
