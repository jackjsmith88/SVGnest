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
import { ShapeControls } from './components/SingleBin/ShapeControls'
import CustomShapeBuilder from './components/SingleBin/CustomShapeBuilder'

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
    }
  }, [scriptsLoaded, loadingError])

  // Event handlers
  const handleDemoLoad = (multiplier = 1) => {
    console.log(`Loading demo with ${multiplier}x multiplier`)
    
    if (!scriptsLoaded) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return
    }

    // Load demo SVG
    const displayElement = displayRef.current
    if (displayElement && window.SvgNest) {
      try {
        // Parse the SVG content
        const svg = window.SvgNest.parsesvg(displayElement.innerHTML)
        
        // Duplicate shapes based on multiplier
        if (multiplier > 1) {
          const shapes = []
          const allElements = svg.querySelectorAll('*')
          
          // Find the bin element - it's typically the largest rect or has specific attributes
          let binElement = null
          const rects = svg.querySelectorAll('rect')
          
          // The bin is usually the largest rect or one without fill
          rects.forEach(rect => {
            const width = parseFloat(rect.getAttribute('width'))
            const height = parseFloat(rect.getAttribute('height'))
            // Bin is typically much larger (>400px) and has no fill or white fill
            if (width > 400 || height > 300) {
              binElement = rect
            }
          })
          
          allElements.forEach(el => {
            const id = el.getAttribute('id')
            // Skip the bin element and elements with 'bin' in their id
            if (el === binElement || (id && id.toLowerCase().includes('bin'))) {
              return
            }
            
            if (el.tagName === 'polygon' || el.tagName === 'rect' || el.tagName === 'path' || el.tagName === 'polyline') {
              shapes.push(el)
            }
          })
          
          console.log(`Found ${shapes.length} shapes, duplicating ${multiplier - 1} times`)
          
          // Clone shapes (multiplier - 1) times
          let idCounter = shapes.length
          shapes.forEach(shape => {
            for (let i = 0; i < multiplier - 1; i++) {
              const clone = shape.cloneNode(true)
              const originalId = clone.getAttribute('id')
              if (originalId) {
                clone.setAttribute('id', `${originalId}-copy${i + 1}`)
              } else {
                clone.setAttribute('id', `shape-${idCounter++}`)
              }
              svg.appendChild(clone)
            }
          })
          
          console.log(`Total shapes after duplication: ${shapes.length * multiplier}`)
        }
        
        displayElement.innerHTML = ''
        displayElement.appendChild(svg)
        
        // Attach event listeners for SVG selection
        attachSvgListeners(svg)
        
        const totalShapes = svg.querySelectorAll('polygon, rect, path, polyline').length
        setMessage(`Demo loaded with ${totalShapes} shapes. Click on the outline to use as the bin`)
        setMessageClass(MESSAGE_TYPES.SUCCESS)
      } catch (e) {
        setMessage(e.toString())
        setMessageClass(MESSAGE_TYPES.ERROR)
        return
      }
    }
    
    setShowSplash(false)
  }

  const handleCustomFileLoad = (svgContent, multiplier = 1) => {
    console.log(`Loading custom SVG with ${multiplier}x multiplier`)
    
    if (!window.SvgNest) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return
    }

    const displayElement = displayRef.current
    if (displayElement) {
      try {
        const svg = window.SvgNest.parsesvg(svgContent)
        
        // Duplicate shapes if needed
        if (multiplier > 1) {
          const shapes = []
          const allElements = svg.querySelectorAll('*')
          
          // Find the bin element - it's typically the largest rect
          let binElement = null
          const rects = svg.querySelectorAll('rect')
          
          rects.forEach(rect => {
            const width = parseFloat(rect.getAttribute('width'))
            const height = parseFloat(rect.getAttribute('height'))
            if (width > 400 || height > 300) {
              binElement = rect
            }
          })
          
          allElements.forEach(el => {
            const id = el.getAttribute('id')
            // Skip the bin element and elements with 'bin' in their id
            if (el === binElement || (id && id.toLowerCase().includes('bin'))) {
              return
            }
            
            if (el.tagName === 'polygon' || el.tagName === 'rect' || el.tagName === 'path' || el.tagName === 'polyline') {
              shapes.push(el)
            }
          })
          
          let idCounter = shapes.length
          shapes.forEach(shape => {
            for (let i = 0; i < multiplier - 1; i++) {
              const clone = shape.cloneNode(true)
              const originalId = clone.getAttribute('id')
              if (originalId) {
                clone.setAttribute('id', `${originalId}-copy${i + 1}`)
              } else {
                clone.setAttribute('id', `shape-${idCounter++}`)
              }
              svg.appendChild(clone)
            }
          })
        }
        
        displayElement.innerHTML = ''
        displayElement.appendChild(svg)
        
        attachSvgListeners(svg)
        
        const totalShapes = svg.querySelectorAll('polygon, rect, path, polyline').length
        setMessage(`Custom SVG loaded with ${totalShapes} shapes. Click on the outline to use as the bin`)
        setMessageClass(MESSAGE_TYPES.SUCCESS)
      } catch (e) {
        setMessage(`Error loading SVG: ${e.toString()}`)
        setMessageClass(MESSAGE_TYPES.ERROR)
      }
    }
    
    setShowSplash(false)
  }

  const handleDemo = () => {
    handleDemoLoad(1)
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

  const handleShapesGenerated = (svgString) => {
    console.log('Custom shapes generated:', svgString.length, 'chars')
    
    if (!scriptsLoaded) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return
    }
    
    try {
      const displayElement = displayRef.current
      if (!displayElement) {
        setMessage('Display element not found')
        setMessageClass(MESSAGE_TYPES.ERROR)
        return
      }

      // First, clear everything and reset state
      displayElement.innerHTML = ''
      setBinSelected(false)
      
      // Stop any running nest
      if (window.SvgNest && isWorking) {
        window.SvgNest.stop()
      }

      // Parse the SVG string
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgString, 'image/svg+xml')
      const svg = doc.documentElement

      if (svg.tagName !== 'svg') {
        setMessage('Invalid SVG generated')
        setMessageClass(MESSAGE_TYPES.ERROR)
        return
      }

      // Load into display first
      displayElement.innerHTML = ''
      displayElement.appendChild(svg)
      
      // Now let SvgNest parse it from the DOM
      const parsedSvg = window.SvgNest.parsesvg(displayElement.innerHTML)
      
      // Replace with parsed version
      displayElement.innerHTML = ''
      displayElement.appendChild(parsedSvg)
      
      // The bin is the first polygon (created by ShapeBuilder)
      const allElements = parsedSvg.querySelectorAll('polygon, rect, path, polyline')
      console.log(`Total elements after parsing: ${allElements.length}`)
      allElements.forEach((el, i) => {
        const points = el.getAttribute('points')
        if (points && i > 0 && i < 3) { // Log first 2 shapes to check dimensions
          const coords = points.split(' ').map(p => p.split(',').map(Number))
          const width = Math.max(...coords.map(p => p[0])) - Math.min(...coords.map(p => p[0]))
          const height = Math.max(...coords.map(p => p[1])) - Math.min(...coords.map(p => p[1]))
          console.log(`  [${i}] ${el.tagName} id="${el.getAttribute('id')}" width=${width.toFixed(2)}px height=${height.toFixed(2)}px`)
        } else {
          console.log(`  [${i}] ${el.tagName} id="${el.getAttribute('id')}"`)
        }
      })
      
      const binElement = allElements[0] // First element is always the bin
      const totalShapes = allElements.length - 1 // Exclude bin
      
      // Automatically select the bin and mark it
      if (binElement && window.SvgNest) {
        binElement.setAttribute('class', 'bin')
        window.SvgNest.setbin(binElement)
        
        // Force spacing to 0 for precise custom shapes with real-world dimensions
        window.SvgNest.config({ spacing: 0 })
        console.log('Set spacing to 0 for custom shapes')
        
        setBinSelected(true)
        console.log('Auto-selected bin from custom shapes, total shapes:', totalShapes)
      }
      
      attachSvgListeners(parsedSvg)
      
      setMessage(`Custom shapes loaded: ${totalShapes} shapes ready for nesting. Click Start to begin!`)
      setMessageClass(MESSAGE_TYPES.SUCCESS)
      setShowSplash(false)
    } catch (e) {
      setMessage(`Error loading custom shapes: ${e.toString()}`)
      setMessageClass(MESSAGE_TYPES.ERROR)
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

        {currentMode === MODES.SINGLE_BIN && (
          <>
            <ShapeControls
              onShapeMultiplierChange={() => {}} // Not used - multiplier is passed on load
              onFileLoad={handleCustomFileLoad}
              onDemoLoad={handleDemoLoad}
            />
            
            <CustomShapeBuilder 
              onShapesGenerated={handleShapesGenerated}
            />
          </>
        )}

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