import { useState } from 'react'
import './ShapeControls.css'

export const ShapeControls = ({ onShapeMultiplierChange, onFileLoad, onDemoLoad }) => {
  const [multiplier, setMultiplier] = useState(1)
  const [fileInputKey, setFileInputKey] = useState(Date.now())

  const handleMultiplierChange = (e) => {
    const value = parseInt(e.target.value) || 1
    setMultiplier(value)
    if (onShapeMultiplierChange) {
      onShapeMultiplierChange(value)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && onFileLoad) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onFileLoad(event.target.result, multiplier)
      }
      reader.readAsText(file)
    }
  }

  const handleDemoClick = () => {
    if (onDemoLoad) {
      onDemoLoad(multiplier)
    }
    // Reset file input
    setFileInputKey(Date.now())
  }

  return (
    <div className="shape-controls">
      <div className="control-group">
        <label htmlFor="multiplier">
          Shape Copies:
          <span className="multiplier-value">{multiplier}x</span>
        </label>
        <input
          id="multiplier"
          type="range"
          min="1"
          max="10"
          value={multiplier}
          onChange={handleMultiplierChange}
          className="multiplier-slider"
        />
        <div className="multiplier-labels">
          <span>1x (74 shapes)</span>
          <span>{multiplier * 74} shapes</span>
          <span>10x (740 shapes)</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="svgFile">Load Custom SVG:</label>
        <input
          key={fileInputKey}
          id="svgFile"
          type="file"
          accept=".svg"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      <div className="control-group">
        <button onClick={handleDemoClick} className="demo-button">
          Load Demo Shapes ({multiplier}x)
        </button>
      </div>
    </div>
  )
}
