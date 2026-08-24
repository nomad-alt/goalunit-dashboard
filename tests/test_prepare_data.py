import csv
import tempfile
import unittest
from pathlib import Path

from scripts.prepare_data import clean, number, prepare_clubs, prepare_players


class PrepareDataTests(unittest.TestCase):
    def test_clean_turns_blank_values_into_none(self):
        self.assertEqual(clean("  Arsenal  "), "Arsenal")
        self.assertIsNone(clean("   "))
        self.assertIsNone(clean(None))

    def test_number_parses_decimal_and_integer_values(self):
        self.assertEqual(number("22.7"), 22.7)
        self.assertEqual(number("1255", integer=True), 1255)
        self.assertIsNone(number(""))

    def test_prepare_clubs_selects_fields_and_deduplicates_records(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "clubs.csv"
            rows = [
                {
                    "competitionName": "Premier League",
                    "seasonName": "2024/2025",
                    "clubId": "1255",
                    "clubName": "Arsenal",
                    "transferkpi": "22.7",
                    "totalAssets": "1132451000",
                    "totalRevenues": "760097000",
                    "ignored": "value",
                },
                {
                    "competitionName": "Premier League",
                    "seasonName": "2024/2025",
                    "clubId": "1255",
                    "clubName": "Arsenal",
                    "transferkpi": "22.7",
                    "totalAssets": "1132451000",
                    "totalRevenues": "760097000",
                    "ignored": "duplicate",
                },
                {
                    "competitionName": "Premier League",
                    "seasonName": "2024/2025",
                    "clubId": "2121",
                    "clubName": "Liverpool",
                    "transferkpi": "",
                    "totalAssets": "",
                    "totalRevenues": "787175000",
                    "ignored": "value",
                },
            ]
            self._write_csv(path, rows)

            clubs = prepare_clubs(path)

        self.assertEqual(len(clubs), 2)
        self.assertEqual(clubs[0]["clubId"], 1255)
        self.assertEqual(clubs[0]["transferKpi"], 22.7)
        self.assertIsNone(clubs[1]["transferKpi"])
        self.assertIsNone(clubs[1]["totalAssets"])
        self.assertNotIn("ignored", clubs[0])

    def test_prepare_players_keeps_highest_snapshot_and_normalizes_missing_values(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "players.csv"
            rows = [
                {
                    "playerId": "1",
                    "playerName": "Example Player",
                    "seasonName": "2024/2025",
                    "contractExpiration": "2028-06-30",
                    "fairPrice": "50000000",
                },
                {
                    "playerId": "1",
                    "playerName": "Example Player",
                    "seasonName": "2024/2025",
                    "contractExpiration": "2028-06-30",
                    "fairPrice": "65000000",
                },
                {
                    "playerId": "2",
                    "playerName": "Unpriced Player",
                    "seasonName": "2024/2025",
                    "contractExpiration": "",
                    "fairPrice": "",
                },
            ]
            self._write_csv(path, rows)

            players = prepare_players(path)

        self.assertEqual(len(players), 2)
        self.assertEqual(players[0]["fairPrice"], 65000000.0)
        self.assertIsNone(players[1]["fairPrice"])
        self.assertIsNone(players[1]["contractExpiration"])
        self.assertIsNone(players[0]["clubId"])

    @staticmethod
    def _write_csv(path: Path, rows: list[dict[str, str]]) -> None:
        with path.open("w", newline="", encoding="utf-8") as output:
            writer = csv.DictWriter(output, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)


if __name__ == "__main__":
    unittest.main()
