import { Button, ButtonGroup } from 'react-bootstrap'
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

      <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
        <Button 
          variant="outline-success" 
          size="lg" 
          onClick={onDemo}
          className="splash-button"
        >
          ▶ Demo
        </Button>
        
        <Button 
          variant="outline-success" 
          size="lg" 
          onClick={onUpload}
          className="splash-button"
        >
          📁 Upload SVG
        </Button>
        
        <Button 
          variant="outline-success" 
          size="lg" 
          href="https://github.com/Jack000/SVGnest" 
          target="_blank" 
          rel="noopener noreferrer"
          className="splash-button"
        >
          🔗 Github
        </Button>
        
        <Button 
          variant="outline-success" 
          size="lg" 
          onClick={() => setFaqVisible(true)}
          className="splash-button"
        >
          ❓ FAQ
        </Button>
      </div>

      <FAQModal 
        show={faqVisible} 
        onHide={() => setFaqVisible(false)} 
      />
    </div>
  )
}

export default SplashScreen