function ProgressSidebar({ iterations }) {
  return (
    <div className="sidebar">
      <div id="info" style={{ display: 'none' }}>
        <h2 id="info_time"></h2>
        <div id="info_progress"></div>
        <span className="subscript">Placement progress</span>

        <div id="info_placement" style={{ display: 'none' }}>
          <div className="column left">
            <h1 className="label"><span id="info_efficiency"></span><sup>%</sup></h1>
            <span className="subscript">Material Utilization</span>
          </div>

          <div className="column right">
            <h1 className="label" id="info_iterations">{iterations}</h1>
            <span className="subscript">Iterations</span>
          </div>

          <div className="column left">
            <h1 className="label"><span id="info_placed"></span></h1>
            <span className="subscript">Parts placed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressSidebar