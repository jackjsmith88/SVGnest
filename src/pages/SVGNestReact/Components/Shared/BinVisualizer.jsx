function BinVisualizer({ bin, index }) {
  const { width, height, shapes } = bin

  // Calculate utilization with CutShape awareness
  const binArea = width * height
  const usedArea = shapes.reduce((sum, shape) => sum + (shape.area || 0), 0)
  const usedBoundingArea = shapes.reduce((sum, shape) => sum + (shape.boundingArea || shape.area || 0), 0)
  const utilization = binArea > 0 ? ((usedBoundingArea / binArea) * 100).toFixed(1) : 0
  
  // Calculate material efficiency (actual material used vs bounding box)
  const materialEfficiency = shapes.length > 0 
    ? ((usedArea / usedBoundingArea) * 100).toFixed(1) 
    : 100

  // Generate random colors for shapes
  const getColor = (index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B88B', '#A8E6CF', '#FFD3B6', '#FFAAA5'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="bin-item">
      <h3>Bin {index + 1}</h3>

      <svg
        className="bin-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ border: '1px solid #ddd', background: 'white' }}
      >
        {/* Bin outline */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="none"
          stroke="#999"
          strokeWidth="2"
        />

        {/* Render shapes */}
        {shapes.map((shape, shapeIndex) => {
          const color = getColor(shapeIndex)
          
          if (shape.type === 'dimensionshape' && shape.dimensionShape) {
            // Render DimensionShape using its SVG elements
            const svgElements = shape.dimensionShape.getSVGElements(shape.x || 0, shape.y || 0)
            const cavityElements = shape.dimensionShape.getCavityElements(shape.x || 0, shape.y || 0)
            
            return (
              <g key={shapeIndex}>
                {/* Render main shape elements */}
                {svgElements.map((element, elementIndex) => (
                  <rect
                    key={`element-${elementIndex}`}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={color}
                    fillOpacity="0.7"
                    stroke={color}
                    strokeWidth="1"
                  />
                ))}
                
                {/* Don't render cavities - they make L-shapes look confusing */}
                
                {/* Shape label showing type and efficiency */}
                <text
                  x={(shape.x || 0) + shape.dimensionShape.boundingBox.width / 2}
                  y={(shape.y || 0) + shape.dimensionShape.boundingBox.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#333"
                  fontWeight="bold"
                >
                  {shape.dimensionShape.type === 'L_SHAPE' ? 'L' : 'R'}
                </text>
                <text
                  x={(shape.x || 0) + shape.dimensionShape.boundingBox.width / 2}
                  y={(shape.y || 0) + shape.dimensionShape.boundingBox.height / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="#666"
                >
                  {Math.round(shape.efficiency * 100)}%
                </text>
              </g>
            )
          } else if (shape.type === 'rect') {
            return (
              <rect
                key={shapeIndex}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={color}
                fillOpacity="0.7"
                stroke="#333"
                strokeWidth="1"
              />
            )
          } else if (shape.type === 'circle') {
            return (
              <circle
                key={shapeIndex}
                cx={shape.x + shape.radius}
                cy={shape.y + shape.radius}
                r={shape.radius}
                fill={color}
                fillOpacity="0.7"
                stroke="#333"
                strokeWidth="1"
              />
            )
          } else if (shape.type === 'polygon' && shape.points) {
            return (
              <polygon
                key={shapeIndex}
                points={shape.points}
                fill={color}
                fillOpacity="0.7"
                stroke="#333"
                strokeWidth="1"
              />
            )
          }
          return null
        })}
      </svg>

      <div className="stats">
        <div><strong>Shapes:</strong> {shapes.length}</div>
        <div><strong>Bin Utilization:</strong> {utilization}%</div>
        <div><strong>Material Efficiency:</strong> {materialEfficiency}%</div>
        <div><strong>Actual Area:</strong> {Math.round(usedArea)} px²</div>
        <div><strong>Bounding Area:</strong> {Math.round(usedBoundingArea)} px²</div>
        <div><strong>Bin Area:</strong> {binArea} px²</div>
        <div className="shape-breakdown">
          <small>
            {shapes.map(shape => shape.dimensionShape?.type || 'Unknown').join(', ')}
          </small>
        </div>
      </div>
    </div>
  )
}

export default BinVisualizer