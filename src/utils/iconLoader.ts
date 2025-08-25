import React from 'react'

// Dynamic icon loader for better performance
export const loadIcon = async (iconName: string) => {
  try {
    const module = await import(`lucide-react/dist/esm/icons/${iconName}`)
    return module.default
  } catch (error) {
    console.warn(`Icon ${iconName} not found, using fallback`)
    // Fallback to a simple div
    return () => React.createElement('div', { className: 'w-4 h-4 bg-gray-400 rounded' })
  }
}

// Preload commonly used icons
export const preloadCommonIcons = () => {
  const commonIcons = [
    'Video', 'Users', 'Presentation', 'Calendar', 'ArrowRight', 'Share2', 
    'Copy', 'Check', 'User', 'LogOut', 'Settings', 'MessageCircle'
  ]
  
  commonIcons.forEach(iconName => {
    loadIcon(iconName)
  })
}
