export type PlayerClubAssignment = {
  playerId: number
  seasonId: number
  clubId: number
}

// Curated from the club/squad sample used by this prototype because players.csv has no club column.
export const playerClubAssignments: PlayerClubAssignment[] = [
  { playerId: 328209, seasonId: 862, clubId: 2175 },
  { playerId: 406808, seasonId: 862, clubId: 1570 },
  { playerId: 385494, seasonId: 862, clubId: 1255 },
  { playerId: 342411, seasonId: 862, clubId: 2175 },
  { playerId: 299748, seasonId: 862, clubId: 1255 },
  { playerId: 309541, seasonId: 862, clubId: 2263 },
  { playerId: 258117, seasonId: 862, clubId: 1255 },
  { playerId: 426448, seasonId: 862, clubId: 1255 },
  { playerId: 409931, seasonId: 862, clubId: 1255 },
  { playerId: 320421, seasonId: 862, clubId: 1255 },
  { playerId: 365347, seasonId: 862, clubId: 1255 },
  { playerId: 341716, seasonId: 862, clubId: 1255 },
  { playerId: 157546, seasonId: 862, clubId: 1255 },
  { playerId: 271857, seasonId: 862, clubId: 1255 },
  { playerId: 356536, seasonId: 862, clubId: 2175 },
]

export const playerClubBySourceKey = new Map(
  playerClubAssignments.map((assignment) => [
    `${assignment.playerId}:${assignment.seasonId}`,
    assignment.clubId,
  ]),
)