import { useState } from 'react'
import ShapeBuilder, { PRESETS } from '../../utils/ShapeBuilder'
import './CustomShapeBuilder.css'

const CustomShapeBuilder = ({ onShapesGenerated }) => {
  const [binPreset, setBinPreset] = useState('DEMO')
  const [customBinWidth, setCustomBinWidth] = useState(320)
  const [customBinHeight, setCustomBinHeight] = useState(160)
  const [shapes, setShapes] = useState([])
  
  // Current shape being defined
  const [shapeType, setShapeType] = useState('rectangle')
  const [rectWidth, setRectWidth] = useState(120)
  const [rectHeight, setRectHeight] = useState(60)
  const [lTotalWidth, setLTotalWidth] = useState(100)
  const [lTotalHeight, setLTotalHeight] = useState(100)
  const [lArmWidth, setLArmWidth] = useState(50)
  const [lArmHeight, setLArmHeight] = useState(50)
  const [quantity, setQuantity] = useState(1)
  
  const handleAddShape = () => {
    const preset = binPreset === 'CUSTOM' 
      ? { binWidthCm: customBinWidth, binHeightCm: customBinHeight }
      : PRESETS[binPreset]
    
    const builder = new ShapeBuilder(preset.binWidthCm, preset.binHeightCm)
    
    let newShape
    switch (shapeType) {
      case 'rectangle':
        newShape = builder.createRectangle(rectWidth, rectHeight)
        newShape.description = `Rectangle ${rectWidth}×${rectHeight}cm`
        break
      case 'lshape':
        newShape = builder.createLShape(lTotalWidth, lTotalHeight, lArmWidth, lArmHeight)
        newShape.description = `L-Shape ${lTotalWidth}×${lTotalHeight}cm`
        break
      default:
        return
    }
    
    // Add quantity copies
    const newShapes = []
    for (let i = 0; i < quantity; i++) {
      // Deep copy the shape to avoid reference issues
      const shapeCopy = {
        ...newShape,
        id: `${newShape.type}-${Date.now()}-${i}`,
        points: newShape.points.map(p => ({ ...p })), // Deep copy points
        quantity: i + 1,
        totalQuantity: quantity
      }
      newShapes.push(shapeCopy)
    }
    
    setShapes([...shapes, ...newShapes])
  }
  
  const handleGenerateSVG = () => {
    const preset = binPreset === 'CUSTOM'
      ? { binWidthCm: customBinWidth, binHeightCm: customBinHeight }
      : PRESETS[binPreset]
    
    const builder = new ShapeBuilder(preset.binWidthCm, preset.binHeightCm)
    const svgString = builder.shapesToSVG(shapes)
    
    // Log dimension verification
    console.log('=== DIMENSION VERIFICATION ===')
    console.log(`Bin: ${preset.binWidthCm}×${preset.binHeightCm}cm = ${builder.binWidthPx}×${builder.binHeightPx}px`)
    console.log(`Scale factor: ${builder.pxPerCm.toFixed(3)} px/cm (96 DPI)`)
    console.log('Shapes:')
    shapes.forEach((shape, i) => {
      if (shape.widthCm && shape.heightCm) {
        console.log(`  [${i}] ${shape.description}: ${shape.widthCm}×${shape.heightCm}cm = ${shape.widthPx.toFixed(2)}×${shape.heightPx.toFixed(2)}px`)
      }
    })
    
    // Calculate theoretical fit
    if (shapes.length > 0 && shapes[0].widthCm && shapes[0].heightCm) {
      const shapeWidth = shapes[0].widthPx
      const shapeHeight = shapes[0].heightPx
      const across = Math.floor(builder.binWidthPx / shapeWidth)
      const down = Math.floor(builder.binHeightPx / shapeHeight)
      const theoretical = across * down
      console.log(`\nTheoretical fit (no spacing): ${across} across × ${down} down = ${theoretical} shapes`)
      console.log(`You have: ${shapes.length} shapes`)
      if (shapes.length > theoretical) {
        console.warn(`⚠️ ${shapes.length - theoretical} shapes may not fit! Consider smaller shapes or larger bin.`)
      }
    }
    console.log('=============================')
    
    if (onShapesGenerated) {
      onShapesGenerated(svgString, shapes.length)
    }
  }
  
  const getPreviewSVG = () => {
    if (shapes.length === 0) return null
    
    const preset = binPreset === 'CUSTOM'
      ? { binWidthCm: customBinWidth, binHeightCm: customBinHeight }
      : PRESETS[binPreset]
    
    const builder = new ShapeBuilder(preset.binWidthCm, preset.binHeightCm)
    return builder.shapesToSVG(shapes)
  }
  
  const handleClearShapes = () => {
    setShapes([])
  }
  
  const handleRemoveShape = (index) => {
    setShapes(shapes.filter((_, i) => i !== index))
  }
  
  return (
    <div className="custom-shape-builder">
      <h3>Custom Shape Builder</h3>
      
      {/* Bin Configuration */}
      <div className="section">
        <h4>Bin Configuration</h4>
        <div className="form-group">
          <label>Bin Preset:</label>
          <select value={binPreset} onChange={(e) => setBinPreset(e.target.value)}>
            {Object.entries(PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>{preset.name}</option>
            ))}
            <option value="CUSTOM">Custom Size</option>
          </select>
        </div>
        
        {binPreset === 'CUSTOM' && (
          <div className="form-row">
            <div className="form-group">
              <label>Width (cm):</label>
              <input 
                type="number" 
                value={customBinWidth} 
                onChange={(e) => setCustomBinWidth(parseFloat(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Height (cm):</label>
              <input 
                type="number" 
                value={customBinHeight} 
                onChange={(e) => setCustomBinHeight(parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Shape Definition */}
      <div className="section">
        <h4>Add Shapes</h4>
        <div className="form-group">
          <label>Shape Type:</label>
          <select value={shapeType} onChange={(e) => setShapeType(e.target.value)}>
            <option value="rectangle">Rectangle</option>
            <option value="lshape">L-Shape</option>
          </select>
        </div>
        
        {shapeType === 'rectangle' && (
          <div className="form-row">
            <div className="form-group">
              <label>Width (cm):</label>
              <input 
                type="number" 
                value={rectWidth} 
                onChange={(e) => setRectWidth(parseFloat(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Height (cm):</label>
              <input 
                type="number" 
                value={rectHeight} 
                onChange={(e) => setRectHeight(parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
        
        {shapeType === 'lshape' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Total Width (cm):</label>
                <input 
                  type="number" 
                  value={lTotalWidth} 
                  onChange={(e) => setLTotalWidth(parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Total Height (cm):</label>
                <input 
                  type="number" 
                  value={lTotalHeight} 
                  onChange={(e) => setLTotalHeight(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Arm Width (cm):</label>
                <input 
                  type="number" 
                  value={lArmWidth} 
                  onChange={(e) => setLArmWidth(parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Arm Height (cm):</label>
                <input 
                  type="number" 
                  value={lArmHeight} 
                  onChange={(e) => setLArmHeight(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </>
        )}
        
        <div className="form-group">
          <label>Quantity:</label>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
        
        <button onClick={handleAddShape} className="btn-add">
          Add Shape ({quantity}x)
        </button>
      </div>
      
      {/* Shapes List */}
      <div className="section">
        <h4>Shapes List ({shapes.length} total)</h4>
        <div className="shapes-list">
          {shapes.length === 0 ? (
            <p className="empty-message">No shapes added yet</p>
          ) : (
            shapes.map((shape, index) => (
              <div key={index} className="shape-item">
                <span>{shape.description}</span>
                <button onClick={() => handleRemoveShape(index)} className="btn-remove">×</button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Preview */}
      {shapes.length > 0 && (
        <div className="section">
          <h4>Preview</h4>
          <div 
            className="preview-container"
            dangerouslySetInnerHTML={{ __html: getPreviewSVG() }}
          />
        </div>
      )}
      
      {/* Actions */}
      <div className="section actions">
        <button 
          onClick={handleGenerateSVG} 
          className="btn-generate"
          disabled={shapes.length === 0}
        >
          Generate & Load SVG
        </button>
        <button 
          onClick={handleClearShapes} 
          className="btn-clear"
          disabled={shapes.length === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  )
}

export default CustomShapeBuilder
