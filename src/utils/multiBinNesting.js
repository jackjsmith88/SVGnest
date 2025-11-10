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

/**
 * Iterative multi-bin nesting that uses genetic algorithm-inspired approach
 * Mirrors the single-bin SVGnest algorithm but optimizes across multiple bins
 * @param {Array} bins - Array of bin objects
 * @param {Array} shapes - Array of shapes to nest
 * @param {number} iteration - Current iteration number (affects population member)
 * @returns {Object} Nesting result with placement info
 */
export function testMultiBinNestingIterative(bins, shapes, iteration = 1) {
  // Clone bins to avoid modifying originals
  const testBins = bins.map(bin => ({
    ...bin,
    shapes: []
  }))

  // Use genetic algorithm-inspired approach similar to SVGnest
  // Each iteration tests a different "individual" from the population
  
  // Sort shapes by area (like SVGnest's adam seed)
  const sortedShapes = [...shapes].sort((a, b) => 
    Math.abs(b.boundingArea || b.area || 0) - Math.abs(a.boundingArea || a.area || 0)
  )
  
  // Apply mutation based on iteration (like genetic algorithm)
  const placementOrder = applyGeneticVariation(sortedShapes, iteration)
  
  // Log variation to verify it's changing
  if (iteration <= 10 || iteration % 50 === 0) {
    const orderIds = placementOrder.map(s => s.id).join(',')
    const searchPattern = Math.floor(iteration / 15) % 5
    const scoringPhase = Math.floor(iteration / 20) % 5
    const patternNames = ['TopLeft→BottomRight', 'BottomLeft→TopRight', 'Right→Left', 'Center→Out', 'Random']
    const phaseNames = ['BottomLeft', 'TopLeft', 'BottomRight', 'Center', 'Edge']
    console.log(`Iteration ${iteration}: Order=[${orderIds}], Search=${patternNames[searchPattern]}, Scoring=${phaseNames[scoringPhase]}`)
  }
  
  // Try to place each shape using best-fit across all bins
  let placedCount = 0
  const unplacedShapes = []
  
  for (const shape of placementOrder) {
    const bestPlacement = findBestPlacementAcrossAllBins(testBins, shape, iteration)
    
    if (bestPlacement) {
      const { binIndex, x, y, rotation } = bestPlacement
      
      // Apply rotation to get correct dimensions
      const rotatedShape = applyRotation(shape, rotation)
      
      const placedShape = { 
        ...rotatedShape,  // Use rotated shape with correct dimensions
        x, 
        y, 
        rotation: rotation || 0,
        originalId: shape.id  // Keep original ID for tracking
      }
      testBins[binIndex].shapes.push(placedShape)
      placedCount++
    } else {
      unplacedShapes.push(shape)
    }
  }

  // Calculate efficiency metrics
  return calculateMultiBinMetrics(testBins, shapes, placedCount, unplacedShapes, iteration)
}

/**
 * Apply genetic algorithm-style variation to shape order
 * Similar to SVGnest's mutation and crossover operations
 */
function applyGeneticVariation(shapes, iteration) {
  const population = [...shapes]
  
  // Mutation rate varies by iteration cycle
  // Start with some mutation, increase over time
  const cycle = (iteration - 1) % 100
  const mutationRate = Math.min(0.4, 0.1 + (cycle / 100) * 0.3)
  
  // Apply mutations: swap random pairs
  const numMutations = Math.max(1, Math.floor(population.length * mutationRate))
  for (let i = 0; i < numMutations; i++) {
    const idx1 = Math.floor(seededRandom(iteration * 7 + i) * population.length)
    const idx2 = Math.floor(seededRandom(iteration * 13 + i + 1000) * population.length)
    if (idx1 !== idx2) {
      ;[population[idx1], population[idx2]] = [population[idx2], population[idx1]]
    }
  }
  
  // Every 25 iterations, try reverse order (like population diversity)
  if (Math.floor(iteration / 25) % 2 === 1) {
    return population.reverse()
  }
  
  // Every 10 iterations, rotate the array
  if (iteration % 10 === 0) {
    const rotateAmount = Math.floor(seededRandom(iteration) * population.length)
    return [...population.slice(rotateAmount), ...population.slice(0, rotateAmount)]
  }
  
  return population
}

/**
 * Find the best placement for a shape across all available bins
 * This is the core optimization similar to SVGnest's NFP (No-Fit Polygon) approach
 */
function findBestPlacementAcrossAllBins(bins, shape, iteration) {
  let bestPlacement = null
  let bestScore = -Infinity
  
  // Test each bin
  for (let binIndex = 0; binIndex < bins.length; binIndex++) {
    const bin = bins[binIndex]
    
    // Try multiple rotations (like SVGnest's rotation parameter)
    const rotations = [0, 90, 180, 270]
    
    for (const rotation of rotations) {
      const rotatedShape = applyRotation(shape, rotation)
      
      // Find best position in this bin with this rotation
      const placement = findBestPositionInBin(bin, rotatedShape, iteration)
      
      if (placement) {
        // Score this placement (lower is better - minimize waste)
        const score = scorePlacement(bin, rotatedShape, placement.x, placement.y, binIndex, iteration)
        
        if (score > bestScore) {
          bestScore = score
          bestPlacement = {
            binIndex,
            x: placement.x,
            y: placement.y,
            rotation
          }
        }
      }
    }
  }
  
  return bestPlacement
}

/**
 * Apply rotation to shape (0, 90, 180, 270 degrees)
 */
function applyRotation(shape, degrees) {
  if (degrees === 0) {
    return shape
  }
  
  // For 90 or 270, swap width and height
  if (degrees === 90 || degrees === 270) {
    return {
      ...shape,
      width: shape.height,
      height: shape.width,
      rotated: true
    }
  }
  
  // 180 degrees doesn't change dimensions
  return shape
}

/**
 * Find best position within a specific bin
 * Uses a grid-based search similar to SVGnest's placement algorithm
 */
function findBestPositionInBin(bin, shape, iteration) {
  // Adaptive grid size: finer grid in later iterations
  const baseGridSize = 10
  const gridSize = Math.max(3, baseGridSize - Math.floor(iteration / 100))
  
  let bestPosition = null
  let bestWaste = Infinity
  
  // Vary search pattern based on iteration to find different solutions
  // Use longer cycle so patterns don't repeat too quickly
  const searchPattern = Math.floor(iteration / 15) % 5
  
  // Try different search patterns
  if (searchPattern === 0) {
    // Top-left to bottom-right (default)
    for (let y = 0; y <= bin.height - shape.height; y += gridSize) {
      for (let x = 0; x <= bin.width - shape.width; x += gridSize) {
        if (canPlaceShape(bin, shape, x, y)) {
          const waste = calculateLocalWaste(bin, shape, x, y)
          if (waste < bestWaste) {
            bestWaste = waste
            bestPosition = { x, y }
          }
        }
      }
    }
  } else if (searchPattern === 1) {
    // Bottom-left to top-right
    for (let y = bin.height - shape.height; y >= 0; y -= gridSize) {
      for (let x = 0; x <= bin.width - shape.width; x += gridSize) {
        if (canPlaceShape(bin, shape, x, y)) {
          const waste = calculateLocalWaste(bin, shape, x, y)
          if (waste < bestWaste) {
            bestWaste = waste
            bestPosition = { x, y }
          }
        }
      }
    }
  } else if (searchPattern === 2) {
    // Right to left, top to bottom
    for (let y = 0; y <= bin.height - shape.height; y += gridSize) {
      for (let x = bin.width - shape.width; x >= 0; x -= gridSize) {
        if (canPlaceShape(bin, shape, x, y)) {
          const waste = calculateLocalWaste(bin, shape, x, y)
          if (waste < bestWaste) {
            bestWaste = waste
            bestPosition = { x, y }
          }
        }
      }
    }
  } else if (searchPattern === 3) {
    // Center outward spiral-ish pattern
    const centerX = (bin.width - shape.width) / 2
    const centerY = (bin.height - shape.height) / 2
    for (let y = 0; y <= bin.height - shape.height; y += gridSize) {
      for (let x = 0; x <= bin.width - shape.width; x += gridSize) {
        if (canPlaceShape(bin, shape, x, y)) {
          // Prefer positions closer to center for this pattern
          const distToCenter = Math.abs(x - centerX) + Math.abs(y - centerY)
          const waste = distToCenter
          if (waste < bestWaste) {
            bestWaste = waste
            bestPosition = { x, y }
          }
        }
      }
    }
  } else {
    // Random sampling - try random positions
    const maxAttempts = 50
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(seededRandom(iteration * 100 + attempt) * (bin.width - shape.width + 1))
      const y = Math.floor(seededRandom(iteration * 200 + attempt) * (bin.height - shape.height + 1))
      
      // Snap to grid
      const gridX = Math.floor(x / gridSize) * gridSize
      const gridY = Math.floor(y / gridSize) * gridSize
      
      if (canPlaceShape(bin, shape, gridX, gridY)) {
        const waste = calculateLocalWaste(bin, shape, gridX, gridY)
        if (waste < bestWaste) {
          bestWaste = waste
          bestPosition = { x: gridX, y: gridY }
        }
      }
    }
  }
  
  return bestPosition
}

/**
 * Score a placement (higher is better)
 * Considers: bin utilization, shape packing density, bin balance
 * Add variation based on iteration to explore different solutions
 */
function scorePlacement(bin, shape, x, y, binIndex, iteration = 1) {
  const totalBinArea = bin.width * bin.height
  const usedArea = bin.shapes.reduce((sum, s) => sum + (s.boundingArea || s.area || 0), 0)
  const shapeArea = shape.boundingArea || shape.area || 0
  
  // Current bin utilization
  const utilization = (usedArea + shapeArea) / totalBinArea
  
  // Vary placement preferences based on iteration phase
  const phase = Math.floor(iteration / 20) % 5
  
  let gravityScore = 0
  const binHeight = bin.height
  const binWidth = bin.width
  
  switch(phase) {
    case 0: // Bottom-left preference (traditional)
      gravityScore = ((binHeight - y) / binHeight) * 0.3 + ((binWidth - x) / binWidth) * 0.2
      break
    case 1: // Top-left preference
      gravityScore = (y / binHeight) * 0.3 + ((binWidth - x) / binWidth) * 0.2
      break
    case 2: // Bottom-right preference  
      gravityScore = ((binHeight - y) / binHeight) * 0.3 + (x / binWidth) * 0.2
      break
    case 3: // Center preference
      const centerX = binWidth / 2
      const centerY = binHeight / 2
      const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))
      gravityScore = (1 - distToCenter / maxDist) * 0.5
      break
    case 4: // Edge preference (perimeter first)
      const distToEdge = Math.min(x, y, binWidth - x - shape.width, binHeight - y - shape.height)
      gravityScore = (1 - distToEdge / Math.max(binWidth, binHeight)) * 0.5
      break
  }
  
  // Penalize using many bins (prefer filling fewer bins)
  const binPenalty = binIndex * 0.15
  
  // Add small random variation to break ties and explore
  const randomFactor = seededRandom(iteration * 1000 + x * 100 + y * 10 + binIndex) * 0.05
  
  // Combined score (higher is better)
  return utilization + gravityScore - binPenalty + randomFactor
}

/**
 * Calculate local wasted space around a placement
 * Lower waste means tighter packing
 */
function calculateLocalWaste(bin, shape, x, y) {
  // Distance from edges (prefer corners)
  const leftGap = x
  const topGap = y
  const rightGap = bin.width - (x + shape.width)
  const bottomGap = bin.height - (y + shape.height)
  
  // Sum of gaps (lower is better for tight packing)
  return leftGap + topGap + Math.min(rightGap, 20) + Math.min(bottomGap, 20)
}

/**
 * Calculate comprehensive metrics for multi-bin result
 */
function calculateMultiBinMetrics(testBins, shapes, placedCount, unplacedShapes, iteration) {
  const binsUsed = testBins.filter(bin => bin.shapes.length > 0).length
  
  // Calculate total area available in USED bins only
  const usedBinsArea = testBins
    .filter(bin => bin.shapes.length > 0)
    .reduce((sum, bin) => sum + (bin.width * bin.height), 0)
  
  const totalBinArea = testBins.reduce((sum, bin) => sum + (bin.width * bin.height), 0)
  
  const usedActualArea = testBins.reduce((sum, bin) => {
    return sum + bin.shapes.reduce((s, shape) => s + (shape.area || 0), 0)
  }, 0)
  
  const usedBoundingArea = testBins.reduce((sum, bin) => {
    return sum + bin.shapes.reduce((s, shape) => s + (shape.boundingArea || shape.area || 0), 0)
  }, 0)
  
  const totalMaterialEfficiency = shapes.reduce((sum, shape) => {
    if (shape.type === 'cutshape' || shape.type === 'dimensionshape') {
      return sum + (shape.efficiency || 1)
    }
    return sum + 1
  }, 0) / shapes.length
  
  // Key metric: bin efficiency (how much of USED bin space is filled)
  // This should never exceed 100% if collision detection is working
  const binEfficiency = usedBinsArea > 0 ? ((usedBoundingArea / usedBinsArea) * 100) : 0
  const materialEfficiency = (totalMaterialEfficiency * 100)

  // Debug: Check if we have overlaps (efficiency > 100%)
  if (binEfficiency > 100) {
    console.warn(`Warning: Bin efficiency ${binEfficiency.toFixed(1)}% exceeds 100% - possible overlaps!`)
    console.warn(`Used bins area: ${usedBinsArea}, Bounding area: ${usedBoundingArea}`)
  }

  return {
    bins: testBins,
    totalShapes: shapes.length,
    placedShapes: placedCount,
    unplacedShapes: unplacedShapes.length,
    unplaced: unplacedShapes,
    binsUsed,
    totalBins: testBins.length,
    binEfficiency: parseFloat(binEfficiency.toFixed(1)),
    materialEfficiency: parseFloat(materialEfficiency.toFixed(1)),
    usedActualArea,
    usedBoundingArea,
    totalBinArea,
    usedBinsArea, // Add this for debugging
    efficiency: parseFloat(binEfficiency.toFixed(1)),
    iteration
  }
}

/**
 * Seeded random number generator for reproducible results
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}


