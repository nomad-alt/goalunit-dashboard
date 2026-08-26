import csv
import tempfile
import unittest
from pathlib import Path

from scripts.prepare_events import aggregate_events, write_typescript


class PrepareEventsTests(unittest.TestCase):
    def test_aggregates_playing_style_metrics_and_latest_club_assignment(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "events.csv"
            self._write_csv(
                path,
                [
                    self._event(
                        matchId="10",
                        dateutc="2025-01-01 12:00:00",
                        actionType="PASS",
                        result="SUCCESS",
                        SUCCESSFUL_PASSES="1",
                        startAdjCoordinatesX="-20",
                        endAdjCoordinatesX="10",
                        SHOT_AT_GOAL_NUMBER="",
                    ),
                    self._event(
                        matchId="11",
                        dateutc="2025-02-01 12:00:00",
                        actionType="SHOT",
                        result="FAIL",
                        SHOT_AT_GOAL_NUMBER="1",
                        SHOT_XG="0.25",
                        WON_GROUND_DUELS="1",
                        BALL_WIN_NUMBER="1",
                    ),
                    self._event(
                        clubId="2175",
                        clubName="Manchester City",
                        matchId="12",
                        dateutc="2025-03-01 12:00:00",
                        actionType="PASS",
                        result="FAIL",
                        UNSUCCESSFUL_PASSES="1",
                        startAdjCoordinatesX="20",
                        endAdjCoordinatesX="-10",
                    ),
                ],
            )

            summaries, assignments, row_count, latest_date = aggregate_events(path)

        arsenal = next(summary for summary in summaries if summary["clubId"] == 1255)
        self.assertEqual(arsenal["matches"], 2)
        self.assertEqual(arsenal["passes"], 1)
        self.assertEqual(arsenal["passCompletionPct"], 100)
        self.assertEqual(arsenal["shots"], 1)
        self.assertEqual(arsenal["expectedGoals"], 0.25)
        self.assertEqual(arsenal["possessionValue"], 15)
        self.assertEqual(arsenal["duelsWon"], 1)
        self.assertEqual(arsenal["ballRecoveries"], 1)
        self.assertEqual(assignments, [{"playerId": 1, "seasonId": 862, "clubId": 2175}])
        self.assertEqual(row_count, 3)
        self.assertEqual(latest_date, "2025-03-01")

    def test_writes_a_typed_frontend_artifact(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "events.generated.ts"
            write_typescript(
                output,
                [
                    {
                        "clubId": 1255,
                        "clubName": "Arsenal",
                        "seasonId": 862,
                        "seasonName": "2024/2025",
                        "matches": 38,
                        "passes": 100,
                        "passCompletionPct": 90,
                        "shots": 20,
                        "expectedGoals": 10.5,
                        "possessionValue": 50,
                        "duelsWon": 40,
                        "ballRecoveries": 30,
                    }
                ],
                [{"playerId": 1, "seasonId": 862, "clubId": 1255}],
                123,
                "2025-05-25",
            )

            content = output.read_text(encoding="utf-8")

        self.assertIn("ClubPlayingStyleSummary", content)
        self.assertIn("clubPlayingStyleSummaries", content)
        self.assertIn('"clubName": "Arsenal"', content)
        self.assertIn("eventRowCount = 123", content)

    @staticmethod
    def _event(**overrides: str) -> dict[str, str]:
        row = {
            "clubId": "1255",
            "clubName": "Arsenal",
            "seasonId": "862",
            "seasonName": "2024/2025",
            "matchId": "10",
            "playerId": "1",
            "dateutc": "2025-01-01 12:00:00",
            "actionType": "PASS",
            "result": "SUCCESS",
            "SUCCESSFUL_PASSES": "",
            "NEUTRAL_PASSES": "",
            "UNSUCCESSFUL_PASSES": "",
            "SHOT_AT_GOAL_NUMBER": "",
            "SHOT_XG": "",
            "WON_GROUND_DUELS": "",
            "WON_AERIAL_DUELS": "",
            "BALL_WIN_NUMBER": "",
            "startAdjCoordinatesX": "",
            "endAdjCoordinatesX": "",
        }
        row.update(overrides)
        return row

    @staticmethod
    def _write_csv(path: Path, rows: list[dict[str, str]]) -> None:
        with path.open("w", newline="", encoding="utf-8") as output:
            writer = csv.DictWriter(output, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)


if __name__ == "__main__":
    unittest.main()
