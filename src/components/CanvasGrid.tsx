import { Stage, Layer, Rect } from 'react-konva';
import { useEffect, useState, useRef } from 'react';
import { Game, Robot } from '../model/Game';

interface CanvasProps {
  game: Game;
  cellSize: number;
  onRobotClick: (robot: Robot) => void;
}

const Canvas = ({ game, cellSize, onRobotClick }: CanvasProps) => {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointerPosition = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointerPosition.x - stage.x()) / oldScale,
      y: (pointerPosition.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointerPosition.x - mousePointTo.x * newScale,
      y: pointerPosition.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  // function to calculate color based on resource amount
  const getColor = (resourceAmount: number) => {
    const maxResource = 100; // maximum resource amount
    const intensity = Math.min(resourceAmount / maxResource, 1); // clamp between 0 and 1
    const colorValue = 255 - Math.round(intensity * 255); 
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  }
  
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      ref={stageRef}
      onWheel={handleWheel}
      draggable>
      <Layer>
        {game.board.map((tile, x, y) => (
          <Rect
            key={`${x},${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={getColor(tile.resource)}
            stroke="black" />
        ))}
        {game.robots.map((robot, i) => (
          <Rect
            key={i}
            x={robot.x * cellSize}
            y={robot.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="blue"
            onClick={() => onRobotClick(robot)}
            />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
