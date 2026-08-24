import "./App.css";
import {
  averageTransferKpi,
  clubs,
  formatMillions,
  mainInsight,
  selectedClub,
  selectedSeasonPlayers,
  topPlayer,
  transferKpiDelta,
} from "./data/goalunitData";
import { PlayerValueTable } from "./components/PlayerValueTable";
import { TransferKpiChart } from "./components/TransferKpiChart";

function App() {
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
        <button
          className="profile-button"
          type="button"
          aria-label="Open profile menu"
        >
          <span className="avatar">AR</span>
          <span className="profile-name">{selectedClub.clubName}</span>
          <span className="chevron" aria-hidden="true">
            ⌄
          </span>
        </button>
      </header>

      <div className="dashboard" id="overview">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">
              Club overview · {selectedClub.seasonName} season
            </p>
            <h1>
              {selectedClub.clubName} <span className="accent-dot">.</span>
            </h1>
            <p className="subtitle">
              A concise view of club value, market position, and recruitment
              context.
            </p>
          </div>
          <button className="primary-action" type="button">
            <span aria-hidden="true">↗</span> Compare club
          </button>
        </section>

        <section className="stat-grid" aria-label="Club performance statistics">
          <article className="stat-card stat-card--lime">
            <div className="card-heading">
              <span className="stat-icon">↗</span>
              <span>Team performance</span>
            </div>
            <strong>{selectedClub.transferKpi}</strong>
            <div className="stat-footer">
              <span>Transfer KPI</span>
              <span className="trend positive">
                +{transferKpiDelta.toFixed(1)}
              </span>
            </div>
          </article>
          <article className="stat-card stat-card--cream">
            <div className="card-heading">
              <span className="stat-icon">✓</span>
              <span>Financial health</span>
            </div>
            <strong>{formatMillions(selectedClub.totalAssets)}</strong>
            <div className="stat-footer">
              <span>Total assets</span>
              <span className="trend positive">
                {formatMillions(selectedClub.totalRevenues)} rev.
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
              <span className="panel-note">2024/25 · Premier League</span>
            </div>
            <TransferKpiChart
              clubs={clubs}
              selectedClubName={selectedClub.clubName}
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
              players={selectedSeasonPlayers}
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
                  <strong>Highest fair price in sample</strong>
                  <span>
                    {topPlayer.playerName} ·{" "}
                    {formatMillions(topPlayer.fairPrice)}
                  </span>
                </div>
                <div className="progress-value">
                  {formatMillions(topPlayer.fairPrice)}
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
                    {selectedClub.clubName} · dataset average{" "}
                    {averageTransferKpi.toFixed(1)}
                  </span>
                </div>
                <div className="progress-value">{selectedClub.transferKpi}</div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--orange"
                  style={{
                    width: `${Math.min((selectedClub.transferKpi / 30) * 100, 100)}%`,
                  }}
                ></span>
              </div>
              <div className="goal-row">
                <span className="goal-dot goal-dot--blue"></span>
                <div className="goal-copy">
                  <strong>Players above £50M fair price</strong>
                  <span>
                    {selectedClub.clubName} squad sample ·{" "}
                    {selectedClub.seasonName}
                  </span>
                </div>
                <div className="progress-value">
                  {
                    selectedSeasonPlayers.filter(
                      (player) => player.fairPrice >= 50000000,
                    ).length
                  }
                </div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--blue"
                  style={{
                    width: `${(selectedSeasonPlayers.filter((player) => player.fairPrice >= 50000000).length / selectedSeasonPlayers.length) * 100}%`,
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
                  <span>{mainInsight}</span>
                </div>
                <time>Today</time>
              </div>
              <div className="activity-item">
                <span className="activity-badge activity-badge--coral">↗</span>
                <div>
                  <strong>Arsenal ranks above sample average</strong>
                  <span>
                    Transfer KPI is {transferKpiDelta.toFixed(1)} points higher
                  </span>
                </div>
                <time>2d</time>
              </div>
              <div className="activity-item">
                <span className="activity-badge activity-badge--sky">◷</span>
                <div>
                  <strong>Contract window approaching</strong>
                  <span>4 players expire within 18 months</span>
                </div>
                <time>5d</time>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

export default App;
