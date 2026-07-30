import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createHackRound,
  getConnectedTiles,
  getTileConnections,
  hackDifficulties,
  isRoundSolved,
  rotateTile,
  type HackDifficulty,
  type HackRound,
  type HackTile,
} from "./hackGame";

type GameStatus = "ready" | "playing" | "success" | "failed";

export function HackPracticePage() {
  const [difficulty, setDifficulty] = useState<HackDifficulty>("operator");
  const [round, setRound] = useState<HackRound | null>(null);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("Rotate the pipes and connect them to the finish tile.");

  const config = hackDifficulties[difficulty];
  const connectedTiles = useMemo(
    () => (round ? getConnectedTiles(round) : new Set<number>()),
    [round],
  );

  const startRound = useCallback(() => {
    const nextRound = createHackRound(difficulty);
    setRound(nextRound);
    setStatus("playing");
    setTimeRemaining(nextRound.timeLimit);
    setMoves(0);
    setMessage("Rotate the pipes and connect them to the finish tile.");
  }, [difficulty]);

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      setTimeRemaining((current) => {
        if (current <= 1) {
          setStatus("failed");
          setStreak(0);
          setMessage("The explosive rig timed out. Start another board to try again.");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  function handleTileClick(index: number) {
    if (status !== "playing" || !round) return;

    const nextRound: HackRound = {
      ...round,
      tiles: round.tiles.map((tile) => (tile.index === index ? rotateTile(tile) : tile)),
    };
    setRound(nextRound);
    setMoves((current) => current + 1);

    if (isRoundSolved(nextRound)) {
      const nextMoves = moves + 1;
      setStatus("success");
      setBestMoves((current) => (current === null ? nextMoves : Math.min(current, nextMoves)));
      setStreak((current) => current + 1);
      setMessage("Rig explosive complete. The route is connected.");
    }
  }

  function changeDifficulty(nextDifficulty: HackDifficulty) {
    setDifficulty(nextDifficulty);
    setRound(null);
    setStatus("ready");
    setTimeRemaining(0);
    setMoves(0);
    setMessage("Choose start when you are ready to rig the explosive.");
  }

  const progress = round ? (timeRemaining / round.timeLimit) * 100 : 0;

  return (
    <main className="hack-page">
      <section className="hack-intro">
        <div>
          <p className="section-label">FiveMesh games · first release</p>
          <h1>ATM Bomb Hack Practice</h1>
          <p className="lede">
            Practice the pipe-connection hack used when rigging an ATM explosive in FiveM RP.
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
          <div className="hack-panel-heading">
            <span>Practice setup</span>
            <small>LOCAL SESSION</small>
          </div>
          <div className="hack-difficulty-list" role="radiogroup" aria-label="Hack difficulty">
            {(Object.entries(hackDifficulties) as [HackDifficulty, (typeof hackDifficulties)[HackDifficulty]][]).map(([id, option]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={difficulty === id}
                className={difficulty === id ? "active" : ""}
                onClick={() => changeDifficulty(id)}
              >
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
          <div className="hack-stat-grid">
            <Stat label="Best moves" value={bestMoves === null ? "—" : bestMoves.toString()} />
            <Stat label="Current streak" value={streak.toString()} />
            <Stat label="Moves" value={moves.toString()} />
            <Stat label="Time limit" value={`${config.timeLimit}s`} />
          </div>
          <button type="button" className="hack-start-button" onClick={startRound}>
            {status === "playing" ? "Reset board" : "Start hack"}
          </button>
          <p className="hack-help">
            Click a tile to rotate its pipe clockwise. Build one connected route from the green source to the finish square before the bar runs out.
          </p>
        </aside>

        <section className="hack-board-panel">
          <div className="hack-game-window">
            <div className="hack-board-header">
              <span className="hack-game-title">Rig Explosive</span>
              <span className="hack-window-state">{status === "playing" ? "CONNECTION ACTIVE" : "STANDBY"}</span>
            </div>

            <div
              className="hack-pipe-board"
              style={{ gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))` }}
              aria-label="Pipe connection board"
            >
              {round?.tiles.map((tile) => (
                <PipeTile
                  key={tile.index}
                  tile={tile}
                  connected={connectedTiles.has(tile.index)}
                  source={tile.index === round.sourceIndex}
                  target={tile.index === round.targetIndex}
                  disabled={status !== "playing"}
                  onClick={() => handleTileClick(tile.index)}
                />
              )) ?? <div className="hack-board-placeholder">Press start hack to initialise the board.</div>}
            </div>

            <p className="hack-instruction">Rotate the pipes and connect them to the finish tile</p>
            <div className="hack-time-bar" aria-label={`${timeRemaining} seconds remaining`}>
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function PipeTile({
  tile,
  connected,
  source,
  target,
  disabled,
  onClick,
}: {
  tile: HackTile;
  connected: boolean;
  source: boolean;
  target: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const connections = getTileConnections(tile);
  const colour = connected ? "#9df21d" : "#a7a9a9";
  return (
    <button
      type="button"
      className={`hack-pipe-tile${connected ? " connected" : ""}${source ? " source" : ""}${target ? " target" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={`${source ? "Source tile" : target ? "Finish tile" : "Pipe tile"}, rotate clockwise`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {connections.up && <line x1="50" y1="50" x2="50" y2="6" stroke={colour} />}
        {connections.right && <line x1="50" y1="50" x2="94" y2="50" stroke={colour} />}
        {connections.down && <line x1="50" y1="50" x2="50" y2="94" stroke={colour} />}
        {connections.left && <line x1="50" y1="50" x2="6" y2="50" stroke={colour} />}
        {!target && <circle cx="50" cy="50" r="10" fill={colour} />}
      </svg>
      {target && <span className="hack-finish-marker" />}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="hack-stat"><small>{label}</small><strong>{value}</strong></div>;
}

function statusLabel(status: GameStatus) {
  return {
    ready: "Stand by",
    playing: "Connection live",
    success: "Access granted",
    failed: "Connection lost",
  }[status];
}
