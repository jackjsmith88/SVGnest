/**
 * SVGnest Core Module Exports
 */

export {
  validateConfig,
  defaultConfig,
  BinOptimizationStrategy,
  getFitnessWeights,
  createBinVariants
} from './config.js';

export {
  calculateFitness,
  calculateEfficiency,
  selectBestBinConfiguration,
  optimizeMultiBin
} from './optimizer.js';

export {
  calculateEnhancedFitness,
  createEnhancedPlacementWorker,
  createFitnessCalculator
} from './placement-worker-enhanced.js';

export {
  SvgNestEnhanced,
  createSvgNest
} from './svgnest-enhanced.js';

export {
  patchSvgNest,
  createEnhancedFitnessFunction,
  SvgNestWrapper,
  createSvgNestWrapper
} from './svgnest-wrapper.js';
