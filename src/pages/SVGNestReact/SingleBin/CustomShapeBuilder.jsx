import { useState } from 'react'
import { Card, Collapse, Button, Badge } from 'react-bootstrap'
import { ChevronDown, ChevronUp, PencilSquare } from 'react-bootstrap-icons'
import ShapeBuilder, { PRESETS } from '../../../utils/ShapeBuilder'
import './CustomShapeBuilder.css'
import 'bootstrap/dist/css/bootstrap.min.css'

// Test presets for quick shape generation
const SHAPE_PRESETS = {
  LSHAPE_4X: {
    name: '4× L-Shapes (80×80cm)',
    bin: 'SHEET_320x160',
    shapes: [
      { type: 'lshape', totalWidth: 80, totalHeight: 80, armWidth: 40, armHeight: 40, quantity: 4 }
    ]
  },
  LSHAPE_6X: {
    name: '6× L-Shapes (80×80cm)',
    bin: 'SHEET_320x160',
    shapes: [
      { type: 'lshape', totalWidth: 80, totalHeight: 80, armWidth: 40, armHeight: 40, quantity: 6 }
    ]
  },
  LSHAPE_8X: {
    name: '8× L-Shapes (80×80cm)',
    bin: 'SHEET_320x160',
    shapes: [
      { type: 'lshape', totalWidth: 80, totalHeight: 80, armWidth: 40, armHeight: 40, quantity: 8 }
    ]
  },
  RECT_MIXED: {
    name: 'Mixed Rectangles',
    bin: 'DEMO',
    shapes: [
      { type: 'rectangle', width: 120, height: 60, quantity: 3 },
      { type: 'rectangle', width: 80, height: 50, quantity: 2 },
      { type: 'rectangle', width: 100, height: 40, quantity: 2 }
    ]
  },
  LSHAPE_SMALL: {
    name: '3× Small L-Shapes (Demo)',
    bin: 'DEMO',
    shapes: [
      { type: 'lshape', totalWidth: 15, totalHeight: 15, armWidth: 8, armHeight: 8, quantity: 3 }
    ]
  },
  LSHAPE_VARIETY: {
    name: 'L-Shapes Variety',
    bin: 'SHEET_320x160',
    shapes: [
      { type: 'lshape', totalWidth: 80, totalHeight: 80, armWidth: 40, armHeight: 40, quantity: 2 },
      { type: 'lshape', totalWidth: 60, totalHeight: 60, armWidth: 30, armHeight: 30, quantity: 2 },
      { type: 'lshape', totalWidth: 100, totalHeight: 100, armWidth: 50, armHeight: 50, quantity: 2 }
    ]
  }
}

const CustomShapeBuilder = ({ onShapesGenerated }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [binPreset, setBinPreset] = useState('DEMO')
  const [customBinWidth, setCustomBinWidth] = useState(320)
  const [customBinHeight, setCustomBinHeight] = useState(160)
  const [shapes, setShapes] = useState([])
  const [selectedPreset, setSelectedPreset] = useState('')
  
  // Current shape being defined
  const [shapeType, setShapeType] = useState('rectangle')
  const [rectWidth, setRectWidth] = useState(120)
  const [rectHeight, setRectHeight] = useState(60)
  const [lTotalWidth, setLTotalWidth] = useState(100)
  const [lTotalHeight, setLTotalHeight] = useState(100)
  const [lArmWidth, setLArmWidth] = useState(50)
  const [lArmHeight, setLArmHeight] = useState(50)
  const [quantity, setQuantity] = useState(1)
  
  const handleLoadPreset = (presetKey) => {
    if (!presetKey) return
    
    const preset = SHAPE_PRESETS[presetKey]
    if (!preset) return
    
    // Set bin
    setBinPreset(preset.bin)
    
    // Generate shapes from preset
    const presetBin = PRESETS[preset.bin]
    const builder = new ShapeBuilder(presetBin.binWidthCm, presetBin.binHeightCm)
    
    const newShapes = []
    preset.shapes.forEach((shapeConfig, shapeIndex) => {
      for (let i = 0; i < shapeConfig.quantity; i++) {
        let shape
        if (shapeConfig.type === 'rectangle') {
          shape = builder.createRectangle(shapeConfig.width, shapeConfig.height)
          shape.description = `Rectangle ${shapeConfig.width}×${shapeConfig.height}cm`
        } else if (shapeConfig.type === 'lshape') {
          shape = builder.createLShape(
            shapeConfig.totalWidth, 
            shapeConfig.totalHeight, 
            shapeConfig.armWidth, 
            shapeConfig.armHeight
          )
          shape.description = `L-Shape ${shapeConfig.totalWidth}×${shapeConfig.totalHeight}cm`
        }
        
        if (shape) {
          shape.id = `${shape.type}-${Date.now()}-${shapeIndex}-${i}`
          shape.quantity = i + 1
          shape.totalQuantity = shapeConfig.quantity
          newShapes.push(shape)
        }
      }
    })
    
    setShapes(newShapes)
    setSelectedPreset('')
    
    console.log(`Loaded preset: ${preset.name} - ${newShapes.length} shapes`)
  }
  
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
    
    // Helper to calculate polygon area using shoelace formula
    const calculatePolygonArea = (points) => {
      let area = 0
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length
        area += points[i].x * points[j].y
        area -= points[j].x * points[i].y
      }
      return Math.abs(area / 2)
    }
    
    console.log('\n========================================')
    console.log('🎨 CUSTOM SHAPE BUILDER - GENERATING SVG')
    console.log('========================================')
    
    // Log bin configuration
    console.log('\n📦 BIN CONFIGURATION:')
    console.log(`  Preset: ${PRESETS[binPreset]?.name || 'Custom'}`)
    console.log(`  Dimensions: ${preset.binWidthCm}×${preset.binHeightCm}cm = ${builder.binWidthPx}×${builder.binHeightPx}px`)
    console.log(`  Scale factor: ${builder.pxPerCm.toFixed(3)} px/cm (96 DPI)`)
    console.log(`  Bin area: ${(builder.binWidthPx * builder.binHeightPx).toFixed(2)} px²`)
    
    // Log shapes details
    console.log('\n🔷 SHAPES CREATED:')
    console.log(`  Total shapes: ${shapes.length}`)
    
    if (shapes.length > 0) {
      let totalArea = 0
      
      shapes.forEach((shape, i) => {
        // Calculate actual area using shoelace formula instead of bounding box
        const actualArea = calculatePolygonArea(shape.points)
        totalArea += actualArea
        
        if (i < 5) { // Show first 5
          console.log(`  [${i}] ${shape.description}:`)
          console.log(`    Type: ${shape.type}`)
          console.log(`    Points: ${shape.points.length}`)
          console.log(`    Bounding box: ${shape.widthPx?.toFixed(2) || 'N/A'}×${shape.heightPx?.toFixed(2) || 'N/A'}px`)
          console.log(`    Actual area: ${actualArea.toFixed(2)} px² (using shoelace formula)`)
          if (shape.type === 'lshape') {
            const boundingBoxArea = (shape.widthPx || 0) * (shape.heightPx || 0)
            const efficiency = ((actualArea / boundingBoxArea) * 100).toFixed(1)
            console.log(`    L-Shape specs: Total ${shape.totalWidthCm}×${shape.totalHeightCm}cm, Arm ${shape.armWidthCm}×${shape.armHeightCm}cm`)
            console.log(`    Shape efficiency: ${efficiency}% of bounding box (actual vs bbox area)`)
            console.log(`    First 3 points:`, shape.points.slice(0, 3).map(p => `(${p.x.toFixed(1)},${p.y.toFixed(1)})`).join(', '))
          }
        }
      })
      
      if (shapes.length > 5) {
        console.log(`  ... and ${shapes.length - 5} more shapes`)
      }
      
      console.log(`\n  Total shapes area: ${totalArea.toFixed(2)} px² (actual polygon area)`)
      console.log(`  Bin area: ${(builder.binWidthPx * builder.binHeightPx).toFixed(2)} px²`)
      const utilizationPercent = (totalArea / (builder.binWidthPx * builder.binHeightPx) * 100).toFixed(1)
      console.log(`  Theoretical max utilization: ${utilizationPercent}% (if perfectly packed)`)
      
      if (totalArea > builder.binWidthPx * builder.binHeightPx) {
        console.warn(`  ⚠️ WARNING: Total shape area exceeds bin area! Shapes won't all fit.`)
      }
    }
    
    // Check for potential issues
    const hasInvalidDimensions = shapes.some(s => !s.widthPx || !s.heightPx || s.widthPx <= 0 || s.heightPx <= 0)
    if (hasInvalidDimensions) {
      console.error('  ❌ ERROR: Some shapes have invalid dimensions! This will cause nesting problems.')
    }
    
    const hasNaN = shapes.some(s => s.points.some(p => isNaN(p.x) || isNaN(p.y)))
    if (hasNaN) {
      console.error('  ❌ ERROR: Some shapes have NaN coordinates! Check shape generation.')
    }
    
    console.log('\n📄 SVG PREVIEW (first 500 chars):')
    console.log(svgString.substring(0, 500) + '...')
    console.log('========================================\n')
    
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
          
          {/* Quick Presets Section */}
          <div className="section" style={{ 
            background: '#f0f9ff', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <h4 style={{ color: '#0369a1', marginBottom: '10px' }}>Quick Test Presets</h4>
            <div className="form-group">
              <label style={{ color: '#0c4a6e' }}>Load preset configuration:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={selectedPreset} 
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">-- Select a preset --</option>
                  {Object.entries(SHAPE_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.name}</option>
                  ))}
                </select>
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => handleLoadPreset(selectedPreset)}
                  disabled={!selectedPreset}
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    border: 'none',
                    padding: '6px 16px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Load
                </Button>
              </div>
              <small style={{ color: '#64748b', display: 'block', marginTop: '5px' }}>
                Quickly load common test scenarios (replaces current shapes)
              </small>
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