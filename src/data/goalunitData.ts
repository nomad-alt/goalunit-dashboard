export type ClubRecord = {
  clubId: number
  competitionName: string
  seasonName: string
  clubName: string
  transferKpi: number
  totalAssets: number
  totalRevenues: number
}

export type PlayerRecord = {
  clubId: number
  playerName: string
  seasonName: string
  fairPrice: number
  contractExpiration: string
}

export const clubs: ClubRecord[] = [
  { clubId: 1255, competitionName: "Premier League", seasonName: "2024/2025", clubName: "Arsenal", transferKpi: 22.7, totalAssets: 1132451000, totalRevenues: 760097000 },
  { clubId: 2121, competitionName: "Premier League", seasonName: "2024/2025", clubName: "Liverpool", transferKpi: 12.7, totalAssets: 897169000, totalRevenues: 787175000 },
  { clubId: 2175, competitionName: "Premier League", seasonName: "2024/2025", clubName: "Manchester City", transferKpi: 25.5, totalAssets: 2183403000, totalRevenues: 766622000 },
  { clubId: 2188, competitionName: "Premier League", seasonName: "2024/2025", clubName: "Manchester United", transferKpi: 26.5, totalAssets: 2458064000, totalRevenues: 741317000 },
]

export const players: PlayerRecord[] = [
  { clubId: 2175, playerName: "Erling Haaland", seasonName: "2024/2025", fairPrice: 197384771, contractExpiration: "2034-06-30" },
  { clubId: 1570, playerName: "Cole Palmer", seasonName: "2024/2025", fairPrice: 159019479, contractExpiration: "2033-06-30" },
  { clubId: 1255, playerName: "Bukayo Saka", seasonName: "2024/2025", fairPrice: 130024906, contractExpiration: "2027-06-30" },
  { clubId: 2175, playerName: "Phil Foden", seasonName: "2024/2025", fairPrice: 113740798, contractExpiration: "2027-06-30" },
  { clubId: 1255, playerName: "Declan Rice", seasonName: "2024/2025", fairPrice: 110001138, contractExpiration: "2028-06-30" },
  { clubId: 2263, playerName: "Alexander Isak", seasonName: "2024/2025", fairPrice: 113735366, contractExpiration: "2028-06-30" },
  { clubId: 1255, playerName: "Martin Ødegaard", seasonName: "2024/2025", fairPrice: 96485573, contractExpiration: "2028-06-30" },
  { clubId: 1255, playerName: "William Saliba", seasonName: "2024/2025", fairPrice: 79009240, contractExpiration: "2027-06-30" },
  { clubId: 1255, playerName: "Gabriel Martinelli", seasonName: "2024/2025", fairPrice: 61752995, contractExpiration: "2027-06-30" },
  { clubId: 1255, playerName: "Gabriel Magalhães", seasonName: "2024/2025", fairPrice: 59161995, contractExpiration: "2027-06-30" },
  { clubId: 1255, playerName: "Jurrien Timber", seasonName: "2024/2025", fairPrice: 58887071, contractExpiration: "2028-06-30" },
  { clubId: 1255, playerName: "Ben White", seasonName: "2024/2025", fairPrice: 37125854, contractExpiration: "2028-06-30" },
  { clubId: 1255, playerName: "Leandro Trossard", seasonName: "2024/2025", fairPrice: 29994298, contractExpiration: "2026-06-30" },
  { clubId: 1255, playerName: "Gabriel Jesus", seasonName: "2024/2025", fairPrice: 27689477, contractExpiration: "2027-06-30" },
]

export const selectedClub = clubs[0]
export const selectedSeasonPlayers = players.filter((player) => player.seasonName === selectedClub.seasonName && player.clubId === selectedClub.clubId)
export const topPlayer = [...selectedSeasonPlayers].sort((firstPlayer, secondPlayer) => secondPlayer.fairPrice - firstPlayer.fairPrice)[0]
export const averageTransferKpi = clubs.reduce((total, club) => total + club.transferKpi, 0) / clubs.length
export const transferKpiDeltaRaw = selectedClub.transferKpi - averageTransferKpi
export const transferKpiDelta = Math.round((transferKpiDeltaRaw + 0.000000001) * 10) / 10
export const transferKpiDeltaPercent = (transferKpiDeltaRaw / averageTransferKpi) * 100
export const mainInsight = `${selectedClub.clubName}'s Transfer KPI is ${transferKpiDelta.toFixed(1)} points above the sample average (${transferKpiDeltaPercent.toFixed(1)}%).`
export const formatMillions = (value: number) => `£${Math.round(value / 1000000)}M`