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
  PencilSquare
} from 'react-bootstrap-icons'
import 'bootstrap/dist/css/bootstrap.min.css'

function MainToolbar({
  isWorking,
  binSelected,
  downloadReady,
  configVisible,
  showCustomBuilder,
  nestingStarted,
  onStart,
  onDownload,
  onConfigToggle,
  onToggleCustomBuilder,
  onZoomIn,
  onZoomOut,
  onExit
}) {
  const renderTooltip = (text) => <Tooltip>{text}</Tooltip>

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderBottom: '2px solid #dee2e6',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Left: Primary Actions */}
      <ButtonGroup>
        <OverlayTrigger
          placement="bottom"
          overlay={renderTooltip(isWorking ? 'Stop the nesting algorithm' : 'Start nesting shapes into bins')}
        >
          <Button
            variant={isWorking ? 'danger' : 'success'}
            onClick={onStart}
            disabled={!isWorking && !binSelected}
            style={{
              minWidth: '140px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: (!isWorking && binSelected) ? '0 0 15px rgba(34, 197, 94, 0.4)' : 'none',
              animation: (!isWorking && binSelected) ? 'pulse 2s infinite' : 'none'
            }}
          >
            {isWorking ? (
              <>
                <StopFill size={18} />
                Stop Nest
              </>
            ) : (
              <>
                <PlayFill size={18} />
                Start Nest
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
              minWidth: '140px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: downloadReady ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none'
            }}
          >
            <Download size={18} />
            Download SVG
          </Button>
        </OverlayTrigger>
      </ButtonGroup>

      {/* Center: Shape Source Toggle */}
      {!nestingStarted && (
        <ButtonGroup>
          <OverlayTrigger
            placement="bottom"
            overlay={renderTooltip('Use template shapes with multiplier')}
          >
            <Button
              variant={!showCustomBuilder ? 'info' : 'outline-info'}
              onClick={() => !showCustomBuilder || onToggleCustomBuilder()}
              style={{
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Grid3x3GapFill size={18} />
              Shape Manager
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
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PencilSquare size={18} />
              Custom Builder
            </Button>
          </OverlayTrigger>
        </ButtonGroup>
      )}

      {/* Right: Tool Actions */}
      <ButtonGroup>
        <OverlayTrigger
          placement="bottom"
          overlay={renderTooltip('Configure algorithm settings')}
        >
          <Button
            variant={configVisible ? 'secondary' : 'outline-secondary'}
            onClick={onConfigToggle}
            disabled={isWorking}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <GearFill size={18} />
            Config
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={renderTooltip('Zoom in')}>
          <Button
            variant="outline-secondary"
            onClick={onZoomIn}
            disabled={isWorking}
          >
            <ZoomIn size={18} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={renderTooltip('Zoom out')}>
          <Button
            variant="outline-secondary"
            onClick={onZoomOut}
            disabled={isWorking}
          >
            <ZoomOut size={18} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={renderTooltip('Exit to main menu')}>
          <Button
            variant="outline-danger"
            onClick={onExit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '12px'
            }}
          >
            <BoxArrowLeft size={18} />
            Exit
          </Button>
        </OverlayTrigger>
      </ButtonGroup>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
          }
        }
      `}</style>
    </div>
  )
}

export default MainToolbar
