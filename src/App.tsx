import "./App.css";

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
          <span className="avatar">RM</span>
          <span className="profile-name">Real Madrid (M)</span>
          <span className="chevron" aria-hidden="true">
            ⌄
          </span>
        </button>
      </header>

      <div className="dashboard" id="overview">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">Club overview · 2025/26 season</p>
            <h1>
              Real Madrid <span className="accent-dot">(M)</span>
            </h1>
            <p className="subtitle">
              A quick read on squad structure, performance, and market value.
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
            <strong>735</strong>
            <div className="stat-footer">
              <span>Power rank</span>
              <span className="trend positive">+4.2%</span>
            </div>
          </article>
          <article className="stat-card stat-card--cream">
            <div className="card-heading">
              <span className="stat-icon">✓</span>
              <span>Financial health</span>
            </div>
            <strong>
              €1.18<span className="unit">B</span>
            </strong>
            <div className="stat-footer">
              <span>Fair squad price</span>
              <span className="trend positive">+6.8%</span>
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
              <span>U23 playing time</span>
              <span className="trend positive">+5.0%</span>
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
              <span>Average contract length</span>
              <span className="trend neutral">-2 mo</span>
            </div>
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
                  <strong>Share of market value · U25 players</strong>
                  <span>Real Madrid 47% · League average 54%</span>
                </div>
                <div className="progress-value">47%</div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--green"
                  style={{ width: "47%" }}
                ></span>
              </div>
              <div className="goal-row">
                <span className="goal-dot goal-dot--orange"></span>
                <div className="goal-copy">
                  <strong>Playing time · U23 players</strong>
                  <span>Real Madrid 32% · League average 30%</span>
                </div>
                <div className="progress-value">32%</div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--orange"
                  style={{ width: "32%" }}
                ></span>
              </div>
              <div className="goal-row">
                <span className="goal-dot goal-dot--blue"></span>
                <div className="goal-copy">
                  <strong>Average contract length</strong>
                  <span>Real Madrid 34 months · League average 29</span>
                </div>
                <div className="progress-value">34 mo</div>
              </div>
              <div className="progress-track">
                <span
                  className="progress-fill progress-fill--blue"
                  style={{ width: "68%" }}
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
                  <strong>Squad value is rising</strong>
                  <span>Fair price up 6.8% this season</span>
                </div>
                <time>Today</time>
              </div>
              <div className="activity-item">
                <span className="activity-badge activity-badge--coral">↗</span>
                <div>
                  <strong>U25 value share below average</strong>
                  <span>7 percentage points below La Liga</span>
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
