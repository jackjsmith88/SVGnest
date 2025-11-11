import { ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { 
  PlayFill, 
  StopFill, 
  Download, 
  GearFill, 
  ZoomIn, 
  ZoomOut, 
  BoxArrowLeft 
} from 'react-bootstrap-icons'
import 'bootstrap/dist/css/bootstrap.min.css'

function MainToolbar({
  isWorking,
  binSelected,
  downloadReady,
  configVisible,
  onStart,
  onDownload,
  onConfigToggle,
  onZoomIn,
  onZoomOut,
  onExit
}) {
  const renderTooltip = (text) => <Tooltip>{text}</Tooltip>

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
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
              boxShadow: (!isWorking && binSelected) ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none',
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
              background: downloadReady ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : undefined,
              boxShadow: downloadReady ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          >
            <Download size={18} />
            Download SVG
          </Button>
        </OverlayTrigger>
      </ButtonGroup>

      {/* Right: Tool Actions */}
      <ButtonGroup>
        <OverlayTrigger
          placement="bottom"
          overlay={renderTooltip('Configure algorithm settings')}
        >
          <Button
            variant={configVisible ? 'light' : 'outline-light'}
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
            variant="outline-light"
            onClick={onZoomIn}
            disabled={isWorking}
          >
            <ZoomIn size={18} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="bottom" overlay={renderTooltip('Zoom out')}>
          <Button
            variant="outline-light"
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
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
          }
        }
      `}</style>
    </div>
  )
}

export default MainToolbar
