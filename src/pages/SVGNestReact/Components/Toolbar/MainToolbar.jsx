import { ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { 
  PlayFill, 
  StopFill, 
  Download, 
  GearFill, 
  ZoomIn, 
  ZoomOut, 
  BoxArrowLeft,
  Grid3x3GapFill,
  PencilSquare,
  Trash
} from 'react-bootstrap-icons'
import 'bootstrap/dist/css/bootstrap.min.css'

// Unified professional styles
const styles = {
  toolbar: {
    background: 'white',
    borderBottom: '2px solid #4CAF50',
    padding: '8px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  button: {
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'all 0.3s'
  }
}

function MainToolbar({
  isWorking,
  binSelected,
  downloadReady,
  configVisible,
  showCustomBuilder,
  nestingStarted,
  onStart,
  onDownload,
  onClear,
  onConfigToggle,
  onToggleCustomBuilder,
  onZoomIn,
  onZoomOut,
  onExit
}) {
  const renderTooltip = (text) => <Tooltip>{text}</Tooltip>

  return (
    <div style={styles.toolbar}>
      {/* Left: Primary Actions */}
      <ButtonGroup size="sm">
        <OverlayTrigger
          placement="bottom"
          overlay={renderTooltip(isWorking ? 'Stop the nesting algorithm' : 'Start nesting shapes into bins')}
        >
          <Button
            variant={isWorking ? 'danger' : 'success'}
            onClick={onStart}
            disabled={!isWorking && !binSelected}
            style={{
              ...styles.button,
              minWidth: '120px',
              boxShadow: (!isWorking && binSelected) ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none'
            }}
          >
            {isWorking ? (
              <>
                <StopFill size={16} />
                <span style={{ marginLeft: '6px' }}>Stop Nest</span>
              </>
            ) : (
              <>
                <PlayFill size={16} />
                <span style={{ marginLeft: '6px' }}>Start Nest</span>
              </>
            )}
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          overlay={renderTooltip('Download nested SVG result')}
        >
          <Button
            variant="primary"
            onClick={onDownload}
            disabled={!downloadReady}
            style={{
              ...styles.button,
              minWidth: '120px'
            }}
          >
            <Download size={16} />
            <span style={{ marginLeft: '6px' }}>Download</span>
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          overlay={renderTooltip('Clear all shapes and results to start fresh')}
        >
          <Button
            variant="outline-danger"
            onClick={onClear}
            disabled={!binSelected && !nestingStarted}
            style={{
              ...styles.button,
              minWidth: '100px'
            }}
          >
            <Trash size={16} />
            <span style={{ marginLeft: '6px' }}>Clear</span>
          </Button>
        </OverlayTrigger>
      </ButtonGroup>

      {/* Center: Shape Source Toggle */}
      {!nestingStarted && (
        <ButtonGroup size="sm">
          <OverlayTrigger
            placement="bottom"
            overlay={renderTooltip('Use template shapes with multiplier')}
          >
            <Button
              variant={!showCustomBuilder ? 'info' : 'outline-info'}
              onClick={() => !showCustomBuilder || onToggleCustomBuilder()}
              style={{
                ...styles.button,
                minWidth: '110px'
              }}
            >
              <Grid3x3GapFill size={16} />
              <span style={{ marginLeft: '6px' }}>Shapes</span>
            </Button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            overlay={renderTooltip('Build custom shapes from scratch')}
          >
            <Button
              variant={showCustomBuilder ? 'warning' : 'outline-warning'}
              onClick={() => showCustomBuilder || onToggleCustomBuilder()}
              style={{
                ...styles.button,
                minWidth: '110px'
              }}
            >
              <PencilSquare size={16} />
              <span style={{ marginLeft: '6px' }}>Builder</span>
            </Button>
          </OverlayTrigger>
        </ButtonGroup>
      )}

      {/* Right: Tool Actions */}
      <ButtonGroup size="sm">
        <OverlayTrigger
          placement="bottom"
          overlay={renderTooltip('Configure algorithm settings')}
        >
          <Button
            variant={configVisible ? 'secondary' : 'outline-secondary'}
            onClick={onConfigToggle}
            disabled={isWorking}
            style={styles.button}
          >
            <GearFill size={16} />
            <span style={{ marginLeft: '6px' }}>Config</span>
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={renderTooltip('Zoom in')}>
          <Button
            variant="outline-secondary"
            onClick={onZoomIn}
            disabled={isWorking}
            style={styles.button}
          >
            <ZoomIn size={16} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={renderTooltip('Zoom out')}>
          <Button
            variant="outline-secondary"
            onClick={onZoomOut}
            disabled={isWorking}
            style={styles.button}
          >
            <ZoomOut size={16} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={renderTooltip('Exit to main menu')}>
          <Button
            variant="outline-danger"
            onClick={onExit}
            style={{
              ...styles.button,
              marginLeft: '8px'
            }}
          >
            <BoxArrowLeft size={16} />
            <span style={{ marginLeft: '6px' }}>Exit</span>
          </Button>
        </OverlayTrigger>
      </ButtonGroup>
    </div>
  )
}

export default MainToolbar
