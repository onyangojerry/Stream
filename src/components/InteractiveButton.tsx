import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InteractiveButtonProps {
  children: ReactNode
  onClick: () => void
  title: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  active?: boolean
  className?: string
  showTooltip?: boolean
}

const InteractiveButton = ({
  children,
  onClick,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  active = false,
  className = '',
  showTooltip = true
}: InteractiveButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const getVariantClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out'
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl active:shadow-inner`
      case 'secondary':
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-lg hover:shadow-xl active:shadow-inner`
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg hover:shadow-xl active:shadow-inner`
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg hover:shadow-xl active:shadow-inner`
      case 'warning':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white shadow-lg hover:shadow-xl active:shadow-inner`
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl active:shadow-inner`
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-base'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  const getActiveClasses = () => {
    if (active) {
      return 'ring-2 ring-blue-400 ring-offset-2 bg-blue-700'
    }
    return ''
  }

  const getDisabledClasses = () => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 active:bg-gray-400'
    }
    return ''
  }

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`
          rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${getActiveClasses()}
          ${getDisabledClasses()}
          ${className}
        `}
        title={title}
      >
        {children}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
              {title}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InteractiveButton
