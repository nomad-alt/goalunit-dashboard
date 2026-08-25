import { useMemo, useState } from "react";
import type { PlayerRecord } from "../data/goalunitData";
import { formatMillions } from "../data/goalunitRepository";

type PlayerSearchPanelProps = {
  players: PlayerRecord[];
  competitionName: string;
  seasonName: string;
};

export function PlayerSearchPanel({
  players,
  competitionName,
  seasonName,
}: PlayerSearchPanelProps) {
  const [searchName, setSearchName] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [position, setPosition] = useState("");
  const [nationality, setNationality] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [contractExpiry, setContractExpiry] = useState("");
  const [showAll, setShowAll] = useState(false);

  const positions = useMemo(
    () => [...new Set(players.map((player) => player.position))].sort(),
    [players],
  );
  const nationalities = useMemo(
    () => [...new Set(players.map((player) => player.nationality))].sort(),
    [players],
  );

  const filteredPlayers = useMemo(() => {
    return players
      .filter((player) => {
        if (
          searchName &&
          !player.playerName.toLowerCase().includes(searchName.toLowerCase())
        )
          return false;
        if (minAge && player.age < Number(minAge)) return false;
        if (maxAge && player.age > Number(maxAge)) return false;
        if (position && player.position !== position) return false;
        if (nationality && player.nationality !== nationality) return false;
        if (minPrice && player.fairPrice < Number(minPrice) * 1000000)
          return false;
        if (maxPrice && player.fairPrice > Number(maxPrice) * 1000000)
          return false;
        if (
          contractExpiry &&
          player.contractExpiration.slice(0, 4) > contractExpiry
        )
          return false;
        return true;
      })
      .sort(
        (firstPlayer, secondPlayer) =>
          secondPlayer.fairPrice - firstPlayer.fairPrice,
      );
  }, [
    players,
    searchName,
    minAge,
    maxAge,
    position,
    nationality,
    minPrice,
    maxPrice,
    contractExpiry,
  ]);

  const visiblePlayers = showAll
    ? filteredPlayers
    : filteredPlayers.slice(0, 8);

  return (
    <div className="player-search-panel">
      <div className="search-filters">
        <div className="filter-group">
          <label htmlFor="player-name-search">Name</label>
          <input
            id="player-name-search"
            type="text"
            placeholder="Search players..."
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="min-age">Min age</label>
          <input
            id="min-age"
            type="number"
            placeholder="18"
            min="16"
            max="40"
            value={minAge}
            onChange={(event) => setMinAge(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="max-age">Max age</label>
          <input
            id="max-age"
            type="number"
            placeholder="35"
            min="16"
            max="40"
            value={maxAge}
            onChange={(event) => setMaxAge(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="position-filter">Position</label>
          <select
            id="position-filter"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          >
            <option value="">All</option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="nationality-filter">Nationality</label>
          <select
            id="nationality-filter"
            value={nationality}
            onChange={(event) => setNationality(event.target.value)}
          >
            <option value="">All</option>
            {nationalities.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="min-price">Min price (£M)</label>
          <input
            id="min-price"
            type="number"
            placeholder="0"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="max-price">Max price (£M)</label>
          <input
            id="max-price"
            type="number"
            placeholder="200"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="contract-expiry">Contract expiry</label>
          <select
            id="contract-expiry"
            value={contractExpiry}
            onChange={(event) => setContractExpiry(event.target.value)}
          >
            <option value="">Any</option>
            <option value="2026">By end of 2026</option>
            <option value="2027">By end of 2027</option>
            <option value="2028">By end of 2028</option>
            <option value="2029">By end of 2029</option>
            <option value="2030">By end of 2030</option>
          </select>
        </div>
      </div>

      <div className="search-meta">
        <span>
          {filteredPlayers.length} player
          {filteredPlayers.length !== 1 ? "s" : ""} found
        </span>
        <span>
          {competitionName} · {seasonName}
        </span>
      </div>

      <div className="table-wrap">
        <table className="player-table player-search-table">
          <caption className="sr-only">Searchable player list</caption>
          <thead>
            <tr>
              <th scope="col">Player</th>
              <th scope="col">Age</th>
              <th scope="col">Position</th>
              <th scope="col">Nationality</th>
              <th scope="col">Fair price</th>
              <th scope="col">Contract</th>
            </tr>
          </thead>
          <tbody>
            {visiblePlayers.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  No players match the selected filters.
                </td>
              </tr>
            ) : (
              visiblePlayers.map((player) => (
                <tr key={player.playerId}>
                  <td>
                    <strong>{player.playerName}</strong>
                  </td>
                  <td>{player.age}</td>
                  <td>{player.position}</td>
                  <td>{player.nationality}</td>
                  <td className="player-price">
                    {formatMillions(player.fairPrice)}
                  </td>
                  <td className="player-contract">
                    {player.contractExpiration}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredPlayers.length > 8 && (
        <div className="search-actions">
          <button
            className="text-button"
            type="button"
            onClick={() => setShowAll((isVisible) => !isVisible)}
            aria-expanded={showAll}
          >
            {showAll
              ? "Show less"
              : `Show all ${filteredPlayers.length} players`}{" "}
            <span aria-hidden="true">{showAll ? "↑" : "→"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
