import { useCallback } from 'react'

export const useFileHandler = ({ setMessage, setMessageClass, setBinSelected, attachSvgListeners }) => {
  
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
          
          // Parse the SVG and attach listeners like in the original code
          if (window.SvgNest && window.SvgNest.parsesvg) {
            try {
              const svg = window.SvgNest.parsesvg(displayElement.innerHTML)
              displayElement.innerHTML = ''
              displayElement.appendChild(svg)
              
              // Attach event listeners for SVG selection
              if (attachSvgListeners) {
                attachSvgListeners(svg)
              }
              
              setMessage('Click on the outline to use as the bin')
              setMessageClass('success')
              console.log('SVG parsed and listeners attached')
            } catch (parseError) {
              console.error('Error parsing SVG:', parseError)
              setMessage('Error parsing SVG file: ' + parseError.toString())
              setMessageClass('error animated bounce')
            }
          } else {
            console.error('SvgNest.parsesvg not available')
            setMessage('Error: SVGnest parse function not available')
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