import {
  playerClubAssignments,
  type PlayerClubAssignment,
} from "./eventData.generated"

export { playerClubAssignments, type PlayerClubAssignment }

export const playerClubBySourceKey = new Map(
  playerClubAssignments.map((assignment) => [
    `${assignment.playerId}:${assignment.seasonId}`,
    assignment.clubId,
  ]),
)
