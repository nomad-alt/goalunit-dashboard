import type { ClubRecord } from "../data/goalunitData";

type TransferKpiChartProps = {
  clubs: ClubRecord[]
  selectedClubName: string
}

export function TransferKpiChart({ clubs, selectedClubName }: TransferKpiChartProps) {
  const chartWidth = 560
  const chartHeight = 220
  const chartPadding = { top: 18, right: 20, bottom: 42, left: 42 }
  const maximumKpi = Math.ceil(Math.max(...clubs.map((club) => club.transferKpi)) / 5) * 5
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom
  const points = clubs.map((club, index) => ({
    club,
    x: chartPadding.left + (index / Math.max(clubs.length - 1, 1)) * plotWidth,
    y: chartPadding.top + (1 - club.transferKpi / maximumKpi) * plotHeight,
  }))
  const linePath = points.map((point) => `${point.x},${point.y}`).join(" ")
  const gridValues = [0, maximumKpi / 2, maximumKpi]

  return (
    <div className="chart-wrap">
      <svg className="kpi-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Transfer KPI comparison by club">
        {gridValues.map((value) => {
          const y = chartPadding.top + (1 - value / maximumKpi) * plotHeight
          return (
            <g key={value}>
              <line className="chart-grid-line" x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} />
              <text className="chart-axis-label" x={chartPadding.left - 10} y={y + 4} textAnchor="end">{value}</text>
            </g>
          )
        })}
        <polyline className="chart-line" points={linePath} />
        {points.map(({ club, x, y }) => {
          const isSelected = club.clubName === selectedClubName
          return (
            <g key={club.clubName}>
              <circle className={isSelected ? "chart-point chart-point--selected" : "chart-point"} cx={x} cy={y} r={isSelected ? 6 : 4} />
              <text className="chart-value" x={x} y={y - 13} textAnchor="middle">{club.transferKpi}</text>
              <text className="chart-club-label" x={x} y={chartHeight - 15} textAnchor="middle">{club.clubName === "Manchester United" ? "Man Utd" : club.clubName === "Manchester City" ? "Man City" : club.clubName}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}