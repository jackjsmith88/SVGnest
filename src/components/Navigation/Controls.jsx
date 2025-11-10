function Controls({
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
  return (
    <div id="controls">
      <ul className="nav">
        <li 
          id="start" 
          className={`button start ${(!isWorking && binSelected) ? 'animated bounce' : 'disabled'}`} 
          onClick={onStart}
        >
          <span id="startlabel">{isWorking ? 'Stop Nest' : 'Start Nest'}</span>
        </li>
        <li 
          id="download" 
          className={`button download ${downloadReady ? 'animated bounce' : 'disabled'}`} 
          onClick={onDownload}
        >
          Download SVG
        </li>
        <li 
          id="configbutton" 
          className={`button config ${isWorking ? 'disabled' : ''}`} 
          onClick={onConfigToggle}
        ></li>
        <li 
          id="zoominbutton" 
          className={`button zoomin ${isWorking ? 'disabled' : ''}`} 
          onClick={onZoomIn}
        ></li>
        <li 
          id="zoomoutbutton" 
          className={`button zoomout ${isWorking ? 'disabled' : ''}`} 
          onClick={onZoomOut}
        ></li>
        <li className="button exit" onClick={onExit}></li>
      </ul>
    </div>
  )
}

export default Controls