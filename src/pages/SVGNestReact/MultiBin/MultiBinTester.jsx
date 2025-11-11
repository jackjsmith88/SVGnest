import { useState, useEffect, useRef } from 'react'
import BinVisualizer from '../Components/Shared/BinVisualizer'
import { createSimpleShapes, createRealisticCuttingScenario } from '../../../utils/multiBinNesting'
import { createPerfectSingleBinTest, createInterlockingLShapesTest, createExactTwoBinsTest } from '../../../utils/testCases'
import { runMultiBinSVGNest } from '../../../utils/multiBinSVGNest'
import '../Components/Shared/TopSolutions.css'

function MultiBinTester() {
  const [binWidth, setBinWidth] = useState(400)
  const [binHeight, setBinHeight] = useState(300)
  const [numShapes, setNumShapes] = useState(10)
  const [scenario, setScenario] = useState('mixed')
  const [timeLimit, setTimeLimit] = useState(60) // Time limit for optimization
  const [error, setError] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentBin, setCurrentBin] = useState(0)
  const [results, setResults] = useState(null)
  
  // Live iteration feedback
  const [currentIteration, setCurrentIteration] = useState(0)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [bestPlacement, setBestPlacement] = useState(null)
  const [currentPlacement, setCurrentPlacement] = useState(null)
  const [statusText, setStatusText] = useState('')
  const [activityPulse, setActivityPulse] = useState(0) // For visual feedback
  const [iterationFlash, setIterationFlash] = useState(0) // Increments on every callback
  
  // Execution report tracking
  const [executionReport, setExecutionReport] = useState(null)
  const [reportCopied, setReportCopied] = useState(false)

  // Ref to track if component is mounted
  const isMountedRef = useRef(true)

  // Cleanup on unmount - stop any running operations
  useEffect(() => {
    return () => {
      console.log('MultiBinTester: Cleaning up on unmount')
      isMountedRef.current = false
      if (window.SvgNest && window.SvgNest.working) {
        window.SvgNest.stop()
      }
    }
  }, [])

  // Run multi-bin packing with SVGnest
  const handleStart = async () => {
    if (isRunning) {
      return
    }

    setIsRunning(true)
    setError(null)
    setResults(null)
    setCurrentBin(0)
    setBestPlacement(null)
    setCurrentPlacement(null)
    setCurrentIteration(0)
    setCurrentProgress(0)
    setStatusText('Initializing...')
    setReportCopied(false)
    
    // Initialize execution report
    const startTime = Date.now()
    const report = {
      startTime: new Date().toISOString(),
      configuration: {
        binWidth,
        binHeight,
        numShapes,
        scenario,
        timeLimit
      },
      bins: [],
      timeline: [],
      totalCallbacks: 0,
      topSolutions: [] // Track top 3 best solutions
    }

    try {
      // Create test shapes
      const shapes = scenario === 'kitchen' 
        ? createRealisticCuttingScenario('kitchen', numShapes)
        : scenario === 'test-single-bin'
        ? createPerfectSingleBinTest().shapes
        : scenario === 'test-two-bins'
        ? createExactTwoBinsTest().shapes
        : scenario === 'test-interlocking'
        ? createInterlockingLShapesTest().shapes
        : createSimpleShapes(numShapes, binWidth, binHeight)

      report.timeline.push({
        timestamp: Date.now() - startTime,
        event: 'SHAPES_GENERATED',
        detail: `Generated ${shapes.length} shapes`
      })

      console.log(`Starting multi-bin packing with ${shapes.length} shapes`)
      console.log(`Time limit: ${timeLimit} seconds`)

      // Run SVGnest multi-bin packing (it will create as many bins as needed)
      const result = await runMultiBinSVGNest(
        shapes,
        binWidth,
        binHeight,
        10, // maxBins - unused but kept for compatibility
        timeLimit,
        {
          // Called when each bin completes
          onBinComplete: (binResult, binIndex, allBins) => {
            setCurrentBin(binIndex + 1)
            setStatusText(`Completed bin ${binIndex + 1}`)
            
            report.bins.push({
              binIndex: binIndex + 1,
              placedShapes: binResult.placedCount,
              efficiency: (binResult.efficiency * 100).toFixed(2) + '%',
              iterations: binResult.iterations,
              timeSpent: `~${timeLimit}s`
            })
            
            report.timeline.push({
              timestamp: Date.now() - startTime,
              event: 'BIN_COMPLETE',
              detail: `Bin ${binIndex + 1}: ${binResult.placedCount} shapes, ${(binResult.efficiency * 100).toFixed(1)}% efficiency`
            })
            
            console.log(`Completed bin ${binIndex + 1}`)
            
            // Update results in real-time
            setResults({
              bins: allBins,
              binsUsed: allBins.length,
              totalShapes: shapes.length,
              placedShapes: allBins.reduce((sum, b) => sum + b.placedCount, 0),
              unplacedShapes: shapes.length - allBins.reduce((sum, b) => sum + b.placedCount, 0),
              binEfficiency: allBins.reduce((sum, b) => sum + (b.efficiency * 100), 0) / allBins.length
            })
          },
          // Called on each iteration with current attempt
          onProgress: (progress, binIndex) => {
            setCurrentProgress(Math.round(progress * 100))
            setStatusText(`Optimizing packing - ${Math.round(progress * 100)}% progress`)
            // Pulse activity indicator on every progress update
            setActivityPulse(prev => prev + 1)
          },
          // Called when better solution found
          // binIndex here is actually binsUsed from V2
          onBestFound: (svg, efficiency, placed, total, iterations, binsUsed) => {
            setCurrentIteration(iterations)
            setBestPlacement({ svg, efficiency, placed, total })
            setStatusText(`Found better solution - ${placed}/${total} placed in ${binsUsed} bin(s) (${(efficiency * 100).toFixed(1)}%)`)
            
            // Track top 3 solutions
            const solution = {
              iteration: iterations,
              timestamp: Date.now() - startTime,
              placed,
              total,
              binsUsed,
              efficiency: efficiency * 100,
              svg: svg ? svg.outerHTML : null
            }
            
            // Add to topSolutions and keep only top 3
            // Prioritize: 1) Fewer bins, 2) Higher efficiency
            report.topSolutions.push(solution)
            report.topSolutions.sort((a, b) => {
              // First, prefer fewer bins
              if (a.binsUsed !== b.binsUsed) {
                return a.binsUsed - b.binsUsed
              }
              // If same bins, prefer higher efficiency
              return b.efficiency - a.efficiency
            })
            if (report.topSolutions.length > 3) {
              report.topSolutions = report.topSolutions.slice(0, 3)
            }
            
            report.timeline.push({
              timestamp: Date.now() - startTime,
              event: 'IMPROVEMENT_FOUND',
              detail: `Iteration ${iterations}: ${placed}/${total} shapes in ${binsUsed} bin(s), ${(efficiency * 100).toFixed(1)}% efficiency`
            })
          },
          // Called on each iteration (may be very frequent)
          onIterationUpdate: (svg) => {
            setCurrentPlacement(svg)
            setIterationFlash(prev => prev + 1) // Increment to trigger re-render
            report.totalCallbacks++
          }
        }
      )

      const endTime = Date.now()
      const totalTimeMs = endTime - startTime
      
      report.endTime = new Date().toISOString()
      report.totalDuration = `${(totalTimeMs / 1000).toFixed(2)}s`
      report.summary = {
        totalShapes: shapes.length,
        placedShapes: result.placedShapes,
        unplacedShapes: result.unplacedShapes,
        binsUsed: result.binsUsed,
        averageEfficiency: result.binEfficiency.toFixed(2) + '%',
        totalIterations: result.bins?.reduce((sum, b) => sum + (b.iterations || 0), 0),
        totalCallbacks: report.totalCallbacks
      }
      
      report.timeline.push({
        timestamp: totalTimeMs,
        event: 'PACKING_COMPLETE',
        detail: `${result.placedShapes}/${shapes.length} shapes placed in ${result.binsUsed} bins`
      })

      setResults(result)
      setExecutionReport(report)
      setStatusText('Packing complete!')
      console.log('Multi-bin packing complete:', result)

    } catch (err) {
      const endTime = Date.now()
      report.endTime = new Date().toISOString()
      report.error = err.message
      report.timeline.push({
        timestamp: endTime - startTime,
        event: 'ERROR',
        detail: err.message
      })
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(err.message)
        setExecutionReport(report)
        setStatusText(`Error: ${err.message}`)
      }
      console.error('Multi-bin packing error:', err)
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsRunning(false)
      }
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
    setCurrentBin(0)
    setBestPlacement(null)
    setCurrentPlacement(null)
    setCurrentIteration(0)
    setCurrentProgress(0)
    setStatusText('')
    setExecutionReport(null)
    setReportCopied(false)
  }

  const loadCustomShapes = () => {
    // TODO: Implement file upload for custom SVG shapes
    alert('Custom shape loading coming soon!')
  }

  const copyReportToClipboard = async () => {
    if (!executionReport) return

    const reportText = generateReportText(executionReport)
    
    try {
      await navigator.clipboard.writeText(reportText)
      setReportCopied(true)
      setTimeout(() => setReportCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy report:', err)
      alert('Failed to copy to clipboard. Check console for report.')
      console.log(reportText)
    }
  }

  const generateReportText = (report) => {
    const lines = []
    
    lines.push('═══════════════════════════════════════════════════')
    lines.push('     SVGnest MULTI-BIN PACKING EXECUTION REPORT')
    lines.push('═══════════════════════════════════════════════════')
    lines.push('')
    
    lines.push('📋 CONFIGURATION')
    lines.push('─'.repeat(50))
    lines.push(`  Scenario:        ${report.configuration.scenario}`)
    lines.push(`  Total Shapes:    ${report.configuration.numShapes}`)
    lines.push(`  Bin Dimensions:  ${report.configuration.binWidth}×${report.configuration.binHeight}px`)
    lines.push(`  Time Limit:      ${report.configuration.timeLimit}s`)
    lines.push(`  Start Time:      ${report.startTime}`)
    lines.push(`  End Time:        ${report.endTime}`)
    lines.push(`  Total Duration:  ${report.totalDuration}`)
    lines.push('')
    
    lines.push('📊 SUMMARY')
    lines.push('─'.repeat(50))
    if (report.summary) {
      lines.push(`  Shapes Placed:      ${report.summary.placedShapes}/${report.summary.totalShapes} (${((report.summary.placedShapes/report.summary.totalShapes)*100).toFixed(1)}%)`)
      lines.push(`  Shapes Unplaced:    ${report.summary.unplacedShapes}`)
      lines.push(`  Bins Used:          ${report.summary.binsUsed}`)
      lines.push(`  Average Efficiency: ${report.summary.averageEfficiency}`)
      lines.push(`  Total Iterations:   ${report.summary.totalIterations}`)
      lines.push(`  Total Callbacks:    ${report.summary.totalCallbacks}`)
    }
    lines.push('')
    
    // Top 3 Solutions
    if (report.topSolutions && report.topSolutions.length > 0) {
      lines.push('🏆 TOP 3 SOLUTIONS')
      lines.push('─'.repeat(50))
      report.topSolutions.forEach((sol, idx) => {
        lines.push(`  #${idx + 1} - Iteration ${sol.iteration} (${(sol.timestamp / 1000).toFixed(2)}s)`)
        lines.push(`    ├─ Placed:      ${sol.placed}/${sol.total} shapes`)
        lines.push(`    ├─ Bins Used:   ${sol.binsUsed}`)
        lines.push(`    ├─ Efficiency:  ${sol.efficiency.toFixed(2)}%`)
        lines.push(`    └─ Timestamp:   ${(sol.timestamp / 1000).toFixed(2)}s`)
      })
      lines.push('')
    }
    
    lines.push('🗂️  BIN DETAILS')
    lines.push('─'.repeat(50))
    report.bins.forEach(bin => {
      lines.push(`  Bin ${bin.binIndex}:`)
      lines.push(`    ├─ Placed:      ${bin.placedShapes} shapes`)
      lines.push(`    ├─ Efficiency:  ${bin.efficiency}`)
      lines.push(`    ├─ Iterations:  ${bin.iterations}`)
      lines.push(`    └─ Time:        ${bin.timeSpent}`)
    })
    lines.push('')
    
    lines.push('⏱️  TIMELINE')
    lines.push('─'.repeat(50))
    report.timeline.forEach(event => {
      const time = `${(event.timestamp / 1000).toFixed(2)}s`.padEnd(8)
      const eventType = event.event.padEnd(20)
      lines.push(`  ${time} ${eventType} ${event.detail}`)
    })
    lines.push('')
    
    if (report.error) {
      lines.push('❌ ERROR')
      lines.push('─'.repeat(50))
      lines.push(`  ${report.error}`)
      lines.push('')
    }
    
    lines.push('═══════════════════════════════════════════════════')
    lines.push(`Generated by SVGnest Multi-Bin Packer`)
    lines.push('═══════════════════════════════════════════════════')
    
    return lines.join('\n')
  }

  return (
    <div className="multibin-tester">
      {/* Show controls only when not running */}
      {!isRunning && (
        <div className="multibin-controls">
          <h2>Multi-Bin Configuration (SVGnest)</h2>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '-0.5em' }}>
            Uses the proven SVGnest genetic algorithm across multiple bins
          </p>

          <div className="control-row">
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

            <div className="control-group">
              <label>Time Limit (seconds):</label>
              <input
                type="number"
                min="5"
                max="300"
                step="5"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                title="How long SVGnest will optimize the packing"
              />
            </div>

            <div className="control-group">
              <label>Cutting Scenario:</label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                <option value="mixed">Mixed (Random L-shapes & Rectangles)</option>
                <option value="kitchen">Kitchen (Realistic Worktops)</option>
                <optgroup label="Test Cases (Deterministic)">
                  <option value="test-single-bin">Test: 8 Strips (1 Bin, ~93%)</option>
                  <option value="test-two-bins">Test: 8 Quarters (2 Bins, ~95%)</option>
                  <option value="test-interlocking">Test: Strips + L-shapes (2 Bins)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="button-row">
            <button 
              className="button start-button"
              onClick={handleStart}
            >
              Start Multi-Bin Packing
            </button>

            <button 
              className="button secondary" 
              onClick={handleReset}
              disabled={!!results}
            >
              Reset
            </button>

            <button 
              className="button secondary" 
              onClick={loadCustomShapes}
            >
              Load Custom Shapes
            </button>
          </div>
        </div>
      )}

      {/* Live packing visualization */}
      {isRunning && (
        <div className="live-packing-view">
          <div className="packing-header">
            <h2>
              <span className="spinner">⟳</span>
              {statusText}
            </h2>
            <div className="packing-stats">
              <span>Iteration {currentIteration}</span>
              <span>•</span>
              <span>Progress: {currentProgress}%</span>
            </div>
          </div>

          <div className="packing-visualization">
            <div className="viz-panel">
              <h3>Current Best Placement</h3>
              <div className="svg-container best-placement">
                {bestPlacement && bestPlacement.svg ? (
                  <div dangerouslySetInnerHTML={{ __html: bestPlacement.svg.outerHTML }} />
                ) : (
                  <div className="placeholder">Searching for solutions...</div>
                )}
                {bestPlacement && (
                  <div className="placement-stats">
                    <span>{bestPlacement.placed}/{bestPlacement.total} placed</span>
                    <span>•</span>
                    <span>{(bestPlacement.efficiency * 100).toFixed(1)}% efficient</span>
                  </div>
                )}
              </div>
            </div>

            <div className="viz-panel">
              <h3>Current Iteration <span className="iteration-counter">#{iterationFlash}</span></h3>
              <div className={`svg-container current-iteration ${iterationFlash % 2 === 0 ? 'flash-even' : 'flash-odd'}`}>
                {currentPlacement ? (
                  <div dangerouslySetInnerHTML={{ __html: currentPlacement.outerHTML }} />
                ) : bestPlacement && bestPlacement.svg ? (
                  <div className="working-indicator">
                    <div dangerouslySetInnerHTML={{ __html: bestPlacement.svg.outerHTML }} />
                    <div className="working-overlay">Searching...</div>
                  </div>
                ) : (
                  <div className="placeholder">Calculating...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="message error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="multibin-results">
          <div className="results-header">
            <h2>Multi-Bin Results <span className="best-badge">SVGnest Algorithm</span></h2>
            {executionReport && (
              <button 
                className={`button exec-report-btn ${reportCopied ? 'copied' : ''}`}
                onClick={copyReportToClipboard}
              >
                {reportCopied ? '✓ Copied!' : '📋 Exec Report'}
              </button>
            )}
          </div>

          {executionReport && (
            <div className="execution-summary">
              <h3>⚡ Execution Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Duration:</span>
                  <span className="value">{executionReport.totalDuration}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Callbacks:</span>
                  <span className="value">{executionReport.totalCallbacks?.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Avg per Bin:</span>
                  <span className="value">{(executionReport.totalCallbacks / results.binsUsed).toFixed(0)}/bin</span>
                </div>
                <div className="summary-item">
                  <span className="label">Success Rate:</span>
                  <span className="value">{((results.placedShapes / results.totalShapes) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

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
                <strong>Bins created:</strong> {results.binsUsed}
              </div>
              <div className="stat-item">
                <strong>Time elapsed:</strong> {results.elapsed || 0}s
              </div>
            </div>
          </div>

          {/* Top 3 Solutions Comparison */}
          {executionReport?.topSolutions && executionReport.topSolutions.length > 0 && (
            <div className="top-solutions-section">
              <h2>🏆 Top {executionReport.topSolutions.length} Solutions</h2>
              <p className="section-description">
                Best performing packing configurations discovered during optimization
              </p>
              <div className="solutions-grid">
                {executionReport.topSolutions.map((solution, idx) => (
                  <div key={idx} className="solution-card">
                    <div className="solution-header">
                      <h3>#{idx + 1}</h3>
                      <div className="solution-badge">
                        {solution.efficiency.toFixed(1)}% efficiency
                      </div>
                    </div>
                    <div className="solution-stats">
                      <span>Iteration {solution.iteration}</span>
                      <span>•</span>
                      <span>{solution.placed}/{solution.total} shapes</span>
                      <span>•</span>
                      <span>{solution.binsUsed} bin(s)</span>
                      <span>•</span>
                      <span>{(solution.timestamp / 1000).toFixed(1)}s</span>
                    </div>
                    {solution.svg && (
                      <div 
                        className="solution-preview" 
                        dangerouslySetInnerHTML={{ __html: solution.svg }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    dangerouslySetInnerHTML={{ __html: bin.svg.outerHTML || bin.svg }}
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