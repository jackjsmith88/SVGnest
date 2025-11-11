import { useState } from 'react'
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap'
import { FileEarmarkArrowUp, Collection, DashCircle, PlusCircle } from 'react-bootstrap-icons'
import 'bootstrap/dist/css/bootstrap.min.css'

function ShapeManager({ onFileLoad, onDemoLoad }) {
  const [multiplier, setMultiplier] = useState(1)
  const [fileInputKey, setFileInputKey] = useState(Date.now())

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
    <Card 
      bg="dark" 
      text="light"
      style={{
        margin: '20px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
      }}
    >
      <Card.Header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Collection size={20} />
        <strong>Shape Manager</strong>
        <Badge bg="primary" style={{ marginLeft: 'auto' }}>
          {totalShapes} shapes
        </Badge>
      </Card.Header>

      <Card.Body>
        <Row className="g-3">
          {/* Multiplier Control */}
          <Col md={12}>
            <Form.Group>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Form.Label style={{ margin: 0, fontWeight: '600' }}>
                  Shape Copies
                </Form.Label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleMultiplierChange(multiplier - 1)}
                    disabled={multiplier <= 1}
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <DashCircle size={16} />
                  </Button>
                  <Badge 
                    bg="info" 
                    style={{ 
                      fontSize: '16px', 
                      minWidth: '50px',
                      padding: '6px 12px'
                    }}
                  >
                    {multiplier}x
                  </Badge>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleMultiplierChange(multiplier + 1)}
                    disabled={multiplier >= 10}
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <PlusCircle size={16} />
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
              <Form.Label style={{ fontWeight: '600', fontSize: '14px' }}>
                Load Custom SVG
              </Form.Label>
              <div style={{ position: 'relative' }}>
                <Form.Control
                  key={fileInputKey}
                  type="file"
                  accept=".svg"
                  onChange={handleFileChange}
                  style={{
                    background: '#1e293b',
                    border: '2px dashed #475569',
                    color: '#e5e7eb',
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
              variant="primary"
              onClick={handleDemoClick}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px'
              }}
            >
              <FileEarmarkArrowUp size={18} />
              Load Demo ({multiplier}x)
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default ShapeManager
