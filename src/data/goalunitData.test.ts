import { describe, expect, it } from "vitest";
import {
  averageTransferKpi,
  clubs,
  mainInsight,
  selectedClub,
  selectedSeasonPlayers,
  topPlayer,
  transferKpiDelta,
  transferKpiDeltaPercent,
} from "./goalunitData";

describe("Goalunit frontend data layer", () => {
  it("filters the player view to the selected club and season", () => {
    expect(selectedSeasonPlayers).toHaveLength(10);
    expect(selectedSeasonPlayers.every((player) => player.clubId === selectedClub.clubId)).toBe(true);
    expect(selectedSeasonPlayers.every((player) => player.seasonName === selectedClub.seasonName)).toBe(true);
    expect(selectedSeasonPlayers.some((player) => player.playerName === "Erling Haaland")).toBe(false);
  });

  it("identifies the highest-value player in the selected squad", () => {
    expect(topPlayer.playerName).toBe("Bukayo Saka");
    expect(topPlayer.fairPrice).toBe(130024906);
  });

  it("calculates the average Transfer KPI from every club record", () => {
    expect(clubs).toHaveLength(4);
    expect(averageTransferKpi).toBeCloseTo(21.85, 2);
  });

  it("calculates and describes the selected club's KPI delta", () => {
    expect(transferKpiDelta).toBe(0.9);
    expect(transferKpiDeltaPercent).toBeCloseTo(3.89, 2);
    expect(mainInsight).toBe("Arsenal's Transfer KPI is 0.9 points above the sample average (3.9%).");
  });
});