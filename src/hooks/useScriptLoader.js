import { useEffect, useState } from 'react'
import { SCRIPT_FILES } from '../utils/constants'
import { checkBrowserCompatibility } from '../utils/helpers'

export const useScriptLoader = () => {
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState(null)

  useEffect(() => {
    const loadScripts = async () => {
      // Check browser compatibility first
      const compatibilityErrors = checkBrowserCompatibility()
      if (compatibilityErrors.length > 0) {
        setLoadingError(compatibilityErrors[0])
        return
      }

      // Load scripts sequentially
      try {
        for (const scriptSrc of SCRIPT_FILES) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = scriptSrc
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // Check if SvgNest is available after loading
        if (!window.SvgNest) {
          setLoadingError("Couldn't initialize SVGnest")
          return
        }

        console.log('SVGnest loaded successfully', window.SvgNest)
        setScriptsLoaded(true)
      } catch (error) {
        console.error('Error loading scripts:', error)
        setLoadingError('Error loading SVGnest libraries')
      }
    }

    loadScripts()
  }, [])

  return { scriptsLoaded, loadingError }
}