# Multi-Bin Architecture Issue

## The Problem

Our current multi-bin implementation runs SVGnest **sequentially** - pack bin 1, then pack remaining shapes in bin 2, etc. This is fundamentally different from how SVGnest is designed to work.

### Current (WRONG) Approach:
```
Run 1: SVGnest(All 10 shapes, Bin 1) → Places 6 shapes
Run 2: SVGnest(Remaining 4 shapes, Bin 2) → Places 4 shapes
```

**Problems:**
- Each run starts from scratch with a new genetic algorithm population
- No global optimization across bins
- Can't move shapes between bins to improve overall efficiency
- The second run has fewer shapes, making the problem easier but sub-optimal

### How SVGnest Actually Works:

SVGnest is designed to run **once** with all shapes and creates multiple bin instances automatically:

```javascript
// SVGnest internally:
placement = [
  [ {id:0, x:10, y:20}, {id:1, x:30, y:40}, ... ], // Bin 1
  [ {id:5, x:15, y:25}, {id:6, x:35, y:45}, ... ], // Bin 2
  ...
]
```

The genetic algorithm optimizes **which shapes go in which bin** as part of the evolution process!

## Evidence

1. **`applyPlacement()` function** (svgnest.js:743):
   ```javascript
   for(i=0; i<placement.length; i++){  // Loop through MULTIPLE bins
     var newsvg = svg.cloneNode(false);
     // Create SVG for each bin...
   }
   ```

2. **Single bin definition**:
   - `setbin()` is called once with ONE bin
   - SVGnest clones this bin multiple times as needed
   - The algorithm decides distribution

3. **Original UI** (index-original.html:151):
   ```javascript
   SvgNest.start(progress, renderSvg);  // Called ONCE
   ```

## The Fix

We need to change our approach:

### Option 1: Let SVGnest Handle Multiple Bins Natively
```javascript
// Run SVGnest ONCE with all shapes
// It will automatically create as many bins as needed
const result = await runSVGNest(allShapes, binTemplate)
// Result contains placement[0], placement[1], placement[2]...
```

### Option 2: Add Bin Count Configuration
SVGnest might need to know how many bins it can use. Need to investigate if there's a config parameter for this.

## Test Cases

Created deterministic test cases in `src/utils/testCases.js`:

1. **Perfect Single Bin**: 8 strips (47×297px) that fit perfectly in 400×300px
   - Expected: 1 bin, ~93% efficiency
   
2. **Exact Two Bins**: 8 rectangles (195×145px) = 4 per bin
   - Expected: 2 bins, ~95% efficiency each
   
3. **Interlocking L-Shapes**: 8 strips + 4 L-shapes
   - Expected: Bin 1 = 8 strips, Bin 2 = 4 interlocked L-shapes

These tests will reveal whether our current sequential approach is the issue.

## Next Steps

1. ✅ Add test case scenarios to UI
2. ⬜ Run test cases to confirm poor performance
3. ⬜ Research SVGnest's native multi-bin handling
4. ⬜ Refactor to run SVGnest once with all shapes
5. ⬜ Re-test with deterministic cases
6. ⬜ Verify efficiency matches expectations (90%+ for simple cases)
