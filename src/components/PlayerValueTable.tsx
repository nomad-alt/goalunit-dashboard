import type { PlayerRecord } from "../data/goalunitData";

type PlayerValueTableProps = {
  players: PlayerRecord[]
  formatValue: (value: number) => string
}

export function PlayerValueTable({ players, formatValue }: PlayerValueTableProps) {
  const rankedPlayers = [...players].sort((firstPlayer, secondPlayer) => secondPlayer.fairPrice - firstPlayer.fairPrice)

  return (
    <div className="table-wrap">
      <table className="player-table">
        <caption className="sr-only">Players ranked by fair price</caption>
        <thead>
          <tr><th scope="col">Player</th><th scope="col">Fair price</th><th scope="col">Contract</th></tr>
        </thead>
        <tbody>
          {rankedPlayers.map((player, index) => (
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