import { useState } from 'react'
import { Card, Collapse, Button, Badge } from 'react-bootstrap'
import { ChevronDown, ChevronUp, PencilSquare } from 'react-bootstrap-icons'
import ShapeBuilder, { PRESETS } from '../../../utils/ShapeBuilder'
import './CustomShapeBuilder.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const CustomShapeBuilder = ({ onShapesGenerated }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
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
    <Card 
      style={{
        margin: '20px',
        border: '1px solid #ddd',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        background: 'white'
      }}
    >
      <Card.Header style={{
        background: 'linear-gradient(to bottom, white 0%, #f9f9f9 100%)',
        borderBottom: '2px solid #4CAF50',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        color: '#333',
        padding: '10px 15px'
      }}
      onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <PencilSquare size={18} color="#4CAF50" />
        <strong>Custom Shape Builder</strong>
        <Badge bg="warning" text="dark" style={{ marginLeft: 'auto', fontSize: '12px' }}>
          {shapes.length} shapes
        </Badge>
        <Button 
          variant="link" 
          size="sm"
          style={{ 
            color: '#555',
            padding: '0',
            marginLeft: '8px'
          }}
        >
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Button>
      </Card.Header>

      <Collapse in={!isCollapsed}>
        <Card.Body className="custom-shape-builder" style={{ padding: '20px' }}>
          <div className="main-content">
            {/* Left Panel - Bin Config and Preview */}
            <div className="left-panel">
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
        </div>
        
        {/* Right Panel - Shape Definition and List */}
        <div className="right-panel">
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
        </div>
        </Card.Body>
      </Collapse>
    </Card>
  )
}

export default CustomShapeBuilder