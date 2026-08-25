import type { ClubRecord } from "../data/goalunitData";

type KpiTrendChartProps = {
  clubs: ClubRecord[];
  clubName: string;
};

export function KpiTrendChart({ clubs, clubName }: KpiTrendChartProps) {
  const clubSeasons = clubs
    .filter((club) => club.clubName === clubName)
    .sort((a, b) => a.seasonName.localeCompare(b.seasonName));

  if (clubSeasons.length < 2)
    return <p className="table-empty">Not enough seasons to show a trend.</p>;

  const chartWidth = 400;
  const chartHeight = 180;
  const padding = { top: 20, right: 20, bottom: 35, left: 45 };
  const maxKpi =
    Math.ceil(Math.max(...clubSeasons.map((club) => club.transferKpi)) / 5) * 5;
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const points = clubSeasons.map((club, index) => ({
    club,
    x: padding.left + (index / Math.max(clubSeasons.length - 1, 1)) * plotWidth,
    y: padding.top + (1 - club.transferKpi / maxKpi) * plotHeight,
  }));
  const linePath = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="chart-wrap">
      <svg
        className="kpi-chart"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label={`${clubName} Transfer KPI trend`}
      >
        <polyline className="chart-line" points={linePath} />
        {points.map(({ club, x, y }) => (
          <g key={club.seasonName}>
            <circle
              className="chart-point chart-point--selected"
              cx={x}
              cy={y}
              r={5}
            />
            <text className="chart-value" x={x} y={y - 12} textAnchor="middle">
              {club.transferKpi}
            </text>
            <text
              className="chart-club-label"
              x={x}
              y={chartHeight - 10}
              textAnchor="middle"
            >
              {club.seasonName}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
