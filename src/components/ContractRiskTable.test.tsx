import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContractRiskTable } from "./ContractRiskTable";

describe("ContractRiskTable", () => {
  it("renders the empty state when no contracts are at risk", () => {
    render(<ContractRiskTable players={[]} seasonName="2024/2025" />);

    expect(
      screen.getByText(
        "No contract expirations recorded for this club and season.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
