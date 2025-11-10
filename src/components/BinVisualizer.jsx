function BinVisualizer({ bin, index }) {
  const { width, height, shapes } = bin

  // Calculate utilization
  const binArea = width * height
  const usedArea = shapes.reduce((sum, shape) => sum + (shape.area || 0), 0)
  const utilization = binArea > 0 ? ((usedArea / binArea) * 100).toFixed(1) : 0

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
          if (shape.type === 'rect') {
            return (
              <rect
                key={shapeIndex}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={getColor(shapeIndex)}
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
                fill={getColor(shapeIndex)}
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
                fill={getColor(shapeIndex)}
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
        <div><strong>Utilization:</strong> {utilization}%</div>
        <div><strong>Used Area:</strong> {Math.round(usedArea)} px²</div>
        <div><strong>Total Area:</strong> {binArea} px²</div>
      </div>
    </div>
  )
}

export default BinVisualizer