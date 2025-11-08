/**
 * SVGnest - Enhanced Multi-Bin Nesting Library
 *
 * Main export file for ES6 module usage
 *
 * Usage:
 *   import { createSvgNest, BinOptimizationStrategy } from '@svgnest/core'
 *
 *   const nester = createSvgNest({
 *     binOptimization: BinOptimizationStrategy.MINIMIZE_BINS,
 *     rotations: 4,
 *     spacing: 2
 *   })
 */

// Re-export all core functionality
export * from './core/index.js';

// Additional convenience exports
export { BinOptimizationStrategy } from './core/config.js';
export { createSvgNest } from './core/svgnest-enhanced.js';

/**
 * Quick start function for common use cases
 */
export function quickStart(options = {}) {
  const { createSvgNest } = await import('./core/svgnest-enhanced.js');
  return createSvgNest(options);
}

/**
 * Preset configurations for common scenarios
 */
export const Presets = {
  /**
   * Minimize the number of bins used
   * Good for: Reducing material waste when bin size is fixed
   */
  MINIMIZE_BINS: {
    binOptimization: 'minimize-bins',
    populationSize: 10,
    mutationRate: 10,
    rotations: 4
  },

  /**
   * Minimize the total area used across all bins
   * Good for: Compact packing, variable bin sizes
   */
  MINIMIZE_AREA: {
    binOptimization: 'minimize-area',
    populationSize: 15,
    mutationRate: 8,
    rotations: 4
  },

  /**
   * Balanced approach between bin count and area
   * Good for: General purpose nesting
   */
  BALANCED: {
    binOptimization: 'balanced',
    populationSize: 10,
    mutationRate: 10,
    rotations: 4
  },

  /**
   * High quality nesting with more iterations
   * Good for: When quality is more important than speed
   */
  HIGH_QUALITY: {
    binOptimization: 'balanced',
    populationSize: 20,
    mutationRate: 5,
    rotations: 8,
    exploreConcave: true
  },

  /**
   * Fast nesting with fewer iterations
   * Good for: Quick previews, large part counts
   */
  FAST: {
    binOptimization: 'balanced',
    populationSize: 5,
    mutationRate: 15,
    rotations: 4
  }
};

/**
 * Create a nester with a preset configuration
 *
 * @param {string} presetName - Name of the preset (MINIMIZE_BINS, MINIMIZE_AREA, etc.)
 * @param {object} overrides - Additional configuration to override preset values
 * @returns {SvgNestEnhanced} Configured nester instance
 */
export async function createWithPreset(presetName, overrides = {}) {
  const { createSvgNest } = await import('./core/svgnest-enhanced.js');
  const preset = Presets[presetName] || Presets.BALANCED;
  return createSvgNest({ ...preset, ...overrides });
}

/**
 * Version info
 */
export const version = '2.0.0';
export const name = '@svgnest/core';
