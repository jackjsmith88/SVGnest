import { useState, useRef, useCallback, useEffect } from 'react'
import { millisecondsToStr } from '../utils/helpers'

export const useSVGNest = () => {
  const [isWorking, setIsWorking] = useState(false)
  const [prevPercent, setPrevPercent] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [iterations, setIterations] = useState(0)
  const [downloadReady, setDownloadReady] = useState(false)
  const [binSelected, setBinSelected] = useState(false)

  const displayRef = useRef(null)
  const binsRef = useRef(null)
  
  // Track nesting session metadata
  const sessionMetadataRef = useRef({
    startTime: null,
    endTime: null,
    totalShapes: 0,
    config: null
  })

  // Cleanup on unmount or when component is no longer needed
  useEffect(() => {
    return () => {
      console.log('useSVGNest: Cleaning up on unmount')
      if (window.SvgNest) {
        window.SvgNest.stop()
      }
    }
  }, [])

  // Helper function to calculate polygon area using shoelace formula
  const calculatePolygonArea = (points) => {
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    return area / 2
  }

  // Define progress and renderSvg functions first
  const progress = useCallback((percent) => {
    const transition = percent > prevPercent ? '; transition: width 0.1s' : ''
    const progressBar = document.getElementById('info_progress_bar')
    const infoPanel = document.getElementById('progress-panel')
    const timeDisplay = document.getElementById('info_time')
    
    // Update Bootstrap progress bar
    if (progressBar) {
      progressBar.style.width = Math.round(percent * 100) + '%'
      progressBar.setAttribute('aria-valuenow', Math.round(percent * 100))
    }
    
    if (infoPanel) {
      infoPanel.style.display = 'block'
    }

    setPrevPercent(percent)

    const now = new Date().getTime()
    if (startTime && now && timeDisplay) {
      const diff = now - startTime
      const estimate = (diff / percent) * (1 - percent)
      timeDisplay.innerHTML = millisecondsToStr(estimate) + ' remaining'

      if (diff > 5000 && percent < 0.3 && percent > 0.02 && estimate > 10000) {
        timeDisplay.style.display = 'block'
      }
    }

    if (timeDisplay) {
      if (percent > 0.95 || percent < 0.02) {
        timeDisplay.style.display = 'none'
      }
    }
    
    if (percent < 0.02) {
      setStartTime(new Date().getTime())
    }
  }, [prevPercent, startTime])

  // Track best solution to only show improvements
  const bestSolutionRef = useRef({ bins: null, fitness: Infinity })

  const renderSvg = useCallback((svglist, efficiency, placed, total) => {
    setIterations(prev => {
      const newIterations = prev + 1
      const iterationsDisplay = document.getElementById('info_iterations_display')
      if (iterationsDisplay) {
        iterationsDisplay.innerHTML = newIterations
      }
      return newIterations
    })

    if (!svglist || svglist.length === 0) {
      return
    }

    // Calculate fitness: prioritize fewer bins, then higher efficiency
    // Lower is better: bins count heavily, then inverse of efficiency
    const binCount = svglist.length
    const unplaced = total - placed
    const currentFitness = binCount + (1 - efficiency) + (2 * unplaced)
    
    // Only render if this solution is better than the previous best
    if (currentFitness >= bestSolutionRef.current.fitness) {
      console.log(`Skipping worse solution: ${binCount} bin(s), fitness ${currentFitness.toFixed(3)} >= ${bestSolutionRef.current.fitness.toFixed(3)}`)
      return
    }

    console.log(`NEW BEST: ${binCount} bin(s), ${placed}/${total} placed, ${(efficiency * 100).toFixed(1)}% efficiency, fitness: ${currentFitness.toFixed(3)}`)
    bestSolutionRef.current = { bins: binCount, fitness: currentFitness }

    if (binsRef.current) {
      binsRef.current.innerHTML = ''

      for (let i = 0; i < svglist.length; i++) {
        // Count shapes in this bin
        const shapesInBin = svglist[i].querySelectorAll('g[transform]').length
        console.log(`  Bin ${i + 1}: ${shapesInBin} shapes`)
        
        // Add grid class for multiple bins (2 or more)
        if (svglist.length > 1) {
          svglist[i].setAttribute('class', 'grid')
        }
        binsRef.current.appendChild(svglist[i])
      }
      
      console.log(`All ${svglist.length} bins appended to DOM`)
    }

    const efficiencyDisplay = document.getElementById('info_efficiency')
    const placedDisplay = document.getElementById('info_placed')
    const placementDisplay = document.getElementById('info_placement')

    if (efficiencyDisplay && (efficiency || efficiency === 0)) {
      efficiencyDisplay.innerHTML = Math.round(efficiency * 100)
    }

    if (placedDisplay) {
      placedDisplay.innerHTML = placed + '/' + total
    }
    
    if (placementDisplay) {
      placementDisplay.style.display = 'block'
    }
    
    if (displayRef.current) {
      displayRef.current.style.display = 'none'
    }
    
    // Enable download button when nesting results are available
    setDownloadReady(true)
  }, [])

  const attachSvgListeners = useCallback((svg) => {
    // attach event listeners for SVG selection
    for (let i = 0; i < svg.childNodes.length; i++) {
      const node = svg.childNodes[i]
      if (node.nodeType === 1) { // Element node
        node.onclick = function() {
          const display = displayRef.current
          if (display && display.className.includes('disabled')) {
            return
          }
          
          // Remove active class from previously selected element
          const currentbin = document.querySelector('#select .active')
          if (currentbin) {
            const className = currentbin.getAttribute('class').replace('active', '').trim()
            if (!className) {
              currentbin.removeAttribute('class')
            } else {
              currentbin.setAttribute('class', className)
            }
          }
          
          // Set this element as the bin and add active class
          if (window.SvgNest) {
            window.SvgNest.setbin(this)
            setBinSelected(true)
            console.log('Bin selected:', this)
          }
          
          this.setAttribute('class', (this.getAttribute('class') ? this.getAttribute('class') + ' ' : '') + 'active')
        }
      }
    }
  }, [setBinSelected])

  const startNest = useCallback(() => {
    console.log('Starting nest with callbacks:', { progress, renderSvg })
    
    if (!window.SvgNest) {
      console.error('SvgNest not available')
      return { success: false, message: 'SVGnest not loaded' }
    }
    
    // Apply current config from UI before starting
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
    
    console.log('\n========================================')
    console.log('🚀 STARTING NESTING ALGORITHM')
    console.log('========================================')
    
    // Apply config from UI if any
    if (Object.keys(config).length > 0) {
      console.log('\n📋 APPLYING UI CONFIGURATION:')
      Object.entries(config).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
      window.SvgNest.config(config)
    }
    
    // Always log the actual configuration being used by SVGnest
    console.log('\n📋 ACTUAL CONFIGURATION USED BY SVGNEST:')
    const actualConfig = window.SvgNest.config()
    
    // Organize config into categories
    const geometrySettings = ['spacing', 'curveTolerance', 'clipperScale']
    const algorithmSettings = ['rotations', 'populationSize', 'mutationRate', 'exploreConcave', 'useHoles']
    
    console.log('\n  Geometry Settings:')
    geometrySettings.forEach(key => {
      if (actualConfig[key] !== undefined) {
        console.log(`    ${key}: ${actualConfig[key]}`)
      }
    })
    
    console.log('\n  Algorithm Settings:')
    algorithmSettings.forEach(key => {
      if (actualConfig[key] !== undefined) {
        const value = typeof actualConfig[key] === 'boolean' ? (actualConfig[key] ? 'enabled' : 'disabled') : actualConfig[key]
        console.log(`    ${key}: ${value}`)
      }
    })
    
    // Show any other config values
    const knownKeys = [...geometrySettings, ...algorithmSettings]
    const otherKeys = Object.keys(actualConfig).filter(k => !knownKeys.includes(k))
    if (otherKeys.length > 0) {
      console.log('\n  Other Settings:')
      otherKeys.forEach(key => {
        console.log(`    ${key}: ${actualConfig[key]}`)
      })
    }
    
    // Log bin information
    const binElement = document.querySelector('#select svg polygon.active') || document.querySelector('#select svg polygon#bin')
    if (binElement) {
      const binPoints = binElement.getAttribute('points')
      const pointArray = binPoints.split(' ').map(p => {
        const [x, y] = p.split(',').map(parseFloat)
        return { x, y }
      })
      const binWidth = Math.max(...pointArray.map(p => p.x)) - Math.min(...pointArray.map(p => p.x))
      const binHeight = Math.max(...pointArray.map(p => p.y)) - Math.min(...pointArray.map(p => p.y))
      
      console.log('\n📦 BIN INFORMATION:')
      console.log(`  Dimensions: ${binWidth.toFixed(2)} × ${binHeight.toFixed(2)} px`)
      console.log(`  Area: ${(binWidth * binHeight).toFixed(2)} px²`)
      console.log(`  Points: ${pointArray.length}`)
    }
    
    // Log shapes information
    const shapeElements = document.querySelectorAll('#select svg polygon:not(#bin):not(.active)')
    console.log('\n🔷 SHAPES INFORMATION:')
    console.log(`  Total shapes: ${shapeElements.length}`)
    
    if (shapeElements.length > 0) {
      const shapesData = []
      shapeElements.forEach((shape, i) => {
        const points = shape.getAttribute('points')
        const pointArray = points.split(' ').map(p => {
          const [x, y] = p.split(',').map(parseFloat)
          return { x, y }
        })
        const width = Math.max(...pointArray.map(p => p.x)) - Math.min(...pointArray.map(p => p.x))
        const height = Math.max(...pointArray.map(p => p.y)) - Math.min(...pointArray.map(p => p.y))
        const area = calculatePolygonArea(pointArray)
        
        shapesData.push({
          index: i,
          id: shape.getAttribute('id') || `shape-${i}`,
          points: pointArray.length,
          width: width.toFixed(2),
          height: height.toFixed(2),
          area: Math.abs(area).toFixed(2)
        })
      })
      
      // Calculate total area
      const totalShapeArea = shapesData.reduce((sum, s) => sum + parseFloat(s.area), 0)
      console.log(`  Total shape area: ${totalShapeArea.toFixed(2)} px²`)
      
      // Show first 5 shapes for inspection
      console.log('\n  First 5 shapes (for inspection):')
      shapesData.slice(0, 5).forEach(shape => {
        console.log(`    [${shape.index}] ${shape.id}: ${shape.width}×${shape.height}px, ${shape.points} points, area: ${shape.area}px²`)
      })
      
      if (shapeElements.length > 5) {
        console.log(`  ... and ${shapeElements.length - 5} more shapes`)
      }
    }
    
    console.log('\n========================================\n')
    
    // Reset best solution tracker and session metadata
    bestSolutionRef.current = { bins: null, fitness: Infinity }
    
    // Initialize session metadata
    sessionMetadataRef.current = {
      startTime: new Date(),
      endTime: null,
      totalShapes: shapeElements.length,
      config: actualConfig
    }
    
    window.SvgNest.start(progress, renderSvg)
    setIsWorking(true)

    const svg = document.querySelector('#select svg')
    if (svg) {
      svg.removeAttribute('style')
    }

    return { success: true }
  }, [progress, renderSvg])

  const stopNest = useCallback(() => {
    console.log('Stopping nest')
    
    if (window.SvgNest) {
      window.SvgNest.stop()
    }
    
    // Generate debug summary
    sessionMetadataRef.current.endTime = new Date()
    const elapsedMs = sessionMetadataRef.current.endTime - sessionMetadataRef.current.startTime
    const elapsedSec = (elapsedMs / 1000).toFixed(2)
    
    // Extract best solution data
    const bestSolution = bestSolutionRef.current
    const binsElement = binsRef.current
    
    // Count placed shapes from bins
    let totalPlaced = 0
    let binCount = 0
    if (binsElement && binsElement.children.length > 0) {
      binCount = binsElement.children.length
      for (let i = 0; i < binsElement.children.length; i++) {
        const bin = binsElement.children[i]
        const shapes = bin.querySelectorAll('polygon:not(#bin)')
        totalPlaced += shapes.length
      }
    }
    
    // Calculate efficiency from bins
    let efficiency = 0
    if (binsElement && binsElement.children.length > 0) {
      const efficiencyDisplay = document.getElementById('info_efficiency_display')
      if (efficiencyDisplay && efficiencyDisplay.innerHTML) {
        efficiency = parseInt(efficiencyDisplay.innerHTML) || 0
      }
    }
    
    // Create comprehensive debug summary
    const debugSummary = {
      // Session timing
      timing: {
        started: sessionMetadataRef.current.startTime?.toLocaleTimeString(),
        stopped: sessionMetadataRef.current.endTime?.toLocaleTimeString(),
        elapsedSeconds: parseFloat(elapsedSec),
        elapsedFormatted: `${elapsedSec}s`
      },
      
      // Shapes info
      shapes: {
        total: sessionMetadataRef.current.totalShapes,
        placed: totalPlaced,
        unplaced: sessionMetadataRef.current.totalShapes - totalPlaced,
        placementRate: sessionMetadataRef.current.totalShapes > 0 
          ? `${((totalPlaced / sessionMetadataRef.current.totalShapes) * 100).toFixed(1)}%`
          : 'N/A'
      },
      
      // Performance metrics
      performance: {
        iterations: iterations,
        iterationsPerSecond: elapsedSec > 0 ? (iterations / parseFloat(elapsedSec)).toFixed(1) : 'N/A',
        efficiency: `${efficiency}%`,
        fitness: bestSolution.fitness !== Infinity ? bestSolution.fitness.toFixed(3) : 'N/A'
      },
      
      // Results
      results: {
        binsUsed: binCount,
        bestSolutionFitness: bestSolution.fitness !== Infinity ? bestSolution.fitness : null,
        downloadReady: downloadReady
      },
      
      // Configuration snapshot
      configuration: sessionMetadataRef.current.config,
      
      // Best solution object (inspectable)
      bestSolution: {
        fitness: bestSolution.fitness,
        binsHTML: bestSolution.bins ? 'Available in DOM' : 'Not captured',
        rawObject: bestSolution
      }
    }
    
    // Log the summary
    console.log('\n========================================')
    console.log('🏁 NESTING SESSION SUMMARY')
    console.log('========================================')
    console.log('\n⏱️  TIMING:')
    console.log(`   Started: ${debugSummary.timing.started}`)
    console.log(`   Stopped: ${debugSummary.timing.stopped}`)
    console.log(`   Elapsed: ${debugSummary.timing.elapsedFormatted}`)
    
    console.log('\n📊 RESULTS:')
    console.log(`   Shapes placed: ${debugSummary.shapes.placed}/${debugSummary.shapes.total} (${debugSummary.shapes.placementRate})`)
    console.log(`   Bins used: ${debugSummary.results.binsUsed}`)
    console.log(`   Efficiency: ${debugSummary.performance.efficiency}`)
    console.log(`   Fitness: ${debugSummary.performance.fitness}`)
    
    console.log('\n⚡ PERFORMANCE:')
    console.log(`   Iterations: ${debugSummary.performance.iterations}`)
    console.log(`   Rate: ${debugSummary.performance.iterationsPerSecond} iterations/sec`)
    
    console.log('\n📦 Full Debug Object (inspectable):')
    console.log(debugSummary)
    console.log('========================================\n')
    
    setIsWorking(false)
  }, [iterations, downloadReady])

  const handleDownload = useCallback(() => {
    const bins = binsRef.current
    if (bins.children.length === 0) {
      return { success: false, message: 'No SVG to export' }
    }

    let svgstring = ''
    for (let i = 0; i < bins.children.length; i++) {
      svgstring += bins.children[i].outerHTML + '\n'
    }

    const blob = new Blob([svgstring], {type: 'text/plain;charset=utf-8'})
    if (window.saveAs) {
      window.saveAs(blob, 'nest.svg')
      return { success: true, message: 'SVG downloaded successfully' }
    } else {
      return { success: false, message: 'Download not available' }
    }
  }, [])

  const resetProgress = useCallback(() => {
    // Reset state
    setIsWorking(false)
    setPrevPercent(0)
    setStartTime(null)
    setIterations(0)
    setDownloadReady(false)
    
    // Reset best solution
    bestSolutionRef.current = { bins: null, fitness: Infinity }
    
    // Clear progress panel UI
    const progressBar = document.getElementById('info_progress_bar')
    const timeDisplay = document.getElementById('info_time')
    const iterationsDisplay = document.getElementById('info_iterations_display')
    const efficiencyDisplay = document.getElementById('info_efficiency_display')
    const placedDisplay = document.getElementById('info_placed_display')
    const placementDisplay = document.getElementById('placement-display')
    const infoPanel = document.getElementById('progress-panel')
    
    if (progressBar) {
      progressBar.style.width = '0%'
      progressBar.setAttribute('aria-valuenow', '0')
    }
    if (timeDisplay) {
      timeDisplay.innerHTML = ''
      timeDisplay.style.display = 'none'
    }
    if (iterationsDisplay) {
      iterationsDisplay.innerHTML = '0'
    }
    if (efficiencyDisplay) {
      efficiencyDisplay.innerHTML = '0'
    }
    if (placedDisplay) {
      placedDisplay.innerHTML = '0/0'
    }
    if (placementDisplay) {
      placementDisplay.style.display = 'none'
    }
    if (infoPanel) {
      infoPanel.style.display = 'none'
    }
  }, [])

  return {
    // State
    isWorking,
    downloadReady,
    binSelected,
    setBinSelected,
    iterations,
    
    // Refs
    displayRef,
    binsRef,
    
    // Functions
    startNest,
    stopNest,
    handleDownload,
    attachSvgListeners,
    progress,
    renderSvg,
    resetProgress
  }
}