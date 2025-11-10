// Demo: Understanding Shape Generation
// This shows what createSimpleShapes actually produces

import { createSimpleShapes } from '../utils/multiBinNesting'

function ShapeGenerationDemo() {
  // Generate 5 test shapes for a 400x300 bin
  const shapes = createSimpleShapes(5, 400, 300)

  console.log('Generated shapes:', shapes)
  
  // Example output might look like:
  /*
  [
    {
      id: "shape-2",
      type: "rect", 
      width: 85.6,
      height: 73.2,
      area: 6266.592
    },
    {
      id: "shape-0",
      type: "circle",
      radius: 28.4,
      area: 2537.45
    },
    {
      id: "shape-1", 
      type: "rect",
      width: 45.2,
      height: 52.1, 
      area: 2355.32
    },
    // ... more shapes, sorted by area (largest first)
  ]
  */

  return (
    <div>
      <h3>Shape Generation Analysis</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {shapes.map((shape, index) => (
          <div key={shape.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h4>Shape {index + 1} (ID: {shape.id})</h4>
            <p><strong>Type:</strong> {shape.type}</p>
            {shape.type === 'rect' ? (
              <>
                <p><strong>Width:</strong> {shape.width.toFixed(1)}px</p>
                <p><strong>Height:</strong> {shape.height.toFixed(1)}px</p>
              </>
            ) : (
              <p><strong>Radius:</strong> {shape.radius.toFixed(1)}px</p>
            )}
            <p><strong>Area:</strong> {shape.area.toFixed(1)} px²</p>
            <p><strong>Sort Order:</strong> #{index + 1} (by area)</p>
            
            {/* Visual representation */}
            <svg width="150" height="100" style={{ border: '1px solid #eee' }}>
              {shape.type === 'rect' ? (
                <rect 
                  x="10" 
                  y="10" 
                  width={Math.min(shape.width * 0.5, 130)} 
                  height={Math.min(shape.height * 0.5, 80)}
                  fill={`hsl(${index * 60}, 70%, 70%)`}
                  stroke="#333"
                />
              ) : (
                <circle 
                  cx="75" 
                  cy="50" 
                  r={Math.min(shape.radius * 0.5, 30)}
                  fill={`hsl(${index * 60}, 70%, 70%)`}
                  stroke="#333"
                />
              )}
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ShapeGenerationDemo