import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PlayingStyleKpis } from "./PlayingStyleKpis"

describe("PlayingStyleKpis", () => {
  it("renders the event-derived club metrics", () => {
    render(
      <PlayingStyleKpis
        summary={{
          clubId: 1255,
          clubName: "Arsenal",
          seasonId: 862,
          seasonName: "2024/2025",
          matches: 38,
          passes: 21477,
          passCompletionPct: 84.8,
          shots: 544,
          expectedGoals: 64.23,
          possessionValue: 3395.1,
          duelsWon: 1416,
          ballRecoveries: 4498,
        }}
      />,
    )

    expect(screen.getByText("21,477")).toBeInTheDocument()
    expect(screen.getByText("84.8%")).toBeInTheDocument()
    expect(screen.getByText("64.2")).toBeInTheDocument()
    expect(screen.getByText("+3,395m")).toBeInTheDocument()
  })

  it("shows an explicit empty state", () => {
    render(<PlayingStyleKpis summary={undefined} />)
    expect(screen.getByText(/No event summary/)).toBeInTheDocument()
  })
})
