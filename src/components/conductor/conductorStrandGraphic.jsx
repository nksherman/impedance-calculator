import React from 'react';
import { Stage, Layer, Circle } from 'react-konva';

// Props: strands: Array of ConductorStrandIndividual, size: number (optional, default 200)
function ConductorStrandGraphic({ strands, size = 100 })  {
  const maxR = Math.max(...strands.map(s => s.r + s.radius));

  const center = size / 2;
  let scale = 4000;

  if (maxR * scale > (center-15)) {
    scale = (center - 10) / maxR;
  }

  return (
    <Stage width={size} height={size}>
      <Layer>
        {strands.map((strand, i) => {
          const x = center + strand.r * Math.cos(strand.theta) * scale;
          const y = center + strand.r * Math.sin(strand.theta) * scale;
          return (
            <Circle
              key={i}
              x={x}
              y={y}
              radius={strand.radius * scale}
              fill="#6fa8dc"
              stroke="#274e75"
              strokeWidth={1}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default ConductorStrandGraphic;
