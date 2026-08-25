import type { PlayerRecord } from "../data/goalunitData";

type ContractTimelineProps = {
  players: PlayerRecord[];
  seasonName: string;
};

export function ContractTimeline({
  players,
  seasonName,
}: ContractTimelineProps) {
  const seasonEndYear = Number(seasonName.slice(-4));
  const years = [
    seasonEndYear,
    seasonEndYear + 1,
    seasonEndYear + 2,
    seasonEndYear + 3,
    seasonEndYear + 4,
  ];

  const grouped = years.map((year) => ({
    year,
    count: players.filter(
      (player) => Number(player.contractExpiration.slice(0, 4)) === year,
    ).length,
  }));

  const maxCount = Math.max(...grouped.map((group) => group.count), 1);

  return (
    <div className="timeline-chart">
      <div className="timeline-bars">
        {grouped.map(({ year, count }) => (
          <div key={year} className="timeline-item">
            <span className="timeline-count">{count}</span>
            <div
              className="timeline-bar"
              style={{ height: `${(count / maxCount) * 80}px` }}
            ></div>
            <span className="timeline-year">{year}</span>
          </div>
        ))}
      </div>
      <div className="timeline-axis"></div>
    </div>
  );
}
