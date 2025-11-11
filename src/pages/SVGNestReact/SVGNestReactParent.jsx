import React, { useState, useRef, useEffect } from 'react'
import '../../styles/App.css'

// Components
import SplashScreen from './Splash/SplashScreen'
import MainToolbar from './Components/Toolbar/MainToolbar'
import Configuration from './SingleBin/Configuration'
import ProgressPanel from './Components/Progress/ProgressPanel'
import SVGDisplay from './SingleBin/SVGDisplay'
import ShapeManager from './Components/ShapeManager/ShapeManager'
import CustomShapeBuilder from './SingleBin/CustomShapeBuilder'

// Hooks
import { useScriptLoader } from '../../hooks/useScriptLoader'
import { useFileHandler } from '../../hooks/useFileHandler'
import { useSVGNest } from '../../hooks/useSVGNest'
import { useSVGLoader } from '../../hooks/useSVGLoader'
import { useUIState } from '../../hooks/useUIState'

// Utils
import { MESSAGE_TYPES } from '../../utils/constants'


function SVGNestReactParent() {
  // File input ref
  const fileInputRef = useRef(null)

  // UI state hook
  const {
    showSplash, setShowSplash,
    faqVisible, setFaqVisible,
    configVisible, setConfigVisible,
    message, setMessage,
    messageClass, setMessageClass,
    customShapesLoaded, setCustomShapesLoaded,
    nestingStarted, setNestingStarted,
    showCustomBuilder, setShowCustomBuilder,
    handleZoomIn, handleZoomOut,
    toggleConfig, toggleCustomBuilder
  } = useUIState()

  // Script loader
  const { scriptsLoaded, loadingError } = useScriptLoader()
  
  // SVGnest core hook
  const {
    isWorking,
    downloadReady, 
    binSelected,
    setBinSelected,
    iterations,
    displayRef,
    binsRef,
    startNest,
    stopNest,
    handleDownload,
    attachSvgListeners,
    resetProgress
  } = useSVGNest()

  // SVG loader hook
  const { loadDemo, loadCustomFile, loadCustomShapes } = useSVGLoader({
    displayRef,
    attachSvgListeners,
    setBinSelected,
    setMessage,
    setMessageClass,
    MESSAGE_TYPES
  })

  // File handler hook
  const { handleFileChange, handleDragOver, handleDrop } = useFileHandler({
    setMessage,
    setMessageClass,
    setBinSelected,
    attachSvgListeners
  })

  // Cleanup on unmount - stop any running nesting operations
  useEffect(() => {
    return () => {
      console.log('SVGNestReactParent: Cleaning up on unmount')
      if (window.SvgNest) {
        window.SvgNest.stop()
      }
    }
  }, [])

  // Set initial message based on script loading
  React.useEffect(() => {
    if (loadingError) {
      setMessage(loadingError)
      setMessageClass(MESSAGE_TYPES.ERROR)
    } else if (scriptsLoaded) {
      setMessage('SVGnest ready! Click Demo or Upload SVG to start')
      setMessageClass(MESSAGE_TYPES.SUCCESS)
    }
  }, [scriptsLoaded, loadingError, setMessage, setMessageClass])

  // Simple event handlers
  const handleDemo = () => {
    if (loadDemo(1)) {
      setShowSplash(false)
    }
  }

  const handleUpload = () => {
    if (!scriptsLoaded) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return
    }
    
    setShowSplash(false)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleStart = () => {
    if (isWorking) {
      stopNest()
      // Don't set nestingStarted to false - keep it true to show results
    } else {
      const result = startNest()
      if (!result.success) {
        setMessage(result.message)
        setMessageClass(MESSAGE_TYPES.ERROR)
      } else {
        setNestingStarted(true)
        if (showCustomBuilder) {
          setShowCustomBuilder(false)
        }
      }
    }
  }

  const handleDownloadClick = () => {
    const result = handleDownload()
    if (result) {
      setMessage(result.message)
      setMessageClass(result.success ? MESSAGE_TYPES.SUCCESS : MESSAGE_TYPES.ERROR)
    }
  }

  const handleShapesGenerated = (svgString) => {
    if (loadCustomShapes(svgString)) {
      setShowSplash(false)
      setCustomShapesLoaded(true)
    }
  }

  const handleExit = () => {
    console.log('handleExit: Starting cleanup and returning to splash')
    
    // Stop if working (following cleanup pattern)
    if (isWorking) {
      console.log('handleExit: Stopping running algorithm')
      stopNest()
    }
    
    // Reset progress
    resetProgress()
    
    // Clear state
    setShowSplash(true)
    setBinSelected(false)
    setNestingStarted(false)
    setMessage('')
    setMessageClass('')
    
    // Clear DOM containers
    if (binsRef.current) {
      binsRef.current.innerHTML = ''
    }
    if (displayRef.current) {
      displayRef.current.innerHTML = ''
    }
    
    console.log('handleExit: Exit complete')
  }

  const handleClear = () => {
    console.log('handleClear: Starting cleanup process')
    
    // Step 1: Stop if working (following cleanup pattern)
    if (isWorking) {
      console.log('handleClear: Stopping running algorithm')
      stopNest()
    }
    
    // Step 2: Reset progress panel and hook state
    console.log('handleClear: Resetting progress')
    resetProgress()
    
    // Step 3: Clear nesting state
    setBinSelected(false)
    setNestingStarted(false)
    setCustomShapesLoaded(false)
    
    // Step 4: Clear DOM containers
    if (binsRef.current) {
      console.log('handleClear: Clearing bins container')
      binsRef.current.innerHTML = ''
    }
    if (displayRef.current) {
      console.log('handleClear: Clearing display container')
      displayRef.current.innerHTML = ''
    }
    
    // Step 5: Update user
    setMessage('Cleared. Ready to load new shapes.')
    setMessageClass(MESSAGE_TYPES.SUCCESS)
    
    console.log('handleClear: Cleanup complete')
  }

  return (
    <div className="App" onDragOver={handleDragOver} onDrop={handleDrop}>
      {showSplash && (
        <SplashScreen
          faqVisible={faqVisible}
          setFaqVisible={setFaqVisible}
          onDemo={handleDemo}
          onUpload={handleUpload}
        />
      )}

      <div id="svgnest" style={{ display: showSplash ? 'none' : 'block' }}>
        <MainToolbar
          isWorking={isWorking}
          binSelected={binSelected}
          downloadReady={downloadReady}
          configVisible={configVisible}
          showCustomBuilder={showCustomBuilder}
          nestingStarted={nestingStarted}
          onStart={handleStart}
          onDownload={handleDownloadClick}
          onClear={handleClear}
          onConfigToggle={toggleConfig}
          onToggleCustomBuilder={toggleCustomBuilder}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onExit={handleExit}
        />

        <Configuration 
          visible={configVisible} 
          onClose={toggleConfig}
        />

        {!showCustomBuilder && !nestingStarted && (
          <ShapeManager
            onFileLoad={loadCustomFile}
            onDemoLoad={loadDemo}
          />
        )}
        
        {showCustomBuilder && !nestingStarted && (
          <CustomShapeBuilder 
            onShapesGenerated={handleShapesGenerated}
          />
        )}

        <ProgressPanel iterations={iterations} />

        {(!showCustomBuilder || nestingStarted) && (
          <SVGDisplay ref={displayRef} />
        )}
        
        {showCustomBuilder && !nestingStarted && (
          <div style={{ display: 'none' }}>
            <SVGDisplay ref={displayRef} />
          </div>
        )}

        <div 
          id="bins" 
          ref={binsRef} 
          style={{ display: nestingStarted && !showCustomBuilder ? 'block' : 'none' }}
        ></div>

        <input
          ref={fileInputRef}
          type="file"
          style={{ visibility: 'hidden' }}
          onChange={handleFileChange}
          accept=".svg,.xml,text/*"
        />
      </div>

      {message && (
        <div id="messagewrapper">
          <div id="message" className={messageClass} onClick={() => setMessageClass('')}>
            {message}
          </div>
        </div>
      )}
    </div>
  )
}

export default SVGNestReactParent




