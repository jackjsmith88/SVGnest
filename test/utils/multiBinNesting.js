/**
 * Multi-bin nesting utilities for testing
 * This is a simplified implementation for testing purposes
 */

/**
 * Create simple test shapes
 */
export function createSimpleShapes(count, maxWidth, maxHeight) {
  const shapes = []
  const shapeTypes = ['rect', 'circle']

  for (let i = 0; i < count; i++) {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]

    if (type === 'rect') {
      const width = Math.random() * (maxWidth * 0.2) + 20
      const height = Math.random() * (maxHeight * 0.2) + 20
      shapes.push({
        id: `shape-${i}`,
        type: 'rect',
        width,
        height,
        area: width * height
      })
    } else if (type === 'circle') {
      const radius = Math.random() * (Math.min(maxWidth, maxHeight) * 0.1) + 10
      shapes.push({
        id: `shape-${i}`,
        type: 'circle',
        radius,
        area: Math.PI * radius * radius
      })
    }
  }

  // Sort by area (largest first) for better packing
  return shapes.sort((a, b) => b.area - a.area)
}

/**
 * Simple collision detection
 */
function checkCollision(shape1, shape2) {
  // Simple bounding box collision for rectangles
  if (shape1.type === 'rect' && shape2.type === 'rect') {
    return !(
      shape1.x + shape1.width < shape2.x ||
      shape2.x + shape2.width < shape1.x ||
      shape1.y + shape1.height < shape2.y ||
      shape2.y + shape2.height < shape1.y
    )
  }

  // Circle collision
  if (shape1.type === 'circle' && shape2.type === 'circle') {
    const dx = (shape1.x + shape1.radius) - (shape2.x + shape2.radius)
    const dy = (shape1.y + shape1.radius) - (shape2.y + shape2.radius)
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < (shape1.radius + shape2.radius)
  }

  // Mixed collision (rect-circle) - simplified
  if (shape1.type === 'rect' && shape2.type === 'circle') {
    const circleCenterX = shape2.x + shape2.radius
    const circleCenterY = shape2.y + shape2.radius

    // Check if circle center is inside rect bounds + radius
    return (
      circleCenterX + shape2.radius > shape1.x &&
      circleCenterX - shape2.radius < shape1.x + shape1.width &&
      circleCenterY + shape2.radius > shape1.y &&
      circleCenterY - shape2.radius < shape1.y + shape1.height
    )
  }

  if (shape1.type === 'circle' && shape2.type === 'rect') {
    return checkCollision(shape2, shape1)
  }

  return false
}

/**
 * Check if shape fits in bin at given position
 */
function canPlaceShape(bin, shape, x, y) {
  const placedShape = { ...shape, x, y }

  // Check bin boundaries
  if (shape.type === 'rect') {
    if (x < 0 || y < 0 || x + shape.width > bin.width || y + shape.height > bin.height) {
      return false
    }
  } else if (shape.type === 'circle') {
    if (
      x < 0 ||
      y < 0 ||
      x + shape.radius * 2 > bin.width ||
      y + shape.radius * 2 > bin.height
    ) {
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

  // Calculate statistics
  const binsUsed = bins.filter(bin => bin.shapes.length > 0).length
  const totalBinArea = bins.reduce((sum, bin) => sum + (bin.width * bin.height), 0)
  const usedArea = bins.reduce((sum, bin) => {
    return sum + bin.shapes.reduce((s, shape) => s + shape.area, 0)
  }, 0)
  const efficiency = totalBinArea > 0 ? ((usedArea / totalBinArea) * 100).toFixed(1) : 0

  return {
    bins,
    totalShapes: shapes.length,
    placedShapes: placedCount,
    unplacedShapes: unplacedShapes.length,
    unplaced: unplacedShapes,
    binsUsed,
    totalBins: bins.length,
    efficiency: parseFloat(efficiency)
  }
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
