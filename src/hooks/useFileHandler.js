import { useCallback } from 'react'

export const useFileHandler = ({ setMessage, setMessageClass, setBinSelected }) => {
  
  const handleFile = useCallback((file) => {
    if (!file) {
      setMessage('No file selected')
      setMessageClass('error animated bounce')
      return
    }

    if (!window.SvgNest) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass('error animated bounce')
      return
    }

    const reader = new FileReader()
    reader.onload = function(e) {
      try {
        const content = e.target.result
        console.log('File loaded, content length:', content.length)
        
        // Use SvgNest to parse and display the file
        const displayElement = document.getElementById('select')
        if (displayElement) {
          displayElement.innerHTML = content
          console.log('SVG content set to display element')
          
          // Set bin using SvgNest
          if (window.SvgNest && window.SvgNest.setbin) {
            console.log('Setting bin with SVGnest:', window.SvgNest)
            window.SvgNest.setbin(displayElement)
            setBinSelected(true)
            setMessage('SVG loaded successfully! Click Start Nest to begin.')
            setMessageClass('success')
          } else {
            console.error('SvgNest.setbin not available')
            setMessage('Error: SVGnest setbin function not available')
            setMessageClass('error animated bounce')
          }
        }
      } catch (error) {
        console.error('Error processing file:', error)
        setMessage('Error processing SVG file')
        setMessageClass('error animated bounce')
      }
    }
    
    reader.onerror = function() {
      setMessage('Error reading file')
      setMessageClass('error animated bounce')
    }
    
    reader.readAsText(file)
  }, [setMessage, setMessageClass, setBinSelected])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  return {
    handleFileChange,
    handleDragOver,
    handleDrop
  }
}