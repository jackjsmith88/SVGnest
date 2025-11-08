/**
 * SVGnest Bin Optimization Module
 * Handles fitness calculation for different optimization strategies
 */

/**
 * Calculate fitness for a placement solution
 * Lower fitness is better
 *
 * @param {Object} result - Placement result from worker
 * @param {Object} config - Configuration with fitness weights
 * @returns {number} Fitness score
 */
export function calculateFitness(result, config) {
  const { placements, paths: unplacedPaths, area: binArea } = result;
  const weights = config.fitnessWeights;

  // Use custom fitness function if provided
  if (config.customFitness && typeof config.customFitness === 'function') {
    return config.customFitness(result, config);
  }

  let fitness = 0;

  // Penalty for number of bins used
  const binCount = placements.length;
  fitness += binCount * weights.binCount;

  // Penalty for bin utilization (width and height)
  for (const binPlacements of placements) {
    if (binPlacements.length === 0) continue;

    const bounds = calculateBounds(binPlacements);

    // Normalize by bin area to keep values comparable
    const normalizedWidth = bounds.width / Math.sqrt(binArea);
    const normalizedHeight = bounds.height / Math.sqrt(binArea);

    fitness += normalizedWidth * weights.binWidth;
    fitness += normalizedHeight * weights.binHeight;
  }

  // Heavy penalty for unplaced parts
  const unplacedCount = unplacedPaths.length;
  fitness += unplacedCount * weights.unplacedParts;

  return fitness;
}

/**
 * Calculate bounding box for a set of placements
 */
function calculateBounds(placements) {
  if (!placements || placements.length === 0) {
    return { width: 0, height: 0, x: 0, y: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const placement of placements) {
    if (placement.x < minX) minX = placement.x;
    if (placement.y < minY) minY = placement.y;
    if (placement.x > maxX) maxX = placement.x;
    if (placement.y > maxY) maxY = placement.y;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Calculate material efficiency
 */
export function calculateEfficiency(placements, parts, binArea) {
  let placedArea = 0;
  let totalBinArea = 0;

  for (const binPlacements of placements) {
    totalBinArea += binArea;

    for (const placement of binPlacements) {
      // Area calculation would need actual polygon data
      // This is a placeholder - actual implementation in main library
      placedArea += placement.area || 0;
    }
  }

  return totalBinArea > 0 ? placedArea / totalBinArea : 0;
}

/**
 * Compare multiple bin configurations and return the best
 */
export function selectBestBinConfiguration(results, config) {
  if (!results || results.length === 0) {
    return null;
  }

  if (results.length === 1) {
    return results[0];
  }

  let best = null;
  let bestFitness = Infinity;

  for (const result of results) {
    const fitness = calculateFitness(result, config);

    if (fitness < bestFitness) {
      bestFitness = fitness;
      best = result;
    }
  }

  return { ...best, fitness: bestFitness };
}

/**
 * Optimize bin packing with multiple strategies
 * Tests different approaches and returns the best
 */
export async function optimizeMultiBin(parts, binConfig, config) {
  const strategies = [
    config.binOptimization
  ];

  // If balanced strategy, also try other strategies and compare
  if (config.binOptimization === 'balanced') {
    strategies.push('minimize-bins', 'minimize-area');
  }

  const results = [];

  for (const strategy of strategies) {
    const strategyConfig = {
      ...config,
      binOptimization: strategy
    };

    // This would call the actual nesting algorithm
    // Placeholder for integration with existing code
    const result = await runNestingWithStrategy(parts, binConfig, strategyConfig);

    if (result) {
      results.push({
        ...result,
        strategy,
        fitness: calculateFitness(result, strategyConfig)
      });
    }
  }

  return selectBestBinConfiguration(results, config);
}

/**
 * Placeholder for integration with existing nesting algorithm
 * This will be implemented when integrating with svgnest.js
 */
async function runNestingWithStrategy(parts, binConfig, config) {
  // This will be implemented in the main integration
  return null;
}
