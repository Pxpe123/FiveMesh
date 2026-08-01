export const SAFE_CRACKER_GAP_COUNT = 12;
export const SAFE_CRACKER_ROTATION_MS = 3500;
export const SAFE_CRACKER_HIT_TOLERANCE = 5;

const GAP_STEP = 360 / SAFE_CRACKER_GAP_COUNT;

export function findSafeCrackerGap(pointerAngle: number) {
  const angle = normaliseAngle(pointerAngle);
  const index = Math.round(angle / GAP_STEP) % SAFE_CRACKER_GAP_COUNT;
  const targetAngle = index * GAP_STEP;
  return {
    index,
    targetAngle,
    distance: angleDistance(angle, targetAngle),
  };
}

export function safeCrackerAngleAt(
  timestamp: number,
  startedAt: number,
  startAngle: number,
) {
  const turns = (timestamp - startedAt) / SAFE_CRACKER_ROTATION_MS;
  return normaliseAngle(startAngle + turns * 360);
}

export function normaliseAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function angleDistance(left: number, right: number) {
  const distance = Math.abs(normaliseAngle(left - right));
  return Math.min(distance, 360 - distance);
}
