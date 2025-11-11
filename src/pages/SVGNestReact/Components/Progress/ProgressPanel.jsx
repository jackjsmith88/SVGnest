import { Card, ProgressBar, Badge, Row, Col } from 'react-bootstrap'
import { ClockHistory, Layers, Grid3x3Gap,Percent } from 'react-bootstrap-icons'
import 'bootstrap/dist/css/bootstrap.min.css'

function ProgressPanel({ iterations }) {
  return (
    <div style={{
      position: 'fixed',
      right: '20px',
      top: '80px',
      width: '320px',
      zIndex: 999
    }}>
      <Card 
        bg="dark" 
        text="light"
        style={{
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          display: 'none'
        }}
        id="progress-panel"
      >
        <Card.Header style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ClockHistory size={20} />
          <strong>Nesting Progress</strong>
        </Card.Header>

        <Card.Body>
          {/* Time Remaining */}
          <div 
            id="info_time" 
            style={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: '#60a5fa',
              marginBottom: '12px',
              display: 'none'
            }}
          ></div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '8px' }}>
            <ProgressBar 
              id="info_progress_bar"
              now={0}
              variant="info"
              animated
              style={{
                height: '20px',
                background: '#1e293b',
                borderRadius: '10px'
              }}
            />
          </div>
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            Placement Progress
          </div>

          {/* Placement Info */}
          <div id="info_placement" style={{ display: 'none' }}>
            <Row className="g-3">
              {/* Material Utilization */}
              <Col xs={6}>
                <div style={{
                  background: '#1e293b',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Percent size={16} color="#10b981" />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Efficiency</span>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#10b981'
                  }}>
                    <span id="info_efficiency">0</span>
                    <sup style={{ fontSize: '16px' }}>%</sup>
                  </div>
                </div>
              </Col>

              {/* Iterations */}
              <Col xs={6}>
                <div style={{
                  background: '#1e293b',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Grid3x3Gap size={16} color="#f59e0b" />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Iterations</span>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#f59e0b'
                  }} id="info_iterations_display">
                    {iterations}
                  </div>
                </div>
              </Col>

              {/* Parts Placed */}
              <Col xs={12}>
                <div style={{
                  background: '#1e293b',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Layers size={16} color="#3b82f6" />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Parts Placed</span>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#3b82f6'
                  }}>
                    <span id="info_placed">0</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ProgressPanel
