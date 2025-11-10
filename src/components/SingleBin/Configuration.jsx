function Configuration({ visible, onSave }) {
  if (!visible) return null

  return (
    <div id="config" className={visible ? 'active' : ''}>
      <div id="configwrapper">
        <input type="text" defaultValue="0" data-config="spacing" />
        <h3>Space between parts</h3>
        <span className="tooltip" title="The space between parts in SVG units">?</span>

  <input type="text" defaultValue="0.3" data-config="curveTolerance" />
        <h3>Curve tolerance</h3>
        <span className="tooltip" title="The maximum error allowed when converting Beziers and arcs to line segments">?</span>

  <input type="text" defaultValue="10000000" data-config="clipperScale" />
  <h3>Clipper scale</h3>
  <span className="tooltip" title="Internal precision multiplier used by the Clipper geometry engine">?</span>

        <input type="text" defaultValue="4" data-config="rotations" />
        <h3>Part rotations</h3>
        <span className="tooltip" title="Number of rotations to consider when inserting a part">?</span>

        <input type="text" defaultValue="10" data-config="populationSize" />
        <h3>GA population</h3>
        <span className="tooltip" title="The number of solutions in the Genetic Algorithm population">?</span>

        <input type="text" defaultValue="10" data-config="mutationRate" />
        <h3>GA mutation rate</h3>
        <span className="tooltip" title="Mutation rate (in percent) at each generation of the Genetic Algorithm">?</span>

        <input type="checkbox" className="checkbox" data-config="useHoles" />
        <h3>Part in Part</h3>
        <span className="tooltip" title="Place parts in the holes of other parts">?</span>

        <input type="checkbox" className="checkbox" data-config="exploreConcave" />
        <h3>Explore concave areas</h3>
        <span className="tooltip" title="Try to solve for enclosed concave areas">?</span>

        <a href="#" className="button" onClick={onSave}>Save Settings</a>
      </div>
    </div>
  )
}

export default Configuration