"use client";
import { useEffect, useRef, useState } from 'react';
import Canvas from './CanvasGrid';
import { Game, Robot, Tile } from '../model/Game'; // Import your game model
import useInterval from '../hooks/useInterval';

const GamePage = () => {
  const [gameState, setGame] = useState<{game:Game}>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const game = new Game(20, 20)
    const robot = new Robot(10, 10);
    game.addRobot(robot);
    robot.think = function(surroundings: Tile[][]) {
      const width = surroundings.length;
      const height = surroundings[0].length;
      const currentTile = surroundings[(width-1) / 2][(height-1) / 2]
      // mine current location
      if (currentTile.resource > 0) {
        return { type: 'mine' };
      }
      return { type: 'move', dx: 1, dy: 0 };
    }

    setGame({game});
  }, []);

  useInterval(() => {
    const game = gameState?.game;
    if (!game) return;
    game.tick();
    setGame({ game });
  }, 300);

  const game = gameState?.game;
  if (!game) return;

  return (
    <div>
      <Canvas
        game={game}
        cellSize={50}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
        onRobotClick={robot => console.log(robot)}/>
      {/* Here you could add controls for the scale and offset */}
    </div>
  );
};

export default GamePage;
