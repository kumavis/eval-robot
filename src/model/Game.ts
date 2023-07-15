
// Define the Tile Class
export class Tile {
  resource: number;
  constructor (resource: number = 0) {
    this.resource = resource;
  }
}

export class Board {
  tiles: Array<Array<Tile>> = [];
  width: number;
  height: number;
  constructor (width: number, height: number) {
    this.width = width;
    this.height = height;
    this.fill((_x, _y) => {
      return new Tile(Math.floor(Math.random() * 100));
    });
  }
  getSegment (x: number, y: number, width: number, height: number) {
    const tiles: Array<Array<Tile>> = [];
    for (let dy = 0; dy < height; dy++) {
      const row: Array<Tile> = [];
      for (let dx = 0; dx < width; dx++) {
        const x2 = x + dx;
        const y2 = y + dy;
        if (x2 >= 0 && x2 < this.width && y2 >= 0 && y2 < this.height) {
          row.push(this.tiles[y2][x2]);
        } else {
          // Empty tile for out-of-bound positions
          row.push(new Tile());
        }
      }
      tiles.push(row);
    }
    const segmentBoard = new Board(width, height);
    segmentBoard.tiles = tiles;
    return segmentBoard;
  }
  getSurroundingSegment (x: number, y: number, distance: number) {
    return this.getSegment(x - distance, y - distance, distance * 2 + 1, distance * 2 + 1);
  }
  fill (visitorFn: (x: number, y: number) => Tile) {
    this.tiles = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = visitorFn(x, y);
      }
    }
  }
  getCenterTile () {
    return this.tiles[Math.floor(this.height / 2)][Math.floor(this.width / 2)];
  }
  *getTiles (): Generator<[Tile, number, number]> {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        yield [tile, x, y];
      }
    }
  }
  map<ReturnType> (visitorFn: (tile: Tile, x: number, y: number) => ReturnType) {
    return [...this.getTiles()].map(([tile, x, y]) => {
      return visitorFn(tile, x, y);
    });
  }
}

// Define the main Game Class
export class Game {
  board: Board;
  robots: Array<Robot>;

  constructor(width: number, height: number) {
    this.board = new Board(width, height);
    this.robots = [];
  }

  addRobot(robot: Robot) {
    this.robots.push(robot);
  }

  tick() {
    for (const robot of this.robots) {
      if (!robot.think) continue;
      const surroundingBoard = this.board.getSurroundingSegment(robot.x, robot.y, robot.sensorStrength);
      const task = robot.think(surroundingBoard);
      if (task.type === 'move') {
        if (typeof task.dx !== 'number' || typeof task.dy !== 'number') {
          throw new Error('Robot must specify dx and dy to move');
        }
        const speedValid = Math.abs(task.dx) + Math.abs(task.dy) <= robot.speed;
        if (!speedValid) {
          throw new Error('Robot cannot move that fast');
        }
        const xValid = robot.x + task.dx >= 0 && robot.x + task.dx < this.board.width;
        const yValid = robot.y + task.dy >= 0 && robot.y + task.dy < this.board.height;
        if (!xValid || !yValid) {
          throw new Error('Robot cannot move outside the grid');
        }
        // move the robot
        robot.x += task.dx;
        robot.y += task.dy;
      } else if (task.type === 'mine') {
        // Mine the resources
        const tile = this.board.tiles[robot.y][robot.x];
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
        if (x >= 0 && x < this.board.width && y >= 0 && y < this.board.height) {
          row.push(this.board.tiles[y][x]);
        } else {
          row.push(new Tile()); // Empty tile for out-of-bound positions
        }
      }
      tiles.push(row);
    }
    return tiles;
  }
}

// Define the Robot Class
export class Robot {
  x: number;
  y: number;
  speed: number;
  carrying: number;
  sensorStrength: number = 1;
  think?: (tiles: Board) => Task;
  _thinkCode: string = '';

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
