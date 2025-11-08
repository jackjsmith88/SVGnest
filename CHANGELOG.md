# Changelog

## Version 2.0.0 - Enhanced Multi-Bin Optimization (2024-11-08)

### 🎉 Major Features Added

#### Multi-Bin Optimization Strategies
- **MINIMIZE_BINS**: Prioritize using fewer bins (ideal for fixed material sheets)
- **MINIMIZE_AREA**: Prioritize compact packing (ideal for variable bin sizes)
- **MINIMIZE_WASTE**: Balance between bin count and efficiency
- **BALANCED**: General purpose optimization
- **CUSTOM**: User-defined fitness functions

#### Configurable Fitness Calculation
- Adjustable weights for bin count, width, height, and unplaced parts
- Strategy-specific default weights
- Custom fitness function support

#### Bin Configuration Testing
- Test multiple bin sizes automatically
- Compare different bin dimensions
- Find optimal bin configuration for your parts

#### Modern ES6 Module System
- Full ES6 module support for React, Vue, Svelte, etc.
- Compatible with Vite, Rolldown, Webpack, and other bundlers
- TypeScript-ready structure
- Tree-shakeable exports

#### Preset Configurations
- `MINIMIZE_BINS` - Fewest bins possible
- `MINIMIZE_AREA` - Tightest packing
- `BALANCED` - General purpose
- `HIGH_QUALITY` - Best results
- `FAST` - Quick previews

### 📁 New File Structure

```
src/
├── core/
│   ├── config.js                    # Configuration & strategies
│   ├── optimizer.js                 # Fitness calculation
│   ├── placement-worker-enhanced.js # Enhanced placement
│   ├── svgnest-enhanced.js         # Enhanced main class
│   ├── svgnest-wrapper.js          # Integration wrapper
│   └── index.js                     # Core exports
└── index.js                         # Main export

examples/
├── react-vite/                      # Complete React example
│   ├── App.jsx
│   ├── vite.config.js
│   └── package.json
└── simple-integration.html          # Simple HTML example
```

### 📚 New Documentation

- `README_ENHANCED.md` - Complete overview of enhanced features
- `USAGE.md` - Detailed API reference and usage examples
- `GETTING_STARTED.md` - Quick start guide for new users
- `CHANGELOG.md` - This file

### 🔧 New APIs

#### Core Functions
```javascript
import {
  createSvgNest,
  createWithPreset,
  BinOptimizationStrategy,
  validateConfig,
  getFitnessWeights
} from '@svgnest/core'
```

#### SvgNestEnhanced Class
```javascript
const nester = createSvgNest(config)
nester.updateConfig(newConfig)
nester.setStrategy(strategy)
nester.calculateFitness(result)
nester.getBestResult(results)
nester.testBinConfigurations(variants, parts, callback)
nester.getStats()
```

### ✨ Enhanced Features

1. **Strategy Comparison**: Test multiple strategies and compare results
2. **Better Metrics**: Track fitness, efficiency, bin count, and more
3. **Bin Variant Testing**: Automatically test different bin dimensions
4. **Progress Tracking**: Enhanced progress callbacks with more details
5. **Statistics**: Get detailed stats about nesting results

### 🔄 Backward Compatibility

- **100% backward compatible** with original SVGnest
- Original `index.html` demo works unchanged
- All existing APIs preserved
- Enhanced features are purely additive

### 📊 Performance

- Configurable trade-offs between speed and quality
- Preset configurations for common scenarios
- Optimization strategies tuned for different use cases

### 🐛 Bug Fixes

None - this is a feature enhancement release that maintains full compatibility with the original library.

### 🎯 Use Cases

The new optimization strategies are ideal for:

- **Laser Cutting**: Minimize material sheets (MINIMIZE_BINS)
- **CNC Routing**: Optimal packing on available material (MINIMIZE_AREA)
- **Fabric Cutting**: Balance efficiency and material usage (BALANCED)
- **3D Printing**: Fit maximum parts on build plate (MINIMIZE_AREA)
- **Metal Fabrication**: Reduce sheet waste (MINIMIZE_WASTE)

### 🚀 Migration Guide

Existing code continues to work:
```javascript
// Before (still works)
const nester = new SvgNest()
nester.config({ spacing: 2 })

// After (with new features)
import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'
const nester = createSvgNest({
  binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
  spacing: 2
})
```

### 📦 Package Information

- **Name**: @svgnest/core
- **Version**: 2.0.0
- **License**: MIT (same as original)
- **Type**: ES Module
- **Main Export**: src/index.js

### 🙏 Credits

- Original SVGnest by Jack Qiao
- Enhanced multi-bin optimization by this fork
- Built with ES6 modules for modern development

### 📋 Future Enhancements (Planned)

- [ ] WebAssembly acceleration for large part counts
- [ ] Multi-threaded optimization
- [ ] Machine learning-based strategy selection
- [ ] 3D bin packing support
- [ ] Real-time collaborative nesting

---

## Version 1.0.0 - Original SVGnest

See original readme.md for the initial release notes.
