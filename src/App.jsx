import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'

// Layout Components
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'

// Pages
import Homepage from './pages/Homepage/Homepage'
import SVGNestReactParent from './pages/SVGNestReact/SVGNestReactParent'
import SVGNestTestingParent from './pages/SVGNestTesting/SVGNestTestingParent'

function App() {
  return (
    <Router>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <Header />
        
        {/* Main Content Area: Sidebar + Routes */}
        <div style={{ 
          display: 'flex', 
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Left Sidebar */}
          <Sidebar />
          
          {/* Main Display Area */}
          <main style={{
            flex: 1,
            overflow: 'auto',
            background: '#e5e8efff'
          }}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/svgnest" element={<SVGNestReactParent />} />
              <Route path="/svgnest-testing" element={<SVGNestTestingParent />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
