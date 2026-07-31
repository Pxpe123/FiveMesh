export type WorldCoordinate = { x: number; y: number; z: number };
export type MapPoint = { x: number; y: number };

export type DrivingRoute = {
  points: MapPoint[];
  distance: number;
  estimatedSeconds: number;
};

export const WORLD_BOUNDS = {
  minX: -4000,
  maxX: 4000,
  minY: -4000,
  maxY: 8000,
};

type RoadNode = MapPoint & { id: string };

const roadNodes: RoadNode[] = [
  { id: "a", x: 0.23, y: 0.12 },
  { id: "b", x: 0.39, y: 0.12 },
  { id: "c", x: 0.59, y: 0.12 },
  { id: "d", x: 0.72, y: 0.12 },
  { id: "e", x: 0.12, y: 0.32 },
  { id: "f", x: 0.23, y: 0.32 },
  { id: "g", x: 0.39, y: 0.32 },
  { id: "h", x: 0.59, y: 0.32 },
  { id: "i", x: 0.72, y: 0.32 },
  { id: "j", x: 0.86, y: 0.32 },
  { id: "k", x: 0.13, y: 0.6 },
  { id: "l", x: 0.23, y: 0.6 },
  { id: "m", x: 0.39, y: 0.6 },
  { id: "n", x: 0.59, y: 0.6 },
  { id: "o", x: 0.72, y: 0.6 },
  { id: "p", x: 0.85, y: 0.6 },
  { id: "q", x: 0.2, y: 0.84 },
  { id: "r", x: 0.33, y: 0.84 },
  { id: "s", x: 0.48, y: 0.84 },
  { id: "t", x: 0.62, y: 0.84 },
  { id: "u", x: 0.76, y: 0.84 },
];

const roadEdges: Array<[string, string]> = [
  ["a", "b"], ["b", "c"], ["c", "d"],
  ["e", "f"], ["f", "g"], ["g", "h"], ["h", "i"], ["i", "j"],
  ["k", "l"], ["l", "m"], ["m", "n"], ["n", "o"], ["o", "p"],
  ["q", "r"], ["r", "s"], ["s", "t"], ["t", "u"],
  ["a", "f"], ["f", "l"], ["l", "q"],
  ["b", "g"], ["g", "m"], ["m", "r"],
  ["c", "h"], ["h", "n"], ["n", "s"],
  ["d", "i"], ["i", "o"], ["o", "u"],
  ["e", "a"], ["j", "d"], ["k", "q"], ["p", "u"],
];

const nodesById = new Map(roadNodes.map((node) => [node.id, node]));
const adjacency = createAdjacency();

export const roadSegments = roadEdges.map(([fromId, toId]) => ({
  from: nodesById.get(fromId)!,
  to: nodesById.get(toId)!,
}));

export function findDrivingRoute(
  start: WorldCoordinate,
  destination: WorldCoordinate,
): DrivingRoute {
  const startPoint = worldToMapPoint(start);
  const destinationPoint = worldToMapPoint(destination);
  const startNode = findClosestNode(startPoint);
  const destinationNode = findClosestNode(destinationPoint);
  const nodePath = findShortestNodePath(startNode.id, destinationNode.id);
  const points = [startPoint, ...nodePath, destinationPoint];
  const distance = getPathDistance(points);

  return {
    points,
    distance,
    estimatedSeconds: distance / 16.67,
  };
}

export function worldToMapPoint(coordinate: WorldCoordinate): MapPoint {
  return {
    x: clamp((coordinate.x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)),
    y: clamp((WORLD_BOUNDS.maxY - coordinate.y) / (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY)),
  };
}

function createAdjacency() {
  const result = new Map<string, string[]>();
  for (const node of roadNodes) result.set(node.id, []);
  for (const [from, to] of roadEdges) {
    result.get(from)!.push(to);
    result.get(to)!.push(from);
  }
  return result;
}

function findClosestNode(point: MapPoint) {
  return roadNodes.reduce((closest, node) =>
    pointDistance(point, node) < pointDistance(point, closest) ? node : closest,
  );
}

function findShortestNodePath(startId: string, destinationId: string) {
  const distances = new Map(roadNodes.map((node) => [node.id, Number.POSITIVE_INFINITY]));
  const previous = new Map<string, string>();
  const unvisited = new Set(roadNodes.map((node) => node.id));
  distances.set(startId, 0);

  while (unvisited.size > 0) {
    const currentId = [...unvisited].reduce((closest, id) =>
      distances.get(id)! < distances.get(closest)! ? id : closest,
    );
    if (currentId === destinationId) break;
    unvisited.delete(currentId);

    const current = nodesById.get(currentId)!;
    for (const neighbourId of adjacency.get(currentId) ?? []) {
      if (!unvisited.has(neighbourId)) continue;
      const neighbour = nodesById.get(neighbourId)!;
      const candidate = distances.get(currentId)! + worldDistance(current, neighbour);
      if (candidate < distances.get(neighbourId)!) {
        distances.set(neighbourId, candidate);
        previous.set(neighbourId, currentId);
      }
    }
  }

  const path: MapPoint[] = [];
  let currentId: string | undefined = destinationId;
  while (currentId) {
    const node = nodesById.get(currentId);
    if (node) path.unshift({ x: node.x, y: node.y });
    if (currentId === startId) break;
    currentId = previous.get(currentId);
  }
  return path;
}

function getPathDistance(points: MapPoint[]) {
  let distance = 0;
  for (let index = 1; index < points.length; index += 1) {
    distance += worldDistance(points[index - 1], points[index]);
  }
  return distance;
}

function pointDistance(left: MapPoint, right: MapPoint) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function worldDistance(left: MapPoint, right: MapPoint) {
  const x = (right.x - left.x) * (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX);
  const y = (right.y - left.y) * (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY);
  return Math.hypot(x, y);
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
