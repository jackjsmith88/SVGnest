/**
 * Deterministic test cases for validating multi-bin packing
 * These are designed so we know exactly what the optimal solution should be
 */

import { DimensionShape } from './DimensionShape.js'

/**
 * Test Case 1: Simple strips that fit perfectly in one bin
 * 8 vertical strips of 47×297px should fit in a 400×300px bin
 * Expected: All 8 shapes in 1 bin, ~93% efficiency
 */
export function createPerfectSingleBinTest() {
  const shapes = []
  const stripWidth = 47
  const stripHeight = 297
  
  for (let i = 0; i < 8; i++) {
    const dimensionShape = DimensionShape.createRectangle(stripWidth, stripHeight, {
      id: `strip-${i}`,
      testCase: 'perfect-single-bin'
    })
    
    shapes.push({
      id: `shape-${i}`,
      type: 'dimensionshape',
      dimensionShape: dimensionShape,
      width: dimensionShape.boundingBox.width,
      height: dimensionShape.boundingBox.height,
      area: dimensionShape.actualArea,
      boundingArea: dimensionShape.boundingBox.area,
      efficiency: dimensionShape.efficiency,
      description: dimensionShape.getDescription()
    })
  }
  
  return {
    shapes,
    expectedBins: 1,
    expectedEfficiency: 93,
    description: '8 strips (47×297px) that perfectly fit in one 400×300px bin'
  }
}

/**
 * Test Case 2: Interlocking L-shapes that need 2 bins
 * 2 L-shapes designed to interlock perfectly in bin 1
 * 2 more L-shapes that interlock perfectly in bin 2
 * Plus 8 strips for bin 1
 * Expected: Bin 1 = 8 strips, Bin 2 = 4 L-shapes interlocked
 */
export function createInterlockingLShapesTest() {
  const shapes = []
  
  // Bin 1: 8 strips (same as test 1)
  const stripWidth = 47
  const stripHeight = 297
  
  for (let i = 0; i < 8; i++) {
    const dimensionShape = DimensionShape.createRectangle(stripWidth, stripHeight, {
      id: `strip-${i}`,
      testCase: 'interlocking-l-shapes'
    })
    
    shapes.push({
      id: `shape-${i}`,
      type: 'dimensionshape',
      dimensionShape: dimensionShape,
      width: dimensionShape.boundingBox.width,
      height: dimensionShape.boundingBox.height,
      area: dimensionShape.actualArea,
      boundingArea: dimensionShape.boundingBox.area,
      efficiency: dimensionShape.efficiency,
      description: dimensionShape.getDescription()
    })
  }
  
  // Bin 2: 4 L-shapes that interlock
  // L-shape: 200×150, with arm 100×75 (creates a 100×75 cavity)
  for (let i = 0; i < 4; i++) {
    const dimensionShape = DimensionShape.createLShape(
      200,  // length
      150,  // width
      100,  // armLength (half of length)
      75,   // armWidth (half of width)
      {
        id: `lshape-${i}`,
        testCase: 'interlocking-l-shapes'
      }
    )
    
    shapes.push({
      id: `shape-${8 + i}`,
      type: 'dimensionshape',
      dimensionShape: dimensionShape,
      width: dimensionShape.boundingBox.width,
      height: dimensionShape.boundingBox.height,
      area: dimensionShape.actualArea,
      boundingArea: dimensionShape.boundingBox.area,
      efficiency: dimensionShape.efficiency,
      description: dimensionShape.getDescription()
    })
  }
  
  return {
    shapes,
    expectedBins: 2,
    expectedEfficiency: 85,
    description: '8 strips in bin 1, 4 interlocking L-shapes in bin 2'
  }
}

/**
 * Test Case 3: Simple rectangles that need exactly 2 bins
 * Each rectangle is 195×145px (half the bin minus spacing)
 * 8 rectangles total = 4 per bin perfectly
 * Expected: 2 bins, each with 4 rectangles, ~95% efficiency
 */
export function createExactTwoBinsTest() {
  const shapes = []
  const rectWidth = 195  // (400/2) - 5px spacing
  const rectHeight = 145 // (300/2) - 5px spacing
  
  for (let i = 0; i < 8; i++) {
    const dimensionShape = DimensionShape.createRectangle(rectWidth, rectHeight, {
      id: `rect-${i}`,
      testCase: 'exact-two-bins'
    })
    
    shapes.push({
      id: `shape-${i}`,
      type: 'dimensionshape',
      dimensionShape: dimensionShape,
      width: dimensionShape.boundingBox.width,
      height: dimensionShape.boundingBox.height,
      area: dimensionShape.actualArea,
      boundingArea: dimensionShape.boundingBox.area,
      efficiency: dimensionShape.efficiency,
      description: dimensionShape.getDescription()
    })
  }
  
  return {
    shapes,
    expectedBins: 2,
    expectedEfficiency: 95,
    description: '8 rectangles (195×145px) = 4 per bin, 2 bins total'
  }
}
