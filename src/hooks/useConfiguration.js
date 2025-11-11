import { useCallback } from 'react'

/**
 * Hook for managing SVGnest configuration
 */
export function useConfiguration({ setMessage, setMessageClass, MESSAGE_TYPES }) {
  
  /**
   * Save configuration to SVGnest and localStorage
   */
  const saveConfig = useCallback((e) => {
    if (e) e.preventDefault()
    
    if (!window.SvgNest) {
      setMessage('SVGnest not available')
      setMessageClass(MESSAGE_TYPES.ERROR)
      return false
    }

    const config = {}
    const inputs = document.querySelectorAll('#config input')
    
    console.log('=== SAVING CONFIG ===')
    console.log('Found inputs:', inputs.length)
    
    inputs.forEach(input => {
      const key = input.getAttribute('data-config')
      if (key) {
        if (input.type === 'checkbox') {
          config[key] = input.checked
          console.log(`  ${key} (checkbox): ${input.checked}`)
        } else {
          config[key] = parseFloat(input.value) || input.value
          console.log(`  ${key}: ${input.value} -> ${config[key]}`)
        }
      }
    })

    console.log('Final config object:', config)

    // Save to SVGnest
    window.SvgNest.config(config)
    console.log('Applied to SvgNest.config()')
    
    // Persist to localStorage
    localStorage.setItem('svgnest-config', JSON.stringify(config))
    console.log('Saved to localStorage as:', localStorage.getItem('svgnest-config'))
    console.log('=====================')
    
    setMessage('Configuration saved')
    setMessageClass(MESSAGE_TYPES.SUCCESS)
    return true
  }, [setMessage, setMessageClass, MESSAGE_TYPES])

  return {
    saveConfig
  }
}
