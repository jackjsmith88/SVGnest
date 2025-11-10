/**
 * Multi-Bin SVGnest Runner
 * Wraps the single-bin SVGnest algorithm to work across multiple bins
 * Uses iterative approach: pack bin 1, then bin 2 with remaining shapes, etc.
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
 * Run SVGnest once on a single bin with given shapes
 * Returns promise that resolves when complete or timeout
 */
export function runSVGNestOnBin(shapes, binWidth, binHeight, timeoutSeconds = 30) {
  return new Promise((resolve, reject) => {
    if (!window.SvgNest) {
      reject(new Error('SVGnest not loaded'))
      return
    }

    // Convert shapes to SVG
    const svgString = shapesToSVG(shapes, binWidth, binHeight)
    
    // Create a temporary container
    const container = document.createElement('div')
    container.innerHTML = svgString
    container.style.display = 'none'
    document.body.appendChild(container)
    
    const svgElement = container.querySelector('svg')
    const binElement = container.querySelector('#bin')
    
    if (!svgElement || !binElement) {
      document.body.removeChild(container)
      reject(new Error('Failed to create SVG elements'))
      return
    }

    try {
      // Parse SVG with SVGnest
      const parsed = window.SvgNest.parsesvg(svgElement.outerHTML)
      
      // Set bin
      const parsedBin = parsed.querySelector('#bin')
      if (parsedBin) {
        window.SvgNest.setbin(parsedBin)
      } else {
        throw new Error('Bin element not found after parsing')
      }

      // Configure SVGnest settings
      window.SvgNest.config({
        spacing: 2, // 2px spacing between parts
        rotations: 4, // Try 0°, 90°, 180°, 270°
        populationSize: 10, // Genetic algorithm population size
        mutationRate: 10, // Mutation rate for GA
        useHoles: false, // Don't try to nest inside concave areas for now
        exploreConcave: false // Don't explore concave pockets for simpler/faster packing
      })

      let bestResult = null
      let iterations = 0

      // Start SVGnest
      window.SvgNest.start(
        (progress) => {
          // Progress callback
          console.log(`Bin packing progress: ${Math.round(progress * 100)}%`)
        },
        (svglist, efficiency, placedCount, totalCount) => {
          // Display callback - called when better solution found
          iterations++
          
          if (svglist && svglist.length > 0) {
            bestResult = {
              svg: svglist[0],
              efficiency,
              placedCount,
              totalCount,
              unplacedCount: totalCount - placedCount,
              iterations
            }
            console.log(`SVGnest iteration ${iterations}: ${placedCount}/${totalCount} placed, ${(efficiency * 100).toFixed(1)}% efficiency`)
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
 * Run multi-bin packing using SVGnest iteratively
 * This is the main entry point for multi-bin with SVGnest
 */
export async function runMultiBinSVGNest(
  shapes, 
  binWidth, 
  binHeight, 
  maxBins = 10,
  timePerBin = 30,
  onBinComplete = null
) {
  const bins = []
  let remainingShapes = [...shapes]
  let binIndex = 0

  while (remainingShapes.length > 0 && binIndex < maxBins) {
    console.log(`\n=== Packing Bin ${binIndex + 1} with ${remainingShapes.length} shapes ===`)
    
    try {
      const result = await runSVGNestOnBin(
        remainingShapes,
        binWidth,
        binHeight,
        timePerBin
      )

      if (result.placedCount === 0) {
        console.warn(`No shapes fit in bin ${binIndex + 1}. Stopping.`)
        break
      }

      // Store bin result
      const binResult = {
        binIndex,
        width: binWidth,
        height: binHeight,
        shapes: result.placedShapes.map((shape, idx) => ({
          ...shape,
          // SVGnest handles positioning, we'll extract from SVG if needed
          binAssigned: binIndex
        })),
        svg: result.svg,
        efficiency: result.efficiency,
        placedCount: result.placedCount,
        iterations: result.iterations
      }

      bins.push(binResult)

      // Notify caller
      if (onBinComplete) {
        onBinComplete(binResult, binIndex, bins)
      }

      // Update remaining shapes
      remainingShapes = result.unplacedShapes
      binIndex++

      console.log(`Bin ${binIndex} complete: ${result.placedCount} shapes placed, ${result.unplacedCount} remaining`)

    } catch (error) {
      console.error(`Error packing bin ${binIndex + 1}:`, error)
      
      // If no solution found, it means remaining shapes don't fit
      // This is not really an error, just means we're done
      if (error.message === 'No solution found') {
        console.log(`Remaining ${remainingShapes.length} shapes do not fit in available bins`)
      }
      
      break
    }
  }

  // Calculate overall statistics
  const totalPlaced = bins.reduce((sum, bin) => sum + bin.placedCount, 0)
  const totalBinArea = bins.length * binWidth * binHeight
  const overallEfficiency = bins.reduce((sum, bin) => sum + bin.efficiency, 0) / bins.length

  return {
    bins,
    binsUsed: bins.length,
    totalBins: maxBins,
    totalShapes: shapes.length,
    placedShapes: totalPlaced,
    unplacedShapes: shapes.length - totalPlaced,
    binEfficiency: overallEfficiency * 100,
    totalBinArea,
    unplaced: remainingShapes
  }
}
