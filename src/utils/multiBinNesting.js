/**
 * Multi-bin nesting utilities for testing with DimensionShape integration
 * This implementation focuses on 2D shape nesting optimization
 */

import { DimensionShape } from './DimensionShape.js'

/**
 * Create test shapes using DimensionShape class - only rectangles and L-shapes
 * Generates shapes based on length/width dimensions for 2D nesting
 */
export function createSimpleShapes(count, maxWidth, maxHeight) {
  const shapes = []
  const shapeTypes = ['rectangle', 'l-shape']

  for (let i = 0; i < count; i++) {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
    
    if (type === 'rectangle') {
      // Create rectangular shape
      const length = Math.random() * (maxWidth * 0.4) + 50  // 50 to 40% of bin width
      const width = Math.random() * (maxHeight * 0.3) + 30   // 30 to 30% of bin height
      
      const dimensionShape = DimensionShape.createRectangle(length, width, {
        id: `rect-${i}`,
        jobNumber: `JOB-${Math.floor(Math.random() * 1000)}`,
        customerName: `Customer ${i + 1}`,
        material: 'Material'
      })
      
      shapes.push({
        id: `shape-${i}`,
        type: 'dimensionshape',
        dimensionShape: dimensionShape,
        // Properties for nesting compatibility
        width: dimensionShape.boundingBox.width,
        height: dimensionShape.boundingBox.height,
        area: dimensionShape.actualArea,
        boundingArea: dimensionShape.boundingBox.area,
        efficiency: dimensionShape.efficiency,
        description: dimensionShape.getDescription()
      })
      
    } else if (type === 'l-shape') {
      // Create L-shaped piece
      const length = Math.random() * (maxWidth * 0.4) + 80   // 80 to 40% of bin width
      const width = Math.random() * (maxHeight * 0.4) + 60   // 60 to 40% of bin height
      const armLength = Math.random() * (length * 0.4) + length * 0.3  // 30-70% of length
      const armWidth = Math.random() * (width * 0.4) + width * 0.3     // 30-70% of width
      
      const dimensionShape = DimensionShape.createLShape(length, width, armLength, armWidth, {
        id: `lshape-${i}`,
        jobNumber: `JOB-${Math.floor(Math.random() * 1000)}`,
        customerName: `Customer ${i + 1}`,
        material: 'Material'
      })
      
      shapes.push({
        id: `shape-${i}`,
        type: 'dimensionshape',
        dimensionShape: dimensionShape,
        // Properties for nesting compatibility
        width: dimensionShape.boundingBox.width,
        height: dimensionShape.boundingBox.height,
        area: dimensionShape.actualArea,
        boundingArea: dimensionShape.boundingBox.area,
        efficiency: dimensionShape.efficiency,
        description: dimensionShape.getDescription()
      })
    }
  }

  // Sort by bounding area (largest first) for better packing efficiency
  return shapes.sort((a, b) => b.boundingArea - a.boundingArea)
}

/**
 * Enhanced collision detection for DimensionShape instances
 */
function checkCollision(shape1, shape2) {
  // Both shapes are DimensionShape-based
  if (shape1.type === 'dimensionshape' && shape2.type === 'dimensionshape') {
    // Use DimensionShape's built-in overlap detection
    return shape1.dimensionShape.overlaps(
      shape2.dimensionShape,
      shape1.x || 0,
      shape1.y || 0,  
      shape2.x || 0,
      shape2.y || 0
    )
  }

  // Fallback to bounding box collision for any non-DimensionShape types
  return !(
    shape1.x + shape1.width < shape2.x ||
    shape2.x + shape2.width < shape1.x ||
    shape1.y + shape1.height < shape2.y ||
    shape2.y + shape2.height < shape1.y
  )
}

/**
 * Check if shape fits in bin at given position
 */
function canPlaceShape(bin, shape, x, y) {
  const placedShape = { ...shape, x, y }

  // Check bin boundaries using the shape's bounding box
  if (shape.type === 'dimensionshape') {
    // Use DimensionShape bounding box dimensions
    if (x < 0 || y < 0 || x + shape.width > bin.width || y + shape.height > bin.height) {
      return false
    }
  } else {
    // Fallback for any legacy shape types
    if (x < 0 || y < 0 || x + shape.width > bin.width || y + shape.height > bin.height) {
      return false
    }
  }

  // Check collisions with existing shapes
  for (const existingShape of bin.shapes) {
    if (checkCollision(placedShape, existingShape)) {
      return false
    }
  }

  return true
}

/**
 * Try to place shape in bin using simple grid-based approach
 */
function tryPlaceInBin(bin, shape) {
  const gridSize = 5 // Step size for placement attempts

  // Try positions from top-left, row by row
  for (let y = 0; y < bin.height; y += gridSize) {
    for (let x = 0; x < bin.width; x += gridSize) {
      if (canPlaceShape(bin, shape, x, y)) {
        // Found a valid position
        const placedShape = { ...shape, x, y }
        bin.shapes.push(placedShape)
        return true
      }
    }
  }

  return false
}

/**
 * Test multi-bin nesting
 * This uses a simple first-fit algorithm for demonstration
 */
export function testMultiBinNesting(bins, shapes) {
  // Reset bins
  bins.forEach(bin => {
    bin.shapes = []
  })

  let placedCount = 0
  const unplacedShapes = []

  // Try to place each shape
  for (const shape of shapes) {
    let placed = false

    // Try each bin in order
    for (const bin of bins) {
      if (tryPlaceInBin(bin, shape)) {
        placed = true
        placedCount++
        break
      }
    }

    if (!placed) {
      unplacedShapes.push(shape)
    }
  }

  // Calculate detailed statistics for CutShape-based nesting
  const binsUsed = bins.filter(bin => bin.shapes.length > 0).length
  const totalBinArea = bins.reduce((sum, bin) => sum + (bin.width * bin.height), 0)
  
  // Calculate both actual used area and bounding box area
  const usedActualArea = bins.reduce((sum, bin) => {
    return sum + bin.shapes.reduce((s, shape) => s + (shape.area || 0), 0)
  }, 0)
  
  const usedBoundingArea = bins.reduce((sum, bin) => {
    return sum + bin.shapes.reduce((s, shape) => s + (shape.boundingArea || shape.area || 0), 0)
  }, 0)
  
  // Calculate material efficiency (how much of the cut material is actually used vs waste)
  const totalMaterialEfficiency = shapes.reduce((sum, shape) => {
    if (shape.type === 'cutshape') {
      return sum + shape.efficiency
    }
    return sum + 1 // Non-CutShape shapes assumed 100% efficient
  }, 0) / shapes.length
  
  const binEfficiency = totalBinArea > 0 ? ((usedBoundingArea / totalBinArea) * 100).toFixed(1) : 0
  const materialEfficiency = (totalMaterialEfficiency * 100).toFixed(1)

  return {
    bins,
    totalShapes: shapes.length,
    placedShapes: placedCount,
    unplacedShapes: unplacedShapes.length,
    unplaced: unplacedShapes,
    binsUsed,
    totalBins: bins.length,
    binEfficiency: parseFloat(binEfficiency),
    materialEfficiency: parseFloat(materialEfficiency),
    usedActualArea,
    usedBoundingArea,
    totalBinArea,
    // Legacy efficiency for backwards compatibility
    efficiency: parseFloat(binEfficiency)
  }
}

/**
 * Create realistic cutting scenarios
 * @param {string} scenario - 'kitchen', 'office', 'mixed'
 * @param {number} count - Number of cuts to generate
 * @returns {Array} Array of DimensionShape-based test shapes
 */
export function createRealisticCuttingScenario(scenario = 'mixed', count = 10) {
  const shapes = []
  
  if (scenario === 'kitchen') {
    // Kitchen scenarios - more L-shapes for corners
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.6) { // 60% L-shapes for kitchen
        const length = Math.random() * 300 + 150        // 150-450 units
        const width = Math.random() * 200 + 100         // 100-300 units
        const armLength = Math.random() * (length * 0.4) + length * 0.4  // 40-80% of length
        const armWidth = Math.random() * (width * 0.4) + width * 0.4     // 40-80% of width
        
        const dimensionShape = DimensionShape.createLShape(length, width, armLength, armWidth, {
          id: `kitchen-l-${i}`,
          jobNumber: `K${Math.floor(Math.random() * 1000)}`,
          material: 'Kitchen Material',
          scenario: 'kitchen-corner'
        })
        
        shapes.push({
          id: `shape-${i}`,
          type: 'dimensionshape',
          dimensionShape,
          width: dimensionShape.boundingBox.width,
          height: dimensionShape.boundingBox.height,
          area: dimensionShape.actualArea,
          boundingArea: dimensionShape.boundingBox.area,
          efficiency: dimensionShape.efficiency,
          description: dimensionShape.getDescription()
        })
      } else {
        // Straight runs
        const length = Math.random() * 400 + 100  // 100-500 units
        const width = Math.random() * 150 + 50    // 50-200 units
        
        const dimensionShape = DimensionShape.createRectangle(length, width, {
          id: `kitchen-rect-${i}`,
          jobNumber: `K${Math.floor(Math.random() * 1000)}`,
          material: 'Kitchen Material',
          scenario: 'kitchen-straight'
        })
        
        shapes.push({
          id: `shape-${i}`,
          type: 'dimensionshape',
          dimensionShape,
          width: dimensionShape.boundingBox.width,
          height: dimensionShape.boundingBox.height,
          area: dimensionShape.actualArea,
          boundingArea: dimensionShape.boundingBox.area,
          efficiency: dimensionShape.efficiency,
          description: dimensionShape.getDescription()
        })
      }
    }
  } else {
    // Use the existing mixed generation
    return createSimpleShapes(count, 400, 300) // Reasonable dimensions for testing
  }
  
  return shapes.sort((a, b) => b.boundingArea - a.boundingArea)
}

/**
 * Advanced multi-bin nesting with bin pack algorithm
 * This would integrate with the existing SVGnest algorithm
 */
export function advancedMultiBinNesting(bins, shapes, config = {}) {
  // TODO: Integrate with existing SVGnest algorithm
  // This would use the actual nesting algorithm from svgnest.js
  // For now, falls back to simple nesting
  console.log('Advanced nesting not yet implemented, using simple nesting')
  return testMultiBinNesting(bins, shapes)
}