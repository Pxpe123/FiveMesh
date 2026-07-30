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
  const edges = createSpanningTree(game.columns, game.rows);
  const solutions = Array.from({ length: total }, () => emptyConnections());

  for (const [from, to, direction] of edges) {
    solutions[from][direction] = true;
    solutions[to][opposite[direction]] = true;
  }

  const tiles = solutions.map((solution, index) => ({
    index,
    row: Math.floor(index / game.columns),
    column: index % game.columns,
    solution,
    rotation: randomRotation(),
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

function createSpanningTree(columns: number, rows: number): Array<[number, number, Direction]> {
  const total = columns * rows;
  const visited = new Set<number>([0]);
  const edges: Array<[number, number, Direction]> = [];
  const stack = [0];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const row = Math.floor(current / columns);
    const column = current % columns;
    const candidates = shuffle(directions).flatMap((direction) => {
      const [rowOffset, columnOffset] = offsets[direction];
      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (nextRow < 0 || nextRow >= rows || nextColumn < 0 || nextColumn >= columns) return [];
      const next = nextRow * columns + nextColumn;
      return visited.has(next) ? [] : [[next, direction] as [number, Direction]];
    });

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const [next, direction] = candidates[0];
    visited.add(next);
    edges.push([current, next, direction]);
    stack.push(next);
  }

  return edges.length === total - 1 ? edges : createSpanningTree(columns, rows);
}

function emptyConnections(): Connections {
  return { up: false, right: false, down: false, left: false };
}

function randomRotation() {
  return Math.floor(Math.random() * 4);
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
