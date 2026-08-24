import { useState } from "react";
import "./App.css";
import {
  clubs,
  formatMillions,
  getAverageTransferKpi,
  getClubPlayers,
  getInsight,
  getTopPlayer,
  selectedClub,
} from "./data/goalunitData";
import { PlayerValueTable } from "./components/PlayerValueTable";
import { TransferKpiChart } from "./components/TransferKpiChart";

function App() {
  const [selectedClubId, setSelectedClubId] = useState(selectedClub.clubId);
  const [selectedSeason, setSelectedSeason] = useState(selectedClub.seasonName);
  const seasonClubs = clubs.filter(
    (club) => club.seasonName === selectedSeason,
  );
  const activeClub =
    seasonClubs.find((club) => club.clubId === selectedClubId) ??
    seasonClubs[0] ??
    selectedClub;
  const activePlayers = getClubPlayers(
    activeClub.clubId,
    activeClub.seasonName,
  );
  const activeTopPlayer = getTopPlayer(activePlayers);
  const activeAverageKpi = getAverageTransferKpi(
    seasonClubs.length ? seasonClubs : clubs,
  );
  const activeKpiDelta = activeClub.transferKpi - activeAverageKpi;
  const activeInsight = getInsight(
    activeClub,
    seasonClubs.length ? seasonClubs : clubs,
  );
  const playersAboveThreshold = activePlayers.filter(
    (player) => player.fairPrice >= 50000000,
  ).length;
  const latestContractYear = activePlayers.reduce(
    (latest, player) =>
      Math.max(latest, Number(player.contractExpiration.slice(0, 4))),
    0,
  );
  const seasons = [...new Set(clubs.map((club) => club.seasonName))];

  const handleSeasonChange = (seasonName: string) => {
    setSelectedSeason(seasonName);
    const firstClubInSeason = clubs.find(
      (club) => club.seasonName === seasonName,
    );
    if (firstClubInSeason) setSelectedClubId(firstClubInSeason.clubId);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Goalunit home">
          <span className="brand-mark" aria-hidden="true">
            g
          </span>
          <span>goalunit</span>
        </a>
        <nav className="topbar-nav" aria-label="Primary navigation">
          <a className="active" href="#overview">
            Analysis
          </a>
          <a href="#activity">Player leads</a>
          <a href="#goals">Squad planner</a>
        </nav>
        <div className="profile-display">
          <span className="avatar" aria-hidden="true">
            <img src={activeClub.clubImageUrl} alt="" />
            <span>{activeClub.clubName.slice(0, 2).toUpperCase()}</span>
          </span>
          <span className="profile-name">{activeClub.clubName}</span>
        </div>
      </header>

      <div className="dashboard" id="overview">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">
              Club overview · {activeClub.seasonName} season
            </p>
            <h1>
              {activeClub.clubName} <span className="accent-dot">.</span>
            </h1>
            <p className="subtitle">
              A concise view of club value, market position, and recruitment
              context.
            </p>
          </div>
          <div className="selection-controls" aria-label="Dashboard filters">
            <label>
              Club
              <select
                value={activeClub.clubId}
                onChange={(event) =>
                  setSelectedClubId(Number(event.target.value))
                }
              >
                {seasonClubs.map((club) => (
                  <option key={club.clubId} value={club.clubId}>
                    {club.clubName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Season
              <select
                value={selectedSeason}
                onChange={(event) => handleSeasonChange(event.target.value)}
              >
                {seasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="stat-grid" aria-label="Club performance statistics">
          <article className="stat-card stat-card--lime">
            <div className="card-heading">
              <span className="stat-icon">↗</span>
              <span>Team performance</span>
            </div>
            <strong>{activeClub.transferKpi}</strong>
            <div className="stat-footer">
              <span>Transfer KPI</span>
              <span className="trend positive">
                {activeKpiDelta >= 0 ? "+" : ""}
                {activeKpiDelta.toFixed(1)}
              </span>
            </div>
          </article>
          <article className="stat-card stat-card--cream">
            <div className="card-heading">
              <span className="stat-icon">✓</span>
              <span>Financial health</span>
            </div>
            <strong>{formatMillions(activeClub.totalAssets)}</strong>
            <div className="stat-footer">
              <span>Total assets</span>
              <span className="trend positive">
                {formatMillions(activeClub.totalRevenues)} rev.
              </span>
            </div>
          </article>
          <article className="stat-card stat-card--coral">
            <div className="card-heading">
              <span className="stat-icon">◷</span>
              <span>Squad structure</span>
            </div>
            <strong>
              32<span className="unit">%</span>
            </strong>
            <div className="stat-footer">
              <span>Young player signal</span>
              <span className="trend positive">32%</span>
            </div>
          </article>
          <article className="stat-card stat-card--sky">
            <div className="card-heading">
              <span className="stat-icon">◎</span>
              <span>Recruitment</span>
            </div>
            <strong>
              34<span className="unit"> mo</span>
            </strong>
            <div className="stat-footer">
              <span>Contract horizon</span>
              <span className="trend neutral">34 mo</span>
            </div>
          </article>
        </section>

        <section className="visual-grid" aria-label="Club and player analysis">
          <article className="panel chart-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Market comparison</p>
                <h2>Transfer KPI by club</h2>
              </div>
              <span className="panel-note">
                {activeClub.seasonName} · {activeClub.competitionName}
              </span>
            </div>
            <TransferKpiChart
              clubs={seasonClubs.length ? seasonClubs : clubs}
              selectedClubName={activeClub.clubName}
            />
          </article>
          <article className="panel table-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Selected club squad</p>
                <h2>Fair price leaders</h2>
              </div>
              <button className="text-button" type="button">
                View all <span aria-hidden="true">→</span>
              </button>
            </div>
            <PlayerValueTable
              players={activePlayers}
              formatValue={formatMillions}
            />
          </article>
        </section>

        <section className="content-grid">
          <article className="panel progress-panel" id="goals">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Squad structure</p>
                <h2>Squad indicators</h2>
              </div>
              <button className="text-button" type="button">
                View report <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="goal-list">
              <div className="goal-row">
                <span className="goal-dot goal-dot--green"></span>
                <div className="goal-copy">
                  <strong>Highest fair price in squad</strong>
                  <span>
                    {activeTopPlayer
                      ? `${activeTopPlayer.playerName} · ${formatMillions(activeTopPlayer.fairPrice)}`
                      : "No player records available"}
                  </span>
                </div>
                <div className="progress-value">
                  {activeTopPlayer
                    ? formatMillions(activeTopPlayer.fairPrice)
                    : "—"}
                </div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--green"
                  style={{ width: "100%" }}
                ></span>
              </div>
              <div className="goal-row">
                <span className="goal-dot goal-dot--orange"></span>
                <div className="goal-copy">
                  <strong>Transfer KPI</strong>
                  <span>
                    {activeClub.clubName} · season average{" "}
                    {activeAverageKpi.toFixed(1)}
                  </span>
                </div>
                <div className="progress-value">{activeClub.transferKpi}</div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--orange"
                  style={{
                    width: `${Math.min((activeClub.transferKpi / 30) * 100, 100)}%`,
                  }}
                ></span>
              </div>
              <div className="goal-row">
                <span className="goal-dot goal-dot--blue"></span>
                <div className="goal-copy">
                  <strong>Players above £50M fair price</strong>
                  <span>
                    {activeClub.clubName} squad sample · {activeClub.seasonName}
                  </span>
                </div>
                <div className="progress-value">
                  {
                    activePlayers.filter(
                      (player) => player.fairPrice >= 50000000,
                    ).length
                  }
                </div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--blue"
                  style={{
                    width: `${activePlayers.length ? (playersAboveThreshold / activePlayers.length) * 100 : 0}%`,
                  }}
                ></span>
              </div>
            </div>
          </article>
          <article className="panel activity-panel" id="activity">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recruitment watch</p>
                <h2>Market signals</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="More activity options"
              >
                •••
              </button>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-badge activity-badge--lime">✓</span>
                <div>
                  <strong>Main insight</strong>
                  <span>{activeInsight}</span>
                </div>
                <time>Now</time>
              </div>
              <div className="activity-item">
                <span className="activity-badge activity-badge--coral">↗</span>
                <div>
                  <strong>{activeClub.clubName} versus season average</strong>
                  <span>
                    Transfer KPI is{" "}
                    {activeKpiDelta >= 0
                      ? `${activeKpiDelta.toFixed(1)} points higher`
                      : `${Math.abs(activeKpiDelta).toFixed(1)} points lower`}
                  </span>
                </div>
                <time>Live</time>
              </div>
              <div className="activity-item">
                <span className="activity-badge activity-badge--sky">◷</span>
                <div>
                  <strong>Contract window approaching</strong>
                  <span>
                    Latest recorded contract ends in{" "}
                    {latestContractYear || "an unknown year"}
                  </span>
                </div>
                <time>Data</time>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

export default App;
