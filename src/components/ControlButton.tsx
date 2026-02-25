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
    const baseClasses = 'transition-colors duration-150 ease-out rounded-full border'
    
    switch (variant) {
      case 'default':
        return `${baseClasses} border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800`
      case 'muted':
        return `${baseClasses} border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50`
      case 'active':
        return `${baseClasses} border-gray-900 bg-gray-900 text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200`
      case 'danger':
        return `${baseClasses} border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950/20`
      case 'success':
        return `${baseClasses} border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800`
      case 'warning':
        return `${baseClasses} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/40`
      default:
        return `${baseClasses} border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800`
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
          flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-950
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
            className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2"
          >
            <div className="max-w-xs whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              <div className="font-medium">{title}</div>
              {active && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Currently active
                </div>
              )}
              {variant === 'muted' && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Click to enable
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ControlButton
