import { useState } from 'react'
import BinVisualizer from './BinVisualizer'
import { testMultiBinNesting, createSimpleShapes } from '../utils/multiBinNesting'

function MultiBinTester() {
  const [numBins, setNumBins] = useState(3)
  const [binWidth, setBinWidth] = useState(400)
  const [binHeight, setBinHeight] = useState(300)
  const [numShapes, setNumShapes] = useState(10)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runTest = () => {
    setLoading(true)
    setError(null)

    try {
      // Create bins
      const bins = []
      for (let i = 0; i < numBins; i++) {
        bins.push({
          id: `bin-${i}`,
          width: binWidth,
          height: binHeight,
          shapes: []
        })
      }

      // Create test shapes
      const shapes = createSimpleShapes(numShapes, binWidth, binHeight)

      // Test nesting
      const nestingResults = testMultiBinNesting(bins, shapes)

      setResults(nestingResults)
    } catch (err) {
      setError(err.message)
      console.error('Nesting error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomShapes = () => {
    // TODO: Implement file upload for custom SVG shapes
    alert('Custom shape loading coming soon!')
  }

  return (
    <div className="multibin-tester">
      <div className="multibin-controls">
        <h2>Multi-Bin Configuration</h2>

        <div className="control-row">
          <div className="control-group">
            <label>Number of Bins:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={numBins}
              onChange={(e) => setNumBins(parseInt(e.target.value))}
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
            />
          </div>
        </div>

        <div className="button-row">
          <button 
            className="button start-button" 
            onClick={runTest} 
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Multi-Bin Test'}
          </button>

          <button 
            className="button secondary" 
            onClick={loadCustomShapes}
          >
            Load Custom Shapes
          </button>
        </div>
      </div>

      {error && (
        <div className="message error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="multibin-results">
          <h2>Multi-Bin Results</h2>

          <div className="summary-stats">
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
            <div className="stat-item">
              <strong>Overall efficiency:</strong> {results.efficiency}%
            </div>
          </div>

          <div className="bin-container">
            {results.bins.map((bin, index) => (
              <BinVisualizer
                key={bin.id}
                bin={bin}
                index={index}
              />
            ))}
          </div>

          {results.unplacedShapes > 0 && (
            <div className="message error">
              <strong>Warning:</strong> {results.unplacedShapes} shape(s) could not be placed in any bin.
              Consider increasing bin dimensions or adding more bins.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiBinTester