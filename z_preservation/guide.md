# SVGnest Documentation

## Overview

SVGnest is a browser-based vector nesting tool that uses a genetic algorithm to pack irregular shapes into a container (bin) efficiently. It's designed for CNC machines, laser cutters, and plasma cutters to minimize material waste.

**Key Features:**
- Irregular bin packing using genetic algorithms
- Support for concave shapes and part-in-part nesting
- No Fit Polygon (NFP) calculation for collision detection
- Web Worker-based parallel processing
- Real-time optimization with continuous improvement

---

## Core Files

### 1. svgnest.js
Main orchestration file that handles the nesting algorithm, genetic algorithm, and workflow coordination.

### 2. svgparser.js
Parses SVG files and converts them into polygon representations suitable for the nesting algorithm.

---

## Main API: SvgNest Class

The library exposes a global `SvgNest` object through `root.SvgNest`.

### Properties

#### `this.style`
- **Type:** SVG style node reference
- **Purpose:** Maintains color/fill information from the original SVG

#### `this.working`
- **Type:** Boolean
- **Purpose:** Indicates whether the nesting algorithm is currently running

---

## Methods

### `parsesvg(svgstring)`

Parses an SVG string and prepares it for nesting.

**Parameters:**
- `svgstring` (String): The SVG file content as a string

**Returns:**
- SVG DOM element with parsed paths

**Behavior:**
- Resets any in-progress nesting operation
- Clears bin, binPolygon, and tree data
- Uses `SvgParser.load()` to parse the SVG
- Filters out non-closed shapes (text, images, etc.)
- Builds a hierarchy tree of parts and holes
- Orders parts by size (Z-ordering)

**Example:**
```javascript
var svgContent = '<svg>...</svg>';
var svg = window.SvgNest.parsesvg(svgContent);
```

---

### `setbin(element)`

Sets which SVG element should be used as the container/bin.

**Parameters:**
- `element` (SVG Element): The SVG path element to use as the bin

**Behavior:**
- Designates one outline as the container
- All other outlines become parts to nest

**Example:**
```javascript
var binElement = document.querySelector('.bin-outline');
window.SvgNest.setbin(binElement);
```

---

### `config(configObject)`

Gets or sets configuration parameters for the nesting algorithm.

**Parameters:**
- `configObject` (Object, optional): Configuration options. If omitted, returns current config.

**Configuration Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `clipperScale` | Number | 10000000 | Scaling factor for Clipper library calculations |
| `curveTolerance` | Number | 0.3 | Tolerance for converting curves to line segments (lower = more accurate) |
| `spacing` | Number | 0 | Minimum spacing between parts (in SVG pixels) |
| `rotations` | Number | 4 | Number of rotation angles to try (0 = no rotation, 4 = 0°, 90°, 180°, 270°) |
| `populationSize` | Number | 10 | Size of genetic algorithm population (higher = better results, slower) |
| `mutationRate` | Number | 10 | Mutation rate for genetic algorithm (percentage) |
| `useHoles` | Boolean | false | Whether to place parts inside holes of other parts |
| `exploreConcave` | Boolean | false | Whether to explore concave areas for better packing |

**Returns:**
- Current configuration object (if no parameter provided)
- Nothing (if parameter provided)

**Validation:**
- `curveTolerance`: Must not equal 0
- `rotations`: Must be > 0
- `populationSize`: Must be > 2
- `mutationRate`: Must be > 0

**Example:**
```javascript
// Get current config
var currentConfig = window.SvgNest.config();

// Set new config
window.SvgNest.config({
  spacing: 5,
  rotations: 8,
  populationSize: 20,
  useHoles: true,
  exploreConcave: true
});
```

---

### `start(progressCallback, displayCallback)`

Starts the nesting process with continuous optimization.

**Parameters:**
- `progressCallback` (Function): Called periodically with progress updates
  - Receives: `(progress)` where progress is 0-1
- `displayCallback` (Function): Called when a new best placement is found
  - Receives: `(placements, efficiency, numPlacedParts, totalParts)`
    - `placements`: Array of SVG elements showing the nested result
    - `efficiency`: Ratio of placed area to total bin area (0-1)
    - `numPlacedParts`: Number of parts successfully placed
    - `totalParts`: Total number of parts to place

**Returns:**
- `false` if SVG or bin not set, otherwise nothing

**Behavior:**
- Builds part tree from parsed SVG (excluding bin)
- Applies spacing offset to parts
- Converts bin to polygon representation
- Initializes genetic algorithm
- Launches web workers for parallel NFP calculation
- Continuously evaluates and improves placements
- Caches No Fit Polygons (NFPs) for performance

**Example:**
```javascript
window.SvgNest.start(
  function(progress) {
    console.log('Progress: ' + (progress * 100) + '%');
  },
  function(placements, efficiency, numPlaced, total) {
    console.log('Placed ' + numPlaced + '/' + total + ' parts');
    console.log('Efficiency: ' + (efficiency * 100) + '%');
    // Display placements in UI
    placements.forEach(function(svg) {
      document.getElementById('display').appendChild(svg);
    });
  }
);
```

---

### `stop()`

Stops the nesting process.

**Behavior:**
- Sets `this.working` to false
- Clears the worker timer
- Stops all web workers

**Example:**
```javascript
window.SvgNest.stop();
```

---

### `applyPlacement(placement)`

Converts placement data into SVG elements for export or rendering.

**Parameters:**
- `placement` (Array): Placement data from genetic algorithm
  - Structure: Array of bins, each containing array of placed parts with positions and rotations

**Returns:**
- Array of SVG elements, one for each bin with all placed parts

**Behavior:**
- Clones original SVG and parts
- Applies transformations (translation, rotation) to each part
- Handles nested parts (parts within holes)
- Sets proper viewBox and dimensions
- Adds CSS classes (e.g., 'bin', 'hole')

**Example:**
```javascript
var svgElements = window.SvgNest.applyPlacement(bestPlacement);
svgElements.forEach(function(svg) {
  document.body.appendChild(svg);
});
```

---

### `getParts(paths)`

Builds a hierarchical tree structure from SVG paths.

**Parameters:**
- `paths` (Array): Array of SVG path elements

**Returns:**
- Tree structure where:
  - Odd-level leaves are parts (outlines)
  - Even-level leaves are holes (inside other parts)
  - Each node has `children` and `childNodes` properties

**Behavior:**
- Converts paths to polygons using `SvgParser.polygonify()`
- Determines parent-child relationships based on containment
- Orders by size (larger parts first)
- Marks holes vs solid parts

---

### `polygonOffset(polygon, offset)`

Creates an offset (inward or outward) version of a polygon.

**Parameters:**
- `polygon` (Array): Array of points `[{x, y}, ...]`
- `offset` (Number): Offset distance (positive = outward, negative = inward)

**Returns:**
- Array of offset polygons (may return multiple for complex shapes)

**Behavior:**
- Uses Clipper library for robust offsetting
- Handles self-intersections
- Returns simplified polygons
- Used for applying spacing between parts

---

## SvgParser Methods

The `SvgParser` object provides SVG parsing functionality.

### `SvgParser.load(svgstring)`

Parses an SVG string into a DOM element.

**Parameters:**
- `svgstring` (String): SVG content

**Returns:**
- SVG DOM element

---

### `SvgParser.polygonify(element)`

Converts an SVG path element into an array of polygon points.

**Parameters:**
- `element` (SVG Element): Path, rect, circle, ellipse, polygon, or polyline element

**Returns:**
- Array of points: `[{x: number, y: number, exact: boolean}, ...]`
- `exact: true` for straight line segments
- `exact: false` for approximated curve segments

**Behavior:**
- Handles all SVG shape types
- Converts curves (Bezier, arcs) to line segments
- Uses `curveTolerance` config for curve approximation
- Applies element transforms

---

## Internal Data Structures

### Polygon Format
```javascript
{
  x: number,           // X coordinate
  y: number,           // Y coordinate
  exact: boolean,      // true if from straight line, false if curve approximation
  id: number,          // Unique identifier
  source: number,      // Index of original SVG element
  rotation: number,    // Current rotation angle
  children: Array,     // Child polygons (holes)
  childNodes: Array    // SVG element children
}
```

### Placement Format
```javascript
{
  id: number,          // Polygon ID
  x: number,           // X position
  y: number,           // Y position
  rotation: number     // Rotation angle (degrees)
}
```

### NFP Cache Key Format
```javascript
{
  A: number,           // First polygon ID
  B: number,           // Second polygon ID  
  inside: boolean,     // Interior or exterior NFP
  Arotation: number,   // A's rotation
  Brotation: number    // B's rotation
}
```

---

## Genetic Algorithm

### Gene Structure
- **Insertion Order:** The order in which parts are placed
- **Rotations:** Array of rotation angles for each part

### Fitness Function (in order of priority)
1. Minimize unplaceable parts (parts that don't fit)
2. Minimize number of bins used
3. Maximize material utilization (minimize total bin area)

### Process
1. Initialize population with randomized genes
2. Evaluate fitness for each individual
3. Select best individuals
4. Create next generation through crossover and mutation
5. Repeat until stopped by user

---

## Usage Example (Complete Workflow)

```javascript
// 1. Parse SVG
var svgContent = document.getElementById('file-input').value;
var svg = window.SvgNest.parsesvg(svgContent);
document.getElementById('preview').appendChild(svg);

// 2. User selects bin element (e.g., by clicking)
document.querySelectorAll('path').forEach(function(path) {
  path.addEventListener('click', function() {
    window.SvgNest.setbin(this);
    this.style.stroke = 'red'; // Highlight bin
  });
});

// 3. Configure nesting parameters
window.SvgNest.config({
  spacing: 5,              // 5 pixels between parts
  rotations: 4,            // Try 4 rotation angles
  populationSize: 15,      // Larger population for better results
  curveTolerance: 0.3,     // Balance between accuracy and performance
  useHoles: true,          // Enable part-in-part nesting
  exploreConcave: true     // Explore concave areas
});

// 4. Start nesting
var bestResult = null;
window.SvgNest.start(
  // Progress callback
  function(progress) {
    document.getElementById('progress').textContent = 
      Math.round(progress * 100) + '%';
  },
  // Display callback
  function(placements, efficiency, numPlaced, total) {
    bestResult = placements;
    
    // Clear previous display
    var display = document.getElementById('result');
    display.innerHTML = '';
    
    // Show new placement
    placements.forEach(function(svg) {
      display.appendChild(svg);
    });
    
    // Update stats
    document.getElementById('efficiency').textContent = 
      Math.round(efficiency * 100) + '%';
    document.getElementById('placed').textContent = 
      numPlaced + ' / ' + total;
  }
);

// 5. Stop when satisfied
document.getElementById('stop-button').addEventListener('click', function() {
  window.SvgNest.stop();
});

// 6. Export result
document.getElementById('export-button').addEventListener('click', function() {
  if (bestResult && bestResult.length > 0) {
    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(bestResult[0]);
    
    // Save to file
    var blob = new Blob([svgString], {type: 'image/svg+xml'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'nested-output.svg';
    a.click();
  }
});
```

---

## Performance Considerations

### Memory
- NFP cache grows with number of unique part/rotation combinations
- Cache is cleared between generations to manage memory
- Each worker spawned consumes additional memory

### CPU
- Parallel.js spawns multiple web workers for NFP calculations
- Performance scales with available CPU cores
- Genetic algorithm runs indefinitely until stopped

### Optimization Tips
1. **Reduce rotations** for faster results (but potentially lower quality)
2. **Increase populationSize** for better results (but slower)
3. **Decrease curveTolerance** for more accurate curves (but slower)
4. **Use exploreConcave sparingly** - significant performance impact
5. **Enable useHoles** only when needed for part-in-part nesting

---

## Dependencies

Required libraries (must be loaded before SVGnest):
- `util/pathsegpolyfill.js` - SVG path segment polyfill
- `util/matrix.js` - Matrix transformation utilities
- `util/domparser.js` - DOM parsing utilities
- `util/clipper.js` - Clipper library for polygon operations
- `util/parallel.js` - Parallel.js for web workers
- `util/geometryutil.js` - Geometry utility functions
- `util/placementworker.js` - Placement worker logic

---

## Common Issues & Solutions

### Issue: Parts slightly overlap
**Cause:** Curve tolerance too high
**Solution:** Decrease `curveTolerance` parameter (e.g., from 0.3 to 0.1)

### Issue: Text or images don't appear
**Cause:** Only closed shapes are supported
**Solution:** Convert text and images to outlines/paths in your SVG editor

### Issue: Slow performance
**Cause:** Too many rotations or high population size
**Solution:** Reduce `rotations` and `populationSize`

### Issue: Parts not placed inside holes
**Cause:** `useHoles` disabled
**Solution:** Enable `useHoles: true` in config

### Issue: Poor utilization of concave spaces
**Cause:** `exploreConcave` disabled
**Solution:** Enable `exploreConcave: true` (warning: slower)

---

## SVG Requirements

For best results, your SVG should:
1. **Contain only closed paths** - Convert all elements to outlines
2. **Have no overlapping outlines** - Ensure clean geometry
3. **Use simple transforms** - Complex transforms may not parse correctly
4. **Define one clear bin** - One outline designated as container
5. **Have reasonable complexity** - Extremely detailed paths slow processing

---

## Algorithm Details

### No Fit Polygon (NFP)
The NFP is the region where polygon B's reference point can be placed such that B touches but doesn't intersect A. This is the core concept enabling collision-free placement.

### Placement Strategy
1. Parts sorted by size (largest first) - "first-fit-decreasing" heuristic
2. For each part, calculate NFP with bin and all placed parts
3. Find valid positions within NFP intersections
4. Select position optimizing for compactness
5. Repeat until all parts placed or no valid positions remain

### Bin Packing
- If parts don't fit in one bin, additional bins are created
- Genetic algorithm optimizes to minimize number of bins
- Bins are generated with same dimensions as original

---

## Browser Compatibility

**Required Features:**
- SVG support
- Web Workers
- File API (for uploads)
- ES5+ JavaScript

**Tested Browsers:**
- Chrome 50+
- Firefox 45+
- Safari 10+
- Edge 14+

---

## License

MIT License - Free for commercial and personal use

---

## Additional Resources

- **GitHub Repository:** https://github.com/Jack000/SVGnest
- **Live Demo:** https://svgnest.com
- **Algorithm Paper:** E.K. Burke et al. 2006 - "A New Placement Heuristic for the Orthogonal Stock-Cutting Problem"

---

## Units

**SVG Pixels:**
- All measurements use SVG internal units (pixels)
- Typical conversion: 72 pixels = 1 inch
- Conversion depends on your SVG editor/exporter
- Set spacing and tolerance values according to your scale

---

## Return Values Summary

| Method | Returns |
|--------|---------|
| `parsesvg()` | SVG DOM Element |
| `setbin()` | void |
| `config()` | Config Object (get) / void (set) |
| `start()` | false (if invalid) / void |
| `stop()` | void |
| `applyPlacement()` | Array of SVG Elements |
| `getParts()` | Tree structure (Array) |
| `polygonOffset()` | Array of polygon arrays |