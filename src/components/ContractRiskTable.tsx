import type { PlayerRecord } from "../data/goalunitData";

type ContractRiskTableProps = {
  players: PlayerRecord[]
}

export function ContractRiskTable({ players }: ContractRiskTableProps) {
  return (
    <div className="contract-risk-wrap">
      {players.length === 0 ? (
        <p className="table-empty">No contract expirations recorded for this club and season.</p>
      ) : (
        <table className="player-table contract-risk-table">
          <caption className="sr-only">Players with contracts expiring within two years</caption>
          <thead><tr><th scope="col">Player</th><th scope="col">Expires</th><th scope="col">Status</th></tr></thead>
          <tbody>{players.map((player) => <tr key={player.playerName}><td><strong>{player.playerName}</strong></td><td className="player-contract">{player.contractExpiration}</td><td><span className="risk-badge">Review</span></td></tr>)}</tbody>
        </table>
      )}
    </div>
  )
}