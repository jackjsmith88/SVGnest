/**
 * Enhanced SVGnest with Multi-Bin Optimization
 * Wraps the original SvgNest with new configuration options
 */

import { validateConfig, BinOptimizationStrategy } from './config.js';
import { calculateFitness } from './optimizer.js';

/**
 * Enhanced SVGnest class that extends the original with multi-bin optimization
 */
export class SvgNestEnhanced {
  constructor(config = {}) {
    this.config = validateConfig(config);
    this.results = [];
    this.bestResult = null;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = validateConfig({ ...this.config, ...newConfig });
    return this.config;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get optimization strategy
   */
  getStrategy() {
    return this.config.binOptimization;
  }

  /**
   * Set optimization strategy
   */
  setStrategy(strategy) {
    if (Object.values(BinOptimizationStrategy).includes(strategy)) {
      this.config.binOptimization = strategy;
      this.config = validateConfig(this.config);
    }
    return this.config.binOptimization;
  }

  /**
   * Calculate fitness for a result
   */
  calculateFitness(result) {
    return calculateFitness(result, this.config);
  }

  /**
   * Compare multiple results and return the best
   */
  getBestResult(results = null) {
    const resultsToCompare = results || this.results;

    if (!resultsToCompare || resultsToCompare.length === 0) {
      return null;
    }

    let best = resultsToCompare[0];
    let bestFitness = this.calculateFitness(best);

    for (let i = 1; i < resultsToCompare.length; i++) {
      const fitness = this.calculateFitness(resultsToCompare[i]);
      if (fitness < bestFitness) {
        bestFitness = fitness;
        best = resultsToCompare[i];
      }
    }

    return { ...best, fitness: bestFitness };
  }

  /**
   * Add a result to the collection
   */
  addResult(result) {
    this.results.push(result);

    const current = this.getBestResult([result]);
    if (!this.bestResult || current.fitness < this.bestResult.fitness) {
      this.bestResult = current;
    }

    return this.bestResult;
  }

  /**
   * Clear all results
   */
  clearResults() {
    this.results = [];
    this.bestResult = null;
  }

  /**
   * Get statistics about current results
   */
  getStats() {
    if (this.results.length === 0) {
      return null;
    }

    const fitnessValues = this.results.map(r => this.calculateFitness(r));
    const binCounts = this.results.map(r => r.placements?.length || 0);

    return {
      totalResults: this.results.length,
      bestFitness: this.bestResult?.fitness || Infinity,
      avgFitness: fitnessValues.reduce((a, b) => a + b, 0) / fitnessValues.length,
      minBins: Math.min(...binCounts),
      maxBins: Math.max(...binCounts),
      avgBins: binCounts.reduce((a, b) => a + b, 0) / binCounts.length,
      strategy: this.config.binOptimization
    };
  }

  /**
   * Test multiple bin configurations
   */
  async testBinConfigurations(binVariants, parts, progressCallback) {
    const results = [];

    for (let i = 0; i < binVariants.length; i++) {
      const binConfig = binVariants[i];

      if (progressCallback) {
        progressCallback({
          phase: 'testing-bin',
          binIndex: i,
          totalBins: binVariants.length,
          binConfig
        });
      }

      // This would integrate with the actual nesting algorithm
      // For now, this is a placeholder
      const result = await this.runNesting(binConfig, parts);

      if (result) {
        results.push({
          ...result,
          binConfig,
          fitness: this.calculateFitness(result)
        });
      }
    }

    return this.getBestResult(results);
  }

  /**
   * Run nesting with current configuration
   * This is a placeholder that will integrate with the original SvgNest
   */
  async runNesting(binConfig, parts) {
    // This will be implemented in the integration layer
    return null;
  }

  /**
   * Create a configuration preset
   */
  static createPreset(presetName) {
    const presets = {
      'fast-few-bins': {
        binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
        populationSize: 5,
        mutationRate: 15,
        rotations: 4
      },
      'high-quality': {
        binOptimization: BinOptimizationStrategy.BALANCED,
        populationSize: 20,
        mutationRate: 5,
        rotations: 8
      },
      'compact-packing': {
        binOptimization: BinOptimizationStrategy.MINIMIZE_AREA,
        populationSize: 15,
        mutationRate: 10,
        rotations: 4
      },
      'minimal-waste': {
        binOptimization: BinOptimizationStrategy.MINIMIZE_WASTE,
        populationSize: 15,
        mutationRate: 8,
        rotations: 4,
        exploreConcave: true
      }
    };

    return validateConfig(presets[presetName] || {});
  }
}

/**
 * Factory function to create an enhanced SvgNest instance
 */
export function createSvgNest(config = {}) {
  return new SvgNestEnhanced(config);
}

/**
 * Export strategy constants for convenience
 */
export { BinOptimizationStrategy };
