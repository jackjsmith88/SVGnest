/**
 * CutShape - Represents a worktop cut shape for cutting optimization
 * 
 * Supports:
 * - Simple rectangles (RECTANGLE)
 * - L-shapes (L-SHAPE) - two rectangles at 90° angles
 * - Complex shapes (COMPLEX) - multiple pieces with arbitrary arrangements
 * 
 * @class CutShape
 */
export class CutShape {
  /**
   * @param {Object} config - Configuration for the cut shape
   * @param {string} config.type - Shape type: 'RECTANGLE', 'L-SHAPE', 'COMPLEX'
   * @param {number} config.length - Overall length (longest dimension)
   * @param {number} config.width - Overall width (perpendicular to length)
   * @param {Array} config.components - Array of component rectangles
   * @param {Object} config.metadata - Additional metadata (job info, page, etc.)
   */
  constructor(config) {
    this.type = config.type || 'RECTANGLE';
    this.length = config.length;
    this.width = config.width;
    this.components = config.components || [];
    this.cavities = config.cavities || []; // Void/hollow areas within the bounding box
    this.metadata = config.metadata || {};
    this.isMerged = this.components.length > 1;
    
    // Calculate bounding box
    this.boundingBox = {
      length: this.length,
      width: this.width,
      area: this.length * this.width
    };
    
    // Calculate actual area (sum of component areas)
    this.actualArea = this.components.reduce((sum, comp) => {
      return sum + (comp.length * comp.width);
    }, 0);
    
    // Calculate cavity area (sum of void areas)
    this.cavityArea = this.cavities.reduce((sum, cavity) => {
      return sum + (cavity.length * cavity.width);
    }, 0);
    
    // Efficiency ratio (actual vs bounding box)
    this.efficiency = this.boundingBox.area > 0 
      ? (this.actualArea / this.boundingBox.area) 
      : 1;
  }

  /**
   * Create a simple rectangular cut
   * @param {number} length - Length in mm
   * @param {number} width - Width in mm
   * @param {Object} metadata - Optional metadata
   * @returns {CutShape}
   */
  static createRectangle(length, width, metadata = {}) {
    return new CutShape({
      type: 'RECTANGLE',
      length,
      width,
      components: [{
        length,
        width,
        x: 0,
        y: 0,
        rotation: 0
      }],
      metadata
    });
  }

  /**
   * Create an L-shaped cut from two rectangles
   * @param {Object} piece1 - First rectangle { length, width }
   * @param {Object} piece2 - Second rectangle { length, width }
   * @param {Object} metadata - Optional metadata
   * @returns {CutShape}
   */
  static createLShape(piece1, piece2, metadata = {}) {
    // Determine orientation: which piece is the base, which is the arm
    // Base is typically the longer piece
    const base = piece1.length >= piece2.length ? piece1 : piece2;
    const arm = piece1.length >= piece2.length ? piece2 : piece1;
    
    // For a proper L-shape, we need to consider the actual arrangement:
    // The base piece is horizontal, the arm extends vertically from one end
    // Bounding box should be: max(base.length, arm.length) × (base.width + arm.width)
    
    // Always create a proper L-shape arrangement
    const finalLength = Math.max(base.length, arm.length);
    const finalWidth = base.width + arm.width;
    
    // Define component positions for proper L-shape
    // Base piece spans the full width horizontally at the top
    // Arm piece extends vertically from the left side only
    const components = [
      // Base piece - horizontal at the top, spans full length
      {
        length: base.length,
        width: base.width,
        x: 0,
        y: 0,
        rotation: 0,
        role: 'base'
      },
      // Arm piece - positioned below base, only spans arm.length horizontally
      {
        length: arm.length,
        width: arm.width,
        x: 0, // Starts at left edge
        y: base.width, // Positioned directly below the base
        rotation: 0,
        role: 'arm'
      }
    ];

    // Calculate cavities (void space within bounding box)
    const cavities = [];
    
    // For L-shape, the cavity is in the lower-right corner
    // It's the space not occupied by either the base or arm pieces
    const cavityLength = finalLength - arm.length; // Horizontal cavity width
    const cavityWidth = arm.width; // Vertical cavity height
    
    if (cavityLength > 0 && cavityWidth > 0) {
      cavities.push({
        length: cavityLength,
        width: cavityWidth,
        x: arm.length, // Start where the arm ends
        y: base.width, // Start below the base piece
        rotation: 0,
        type: 'corner-void'
      });
    }

    return new CutShape({
      type: 'L-SHAPE',
      length: finalLength,
      width: finalWidth,
      components,
      cavities,
      metadata: {
        ...metadata,
        arrangement: 'l-shape'
      }
    });
  }

  /**
   * Create a complex cut from multiple rectangles
   * @param {Array} pieces - Array of rectangles { length, width }
   * @param {Object} metadata - Optional metadata
   * @returns {CutShape}
   */
  static createComplex(pieces, metadata = {}) {
    // For complex shapes, use simple bounding box approach
    const maxLength = Math.max(...pieces.map(p => p.length));
    const totalWidth = pieces.reduce((sum, p) => sum + p.width, 0);
    
    const components = pieces.map((piece, idx) => ({
      length: piece.length,
      width: piece.width,
      x: 0,
      y: idx > 0 ? pieces.slice(0, idx).reduce((sum, p) => sum + p.width, 0) : 0,
      rotation: 0,
      index: idx
    }));

    return new CutShape({
      type: 'COMPLEX',
      length: maxLength,
      width: totalWidth,
      components,
      metadata
    });
  }

  /**
   * Convert to a simple object for storage/transmission
   * @returns {Object}
   */
  toJSON() {
    return {
      type: this.type,
      length: this.length,
      width: this.width,
      boundingBox: this.boundingBox,
      actualArea: this.actualArea,
      cavityArea: this.cavityArea,
      efficiency: this.efficiency,
      isMerged: this.isMerged,
      components: this.components,
      cavities: this.cavities,
      metadata: this.metadata
    };
  }

  /**
   * Create a CutShape from a stored JSON object
   * @param {Object} json - JSON representation
   * @returns {CutShape}
   */
  static fromJSON(json) {
    return new CutShape(json);
  }

  /**
   * Get SVG path data for rendering the shape
   * @param {number} scale - Scale factor (default: 1)
   * @returns {string} SVG path data
   */
  getSVGPath(scale = 1) {
    const paths = this.components.map(comp => {
      const x = (comp.x || 0) * scale;
      const y = (comp.y || 0) * scale;
      const w = comp.length * scale;
      const h = comp.width * scale;
      
      return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
    });
    
    return paths.join(' ');
  }

  /**
   * Check if a point is inside the cut shape
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean}
   */
  containsPoint(x, y) {
    return this.components.some(comp => {
      const compX = comp.x || 0;
      const compY = comp.y || 0;
      const compMaxX = compX + comp.length;
      const compMaxY = compY + comp.width;
      
      return x >= compX && x <= compMaxX && y >= compY && y <= compMaxY;
    });
  }

  /**
   * Check if this shape overlaps with another CutShape
   * @param {CutShape} other - Another CutShape
   * @param {number} thisX - X position of this shape
   * @param {number} thisY - Y position of this shape
   * @param {number} otherX - X position of other shape
   * @param {number} otherY - Y position of other shape
   * @returns {boolean}
   */
  overlaps(other, thisX = 0, thisY = 0, otherX = 0, otherY = 0) {
    // Check if any component of this shape overlaps with any component of other shape
    for (const thisComp of this.components) {
      const thisCompX = thisX + (thisComp.x || 0);
      const thisCompY = thisY + (thisComp.y || 0);
      const thisCompMaxX = thisCompX + thisComp.length;
      const thisCompMaxY = thisCompY + thisComp.width;
      
      for (const otherComp of other.components) {
        const otherCompX = otherX + (otherComp.x || 0);
        const otherCompY = otherY + (otherComp.y || 0);
        const otherCompMaxX = otherCompX + otherComp.length;
        const otherCompMaxY = otherCompY + otherComp.width;
        
        // Check for overlap using AABB (Axis-Aligned Bounding Box) collision
        const xOverlap = thisCompX < otherCompMaxX && thisCompMaxX > otherCompX;
        const yOverlap = thisCompY < otherCompMaxY && thisCompMaxY > otherCompY;
        
        if (xOverlap && yOverlap) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Get a human-readable description of the cut
   * @returns {string}
   */
  getDescription() {
    if (this.type === 'RECTANGLE') {
      return `${this.length} × ${this.width} mm`;
    } else if (this.type === 'L-SHAPE') {
      const arrangement = this.metadata.arrangement || 'unknown';
      return `${this.length} × ${this.width} mm (L-shape, ${arrangement}, ${this.components.length} pieces)`;
    } else {
      return `${this.length} × ${this.width} mm (${this.components.length} pieces)`;
    }
  }

  /**
   * Clone this CutShape
   * @returns {CutShape}
   */
  clone() {
    return new CutShape({
      type: this.type,
      length: this.length,
      width: this.width,
      components: this.components.map(c => ({ ...c })),
      cavities: this.cavities ? this.cavities.map(c => ({ ...c })) : [],
      metadata: { ...this.metadata }
    });
  }
}

export default CutShape;