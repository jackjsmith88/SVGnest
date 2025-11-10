import React, { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import MultiBinTester from './components/MultiBinTester'

// These scripts will be loaded dynamically since they're not ES modules
const scriptFiles = [
  '/pathsegpolyfill.js',
  '/matrix.js', 
  '/domparser.js',
  '/clipper.js',
  '/parallel.js',
  '/geometryutil.js',
  '/placementworker.js',
  '/svgparser.js',
  '/svgnest.js',
  '/filesaver.js'
]

function App() {
  const [faqVisible, setFaqVisible] = useState(false)
  const [configVisible, setConfigVisible] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [message, setMessage] = useState('')
  const [messageClass, setMessageClass] = useState('')
  const [showSplash, setShowSplash] = useState(true)
  const [prevPercent, setPrevPercent] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [iterations, setIterations] = useState(0)
  const [downloadReady, setDownloadReady] = useState(false)
  const [binSelected, setBinSelected] = useState(false)
  const [currentMode, setCurrentMode] = useState('single-bin') // 'single-bin' or 'multi-bin'

  const displayRef = useRef(null)
  const fileInputRef = useRef(null)
  const binsRef = useRef(null)

  // Load scripts and check browser compatibility
  useEffect(() => {
    const loadScripts = async () => {
      // Browser compatibility checks first
      if (!document.createElementNS || !document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
        setMessage('Your browser does not have SVG support')
        setMessageClass('error animated bounce')
        return
      }

      if (!window.File || !window.FileReader) {
        setMessage('Your browser does not have file upload support')
        setMessageClass('error animated bounce')
        return
      }

      if (!window.Worker) {
        setMessage('Your browser does not have web worker support')
        setMessageClass('error animated bounce')
        return
      }

      // Load scripts sequentially
      try {
        for (const scriptSrc of scriptFiles) {
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
          setMessage("Couldn't initialize SVGnest")
          setMessageClass('error animated bounce')
          return
        }

        console.log('SVGnest loaded successfully', window.SvgNest)
        setMessage('SVGnest ready! Click Demo or Upload SVG to start')
        setMessageClass('success')
      } catch (error) {
        console.error('Error loading scripts:', error)
        setMessage('Error loading SVGnest libraries')
        setMessageClass('error animated bounce')
      }
    }

    loadScripts()
  }, [])

  const hideSplash = () => {
    setShowSplash(false)
  }

  const handleDemo = () => {
    console.log('Demo button clicked')
    
    if (!window.SvgNest) {
      setMessage('SVGnest not loaded yet. Please wait...')
      setMessageClass('error animated bounce')
      return
    }
    
    try {
      // Get the SVG element that's already in the DOM
      const svgElement = displayRef.current?.querySelector('svg')
      if (!svgElement) {
        throw new Error('No SVG element found')
      }

      console.log('Found SVG element:', svgElement)

      // Convert SVG element to string for parsing
      const svgString = svgElement.outerHTML
      console.log('Parsing SVG string with SvgNest...')
      const svg = window.SvgNest.parsesvg(svgString)
      
      if (!svg) {
        throw new Error('SVGnest failed to parse the demo SVG')
      }
      
      console.log('Parsed SVG:', svg)
      
      displayRef.current.innerHTML = ''
      displayRef.current.appendChild(svg)

      hideSplash()
      setBinSelected(false)
      setDownloadReady(false)
      setMessage('Click on any outline to use as the bin')
      setMessageClass('active animated bounce')

      attachSvgListeners(svg)
    } catch (e) {
      console.error('Demo error:', e)
      setMessage(e.toString())
      setMessageClass('error animated bounce')
      return
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    handleFile(e.target.files[0])
  }

  const handleFile = (file) => {
    if (!file) return

    if (!file.type || (file.type.search('svg') < 0 && file.type.search('xml') < 0 && file.type.search('text') < 0)) {
      setMessage('Only SVG files allowed')
      setMessageClass('error animated bounce')
      return
    }

    const reader = new FileReader()
    reader.onload = function(e) {
      if (reader.result) {
        try {
          const svg = window.SvgNest.parsesvg(reader.result)
          const wholeSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          
          // Copy relevant scaling info
          wholeSVG.setAttribute('width', svg.getAttribute('width'))
          wholeSVG.setAttribute('height', svg.getAttribute('height'))
          wholeSVG.setAttribute('viewBox', svg.getAttribute('viewBox'))
          
          const rect = document.createElementNS(wholeSVG.namespaceURI, 'rect')
          rect.setAttribute('x', wholeSVG.viewBox.baseVal.x)
          rect.setAttribute('y', wholeSVG.viewBox.baseVal.x)
          rect.setAttribute('width', wholeSVG.viewBox.baseVal.width)
          rect.setAttribute('height', wholeSVG.viewBox.baseVal.height)
          rect.setAttribute('class', 'fullRect')
          wholeSVG.appendChild(rect)

          displayRef.current.innerHTML = ''
          displayRef.current.appendChild(wholeSVG) // As a default bin in background
          displayRef.current.appendChild(svg)
        } catch (e) {
          setMessage(e.toString())
          setMessageClass('error animated bounce')
          return
        }

        hideSplash()
        setBinSelected(false)
        setDownloadReady(false)
        setMessage('Click on the outline to use as the bin')
        setMessageClass('active animated bounce')

        attachSvgListeners(svg)
        attachSvgListeners(wholeSVG)
      }
    }

    reader.readAsText(file)
  }

  const attachSvgListeners = (svg) => {
    console.log('Attaching SVG listeners to:', svg)
    // attach event listeners
    for (let i = 0; i < svg.childNodes.length; i++) {
      const node = svg.childNodes[i]
      if (node.nodeType === 1) {
        node.onclick = function() {
          console.log('SVG element clicked:', this)
          
          if (displayRef.current && displayRef.current.className === 'disabled') {
            console.log('Display is disabled, ignoring click')
            return
          }
          
          const currentbin = document.querySelector('#select .active')
          if (currentbin) {
            const className = currentbin.getAttribute('class').replace('active', '').trim()
            if (!className)
              currentbin.removeAttribute('class')
            else
              currentbin.setAttribute('class', className)
          }

          console.log('Setting bin with SVGnest:', window.SvgNest)
          window.SvgNest.setbin(this)
          this.setAttribute('class', (this.getAttribute('class') ? this.getAttribute('class') + ' ' : '') + 'active')

          // Enable the start button after a bin is selected
          setBinSelected(true)
          
          setMessage('Bin selected! Click Start Nest to begin.')
          setMessageClass('success animated bounce')
        }
      }
    }
  }

  // Define progress and renderSvg functions first
  const progress = useCallback((percent) => {
    const transition = percent > prevPercent ? '; transition: width 0.1s' : ''
    const progressBar = document.getElementById('info_progress')
    const infoPanel = document.getElementById('info')
    const timeDisplay = document.getElementById('info_time')
    
    if (progressBar) {
      progressBar.setAttribute('style', 'width: ' + Math.round(percent * 100) + '% ' + transition)
    }
    if (infoPanel) {
      infoPanel.setAttribute('style', 'display: block')
    }

    setPrevPercent(percent)

    const now = new Date().getTime()
    if (startTime && now && timeDisplay) {
      const diff = now - startTime
      const estimate = (diff / percent) * (1 - percent)
      timeDisplay.innerHTML = millisecondsToStr(estimate) + ' remaining'

      if (diff > 5000 && percent < 0.3 && percent > 0.02 && estimate > 10000) {
        timeDisplay.setAttribute('style', 'display: block')
      }
    }

    if (timeDisplay) {
      if (percent > 0.95 || percent < 0.02) {
        timeDisplay.setAttribute('style', 'display: none')
      }
    }
    
    if (percent < 0.02) {
      setStartTime(new Date().getTime())
    }
  }, [prevPercent, startTime])

  const renderSvg = useCallback((svglist, efficiency, placed, total) => {
    setIterations(prev => {
      const newIterations = prev + 1
      const iterationsDisplay = document.getElementById('info_iterations')
      if (iterationsDisplay) {
        iterationsDisplay.innerHTML = newIterations
      }
      return newIterations
    })

    if (!svglist || svglist.length === 0) {
      return
    }

    if (binsRef.current) {
      binsRef.current.innerHTML = ''

      for (let i = 0; i < svglist.length; i++) {
        if (svglist.length > 2) {
          svglist[i].setAttribute('class', 'grid')
        }
        binsRef.current.appendChild(svglist[i])
      }
    }

    const efficiencyDisplay = document.getElementById('info_efficiency')
    const placedDisplay = document.getElementById('info_placed')
    const placementDisplay = document.getElementById('info_placement')

    if (efficiencyDisplay && (efficiency || efficiency === 0)) {
      efficiencyDisplay.innerHTML = Math.round(efficiency * 100)
    }

    if (placedDisplay) {
      placedDisplay.innerHTML = placed + '/' + total
    }
    
    if (placementDisplay) {
      placementDisplay.setAttribute('style', 'display: block')
    }
    
    if (displayRef.current) {
      displayRef.current.setAttribute('style', 'display: none')
    }
    
    // Enable download button when nesting results are available
    setDownloadReady(true)
  }, [])

  const startNest = useCallback(() => {
    console.log('Starting nest with callbacks:', { progress, renderSvg })
    
    if (!window.SvgNest) {
      console.error('SvgNest not available')
      setMessage('SVGnest not loaded')
      setMessageClass('error animated bounce')
      return
    }
    
    window.SvgNest.start(progress, renderSvg)
    setIsWorking(true)
    setConfigVisible(false)

    const svg = document.querySelector('#select svg')
    if (svg) {
      svg.removeAttribute('style')
    }
  }, [progress, renderSvg])

  const stopNest = useCallback(() => {
    console.log('Stopping nest')
    
    if (window.SvgNest) {
      window.SvgNest.stop()
    }
    
    setIsWorking(false)
  }, [])

  const handleStart = () => {
    if (!isWorking && !binSelected) {
      setMessage('Please select a bin first by clicking on an outline')
      setMessageClass('error animated bounce')
      return
    }
    
    setIterations(0)
    if (isWorking) {
      stopNest()
    } else {
      startNest()
    }
    
    if (displayRef.current) {
      displayRef.current.className = 'disabled'
    }
    
    // Hide time display initially
    const timeDisplay = document.getElementById('info_time')
    if (timeDisplay) {
      timeDisplay.setAttribute('style', 'display: none')
    }
  }



  const handleDownload = () => {
    const bins = binsRef.current
    if (bins.children.length === 0) {
      setMessage('No SVG to export')
      setMessageClass('error animated bounce')
      return
    }

    let svg = displayRef.current.querySelector('svg')
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    }

    svg = svg.cloneNode(false)

    // maintain stroke, fill etc of input
    if (window.SvgNest.style) {
      svg.appendChild(window.SvgNest.style)
    }

    const binHeight = parseInt(bins.children[0].getAttribute('height'))

    for (let i = 0; i < bins.children.length; i++) {
      const b = bins.children[i]
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'translate(0 ' + binHeight * 1.1 * i + ')')
      for (let j = 0; j < b.children.length; j++) {
        group.appendChild(b.children[j].cloneNode(true))
      }
      svg.appendChild(group)
    }

    let output
    if (typeof XMLSerializer !== 'undefined') {
      output = (new XMLSerializer()).serializeToString(svg)
    } else {
      output = svg.outerHTML
    }

    const blob = new Blob([output], { type: "image/svg+xml;charset=utf-8" })
    window.saveAs(blob, "SVGnest-output.svg")
  }

  const handleZoomIn = () => {
    if (isWorking) return
    
    setZoomLevel(prev => {
      const newZoom = prev * 1.2
      const svg = document.querySelector('#select svg')
      if (svg) {
        svg.setAttribute('style', `transform-origin: top left; transform:scale(${newZoom})`)
      }
      return newZoom
    })
  }

  const handleZoomOut = () => {
    if (isWorking) return
    
    setZoomLevel(prev => {
      let newZoom = prev * 0.8
      if (newZoom < 0.02) {
        newZoom = 0.02
      }
      const svg = document.querySelector('#select svg')
      if (svg) {
        svg.setAttribute('style', `transform-origin: top left; transform:scale(${newZoom})`)
      }
      return newZoom
    })
  }

  const handleExit = () => {
    window.location.reload()
  }

  const handleConfigSave = () => {
    const c = {}
    const inputs = document.querySelectorAll('#config input')
    for (let i = 0; i < inputs.length; i++) {
      const key = inputs[i].getAttribute('data-config')
      if (inputs[i].getAttribute('type') === 'text') {
        c[key] = inputs[i].value
      } else if (inputs[i].getAttribute('type') === 'checkbox') {
        c[key] = inputs[i].checked
      }
    }

    window.SvgNest.config(c)

    // new configs will invalidate current nest
    if (isWorking) {
      stopNest()
    }
    setConfigVisible(false)
  }

  const millisecondsToStr = (milliseconds) => {
    function numberEnding(number) {
      return (number > 1) ? 's' : ''
    }

    const temp = Math.floor(milliseconds / 1000)
    const years = Math.floor(temp / 31536000)
    if (years) {
      return years + ' year' + numberEnding(years)
    }
    const days = Math.floor((temp % 31536000) / 86400)
    if (days) {
      return days + ' day' + numberEnding(days)
    }
    const hours = Math.floor((temp % 86400) / 3600)
    if (hours) {
      return hours + ' hour' + numberEnding(hours)
    }
    const minutes = Math.floor((temp % 3600) / 60)
    if (minutes) {
      return minutes + ' minute' + numberEnding(minutes)
    }
    const seconds = temp % 60
    if (seconds) {
      return seconds + ' second' + numberEnding(seconds)
    }
    return 'less than a second'
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
    // Add visual feedback
  }

  const handleDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="App" onDragOver={handleDragOver} onDrop={handleDrop}>
      {showSplash && (
        <div id="splash">
          <img src="/img/logo.svg" alt="SVGnest" className="logo" />
          <h1 className="title">SVGnest</h1>
          <em className="subscript">Open Source nesting</em>

          <ul className="nav">
            <li className="button start" onClick={handleDemo}>Demo</li>
            <li className="button upload" onClick={handleUpload}>Upload SVG</li>
            <li className="button code">
              <a href="https://github.com/Jack000/SVGnest" target="_blank" rel="noopener noreferrer">Github</a>
            </li>
            <li className="button" onClick={() => setFaqVisible(!faqVisible)}>FAQ</li>
          </ul>

        </div>
      )}

      <div id="svgnest" style={{ display: showSplash ? 'none' : 'block' }}>
        <div id="controls">
          <ul className="nav">
            <li id="start" className={`button start ${(!isWorking && binSelected) ? 'animated bounce' : 'disabled'}`} onClick={handleStart}>
              <span id="startlabel">{isWorking ? 'Stop Nest' : 'Start Nest'}</span>
            </li>
            <li id="download" className={`button download ${downloadReady ? 'animated bounce' : 'disabled'}`} onClick={handleDownload}>Download SVG</li>
            <li id="configbutton" className={`button config ${isWorking ? 'disabled' : ''}`} onClick={() => setConfigVisible(!configVisible)}></li>
            <li id="zoominbutton" className={`button zoomin ${isWorking ? 'disabled' : ''}`} onClick={handleZoomIn}></li>
            <li id="zoomoutbutton" className={`button zoomout ${isWorking ? 'disabled' : ''}`} onClick={handleZoomOut}></li>
            <li className="button exit" onClick={handleExit}></li>
          </ul>

          {configVisible && (
            <div id="config" className={configVisible ? 'active' : ''}>
              <div id="configwrapper">
                <input type="text" defaultValue="0" data-config="spacing" />
                <h3>Space between parts</h3>
                <span className="tooltip" title="The space between parts in SVG units">?</span>

                <input type="text" defaultValue="0.3" data-config="curveTolerance" />
                <h3>Curve tolerance</h3>
                <span className="tooltip" title="The maximum error allowed when converting Beziers and arcs to line segments">?</span>

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

                <a href="#" className="button" onClick={handleConfigSave}>Save Settings</a>
              </div>
            </div>
          )}
        </div>

        <div className="mode-switcher">
          <div className="mode-tabs">
            <button 
              className={`mode-tab ${currentMode === 'single-bin' ? 'active' : ''}`}
              onClick={() => setCurrentMode('single-bin')}
            >
              Single Bin Nesting
            </button>
            <button 
              className={`mode-tab ${currentMode === 'multi-bin' ? 'active' : ''}`}
              onClick={() => setCurrentMode('multi-bin')}
            >
              Multi-Bin Testing
            </button>
          </div>
        </div>

        <div className="sidebar">
          <div id="info" style={{ display: 'none' }}>
            <h2 id="info_time"></h2>
            <div className="progress">
              <div className="progress_inner" id="info_progress"></div>
            </div>
            <span className="subscript">Placement progress</span>

            <div id="info_placement" style={{ display: 'none' }}>
              <div className="column left">
                <h1 className="label"><span id="info_efficiency"></span><sup>%</sup></h1>
                <span className="subscript">Material Utilization</span>
              </div>

              <div className="column right">
                <h1 className="label" id="info_iterations"></h1>
                <span className="subscript">Iterations</span>
              </div>

              <div className="column left">
                <h1 className="label"><span id="info_placed"></span></h1>
                <span className="subscript">Parts placed</span>
              </div>
            </div>
          </div>
        </div>

        {currentMode === 'single-bin' ? (
          <div id="select" ref={displayRef}>
            {/* Complete demo SVG content from original */}
            <svg version="1.1" id="svg2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="1147.592px" height="1397.27px" viewBox="0 0 1147.592 1397.27" enableBackground="new 0 0 1147.592 1397.27" xmlSpace="preserve">
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="684.045,443.734 688.396,447.215 666.488,450.935 666.488,432.651" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="697.067,404.901 697.067,415.601 709.719,415.905 710.293,406.067" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="723.908,440.886 715.362,442.463 709.719,435.85 712.627,427.66 721.17,426.079 726.81,432.692" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="617.292,458.369 618.742,465.049 599.735,465.566 599.735,447.28" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="619.963,428.025 619.963,438.722 633.189,438.467 633.189,429.192" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="646.805,464.01 638.259,465.587 632.618,458.974 635.523,450.784 644.069,449.207 649.706,455.819" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="777.062,428.025 746.983,457.397 760.468,481.256 782.898,488.173 788.995,478.145 814.669,479.959 818.817,438.722" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="666.589,476.434 664.255,503.557 681.632,505.633 694.857,499.916 692.262,483.07" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="599.735,501.612 636.247,531.953 680.981,531.953 680.981,554.904 599.735,554.904" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="759.315,529.301 775.721,500.886 792.128,529.301" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="741.307,428.338 734.229,419.461 736.757,408.396 746.983,403.469 757.206,408.396 759.735,419.461 752.654,428.338" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="647.399,599.509 651.749,602.988 629.84,606.702 629.84,588.419" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="650.068,569.167 650.068,579.861 662.723,580.171 663.294,570.334" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="758.061,626.35 800.104,626.854 807.438,600.447 796.468,579.694 785.065,582.478 768.195,563.04 736.104,589.264" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="694.308,592.604 687.232,583.727 689.758,572.661 699.984,567.735 710.211,572.661 712.736,583.727 705.658,592.604" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="854.273,544.551 858.625,548.03 836.717,551.75 836.717,533.467" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="856.944,514.209 856.944,524.909 869.597,525.213 870.171,515.376" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="883.785,550.194 875.24,551.771 869.597,545.158 872.505,536.968 881.048,535.388 886.688,542.001" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="779.841,537.333 779.841,548.03 793.067,547.775 793.067,538.5" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="901.184,537.646 894.106,528.769 896.635,517.703 906.861,512.777 917.084,517.703 919.613,528.769 912.532,537.646" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="836.717,410.401 827.633,456.421 894.106,463.102 910.101,434.273" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="676.909,605.146 668.363,606.727 662.723,600.113 665.628,591.92 674.174,590.346 679.814,596.959" />
            <rect x="21.066" y="439.913" width="30.913" height="18.155" fill="none" stroke="#010101" />
            <rect x="106.758" y="452.881" width="29.563" height="5.188" fill="none" stroke="#010101" />
            <rect x="184.038" y="464.809" width="25.963" height="17.637" fill="none" stroke="#010101" />
            <rect x="305.408" y="427.01" width="17.01" height="40.393" fill="none" stroke="#010101" />
            <rect x="262.876" y="458.068" width="17.004" height="17.633" fill="none" stroke="#010101" />
            <rect x="338.931" y="427.01" width="47.904" height="25.868" fill="none" stroke="#010101" />
            <polygon fill="none" stroke="#010101" points="66.82,475.701 47.112,507.86 101.95,510.972 140.64,493.336 90.161,496.448 87.322,473.625" />
            <polygon fill="none" stroke="#010101" points="196.401,495.929 224.016,523.938 348.972,517.196 271.061,492.297 227.967,473.625" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1065.045,441.528 1069.396,445.009 1047.488,448.729 1047.488,430.445" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1078.067,402.694 1078.067,413.395 1090.719,413.699 1091.293,403.861" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1104.908,438.68 1096.362,440.257 1090.719,433.644 1093.627,425.454 1102.17,423.873 1107.811,430.486" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="998.292,456.163 999.742,462.843 980.735,463.359 980.735,445.074" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1000.963,425.818 1000.963,436.516 1014.189,436.261 1014.189,426.985" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1027.805,461.804 1019.259,463.381 1013.618,456.768 1016.523,448.578 1025.069,447.001 1030.706,453.613" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="601.531,174.639 571.451,204.011 584.936,227.87 607.366,234.787 613.463,224.759 639.137,226.573 643.285,185.336" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1047.589,474.228 1045.255,501.351 1062.632,503.427 1075.857,497.71 1073.262,480.864" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="980.735,499.406 1017.247,529.747 1061.98,529.747 1061.98,552.698 980.735,552.698" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="583.783,275.915 600.188,247.5 616.596,275.915" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="565.774,174.952 558.696,166.075 561.225,155.01 571.451,150.083 581.674,155.01 584.203,166.075 577.122,174.952" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1028.399,597.303 1032.749,600.782 1010.84,604.496 1010.84,586.213" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1031.068,566.961 1031.068,577.655 1043.723,577.965 1044.294,568.128" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="582.528,372.964 624.57,373.468 631.906,347.062 620.936,326.309 609.533,329.092 592.663,309.654 560.571,335.878" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1075.308,590.397 1068.232,581.521 1070.758,570.455 1080.984,565.529 1091.211,570.455 1093.736,581.521 1086.658,590.397" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="678.741,291.165 683.093,294.645 661.185,298.364 661.185,280.081" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="681.412,260.823 681.412,271.524 694.064,271.827 694.639,261.99" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="708.253,296.809 699.708,298.386 694.064,291.773 696.973,283.582 705.516,282.002 711.155,288.615" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="604.309,283.947 604.309,294.645 617.535,294.389 617.535,285.114" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="725.651,284.26 718.574,275.383 721.104,264.317 731.329,259.392 741.552,264.317 744.081,275.383 737,284.26" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="661.185,157.016 652.101,203.035 718.574,209.716 734.568,180.887" />
            <polygon fill="none" stroke="#010101" strokeMiterlimit="10" points="1057.909,602.939 1049.363,604.521 1043.723,597.907 1046.628,589.714 1055.174,588.14 1060.814,594.753" />
            <rect x="402.066" y="437.707" width="30.912" height="18.155" fill="none" stroke="#010101" />
            <rect x="487.758" y="450.675" width="29.564" height="5.188" fill="none" stroke="#010101" />
            <rect x="565.949" y="691.507" width="25.963" height="17.636" fill="none" stroke="#010101" />
            <rect x="687.32" y="653.708" width="17.01" height="40.392" fill="none" stroke="#010101" />
            <rect x="644.789" y="684.767" width="17.004" height="17.634" fill="none" stroke="#010101" />
            <rect x="720.844" y="653.708" width="47.904" height="25.868" fill="none" stroke="#010101" />
            <polygon fill="none" stroke="#010101" points="447.82,473.495 428.112,505.654 482.95,508.766 521.641,491.13 471.161,494.242 468.322,471.419" />
            <polygon fill="none" stroke="#010101" points="578.312,722.627 605.928,750.635 730.885,743.895 652.973,718.995 609.879,700.323" />
            <path fill="none" stroke="#010101" d="M746.843,60.679c-2.465,1.232-7.395,2.465-13.711,2.465c-14.635,0-25.65-9.243-25.65-26.266 c0-16.252,11.016-27.268,27.113-27.268c6.471,0,10.553,1.387,12.324,2.311l-1.617,5.469c-2.542-1.232-6.162-2.157-10.476-2.157 c-12.17,0-20.258,7.78-20.258,21.414c0,12.709,7.317,20.874,19.95,20.874c4.082,0,8.241-0.848,10.938-2.157L746.843,60.679z" />
            <path fill="none" stroke="#010101" d="M755.008,7.685h6.778v54.688h-6.778V7.685z" />
            <path fill="none" stroke="#010101" d="M780.734,14.617c0.077,2.311-1.617,4.16-4.313,4.16c-2.388,0-4.082-1.849-4.082-4.16c0-2.388,1.771-4.236,4.236-4.236 C779.117,10.38,780.734,12.229,780.734,14.617z M773.187,62.373V25.092h6.777v37.281H773.187z" />
            <path fill="none" stroke="#010101" d="M817.784,60.986c-1.771,0.925-5.7,2.157-10.707,2.157c-11.246,0-18.563-7.626-18.563-19.026 c0-11.477,7.856-19.795,20.027-19.795c4.005,0,7.548,1.001,9.397,1.925l-1.541,5.238c-1.617-0.924-4.159-1.771-7.856-1.771 c-8.55,0-13.172,6.316-13.172,14.096c0,8.627,5.546,13.942,12.94,13.942c3.852,0,6.394-1.001,8.318-1.849L817.784,60.986z" />
            <path fill="none" stroke="#010101" d="M832.42,42.192h0.154c0.924-1.31,2.233-2.927,3.312-4.237l10.938-12.863h8.164L840.585,40.42l16.406,21.953h-8.241 l-12.864-17.87l-3.466,3.852v14.019h-6.701V7.685h6.701V42.192z" />
            <path fill="none" stroke="#010101" d="M885.107,16.157h-15.79v-5.7h38.437v5.7h-15.867v46.216h-6.779V16.157z" />
            <path fill="none" stroke="#010101" d="M912.762,7.685h6.778v23.262h0.154c1.078-1.926,2.772-3.62,4.853-4.775c2.002-1.156,4.391-1.926,6.932-1.926 c5.007,0,13.018,3.081,13.018,15.944v22.184h-6.778V40.96c0-6.008-2.233-11.092-8.627-11.092c-4.39,0-7.856,3.081-9.089,6.778 c-0.385,0.924-0.462,1.925-0.462,3.235v22.492h-6.778V7.685z" />
            <path fill="none" stroke="#010101" d="M963.062,14.617c0.077,2.311-1.618,4.16-4.313,4.16c-2.389,0-4.083-1.849-4.083-4.16c0-2.388,1.771-4.236,4.236-4.236 C961.443,10.38,963.062,12.229,963.062,14.617z M955.513,62.373V25.092h6.778v37.281H955.513z" />
            <path fill="none" stroke="#010101" d="M972.611,55.44c2.003,1.31,5.546,2.696,8.936,2.696c4.93,0,7.24-2.465,7.24-5.546c0-3.235-1.926-5.007-6.933-6.855 c-6.701-2.388-9.859-6.085-9.859-10.553c0-6.008,4.853-10.938,12.864-10.938c3.773,0,7.086,1.078,9.166,2.311l-1.695,4.93 c-1.463-0.924-4.159-2.157-7.625-2.157c-4.006,0-6.239,2.311-6.239,5.084c0,3.081,2.233,4.467,7.086,6.316 c6.471,2.465,9.782,5.7,9.782,11.246c0,6.547-5.083,11.169-13.941,11.169c-4.082,0-7.856-1.001-10.476-2.542L972.611,55.44z" />
            <polygon fill="none" stroke="#010101" points="676.149,23 616.756,23 616.756,1 558.443,34.667 616.756,68.333 616.756,46.333 676.149,46.333" />
            <rect width="511.822" height="339.235" fill="none" stroke="#010101" />
            </svg>
          </div>
        ) : (
          <MultiBinTester />
        )}

        <div id="bins" ref={binsRef} style={{ display: currentMode === 'single-bin' ? 'block' : 'none' }}></div>

        <input
          ref={fileInputRef}
          type="file"
          style={{ visibility: 'hidden' }}
          onChange={handleFileChange}
          accept=".svg,.xml,text/*"
        />
      </div>

      {message && (
        <div id="messagewrapper">
          <div id="message" className={messageClass} onClick={() => setMessageClass('')}>
            {message}
          </div>
        </div>
      )}
    </div>
  )
}

export default App