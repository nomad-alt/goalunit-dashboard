import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App interactions", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API unavailable")));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("switches clubs from the club selector", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Club" }),
      "2175",
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: /Manchester City/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Club" })).toHaveValue("2175");
  });

  it("switches seasons and selects the first club in that season", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Season" }),
      "2023/2024",
    );

    expect(
      await screen.findByText("Club overview · 2023/2024 season"),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Club" })).toHaveValue("1255");
  });

  it("switches clubs when a Transfer KPI chart point is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Select Manchester United" }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /Manchester United/,
      }),
    ).toBeInTheDocument();
  });

  it("expands and collapses the player table", async () => {
    const user = userEvent.setup();
    render(<App />);
    const table = screen.getByRole("table", {
      name: "Players ranked by fair price",
    });

    expect(within(table).getAllByRole("row")).toHaveLength(6);

    await user.click(screen.getByRole("button", { name: /View all/ }));

    expect(within(table).getAllByRole("row").length).toBeGreaterThan(6);
    expect(screen.getByRole("button", { name: /Show less/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /Show less/ }));

    expect(within(table).getAllByRole("row")).toHaveLength(6);
  });

  it("opens and closes the methodology report", async () => {
    const user = userEvent.setup();
    render(<App />);
    const reportText =
      "Transfer KPI is compared with clubs in the selected season. Player concentration uses the top three fair prices in the selected club sample.";

    expect(screen.queryByText(reportText)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /View report/ }));

    expect(screen.getByText(reportText)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hide report/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /Hide report/ }));

    expect(screen.queryByText(reportText)).not.toBeInTheDocument();
  });
});
