export type Direction = "up" | "right" | "down" | "left";

export type Connections = Record<Direction, boolean>;

export type HackGameId = "atm-bomb" | "store-cash" | "thermite-charge";

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
    columns: 8,
    rows: 4,
  },
  {
    id: "store-cash",
    name: "Store Cash Register",
    description: "Two-cycle register lock practice based on Store Robbery.",
    status: "available",
    prepTime: 0,
    playTime: 15,
    columns: 0,
    rows: 0,
  },
  {
    id: "thermite-charge",
    name: "Flapper-Hero (ATM)",
    description: "A future ATM flapper timing challenge.",
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
  const start = 0;
  const target = total - 1;
  const solutions = Array.from({ length: total }, () => emptyConnections());

  // The original minigame uses only two-sided straight and corner pieces.
  const path = createRoutePath(game.columns, game.rows, start, target);
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const direction = directionBetween(from, to, game.columns);
    solutions[from][direction] = true;
    solutions[to][opposite[direction]] = true;
  }

  // The game always uses these fixed endpoint shapes.
  solutions[path[0]] = { up: false, right: true, down: true, left: false };
  solutions[path[path.length - 1]] = { up: true, right: false, down: false, left: true };

  const routeTiles = new Set(path);
  solutions.forEach((solution, index) => {
    if (!routeTiles.has(index)) Object.assign(solution, createDecoyConnections());
  });

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
    sourceIndex: start,
    targetIndex: target,
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

function createRoutePath(columns: number, rows: number, start: number, target: number) {
  const total = columns * rows;
  const startRow = Math.floor(start / columns);
  const startColumn = start % columns;
  const targetRow = Math.floor(target / columns);
  const targetColumn = target % columns;
  const directLength = Math.abs(targetRow - startRow) + Math.abs(targetColumn - startColumn) + 1;
  const minimumLength = Math.min(total, directLength + Math.floor(Math.random() * 7));
  const maximumLength = Math.max(minimumLength + 1, Math.floor(total * 0.8));

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const path = [start];
    const visited = new Set(path);
    if (searchRoute(path, visited, target, columns, rows, minimumLength, maximumLength)) return path;
  }

  return createFallbackRoute(columns, start, target);
}

function searchRoute(
  path: number[],
  visited: Set<number>,
  target: number,
  columns: number,
  rows: number,
  minimumLength: number,
  maximumLength: number,
) {
  if (path[path.length - 1] === target) return path.length >= minimumLength;
  if (path.length >= maximumLength) return false;

  const current = path[path.length - 1];
  const candidates = getNeighbours(current, columns, rows)
    .filter((index) => {
      if (visited.has(index)) return false;
      if (path.length === 1 && !isStartMove(current, index, columns)) return false;
      if (index !== target) return true;
      return path.length + 1 >= minimumLength && isTargetEntry(current, target, columns);
    })
    .sort((left, right) => {
      const leftOptions = getNeighbours(left, columns, rows).filter((index) => !visited.has(index)).length;
      const rightOptions = getNeighbours(right, columns, rows).filter((index) => !visited.has(index)).length;
      return leftOptions - rightOptions || Math.random() - 0.5;
    });

  for (const next of candidates) {
    path.push(next);
    visited.add(next);
    if (searchRoute(path, visited, target, columns, rows, minimumLength, maximumLength)) return true;
    visited.delete(next);
    path.pop();
  }
  return false;
}

function getNeighbours(index: number, columns: number, rows: number) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  return shuffle(directions).flatMap((direction) => {
    const [rowOffset, columnOffset] = offsets[direction];
    const nextRow = row + rowOffset;
    const nextColumn = column + columnOffset;
    return nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns
      ? [nextRow * columns + nextColumn]
      : [];
  });
}

function createFallbackRoute(columns: number, start: number, target: number) {
  const startRow = Math.floor(start / columns);
  const startColumn = start % columns;
  const targetRow = Math.floor(target / columns);
  const targetColumn = target % columns;
  const path: number[] = [];
  for (let column = startColumn; column <= targetColumn; column += 1) {
    path.push(startRow * columns + column);
  }
  for (let row = startRow + 1; row <= targetRow; row += 1) {
    path.push(row * columns + targetColumn);
  }
  return path;
}

function isStartMove(from: number, to: number, columns: number) {
  const fromRow = Math.floor(from / columns);
  const fromColumn = from % columns;
  const toRow = Math.floor(to / columns);
  const toColumn = to % columns;
  return (toRow === fromRow && toColumn === fromColumn + 1) || (toColumn === fromColumn && toRow === fromRow + 1);
}

function isTargetEntry(from: number, target: number, columns: number) {
  const fromRow = Math.floor(from / columns);
  const fromColumn = from % columns;
  const targetRow = Math.floor(target / columns);
  const targetColumn = target % columns;
  return (fromRow === targetRow && fromColumn === targetColumn - 1) ||
    (fromColumn === targetColumn && fromRow === targetRow - 1);
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

function createDecoyConnections(): Connections {
  const shapes: Connections[] = [
    { up: true, right: false, down: true, left: false },
    { up: false, right: true, down: false, left: true },
    { up: true, right: true, down: false, left: false },
    { up: false, right: true, down: true, left: false },
    { up: false, right: false, down: true, left: true },
    { up: true, right: false, down: false, left: true },
  ];
  return { ...shapes[Math.floor(Math.random() * shapes.length)] };
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
