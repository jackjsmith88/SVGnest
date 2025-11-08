/**
 * React + Vite Example for SVGnest Enhanced
 * Demonstrates multi-bin optimization with different strategies
 */

import { useState, useEffect, useRef } from 'react'
import { createSvgNest, BinOptimizationStrategy, Presets } from '@svgnest/core'

function App() {
  const [nester, setNester] = useState(null)
  const [strategy, setStrategy] = useState(BinOptimizationStrategy.BALANCED)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState(null)
  const svgContainerRef = useRef(null)

  // Initialize nester
  useEffect(() => {
    const instance = createSvgNest({
      binOptimization: strategy,
      spacing: 2,
      rotations: 4,
      populationSize: 10,
      mutationRate: 10
    })
    setNester(instance)
  }, [strategy])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const text = await file.text()
    if (nester) {
      try {
        const svg = nester.parsesvg(text)
        svgContainerRef.current.innerHTML = ''
        svgContainerRef.current.appendChild(svg)

        // Auto-select first element as bin
        const firstElement = svg.querySelector('polygon, rect, path')
        if (firstElement) {
          nester.setbin(firstElement)
          firstElement.classList.add('selected-bin')
        }
      } catch (error) {
        console.error('Error parsing SVG:', error)
        alert('Error parsing SVG file')
      }
    }
  }

  const handleStart = () => {
    if (!nester || isRunning) return

    setIsRunning(true)
    setProgress(0)

    nester.start(
      // Progress callback
      (percent) => {
        setProgress(percent)
      },
      // Display callback
      (svgList, efficiency, placed, total) => {
        if (svgList && svgList.length > 0) {
          setResults({
            svgList,
            efficiency,
            placed,
            total,
            binCount: svgList.length
          })

          // Update display
          const binsContainer = document.getElementById('bins-output')
          if (binsContainer) {
            binsContainer.innerHTML = ''
            svgList.forEach((svg, index) => {
              const wrapper = document.createElement('div')
              wrapper.className = 'bin-result'
              wrapper.innerHTML = `<h3>Bin ${index + 1}</h3>`
              wrapper.appendChild(svg.cloneNode(true))
              binsContainer.appendChild(wrapper)
            })
          }

          // Update stats
          const currentStats = nester.getStats()
          setStats(currentStats)
        }
      }
    )
  }

  const handleStop = () => {
    if (nester && isRunning) {
      nester.stop()
      setIsRunning(false)
    }
  }

  const handleStrategyChange = (newStrategy) => {
    if (!isRunning) {
      setStrategy(newStrategy)
      setResults(null)
      setStats(null)
    }
  }

  const testAllStrategies = async () => {
    const strategies = [
      BinOptimizationStrategy.MINIMIZE_BINS,
      BinOptimizationStrategy.MINIMIZE_AREA,
      BinOptimizationStrategy.BALANCED
    ]

    const testResults = []

    for (const strat of strategies) {
      handleStrategyChange(strat)
      await new Promise(resolve => setTimeout(resolve, 100))

      // Run for a fixed time
      handleStart()
      await new Promise(resolve => setTimeout(resolve, 5000))
      handleStop()

      if (results) {
        testResults.push({
          strategy: strat,
          ...results,
          fitness: stats?.bestFitness
        })
      }
    }

    // Display comparison
    console.table(testResults)
  }

  return (
    <div className="app">
      <header>
        <h1>SVGnest - Multi-Bin Optimization</h1>
        <p>Upload an SVG file and test different nesting strategies</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label>
            Upload SVG:
            <input
              type="file"
              accept=".svg"
              onChange={handleFileUpload}
              disabled={isRunning}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Optimization Strategy:
            <select
              value={strategy}
              onChange={(e) => handleStrategyChange(e.target.value)}
              disabled={isRunning}
            >
              <option value={BinOptimizationStrategy.MINIMIZE_BINS}>
                Minimize Bins
              </option>
              <option value={BinOptimizationStrategy.MINIMIZE_AREA}>
                Minimize Area
              </option>
              <option value={BinOptimizationStrategy.MINIMIZE_WASTE}>
                Minimize Waste
              </option>
              <option value={BinOptimizationStrategy.BALANCED}>
                Balanced
              </option>
            </select>
          </label>
        </div>

        <div className="control-group buttons">
          <button
            onClick={handleStart}
            disabled={isRunning || !nester}
            className="btn-primary"
          >
            {isRunning ? 'Running...' : 'Start Nesting'}
          </button>

          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="btn-secondary"
          >
            Stop
          </button>

          <button
            onClick={testAllStrategies}
            disabled={isRunning || !nester}
            className="btn-info"
          >
            Test All Strategies
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
          <span className="progress-text">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}

      {results && (
        <div className="results-summary">
          <h2>Results</h2>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-label">Strategy:</span>
              <span className="stat-value">{strategy}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Bins Used:</span>
              <span className="stat-value">{results.binCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Efficiency:</span>
              <span className="stat-value">
                {Math.round(results.efficiency * 100)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Parts Placed:</span>
              <span className="stat-value">
                {results.placed} / {results.total}
              </span>
            </div>
            {stats && (
              <div className="stat">
                <span className="stat-label">Best Fitness:</span>
                <span className="stat-value">
                  {stats.bestFitness.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="workspace">
        <div className="input-section">
          <h3>Input SVG</h3>
          <div ref={svgContainerRef} className="svg-container" />
        </div>

        <div className="output-section">
          <h3>Nesting Results</h3>
          <div id="bins-output" className="bins-container" />
        </div>
      </div>

      <style jsx>{`
        .app {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        header {
          text-align: center;
          margin-bottom: 30px;
        }

        h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .controls {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .control-group {
          margin-bottom: 15px;
        }

        .control-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #495057;
        }

        .control-group input,
        .control-group select {
          width: 100%;
          max-width: 400px;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-info {
          background: #17a2b8;
          color: white;
        }

        .btn-info:hover:not(:disabled) {
          background: #117a8b;
        }

        .progress-bar {
          position: relative;
          height: 30px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #0056b3);
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 600;
          color: #2c3e50;
        }

        .results-summary {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #2c3e50;
        }

        .workspace {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-section,
        .output-section {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .svg-container,
        .bins-container {
          border: 2px dashed #dee2e6;
          border-radius: 4px;
          min-height: 400px;
          padding: 10px;
          overflow: auto;
        }

        .bin-result {
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }

        .bin-result h3 {
          margin-top: 0;
          color: #495057;
        }

        .bin-result svg {
          max-width: 100%;
          height: auto;
        }

        .selected-bin {
          fill: rgba(0, 123, 255, 0.1) !important;
          stroke: #007bff !important;
          stroke-width: 2px !important;
        }

        @media (max-width: 768px) {
          .workspace {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default App
