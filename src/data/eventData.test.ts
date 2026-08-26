import { describe, expect, it } from "vitest"
import {
  clubPlayingStyleSummaries,
  eventRowCount,
  eventsDataAsOf,
  getClubPlayingStyleSummary,
} from "./eventData"

describe("Generated event data", () => {
  it("ships compact summaries for every club-season", () => {
    expect(clubPlayingStyleSummaries).toHaveLength(40)
    expect(eventRowCount).toBe(2249813)
    expect(eventsDataAsOf).toBe("2025-05-25")
  })

  it("returns Arsenal's event-derived playing style", () => {
    const summary = getClubPlayingStyleSummary(1255, "2024/2025")

    expect(summary).toMatchObject({
      matches: 38,
      passes: 21477,
      passCompletionPct: 84.8,
      shots: 544,
      expectedGoals: 64.23,
      duelsWon: 1416,
      ballRecoveries: 4498,
    })
  })
})
