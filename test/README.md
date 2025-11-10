# Multi-Bin Testing Suite

This directory contains React/JSX components for testing multi-bin nesting functionality in SVGnest.

## Getting Started

### Run the test suite:

```bash
npm run test:multi-bin
```

This will open a browser with the multi-bin testing interface.

## Features

- **Configure multiple bins**: Set the number of bins and their dimensions
- **Generate test shapes**: Automatically create rectangles and circles for testing
- **Visual feedback**: See how shapes are distributed across bins
- **Statistics**: View utilization, efficiency, and placement success rates

## Components

### MultiBinTester
Main testing component that provides:
- Configuration controls for bins and shapes
- Test execution
- Results display

### BinVisualizer
Visualizes individual bins with their placed shapes using SVG rendering.

### Utils: multiBinNesting.js
Contains the multi-bin nesting algorithms:
- `testMultiBinNesting()`: Simple first-fit algorithm for testing
- `createSimpleShapes()`: Generates test shapes
- `advancedMultiBinNesting()`: Placeholder for integration with main SVGnest algorithm

## Testing Multi-Bin Logic

The test suite allows you to:

1. **Test different bin configurations**: Try 1-10 bins with various dimensions
2. **Vary shape quantities**: Test with 1-50 shapes
3. **Observe packing efficiency**: See which shapes fit and utilization percentages
4. **Identify issues**: Unplaced shapes are highlighted

## Next Steps

To integrate with the main SVGnest algorithm:

1. Import the existing `svgnest.js` and related utilities
2. Modify `advancedMultiBinNesting()` to use the real nesting algorithm
3. Add support for complex SVG polygons
4. Implement rotation and advanced placement strategies

## Custom Shapes

Future enhancement: Load custom SVG files to test with real-world shapes.
