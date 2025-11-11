import { Modal, Button } from 'react-bootstrap'

function FAQModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <span style={{ color: '#3bb34a' }}>SVGnest</span> - Frequently Asked Questions
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="faq-content">
          <h5 className="text-primary">What exactly is "nesting"?</h5>
          <p>If you have some parts to cut out of a piece of metal/plastic/wood etc, you'd want to arrange the parts to use as little material as possible. This is a common problem if you use a laser cutter, plasma cutter, or CNC machine.</p>
          <p>In computer terms this is called the irregular bin-packing problem</p>

          <h5 className="text-primary mt-4">How much does it cost?</h5>
          <p>It's free and open source. The code and implementation details are on <a href="https://github.com/Jack000/SVGnest" target="_blank" rel="noopener noreferrer" className="text-success">Github</a></p>

          <h5 className="text-primary mt-4">Does it use inches? mm?</h5>
          <p>SVG has its internal units, the distance related fields in the settings use SVG units, ie. pixels. The conversion between a pixel and real units depend on the exporting software, but it's typically 72 pixels = 1 inch</p>

          <h5 className="text-primary mt-4">My SVG text/image doesn't show up?</h5>
          <p>Nesting only works for closed shapes, so SVG elements that don't represent closed shapes are removed. Convert text and any other elements to outlines first. Ensure that outlines do not intersect or overlap each other. Outlines that are inside other outlines are considered holes.</p>

          <h5 className="text-primary mt-4">It doesn't ever stop?</h5>
          <p>The software will continuously look for better solutions until you press the stop button. You can stop at any time and download the SVG file.</p>

          <h5 className="text-primary mt-4">Some parts seem to slightly overlap?</h5>
          <p>Curved shapes are approximated with line segments. For a more accurate nest with curved parts, decrease the curve tolerance parameter in the configuration.</p>

          <h5 className="text-primary mt-4">I need help?</h5>
          <p>Add an issue on Github or contact me personally: <a href="http://jack.works" target="_blank" rel="noopener noreferrer" className="text-success">jack.works</a></p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onHide}>
          Got it!
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default FAQModal