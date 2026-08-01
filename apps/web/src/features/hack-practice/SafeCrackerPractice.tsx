import { useEffect, useRef, useState } from "react";

import { HackGameMenu } from "./HackGameMenu";
import type { HackGameId } from "./hackGame";
import {
  findSafeCrackerGap,
  safeCrackerAngleAt,
  SAFE_CRACKER_GAP_COUNT,
  SAFE_CRACKER_HIT_TOLERANCE,
  SAFE_CRACKER_ROTATION_MS,
} from "./safeCracker";

type SafeCrackerStatus = "ready" | "playing" | "success" | "failed";

const dialGaps = Array.from({ length: SAFE_CRACKER_GAP_COUNT }, (_, index) => index);

export function SafeCrackerPractice({
  onSelectGame,
}: {
  onSelectGame: (gameId: HackGameId) => void;
}) {
  const [status, setStatus] = useState<SafeCrackerStatus>("ready");
  const [pointerAngle, setPointerAngle] = useState(0);
  const [lockedGaps, setLockedGaps] = useState<number[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestSeconds, setBestSeconds] = useState<number | null>(null);
  const [message, setMessage] = useState("Start the dial when you are ready.");
  const animationFrameRef = useRef(0);
  const startedAtRef = useRef(0);
  const startAngleRef = useRef(0);
  const statusRef = useRef<SafeCrackerStatus>("ready");
  const lockedGapsRef = useRef(new Set<number>());

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (status !== "playing") return;

    function animate(timestamp: number) {
      const angle = safeCrackerAngleAt(timestamp, startedAtRef.current, startAngleRef.current);
      setPointerAngle(angle);
      setElapsedSeconds((timestamp - startedAtRef.current) / 1000);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    }

    animationFrameRef.current = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrameRef.current);
  }, [status]);

  function startGame() {
    const startedAt = performance.now();
    const startAngle = Math.random() * 360;
    startedAtRef.current = startedAt;
    startAngleRef.current = startAngle;
    lockedGapsRef.current = new Set();
    statusRef.current = "playing";
    setPointerAngle(startAngle);
    setLockedGaps([]);
    setElapsedSeconds(0);
    setStatus("playing");
    setMessage("Dial moving. Click only while the green pin is inside an empty gap.");
  }

  function attemptLock() {
    if (statusRef.current !== "playing") return;

    const timestamp = performance.now();
    const angle = safeCrackerAngleAt(timestamp, startedAtRef.current, startAngleRef.current);
    const gap = findSafeCrackerGap(angle);
    const alreadyLocked = lockedGapsRef.current.has(gap.index);

    if (gap.distance > SAFE_CRACKER_HIT_TOLERANCE || alreadyLocked) {
      statusRef.current = "failed";
      setPointerAngle(angle);
      setElapsedSeconds((timestamp - startedAtRef.current) / 1000);
      setStatus("failed");
      setMessage(alreadyLocked ? "That gap was already locked. The attempt failed." : "The pin missed the gap. The attempt failed.");
      return;
    }

    const nextLocked = new Set(lockedGapsRef.current);
    nextLocked.add(gap.index);
    lockedGapsRef.current = nextLocked;
    setLockedGaps([...nextLocked]);

    if (nextLocked.size === SAFE_CRACKER_GAP_COUNT) {
      const completedIn = (timestamp - startedAtRef.current) / 1000;
      statusRef.current = "success";
      setPointerAngle(angle);
      setElapsedSeconds(completedIn);
      setBestSeconds((current) => current === null ? completedIn : Math.min(current, completedIn));
      setStatus("success");
      setMessage("All twelve locking points secured. The safe is open.");
      return;
    }

    setMessage(`${nextLocked.size} of ${SAFE_CRACKER_GAP_COUNT} locking points secured.`);
  }

  return (
    <main className="hack-page safe-cracker-page">
      <section className="hack-intro">
        <div>
          <p className="section-label">FiveMesh games · third release</p>
          <h1>Safe Cracker</h1>
          <p className="lede">
            Match the rotating green pin with every gap in the safe dial. One missed click ends the attempt.
          </p>
        </div>
        <div className="hack-status-card">
          <span className={`hack-status-dot ${status}`} />
          <div>
            <strong>{statusLabel(status)}</strong>
            <small>{message}</small>
          </div>
        </div>
      </section>

      <section className="hack-layout">
        <aside className="hack-sidebar">
          <div className="hack-panel-heading"><span>Hack games</span><small>LOCAL SESSION</small></div>
          <HackGameMenu selectedGameId="safe-cracker" onSelectGame={onSelectGame} />
          <div className="hack-stat-grid">
            <Stat label="Locked" value={`${lockedGaps.length} / ${SAFE_CRACKER_GAP_COUNT}`} />
            <Stat label="Rotation" value={`${(SAFE_CRACKER_ROTATION_MS / 1000).toFixed(1)}s`} />
            <Stat label="Time" value={`${elapsedSeconds.toFixed(1)}s`} />
            <Stat label="Best" value={bestSeconds === null ? "—" : `${bestSeconds.toFixed(1)}s`} />
          </div>
          <button type="button" className="hack-start-button" onClick={startGame}>
            {status === "playing" ? "Reset safe" : "Start safe cracker"}
          </button>
          <p className="hack-help">
            Click the dial, press Space, or press Enter when the green pin is centred in an unfilled gap. The dial has no time limit and completes one turn every 3.5 seconds.
          </p>
        </aside>

        <section className="hack-board-panel safe-cracker-board-panel">
          <div className="hack-game-window safe-cracker-game-window">
            <div className="hack-board-header">
              <span className="hack-game-title">Crack Safe</span>
              <span className="hack-window-state">{windowState(status)}</span>
            </div>

            <div className="safe-cracker-stage">
              <button
                type="button"
                className={`safe-cracker-dial ${status}`}
                onClick={attemptLock}
                disabled={status !== "playing"}
                aria-label={`Safe dial. ${lockedGaps.length} of ${SAFE_CRACKER_GAP_COUNT} locking points secured.`}
              >
                <svg viewBox="0 0 360 360" aria-hidden="true">
                  <circle className="safe-dial-rim" cx="180" cy="180" r="146" />
                  <circle className="safe-dial-inner" cx="180" cy="180" r="92" />
                  {dialGaps.map((index) => (
                    <path
                      key={`segment-${index}`}
                      className="safe-dial-segment"
                      d={describeArc(180, 180, 121, index * 30 + 6.5, (index + 1) * 30 - 6.5)}
                    />
                  ))}
                  {lockedGaps.map((index) => (
                    <line
                      key={`lock-${index}`}
                      className="safe-lock-tick"
                      x1="180"
                      y1="48"
                      x2="180"
                      y2="65"
                      transform={`rotate(${index * 30} 180 180)`}
                    />
                  ))}
                  {status !== "ready" && (
                    <line
                      className="safe-moving-pin"
                      x1="180"
                      y1="44"
                      x2="180"
                      y2="68"
                      transform={`rotate(${pointerAngle} 180 180)`}
                    />
                  )}
                  <circle className="safe-dial-hub" cx="180" cy="180" r="52" />
                  <circle className="safe-dial-hub-ring" cx="180" cy="180" r="35" />
                  <circle className="safe-dial-hub-centre" cx="180" cy="180" r="15" />
                </svg>
              </button>
              <span className="safe-cracker-progress">{lockedGaps.length} / {SAFE_CRACKER_GAP_COUNT}</span>
            </div>

            <p className="hack-instruction">Click when the green pin is centred between two grey dial segments</p>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="hack-stat"><small>{label}</small><strong>{value}</strong></div>;
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.sin(radians),
    y: cy - radius * Math.cos(radians),
  };
}

function statusLabel(status: SafeCrackerStatus) {
  return {
    ready: "Stand by",
    playing: "Dial active",
    success: "Safe opened",
    failed: "Attempt failed",
  }[status];
}

function windowState(status: SafeCrackerStatus) {
  return {
    ready: "STANDBY",
    playing: "DIAL ACTIVE",
    success: "UNLOCKED",
    failed: "MISSED",
  }[status];
}
