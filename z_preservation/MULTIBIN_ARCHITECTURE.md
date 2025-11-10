# Multi-Bin Nesting Architecture

## Overview
Multi-bin nesting now uses a **genetic algorithm-inspired approach** similar to single-bin mode's SVGnest algorithm. It continuously tests different placement configurations to find the optimal bin usage, minimizing wasted space across multiple bins.

## Key Principle
**Single-bin uses SVGnest's genetic algorithm for one bin → Multi-bin uses the same genetic algorithm concepts across multiple bins**

## Architecture

### Separation of Concerns

#### 1. **useMultiBinNest Hook** (`src/hooks/useMultiBinNest.js`)
- **Purpose**: Manages the iterative nesting process for multi-bin scenarios
- **Responsibilities**:
  - Tracks iteration count and working state
  - Manages best result vs current result
  - Provides start/stop controls
  - Runs continuous improvement loop via `setTimeout`
  - Compares results to determine best solution
- **Similar to**: `useSVGNest` hook (for single-bin mode)
- **Does NOT interfere with**: Single-bin functionality (completely separate hook)

#### 2. **multiBinNesting.js** (`src/utils/multiBinNesting.js`)
- **Purpose**: Core nesting algorithm using genetic algorithm principles
- **Key Algorithm Features**:
  - **Population-based optimization**: Each iteration is like testing a different "individual"
  - **Genetic variation**: Applies mutations (shape order swapping) similar to genetic algorithms
  - **Multi-rotation support**: Tests 0°, 90°, 180°, 270° rotations like SVGnest
  - **No-Fit Polygon concept**: Finds best placement using collision detection and waste minimization
  - **Fitness scoring**: Evaluates placements based on bin utilization, packing density, and bin balance
  - **Adaptive grid search**: Grid resolution improves with iterations (coarse → fine)
- **Key Functions**:
  - `testMultiBinNestingIterative()` - Main genetic algorithm loop
  - `findBestPlacementAcrossAllBins()` - NFP-inspired placement search
  - `applyGeneticVariation()` - Mutation operator
  - `scorePlacement()` - Fitness function
- **Does NOT modify**: Existing single-bin nesting logic

#### 3. **MultiBinTester Component** (`src/components/MultiBinTester.jsx`)
- **Purpose**: UI for multi-bin nesting
- **Features**:
  - Start/Stop button (like single-bin mode)
  - Live iteration counter
  - Progress information during nesting
  - Shows current and best results
  - Disabled controls during nesting
  - Reset button to clear results
- **Does NOT affect**: Single-bin UI or workflow

### How the Genetic Algorithm Works

1. **Initialization (First Iteration)**
   - Sort shapes by area (largest first) - like SVGnest's "adam" seed
   - This is the initial "population member"

2. **Each Iteration = Testing a Population Member**
   - Apply genetic variation (mutations)
   - For each shape in the mutated order:
     - Test all bins
     - Test all rotations (0°, 90°, 180°, 270°)
     - Use adaptive grid search to find positions
     - Score each placement (fitness function)
     - Place in best location

3. **Genetic Variation (Mutation)**
   ```javascript
   Mutation rate = (iteration % 100) / 100 (up to 30%)
   - Swap random shape pairs
   - Every 50 iterations: reverse entire order
   - Provides exploration of solution space
   ```

4. **Fitness Scoring (Higher = Better)**
   ```javascript
   Score = Bin Utilization + Gravity Score - Bin Penalty
   
   - Bin Utilization: How full is the bin
   - Gravity Score: Prefer bottom-left placement (0.3 weight)
   - Bin Penalty: Prefer using fewer bins (0.1 × bin index)
   ```

5. **Adaptive Grid Search**
   ```javascript
   Grid Size = max(2, 10 - floor(iteration / 100))
   
   Early iterations: Coarse grid (fast exploration)
   Later iterations: Fine grid (precision optimization)
   ```

6. **Result Selection**
   - Each iteration produces a complete placement solution
   - Compare to best so far:
     1. More shapes placed? → Better
     2. Same shapes, higher efficiency? → Better
     3. Same efficiency, fewer bins? → Better
   - Keep best solution found

### Comparison to Single-Bin SVGnest

| Aspect | Single-Bin (SVGnest) | Multi-Bin (Our Implementation) |
|--------|---------------------|--------------------------------|
| **Algorithm** | Genetic Algorithm | Genetic Algorithm-Inspired |
| **Population** | 10 individuals | Implicit (each iteration = individual) |
| **Shape Handling** | SVG polygons with NFP | Geometric shapes with collision detection |
| **Placement** | NFP (No-Fit Polygon) | Adaptive grid + scoring |
| **Rotation** | Configurable (default 4) | 4 rotations (0°, 90°, 180°, 270°) |
| **Optimization** | Minimize total area | Minimize bin usage + maximize efficiency |
| **Mutation** | Genetic operators | Shape order swapping |
| **Bins** | Single bin | Multiple bins |

### Benefits

### 1. **Algorithmic Parity**
- Uses same genetic algorithm principles as single-bin
- Continuous iterative improvement
- Tests multiple configurations automatically
- Converges on optimal solution

### 2. **Modularity**
- Multi-bin and single-bin are completely separate
- No shared state between modes
- Changes to multi-bin won't affect single-bin
- Each mode has its own hook and algorithm

### 3. **Performance Optimization**
- Uses `setTimeout(0)` for non-blocking iterations
- UI remains responsive
- Adaptive grid: fast early, precise late
- Can handle long-running optimizations

### 4. **Extensibility**
- Easy to adjust mutation rate
- Simple to modify fitness function
- Can add more rotation angles
- Hook pattern makes it reusable

## Testing Multi-Bin Mode

1. Switch to Multi-Bin mode in the UI
2. Configure bins and shapes
3. Click "Start Multi-Bin Nesting"
4. Algorithm runs genetic optimization:
   - Iteration 1-10: Coarse exploration
   - Iteration 11-50: Balance exploration/exploitation
   - Iteration 51+: Fine-tuning
5. Watch efficiency improve over iterations
6. Click "Stop" when satisfied
7. Best result is preserved

## Testing Single-Bin Mode

Single-bin mode remains unchanged:
1. Upload SVG or use Demo
2. Select bin
3. Click Start
4. SVGnest's genetic algorithm runs
5. Click Stop when satisfied

Both modes work independently without interference.

## Algorithm Details

### Genetic Variation
```
Iteration 1-99:   0-30% mutation rate (increasing)
Iteration 50:     Reverse order
Iteration 100:    Reset mutation to 0%
Iteration 150:    Reverse order again
(Cycle continues...)
```

### Placement Scoring
```
Best placement = highest score across all (bin × rotation × position)

For each candidate placement:
  utilization = (used_area + shape_area) / total_bin_area
  gravity = (1 - y/height) × 0.3 + (1 - x/width) × 0.2
  penalty = bin_index × 0.1
  
  score = utilization + gravity - penalty
```

### Grid Adaptation
```
Iteration 1-99:    10px grid (coarse)
Iteration 100-199: 9px grid
Iteration 200-299: 8px grid
...
Iteration 800+:    2px grid (finest)
```

This creates a similar optimization trajectory to SVGnest's genetic algorithm!
