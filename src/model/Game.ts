// Define the main Game Class
export class Game {
  grid: Array<Array<Tile>>;
  robots: Array<Robot>;

  constructor(width: number, height: number) {
    this.grid = Array(height).fill(0).map(() => {
      return Array(width).fill(0).map(() => {
        return new Tile(Math.floor(Math.random() * 100));
      });
    });
    this.robots = [];
  }

  addRobot(robot: Robot) {
    this.robots.push(robot);
  }

  tick() {
    for (const robot of this.robots) {
      if (!robot.think) continue;
      const surrounding = this.getSurroundingTiles(robot);
      const task = robot.think(surrounding);
      if (task.type === 'move') {
        const speedValid = Math.abs(task.dx) + Math.abs(task.dy) <= robot.speed;
        if (!speedValid) {
          throw new Error('Robot cannot move that fast');
        }
        const xValid = robot.x + task.dx >= 0 && robot.x + task.dx < this.grid[0].length;
        const yValid = robot.y + task.dy >= 0 && robot.y + task.dy < this.grid.length;
        if (!xValid || !yValid) {
          throw new Error('Robot cannot move outside the grid');
        }
        // move the robot
        robot.x += task.dx;
        robot.y += task.dy;
      } else if (task.type === 'mine') {
        // Mine the resources
        const tile = this.grid[robot.y][robot.x];
        // Mining rate
        const amount = Math.min(tile.resource, 10);
        tile.resource -= amount;
        robot.carrying += amount;
      }
    };
  }

  getSurroundingTiles(robot: Robot) {
    const tiles: Tile[][] = [];
    for (let dy = -robot.sensorStrength; dy <= robot.sensorStrength; dy++) {
      const row: Tile[] = [];
      for (let dx = -robot.sensorStrength; dx <= robot.sensorStrength; dx++) {
        const x = robot.x + dx;
        const y = robot.y + dy;
        if (x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length) {
          row.push(this.grid[y][x]);
        } else {
          row.push(new Tile()); // Empty tile for out-of-bound positions
        }
      }
      tiles.push(row);
    }
    return tiles;
  }
}

// Define the Tile Class
export class Tile {
  resource: number;
  constructor (resource: number = 0) {
    this.resource = resource;
  }
}

// Define the Robot Class
export class Robot {
  x: number;
  y: number;
  speed: number;
  carrying: number;
  sensorStrength: number = 1;
  think?: (tiles: Tile[][]) => Task;
  _thinkCode?: string;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.speed = 1;
    this.carrying = 0;
  }

  set thinkCode(code: string) {
    const formattedCode = `(function() { return ${code}; })()`;
    // eslint-disable-next-line no-new-func
    const newThink = eval(formattedCode) as any;
    console.log(newThink);
    this._thinkCode = code;
    this.think = newThink;
  }

  get thinkCode() {
    return this._thinkCode;
  }
}

// Define the Task interface
interface Task {
  type: 'move' | 'mine';
  dx?: number;
  dy?: number;
}
