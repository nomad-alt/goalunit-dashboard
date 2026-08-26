import {
  clubPlayingStyleSummaries,
  eventRowCount,
  eventsDataAsOf,
  type ClubPlayingStyleSummary,
} from "./eventData.generated"

export {
  clubPlayingStyleSummaries,
  eventRowCount,
  eventsDataAsOf,
  type ClubPlayingStyleSummary,
}

const summaryByClubSeason = new Map(
  clubPlayingStyleSummaries.map((summary) => [
    `${summary.clubId}:${summary.seasonName}`,
    summary,
  ]),
)

export const getClubPlayingStyleSummary = (clubId: number, seasonName: string) =>
  summaryByClubSeason.get(`${clubId}:${seasonName}`)
