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
    <div>
      <div className="controls">
        <h2>Configuration</h2>

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

        <button onClick={runTest} disabled={loading}>
          {loading ? 'Running...' : 'Run Multi-Bin Test'}
        </button>

        <button className="secondary" onClick={loadCustomShapes}>
          Load Custom Shapes
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="results">
          <h2>Results</h2>

          <div className="info">
            <strong>Summary:</strong>
            <div>Total shapes: {results.totalShapes}</div>
            <div>Placed shapes: {results.placedShapes}</div>
            <div>Unplaced shapes: {results.unplacedShapes}</div>
            <div>Bins used: {results.binsUsed} / {results.totalBins}</div>
            <div>Overall efficiency: {results.efficiency}%</div>
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
            <div className="error">
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
