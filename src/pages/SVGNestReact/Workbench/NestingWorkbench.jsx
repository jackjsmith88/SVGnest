import { useState } from 'react'
import { Card, Row, Col, Button, Form, Table, Badge, Alert } from 'react-bootstrap'
import { 
  Plus, Trash, PlayFill, ArrowCounterclockwise, 
  Save, Folder2Open, Rulers, Box 
} from 'react-bootstrap-icons'
import ShapeBuilder, { PRESETS } from '../../../utils/ShapeBuilder'
import 'bootstrap/dist/css/bootstrap.min.css'
import './NestingWorkbench.css'

/**
 * NestingWorkbench - Advanced component for creating custom test scenarios
 * 
 * Features:
 * - Define custom bin sizes in real-world units (mm/cm)
 * - Add multiple shapes with precise dimensions
 * - Configure nesting parameters
 * - Save/load test cases
 * - Understand real-world to SVG pixel conversion
 */

const UNIT_OPTIONS = {
  MM: { label: 'mm', toCm: (val) => val / 10, fromCm: (val) => val * 10 },
  CM: { label: 'cm', toCm: (val) => val, fromCm: (val) => val },
  INCH: { label: 'inch', toCm: (val) => val * 2.54, fromCm: (val) => val / 2.54 }
}

const SHAPE_TYPES = {
  RECTANGLE: 'rectangle',
  L_SHAPE: 'lshape',
  T_SHAPE: 'tshape',
  CIRCLE: 'circle'
}

const BIN_PRESETS = {
  CUSTOM: { name: 'Custom', width: 0, height: 0 },
  SHEET_3200x1600: { name: 'Sheet Metal 3200×1600mm', width: 3200, height: 1600, unit: 'MM' },
  SHEET_2440x1220: { name: 'Plywood 8\'×4\' (2440×1220mm)', width: 2440, height: 1220, unit: 'MM' },
  SHEET_2000x1000: { name: 'Sheet 2000×1000mm', width: 2000, height: 1000, unit: 'MM' },
  FABRIC_1500x1000: { name: 'Fabric Roll 1500×1000mm', width: 1500, height: 1000, unit: 'MM' },
  A0_PAPER: { name: 'A0 Paper (1189×841mm)', width: 1189, height: 841, unit: 'MM' }
}

function NestingWorkbench({ onShapesGenerated }) {
  // Unit system
  const [unit, setUnit] = useState('MM')
  
  // Bin configuration
  const [binPreset, setBinPreset] = useState('SHEET_3200x1600')
  const [binWidth, setBinWidth] = useState(3200)
  const [binHeight, setBinHeight] = useState(1600)
  
  // Shape being edited
  const [shapeType, setShapeType] = useState(SHAPE_TYPES.L_SHAPE)
  const [shapeWidth, setShapeWidth] = useState(800)
  const [shapeHeight, setShapeHeight] = useState(800)
  const [armWidth, setArmWidth] = useState(400)
  const [armHeight, setArmHeight] = useState(400)
  const [radius, setRadius] = useState(200)
  const [quantity, setQuantity] = useState(4)
  
  // List of shapes to nest
  const [shapes, setShapes] = useState([])
  
  // Conversion info
  const [showConversionInfo, setShowConversionInfo] = useState(true)

  const unitConverter = UNIT_OPTIONS[unit]
  const PX_PER_CM = 96 / 2.54 // SVG standard: 96 DPI

  // Add shape to list
  const handleAddShape = () => {
    const newShape = {
      id: Date.now(),
      type: shapeType,
      unit,
      quantity,
      // Store values in current unit
      dimensions: {}
    }

    switch (shapeType) {
      case SHAPE_TYPES.RECTANGLE:
        newShape.dimensions = { width: shapeWidth, height: shapeHeight }
        break
      case SHAPE_TYPES.L_SHAPE:
        newShape.dimensions = { 
          totalWidth: shapeWidth, 
          totalHeight: shapeHeight,
          armWidth,
          armHeight 
        }
        break
      case SHAPE_TYPES.T_SHAPE:
        newShape.dimensions = { 
          topWidth: shapeWidth, 
          topHeight: shapeHeight,
          stemWidth: armWidth,
          stemHeight: armHeight 
        }
        break
      case SHAPE_TYPES.CIRCLE:
        newShape.dimensions = { radius }
        break
    }

    setShapes([...shapes, newShape])
  }

  // Remove shape from list
  const handleRemoveShape = (id) => {
    setShapes(shapes.filter(s => s.id !== id))
  }

  // Clear all shapes
  const handleClear = () => {
    setShapes([])
  }

  // Load bin preset
  const handleBinPresetChange = (presetKey) => {
    setBinPreset(presetKey)
    if (presetKey !== 'CUSTOM') {
      const preset = BIN_PRESETS[presetKey]
      setBinWidth(preset.width)
      setBinHeight(preset.height)
      if (preset.unit) {
        setUnit(preset.unit)
      }
    }
  }

  // Generate SVG from current configuration
  const handleGenerate = () => {
    if (shapes.length === 0) {
      alert('Please add at least one shape')
      return
    }

    if (binWidth <= 0 || binHeight <= 0) {
      alert('Please set valid bin dimensions')
      return
    }

    // Convert bin dimensions to cm
    const binWidthCm = unitConverter.toCm(binWidth)
    const binHeightCm = unitConverter.toCm(binHeight)

    console.log('=== NESTING WORKBENCH: GENERATING SVG ===')
    console.log(`Bin: ${binWidth}${unit} × ${binHeight}${unit} = ${binWidthCm}cm × ${binHeightCm}cm`)
    
    const builder = new ShapeBuilder(binWidthCm, binHeightCm)
    const shapeObjects = []

    shapes.forEach((shape) => {
      const converter = UNIT_OPTIONS[shape.unit]
      
      for (let i = 0; i < shape.quantity; i++) {
        let shapeObj

        switch (shape.type) {
          case SHAPE_TYPES.RECTANGLE:
            shapeObj = builder.createRectangle(
              converter.toCm(shape.dimensions.width),
              converter.toCm(shape.dimensions.height),
              `rect-${shape.id}-${i}`
            )
            break
          
          case SHAPE_TYPES.L_SHAPE:
            shapeObj = builder.createLShape(
              converter.toCm(shape.dimensions.totalWidth),
              converter.toCm(shape.dimensions.totalHeight),
              converter.toCm(shape.dimensions.armWidth),
              converter.toCm(shape.dimensions.armHeight),
              `lshape-${shape.id}-${i}`
            )
            break
          
          case SHAPE_TYPES.T_SHAPE:
            shapeObj = builder.createTShape(
              converter.toCm(shape.dimensions.topWidth),
              converter.toCm(shape.dimensions.topHeight),
              converter.toCm(shape.dimensions.stemWidth),
              converter.toCm(shape.dimensions.stemHeight),
              `tshape-${shape.id}-${i}`
            )
            break
          
          case SHAPE_TYPES.CIRCLE:
            shapeObj = builder.createCircle(
              converter.toCm(shape.dimensions.radius),
              32,
              `circle-${shape.id}-${i}`
            )
            break
        }

        if (shapeObj) {
          shapeObjects.push(shapeObj)
        }
      }
    })

    const svgString = builder.shapesToSVG(shapeObjects)
    
    console.log(`Generated ${shapeObjects.length} shapes`)
    console.log('SVG dimensions:', `${builder.binWidthPx}px × ${builder.binHeightPx}px`)
    console.log('=== END GENERATION ===')

    onShapesGenerated(svgString)
  }

  // Save configuration
  const handleSave = () => {
    const config = {
      name: prompt('Enter configuration name:', 'My Test Case'),
      timestamp: new Date().toISOString(),
      bin: { width: binWidth, height: binHeight, unit, preset: binPreset },
      shapes: shapes
    }

    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nesting-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Load configuration
  const handleLoad = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result)
        setBinWidth(config.bin.width)
        setBinHeight(config.bin.height)
        setUnit(config.bin.unit)
        setBinPreset(config.bin.preset || 'CUSTOM')
        setShapes(config.shapes)
        alert(`Loaded: ${config.name}`)
      } catch (err) {
        alert('Error loading configuration: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const formatDimensions = (shape) => {
    const converter = UNIT_OPTIONS[shape.unit]
    switch (shape.type) {
      case SHAPE_TYPES.RECTANGLE:
        return `${shape.dimensions.width}×${shape.dimensions.height}${shape.unit}`
      case SHAPE_TYPES.L_SHAPE:
        return `${shape.dimensions.totalWidth}×${shape.dimensions.totalHeight}${shape.unit} (arm: ${shape.dimensions.armWidth}×${shape.dimensions.armHeight})`
      case SHAPE_TYPES.T_SHAPE:
        return `Top: ${shape.dimensions.topWidth}×${shape.dimensions.topHeight}${shape.unit}, Stem: ${shape.dimensions.stemWidth}×${shape.dimensions.stemHeight}`
      case SHAPE_TYPES.CIRCLE:
        return `r=${shape.dimensions.radius}${shape.unit}`
      default:
        return 'Unknown'
    }
  }

  const calculateTotalShapes = () => {
    return shapes.reduce((sum, shape) => sum + shape.quantity, 0)
  }

  const binWidthCm = unitConverter.toCm(binWidth)
  const binHeightCm = unitConverter.toCm(binHeight)
  const binWidthPx = binWidthCm * PX_PER_CM
  const binHeightPx = binHeightCm * PX_PER_CM

  return (
    <div className="nesting-workbench">
      <Card className="mb-3">
        <Card.Header className="bg-primary text-white d-flex align-items-center gap-2">
          <Rulers size={20} />
          <strong>Nesting Workbench</strong>
          <Badge bg="light" text="dark" className="ms-auto">
            {calculateTotalShapes()} shapes
          </Badge>
        </Card.Header>
        <Card.Body>
          {/* Conversion Info */}
          {showConversionInfo && (
            <Alert variant="info" dismissible onClose={() => setShowConversionInfo(false)}>
              <Alert.Heading className="h6">📐 How Real-World Measurements Work in SVGnest</Alert.Heading>
              <small>
                <strong>SVGnest uses SVG pixels internally.</strong> This workbench converts your real measurements:
                <ul className="mb-1 mt-2">
                  <li><strong>Standard: 96 DPI</strong> (1 inch = 96px, 1cm = 37.795px)</li>
                  <li>Your bin: <strong>{binWidth}×{binHeight}{unit}</strong> = {binWidthCm.toFixed(1)}×{binHeightCm.toFixed(1)}cm = <Badge bg="secondary">{Math.round(binWidthPx)}×{Math.round(binHeightPx)}px</Badge></li>
                  <li>The algorithm calculates in pixels, but dimensions are preserved</li>
                </ul>
              </small>
            </Alert>
          )}

          <Row>
            {/* Bin Configuration */}
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-success text-white d-flex align-items-center gap-2">
                  <Box size={16} />
                  <strong>Bin Configuration</strong>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Preset</Form.Label>
                    <Form.Select 
                      value={binPreset}
                      onChange={(e) => handleBinPresetChange(e.target.value)}
                    >
                      {Object.entries(BIN_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Unit</Form.Label>
                    <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                      {Object.entries(UNIT_OPTIONS).map(([key, opt]) => (
                        <option key={key} value={key}>{opt.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Width ({unit})</Form.Label>
                        <Form.Control
                          type="number"
                          value={binWidth}
                          onChange={(e) => {
                            setBinWidth(parseFloat(e.target.value) || 0)
                            setBinPreset('CUSTOM')
                          }}
                          min={0}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Height ({unit})</Form.Label>
                        <Form.Control
                          type="number"
                          value={binHeight}
                          onChange={(e) => {
                            setBinHeight(parseFloat(e.target.value) || 0)
                            setBinPreset('CUSTOM')
                          }}
                          min={0}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <small className="text-muted">
                    SVG size: {Math.round(binWidthPx)} × {Math.round(binHeightPx)} pixels
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Shape Builder */}
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-info text-white">
                  <strong>Add Shapes</strong>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Shape Type</Form.Label>
                    <Form.Select 
                      value={shapeType}
                      onChange={(e) => setShapeType(e.target.value)}
                    >
                      <option value={SHAPE_TYPES.RECTANGLE}>Rectangle</option>
                      <option value={SHAPE_TYPES.L_SHAPE}>L-Shape</option>
                      <option value={SHAPE_TYPES.T_SHAPE}>T-Shape</option>
                      <option value={SHAPE_TYPES.CIRCLE}>Circle</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Rectangle */}
                  {shapeType === SHAPE_TYPES.RECTANGLE && (
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Width ({unit})</Form.Label>
                          <Form.Control
                            type="number"
                            value={shapeWidth}
                            onChange={(e) => setShapeWidth(parseFloat(e.target.value) || 0)}
                            min={0}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Height ({unit})</Form.Label>
                          <Form.Control
                            type="number"
                            value={shapeHeight}
                            onChange={(e) => setShapeHeight(parseFloat(e.target.value) || 0)}
                            min={0}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {/* L-Shape */}
                  {shapeType === SHAPE_TYPES.L_SHAPE && (
                    <>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Total Width ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={shapeWidth}
                              onChange={(e) => setShapeWidth(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Total Height ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={shapeHeight}
                              onChange={(e) => setShapeHeight(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Arm Width ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={armWidth}
                              onChange={(e) => setArmWidth(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Arm Height ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={armHeight}
                              onChange={(e) => setArmHeight(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}

                  {/* T-Shape */}
                  {shapeType === SHAPE_TYPES.T_SHAPE && (
                    <>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Top Width ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={shapeWidth}
                              onChange={(e) => setShapeWidth(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Top Height ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={shapeHeight}
                              onChange={(e) => setShapeHeight(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Stem Width ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={armWidth}
                              onChange={(e) => setArmWidth(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Stem Height ({unit})</Form.Label>
                            <Form.Control
                              type="number"
                              value={armHeight}
                              onChange={(e) => setArmHeight(parseFloat(e.target.value) || 0)}
                              min={0}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}

                  {/* Circle */}
                  {shapeType === SHAPE_TYPES.CIRCLE && (
                    <Form.Group className="mb-3">
                      <Form.Label>Radius ({unit})</Form.Label>
                      <Form.Control
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(parseFloat(e.target.value) || 0)}
                        min={0}
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min={1}
                      max={100}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    onClick={handleAddShape}
                    className="w-100"
                  >
                    <Plus size={16} className="me-1" />
                    Add to List
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Shape List */}
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Shapes to Nest ({calculateTotalShapes()} total)</strong>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleClear}
                disabled={shapes.length === 0}
              >
                <ArrowCounterclockwise size={14} className="me-1" />
                Clear All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {shapes.length === 0 ? (
                <div className="text-center text-muted p-4">
                  No shapes added yet. Configure a shape above and click "Add to List".
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Dimensions</th>
                      <th>Qty</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shapes.map((shape, idx) => (
                      <tr key={shape.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <Badge bg="secondary">{shape.type}</Badge>
                        </td>
                        <td className="font-monospace small">
                          {formatDimensions(shape)}
                        </td>
                        <td>
                          <Badge bg="info">{shape.quantity}</Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveShape(shape.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Actions */}
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-secondary" onClick={handleSave}>
              <Save size={16} className="me-1" />
              Save Config
            </Button>
            <Button variant="outline-secondary" as="label">
              <Folder2Open size={16} className="me-1" />
              Load Config
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleLoad}
              />
            </Button>
            <Button 
              variant="success" 
              size="lg"
              onClick={handleGenerate}
              disabled={shapes.length === 0}
            >
              <PlayFill size={20} className="me-1" />
              Generate & Start Nesting
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default NestingWorkbench
