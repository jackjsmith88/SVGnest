/**
 * Multi-Bin SVGnest Runner
 * Uses SVGnest's NATIVE multi-bin capability
 * SVGnest automatically creates multiple bins via placementworker's while(paths.length > 0) loop
 * Returns placement[] array with one element per bin
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
 * Run multi-bin packing using SVGnest's NATIVE multi-bin capability
        throw new Error('Bin element not found after parsing')
      }

      // Configure SVGnest settings for better packing
      window.SvgNest.config({
        spacing: 2, // 2px spacing between parts
        rotations: 4, // Try 0°, 90°, 180°, 270° (more angles = slower but better)
        populationSize: 50, // Genetic algorithm population size (larger = better exploration, default is 10)
        mutationRate: 50, // Mutation rate for GA (higher = more exploration)
        useHoles: true, // Try to nest parts inside concave areas of other parts
        exploreConcave: true // Explore concave pockets for better nesting
      })

      let bestResult = null
      let iterations = 0
      let lastIterationSvg = null
      let callbackCount = 0

      // Start SVGnest
      window.SvgNest.start(
        (progress) => {
          // Progress callback - fires frequently as algorithm works
          if (onProgress) {
            onProgress(progress)
          }
        },
        (svglist, efficiency, placedCount, totalCount) => {
          // Display callback - called EVERY time an individual is evaluated
          callbackCount++
          
          if (svglist && svglist.length > 0) {
            // This is a new/better solution
            iterations++
            bestResult = {
              svg: svglist[0],
              efficiency,
              placedCount,
              totalCount,
              unplacedCount: totalCount - placedCount,
              iterations
            }
            console.log(`SVGnest iteration ${iterations}: ${placedCount}/${totalCount} placed, ${(efficiency * 100).toFixed(1)}% efficiency`)
            
            if (onBestFound) {
              onBestFound(svglist[0], efficiency, placedCount, totalCount, iterations)
            }
            
            // Store for iteration updates
            lastIterationSvg = svglist[0]
            
            // Send to iteration panel
            if (onIterationUpdate) {
              onIterationUpdate(svglist[0])
            }
          } else {
            // No improvement - but still update iteration panel to show activity
            // This fires VERY frequently (on every GA evaluation)
            if (onIterationUpdate && lastIterationSvg) {
              // Flash the last known solution to show the algorithm is working
              onIterationUpdate(lastIterationSvg)
            }
          }
        }
      )

      // Stop after timeout
      const timeout = setTimeout(() => {
        window.SvgNest.stop()
        
        // Clean up
        document.body.removeChild(container)
        
        if (bestResult) {
          // Extract which shapes were placed
          const placedShapeIds = extractPlacedShapeIds(bestResult.svg)
          
          console.log(`Extracted placed shape IDs: ${placedShapeIds.join(', ')}`)
          console.log(`SVGnest reports: ${bestResult.placedCount}/${bestResult.totalCount} placed`)
          console.log(`Actually found: ${placedShapeIds.length} shape elements in result SVG`)
          
          const placedShapes = shapes.filter((s, i) => placedShapeIds.includes(`shape-${i}`))
          const unplacedShapes = shapes.filter((s, i) => !placedShapeIds.includes(`shape-${i}`))
          
          console.log(`Placed: ${placedShapes.length}, Unplaced: ${unplacedShapes.length}`)
          
          resolve({
            ...bestResult,
            placedCount: placedShapes.length, // Override with actual count
            unplacedCount: unplacedShapes.length,
            placedShapes,
            unplacedShapes
          })
        } else {
          reject(new Error('No solution found'))
        }
      }, timeoutSeconds * 1000)

    } catch (error) {
      document.body.removeChild(container)
      reject(error)
    }
  })
}

/**
 * Extract which shape IDs were successfully placed from SVG result
 */
function extractPlacedShapeIds(svg) {
  const ids = []
  
  // SVG might contain transformed groups with the shapes
  const groups = svg.querySelectorAll('g')
  groups.forEach(group => {
    const shapeElements = group.querySelectorAll('[id^="shape-"]')
    shapeElements.forEach(el => {
      const id = el.getAttribute('id')
      if (id && !ids.includes(id)) {
        ids.push(id)
      }
    })
  })
  
  // Also check direct children
  const directShapes = svg.querySelectorAll('[id^="shape-"]')
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
 * SVGnest automatically creates multiple bins until all shapes are placed
 * This is the main entry point for multi-bin with SVGnest
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
  
  // Create single SVG with ALL shapes
  const svgString = shapesToSVG(shapes, binWidth, binHeight)
  
  // Initialize SvgNest in iframe
  if (!window.SvgNest) {
    throw new Error('SVGnest not loaded. Make sure svgnest.js is included.')
  }

  // Create iframe with SVG
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <script src="/geometryutil.js"></script>
        <script src="/svgparser.js"></script>
        <script src="/clipper.js"></script>
        <script src="/parallel.js"></script>
        <script src="/placementworker.js"></script>
        <script src="/svgnest.js"></script>
      </head>
      <body>
        <div id="select">${svgString}</div>
      </body>
      </html>
    `)
    iframeDoc.close()

    // Wait for scripts to load
    await new Promise(resolve => setTimeout(resolve, 500))

    const iframeWindow = iframe.contentWindow
    if (!iframeWindow.SvgNest) {
      throw new Error('SvgNest not available in iframe')
    }

    // Get bin element
    const svg = iframeDoc.querySelector('#select svg')
    const bin = iframeDoc.querySelector('#bin')
    
    if (!svg || !bin) {
      throw new Error('SVG or bin element not found after parsing')
    }

    // Configure SVGnest for multi-bin optimization
    iframeWindow.SvgNest.config({
      spacing: 2,
      rotations: 4, 
      populationSize: 50,
      mutationRate: 50,
      useHoles: true,
      exploreConcave: true
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
        iframeWindow.SvgNest.stop()
        resolve(bestResult)
      }, timeLimit * 1000)

      // Start SVGnest with ALL shapes - it will create multiple bins automatically
      iframeWindow.SvgNest.start(
        (progress) => {
          if (onProgress) {
            onProgress(progress)
          }
        },
        (svglist, efficiency, placedCount, totalCount) => {
          // Called whenever a new/better solution is found
          callbackCount++
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
          
          if (svglist && svglist.length > 0) {
            // NEW SOLUTION FOUND
            iterations++
            
            // svglist is an ARRAY - one SVG per bin!
            const binsUsed = svglist.length
            
            console.log(`[${elapsed}s] Iteration ${iterations}: ${placedCount}/${totalCount} placed in ${binsUsed} bin(s), ${(efficiency * 100).toFixed(1)}% efficiency`)
            
            bestResult = {
              svglist: svglist, // Array of SVG elements (one per bin)
              binsUsed: binsUsed,
              efficiency: efficiency,
              placedCount: placedCount,
              totalCount: totalCount,
              unplacedCount: totalCount - placedCount,
              iterations: iterations,
              callbacks: callbackCount,
              elapsed: parseFloat(elapsed)
            }
            
            if (onBestFound) {
              onBestFound(svglist, efficiency, placedCount, totalCount, iterations, binsUsed)
            }
          }
          
          // Always send iteration update (even if null = no improvement yet)
          if (onIterationUpdate) {
            onIterationUpdate(svglist)
          }
        }
      )
      
      // Handle stop event
      iframeWindow.SvgNest.onstop = () => {
        clearTimeout(stopTimer)
        resolve(bestResult)
      }
    })

    const result = await nestPromise

    if (!result) {
      throw new Error('No solution found')
    }

    // Parse multi-bin results
    const bins = result.svglist.map((svgElement, binIndex) => {
      // Extract placed shapes from this bin's SVG
      const binShapes = []
      const groups = svgElement.querySelectorAll('g[transform]')
      
      groups.forEach(group => {
        const shapeElement = group.querySelector('[id^="shape-"]')
        if (shapeElement) {
          const id = shapeElement.id
          const shapeIndex = parseInt(id.replace('shape-', ''))
          
          if (shapeIndex >= 0 && shapeIndex < shapes.length) {
            binShapes.push({
              ...shapes[shapeIndex],
              binAssigned: binIndex,
              transform: group.getAttribute('transform')
            })
          }
        }
      })
      
      return {
        binIndex,
        width: binWidth,
        height: binHeight,
        shapes: binShapes,
        svg: svgElement.outerHTML,
        placedCount: binShapes.length
      }
    })

    const totalPlaced = bins.reduce((sum, bin) => sum + bin.placedCount, 0)
    
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
    document.body.removeChild(iframe)
  }
}
