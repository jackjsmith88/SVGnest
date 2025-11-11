import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header style={{
      height: '60px',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            color: 'white',
            fontSize: '18px'
          }}>
            S
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#f8fafc',
            letterSpacing: '-0.5px'
          }}>
            SVGnest
          </h1>
        </div>
      </Link>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: '#94a3b8'
      }}>
        <span>React + Vite</span>
      </div>
    </header>
  )
}
