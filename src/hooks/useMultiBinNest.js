import { useState, useRef, useCallback } from 'react'
import { testMultiBinNestingIterative } from '../utils/multiBinNesting'

/**
 * Hook for managing multi-bin nesting with iterative improvement
 * Similar to useSVGNest but for multi-bin scenarios
 */
export const useMultiBinNest = () => {
  const [isWorking, setIsWorking] = useState(false)
  const [iterations, setIterations] = useState(0)
  const [bestResult, setBestResult] = useState(null)
  const [currentResult, setCurrentResult] = useState(null)

  const workerRef = useRef(null)
  const stopRequested = useRef(false)

  /**
   * Start the iterative nesting process
   * @param {Array} bins - Array of bin objects
   * @param {Array} shapes - Array of shapes to nest
   * @param {Function} onProgress - Callback for progress updates
   * @param {Function} onNewBest - Callback when a better solution is found
   */
  const startNesting = useCallback((bins, shapes, onProgress, onNewBest) => {
    if (isWorking) {
      console.warn('Nesting already in progress')
      return { success: false, message: 'Nesting already in progress' }
    }

    // Reset state
    setIsWorking(true)
    setIterations(0)
    setBestResult(null)
    setCurrentResult(null)
    stopRequested.current = false

    // Start iterative process
    const iterate = () => {
      if (stopRequested.current) {
        setIsWorking(false)
        return
      }

      // Run one iteration
      setIterations(prev => {
        const newIterations = prev + 1
        
        // Test with current iteration count to vary the strategy
        const result = testMultiBinNestingIterative(bins, shapes, newIterations)
        
        setCurrentResult(result)

        // Check if this is the best result so far
        setBestResult(prevBest => {
          if (!prevBest || isBetterResult(result, prevBest)) {
            // Found a better solution
            if (onNewBest) {
              onNewBest(result, newIterations)
            }
            return result
          }
          return prevBest
        })

        // Call progress callback
        if (onProgress) {
          onProgress(newIterations, result)
        }

        return newIterations
      })

      // Schedule next iteration
      workerRef.current = setTimeout(iterate, 0)
    }

    // Start first iteration
    iterate()

    return { success: true }
  }, [isWorking])

  /**
   * Stop the nesting process
   */
  const stopNesting = useCallback(() => {
    stopRequested.current = true
    
    if (workerRef.current) {
      clearTimeout(workerRef.current)
      workerRef.current = null
    }
    
    setIsWorking(false)
  }, [])

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    stopNesting()
    setIterations(0)
    setBestResult(null)
    setCurrentResult(null)
  }, [stopNesting])

  return {
    // State
    isWorking,
    iterations,
    bestResult,
    currentResult,
    
    // Functions
    startNesting,
    stopNesting,
    reset
  }
}

/**
 * Compare two nesting results to determine which is better
 * Priority: 1) More shapes placed, 2) Better efficiency, 3) Fewer bins used
 */
function isBetterResult(newResult, oldResult) {
  // First priority: place more shapes
  if (newResult.placedShapes > oldResult.placedShapes) {
    return true
  }
  if (newResult.placedShapes < oldResult.placedShapes) {
    return false
  }

  // Second priority: better efficiency (when same number of shapes placed)
  if (newResult.binEfficiency > oldResult.binEfficiency) {
    return true
  }
  if (newResult.binEfficiency < oldResult.binEfficiency) {
    return false
  }

  // Third priority: use fewer bins
  if (newResult.binsUsed < oldResult.binsUsed) {
    return true
  }

  return false
}
