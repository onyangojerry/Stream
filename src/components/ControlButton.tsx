import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ControlButtonProps {
  children: ReactNode
  onClick: () => void
  title: string
  variant?: 'default' | 'muted' | 'active' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  active?: boolean
  className?: string
  showBadge?: boolean
  badgeContent?: ReactNode
  badgeColor?: 'red' | 'green' | 'yellow' | 'blue'
}

const ControlButton = ({
  children,
  onClick,
  title,
  variant = 'default',
  size = 'md',
  disabled = false,
  active = false,
  className = '',
  showBadge = false,
  badgeContent,
  badgeColor = 'red'
}: ControlButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const getVariantClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm border'
    
    switch (variant) {
      case 'default':
        return `${baseClasses} bg-slate-200/80 hover:bg-slate-300/80 active:bg-slate-400/80 text-slate-700 border-slate-300/50 dark:bg-slate-700/80 dark:hover:bg-slate-600/80 dark:active:bg-slate-500/80 dark:text-slate-200 dark:border-slate-600/50`
      case 'muted':
        return `${baseClasses} bg-red-100/80 hover:bg-red-200/80 active:bg-red-300/80 text-red-700 border-red-200/50 dark:bg-red-900/40 dark:hover:bg-red-800/60 dark:active:bg-red-700/80 dark:text-red-300 dark:border-red-700/50`
      case 'active':
        return `${baseClasses} bg-blue-100/80 hover:bg-blue-200/80 active:bg-blue-300/80 text-blue-700 border-blue-200/50 ring-2 ring-blue-400/50 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 dark:active:bg-blue-700/80 dark:text-blue-300 dark:border-blue-600/50`
      case 'danger':
        return `${baseClasses} bg-red-100/80 hover:bg-red-200/80 active:bg-red-300/80 text-red-700 border-red-200/50 dark:bg-red-900/40 dark:hover:bg-red-800/60 dark:active:bg-red-700/80 dark:text-red-300 dark:border-red-700/50`
      case 'success':
        return `${baseClasses} bg-green-100/80 hover:bg-green-200/80 active:bg-green-300/80 text-green-700 border-green-200/50 dark:bg-green-900/40 dark:hover:bg-green-800/60 dark:active:bg-green-700/80 dark:text-green-300 dark:border-green-700/50`
      case 'warning':
        return `${baseClasses} bg-amber-100/80 hover:bg-amber-200/80 active:bg-amber-300/80 text-amber-700 border-amber-200/50 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 dark:active:bg-amber-700/80 dark:text-amber-300 dark:border-amber-700/50`
      default:
        return `${baseClasses} bg-slate-200/80 hover:bg-slate-300/80 active:bg-slate-400/80 text-slate-700 border-slate-300/50 dark:bg-slate-700/80 dark:hover:bg-slate-600/80 dark:active:bg-slate-500/80 dark:text-slate-200 dark:border-slate-600/50`
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8'
      case 'md':
        return 'w-10 h-10'
      case 'lg':
        return 'w-12 h-12'
      default:
        return 'w-10 h-10'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'md':
        return 'w-5 h-5'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }

  const getDisabledClasses = () => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 active:bg-gray-400'
    }
    return ''
  }

  const getBadgeColorClasses = () => {
    switch (badgeColor) {
      case 'red':
        return 'bg-red-500 text-white'
      case 'green':
        return 'bg-green-500 text-white'
      case 'yellow':
        return 'bg-yellow-500 text-white'
      case 'blue':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-red-500 text-white'
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        className={`
          flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${getDisabledClasses()}
          ${className}
        `}
        title={title}
      >
        <div className={getIconSize()}>
          {children}
        </div>
        
        {/* Badge */}
        {showBadge && badgeContent && (
          <div className={`absolute -top-1 -right-1 w-5 h-5 ${getBadgeColorClasses()} text-xs rounded-full flex items-center justify-center font-medium`}>
            {badgeContent}
          </div>
        )}
      </motion.button>

      {/* Enhanced Tooltip */}
      <AnimatePresence>
        {isHovered && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50"
          >
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap max-w-xs">
              <div className="font-medium">{title}</div>
              {active && (
                <div className="text-xs text-gray-300 mt-1">
                  Currently active
                </div>
              )}
              {variant === 'muted' && (
                <div className="text-xs text-gray-300 mt-1">
                  Click to enable
                </div>
              )}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ControlButton
