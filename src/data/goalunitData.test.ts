import { describe, expect, it } from "vitest";
import {
  averageTransferKpi,
  clubs,
  getContractExpirationsWithinYears,
  getClubPlayers,
  getAverageTransferKpi,
  getInsight,
  getFairPriceConcentration,
  getKpiExtremes,
  getPlayersExpiringWithinYears,
  getRevenueToAssetsRatio,
  getTopPlayer,
  getYearOverYearKpi,
  formatMillions,
  mainInsight,
  selectedClub,
  selectedSeasonPlayers,
  topPlayer,
  transferKpiDelta,
  transferKpiDeltaPercent,
} from "./goalunitData";
import { playerClubAssignments } from "./playerClubMap";

describe("Goalunit frontend data layer", () => {
  it("filters the player view to the selected club and season", () => {
    expect(selectedSeasonPlayers).toHaveLength(10);
    expect(selectedSeasonPlayers.every((player) => player.clubId === selectedClub.clubId)).toBe(true);
    expect(selectedSeasonPlayers.every((player) => player.seasonName === selectedClub.seasonName)).toBe(true);
    expect(selectedSeasonPlayers.some((player) => player.playerName === "Erling Haaland")).toBe(false);
  });

  it("keeps every curated player relationship keyed to a source record", () => {
    expect(playerClubAssignments).toHaveLength(15);
    expect(selectedSeasonPlayers.every((player) => playerClubAssignments.some((assignment) => assignment.playerId === player.playerId && assignment.seasonId === player.seasonId && assignment.clubId === player.clubId))).toBe(true);
  });

  it("identifies the highest-value player in the selected squad", () => {
    expect(topPlayer.playerName).toBe("Bukayo Saka");
    expect(topPlayer.fairPrice).toBe(130024906);
  });

  it("ranks players by fair price and handles an empty ranking", () => {
    const ranking = getTopPlayer([
      { ...selectedSeasonPlayers[0], fairPrice: 10 },
      { ...selectedSeasonPlayers[1], fairPrice: 20 },
    ]);

    expect(ranking.playerName).toBe(selectedSeasonPlayers[1].playerName);
    expect(getTopPlayer([])).toBeUndefined();
  });

  it("recalculates the player view and insight for another club", () => {
    const cityClub = clubs.find((club) => club.clubName === "Manchester City" && club.seasonName === "2024/2025");
    expect(cityClub).toBeDefined();
    const cityPlayers = getClubPlayers(cityClub!.clubId, cityClub!.seasonName);

    expect(cityPlayers).toHaveLength(2);
    expect(getTopPlayer(cityPlayers).playerName).toBe("Erling Haaland");
    const currentSeasonClubs = clubs.filter((club) => club.seasonName === cityClub!.seasonName);
    expect(getInsight(cityClub!, currentSeasonClubs)).toContain("Manchester City's Transfer KPI is 3.7 points above");
  });

  it("calculates the average Transfer KPI from every club record", () => {
    expect(clubs.filter((club) => club.seasonName === selectedClub.seasonName)).toHaveLength(4);
    expect(averageTransferKpi).toBeCloseTo(21.85, 2);
  });

  it("calculates averages from supplied records and handles empty data", () => {
    expect(getAverageTransferKpi([clubs[0], clubs[1]])).toBeCloseTo(26.65, 2);
    expect(getAverageTransferKpi([])).toBe(0);
  });

  it("calculates contract risk, revenue efficiency, and year-over-year movement", () => {
    expect(getContractExpirationsWithinYears(selectedSeasonPlayers, "2024/2025")).toBe(6);
    expect(getRevenueToAssetsRatio(selectedClub)).toBeCloseTo(67.1, 1);
    expect(getYearOverYearKpi(selectedClub, clubs)).toBeCloseTo(-8.9, 1);
    expect(getYearOverYearKpi(clubs[0], clubs)).toBeNull();
  });

  it("returns expiring players ordered by contract date", () => {
    const expiringPlayers = getPlayersExpiringWithinYears(selectedSeasonPlayers, "2024/2025");

    expect(expiringPlayers).toHaveLength(6);
    expect(expiringPlayers[0].playerName).toBe("Leandro Trossard");
    expect(expiringPlayers[0].contractExpiration).toBe("2026-06-30");
    expect(expiringPlayers.every((player) => player.clubId === selectedClub.clubId)).toBe(true);
  });

  it("finds the highest and lowest Transfer KPI clubs", () => {
    const currentSeasonClubs = clubs.filter((club) => club.seasonName === selectedClub.seasonName);
    const { highest, lowest } = getKpiExtremes(currentSeasonClubs);

    expect(highest.clubName).toBe("Manchester United");
    expect(highest.transferKpi).toBe(26.5);
    expect(lowest.clubName).toBe("Liverpool");
    expect(lowest.transferKpi).toBe(12.7);
  });

  it("calculates fair-price concentration among the top players", () => {
    expect(getFairPriceConcentration(selectedSeasonPlayers)).toBeCloseTo(48.8, 1);
    expect(getFairPriceConcentration([])).toBe(0);
  });

  it("calculates and describes the selected club's KPI delta", () => {
    expect(transferKpiDelta).toBe(0.9);
    expect(transferKpiDeltaPercent).toBeCloseTo(3.89, 2);
    expect(mainInsight).toBe("Arsenal's Transfer KPI is 0.9 points above the sample average (3.9%). Highest: Manchester United (26.5); lowest: Liverpool (12.7). Top three players represent 48.8% of squad fair price.");
  });

  it("formats currency values in millions", () => {
    expect(formatMillions(130024906)).toBe("£130M");
    expect(formatMillions(0)).toBe("£0M");
  });
});