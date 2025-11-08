/**
 * SVGnest Configuration Module
 * Handles configuration validation and defaults
 */

export const BinOptimizationStrategy = {
  MINIMIZE_BINS: 'minimize-bins',
  MINIMIZE_AREA: 'minimize-area',
  MINIMIZE_WASTE: 'minimize-waste',
  BALANCED: 'balanced',
  CUSTOM: 'custom'
};

export const defaultConfig = {
  clipperScale: 10000000,
  curveTolerance: 0.3,
  spacing: 0,
  rotations: 4,
  populationSize: 10,
  mutationRate: 10,
  useHoles: false,
  exploreConcave: false,

  // New multi-bin configuration options
  binOptimization: BinOptimizationStrategy.BALANCED,

  // Fitness weights for different strategies
  fitnessWeights: {
    binCount: 1.0,      // Weight for number of bins used
    binWidth: 1.0,      // Weight for bin width
    binHeight: 0.5,     // Weight for bin height
    unplacedParts: 2.0  // Weight for unplaced parts
  },

  // Custom fitness function (optional)
  customFitness: null,

  // Bin configurations to test (if null, uses single bin from SVG)
  binVariants: null,

  // Maximum number of bins to allow (0 = unlimited)
  maxBins: 0
};

/**
 * Get fitness weights based on optimization strategy
 */
export function getFitnessWeights(strategy) {
  switch (strategy) {
    case BinOptimizationStrategy.MINIMIZE_BINS:
      return {
        binCount: 10.0,     // Heavily penalize new bins
        binWidth: 0.1,
        binHeight: 0.05,
        unplacedParts: 2.0
      };

    case BinOptimizationStrategy.MINIMIZE_AREA:
      return {
        binCount: 0.5,      // Light penalty for new bins
        binWidth: 2.0,      // Prioritize compact packing
        binHeight: 1.0,
        unplacedParts: 2.0
      };

    case BinOptimizationStrategy.MINIMIZE_WASTE:
      return {
        binCount: 2.0,
        binWidth: 1.5,
        binHeight: 1.0,
        unplacedParts: 3.0  // Prioritize placing all parts
      };

    case BinOptimizationStrategy.BALANCED:
    default:
      return {
        binCount: 1.0,
        binWidth: 1.0,
        binHeight: 0.5,
        unplacedParts: 2.0
      };
  }
}

/**
 * Validate and merge configuration
 */
export function validateConfig(userConfig = {}) {
  const config = { ...defaultConfig, ...userConfig };

  // Validate numeric values
  if (config.curveTolerance <= 0) {
    config.curveTolerance = defaultConfig.curveTolerance;
  }

  if (config.spacing < 0) {
    config.spacing = 0;
  }

  if (config.rotations < 0) {
    config.rotations = 0;
  }

  if (config.populationSize < 2) {
    config.populationSize = 2;
  }

  if (config.mutationRate < 0 || config.mutationRate > 100) {
    config.mutationRate = defaultConfig.mutationRate;
  }

  // Set fitness weights based on strategy if not custom
  if (config.binOptimization !== BinOptimizationStrategy.CUSTOM) {
    config.fitnessWeights = {
      ...config.fitnessWeights,
      ...getFitnessWeights(config.binOptimization)
    };
  }

  return config;
}

/**
 * Create bin variant configurations for testing
 */
export function createBinVariants(baseWidth, baseHeight, variants = []) {
  if (!variants || variants.length === 0) {
    return [{ width: baseWidth, height: baseHeight, label: 'default' }];
  }

  return variants.map((variant, index) => ({
    width: variant.width || baseWidth,
    height: variant.height || baseHeight,
    label: variant.label || `variant-${index}`,
    ...variant
  }));
}
