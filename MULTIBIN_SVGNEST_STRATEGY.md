# Multi-Bin Strategy: Leveraging SVGnest

## Current Situation Analysis

**Problem**: We built a separate, inferior algorithm instead of using the proven SVGnest genetic algorithm.

**Root Cause**: SVGnest is designed for single-bin packing. We need multi-bin support.

## SVGnest Data Structure (From Code Analysis)

### Callback Signature:
```javascript
displayCallback(svglist, efficiency, placedParts, totalParts)
```

Where:
- `svglist`: Array of SVG elements (one per bin - SVGnest can return multiple bins!)
- `efficiency`: `placedArea / totalArea` (0-1)
- `placedParts`: Number of shapes successfully placed
- `totalParts`: Total number of shapes attempted

### Internal Data:
```javascript
best.placements = [
  [ // Bin 0
    { id: 2, x: 10, y: 20, rotation: 90 },
    { id: 5, x: 50, y: 30, rotation: 0 },
    ...
  ],
  [ // Bin 1 (if exists)
    { id: 1, x: 0, y: 0, rotation: 180 },
    ...
  ]
]
```

**Key Discovery**: SVGnest ALREADY supports multiple bins in its output!

## The Strategy: Iterative Bin Filling

### Concept:
```
1. Run SVGnest with all shapes on one bin
2. Get result: X shapes placed, Y shapes unplaced
3. If Y > 0:
   a. Keep the X shapes placement (bin 1 complete)
   b. Take the Y unplaced shapes
   c. Run SVGnest again with just those Y shapes on a new bin (bin 2)
   d. Repeat until all shapes placed or no progress made
```

### Advantages:
✅ Uses SVGnest's proven genetic algorithm  
✅ Each bin gets optimal packing  
✅ No new algorithm to maintain  
✅ Leverages existing NFP, rotation, mutation logic  
✅ Simple wrapper around existing code  

### Implementation Plan:

```javascript
class MultiBinSVGNest {
  constructor(svg, shapes, binTemplate) {
    this.svg = svg
    this.allShapes = shapes
    this.binTemplate = binTemplate
    this.completedBins = []
    this.currentBin = 0
  }

  async startMultiBin(progressCallback, displayCallback) {
    let remainingShapes = [...this.allShapes]
    
    while (remainingShapes.length > 0) {
      // Run SVGnest on current bin with remaining shapes
      const result = await this.packOneBin(
        remainingShapes, 
        this.currentBin
      )
      
      if (result.placedCount === 0) {
        // No shapes fit, bin might be too small
        console.error('No shapes fit in bin', this.currentBin)
        break
      }
      
      // Store this bin's result
      this.completedBins.push({
        binIndex: this.currentBin,
        shapes: result.placedShapes,
        svg: result.svg,
        efficiency: result.efficiency
      })
      
      // Update remaining shapes
      remainingShapes = result.unplacedShapes
      
      // Callback with updated multi-bin result
      displayCallback(this.getMultiBinResult())
      
      this.currentBin++
    }
  }
  
  packOneBin(shapes, binIndex) {
    return new Promise((resolve) => {
      // Create SVG with these shapes
      const binSvg = this.createBinSVG(shapes)
      
      // Parse and run SVGnest
      window.SvgNest.parsesvg(binSvg)
      window.SvgNest.setbin(/* bin element */)
      
      // Capture the result
      let bestResult = null
      window.SvgNest.start(
        (progress) => { /* progress */ },
        (svglist, eff, placed, total) => {
          bestResult = {
            svg: svglist[0], // First bin result
            efficiency: eff,
            placedCount: placed,
            totalCount: total,
            placedShapes: this.extractPlacedShapes(placed),
            unplacedShapes: this.extractUnplacedShapes(shapes, placed)
          }
        }
      )
      
      // Run for N iterations or until satisfied
      setTimeout(() => {
        window.SvgNest.stop()
        resolve(bestResult)
      }, 5000) // 5 seconds per bin
    })
  }
}
```

## Alternative: Modify SVGnest to Accept Multiple Bins

### Concept:
Instead of one bin, pass an array of bins to SVGnest. It tries to pack shapes across all bins.

### Pros:
- Single SVGnest run
- Optimizes across all bins simultaneously
- Better overall efficiency

### Cons:
- Requires modifying svgnest.js (complex)
- Need to handle multiple bin polygons
- NFP calculation becomes more complex
- Breaking changes to proven algorithm

**Verdict**: Too risky, stick with iterative approach.

## Recommended Implementation

### Phase 1: Wrapper Approach (Safest)

```javascript
// src/utils/multiBinSVGNest.js

export class MultiBinSVGNestRunner {
  async run(shapes, binConfig, maxBins = 10) {
    const bins = []
    let remaining = [...shapes]
    
    for (let i = 0; i < maxBins && remaining.length > 0; i++) {
      // Create SVG string with remaining shapes
      const svgString = this.shapesToSVG(remaining, binConfig)
      
      // Run SVGnest
      const result = await this.runSVGNestOnce(svgString, binConfig)
      
      if (result.placed === 0) break // No progress
      
      bins.push(result)
      
      // Remove placed shapes from remaining
      remaining = this.getUnplacedShapes(remaining, result)
    }
    
    return {
      bins,
      totalPlaced: bins.reduce((sum, b) => sum + b.placed, 0),
      totalShapes: shapes.length,
      efficiency: this.calculateOverallEfficiency(bins)
    }
  }
  
  runSVGNestOnce(svgString, binConfig) {
    return new Promise((resolve) => {
      // Setup SVGnest
      const parsed = window.SvgNest.parsesvg(svgString)
      // ... set bin, configure, etc
      
      let bestResult = null
      
      window.SvgNest.start(
        (p) => {},
        (svg, eff, placed, total) => {
          if (svg && svg.length > 0) {
            bestResult = { svg, eff, placed, total }
          }
        }
      )
      
      // Stop after timeout or iteration limit
      // ...
      
      resolve(bestResult)
    })
  }
}
```

### Phase 2: Real-time Multi-Bin (Like Single-Bin)

Use the same continuous optimization but apply it to multi-bin:

```javascript
// In useMultiBinNest hook:

const runContinuous = () => {
  let currentBinIndex = 0
  let allBins = [createEmptyBin()]
  
  const iterate = async () => {
    // Get shapes not yet placed
    const unplaced = getUnplacedShapes(shapes, allBins)
    
    if (unplaced.length === 0) {
      // All placed! Keep optimizing current bins
      optimizeExistingBins(allBins)
    } else {
      // Try to pack unplaced into new bin
      const binResult = await packOneBinIteration(
        unplaced, 
        iteration
      )
      
      if (binResult.placed > 0) {
        allBins.push(binResult)
      }
    }
    
    // Update display
    onNewBest(allBins, iteration)
    
    if (!stopped) {
      setTimeout(iterate, 0)
    }
  }
  
  iterate()
}
```

## Data We Can Extract from SVGnest

From `displayCallback(svglist, efficiency, placedParts, totalParts)`:

✅ SVG elements (visual representation)  
✅ Placement efficiency  
✅ Number of placed vs total parts  

From `best.placements` (if we access internals):
✅ Exact position (x, y) of each shape  
✅ Rotation angle  
✅ Shape ID  

## What We Need to Add

1. **Iteration Management**: Run SVGnest for N iterations per bin
2. **Shape Tracking**: Map SVGnest IDs back to our shape objects
3. **Unplaced Detection**: Identify which shapes weren't placed
4. **Bin Sequencing**: Coordinate multiple sequential SVGnest runs
5. **Result Aggregation**: Combine multiple bin results into one view

## Final Recommendation

**Go with the Iterative Wrapper Approach**:

1. **Use SVGnest as-is** (no modifications)
2. **Create wrapper** that runs SVGnest multiple times
3. **Each iteration** = one bin filled optimally
4. **Stop when** all shapes placed or no progress
5. **Display** aggregated multi-bin result

This gives us:
- ✅ Proven algorithm quality
- ✅ Minimal code changes  
- ✅ Easy to maintain
- ✅ Same UX as single-bin (Start/Stop)
- ✅ Actual continuous improvement

Would you like me to implement this wrapper approach?
