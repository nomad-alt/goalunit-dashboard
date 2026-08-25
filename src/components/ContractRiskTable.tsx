import { useMemo, useState } from "react";
import type { PlayerRecord } from "../data/goalunitData";
import { formatMillions } from "../data/goalunitRepository";

type ContractRiskTableProps = {
  players: PlayerRecord[];
  seasonName: string;
};

type SortField = "name" | "expiry" | "price";
type SortDirection = "asc" | "desc";

const getMonthsUntilExpiry = (expiryDate: string, seasonName: string) => {
  const seasonEndYear = Number(seasonName.slice(-4));
  const expiryYear = Number(expiryDate.slice(0, 4));
  return (expiryYear - seasonEndYear) * 12;
};

const getRiskCategory = (expiryDate: string, seasonName: string) => {
  const months = getMonthsUntilExpiry(expiryDate, seasonName);
  if (months <= 12) return "critical";
  if (months <= 24) return "watch";
  return "stable";
};

export function ContractRiskTable({
  players,
  seasonName,
}: ContractRiskTableProps) {
  const [sortField, setSortField] = useState<SortField>("expiry");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedPlayers = useMemo(() => {
    return [...players].sort((first, second) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = first.playerName.localeCompare(second.playerName);
      } else if (sortField === "expiry") {
        comparison = first.contractExpiration.localeCompare(
          second.contractExpiration,
        );
      } else {
        comparison = first.fairPrice - second.fairPrice;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [players, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="contract-risk-wrap">
      {players.length === 0 ? (
        <p className="table-empty">
          No contract expirations recorded for this club and season.
        </p>
      ) : (
        <table className="player-table contract-risk-table">
          <caption className="sr-only">
            Players with contracts expiring within two years
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <button
                  className="sort-button"
                  type="button"
                  onClick={() => handleSort("name")}
                >
                  Player{" "}
                  {sortField === "name" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th scope="col">
                <button
                  className="sort-button"
                  type="button"
                  onClick={() => handleSort("expiry")}
                >
                  Expires{" "}
                  {sortField === "expiry" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th scope="col">
                <button
                  className="sort-button"
                  type="button"
                  onClick={() => handleSort("price")}
                >
                  Fair price{" "}
                  {sortField === "price" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </th>
              <th scope="col">Risk</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => {
              const risk = getRiskCategory(
                player.contractExpiration,
                seasonName,
              );
              const riskLabel =
                risk === "critical"
                  ? "Critical"
                  : risk === "watch"
                    ? "Watch"
                    : "Stable";
              return (
                <tr key={player.playerName} className={`risk-${risk}`}>
                  <td>
                    <strong>{player.playerName}</strong>
                  </td>
                  <td className="player-contract">
                    {player.contractExpiration}
                  </td>
                  <td className="player-price">
                    {formatMillions(player.fairPrice)}
                  </td>
                  <td>
                    <span className={`risk-badge risk-badge--${risk}`}>
                      {riskLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
