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

  // Cleanup on unmount or when component is no longer needed
  useEffect(() => {
    return () => {
      console.log('useSVGNest: Cleaning up on unmount')
      if (window.SvgNest && isWorking) {
        window.SvgNest.stop()
      }
    }
  }, [isWorking])

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
    
    if (Object.keys(config).length > 0) {
      console.log('Applying config before nest:', config)
      window.SvgNest.config(config)
    }
    
    // Reset best solution tracker
    bestSolutionRef.current = { bins: null, fitness: Infinity }
    
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
    
    setIsWorking(false)
  }, [])

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
    renderSvg
  }
}