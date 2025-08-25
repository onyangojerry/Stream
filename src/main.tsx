import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload fonts if needed
  if ('fonts' in document) {
    // Preload system fonts
  }
  
  // Preload critical images
  const criticalImages: string[] = [
    // Add any critical images here
  ]
  
  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}

// Initialize app
const root = ReactDOM.createRoot(document.getElementById('root')!)

// Preload resources in parallel with React initialization
preloadCriticalResources()

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
