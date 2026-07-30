import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createHackRound,
  getConnectedTiles,
  getTileConnections,
  hackGames,
  isRoundSolved,
  rotateTile,
  type HackGameId,
  type HackRound,
  type HackTile,
} from "./hackGame";

type GameStatus = "ready" | "preparing" | "playing" | "success" | "failed";

export function HackPracticePage() {
  const [selectedGameId, setSelectedGameId] = useState<HackGameId>("atm-bomb");
  const [round, setRound] = useState<HackRound | null>(null);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [prepRemaining, setPrepRemaining] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("Choose a game to begin.");

  const selectedGame = hackGames.find((game) => game.id === selectedGameId) ?? hackGames[0];
  const connectedTiles = useMemo(
    () => (round ? getConnectedTiles(round) : new Set<number>()),
    [round],
  );

  const startRound = useCallback(() => {
    if (selectedGame.status !== "available") return;
    const nextRound = createHackRound(selectedGame);
    setRound(nextRound);
    setStatus("preparing");
    setPrepRemaining(selectedGame.prepTime);
    setTimeRemaining(selectedGame.playTime);
    setMoves(0);
    setMessage("Prepare the rig. The connection window starts shortly.");
  }, [selectedGame]);

  useEffect(() => {
    if (status !== "preparing" && status !== "playing") return;

    const timer = window.setInterval(() => {
      if (status === "preparing") {
        setPrepRemaining((current) => {
          if (current <= 1) {
            setStatus("playing");
            setMessage("Connection live. Complete the route before the timer expires.");
            return 0;
          }
          return current - 1;
        });
      } else {
        setTimeRemaining((current) => {
          if (current <= 1) {
            setStatus("failed");
            setStreak(0);
            setMessage("The explosive rig timed out. Start another board to try again.");
            return 0;
          }
          return current - 1;
        });
      }
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

  function selectGame(nextGameId: HackGameId) {
    setSelectedGameId(nextGameId);
    setRound(null);
    setStatus("ready");
    setPrepRemaining(0);
    setTimeRemaining(0);
    setMoves(0);
    const nextGame = hackGames.find((game) => game.id === nextGameId);
    setMessage(nextGame?.status === "available" ? "Choose start when you are ready." : "This hack game is coming soon.");
  }

  const progress = status === "preparing"
    ? (prepRemaining / selectedGame.prepTime) * 100
    : round
      ? (timeRemaining / round.timeLimit) * 100
      : 0;

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
            <span>Hack games</span>
            <small>LOCAL SESSION</small>
          </div>
          <div className="hack-game-list" role="radiogroup" aria-label="Hack games">
            {hackGames.map((game) => (
              <button
                key={game.id}
                type="button"
                role="radio"
                aria-checked={selectedGameId === game.id}
                className={`${selectedGameId === game.id ? "active" : ""}${game.status === "coming-soon" ? " coming-soon" : ""}`}
                onClick={() => selectGame(game.id)}
              >
                <strong>{game.name}</strong>
                <small>{game.description}</small>
                {game.status === "coming-soon" && <em>COMING SOON</em>}
              </button>
            ))}
          </div>
          <div className="hack-stat-grid">
            <Stat label="Best moves" value={bestMoves === null ? "—" : bestMoves.toString()} />
            <Stat label="Current streak" value={streak.toString()} />
            <Stat label="Moves" value={moves.toString()} />
            <Stat label="Prep time" value={`${selectedGame.prepTime}s`} />
            <Stat label="Play time" value={`${selectedGame.playTime}s`} />
          </div>
          <button type="button" className="hack-start-button" onClick={startRound} disabled={selectedGame.status !== "available"}>
            {status === "playing" || status === "preparing" ? "Reset board" : "Start hack"}
          </button>
          <p className="hack-help">
            Click a tile to rotate its pipe clockwise. Build one connected route from the green source to the finish square before the bar runs out.
          </p>
        </aside>

        <section className="hack-board-panel">
          <div className="hack-game-window">
            <div className="hack-board-header">
              <span className="hack-game-title">Rig Explosive</span>
              <span className="hack-window-state">{status === "preparing" ? "PREPARE" : status === "playing" ? "CONNECTION ACTIVE" : "STANDBY"}</span>
            </div>

            {status === "preparing" && <div className="hack-prep-countdown">{prepRemaining}</div>}

            <div
              className="hack-pipe-board"
              style={{ gridTemplateColumns: `repeat(${selectedGame.columns}, minmax(0, 1fr))` }}
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
  const colour = connected ? `url(#pipe-green-${tile.index})` : `url(#pipe-metal-${tile.index})`;
  return (
    <button
      type="button"
      className={`hack-pipe-tile${connected ? " connected" : ""}${source ? " source" : ""}${target ? " target" : ""}`}
      disabled={disabled || source || target}
      onClick={onClick}
      aria-label={`${source ? "Source tile" : target ? "Finish tile" : "Pipe tile"}, rotate clockwise`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={`pipe-metal-${tile.index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e3e3df" />
            <stop offset="0.48" stopColor="#8d8f8d" />
            <stop offset="1" stopColor="#c8c9c5" />
          </linearGradient>
          <linearGradient id={`pipe-green-${tile.index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c7ff42" />
            <stop offset="0.5" stopColor="#8ee900" />
            <stop offset="1" stopColor="#b2fb22" />
          </linearGradient>
        </defs>
        {connections.up && <line x1="50" y1="50" x2="50" y2="6" stroke={colour} />}
        {connections.right && <line x1="50" y1="50" x2="94" y2="50" stroke={colour} />}
        {connections.down && <line x1="50" y1="50" x2="50" y2="94" stroke={colour} />}
        {connections.left && <line x1="50" y1="50" x2="6" y2="50" stroke={colour} />}
        {!target && <rect x="43" y="43" width="14" height="14" fill={colour} />}
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
    preparing: "Prepare the rig",
    playing: "Connection live",
    success: "Access granted",
    failed: "Connection lost",
  }[status];
}
