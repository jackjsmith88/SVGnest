import React, { useState, useRef } from 'react'
import '../../styles/App.css'

// Components
import SplashScreen from './Splash/SplashScreen'
import Controls from './Components/Navigation/Controls'
import Configuration from './SingleBin/Configuration'
import ProgressSidebar from './SingleBin/ProgressSidebar'
import SVGDisplay from './SingleBin/SVGDisplay'
import { ShapeControls } from './SingleBin/ShapeControls'
import CustomShapeBuilder from './SingleBin/CustomShapeBuilder'

// Hooks
import { useScriptLoader } from '../../hooks/useScriptLoader'
import { useFileHandler } from '../../hooks/useFileHandler'
import { useSVGNest } from '../../hooks/useSVGNest'
import { useSVGLoader } from '../../hooks/useSVGLoader'
import { useConfiguration } from '../../hooks/useConfiguration'
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
    attachSvgListeners
  } = useSVGNest()

  // Configuration hook
  const { saveConfig } = useConfiguration({
    setMessage,
    setMessageClass,
    MESSAGE_TYPES
  })

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
      setNestingStarted(false)
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
    setShowSplash(true)
    setBinSelected(false)
    setMessage('')
    setMessageClass('')
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
        <Controls
          isWorking={isWorking}
          binSelected={binSelected}
          downloadReady={downloadReady}
          configVisible={configVisible}
          onStart={handleStart}
          onDownload={handleDownloadClick}
          onConfigToggle={toggleConfig}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onExit={handleExit}
        />

        <Configuration 
          visible={configVisible} 
          onSave={saveConfig}
          onClose={toggleConfig}
        />

        {!showCustomBuilder && (
          <ShapeControls
            onShapeMultiplierChange={() => {}}
            onFileLoad={loadCustomFile}
            onDemoLoad={loadDemo}
          />
        )}
        
        <button 
          onClick={toggleCustomBuilder}
          style={{
            margin: '10px 20px',
            padding: '10px 20px',
            backgroundColor: showCustomBuilder ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: nestingStarted ? 'none' : 'block'
          }}
        >
          {showCustomBuilder ? 'Hide Custom Shape Builder' : 'Show Custom Shape Builder'}
        </button>
        
        {showCustomBuilder && !nestingStarted && (
          <CustomShapeBuilder 
            onShapesGenerated={handleShapesGenerated}
          />
        )}

        <ProgressSidebar iterations={iterations} />

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




