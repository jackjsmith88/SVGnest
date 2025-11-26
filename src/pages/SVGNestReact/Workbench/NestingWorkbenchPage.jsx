import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../../styles/App.css'

// Components
import NestingWorkbench from './NestingWorkbench'
import MainToolbar from '../Components/Toolbar/MainToolbar'
import Configuration from '../SingleBin/Configuration'
import ProgressPanel from '../Components/Progress/ProgressPanel'
import SVGDisplay from '../SingleBin/SVGDisplay'

// Hooks
import { useScriptLoader } from '../../../hooks/useScriptLoader'
import { useSVGNest } from '../../../hooks/useSVGNest'
import { useSVGLoader } from '../../../hooks/useSVGLoader'
import { useUIState } from '../../../hooks/useUIState'

// Utils
import { MESSAGE_TYPES } from '../../../utils/constants'

function NestingWorkbenchPage() {
  const navigate = useNavigate()
  const displayRef = useRef(null)

  // UI state hook
  const {
    configVisible,
    message, setMessage,
    messageClass, setMessageClass,
    nestingStarted, setNestingStarted,
    handleZoomIn, handleZoomOut,
    toggleConfig
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
    binsRef,
    startNest,
    stopNest,
    handleDownload,
    attachSvgListeners,
    resetProgress
  } = useSVGNest()

  // SVG loader hook
  const { loadCustomShapes } = useSVGLoader({
    displayRef,
    attachSvgListeners,
    setBinSelected,
    setMessage,
    setMessageClass,
    MESSAGE_TYPES
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('NestingWorkbenchPage: Cleaning up on unmount')
      if (window.SvgNest) {
        window.SvgNest.stop()
      }
    }
  }, [])

  // Set initial message based on script loading
  useEffect(() => {
    if (loadingError) {
      setMessage(loadingError)
      setMessageClass(MESSAGE_TYPES.ERROR)
    } else if (scriptsLoaded) {
      setMessage('Workbench ready! Configure your shapes and bin size.')
      setMessageClass(MESSAGE_TYPES.SUCCESS)
    }
  }, [scriptsLoaded, loadingError, setMessage, setMessageClass])

  const handleShapesGenerated = (svgString) => {
    if (loadCustomShapes(svgString)) {
      setBinSelected(true)
      setMessage('Shapes loaded! Click Start to begin nesting.')
      setMessageClass(MESSAGE_TYPES.SUCCESS)
    }
  }

  const handleStart = () => {
    if (isWorking) {
      stopNest()
    } else {
      const result = startNest()
      if (!result.success) {
        setMessage(result.message)
        setMessageClass(MESSAGE_TYPES.ERROR)
      } else {
        setNestingStarted(true)
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

  const handleClear = () => {
    console.log('handleClear: Starting cleanup process')
    
    if (isWorking) {
      console.log('handleClear: Stopping running algorithm')
      stopNest()
    }
    
    resetProgress()
    
    setBinSelected(false)
    setNestingStarted(false)
    
    if (binsRef.current) {
      binsRef.current.innerHTML = ''
    }
    if (displayRef.current) {
      displayRef.current.innerHTML = ''
    }
    
    setMessage('Cleared. Ready to configure new shapes.')
    setMessageClass(MESSAGE_TYPES.SUCCESS)
  }

  const handleExit = () => {
    console.log('handleExit: Returning to home')
    
    if (isWorking) {
      stopNest()
    }
    
    resetProgress()
    
    navigate('/')
  }

  return (
    <div className="App" style={{ height: '100%', overflow: 'auto' }}>
      <div id="svgnest" style={{ display: 'block', minHeight: '100vh' }}>
        <MainToolbar
          isWorking={isWorking}
          binSelected={binSelected}
          downloadReady={downloadReady}
          configVisible={configVisible}
          showCustomBuilder={false}
          nestingStarted={nestingStarted}
          onStart={handleStart}
          onDownload={handleDownloadClick}
          onClear={handleClear}
          onConfigToggle={toggleConfig}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onExit={handleExit}
        />

        <Configuration 
          visible={configVisible} 
          onClose={toggleConfig}
        />

        {!binSelected && (
          <NestingWorkbench 
            onShapesGenerated={handleShapesGenerated}
          />
        )}

        <ProgressPanel iterations={iterations} />

        <div style={{ display: binSelected ? 'block' : 'none' }}>
          <SVGDisplay ref={displayRef} />
        </div>

        <div 
          id="bins" 
          ref={binsRef} 
          style={{ display: nestingStarted ? 'block' : 'none' }}
        ></div>
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

export default NestingWorkbenchPage
