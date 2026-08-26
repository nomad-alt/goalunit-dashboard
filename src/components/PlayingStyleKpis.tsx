import type { ClubPlayingStyleSummary } from "../data/eventData"

type PlayingStyleKpisProps = {
  summary: ClubPlayingStyleSummary | undefined
}

const integerFormatter = new Intl.NumberFormat("en-GB")

export function PlayingStyleKpis({ summary }: PlayingStyleKpisProps) {
  if (!summary) {
    return <p className="playing-style-empty">No event summary is available for this club and season.</p>
  }

  const metrics = [
    { label: "Passes", value: integerFormatter.format(summary.passes), note: "attempted" },
    { label: "Completion", value: `${summary.passCompletionPct.toFixed(1)}%`, note: "successful + neutral" },
    { label: "Shots", value: integerFormatter.format(summary.shots), note: "shot events" },
    { label: "Expected goals", value: summary.expectedGoals.toFixed(1), note: "cumulative xG" },
    { label: "Possession value", value: `+${integerFormatter.format(Math.round(summary.possessionValue))}m`, note: "positive territory / match" },
    { label: "Duels won", value: integerFormatter.format(summary.duelsWon), note: "ground + aerial" },
    { label: "Ball recoveries", value: integerFormatter.format(summary.ballRecoveries), note: "ball wins" },
  ]

  return (
    <div className="playing-style-grid">
      {metrics.map((metric) => (
        <div className="playing-style-metric" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.note}</small>
        </div>
      ))}
    </div>
  )
}
