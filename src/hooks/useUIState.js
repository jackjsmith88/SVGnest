import { useState } from 'react'

/**
 * Hook for managing UI state
 */
export function useUIState() {
  const [showSplash, setShowSplash] = useState(true)
  const [faqVisible, setFaqVisible] = useState(false)
  const [configVisible, setConfigVisible] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [message, setMessage] = useState('')
  const [messageClass, setMessageClass] = useState('')
  const [customShapesLoaded, setCustomShapesLoaded] = useState(false)
  const [nestingStarted, setNestingStarted] = useState(false)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }

  const toggleConfig = () => {
    setConfigVisible(prev => !prev)
  }

  const toggleFAQ = () => {
    setFaqVisible(prev => !prev)
  }

  const toggleCustomBuilder = () => {
    setShowCustomBuilder(prev => !prev)
  }

  return {
    // State
    showSplash,
    faqVisible,
    configVisible,
    zoomLevel,
    message,
    messageClass,
    customShapesLoaded,
    nestingStarted,
    showCustomBuilder,
    
    // Setters
    setShowSplash,
    setFaqVisible,
    setConfigVisible,
    setZoomLevel,
    setMessage,
    setMessageClass,
    setCustomShapesLoaded,
    setNestingStarted,
    setShowCustomBuilder,
    
    // Actions
    handleZoomIn,
    handleZoomOut,
    toggleConfig,
    toggleFAQ,
    toggleCustomBuilder
  }
}
