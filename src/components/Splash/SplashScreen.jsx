import FAQModal from './FAQModal'

function SplashScreen({ 
  faqVisible, 
  setFaqVisible, 
  onDemo, 
  onUpload 
}) {
  return (
    <div id="splash">
      <img src="/img/logo.svg" alt="SVGnest" className="logo" />
      <h1 className="title">SVGnest</h1>
      <em className="subscript">Open Source nesting</em>

      <ul className="nav">
        <li className="button start" onClick={onDemo}>Demo</li>
        <li className="button upload" onClick={onUpload}>Upload SVG</li>
        <li className="button code">
          <a href="https://github.com/Jack000/SVGnest" target="_blank" rel="noopener noreferrer">Github</a>
        </li>
        <li className="button" onClick={() => setFaqVisible(true)}>
          FAQ ❓
        </li>
      </ul>

      <FAQModal 
        show={faqVisible} 
        onHide={() => setFaqVisible(false)} 
      />
    </div>
  )
}

export default SplashScreen