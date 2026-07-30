export type Direction = "up" | "right" | "down" | "left";

export type Connections = Record<Direction, boolean>;

export type HackGameId = "atm-bomb" | "fleeca-bypass" | "thermite-charge";

export type HackGameDefinition = {
  id: HackGameId;
  name: string;
  description: string;
  status: "available" | "coming-soon";
  prepTime: number;
  playTime: number;
  columns: number;
  rows: number;
};

export type HackTile = {
  index: number;
  row: number;
  column: number;
  solution: Connections;
  rotation: number;
};

export type HackRound = {
  gameId: HackGameId;
  tiles: HackTile[];
  columns: number;
  rows: number;
  sourceIndex: number;
  targetIndex: number;
  timeLimit: number;
};

export const hackGames: HackGameDefinition[] = [
  {
    id: "atm-bomb",
    name: "ATM Bomb Hack Practice",
    description: "Rig Explosive pipe-connection practice.",
    status: "available",
    prepTime: 4,
    playTime: 15,
    columns: 7,
    rows: 5,
  },
  {
    id: "fleeca-bypass",
    name: "Fleeca Vault Bypass",
    description: "A future vault-terminal practice game.",
    status: "coming-soon",
    prepTime: 0,
    playTime: 0,
    columns: 7,
    rows: 5,
  },
  {
    id: "thermite-charge",
    name: "Thermite Charge Practice",
    description: "A future thermite timing challenge.",
    status: "coming-soon",
    prepTime: 0,
    playTime: 0,
    columns: 8,
    rows: 6,
  },
];

const directions: Direction[] = ["up", "right", "down", "left"];
const offsets: Record<Direction, [number, number]> = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
};
const opposite: Record<Direction, Direction> = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

export function createHackRound(game: HackGameDefinition): HackRound {
  const total = game.columns * game.rows;
  const solutions = Array.from({ length: total }, () => emptyConnections());

  // The original minigame uses only two-sided straight and corner pieces.
  const path = createSnakePath(game.columns, game.rows);
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const direction = directionBetween(from, to, game.columns);
    solutions[from][direction] = true;
    solutions[to][opposite[direction]] = true;
  }

  // The source and finish each use an outside connection plus the board route.
  solutions[path[0]].left = true;
  solutions[path[path.length - 1]].right = true;

  const tiles = solutions.map((solution, index) => ({
    index,
    row: Math.floor(index / game.columns),
    column: index % game.columns,
    solution,
    rotation: index === path[0] || index === path[path.length - 1] ? 0 : randomRotation(),
  }));

  return {
    gameId: game.id,
    tiles,
    columns: game.columns,
    rows: game.rows,
    sourceIndex: 0,
    targetIndex: total - 1,
    timeLimit: game.playTime,
  };
}

export function getTileConnections(tile: HackTile): Connections {
  let connections = { ...tile.solution };
  for (let count = 0; count < tile.rotation; count += 1) {
    connections = {
      up: connections.left,
      right: connections.up,
      down: connections.right,
      left: connections.down,
    };
  }
  return connections;
}

export function rotateTile(tile: HackTile): HackTile {
  return { ...tile, rotation: (tile.rotation + 1) % 4 };
}

export function getConnectedTiles(round: HackRound): Set<number> {
  const connected = new Set<number>([round.sourceIndex]);
  const pending = [round.sourceIndex];

  while (pending.length > 0) {
    const index = pending.shift()!;
    const tile = round.tiles[index];
    const connections = getTileConnections(tile);

    for (const direction of directions) {
      if (!connections[direction]) continue;
      const [rowOffset, columnOffset] = offsets[direction];
      const row = tile.row + rowOffset;
      const column = tile.column + columnOffset;
      if (row < 0 || row >= round.rows || column < 0 || column >= round.columns) continue;

      const neighbourIndex = row * round.columns + column;
      if (connected.has(neighbourIndex)) continue;
      const neighbour = getTileConnections(round.tiles[neighbourIndex]);
      if (!neighbour[opposite[direction]]) continue;

      connected.add(neighbourIndex);
      pending.push(neighbourIndex);
    }
  }

  return connected;
}

export function isRoundSolved(round: HackRound): boolean {
  return getConnectedTiles(round).has(round.targetIndex);
}

function createSnakePath(columns: number, rows: number) {
  const path: number[] = [];
  for (let row = 0; row < rows; row += 1) {
    if (row % 2 === 0) {
      for (let column = 0; column < columns; column += 1) path.push(row * columns + column);
    } else {
      for (let column = columns - 1; column >= 0; column -= 1) path.push(row * columns + column);
    }
  }
  return path;
}

function directionBetween(from: number, to: number, columns: number): Direction {
  const fromRow = Math.floor(from / columns);
  const fromColumn = from % columns;
  const toRow = Math.floor(to / columns);
  const toColumn = to % columns;
  if (toRow < fromRow) return "up";
  if (toRow > fromRow) return "down";
  return toColumn > fromColumn ? "right" : "left";
}

function emptyConnections(): Connections {
  return { up: false, right: false, down: false, left: false };
}

function randomRotation() {
  return Math.floor(Math.random() * 4);
}
