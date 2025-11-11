import React from 'react'
import MultiBinTester from '../SVGNestReact/MultiBin/MultiBinTester'
import '../../styles/App.css'

function SVGNestTestingParent() {
  return (
    <div className="App">
      <div id="svgnest" style={{ display: 'block' }}>
        <MultiBinTester />
      </div>
    </div>
  )
}

export default SVGNestTestingParent