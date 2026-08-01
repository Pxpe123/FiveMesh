import { hackGames, type HackGameId } from "./hackGame";

export function HackGameMenu({
  selectedGameId,
  onSelectGame,
}: {
  selectedGameId: HackGameId;
  onSelectGame: (gameId: HackGameId) => void;
}) {
  return (
    <div className="hack-game-list" role="radiogroup" aria-label="Hack games">
      {hackGames.map((game) => (
        <button
          key={game.id}
          type="button"
          role="radio"
          aria-checked={selectedGameId === game.id}
          className={`${selectedGameId === game.id ? "active" : ""}${game.status === "coming-soon" ? " coming-soon" : ""}`}
          onClick={() => onSelectGame(game.id)}
        >
          <strong>{game.name}</strong>
          <small>{game.description}</small>
          {game.status === "coming-soon" && <em>COMING SOON</em>}
        </button>
      ))}
    </div>
  );
}
