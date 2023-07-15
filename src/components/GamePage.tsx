"use client";
import { useEffect, useRef, useState } from 'react';
import Canvas from './CanvasGrid';
import Editor from './Editor';
import { Game, Robot, Tile } from '../model/Game'; // Import your game model
import useInterval from '../hooks/useInterval';

const GamePage = () => {
  const [gameState, setGame] = useState<{game:Game} | null>(null);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  
  useEffect(() => {
    const game = new Game(20, 20)
    const robot = new Robot(10, 10);
    game.addRobot(robot);
    robot.thinkCode = 
`function(surroundings) {
  const width = surroundings.length;
  const height = surroundings[0].length;
  const currentTile = surroundings[(width-1) / 2][(height-1) / 2]
  // mine current location
  if (currentTile.resource > 0) {
    return { type: 'mine' };
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
}`
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
