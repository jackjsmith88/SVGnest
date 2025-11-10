import React, { useState, useRef } from 'react'
import './App.css'

// Components
import SplashScreen from './components/Splash/SplashScreen'
import ModeSwitcher from './components/Navigation/ModeSwitcher'
import Controls from './components/Navigation/Controls'
import Configuration from './components/SingleBin/Configuration'
import ProgressSidebar from './components/SingleBin/ProgressSidebar'
import SVGDisplay from './components/SingleBin/SVGDisplay'
import MultiBinTester from './components/MultiBinTester'

// Hooks
import { useScriptLoader } from './hooks/useScriptLoader'
import { useFileHandler } from './hooks/useFileHandler'
import { useSVGNest } from './hooks/useSVGNest'

// Utils
import { MODES, MESSAGE_TYPES } from './utils/constants'



function App() {
  // UI State
  const [showSplash, setShowSplash] = useState(true)
  const [faqVisible, setFaqVisible] = useState(false)
  const [configVisible, setConfigVisible] = useState(false)
  const [currentMode, setCurrentMode] = useState(MODES.SINGLE_BIN)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [message, setMessage] = useState('')
  const [messageClass, setMessageClass] = useState('')

  // File input ref
  const fileInputRef = useRef(null)

  // Custom hooks
  const { scriptsLoaded, loadingError } = useScriptLoader()
  
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
      
      // DEBUG: Wrap parsesvg to track all calls
      if (window.SvgNest && window.SvgNest.parsesvg) {
        const originalParse = window.SvgNest.parsesvg
        window.SvgNest.parsesvg = function(svgstring) {
          console.log('🔴 PARSESVG CALLED!')
          console.log('SVG string length:', svgstring?.length)
          console.log('First 200 chars:', svgstring?.substring(0, 200))
          console.trace('Call stack:')
          return originalParse.call(this, svgstring)
        }
      }
    }
  }, [scriptsLoaded, loadingError])

  // Event handlers
  const handleDemo = () => {
    console.log('Demo button clicked')
    
    if (!scriptsLoaded) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return
    }

    // Load demo SVG
    const displayElement = displayRef.current
    if (displayElement && window.SvgNest) {
      try {
        // DEBUG: Log what we're about to parse
        console.log('=== DEMO LOAD DEBUG ===')
        console.log('Display element innerHTML length:', displayElement.innerHTML.length)
        console.log('Display element child count:', displayElement.children.length)
        console.log('First 500 chars:', displayElement.innerHTML.substring(0, 500))
        
        // Parse the SVG content like in the original
        const svg = window.SvgNest.parsesvg(displayElement.innerHTML)
        
        // DEBUG: Log what we got back
        console.log('Parsed SVG child count:', svg.childNodes.length)
        console.log('Parsed SVG children:', Array.from(svg.childNodes).map(n => n.tagName || n.nodeType))
        
        displayElement.innerHTML = ''
        displayElement.appendChild(svg)
        
        // Attach event listeners for SVG selection
        attachSvgListeners(svg)
        
        setMessage('Click on the outline to use as the bin')
        setMessageClass(MESSAGE_TYPES.SUCCESS)
        console.log('Demo SVG parsed and listeners attached')
      } catch (e) {
        setMessage(e.toString())
        setMessageClass(MESSAGE_TYPES.ERROR)
        return
      }
    }
    
    setShowSplash(false)
  }

  const handleUpload = () => {
    if (!scriptsLoaded) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return
    }
    
    setShowSplash(false)
    // Trigger file input
    if (fileInputRef.current) {
      fileInputRef.current.click()
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

  const handleConfigSave = (e) => {
    e.preventDefault()
    
    if (!window.SvgNest) {
      setMessage('SVGnest not available')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return
    }

    const config = {}
    const inputs = document.querySelectorAll('#config input')
    
    inputs.forEach(input => {
      const key = input.getAttribute('data-config')
      if (key) {
        if (input.type === 'checkbox') {
          config[key] = input.checked
        } else {
          config[key] = parseFloat(input.value) || input.value
        }
      }
    })

    window.SvgNest.config(config)
    setMessage('Configuration saved')
    setMessageClass(MESSAGE_TYPES.SUCCESS)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleExit = () => {
    setShowSplash(true)
    setCurrentMode(MODES.SINGLE_BIN)
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
          onConfigToggle={() => setConfigVisible(!configVisible)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onExit={handleExit}
        />

        <Configuration 
          visible={configVisible} 
          onSave={handleConfigSave} 
        />

        <ModeSwitcher 
          currentMode={currentMode} 
          onModeChange={setCurrentMode} 
        />

        <ProgressSidebar iterations={iterations} />

        {currentMode === MODES.SINGLE_BIN ? (
          <SVGDisplay ref={displayRef} />
        ) : (
          <MultiBinTester />
        )}

        <div 
          id="bins" 
          ref={binsRef} 
          style={{ display: currentMode === MODES.SINGLE_BIN ? 'block' : 'none' }}
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

export default App