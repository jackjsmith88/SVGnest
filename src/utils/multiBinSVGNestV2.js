/**
 * Multi-Bin SVGnest Runner V2 - Native Multi-Bin Support
 * 
 * Uses SVGnest's NATIVE multi-bin capability instead of sequential approach.
 * SVGnest automatically creates multiple bins via placementworker's while(paths.length > 0) loop.
 * Returns placement[] array with one element per bin.
 * 
 * Key differences from V1:
 * - Runs SVGnest.start() ONCE with ALL shapes (not sequentially per bin)
 * - SVGnest's genetic algorithm optimizes across all bins simultaneously
 * - placementworker.js creates new bins automatically until all shapes are placed
 */

import { DimensionShape } from './DimensionShape.js'

/**
 * Convert DimensionShape objects to SVG string for SVGnest
 * @param {Array} shapes - Array of shape objects with dimensionShape property
 * @param {number} binWidth - Bin width in pixels
 * @param {number} binHeight - Bin height in pixels
 */
export function shapesToSVG(shapes, binWidth, binHeight) {
  console.log(`shapesToSVG: Converting ${shapes.length} shapes to SVG`)
  console.log(`Bin dimensions: ${binWidth}x${binHeight}`)
  
  // Calculate scale factor: convert from mm to pixels to fit in bin
  // Find max dimension from all shapes
  let maxShapeWidth = 0
  let maxShapeHeight = 0
  shapes.forEach(shape => {
    if (shape.dimensionShape) {
      maxShapeWidth = Math.max(maxShapeWidth, shape.dimensionShape.length || 0)
      maxShapeHeight = Math.max(maxShapeHeight, shape.dimensionShape.width || 0)
    }
  })
  
  // Scale to fit: use 80% of bin for safety margin
  const scaleX = (binWidth * 0.8) / maxShapeWidth
  const scaleY = (binHeight * 0.8) / maxShapeHeight
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
  
  console.log(`Shape dimensions (mm): max ${maxShapeWidth}x${maxShapeHeight}`)
  console.log(`Scale factor: ${scale.toFixed(4)}`)
  
  // Layout shapes in a grid to avoid overlapping in initial SVG
  // SVGnest needs to see each shape separately
  let currentX = 10
  let currentY = 10
  let rowHeight = 0
  const spacing = 10
  
  const svgParts = shapes.map((shape, index) => {
    if (shape.type === 'dimensionshape' && shape.dimensionShape) {
      // Get the polygon points from DimensionShape (in mm)
      const points = shape.dimensionShape.getPolygonPoints()
      
      // Scale points to pixels and offset them for initial layout
      const scaledPoints = points.map(p => ({
        x: p.x * scale + currentX,
        y: p.y * scale + currentY
      }))
      
      const pointsStr = scaledPoints.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
      
      // Update layout position for next shape
      const shapeWidth = shape.dimensionShape.length * scale
      const shapeHeight = shape.dimensionShape.width * scale
      
      rowHeight = Math.max(rowHeight, shapeHeight)
      currentX += shapeWidth + spacing
      
      // Wrap to next row if needed
      if (currentX + shapeWidth > binWidth * 3) {
        currentX = 10
        currentY += rowHeight + spacing
        rowHeight = 0
      }
      
      console.log(`  Shape ${index}: ${shape.dimensionShape.type}, area: ${(shapeWidth * shapeHeight).toFixed(2)}`)
      
      // Create a polygon element with unique ID
      return `<polygon id="shape-${index}" points="${pointsStr}" fill="hsl(${index * 360 / shapes.length}, 70%, 60%)" stroke="#333" stroke-width="1"/>`
    } else {
      // Fallback: create rectangle from bounding box
      const w = (shape.width || 50) * scale
      const h = (shape.height || 50) * scale
      
      const rect = `<rect id="shape-${index}" x="${currentX}" y="${currentY}" width="${w}" height="${h}" fill="hsl(${index * 360 / shapes.length}, 70%, 60%)" stroke="#333" stroke-width="1"/>`
      
      rowHeight = Math.max(rowHeight, h)
      currentX += w + spacing
      
      if (currentX + w > binWidth * 3) {
        currentX = 10
        currentY += rowHeight + spacing
        rowHeight = 0
      }
      
      console.log(`  Shape ${index}: fallback rect ${w.toFixed(2)}x${h.toFixed(2)}`)
      return rect
    }
  })

  // Create bin outline (will be selected as the bin)
  const binOutline = `<rect id="bin" width="${binWidth}" height="${binHeight}" fill="none" stroke="#3bb34a" stroke-width="2"/>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${binWidth}" height="${binHeight}">
    ${binOutline}
    ${svgParts.join('\n    ')}
  </svg>`
  
  console.log('Generated SVG (first 500 chars):', svg.substring(0, 500) + '...')
  
  return svg
}

/**
 * Extract which shape IDs were successfully placed in each bin from SVG result
 * @param {Element} svgElement - SVG DOM element with placed shapes
 * @returns {Array} Array of shape IDs found in this bin
 */
function extractPlacedShapeIds(svgElement) {
  const ids = []
  
  // SVG contains transformed groups with the shapes
  const groups = svgElement.querySelectorAll('g[transform]')
  groups.forEach(group => {
    const shapeElements = group.querySelectorAll('[id^="shape-"]')
    shapeElements.forEach(el => {
      const id = el.getAttribute('id')
      if (id && !ids.includes(id)) {
        ids.push(id)
      }
    })
  })
  
  // Also check direct children (shouldn't be there but just in case)
  const directShapes = svgElement.querySelectorAll('[id^="shape-"]:not(g [id^="shape-"])')
  directShapes.forEach(el => {
    const id = el.getAttribute('id')
    if (id && !ids.includes(id)) {
      ids.push(id)
    }
  })
  
  return ids
}

/**
 * Run multi-bin packing using SVGnest's NATIVE multi-bin capability
 * 
 * SIMPLE APPROACH - Just like single-bin mode:
 * 1. Insert SVG into DOM
 * 2. Use window.SvgNest.setbin() 
 * 3. Call window.SvgNest.start()
 * 4. SVGnest handles everything including multi-bin
 * 
 * @param {Array} shapes - All shapes to pack
 * @param {number} binWidth - Bin width in pixels  
 * @param {number} binHeight - Bin height in pixels
 * @param {number} maxBins - Maximum bins allowed (unused - SVGnest decides)
 * @param {number} timeLimit - How long to run optimization in seconds
 * @param {Object} callbacks - { onProgress, onBestFound, onIterationUpdate }
 * @returns {Promise} Result object with bins array and statistics
 */
export async function runMultiBinSVGNest(
  shapes, 
  binWidth, 
  binHeight, 
  maxBins = 10,
  timeLimit = 30,
  callbacks = {}
) {
  const { onProgress, onBestFound, onIterationUpdate } = callbacks
  
  console.log(`\n=== Multi-Bin Packing with SVGnest (Native Mode) ===`)
  console.log(`Shapes: ${shapes.length}, Bin: ${binWidth}x${binHeight}, Time: ${timeLimit}s`)
  
  if (!window.SvgNest) {
    throw new Error('SVGnest not loaded. Make sure svgnest.js is included.')
  }

  // Stop any existing SVGnest work to start fresh
  if (window.SvgNest.working) {
    console.log('Stopping existing SVGnest process...')
    window.SvgNest.stop()
  }

  // Create single SVG with ALL shapes
  const svgString = shapesToSVG(shapes, binWidth, binHeight)
  
  // Insert into DOM (just like single-bin mode)
  const container = document.createElement('div')
  container.id = 'multibin-temp-container'
  container.style.display = 'none'
  container.innerHTML = svgString
  document.body.appendChild(container)

  try {
    const svg = container.querySelector('svg')
    const bin = container.querySelector('#bin')
    
    if (!svg || !bin) {
      throw new Error('SVG or bin element not found')
    }

    console.log(`Found SVG with ${svg.querySelectorAll('[id^="shape-"]').length} shapes`)
    console.log(`Bin element:`, bin)

    // Parse SVG with SVGnest - this sets the internal 'svg' variable
    const parsed = window.SvgNest.parsesvg(svg.outerHTML)
    console.log('SVG parsed:', parsed)
    
    // Now find the bin in the parsed result
    const parsedBin = parsed.querySelector('#bin')
    if (!parsedBin) {
      throw new Error('Bin not found in parsed SVG')
    }

    // Set the bin - this only works after parsesvg
    window.SvgNest.setbin(parsedBin)
    console.log('Bin set successfully')

    // Configure SVGnest - use same defaults as single-bin mode
    window.SvgNest.config({
      spacing: 0,           // No spacing (same as single-bin default)
      rotations: 4,         // Try 4 rotations (0°, 90°, 180°, 270°)
      populationSize: 10,   // Default population (NOT 50 - that's too slow!)
      mutationRate: 10,     // Default mutation rate
      useHoles: false,      // Don't use holes (adds complexity)
      exploreConcave: false // Don't explore concave (adds complexity)
    })

    let bestResult = null
    let iterations = 0
    let callbackCount = 0
    let startTime = Date.now()

    // Promise wrapper for SVGnest
    const nestPromise = new Promise((resolve, reject) => {
      // Auto-stop timer
      const stopTimer = setTimeout(() => {
        console.log(`Time limit reached (${timeLimit}s)`)
        window.SvgNest.stop()
        resolve(bestResult)
      }, timeLimit * 1000)

      // Start SVGnest - just like single-bin mode
      window.SvgNest.start(
        (progress) => {
          // Progress callback
          if (onProgress) {
            onProgress(progress)
          }
        },
        (svglist, efficiency, placedCount, totalCount) => {
          // Display callback
          callbackCount++
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
          
          if (svglist && svglist.length > 0) {
            // NEW SOLUTION FOUND
            iterations++
            
            // svglist is an ARRAY - one SVG element per bin!
            const binsUsed = svglist.length
            
            console.log(`[${elapsed}s] Iteration ${iterations}: ${placedCount}/${totalCount} placed in ${binsUsed} bin(s), ${(efficiency * 100).toFixed(1)}% efficiency`)
            
            bestResult = {
              svglist: svglist,
              binsUsed: binsUsed,
              efficiency: efficiency,
              placedCount: placedCount,
              totalCount: totalCount,
              unplacedCount: totalCount - placedCount,
              iterations: iterations,
              callbacks: callbackCount,
              elapsed: parseFloat(elapsed)
            }
            
            // Callback with first bin SVG for backward compatibility with UI
            if (onBestFound) {
              onBestFound(svglist[0], efficiency, placedCount, totalCount, iterations, binsUsed)
            }
          }
          
          // Always send iteration update
          if (onIterationUpdate) {
            onIterationUpdate(svglist ? svglist[0] : null)
          }
        }
      )
      
      // Handle stop event (if SVGnest has it)
      if (window.SvgNest.onstop) {
        window.SvgNest.onstop = () => {
          clearTimeout(stopTimer)
          resolve(bestResult)
        }
      }
    })

    const result = await nestPromise

    if (!result) {
      throw new Error('No solution found')
    }

    // Parse multi-bin results
    const bins = result.svglist.map((svgElement, binIndex) => {
      const placedShapeIds = extractPlacedShapeIds(svgElement)
      
      const binShapes = placedShapeIds.map(id => {
        const shapeIndex = parseInt(id.replace('shape-', ''))
        if (shapeIndex >= 0 && shapeIndex < shapes.length) {
          return {
            ...shapes[shapeIndex],
            binAssigned: binIndex,
            originalIndex: shapeIndex
          }
        }
        return null
      }).filter(s => s !== null)
      
      // Use SVGnest's efficiency (based on bounding box tightness)
      // Don't recalculate - SVGnest already provides the correct efficiency
      const binEfficiency = result.efficiency
      
      return {
        binIndex,
        width: binWidth,
        height: binHeight,
        shapes: binShapes,
        svg: svgElement, // Keep as DOM element for UI
        placedCount: binShapes.length,
        efficiency: binEfficiency,
        iterations: result.iterations // Share total iterations across all bins
      }
    })

    const totalPlaced = bins.reduce((sum, bin) => sum + bin.placedCount, 0)
    
    console.log(`\n=== Multi-Bin Result ===`)
    console.log(`Bins used: ${result.binsUsed}`)
    console.log(`Total placed: ${totalPlaced}/${shapes.length}`)
    console.log(`Efficiency: ${(result.efficiency * 100).toFixed(1)}%`)
    console.log(`Iterations: ${result.iterations}`)
    console.log(`Callbacks: ${result.callbacks}`)
    console.log(`Elapsed: ${result.elapsed}s`)
    
    return {
      bins,
      binsUsed: result.binsUsed,
      totalShapes: shapes.length,
      placedShapes: totalPlaced,
      unplacedShapes: shapes.length - totalPlaced,
      binEfficiency: result.efficiency * 100,
      iterations: result.iterations,
      callbacks: result.callbacks,
      elapsed: result.elapsed
    }

  } finally {
    // Cleanup
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
  }
}
