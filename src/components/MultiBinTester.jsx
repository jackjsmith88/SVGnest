import { useState } from 'react'
import BinVisualizer from './BinVisualizer'
import { createSimpleShapes, createRealisticCuttingScenario } from '../utils/multiBinNesting'
import { runMultiBinSVGNest } from '../utils/multiBinSVGNest'

function MultiBinTester() {
  const [numBins, setNumBins] = useState(3)
  const [binWidth, setBinWidth] = useState(400)
  const [binHeight, setBinHeight] = useState(300)
  const [numShapes, setNumShapes] = useState(10)
  const [scenario, setScenario] = useState('mixed')
  const [timePerBin, setTimePerBin] = useState(30) // New: seconds per bin
  const [error, setError] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentBin, setCurrentBin] = useState(0)
  const [results, setResults] = useState(null)

  // Run multi-bin packing with SVGnest
  const handleStart = async () => {
    if (isRunning) {
      return
    }

    setIsRunning(true)
    setError(null)
    setResults(null)
    setCurrentBin(0)

    try {
      // Create test shapes
      const shapes = scenario === 'kitchen' 
        ? createRealisticCuttingScenario('kitchen', numShapes)
        : createSimpleShapes(numShapes, binWidth, binHeight)

      console.log(`Starting multi-bin packing with ${shapes.length} shapes across up to ${numBins} bins`)
      console.log(`Each bin will run for ${timePerBin} seconds`)

      // Run SVGnest multi-bin packing
      const result = await runMultiBinSVGNest(
        shapes,
        binWidth,
        binHeight,
        numBins,
        timePerBin,
        (binResult, binIndex, allBins) => {
          // Called when each bin completes
          setCurrentBin(binIndex + 1)
          console.log(`Completed bin ${binIndex + 1}/${numBins}`)
          
          // Update results in real-time
          setResults({
            bins: allBins,
            binsUsed: allBins.length,
            totalBins: numBins,
            totalShapes: shapes.length,
            placedShapes: allBins.reduce((sum, b) => sum + b.placedCount, 0),
            unplacedShapes: shapes.length - allBins.reduce((sum, b) => sum + b.placedCount, 0),
            binEfficiency: allBins.reduce((sum, b) => sum + (b.efficiency * 100), 0) / allBins.length
          })
        }
      )

      setResults(result)
      console.log('Multi-bin packing complete:', result)

    } catch (err) {
      setError(err.message)
      console.error('Multi-bin packing error:', err)
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
    setCurrentBin(0)
  }

  const loadCustomShapes = () => {
    // TODO: Implement file upload for custom SVG shapes
    alert('Custom shape loading coming soon!')
  }

  return (
    <div className="multibin-tester">
      <div className="multibin-controls">
        <h2>Multi-Bin Configuration (SVGnest)</h2>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '-0.5em' }}>
          Uses the proven SVGnest genetic algorithm across multiple bins
        </p>

        <div className="control-row">
          <div className="control-group">
            <label>Number of Bins:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={numBins}
              onChange={(e) => setNumBins(parseInt(e.target.value))}
              disabled={isRunning}
            />
          </div>

          <div className="control-group">
            <label>Bin Width (px):</label>
            <input
              type="number"
              min="100"
              max="1000"
              value={binWidth}
              onChange={(e) => setBinWidth(parseInt(e.target.value))}
              disabled={isRunning}
            />
          </div>

          <div className="control-group">
            <label>Bin Height (px):</label>
            <input
              type="number"
              min="100"
              max="1000"
              value={binHeight}
              onChange={(e) => setBinHeight(parseInt(e.target.value))}
              disabled={isRunning}
            />
          </div>

          <div className="control-group">
            <label>Number of Test Shapes:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={numShapes}
              onChange={(e) => setNumShapes(parseInt(e.target.value))}
              disabled={isRunning}
            />
          </div>

          <div className="control-group">
            <label>Time per Bin (seconds):</label>
            <input
              type="number"
              min="5"
              max="300"
              step="5"
              value={timePerBin}
              onChange={(e) => setTimePerBin(parseInt(e.target.value))}
              disabled={isRunning}
              title="How long SVGnest runs on each bin before moving to the next"
            />
          </div>

          <div className="control-group">
            <label>Cutting Scenario:</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              disabled={isRunning}
            >
              <option value="mixed">Mixed (Random L-shapes & Rectangles)</option>
              <option value="kitchen">Kitchen (Realistic Worktops)</option>
            </select>
          </div>
        </div>

        <div className="button-row">
          <button 
            className={`button ${isRunning ? 'stop-button' : 'start-button'}`}
            onClick={handleStart}
            disabled={isRunning}
          >
            {isRunning ? `Running... (Bin ${currentBin}/${numBins})` : 'Start Multi-Bin Packing'}
          </button>

          <button 
            className="button secondary" 
            onClick={handleReset}
            disabled={isRunning}
          >
            Reset
          </button>

          <button 
            className="button secondary" 
            onClick={loadCustomShapes}
            disabled={isRunning}
          >
            Load Custom Shapes
          </button>
        </div>

        {/* Progress indicator */}
        {isRunning && (
          <div className="progress-info">
            <div className="stat-item">
              <strong>Status:</strong> Packing bin {currentBin}/{numBins}
            </div>
            <div className="stat-item">
              <strong>Time per bin:</strong> {timePerBin}s
            </div>
            <div className="stat-item">
              <strong>Algorithm:</strong> SVGnest Genetic Algorithm
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="message error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="multibin-results">
          <h2>Multi-Bin Results <span className="best-badge">SVGnest Algorithm</span></h2>

          <div className="summary-stats">
            <div className="stat-group">
              <h3>Nesting Results</h3>
              <div className="stat-item">
                <strong>Total shapes:</strong> {results.totalShapes}
              </div>
              <div className="stat-item">
                <strong>Placed shapes:</strong> {results.placedShapes}
              </div>
              <div className="stat-item">
                <strong>Unplaced shapes:</strong> {results.unplacedShapes}
              </div>
              <div className="stat-item">
                <strong>Bins used:</strong> {results.binsUsed} / {results.totalBins}
              </div>
            </div>
            
            <div className="stat-group">
              <h3>Efficiency Metrics</h3>
              <div className="stat-item">
                <strong>Average bin efficiency:</strong> {results.binEfficiency?.toFixed(1)}%
              </div>
              <div className="stat-item">
                <strong>Total iterations:</strong> {results.bins?.reduce((sum, b) => sum + (b.iterations || 0), 0)}
              </div>
              <div className="stat-item">
                <strong>Time per bin:</strong> {timePerBin}s
              </div>
              <div className="stat-item">
                <strong>Total time:</strong> ~{results.binsUsed * timePerBin}s
              </div>
            </div>
          </div>

          <div className="bin-container">
            {results.bins?.map((bin, index) => (
              <div key={bin.binIndex || index} className="bin-result">
                <h3>Bin {bin.binIndex + 1}</h3>
                <div className="bin-stats">
                  <span>Shapes: {bin.placedCount}</span>
                  <span>Efficiency: {(bin.efficiency * 100).toFixed(1)}%</span>
                  <span>Iterations: {bin.iterations}</span>
                </div>
                {bin.svg && (
                  <div 
                    className="svg-display" 
                    dangerouslySetInnerHTML={{ __html: bin.svg.outerHTML }}
                  />
                )}
              </div>
            ))}
          </div>

          {results.unplacedShapes > 0 && (
            <div className="message error">
              <strong>Warning:</strong> {results.unplacedShapes} shape(s) could not be placed in any bin.
              Consider increasing bin dimensions, adding more bins, or allowing more time per bin.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiBinTester