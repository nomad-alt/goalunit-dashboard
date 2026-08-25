import { useEffect, useState } from "react";
import "./App.css";
import {
  dataAsOf,
  formatMillions,
  getAvailableClubs,
  getAvailableSeasons,
  getClubOverview,
  getDefaultClubOverview,
  getOverviewWithFallback,
} from "./data/goalunitRepository";
import { clubs } from "./data/goalunitData";
import { ContractRiskTable } from "./components/ContractRiskTable";
import { ContractTimeline } from "./components/ContractTimeline";
import { FairPriceChart } from "./components/FairPriceChart";
import { KpiTrendChart } from "./components/KpiTrendChart";
import { PlayerSearchPanel } from "./components/PlayerSearchPanel";
import { PlayerValueTable } from "./components/PlayerValueTable";
import { RevenueAssetsChart } from "./components/RevenueAssetsChart";
import { TransferKpiChart } from "./components/TransferKpiChart";

function App() {
  const defaultOverview = getDefaultClubOverview();
  const [selectedClubId, setSelectedClubId] = useState(
    defaultOverview.club.clubId,
  );
  const [selectedSeason, setSelectedSeason] = useState(
    defaultOverview.club.seasonName,
  );
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [overview, setOverview] = useState(defaultOverview);
  useEffect(() => {
    let current = true;
    getOverviewWithFallback(selectedClubId, selectedSeason)
      .then((remoteOverview) => {
        if (current) setOverview(remoteOverview);
      })
      .catch(() => {
        if (current)
          setOverview(getClubOverview(selectedClubId, selectedSeason));
      });
    return () => {
      current = false;
    };
  }, [selectedClubId, selectedSeason]);
  const {
    club: activeClub,
    seasonClubs,
    players: activePlayers,
    topPlayer: activeTopPlayer,
    averageTransferKpi: activeAverageKpi,
    transferKpiDelta: activeKpiDelta,
    insight: activeInsight,
    contractsExpiringSoon,
    expiringPlayers,
    revenueToAssetsRatio,
    yearOverYearKpi,
  } = overview;
  const seasons = getAvailableSeasons();

  const handleSeasonChange = (seasonName: string) => {
    setSelectedSeason(seasonName);
    const firstClubInSeason = getAvailableClubs(seasonName)[0];
    if (firstClubInSeason) setSelectedClubId(firstClubInSeason.clubId);
    setShowAllPlayers(false);
  };

  const handleClubChange = (clubId: number) => {
    setSelectedClubId(clubId);
    setShowAllPlayers(false);
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
            <p className="data-provenance">
              Data as of {dataAsOf} · Source snapshot: Goalunit CSV exports
            </p>
          </div>
          <div className="selection-controls" aria-label="Dashboard filters">
            <label>
              Club
              <select
                value={activeClub.clubId}
                onChange={(event) =>
                  handleClubChange(Number(event.target.value))
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
            <button
              className="compare-action"
              type="button"
              onClick={() =>
                document
                  .getElementById("market-comparison")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            >
              <span aria-hidden="true">↗</span> Compare clubs
            </button>
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
              <span className="trend positive">
                {contractsExpiringSoon} due soon
              </span>
            </div>
          </article>
          <article className="stat-card stat-card--sky">
            <div className="card-heading">
              <span className="stat-icon">◎</span>
              <span>Recruitment</span>
            </div>
            <strong>
              {revenueToAssetsRatio.toFixed(1)}
              <span className="unit">%</span>
            </strong>
            <div className="stat-footer">
              <span>Revenue / assets</span>
              <span className="trend neutral">
                {yearOverYearKpi === null
                  ? "No prior"
                  : `${yearOverYearKpi >= 0 ? "+" : ""}${yearOverYearKpi.toFixed(1)} YoY`}
              </span>
            </div>
          </article>
        </section>

        <section className="visual-grid" aria-label="Club and player analysis">
          <article className="panel chart-panel" id="market-comparison">
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
              clubs={seasonClubs}
              selectedClubName={activeClub.clubName}
              onSelectClub={handleClubChange}
            />
          </article>
          <article className="panel table-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Selected club squad</p>
                <h2>Fair price leaders</h2>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => setShowAllPlayers((isVisible) => !isVisible)}
                aria-expanded={showAllPlayers}
              >
                {showAllPlayers ? "Show less" : "View all"}{" "}
                <span aria-hidden="true">{showAllPlayers ? "↑" : "→"}</span>
              </button>
            </div>
            <PlayerValueTable
              players={activePlayers}
              formatValue={formatMillions}
              showAll={showAllPlayers}
            />
          </article>
        </section>

        <section className="analysis-grid" aria-label="Visual analysis">
          <article className="panel analysis-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Season trend</p>
                <h2>Transfer KPI over time</h2>
              </div>
            </div>
            <KpiTrendChart clubs={clubs} clubName={activeClub.clubName} />
          </article>
          <article className="panel analysis-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Financial structure</p>
                <h2>Revenue vs total assets</h2>
              </div>
            </div>
            <RevenueAssetsChart
              clubs={seasonClubs}
              selectedClubName={activeClub.clubName}
            />
          </article>
          <article className="panel analysis-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Squad value</p>
                <h2>Fair price distribution</h2>
              </div>
            </div>
            <FairPriceChart players={activePlayers} />
          </article>
          <article className="panel analysis-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Contract planning</p>
                <h2>Expiry timeline</h2>
              </div>
            </div>
            <ContractTimeline
              players={activePlayers}
              seasonName={activeClub.seasonName}
            />
          </article>
        </section>

        <section className="search-section" aria-label="Player search">
          <article className="panel search-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Player discovery</p>
                <h2>Player search</h2>
              </div>
            </div>
            <PlayerSearchPanel
              players={activePlayers}
              competitionName={activeClub.competitionName}
              seasonName={activeClub.seasonName}
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
              <button
                className="text-button"
                type="button"
                onClick={() => setShowReport((isVisible) => !isVisible)}
                aria-expanded={showReport}
              >
                {showReport ? "Hide report" : "View report"}{" "}
                <span aria-hidden="true">{showReport ? "↑" : "→"}</span>
              </button>
            </div>
            {showReport && (
              <p className="report-note">
                Transfer KPI is compared with clubs in the selected season.
                Player concentration uses the top three fair prices in the
                selected club sample.
              </p>
            )}
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
                  <strong>Contracts expiring within two years</strong>
                  <span>
                    {activeClub.clubName} squad sample · {activeClub.seasonName}
                  </span>
                </div>
                <div className="progress-value">{contractsExpiringSoon}</div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--blue"
                  style={{
                    width: `${activePlayers.length ? (contractsExpiringSoon / activePlayers.length) * 100 : 0}%`,
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
                  <strong>Year-over-year KPI movement</strong>
                  <span>
                    {yearOverYearKpi === null
                      ? "No prior season in the dataset"
                      : `${yearOverYearKpi >= 0 ? "+" : ""}${yearOverYearKpi.toFixed(1)} points versus the previous season`}
                  </span>
                </div>
                <time>Data</time>
              </div>
            </div>
          </article>
        </section>
        <section className="risk-section" aria-label="Contract risk analysis">
          <article className="panel contract-risk-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recruitment watch</p>
                <h2>Contract risk</h2>
              </div>
              <span className="risk-summary">
                {contractsExpiringSoon} players need review
              </span>
            </div>
            <ContractRiskTable
              players={expiringPlayers}
              seasonName={activeClub.seasonName}
            />
          </article>
        </section>
      </div>
    </main>
  );
}

export default App;
