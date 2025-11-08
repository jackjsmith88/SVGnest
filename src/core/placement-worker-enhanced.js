/**
 * Enhanced Placement Worker
 * Extends the original placement worker with configurable fitness strategies
 * This wraps the existing placementworker.js with new optimization capabilities
 */

/**
 * Enhanced fitness calculation that uses configurable weights
 */
export function calculateEnhancedFitness(allplacements, paths, binarea, config) {
  const weights = config.fitnessWeights || {
    binCount: 1.0,
    binWidth: 1.0,
    binHeight: 0.5,
    unplacedParts: 2.0
  };

  let fitness = 0;

  // Penalty for number of bins
  fitness += allplacements.length * weights.binCount;

  // Calculate width/height contribution
  let totalWidth = 0;
  let totalHeight = 0;

  for (let i = 0; i < allplacements.length; i++) {
    const placements = allplacements[i];
    if (placements.length === 0) continue;

    // Calculate bounds for this bin
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const placement of placements) {
      if (placement.x < minX) minX = placement.x;
      if (placement.y < minY) minY = placement.y;
      if (placement.x > maxX) maxX = placement.x;
      if (placement.y > maxY) maxY = placement.y;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    totalWidth += width;
    totalHeight += height;

    // Normalize by bin area
    fitness += (width / binarea) * weights.binWidth;
    fitness += (height / binarea) * weights.binHeight;
  }

  // Heavy penalty for unplaced parts
  fitness += paths.length * weights.unplacedParts;

  return fitness;
}

/**
 * Inject enhanced fitness into PlacementWorker
 * This modifies the placePaths function to use configurable fitness
 */
export function createEnhancedPlacementWorker(PlacementWorkerClass, config) {
  // Return a wrapper class that extends the original
  return class EnhancedPlacementWorker extends PlacementWorkerClass {
    constructor(binPolygon, paths, ids, rotations, workerConfig, nfpCache) {
      super(binPolygon, paths, ids, rotations, workerConfig, nfpCache);
      this.optimizerConfig = config;
    }

    // Override the placePaths method to use enhanced fitness
    placePaths(paths) {
      const result = super.placePaths(paths);

      if (result && this.optimizerConfig) {
        // Recalculate fitness using enhanced algorithm
        result.fitness = calculateEnhancedFitness(
          result.placements,
          result.paths,
          result.area,
          this.optimizerConfig
        );
      }

      return result;
    }
  };
}

/**
 * Create a modified fitness calculation function
 * This can be injected into the worker's global scope
 */
export function createFitnessCalculator(config) {
  return function(allplacements, paths, binarea, minwidth) {
    return calculateEnhancedFitness(allplacements, paths, binarea, config);
  };
}
