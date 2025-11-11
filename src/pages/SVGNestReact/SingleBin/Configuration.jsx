import { useEffect, useRef } from 'react'
import { Form, Button, Card, OverlayTrigger, Tooltip } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

// Unified styles for light theme
const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  card: {
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid #ddd'
  },
  header: {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderBottom: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#6c757d',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  input: {
    background: 'white',
    border: '1px solid #ced4da',
    color: '#333'
  },
  footer: {
    background: '#f8f9fa',
    borderTop: '1px solid #dee2e6',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  }
}

function Configuration({ visible, onSave, onClose }) {
  const configRef = useRef(null)

  // Load saved config from localStorage when visible
  useEffect(() => {
    if (!visible || !configRef.current) return

    const savedConfig = localStorage.getItem('svgnest-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        const inputs = configRef.current.querySelectorAll('input')
        
        inputs.forEach(input => {
          const key = input.getAttribute('data-config')
          if (key && config[key] !== undefined) {
            if (input.type === 'checkbox') {
              input.checked = config[key]
            } else {
              input.value = config[key]
            }
          }
        })
        
        console.log('Loaded config from localStorage:', config)
      } catch (e) {
        console.error('Failed to load config:', e)
      }
    }
  }, [visible])

  if (!visible) return null

  const tooltipInfo = (text) => <Tooltip>{text}</Tooltip>

  const handleBackdropClick = (e) => {
    // Close if clicking the backdrop (not the card)
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <div 
      onClick={handleBackdropClick}
      style={styles.backdrop}
    >
      <Card style={styles.card}>
        <Card.Header style={styles.header}>
          <h4 className="mb-0" style={{ color: '#333' }}>SVGnest Configuration</h4>
          {onClose && (
            <button
              onClick={onClose}
              style={styles.closeButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(108, 117, 125, 0.1)'
                e.currentTarget.style.color = '#212529'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = '#6c757d'
              }}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </Card.Header>
        
        <Card.Body style={{ background: '#f9f9f9' }}>
          <Form>
            {/* Spacing */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                Space between parts
                <OverlayTrigger placement="right" overlay={tooltipInfo("The space between parts in SVG units")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control 
                type="text" 
                defaultValue="0" 
                data-config="spacing"
                style={styles.input}
              />
            </Form.Group>

            {/* Curve Tolerance */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                Curve tolerance
                <OverlayTrigger placement="right" overlay={tooltipInfo("The maximum error allowed when converting Beziers and arcs to line segments")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control 
                type="text" 
                defaultValue="0.3" 
                data-config="curveTolerance"
                style={styles.input}
              />
            </Form.Group>

            {/* Clipper Scale */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                Clipper scale
                <OverlayTrigger placement="right" overlay={tooltipInfo("Internal precision multiplier used by the Clipper geometry engine")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control 
                type="text" 
                defaultValue="100000000" 
                data-config="clipperScale"
                style={styles.input}
              />
            </Form.Group>

            {/* Part Rotations */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                Part rotations
                <OverlayTrigger placement="right" overlay={tooltipInfo("Number of rotations to consider when inserting a part")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control 
                type="text" 
                defaultValue="4" 
                data-config="rotations"
                style={styles.input}
              />
            </Form.Group>

            {/* GA Population */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                GA population
                <OverlayTrigger placement="right" overlay={tooltipInfo("The number of solutions in the Genetic Algorithm population")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control 
                type="text" 
                defaultValue="10" 
                data-config="populationSize"
                style={styles.input}
              />
            </Form.Group>

            {/* GA Mutation Rate */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                GA mutation rate
                <OverlayTrigger placement="right" overlay={tooltipInfo("Mutation rate (in percent) at each generation of the Genetic Algorithm")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control 
                type="text" 
                defaultValue="10" 
                data-config="mutationRate"
                style={styles.input}
              />
            </Form.Group>

            <hr style={{ borderColor: '#475569', margin: '20px 0' }} />

            {/* Part in Part */}
            <Form.Group className="mb-3">
              <div className="d-flex align-items-center gap-2">
                <Form.Check 
                  type="checkbox" 
                  data-config="useHoles"
                  id="useHoles"
                  label="Part in Part"
                  style={{ color: '#e5e7eb' }}
                />
                <OverlayTrigger placement="right" overlay={tooltipInfo("Place parts in the holes of other parts")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </div>
            </Form.Group>

            {/* Explore Concave */}
            <Form.Group className="mb-3">
              <div className="d-flex align-items-center gap-2">
                <Form.Check 
                  type="checkbox" 
                  data-config="exploreConcave"
                  id="exploreConcave"
                  label="Explore concave areas"
                  style={{ color: '#e5e7eb' }}
                />
                <OverlayTrigger placement="right" overlay={tooltipInfo("Try to solve for enclosed concave areas")}>
                  <span style={{ 
                    cursor: 'help', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>ⓘ</span>
                </OverlayTrigger>
              </div>
            </Form.Group>
          </Form>
        </Card.Body>

        <Card.Footer style={styles.footer}>
          {onClose && (
            <Button 
              variant="outline-secondary" 
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={onSave}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              fontWeight: '600'
            }}
          >
            Save Settings
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}

export default Configuration
