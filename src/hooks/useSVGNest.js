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

  const startNest = useCallback(() => {
    console.log('Starting nest with callbacks:', { progress, renderSvg })
    
    if (!window.SvgNest) {
      console.error('SvgNest not available')
      return { success: false, message: 'SVGnest not loaded' }
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
    progress,
    renderSvg
  }
}