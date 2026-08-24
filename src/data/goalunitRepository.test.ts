import { describe, expect, it } from "vitest";
import { getAvailableClubs, getAvailableSeasons, getClubOverview } from "./goalunitRepository";

describe("Goalunit repository", () => {
  it("returns the selected club overview with derived values", () => {
    const overview = getClubOverview(1255, "2024/2025");

    expect(overview.club.clubName).toBe("Arsenal");
    expect(overview.players).toHaveLength(10);
    expect(overview.topPlayer?.playerName).toBe("Bukayo Saka");
    expect(overview.contractsExpiringSoon).toBe(6);
    expect(overview.yearOverYearKpi).toBeCloseTo(-8.9, 1);
  });

  it("exposes selector options from the local data source", () => {
    expect(getAvailableSeasons()).toEqual(["2023/2024", "2024/2025"]);
    expect(getAvailableClubs("2024/2025")).toHaveLength(4);
  });

  it("falls back to the first club when a selection is unavailable", () => {
    const overview = getClubOverview(9999, "2024/2025");

    expect(overview.club.clubName).toBe("Arsenal");
  });
});