# SVGnest Enhanced - Multi-Bin Optimization

## Overview

This enhanced version of SVGnest adds powerful multi-bin optimization capabilities while maintaining full backward compatibility with the original library.

### New Features

- **Multiple Bin Optimization Strategies**: Choose how to optimize bin packing
  - `MINIMIZE_BINS`: Use fewest bins possible
  - `MINIMIZE_AREA`: Minimize total area used
  - `MINIMIZE_WASTE`: Balance between bins and efficiency
  - `BALANCED`: General purpose optimization
  - `CUSTOM`: Provide your own fitness function

- **Configurable Fitness Weights**: Fine-tune optimization priorities
- **Bin Variant Testing**: Test multiple bin sizes to find optimal configuration
- **ES6 Module Support**: Use with React, Vue, Vite, Rolldown, and modern build tools
- **Preset Configurations**: Quick start with optimized settings

## Installation

### For Modern Build Tools (React, Vite, etc.)

```bash
npm install
```

```javascript
import { createSvgNest, BinOptimizationStrategy, Presets } from './src/index.js'
```

### For Traditional HTML/JavaScript

```html
<script src="svgnest.js"></script>
<script src="src/svgnest-enhanced.js"></script>
```

## Quick Start

### Basic Usage (ES6 Modules)

```javascript
import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'

// Create nester with minimize-bins strategy
const nester = createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
  spacing: 2,
  rotations: 4
})

// Use it like regular SVGnest
const svg = nester.parsesvg(svgString)
nester.setbin(binElement)
nester.start(progressCallback, displayCallback)
```

### Using Presets

```javascript
import { createWithPreset, Presets } from '@svgnest/core'

// Use a preset configuration
const nester = await createWithPreset('HIGH_QUALITY', {
  spacing: 3 // Override preset values
})
```

### Testing Multiple Bin Sizes

```javascript
import { createSvgNest } from '@svgnest/core'

const nester = createSvgNest({
  binOptimization: 'minimize-area'
})

// Test different bin configurations
const binVariants = [
  { width: 1000, height: 1000, label: 'square' },
  { width: 1200, height: 800, label: 'landscape' },
  { width: 800, height: 1200, label: 'portrait' }
]

const result = await nester.testBinConfigurations(
  binVariants,
  parts,
  (progress) => console.log(`Testing bin ${progress.binIndex + 1}/${progress.totalBins}`)
)

console.log(`Best configuration: ${result.binConfig.label}`)
console.log(`Fitness score: ${result.fitness}`)
```

## Configuration Options

### Optimization Strategies

```javascript
import { BinOptimizationStrategy } from '@svgnest/core'

const config = {
  // Choose strategy
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,

  // Standard SVGnest options
  spacing: 0,
  curveTolerance: 0.3,
  rotations: 4,
  populationSize: 10,
  mutationRate: 10,
  useHoles: false,
  exploreConcave: false,

  // Advanced: Custom fitness weights
  fitnessWeights: {
    binCount: 10.0,      // Higher = penalize more bins heavily
    binWidth: 0.1,       // Lower = less concern about width
    binHeight: 0.05,     // Lower = less concern about height
    unplacedParts: 2.0   // Penalty for parts that don't fit
  }
}
```

### Strategy Comparison

| Strategy | Best For | Bin Count Priority | Packing Density |
|----------|----------|-------------------|-----------------|
| `MINIMIZE_BINS` | Fixed bin sizes, reducing material cost | **Highest** | Medium |
| `MINIMIZE_AREA` | Variable bin sizes, compact packing | Low | **Highest** |
| `MINIMIZE_WASTE` | Balancing material usage and efficiency | Medium | High |
| `BALANCED` | General purpose nesting | Medium | Medium |
| `CUSTOM` | Specific requirements | *Custom* | *Custom* |

### Custom Fitness Function

```javascript
const config = {
  binOptimization: BinOptimizationStrategy.CUSTOM,
  customFitness: (result, config) => {
    // result contains: placements, paths (unplaced), area (bin area)
    const binCount = result.placements.length
    const unplaced = result.paths.length

    // Custom scoring logic
    return binCount * 5 + unplaced * 10
  }
}
```

## React/Vite Example

```jsx
import { useState, useEffect } from 'react'
import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'

function NestingComponent() {
  const [nester, setNester] = useState(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const instance = createSvgNest({
      binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
      spacing: 2,
      rotations: 4
    })
    setNester(instance)
  }, [])

  const handleStartNesting = async () => {
    if (!nester) return

    // Load SVG
    const svg = nester.parsesvg(svgData)
    nester.setbin(binElement)

    // Start nesting with progress tracking
    nester.start(
      (percent) => setProgress(percent),
      (svgList, efficiency, placed, total) => {
        setResult({ svgList, efficiency, placed, total })
      }
    )
  }

  return (
    <div>
      <button onClick={handleStartNesting}>Start Nesting</button>
      {progress > 0 && <progress value={progress} max={1} />}
      {result && (
        <div>
          <p>Efficiency: {Math.round(result.efficiency * 100)}%</p>
          <p>Placed: {result.placed}/{result.total}</p>
        </div>
      )}
    </div>
  )
}
```

## Advanced: Comparing Strategies

```javascript
import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'

async function findBestStrategy(svgData, binElement) {
  const strategies = [
    BinOptimizationStrategy.MINIMIZE_BINS,
    BinOptimizationStrategy.MINIMIZE_AREA,
    BinOptimizationStrategy.BALANCED
  ]

  const results = []

  for (const strategy of strategies) {
    const nester = createSvgNest({
      binOptimization: strategy,
      rotations: 4
    })

    const svg = nester.parsesvg(svgData)
    nester.setbin(binElement)

    // Run nesting
    await new Promise((resolve) => {
      nester.start(
        () => {},
        (svgList, efficiency, placed, total) => {
          results.push({
            strategy,
            efficiency,
            binCount: svgList.length,
            placed,
            total,
            fitness: nester.calculateFitness({
              placements: svgList,
              paths: []
            })
          })
          nester.stop()
          resolve()
        }
      )
    })
  }

  // Find best result
  return results.reduce((best, current) =>
    current.fitness < best.fitness ? current : best
  )
}
```

## API Reference

### `createSvgNest(config)`

Creates an enhanced SVGnest instance.

**Parameters:**
- `config` (Object): Configuration options

**Returns:** `SvgNestEnhanced` instance

### `createWithPreset(presetName, overrides)`

Creates an instance with a preset configuration.

**Parameters:**
- `presetName` (String): One of 'MINIMIZE_BINS', 'MINIMIZE_AREA', 'BALANCED', 'HIGH_QUALITY', 'FAST'
- `overrides` (Object): Optional config overrides

**Returns:** Promise<`SvgNestEnhanced`>

### `SvgNestEnhanced` Methods

- `updateConfig(newConfig)` - Update configuration
- `getConfig()` - Get current configuration
- `setStrategy(strategy)` - Change optimization strategy
- `getStrategy()` - Get current strategy
- `calculateFitness(result)` - Calculate fitness for a result
- `getBestResult(results)` - Compare and get best result
- `getStats()` - Get statistics about current results

## Performance Tips

1. **For Quick Previews**: Use `FAST` preset
2. **For Production**: Use `HIGH_QUALITY` preset
3. **Large Part Counts**: Reduce `populationSize` and `rotations`
4. **Complex Shapes**: Enable `exploreConcave` for better fitting
5. **Part-in-Part**: Enable `useHoles` for nested placement

## Backward Compatibility

The enhanced library is fully backward compatible. Existing code continues to work:

```javascript
// Traditional usage still works
const nester = new SvgNest()
nester.config({ spacing: 2, rotations: 4 })
nester.start(progressCallback, displayCallback)
```

## Migration Guide

### From Original SVGnest

```javascript
// Before
const nester = new SvgNest()
nester.config({ spacing: 2, rotations: 4 })

// After (with new features)
import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'

const nester = createSvgNest({
  spacing: 2,
  rotations: 4,
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS
})
```

All original methods remain available!

## Examples

See the `examples/` directory for:
- React integration
- Vite setup
- Multiple bin testing
- Custom fitness functions
- Strategy comparison
