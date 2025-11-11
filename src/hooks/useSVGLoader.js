import { useCallback } from 'react'

/**
 * Hook for loading and parsing SVG files with shape duplication
 */
export function useSVGLoader({ 
  displayRef, 
  attachSvgListeners, 
  setBinSelected,
  setMessage,
  setMessageClass,
  MESSAGE_TYPES
}) {
  
  /**
   * Detect bin element in SVG (largest rect or element with 'bin' in id)
   */
  const detectBinElement = useCallback((svg) => {
    const rects = svg.querySelectorAll('rect')
    let binElement = null
    
    rects.forEach(rect => {
      const width = parseFloat(rect.getAttribute('width'))
      const height = parseFloat(rect.getAttribute('height'))
      // Bin is typically much larger (>400px width or >300px height)
      if (width > 400 || height > 300) {
        binElement = rect
      }
    })
    
    return binElement
  }, [])

  /**
   * Collect all shape elements (excluding bin)
   */
  const collectShapes = useCallback((svg, binElement) => {
    const shapes = []
    const allElements = svg.querySelectorAll('*')
    
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
    
    return shapes
  }, [])

  /**
   * Duplicate shapes based on multiplier
   */
  const duplicateShapes = useCallback((svg, shapes, multiplier) => {
    if (multiplier <= 1) return
    
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
  }, [])

  /**
   * Load demo SVG with optional shape multiplication
   */
  const loadDemo = useCallback((multiplier = 1) => {
    console.log(`Loading demo with ${multiplier}x multiplier`)
    
    if (!window.SvgNest) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }

    const displayElement = displayRef.current
    if (!displayElement) return false

    try {
      const svg = window.SvgNest.parsesvg(displayElement.innerHTML)
      
      if (multiplier > 1) {
        const binElement = detectBinElement(svg)
        const shapes = collectShapes(svg, binElement)
        console.log(`Found ${shapes.length} shapes, duplicating ${multiplier - 1} times`)
        duplicateShapes(svg, shapes, multiplier)
        console.log(`Total shapes after duplication: ${shapes.length * multiplier}`)
      }
      
      displayElement.innerHTML = ''
      displayElement.appendChild(svg)
      attachSvgListeners(svg)
      
      const totalShapes = svg.querySelectorAll('polygon, rect, path, polyline').length
      setMessage(`Demo loaded with ${totalShapes} shapes. Click on the outline to use as the bin`)
      setMessageClass(MESSAGE_TYPES.SUCCESS)
      return true
    } catch (e) {
      setMessage(e.toString())
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }
  }, [displayRef, attachSvgListeners, setMessage, setMessageClass, MESSAGE_TYPES, detectBinElement, collectShapes, duplicateShapes])

  /**
   * Load custom SVG file with optional shape multiplication
   */
  const loadCustomFile = useCallback((svgContent, multiplier = 1) => {
    console.log(`Loading custom SVG with ${multiplier}x multiplier`)
    
    if (!window.SvgNest) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }

    const displayElement = displayRef.current
    if (!displayElement) return false

    try {
      const svg = window.SvgNest.parsesvg(svgContent)
      
      if (multiplier > 1) {
        const binElement = detectBinElement(svg)
        const shapes = collectShapes(svg, binElement)
        duplicateShapes(svg, shapes, multiplier)
      }
      
      displayElement.innerHTML = ''
      displayElement.appendChild(svg)
      attachSvgListeners(svg)
      
      const totalShapes = svg.querySelectorAll('polygon, rect, path, polyline').length
      setMessage(`Custom SVG loaded with ${totalShapes} shapes. Click on the outline to use as the bin`)
      setMessageClass(MESSAGE_TYPES.SUCCESS)
      return true
    } catch (e) {
      setMessage(`Error loading SVG: ${e.toString()}`)
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }
  }, [displayRef, attachSvgListeners, setMessage, setMessageClass, MESSAGE_TYPES, detectBinElement, collectShapes, duplicateShapes])

  /**
   * Load custom shapes from CustomShapeBuilder
   */
  const loadCustomShapes = useCallback((svgString) => {
    console.log('Custom shapes generated:', svgString.length, 'chars')
    
    if (!window.SvgNest) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }
    
    const displayElement = displayRef.current
    if (!displayElement) {
      setMessage('Display element not found')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }

    try {
      // Clear display and reset state
      displayElement.innerHTML = ''
      setBinSelected(false)

      // Parse the SVG string
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgString, 'image/svg+xml')
      const svg = doc.documentElement

      if (svg.tagName !== 'svg') {
        setMessage('Invalid SVG generated')
        setMessageClass(MESSAGE_TYPES.ERROR)
        return false
      }

      // Let SvgNest parse it
      displayElement.appendChild(svg)
      const parsedSvg = window.SvgNest.parsesvg(displayElement.innerHTML)
      
      displayElement.innerHTML = ''
      displayElement.appendChild(parsedSvg)
      
      // Log shape details
      const allElements = parsedSvg.querySelectorAll('polygon, rect, path, polyline')
      console.log(`Total elements after parsing: ${allElements.length}`)
      allElements.forEach((el, i) => {
        const points = el.getAttribute('points')
        if (points && i > 0 && i < 3) {
          const coords = points.split(' ').map(p => p.split(',').map(Number))
          const width = Math.max(...coords.map(p => p[0])) - Math.min(...coords.map(p => p[0]))
          const height = Math.max(...coords.map(p => p[1])) - Math.min(...coords.map(p => p[1]))
          console.log(`  [${i}] ${el.tagName} id="${el.getAttribute('id')}" width=${width.toFixed(2)}px height=${height.toFixed(2)}px`)
        } else {
          console.log(`  [${i}] ${el.tagName} id="${el.getAttribute('id')}"`)
        }
      })
      
      const binElement = allElements[0] // First element is the bin
      const totalShapes = allElements.length - 1
      
      // Auto-select the bin
      if (binElement && window.SvgNest) {
        binElement.setAttribute('class', 'bin')
        window.SvgNest.setbin(binElement)
        setBinSelected(true)
        console.log('Auto-selected bin from custom shapes, total shapes:', totalShapes)
      }
      
      // Re-apply styling to shapes (lost during parsing)
      allElements.forEach((el, i) => {
        if (i === 0) return // Skip bin
        
        el.setAttribute('fill', 'rgba(33, 150, 243, 0.3)')
        el.setAttribute('stroke', '#2196F3')
        el.setAttribute('stroke-width', '2')
        
        // Add number label
        const points = el.getAttribute('points')
        if (points) {
          const coords = points.split(' ').map(p => p.split(',').map(Number))
          const centerX = coords.reduce((sum, p) => sum + p[0], 0) / coords.length
          const centerY = coords.reduce((sum, p) => sum + p[1], 0) / coords.length
          
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          text.setAttribute('x', centerX)
          text.setAttribute('y', centerY)
          text.setAttribute('font-size', '24')
          text.setAttribute('font-weight', 'bold')
          text.setAttribute('fill', '#1976D2')
          text.setAttribute('text-anchor', 'middle')
          text.setAttribute('dominant-baseline', 'middle')
          text.textContent = i
          
          parsedSvg.appendChild(text)
        }
      })
      
      attachSvgListeners(parsedSvg)
      
      setMessage(`Custom shapes loaded: ${totalShapes} shapes ready for nesting. Click Start to begin!`)
      setMessageClass(MESSAGE_TYPES.SUCCESS)
      return true
    } catch (e) {
      setMessage(`Error loading custom shapes: ${e.toString()}`)
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }
  }, [displayRef, attachSvgListeners, setBinSelected, setMessage, setMessageClass, MESSAGE_TYPES])

  return {
    loadDemo,
    loadCustomFile,
    loadCustomShapes
  }
}
