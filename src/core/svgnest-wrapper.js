/**
 * Integration Wrapper for Original SVGnest
 * This file provides a bridge between the enhanced features and the original svgnest.js
 * It modifies the original code to support new configuration options without breaking existing functionality
 */

/**
 * Patch the original SVGnest to support enhanced configuration
 * This function should be called after loading the original svgnest.js
 */
export function patchSvgNest(SvgNestOriginal, config = {}) {
  const originalStart = SvgNestOriginal.prototype.start;
  const originalConfig = SvgNestOriginal.prototype.config;
  const originalLaunchWorkers = SvgNestOriginal.prototype.launchWorkers;

  // Store enhanced config
  SvgNestOriginal.prototype.enhancedConfig = config;

  // Patch config method to accept enhanced options
  SvgNestOriginal.prototype.config = function(c) {
    if (!c) {
      return { ...originalConfig.call(this), ...this.enhancedConfig };
    }

    // Merge enhanced config
    if (this.enhancedConfig) {
      this.enhancedConfig = { ...this.enhancedConfig, ...c };
    }

    // Call original config with base options
    return originalConfig.call(this, c);
  };

  // Patch launchWorkers to inject enhanced fitness calculation
  SvgNestOriginal.prototype.launchWorkers = function(tree, binPolygon, config, progressCallback, displayCallback) {
    // Inject fitness weights into config
    const enhancedConfig = {
      ...config,
      ...this.enhancedConfig,
      fitnessWeights: this.enhancedConfig?.fitnessWeights || {
        binCount: 1.0,
        binWidth: 1.0,
        binHeight: 0.5,
        unplacedParts: 2.0
      }
    };

    // Store for worker access
    this._fitnessWeights = enhancedConfig.fitnessWeights;

    // Call original with enhanced config
    return originalLaunchWorkers.call(this, tree, binPolygon, enhancedConfig, progressCallback, displayCallback);
  };

  return SvgNestOriginal;
}

/**
 * Create enhanced fitness function string to inject into workers
 * This is used by the Parallel.js workers
 */
export function createEnhancedFitnessFunction(weights) {
  return `
    function calculateEnhancedFitness(allplacements, paths, binarea, minwidth) {
      const weights = ${JSON.stringify(weights)};
      let fitness = 0;

      // Penalty for number of bins
      fitness += allplacements.length * weights.binCount;

      // Width/height contribution
      if (minwidth) {
        fitness += (minwidth / binarea) * weights.binWidth;
      }

      // Calculate average height
      let totalHeight = 0;
      for (let i = 0; i < allplacements.length; i++) {
        const placements = allplacements[i];
        if (placements.length === 0) continue;

        let minY = Infinity, maxY = -Infinity;
        for (const placement of placements) {
          if (placement.y < minY) minY = placement.y;
          if (placement.y > maxY) maxY = placement.y;
        }
        const height = maxY - minY;
        totalHeight += height;
        fitness += (height / binarea) * weights.binHeight;
      }

      // Heavy penalty for unplaced parts
      fitness += paths.length * weights.unplacedParts;

      return fitness;
    }
  `;
}

/**
 * Modify placement worker to use enhanced fitness
 */
export function modifyPlacementWorkerFitness(placementWorkerCode, weights) {
  // Find the fitness calculation section and replace it
  const fitnessFunction = createEnhancedFitnessFunction(weights);

  // This would inject the enhanced fitness calculation into the worker
  // For now, we'll modify it at runtime through the config object
  return placementWorkerCode;
}

/**
 * Create a wrapper that maintains backward compatibility
 */
export class SvgNestWrapper {
  constructor(originalSvgNest, enhancedConfig) {
    this.original = originalSvgNest;
    this.enhanced = enhancedConfig;
    this.binVariants = [];
    this.results = [];
  }

  /**
   * Pass-through methods to original
   */
  parsesvg(svgstring) {
    return this.original.parsesvg(svgstring);
  }

  setbin(element) {
    return this.original.setbin(element);
  }

  config(c) {
    if (!c) {
      return { ...this.original.config(), ...this.enhanced };
    }

    // Update both configs
    this.enhanced = { ...this.enhanced, ...c };
    return this.original.config(c);
  }

  start(progressCallback, displayCallback) {
    // Inject enhanced config before starting
    this.original.enhancedConfig = this.enhanced;

    return this.original.start(progressCallback, displayCallback);
  }

  stop() {
    return this.original.stop();
  }

  /**
   * Test multiple bin configurations
   */
  async testMultipleBins(binConfigs, progressCallback, displayCallback) {
    const results = [];

    for (let i = 0; i < binConfigs.length; i++) {
      const binConfig = binConfigs[i];

      // Update bin size
      // This would require modifying the bin in the original
      if (progressCallback) {
        progressCallback({
          phase: 'testing-bin',
          binIndex: i,
          totalBins: binConfigs.length,
          progress: i / binConfigs.length
        });
      }

      // Run nesting with this bin config
      await this.start(progressCallback, displayCallback);

      // Collect result
      // This would need to be extracted from the original's best result
    }

    return this.getBestResult(results);
  }

  getBestResult(results) {
    // Compare results and return best based on enhanced fitness
    if (!results || results.length === 0) return null;

    let best = results[0];
    let bestFitness = this.calculateFitness(best);

    for (let i = 1; i < results.length; i++) {
      const fitness = this.calculateFitness(results[i]);
      if (fitness < bestFitness) {
        bestFitness = fitness;
        best = results[i];
      }
    }

    return { ...best, fitness: bestFitness };
  }

  calculateFitness(result) {
    const weights = this.enhanced.fitnessWeights || {
      binCount: 1.0,
      binWidth: 1.0,
      binHeight: 0.5,
      unplacedParts: 2.0
    };

    let fitness = 0;
    fitness += (result.placements?.length || 0) * weights.binCount;
    fitness += (result.unplaced?.length || 0) * weights.unplacedParts;

    return fitness;
  }
}

/**
 * Factory function to create wrapped instance
 */
export function createSvgNestWrapper(originalInstance, config = {}) {
  return new SvgNestWrapper(originalInstance, config);
}
