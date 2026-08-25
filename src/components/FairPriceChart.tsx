import type { PlayerRecord } from "../data/goalunitData";
import { formatMillions } from "../data/goalunitRepository";

type FairPriceChartProps = {
  players: PlayerRecord[];
};

export function FairPriceChart({ players }: FairPriceChartProps) {
  if (players.length === 0)
    return <p className="table-empty">No players to display.</p>;

  const sorted = [...players].sort((a, b) => b.fairPrice - a.fairPrice);
  const maxPrice = sorted[0]?.fairPrice ?? 0;
  const top8 = sorted.slice(0, 8);

  return (
    <div className="horizontal-bar-chart">
      {top8.map((player) => (
        <div key={player.playerId} className="h-bar-row">
          <span className="h-bar-label">{player.playerName}</span>
          <div className="h-bar-track">
            <div
              className="h-bar-fill"
              style={{ width: `${(player.fairPrice / maxPrice) * 100}%` }}
            ></div>
          </div>
          <span className="h-bar-value">
            {formatMillions(player.fairPrice)}
          </span>
        </div>
      ))}
    </div>
  );
}
