import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  
  const navItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: '🏠',
      description: 'Welcome page'
    },
    { 
      path: '/svgnest', 
      label: 'SVG Nesting', 
      icon: '📐',
      description: 'Nest SVG shapes'
    },
        { 
      path: '/svgnest-testing', 
      label: 'SVG Nest Testing', 
      icon: '📐',
      description: 'Test SVG nesting'
    },
  ]

  return (
    <aside style={{
      width: '240px',
      background: '#0f172a',
      borderRight: '1px solid rgba(148, 163, 184, 0.2)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px 20px',
                margin: '4px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#93c5fd' : '#94a3b8',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span style={{ 
                fontSize: '12px', 
                color: isActive ? '#60a5fa' : '#64748b',
                paddingLeft: '30px'
              }}>
                {item.description}
              </span>
            </Link>
          )
        })}
      </nav>

      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)',
        fontSize: '12px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>SVGnest v2.0</p>
        <p style={{ margin: 0 }}>Built with React</p>
      </div>
    </aside>
  )
}
