/**
 * ShapeBuilder - Create and manage shapes with real-world dimensions
 * Handles conversion from real dimensions (cm/mm) to SVG pixels
 * Uses standard 96 DPI: 1 inch = 2.54cm = 96px, so 1cm = 37.795px
 */

export class ShapeBuilder {
  constructor(binWidthCm, binHeightCm, binWidthPx = null, binHeightPx = null) {
    const PX_PER_CM = 96 / 2.54
    
    this.binWidthCm = binWidthCm
    this.binHeightCm = binHeightCm
    
    // If pixel dimensions not provided, calculate from cm using standard DPI
    this.binWidthPx = binWidthPx || Math.round(binWidthCm * PX_PER_CM)
    this.binHeightPx = binHeightPx || Math.round(binHeightCm * PX_PER_CM)
    
    this.pxPerCm = PX_PER_CM
    
    // Stroke configuration - shapes will be adjusted to account for stroke width
    this.shapeStrokeWidth = 1  // px - stroke on shapes
    this.binStrokeWidth = 1    // px - stroke on bin
    
    // Inset shapes by half the stroke width so visual size matches actual dimensions
    this.shapeInset = this.shapeStrokeWidth / 2
    
    console.log(`ShapeBuilder initialized: ${binWidthCm}×${binHeightCm}cm -> ${this.binWidthPx}×${this.binHeightPx}px`)
    console.log(`Scale: ${this.pxPerCm.toFixed(3)} px/cm (96 DPI standard)`)
    console.log(`Stroke compensation: ${this.shapeInset}px inset for ${this.shapeStrokeWidth}px stroke`)
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
    
    // Inset by half stroke width so visual size matches actual dimensions
    const inset = this.shapeInset
    
    return {
      id: id || `rect-${Date.now()}`,
      type: 'rectangle',
      widthCm,
      heightCm,
      widthPx,
      heightPx,
      points: [
        { x: inset, y: inset },
        { x: widthPx - inset, y: inset },
        { x: widthPx - inset, y: heightPx - inset },
        { x: inset, y: heightPx - inset }
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
    const inset = this.shapeInset
    
    // L-shape points (COUNTER-CLOCKWISE from top-left) - SVGnest requires CCW for proper NFP
    // This is critical for interlocking - clockwise polygons can cause NFP calculation failures
    const points = [
      { x: inset, y: inset },                      // 1. Top-left
      { x: inset, y: h - inset },                  // 2. Bottom-left (go down)
      { x: w - inset, y: h - inset },              // 3. Bottom-right (go right)
      { x: w - inset, y: h - ah - inset },         // 4. Top-right of horizontal arm (go up)
      { x: aw - inset, y: h - ah - inset },        // 5. Inner corner (go left)
      { x: aw - inset, y: inset }                  // 6. Top-right of vertical arm (go up)
    ]
    
    // Calculate actual bounding box
    const minX = Math.min(...points.map(p => p.x))
    const maxX = Math.max(...points.map(p => p.x))
    const minY = Math.min(...points.map(p => p.y))
    const maxY = Math.max(...points.map(p => p.y))
    
    const shape = {
      id: id || `lshape-${Date.now()}`,
      type: 'lshape',
      totalWidthCm,
      totalHeightCm,
      armWidthCm,
      armHeightCm,
      widthPx: maxX - minX,   // Add computed width for layout
      heightPx: maxY - minY,  // Add computed height for layout
      points
    }
    
    console.log('L-Shape created:', {
      dimensions: `${totalWidthCm}×${totalHeightCm}cm (arm: ${armWidthCm}×${armHeightCm}cm)`,
      pixels: `${w.toFixed(2)}×${h.toFixed(2)}px (arm: ${aw.toFixed(2)}×${ah.toFixed(2)}px)`,
      boundingBox: `${shape.widthPx.toFixed(2)}×${shape.heightPx.toFixed(2)}px`,
      points: points.length,
      inset: inset
    })
    
    return shape
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
    const inset = this.shapeInset
    
    const centerOffset = (tw - sw) / 2
    
    return {
      id: id || `tshape-${Date.now()}`,
      type: 'tshape',
      topWidthCm,
      topHeightCm,
      stemWidthCm,
      stemHeightCm,
      points: [
        { x: inset, y: inset },
        { x: tw - inset, y: inset },
        { x: tw - inset, y: th - inset },
        { x: centerOffset + sw - inset, y: th - inset },
        { x: centerOffset + sw - inset, y: th + sh - inset },
        { x: centerOffset + inset, y: th + sh - inset },
        { x: centerOffset + inset, y: th - inset }
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
   * Stroke-compensated: polygon is inset so visual size matches actual dimensions
   */
  shapeToSVGPolygon(shape, offsetX = 0, offsetY = 0, index = 0) {
    const pointsStr = shape.points
      .map(p => `${(p.x + offsetX).toFixed(2)},${(p.y + offsetY).toFixed(2)}`)
      .join(' ')
    
    // Calculate bounding box from actual points
    const minX = Math.min(...shape.points.map(p => p.x))
    const maxX = Math.max(...shape.points.map(p => p.x))
    const minY = Math.min(...shape.points.map(p => p.y))
    const maxY = Math.max(...shape.points.map(p => p.y))
    
    // Calculate center from bounding box
    const centerX = offsetX + (minX + maxX) / 2
    const centerY = offsetY + (minY + maxY) / 2
    
    return `<polygon id="${shape.id}" points="${pointsStr}" fill="rgba(33, 150, 243, 0.3)" stroke="#2196F3" stroke-width="${this.shapeStrokeWidth}"/>
    <text x="${centerX.toFixed(2)}" y="${centerY.toFixed(2)}" font-size="24" font-weight="bold" fill="#1976D2" text-anchor="middle" dominant-baseline="middle">${index + 1}</text>`
  }
  
  /**
   * Create bin rectangle as a polygon (consistent with shapes)
   */
  createBinSVG() {
    const points = `0,0 ${this.binWidthPx},0 ${this.binWidthPx},${this.binHeightPx} 0,${this.binHeightPx}`
    return `<polygon id="bin" points="${points}" fill="none" stroke="#3bb34a" stroke-width="${this.binStrokeWidth}"/>`
  }
  
  /**
   * Convert multiple shapes to complete SVG
   * @param {Array} shapes - Array of shape objects
   */
  shapesToSVG(shapes) {
    let x = 0
    let y = 0
    let rowHeight = 0
    const margin = 0
    
    const shapeSVGs = shapes.map((shape, index) => {
      const shapeWidth = Math.max(...shape.points.map(p => p.x))
      const shapeHeight = Math.max(...shape.points.map(p => p.y))
      
      const nextX = x + shapeWidth
      if (nextX > this.binWidthPx + 0.1 && x > 0) {
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