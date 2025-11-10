/**
 * DimensionShape - Simple 2D shape class for nesting based on length/width dimensions
 * Specifically designed for SVG rendering and nesting optimization
 */
export class DimensionShape {
  /**
   * @param {Object} config - Configuration for the dimension shape
   * @param {string} config.type - Shape type: 'RECTANGLE' or 'L_SHAPE'
   * @param {number} config.length - Primary length dimension
   * @param {number} config.width - Primary width dimension
   * @param {Object} config.lShapeConfig - L-shape specific config { armLength, armWidth }
   * @param {Object} config.metadata - Additional metadata
   */
  constructor(config) {
    this.type = config.type || 'RECTANGLE'
    this.length = config.length
    this.width = config.width
    this.metadata = config.metadata || {}
    
    if (this.type === 'L_SHAPE') {
      this.lShapeConfig = config.lShapeConfig || {}
      this.armLength = this.lShapeConfig.armLength || this.length * 0.6
      this.armWidth = this.lShapeConfig.armWidth || this.width * 0.6
    }
    
    this.calculateDimensions()
  }

  /**
   * Calculate bounding box and areas
   */
  calculateDimensions() {
    if (this.type === 'RECTANGLE') {
      this.boundingBox = {
        width: this.length,
        height: this.width,
        area: this.length * this.width
      }
      this.actualArea = this.boundingBox.area
      this.efficiency = 1.0
      
    } else if (this.type === 'L_SHAPE') {
      // L-shape: main rectangle + arm rectangle
      this.boundingBox = {
        width: this.length,
        height: this.width,
        area: this.length * this.width
      }
      
      // Calculate actual area (two rectangles)
      const mainArea = this.length * this.armWidth  // Main horizontal piece
      const armArea = this.armLength * (this.width - this.armWidth)  // Vertical piece
      this.actualArea = mainArea + armArea
      this.efficiency = this.actualArea / this.boundingBox.area
    }
  }

  /**
   * Create a rectangle shape
   */
  static createRectangle(length, width, metadata = {}) {
    return new DimensionShape({
      type: 'RECTANGLE',
      length,
      width,
      metadata
    })
  }

  /**
   * Create an L-shape
   */
  static createLShape(length, width, armLength, armWidth, metadata = {}) {
    return new DimensionShape({
      type: 'L_SHAPE',
      length,
      width,
      lShapeConfig: { armLength, armWidth },
      metadata
    })
  }

  /**
   * Get SVG path elements for rendering
   * Returns array of rectangles that make up the shape
   */
  getSVGElements(x = 0, y = 0) {
    const elements = []

    if (this.type === 'RECTANGLE') {
      elements.push({
        type: 'rect',
        x: x,
        y: y,
        width: this.length,
        height: this.width,
        role: 'main'
      })
      
    } else if (this.type === 'L_SHAPE') {
      // Main horizontal rectangle (full length, partial width)
      elements.push({
        type: 'rect',
        x: x,
        y: y,
        width: this.length,
        height: this.armWidth,
        role: 'main'
      })
      
      // Vertical arm rectangle (partial length, remaining width)
      elements.push({
        type: 'rect',
        x: x,
        y: y + this.armWidth,
        width: this.armLength,
        height: this.width - this.armWidth,
        role: 'arm'
      })
    }

    return elements
  }

  /**
   * Get cavity/void areas for L-shapes (areas within bounding box but not filled)
   */
  getCavityElements(x = 0, y = 0) {
    if (this.type !== 'L_SHAPE') return []

    // The void area in L-shape is the bottom-right corner
    const cavityWidth = this.length - this.armLength
    const cavityHeight = this.width - this.armWidth

    if (cavityWidth > 0 && cavityHeight > 0) {
      return [{
        type: 'rect',
        x: x + this.armLength,
        y: y + this.armWidth,
        width: cavityWidth,
        height: cavityHeight,
        role: 'cavity'
      }]
    }

    return []
  }

  /**
   * Get polygon points for SVG rendering/nesting algorithms
   * Returns array of {x, y} coordinates forming the outer boundary
   * Coordinates are relative to origin (0, 0)
   */
  getPolygonPoints() {
    if (this.type === 'RECTANGLE') {
      // Rectangle: 4 corner points (clockwise from top-left)
      return [
        { x: 0, y: 0 },
        { x: this.length, y: 0 },
        { x: this.length, y: this.width },
        { x: 0, y: this.width }
      ]
    }

    if (this.type === 'L_SHAPE') {
      // L-Shape: 6 points forming the outline (clockwise from top-left)
      // Main rectangle: length × armWidth (top portion)
      // Arm rectangle: armLength × (width - armWidth) (bottom-left portion)
      return [
        { x: 0, y: 0 },                              // Top-left of main
        { x: this.length, y: 0 },                    // Top-right of main
        { x: this.length, y: this.armWidth },        // Bottom-right of main
        { x: this.armLength, y: this.armWidth },     // Inner corner (notch)
        { x: this.armLength, y: this.width },        // Bottom-right of arm
        { x: 0, y: this.width }                      // Bottom-left of arm
      ]
    }

    return []
  }

  /**
   * Create DimensionShape from polygon points
   * Analyzes polygon to determine if it's a rectangle or L-shape
   * Returns null if polygon doesn't match expected patterns
   */
  static fromPolygonPoints(points) {
    if (!points || points.length < 3) {
      return null
    }

    // Calculate bounding box
    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    // Rectangle check (4 points)
    if (points.length === 4) {
      const length = maxX - minX
      const width = maxY - minY
      
      return DimensionShape.createRectangle(length, width)
    }

    // L-Shape check (6 points)
    if (points.length === 6) {
      // Sort points to identify the notch
      const sortedByY = [...points].sort((a, b) => a.y - b.y)
      const sortedByX = [...points].sort((a, b) => a.x - b.x)

      // For standard L-shape (horizontal orientation):
      // Total dimensions
      const length = maxX - minX
      const width = maxY - minY

      // Find the inner corner (notch) - should have intermediate x and y values
      const notchCandidates = points.filter(p => 
        p.x > minX && p.x < maxX && p.y > minY && p.y < maxY
      )

      if (notchCandidates.length >= 1) {
        const notch = notchCandidates[0]
        const armWidth = notch.y - minY
        const armLength = notch.x - minX

        return DimensionShape.createLShape(length, width, armLength, armWidth)
      }
    }

    // Couldn't identify shape pattern
    return null
  }

  /**
   * Check if a point is inside the shape (not including cavities)
   */
  containsPoint(pointX, pointY, shapeX = 0, shapeY = 0) {
    if (this.type === 'RECTANGLE') {
      return pointX >= shapeX && 
             pointX <= shapeX + this.length &&
             pointY >= shapeY && 
             pointY <= shapeY + this.width
    }

    if (this.type === 'L_SHAPE') {
      // Check if point is in main rectangle
      const inMain = pointX >= shapeX && 
                     pointX <= shapeX + this.length &&
                     pointY >= shapeY && 
                     pointY <= shapeY + this.armWidth

      // Check if point is in arm rectangle
      const inArm = pointX >= shapeX && 
                    pointX <= shapeX + this.armLength &&
                    pointY >= shapeY + this.armWidth && 
                    pointY <= shapeY + this.width

      return inMain || inArm
    }

    return false
  }

  /**
   * Check if this shape overlaps with another DimensionShape
   */
  overlaps(other, thisX = 0, thisY = 0, otherX = 0, otherY = 0) {
    // Get all solid rectangles for both shapes
    const thisElements = this.getSVGElements(thisX, thisY)
    const otherElements = other.getSVGElements(otherX, otherY)

    // Check if any rectangle from this shape overlaps with any rectangle from other shape
    for (const thisEl of thisElements) {
      for (const otherEl of otherElements) {
        if (this.rectanglesOverlap(thisEl, otherEl)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Check if two rectangles overlap
   */
  rectanglesOverlap(rect1, rect2) {
    return !(rect1.x + rect1.width <= rect2.x ||
             rect2.x + rect2.width <= rect1.x ||
             rect1.y + rect1.height <= rect2.y ||
             rect2.y + rect2.height <= rect1.y)
  }

  /**
   * Get a description of the shape
   */
  getDescription() {
    if (this.type === 'RECTANGLE') {
      return `${Math.round(this.length)} × ${Math.round(this.width)}mm Rectangle`
    } else if (this.type === 'L_SHAPE') {
      return `${Math.round(this.length)} × ${Math.round(this.width)}mm L-Shape (${Math.round(this.efficiency * 100)}% fill)`
    }
    return 'Unknown shape'
  }

  /**
   * Clone this shape
   */
  clone() {
    return new DimensionShape({
      type: this.type,
      length: this.length,
      width: this.width,
      lShapeConfig: this.lShapeConfig ? { ...this.lShapeConfig } : undefined,
      metadata: { ...this.metadata }
    })
  }

  /**
   * Convert to JSON for storage/transmission
   */
  toJSON() {
    return {
      type: this.type,
      length: this.length,
      width: this.width,
      lShapeConfig: this.lShapeConfig,
      boundingBox: this.boundingBox,
      actualArea: this.actualArea,
      efficiency: this.efficiency,
      metadata: this.metadata
    }
  }

  /**
   * Create from JSON
   */
  static fromJSON(json) {
    return new DimensionShape(json)
  }
}

export default DimensionShape