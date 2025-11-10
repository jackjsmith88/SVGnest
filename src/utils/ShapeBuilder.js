/**
 * ShapeBuilder - Create and manage shapes with real-world dimensions
 * Handles conversion from real dimensions (cm/mm) to SVG pixels
 * Uses standard 96 DPI: 1 inch = 2.54cm = 96px, so 1cm = 37.795px
 */

export class ShapeBuilder {
  constructor(binWidthCm, binHeightCm, binWidthPx = null, binHeightPx = null) {
    // Standard DPI conversion: 96 DPI = 96 pixels per inch = 96 / 2.54 pixels per cm
    const PX_PER_CM = 96 / 2.54 // â‰ˆ 37.795 px/cm
    
    this.binWidthCm = binWidthCm
    this.binHeightCm = binHeightCm
    
    // If pixel dimensions not provided, calculate from cm using standard DPI
    this.binWidthPx = binWidthPx || Math.round(binWidthCm * PX_PER_CM)
    this.binHeightPx = binHeightPx || Math.round(binHeightCm * PX_PER_CM)
    
    // Always use standard DPI for shape conversion
    this.pxPerCm = PX_PER_CM
    
    console.log(`ShapeBuilder initialized: ${binWidthCm}Ã—${binHeightCm}cm -> ${this.binWidthPx}Ã—${this.binHeightPx}px`)
    console.log(`Scale: ${this.pxPerCm.toFixed(3)} px/cm (96 DPI standard)`)
  }
  
  /**
   * Convert cm to pixels
   */
  cmToPx(cm) {
    return cm * this.pxPerCm
  }
  
  /**
   * Convert mm to pixels
   */
  mmToPx(mm) {
    return (mm / 10) * this.pxPerCm
  }
  
  /**
   * Create a rectangle shape
   * @param {number} widthCm - Width in centimeters
   * @param {number} heightCm - Height in centimeters
   * @param {string} id - Unique identifier
   */
  createRectangle(widthCm, heightCm, id) {
    const widthPx = this.cmToPx(widthCm)
    const heightPx = this.cmToPx(heightCm)
    
    return {
      id: id || `rect-${Date.now()}`,
      type: 'rectangle',
      widthCm,
      heightCm,
      widthPx,
      heightPx,
      points: [
        { x: 0, y: 0 },
        { x: widthPx, y: 0 },
        { x: widthPx, y: heightPx },
        { x: 0, y: heightPx }
      ]
    }
  }
  
  /**
   * Create an L-shape
   * @param {number} totalWidthCm - Total width
   * @param {number} totalHeightCm - Total height
   * @param {number} armWidthCm - Width of the arm
   * @param {number} armHeightCm - Height of the arm
   * @param {string} id - Unique identifier
   */
  createLShape(totalWidthCm, totalHeightCm, armWidthCm, armHeightCm, id) {
    const w = this.cmToPx(totalWidthCm)
    const h = this.cmToPx(totalHeightCm)
    const aw = this.cmToPx(armWidthCm)
    const ah = this.cmToPx(armHeightCm)
    
    // L-shape points (clockwise from top-left)
    return {
      id: id || `lshape-${Date.now()}`,
      type: 'lshape',
      totalWidthCm,
      totalHeightCm,
      armWidthCm,
      armHeightCm,
      points: [
        { x: 0, y: 0 },
        { x: aw, y: 0 },
        { x: aw, y: h - ah },
        { x: w, y: h - ah },
        { x: w, y: h },
        { x: 0, y: h }
      ]
    }
  }
  
  /**
   * Create a T-shape
   * @param {number} topWidthCm - Width of top bar
   * @param {number} topHeightCm - Height of top bar
   * @param {number} stemWidthCm - Width of stem
   * @param {number} stemHeightCm - Height of stem
   * @param {string} id - Unique identifier
   */
  createTShape(topWidthCm, topHeightCm, stemWidthCm, stemHeightCm, id) {
    const tw = this.cmToPx(topWidthCm)
    const th = this.cmToPx(topHeightCm)
    const sw = this.cmToPx(stemWidthCm)
    const sh = this.cmToPx(stemHeightCm)
    
    const centerOffset = (tw - sw) / 2
    
    return {
      id: id || `tshape-${Date.now()}`,
      type: 'tshape',
      topWidthCm,
      topHeightCm,
      stemWidthCm,
      stemHeightCm,
      points: [
        { x: 0, y: 0 },
        { x: tw, y: 0 },
        { x: tw, y: th },
        { x: centerOffset + sw, y: th },
        { x: centerOffset + sw, y: th + sh },
        { x: centerOffset, y: th + sh },
        { x: centerOffset, y: th }
      ]
    }
  }
  
  /**
   * Create a custom polygon from points in cm
   * @param {Array} pointsCm - Array of {x, y} points in centimeters
   * @param {string} id - Unique identifier
   */
  createCustomPolygon(pointsCm, id) {
    const pointsPx = pointsCm.map(p => ({
      x: this.cmToPx(p.x),
      y: this.cmToPx(p.y)
    }))
    
    return {
      id: id || `custom-${Date.now()}`,
      type: 'custom',
      pointsCm,
      points: pointsPx
    }
  }
  
  /**
   * Create a circle/ellipse (approximated as polygon)
   * @param {number} radiusCm - Radius in centimeters
   * @param {number} segments - Number of segments (more = smoother curve)
   * @param {string} id - Unique identifier
   */
  createCircle(radiusCm, segments = 32, id) {
    const radiusPx = this.cmToPx(radiusCm)
    const points = []
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      points.push({
        x: radiusPx + radiusPx * Math.cos(angle),
        y: radiusPx + radiusPx * Math.sin(angle)
      })
    }
    
    return {
      id: id || `circle-${Date.now()}`,
      type: 'circle',
      radiusCm,
      segments,
      points
    }
  }
  
  /**
   * Convert shape to SVG polygon element string with label
   * @param {Object} shape - Shape object from create methods
   * @param {number} offsetX - X offset in pixels
   * @param {number} offsetY - Y offset in pixels
   * @param {number} index - Shape index for labeling
   */
  shapeToSVGPolygon(shape, offsetX = 0, offsetY = 0, index = 0) {
    const pointsStr = shape.points
      .map(p => `${(p.x + offsetX).toFixed(6)},${(p.y + offsetY).toFixed(6)}`)
      .join(' ')
    
    // Calculate center for text label
    const centerX = offsetX + (Math.max(...shape.points.map(p => p.x)) / 2)
    const centerY = offsetY + (Math.max(...shape.points.map(p => p.y)) / 2)
    
    return `<polygon id="${shape.id}" points="${pointsStr}" fill="rgba(33, 150, 243, 0.3)" stroke="#2196F3" stroke-width="2"/>
    <text x="${centerX}" y="${centerY}" font-size="24" font-weight="bold" fill="#1976D2" text-anchor="middle" dominant-baseline="middle">${index + 1}</text>`
  }
  
  /**
   * Create bin rectangle as a polygon (consistent with shapes)
   */
  createBinSVG() {
    // Create bin as polygon so SVGnest treats it consistently
    const points = `0,0 ${this.binWidthPx.toFixed(6)},0 ${this.binWidthPx.toFixed(6)},${this.binHeightPx.toFixed(6)} 0,${this.binHeightPx.toFixed(6)}`
    return `<polygon id="bin" points="${points}" fill="none" stroke="#3bb34a" stroke-width="2"/>`
  }
  
  /**
   * Convert multiple shapes to complete SVG
   * @param {Array} shapes - Array of shape objects
   */
  shapesToSVG(shapes) {
    // Position shapes in a grid layout for initial display
    // SVGnest will repack them, but this prevents overlapping in the preview
  let x = 0
  let y = 0
  let rowHeight = 0
  const margin = 0
    
    const shapeSVGs = shapes.map((shape, index) => {
      const shapeWidth = Math.max(...shape.points.map(p => p.x))
      const shapeHeight = Math.max(...shape.points.map(p => p.y))
      
      // Wrap to next row if the NEXT position would exceed bin width
      // Use a small tolerance to handle floating-point accumulation
      const nextX = x + shapeWidth
      if (nextX > this.binWidthPx + 0.1 && x > 0) {
        console.log(`Wrapping at shape ${index}: currentX=${x.toFixed(2)}, nextX would be=${nextX.toFixed(2)}, binWidth=${this.binWidthPx}`)
        x = 0
        y += rowHeight + margin
        rowHeight = 0
      }
      
      const svg = this.shapeToSVGPolygon(shape, x, y, index)
      
      x += shapeWidth + margin
      rowHeight = Math.max(rowHeight, shapeHeight)
      
      return svg
    })
    
    const binSVG = this.createBinSVG()
    
    // Log the shapes being generated
    console.log(`Creating SVG with ${shapes.length} shapes`)
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.binWidthPx}" height="${this.binHeightPx}" viewBox="0 0 ${this.binWidthPx} ${this.binHeightPx}">
      ${binSVG}
      ${shapeSVGs.join('\n      ')}
    </svg>`
  }
}

/**
 * Preset configurations for common scenarios
 */
export const PRESETS = {
  // Standard sheet metal sizes
  SHEET_320x160: {
    name: '320cm Ã— 160cm Sheet',
    binWidthCm: 320,
    binHeightCm: 160
  },
  SHEET_244x122: {
    name: '244cm Ã— 122cm Sheet (8ft Ã— 4ft)',
    binWidthCm: 244,
    binHeightCm: 122
  },
  SHEET_200x100: {
    name: '200cm Ã— 100cm Sheet',
    binWidthCm: 200,
    binHeightCm: 100
  },
  
  // Custom demo bin
  DEMO: {
    name: 'Demo Bin (40cm Ã— 30cm)',
    binWidthCm: 40,
    binHeightCm: 30
  }
}

export default ShapeBuilder