import type { PlayerRecord } from "../data/goalunitData";

type PlayerValueTableProps = {
  players: PlayerRecord[]
  formatValue: (value: number) => string
  showAll: boolean
}

export function PlayerValueTable({ players, formatValue, showAll }: PlayerValueTableProps) {
  const rankedPlayers = [...players].sort((firstPlayer, secondPlayer) => secondPlayer.fairPrice - firstPlayer.fairPrice)
  const visiblePlayers = showAll ? rankedPlayers : rankedPlayers.slice(0, 5)

  return (
    <div className="table-wrap">
      <table className="player-table">
        <caption className="sr-only">Players ranked by fair price</caption>
        <thead>
          <tr><th scope="col">Player</th><th scope="col">Fair price</th><th scope="col">Contract</th></tr>
        </thead>
        <tbody>
          {visiblePlayers.length === 0 ? <tr><td colSpan={3} className="table-empty">No player records for this club and season.</td></tr> : visiblePlayers.map((player, index) => (
            <tr key={player.playerName}>
              <td><span className="player-rank">{String(index + 1).padStart(2, "0")}</span><strong>{player.playerName}</strong></td>
              <td className="player-price">{formatValue(player.fairPrice)}</td>
              <td className="player-contract">{player.contractExpiration.slice(0, 4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}