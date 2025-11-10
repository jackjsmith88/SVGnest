import { useState } from 'react'
import MultiBinTester from './components/MultiBinTester'

function App() {
  return (
    <div className="app">
      <h1>SVGnest Multi-Bin Tester</h1>
      <p className="subtitle">Test nesting shapes across multiple bins</p>
      <MultiBinTester />
    </div>
  )
}

export default App
