"use client";
import { useEffect, useRef, useState } from 'react';
import Canvas from './CanvasGrid';
import Editor from './Editor';
import { Game, Robot, Tile } from '../model/Game';
import useInterval from '../hooks/useInterval';

const GamePage = () => {
  const [gameState, setGame] = useState<{game:Game} | null>(null);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  
  useEffect(() => {
    const game = new Game(100, 100)
    const robot = new Robot(10, 10);
    game.addRobot(robot);
    robot.thinkCode = 
    // @ts-expect-error
(function(surroundings, robot) {
  const currentTile = surroundings.getCenterTile();
  // multiply
  if (robot.carrying > 100) {
    return { type: 'multiply' };
  }
  // mine current location
  if (currentTile.resource > 0) {
    return { type: 'mine' };
  }
  // move towards nearby resource
  let bestTile = { x: 0, y: 0, resource: 0 };
  for (const [tile, x, y] of surroundings.getTiles()) {
    if (tile.resource > bestTile.resource) {
      bestTile = { x, y, resource: tile.resource };
    }
  }
  if (bestTile.resource > 0) {
    const midX = Math.floor(surroundings.width / 2);
    const midY = Math.floor(surroundings.height / 2);
    const x = bestTile.x - midX;
    const y = bestTile.y - midY;
    if (Math.abs(x) > 0 && Math.abs(y) > 0) {
      if (Math.random() > 0.5) {
        return { type: 'move', dx: x, dy: 0 };
      } else {
        return { type: 'move', dx: 0, dy: y };
      }
    } else {
      return { type: 'move', dx: x, dy: y };
    }
  }
  // move random
  let dx = 0;
  let dy = 0;
  const moveX = Math.random() > 0.5;
  const moveDirection = Math.random() > 0.5 ? 1 : -1;
  if (moveX) {
    dx = moveDirection;
  } else {
    dy = moveDirection;
  }
  return { type: 'move', dx, dy };
}).toString();
    setSelectedRobot(robot);
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
      <Editor selectedRobot={selectedRobot} />
      <Canvas
        game={game}
        cellSize={50}
        onRobotClick={robot => setSelectedRobot(robot)}/>
    </div>
  );
};

export default GamePage;
