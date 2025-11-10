import { useState, useRef, useCallback } from 'react'
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

  // Define progress and renderSvg functions first
  const progress = useCallback((percent) => {
    const transition = percent > prevPercent ? '; transition: width 0.1s' : ''
    const progressBar = document.getElementById('info_progress')
    const infoPanel = document.getElementById('info')
    const timeDisplay = document.getElementById('info_time')
    
    if (progressBar) {
      progressBar.setAttribute('style', 'width: ' + Math.round(percent * 100) + '% ' + transition)
    }
    if (infoPanel) {
      infoPanel.setAttribute('style', 'display: block')
    }

    setPrevPercent(percent)

    const now = new Date().getTime()
    if (startTime && now && timeDisplay) {
      const diff = now - startTime
      const estimate = (diff / percent) * (1 - percent)
      timeDisplay.innerHTML = millisecondsToStr(estimate) + ' remaining'

      if (diff > 5000 && percent < 0.3 && percent > 0.02 && estimate > 10000) {
        timeDisplay.setAttribute('style', 'display: block')
      }
    }

    if (timeDisplay) {
      if (percent > 0.95 || percent < 0.02) {
        timeDisplay.setAttribute('style', 'display: none')
      }
    }
    
    if (percent < 0.02) {
      setStartTime(new Date().getTime())
    }
  }, [prevPercent, startTime])

  const renderSvg = useCallback((svglist, efficiency, placed, total) => {
    setIterations(prev => {
      const newIterations = prev + 1
      const iterationsDisplay = document.getElementById('info_iterations')
      if (iterationsDisplay) {
        iterationsDisplay.innerHTML = newIterations
      }
      return newIterations
    })

    if (!svglist || svglist.length === 0) {
      return
    }

    if (binsRef.current) {
      binsRef.current.innerHTML = ''

      for (let i = 0; i < svglist.length; i++) {
        if (svglist.length > 2) {
          svglist[i].setAttribute('class', 'grid')
        }
        binsRef.current.appendChild(svglist[i])
      }
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
      placementDisplay.setAttribute('style', 'display: block')
    }
    
    if (displayRef.current) {
      displayRef.current.setAttribute('style', 'display: none')
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
            console.log('=== SETBIN DEBUG ===')
            console.log('Setting bin element:', this.tagName, this)
            
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
    console.log('=== START NEST DEBUG ===')
    console.log('Starting nest with callbacks:', { progress, renderSvg })
    
    if (!window.SvgNest) {
      console.error('SvgNest not available')
      return { success: false, message: 'SVGnest not loaded' }
    }
    
    // DEBUG: Check what's in the select element
    const selectElement = document.getElementById('select')
    if (selectElement) {
      console.log('Select element children:', selectElement.children.length)
      console.log('Select SVG child count:', selectElement.querySelector('svg')?.childNodes.length)
      const svgEl = selectElement.querySelector('svg')
      if (svgEl) {
        console.log('SVG children types:', Array.from(svgEl.childNodes).map((n, i) => `${i}: ${n.tagName || 'text'}`))
      }
    }
    
    // DEBUG: Add callback to log what applyPlacement receives
    const originalRenderSvg = renderSvg
    const debugRenderSvg = function(svglist, efficiency, placed, total) {
      console.log('🔵 RENDERSVG CALLED')
      console.log('SVG list length:', svglist?.length)
      if (svglist && svglist[0]) {
        console.log('First SVG children:', svglist[0].childNodes.length)
        console.log('First SVG child types:', Array.from(svglist[0].childNodes).map((n, i) => `${i}: ${n.tagName || n.nodeType}`))
        
        // Inspect the first few g groups to see what's inside
        const gGroups = Array.from(svglist[0].childNodes).filter(n => n.tagName === 'g')
        console.log('🔍 Inspecting first 5 g groups:')
        for (let i = 0; i < Math.min(5, gGroups.length); i++) {
          const g = gGroups[i]
          console.log(`  G[${i}]:`, g.childNodes.length, 'children -', 
            Array.from(g.childNodes).map(c => c.tagName || c.nodeType).join(', '))
          if (g.childNodes[0]) {
            console.log(`    First child:`, g.childNodes[0].tagName, g.childNodes[0].outerHTML?.substring(0, 150))
          }
        }
      }
      return originalRenderSvg(svglist, efficiency, placed, total)
    }
    
    window.SvgNest.start(progress, debugRenderSvg)
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