import { useEffect, useRef, useState } from "react";

import { hackGames, type HackGameId } from "./hackGame";

type StoreStatus = "ready" | "playing" | "success" | "failed";

const CYCLES = 2;

export function StoreCashRegisterPractice({
  onSelectGame,
}: {
  onSelectGame: (gameId: HackGameId) => void;
}) {
  const [status, setStatus] = useState<StoreStatus>("ready");
  const [showSolution, setShowSolution] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [markerAngle, setMarkerAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(randomAngle());
  const [message, setMessage] = useState("Move the square around the ring and find the target point.");
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      setTimeRemaining((current) => {
        if (current <= 1) {
          setStatus("failed");
          setMessage("The register lock timed out. Start another attempt to try again.");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (status !== "playing") return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key.toLowerCase() !== "a" && event.key.toLowerCase() !== "d") return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" || event.key.toLowerCase() === "a" ? -1 : 1;
      setMarkerAngle((current) => normaliseAngle(current + direction * 4));
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status]);

  function startGame() {
    setStatus("playing");
    setShowSolution(false);
    setCycle(0);
    setTimeRemaining(15);
    setMarkerAngle(0);
    setTargetAngle(randomAngle());
    setMessage("Slowly move the square until it lines up with the purple target.");
  }

  function updateMarkerFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (status !== "playing" || !dialRef.current) return;
    const bounds = dialRef.current.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    setMarkerAngle(normaliseAngle((Math.atan2(y, x) * 180) / Math.PI + 90));
  }

  function lockPoint() {
    if (status !== "playing" || showSolution) return;
    if (!isAngleInTarget(markerAngle, targetAngle)) {
      setMessage("Not quite. Keep moving the square around the ring.");
      setTimeRemaining((current) => Math.max(0, current - 1));
      return;
    }

    if (cycle + 1 >= CYCLES) {
      setCycle(CYCLES);
      setStatus("success");
      setMessage("Register unlocked. Cash drawer ready.");
      return;
    }

    setCycle((current) => current + 1);
    setTargetAngle(randomAngle());
    setMessage("Good hit. Find the second target point.");
  }

  function revealSolution() {
    setShowSolution(true);
    setStatus("success");
    setMessage("Solution shown. The square must be centred on the highlighted unlock point.");
  }

  const progress = (timeRemaining / 15) * 100;
  const selectedGame = hackGames.find((game) => game.id === "store-cash");

  return (
    <main className="hack-page store-practice-page">
      <section className="hack-intro">
        <div>
          <p className="section-label">FiveMesh games · second release</p>
          <h1>Store Cash Register</h1>
          <p className="lede">Practice the slow lockpicking-style register dial used during store robberies.</p>
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
          <div className="hack-game-list" role="radiogroup" aria-label="Hack games">
            {hackGames.map((game) => (
              <button
                key={game.id}
                type="button"
                role="radio"
                aria-checked={game.id === "store-cash"}
                className={`${game.id === "store-cash" ? "active" : ""}${game.status === "coming-soon" ? " coming-soon" : ""}`}
                onClick={() => onSelectGame(game.id)}
              >
                <strong>{game.name}</strong>
                <small>{game.description}</small>
                {game.status === "coming-soon" && <em>COMING SOON</em>}
              </button>
            ))}
          </div>
          <div className="hack-stat-grid">
            <Stat label="Cycles" value={`${cycle} / ${CYCLES}`} />
            <Stat label="Time" value={`${timeRemaining}s`} />
            <Stat label="Target" value={selectedGame?.name ?? "Store Cash"} />
            <Stat label="Method" value="Slow dial" />
          </div>
          <button type="button" className="hack-start-button" onClick={startGame}>
            {status === "playing" ? "Reset register" : "Start register hack"}
          </button>
          <button type="button" className="hack-solution-button" onClick={revealSolution} disabled={showSolution}>
            {showSolution ? "Solution shown" : "Show solution"}
          </button>
          <p className="hack-help">Drag or click around the dial, or use A/D and the arrow keys. Lock in when the square sits over the purple target.</p>
        </aside>

        <section className="hack-board-panel">
          <div className="hack-game-window store-game-window">
            <div className="hack-board-header">
              <span className="hack-game-title">Store Robbery</span>
              <span className="hack-window-state">{status === "playing" ? "REGISTER LOCK" : "STANDBY"}</span>
            </div>

            <div className="store-dial-stage">
              <div
                ref={dialRef}
                className="store-dial"
                onPointerDown={(event) => {
                  dialRef.current?.setPointerCapture(event.pointerId);
                  updateMarkerFromPointer(event);
                }}
                onPointerMove={(event) => {
                  if (event.buttons > 0) updateMarkerFromPointer(event);
                }}
                onPointerUp={(event) => dialRef.current?.releasePointerCapture(event.pointerId)}
                role="slider"
                aria-label="Register lock position"
                aria-valuenow={Math.round(markerAngle)}
                aria-valuemin={0}
                aria-valuemax={359}
                tabIndex={0}
              >
                <div className="store-target-arc" style={{ transform: `rotate(${targetAngle}deg)` }} />
                {showSolution && <div className="store-solution-point" style={{ transform: `rotate(${targetAngle}deg) translateY(-112px)` }} />}
                <div className="store-marker" style={{ transform: `rotate(${markerAngle}deg) translateY(-112px)` }} />
                <div className="store-dial-core" />
              </div>
              <span className="store-cycle-label">Cycle {Math.min(cycle + 1, CYCLES)} / {CYCLES}</span>
              <button type="button" className="store-lock-button" onClick={lockPoint} disabled={status !== "playing"}>Lock in point</button>
            </div>

            <p className="hack-instruction">Slowly move the square around to find the correct point</p>
            <div className="hack-time-bar" aria-label={`${timeRemaining} seconds remaining`}><span style={{ width: `${progress}%` }} /></div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="hack-stat"><small>{label}</small><strong>{value}</strong></div>;
}

function randomAngle() {
  return Math.floor(Math.random() * 360);
}

function normaliseAngle(angle: number) {
  return (angle + 360) % 360;
}

function isAngleInTarget(marker: number, target: number) {
  const distance = Math.abs(normaliseAngle(marker - target));
  return Math.min(distance, 360 - distance) <= 18;
}

function statusLabel(status: StoreStatus) {
  return { ready: "Stand by", playing: "Connection live", success: "Access granted", failed: "Connection lost" }[status];
}
