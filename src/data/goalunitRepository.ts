import {
  clubs,
  getAverageTransferKpi,
  getContractExpirationsWithinYears,
  getClubPlayers,
  getInsight,
  getPlayersExpiringWithinYears,
  getRevenueToAssetsRatio,
  getTopPlayer,
  getYearOverYearKpi,
  type ClubRecord,
  type PlayerRecord,
} from "./goalunitData";

export { dataAsOf, formatMillions } from "./goalunitData";

export type ClubOverview = {
  club: ClubRecord
  seasonClubs: ClubRecord[]
  players: PlayerRecord[]
  topPlayer: PlayerRecord | undefined
  averageTransferKpi: number
  transferKpiDelta: number
  insight: string
  contractsExpiringSoon: number
  expiringPlayers: PlayerRecord[]
  revenueToAssetsRatio: number
  yearOverYearKpi: number | null
}

export const getAvailableSeasons = () => [...new Set(clubs.map((club) => club.seasonName))]

export const getAvailableClubs = (seasonName: string) => clubs.filter((club) => club.seasonName === seasonName)

export const getClubOverview = (clubId: number, seasonName: string): ClubOverview => {
  const seasonClubs = getAvailableClubs(seasonName)
  const club = seasonClubs.find((record) => record.clubId === clubId) ?? seasonClubs[0] ?? clubs[0]
  const clubPlayers = getClubPlayers(club.clubId, club.seasonName)
  const comparisonClubs = seasonClubs.length ? seasonClubs : clubs
  const averageTransferKpi = getAverageTransferKpi(comparisonClubs)

  return {
    club,
    seasonClubs: comparisonClubs,
    players: clubPlayers,
    topPlayer: getTopPlayer(clubPlayers),
    averageTransferKpi,
    transferKpiDelta: club.transferKpi - averageTransferKpi,
    insight: getInsight(club, comparisonClubs, clubPlayers),
    contractsExpiringSoon: getContractExpirationsWithinYears(clubPlayers, club.seasonName),
    expiringPlayers: getPlayersExpiringWithinYears(clubPlayers, club.seasonName),
    revenueToAssetsRatio: getRevenueToAssetsRatio(club),
    yearOverYearKpi: getYearOverYearKpi(club, clubs),
  }
}

export const getDefaultClubOverview = () => getClubOverview(1255, "2024/2025")

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api"

export const fetchClubOverview = async (clubId: number, seasonName: string): Promise<ClubOverview> => {
  const response = await fetch(`${apiBaseUrl}/club-overview?clubId=${clubId}&season=${encodeURIComponent(seasonName)}`)
  if (!response.ok) throw new Error(`Goalunit API returned ${response.status}`)
  const overview = await response.json() as ClubOverview
  return {
    ...overview,
    seasonClubs: overview.seasonClubs ?? [],
    players: overview.players ?? [],
    expiringPlayers: overview.expiringPlayers ?? [],
  }
}