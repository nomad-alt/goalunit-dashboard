#!/usr/bin/env python3
"""Stream Goalunit events into compact frontend summaries and assignments."""

import argparse
import csv
import json
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

PROGRESS_ACTIONS = {"PASS", "DRIBBLE"}


def integer(value: str | None) -> int | None:
    try:
        return int(float((value or "").strip()))
    except ValueError:
        return None


def decimal(value: str | None) -> float:
    try:
        return float((value or "").strip())
    except ValueError:
        return 0.0


@dataclass
class ClubSeasonAccumulator:
    club_id: int
    club_name: str
    season_id: int
    season_name: str
    match_ids: set[int] = field(default_factory=set)
    successful_passes: float = 0
    neutral_passes: float = 0
    unsuccessful_passes: float = 0
    shots: float = 0
    expected_goals: float = 0
    positive_progression: float = 0
    duels_won: float = 0
    ball_recoveries: float = 0

    def add(self, row: dict[str, str]) -> None:
        if match_id := integer(row.get("matchId")):
            self.match_ids.add(match_id)
        self.successful_passes += decimal(row.get("SUCCESSFUL_PASSES"))
        self.neutral_passes += decimal(row.get("NEUTRAL_PASSES"))
        self.unsuccessful_passes += decimal(row.get("UNSUCCESSFUL_PASSES"))
        self.shots += decimal(row.get("SHOT_AT_GOAL_NUMBER"))
        self.expected_goals += decimal(row.get("SHOT_XG"))
        self.duels_won += decimal(row.get("WON_GROUND_DUELS"))
        self.duels_won += decimal(row.get("WON_AERIAL_DUELS"))
        self.ball_recoveries += decimal(row.get("BALL_WIN_NUMBER"))

        if row.get("actionType") not in PROGRESS_ACTIONS or row.get("result") == "FAIL":
            return
        start_x = decimal_or_none(row.get("startAdjCoordinatesX"))
        end_x = decimal_or_none(row.get("endAdjCoordinatesX"))
        if start_x is not None and end_x is not None:
            self.positive_progression += max(0, end_x - start_x)

    def summary(self) -> dict[str, object]:
        passes = self.successful_passes + self.neutral_passes + self.unsuccessful_passes
        completed = self.successful_passes + self.neutral_passes
        match_count = len(self.match_ids)
        return {
            "clubId": self.club_id,
            "clubName": self.club_name,
            "seasonId": self.season_id,
            "seasonName": self.season_name,
            "matches": match_count,
            "passes": round(passes),
            "passCompletionPct": round(completed / passes * 100, 1) if passes else 0,
            "shots": round(self.shots),
            "expectedGoals": round(self.expected_goals, 2),
            "possessionValue": round(self.positive_progression / match_count, 1)
            if match_count
            else 0,
            "duelsWon": round(self.duels_won),
            "ballRecoveries": round(self.ball_recoveries),
        }


def decimal_or_none(value: str | None) -> float | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def aggregate_events(
    path: Path,
) -> tuple[list[dict[str, object]], list[dict[str, int]], int, str]:
    summaries: dict[tuple[int, int], ClubSeasonAccumulator] = {}
    assignments: dict[tuple[int, int], dict[int, tuple[str, int]]] = defaultdict(dict)
    row_count = 0
    latest_date = ""

    with path.open(newline="", encoding="utf-8-sig") as source:
        reader = csv.DictReader(source)
        required = {"clubId", "seasonId", "playerId", "matchId", "actionType"}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"events CSV is missing required fields: {', '.join(sorted(missing))}")

        for row in reader:
            row_count += 1
            club_id = integer(row.get("clubId"))
            season_id = integer(row.get("seasonId"))
            if club_id is None or season_id is None:
                continue

            key = (club_id, season_id)
            if key not in summaries:
                summaries[key] = ClubSeasonAccumulator(
                    club_id=club_id,
                    club_name=(row.get("clubName") or "").strip(),
                    season_id=season_id,
                    season_name=(row.get("seasonName") or "").strip(),
                )
            summaries[key].add(row)

            event_date = (row.get("dateutc") or "").strip()
            latest_date = max(latest_date, event_date[:10])
            player_id = integer(row.get("playerId"))
            if player_id is not None:
                candidate = assignments[(player_id, season_id)].get(club_id, ("", 0))
                assignments[(player_id, season_id)][club_id] = (
                    max(candidate[0], event_date),
                    candidate[1] + 1,
                )

            if row_count % 500_000 == 0:
                print(f"Processed {row_count:,} event rows...", flush=True)

    assignment_records = []
    for (player_id, season_id), candidates in assignments.items():
        club_id = max(candidates, key=lambda candidate: candidates[candidate])
        assignment_records.append(
            {"playerId": player_id, "seasonId": season_id, "clubId": club_id}
        )

    return (
        sorted(
            (accumulator.summary() for accumulator in summaries.values()),
            key=lambda record: (record["seasonName"], record["clubName"]),
        ),
        sorted(
            assignment_records,
            key=lambda record: (record["seasonId"], record["playerId"]),
        ),
        row_count,
        latest_date,
    )


def write_typescript(
    output: Path,
    summaries: list[dict[str, object]],
    assignments: list[dict[str, int]],
    row_count: int,
    latest_date: str,
) -> None:
    content = "\n".join(
        [
            "// Generated by scripts/prepare_events.py. Do not edit manually.",
            "",
            "export type ClubPlayingStyleSummary = {",
            "  clubId: number",
            "  clubName: string",
            "  seasonId: number",
            "  seasonName: string",
            "  matches: number",
            "  passes: number",
            "  passCompletionPct: number",
            "  shots: number",
            "  expectedGoals: number",
            "  possessionValue: number",
            "  duelsWon: number",
            "  ballRecoveries: number",
            "}",
            "",
            "export type PlayerClubAssignment = {",
            "  playerId: number",
            "  seasonId: number",
            "  clubId: number",
            "}",
            "",
            f"export const eventRowCount = {row_count}",
            f"export const eventsDataAsOf = {json.dumps(latest_date, ensure_ascii=False)}",
            "",
            "export const clubPlayingStyleSummaries: ClubPlayingStyleSummary[] = "
            + json.dumps(summaries, ensure_ascii=False, indent=2),
            "",
            "export const playerClubAssignments: PlayerClubAssignment[] = "
            + json.dumps(assignments, ensure_ascii=False, indent=2),
            "",
        ]
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--events", type=Path, required=True, help="Path to events.csv")
    parser.add_argument(
        "--output", type=Path, default=Path("src/data/eventData.generated.ts")
    )
    args = parser.parse_args()
    summaries, assignments, row_count, latest_date = aggregate_events(args.events)
    write_typescript(args.output, summaries, assignments, row_count, latest_date)
    print(
        f"Prepared {len(summaries)} club-season summaries and "
        f"{len(assignments)} player assignments from {row_count:,} events -> {args.output}"
    )


if __name__ == "__main__":
    main()
