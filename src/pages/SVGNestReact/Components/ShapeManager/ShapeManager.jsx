import { useState } from 'react'
import { Card, Form, Button, Row, Col, Badge, Collapse } from 'react-bootstrap'
import { FileEarmarkArrowUp, Collection, DashCircle, PlusCircle, ChevronDown, ChevronUp } from 'react-bootstrap-icons'
import 'bootstrap/dist/css/bootstrap.min.css'

const styles = {
  card: {
    margin: '20px',
    border: '1px solid #ddd',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    background: 'white'
  },
  header: {
    background: 'linear-gradient(to bottom, white 0%, #f9f9f9 100%)',
    borderBottom: '2px solid #4CAF50',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    color: '#333',
    padding: '10px 15px'
  },
  body: {
    padding: '15px'
  },
  button: {
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  multiplierButton: {
    fontSize: '14px',
    padding: '6px 12px',
    borderRadius: '4px'
  }
}

function ShapeManager({ onFileLoad, onDemoLoad }) {
  const [multiplier, setMultiplier] = useState(1)
  const [fileInputKey, setFileInputKey] = useState(Date.now())
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleMultiplierChange = (value) => {
    const newValue = Math.max(1, Math.min(10, value))
    setMultiplier(newValue)
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
    setFileInputKey(Date.now())
  }

  const totalShapes = multiplier * 74

  return (
    <Card style={styles.card}>
      <Card.Header 
        style={styles.header}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Collection size={18} color="#4CAF50" />
        <strong>Shape Manager</strong>
        <Badge bg="success" style={{ marginLeft: 'auto', fontSize: '12px' }}>
          {totalShapes} shapes
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
        <Card.Body style={styles.body}>
          <Row className="g-3">
            {/* Multiplier Control */}
            <Col md={12}>
              <Form.Group>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Form.Label style={{ margin: 0, fontWeight: '600', color: '#555' }}>
                    Shape Copies
                  </Form.Label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleMultiplierChange(multiplier - 1)}
                    disabled={multiplier <= 1}
                    style={styles.multiplierButton}
                  >
                    <DashCircle size={14} />
                  </Button>
                  <Badge 
                    bg="info" 
                    style={{ 
                      fontSize: '14px', 
                      minWidth: '45px',
                      padding: '5px 10px'
                    }}
                  >
                    {multiplier}x
                  </Badge>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleMultiplierChange(multiplier + 1)}
                    disabled={multiplier >= 10}
                    style={styles.multiplierButton}
                  >
                    <PlusCircle size={14} />
                  </Button>
                </div>
              </div>

              <Form.Range
                value={multiplier}
                onChange={(e) => handleMultiplierChange(parseInt(e.target.value))}
                min={1}
                max={10}
                style={{
                  cursor: 'pointer'
                }}
              />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#94a3b8',
                marginTop: '4px'
              }}>
                <span>1x (74 shapes)</span>
                <span>10x (740 shapes)</span>
              </div>
            </Form.Group>
          </Col>

          {/* File Upload */}
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ fontWeight: '600', fontSize: '14px', color: '#555' }}>
                Load Custom SVG
              </Form.Label>
              <div style={{ position: 'relative' }}>
                <Form.Control
                  key={fileInputKey}
                  type="file"
                  accept=".svg"
                  onChange={handleFileChange}
                  style={{
                    background: 'white',
                    border: '2px dashed #ccc',
                    color: '#333',
                    cursor: 'pointer',
                    padding: '10px'
                  }}
                />
              </div>
            </Form.Group>
          </Col>

          {/* Demo Button */}
          <Col md={6}>
            <Form.Label style={{ fontWeight: '600', fontSize: '14px', opacity: 0 }}>
              Action
            </Form.Label>
            <Button
              variant="success"
              onClick={handleDemoClick}
              style={{
                ...styles.button,
                width: '100%'
              }}
            >
              <FileEarmarkArrowUp size={16} />
              Load Demo ({multiplier}x)
            </Button>
          </Col>
        </Row>
        </Card.Body>
      </Collapse>
    </Card>
  )
}

export default ShapeManager
