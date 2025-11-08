# Getting Started with SVGnest Enhanced

Quick guide to get up and running with multi-bin optimization.

## Installation

### Option 1: Use with React/Vite (Recommended for new projects)

```bash
# Clone or copy the SVGnest directory into your project
cp -r SVGnest /path/to/your/project/

# In your React/Vite project
npm install
```

### Option 2: Use with existing HTML/JavaScript

No installation needed! The original `index.html` works as-is, and you can optionally load the enhanced modules.

## Quick Examples

### Example 1: Basic Usage (ES6 Modules)

```javascript
import { createSvgNest, BinOptimizationStrategy } from './svgnest/src/index.js'

// Create with minimize-bins strategy
const nester = createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
  spacing: 2,
  rotations: 4
})

// Parse SVG
const svg = nester.parsesvg(yourSvgString)

// Set bin (the outline to nest parts into)
nester.setbin(binElement)

// Start nesting
nester.start(
  // Progress callback
  (percent) => {
    console.log(`${Math.round(percent * 100)}% complete`)
  },
  // Results callback
  (svgList, efficiency, placed, total) => {
    console.log(`Used ${svgList.length} bins`)
    console.log(`Efficiency: ${Math.round(efficiency * 100)}%`)
    console.log(`Placed ${placed}/${total} parts`)
  }
)
```

### Example 2: Using Presets

```javascript
import { createWithPreset } from './svgnest/src/index.js'

// Use a preset for quick setup
const nester = await createWithPreset('HIGH_QUALITY', {
  spacing: 3 // Override any preset value
})
```

Available presets:
- `MINIMIZE_BINS` - Fewest bins possible
- `MINIMIZE_AREA` - Tightest packing
- `BALANCED` - Good all-around
- `HIGH_QUALITY` - Best results, slower
- `FAST` - Quick results

### Example 3: Compare Strategies

```javascript
import { createSvgNest, BinOptimizationStrategy } from './svgnest/src/index.js'

const strategies = [
  BinOptimizationStrategy.MINIMIZE_BINS,
  BinOptimizationStrategy.MINIMIZE_AREA,
  BinOptimizationStrategy.BALANCED
]

for (const strategy of strategies) {
  const nester = createSvgNest({ binOptimization: strategy })

  // Run nesting...
  // Compare results...
}
```

### Example 4: Test Multiple Bin Sizes

```javascript
import { createSvgNest } from './svgnest/src/index.js'

const nester = createSvgNest({
  binOptimization: 'minimize-area'
})

// Define bin variants to test
const binVariants = [
  { width: 1000, height: 1000, label: '1m × 1m' },
  { width: 1200, height: 800, label: '1.2m × 0.8m' },
  { width: 2400, height: 1200, label: '2.4m × 1.2m (sheet)' }
]

// Test all variants and get the best
const result = await nester.testBinConfigurations(
  binVariants,
  parts,
  (progress) => {
    console.log(`Testing: ${progress.binConfig.label}`)
  }
)

console.log(`Best configuration: ${result.binConfig.label}`)
console.log(`Bins needed: ${result.placements.length}`)
```

## React Integration

### Step 1: Install Dependencies

```bash
cd examples/react-vite
npm install
```

### Step 2: Import and Use

```jsx
import { useState } from 'react'
import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'

function MyComponent() {
  const [nester] = useState(() => createSvgNest({
    binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
    spacing: 2,
    rotations: 4
  }))

  const [results, setResults] = useState(null)

  const handleStart = () => {
    const svg = nester.parsesvg(svgData)
    nester.setbin(binElement)

    nester.start(
      (progress) => console.log(progress),
      (svgList, efficiency, placed, total) => {
        setResults({ svgList, efficiency, placed, total })
      }
    )
  }

  return (
    <div>
      <button onClick={handleStart}>Start Nesting</button>
      {results && <div>Efficiency: {Math.round(results.efficiency * 100)}%</div>}
    </div>
  )
}
```

### Step 3: Run

```bash
npm run dev
```

## Configuration Guide

### Basic Configuration

```javascript
const config = {
  // Optimization strategy
  binOptimization: 'balanced',

  // Spacing between parts (in SVG units)
  spacing: 0,

  // Number of rotation angles to try (4 = 0°, 90°, 180°, 270°)
  rotations: 4,

  // Genetic algorithm settings
  populationSize: 10,  // Larger = slower but potentially better
  mutationRate: 10,    // 0-100, higher = more randomness

  // Advanced features
  useHoles: false,         // Allow parts inside other parts
  exploreConcave: false    // Check concave areas (slower)
}
```

### Strategy Selection Guide

**Use `MINIMIZE_BINS` when:**
- You have fixed-size material sheets
- Material cost is high
- You want to use the fewest sheets possible

**Use `MINIMIZE_AREA` when:**
- You can cut any size
- You want the tightest packing
- Material is flexible/continuous

**Use `BALANCED` when:**
- General purpose nesting
- Good balance of speed and quality
- Not sure which to use

**Use `HIGH_QUALITY` preset when:**
- You need the best possible result
- Time is not a concern
- Complex shapes that need careful placement

**Use `FAST` preset when:**
- You need a quick preview
- Many parts to nest
- Speed matters more than optimal placement

## Performance Tips

### For Faster Results:
```javascript
{
  populationSize: 5,
  mutationRate: 15,
  rotations: 4,
  exploreConcave: false
}
```

### For Better Results:
```javascript
{
  populationSize: 20,
  mutationRate: 5,
  rotations: 8,
  exploreConcave: true,
  useHoles: true
}
```

### For Large Part Counts (100+ parts):
```javascript
{
  populationSize: 5,
  rotations: 2,
  spacing: 0  // Reduce spacing if possible
}
```

## Common Use Cases

### Laser Cutting
```javascript
createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
  spacing: 2,  // Kerf compensation
  rotations: 4
})
```

### CNC Routing
```javascript
createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_AREA,
  spacing: 5,  // Tool clearance
  rotations: 4,
  exploreConcave: true
})
```

### Fabric Cutting
```javascript
createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_WASTE,
  spacing: 0,
  rotations: 2  // Usually only 0° and 180°
})
```

### 3D Printing (Build Plate)
```javascript
createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
  spacing: 3,  // Gap between parts
  rotations: 8  // Can rotate freely
})
```

## Troubleshooting

### Parts not fitting?
- Increase `populationSize` to 15-20
- Increase `rotations` to 8
- Enable `exploreConcave`
- Check if bin is large enough

### Taking too long?
- Decrease `populationSize` to 5
- Decrease `rotations` to 2 or 4
- Disable `exploreConcave`
- Use `FAST` preset

### Poor packing efficiency?
- Increase `populationSize`
- Increase `rotations`
- Try different strategies
- Enable `useHoles` if applicable

### Parts overlapping?
- Increase `spacing` value
- Check SVG scale (72 px = 1 inch typically)
- Ensure `curveTolerance` is appropriate

## Next Steps

1. **Read the full documentation**: See `USAGE.md` for complete API reference
2. **Try the examples**:
   - Original demo: Open `index.html`
   - Simple integration: Open `examples/simple-integration.html`
   - React example: `cd examples/react-vite && npm run dev`
3. **Explore strategies**: Try different optimization strategies with your parts
4. **Test bin sizes**: Use `testBinConfigurations()` to find optimal dimensions
5. **Customize**: Create custom fitness functions for specific needs

## Support

- Original SVGnest: https://github.com/Jack000/SVGnest
- This enhanced version: See `README_ENHANCED.md`
- Issues: Open an issue on GitHub

## Quick Reference Card

```javascript
// Import
import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'

// Create
const nester = createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
  spacing: 2,
  rotations: 4
})

// Use
const svg = nester.parsesvg(svgString)
nester.setbin(binElement)
nester.start(progressCb, resultsCb)
nester.stop()

// Strategies
BinOptimizationStrategy.MINIMIZE_BINS    // Fewest bins
BinOptimizationStrategy.MINIMIZE_AREA    // Tightest packing
BinOptimizationStrategy.MINIMIZE_WASTE   // Balance
BinOptimizationStrategy.BALANCED         // General purpose
```

Happy nesting! 🎯
