import csv
import tempfile
import unittest
from pathlib import Path

from scripts.prepare_data import (
    MAX_FAIR_PRICE,
    DataValidationError,
    clean,
    number,
    prepare_clubs,
    prepare_players,
    validate_prepared_data,
)


class PrepareDataTests(unittest.TestCase):
    def test_clean_turns_blank_values_into_none(self):
        self.assertEqual(clean("  Arsenal  "), "Arsenal")
        self.assertIsNone(clean("   "))
        self.assertIsNone(clean(None))

    def test_number_parses_decimal_and_integer_values(self):
        self.assertEqual(number("22.7"), 22.7)
        self.assertEqual(number("1255", integer=True), 1255)
        self.assertEqual(number("1255.5", integer=True), 1255.5)
        self.assertIsNone(number(""))

    def test_prepare_clubs_selects_fields_and_deduplicates_records(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "clubs.csv"
            rows = [
                {
                    "seasonId": "862",
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
                    "seasonId": "862",
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
                    "seasonId": "862",
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
        self.assertEqual(clubs[0]["seasonId"], 862)
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
                    "seasonId": "862",
                    "playerName": "Example Player",
                    "seasonName": "2024/2025",
                    "contractExpiration": "2028-06-30",
                    "fairPrice": "50000000",
                },
                {
                    "playerId": "1",
                    "seasonId": "862",
                    "playerName": "Example Player",
                    "seasonName": "2024/2025",
                    "contractExpiration": "2028-06-30",
                    "fairPrice": "65000000",
                },
                {
                    "playerId": "2",
                    "seasonId": "862",
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

    def test_validation_accepts_well_formed_prepared_data(self):
        validate_prepared_data(self._valid_clubs(), self._valid_players())

    def test_validation_reports_required_ids_seasons_and_financial_values(self):
        clubs = self._valid_clubs()
        clubs[0].update(
            clubId=None,
            seasonId=0,
            seasonName="2024/2024",
            totalAssets=-1,
            totalRevenues=float("inf"),
        )

        with self.assertRaises(DataValidationError) as context:
            validate_prepared_data(clubs, self._valid_players())

        message = str(context.exception)
        for field in (
            "clubId",
            "seasonId",
            "seasonName",
            "totalAssets",
            "totalRevenues",
        ):
            self.assertIn(field, message)

    def test_validation_reports_fair_price_and_contract_date_errors(self):
        players = self._valid_players()
        players[0]["fairPrice"] = -1
        players.append(
            {
                **self._valid_players()[0],
                "playerId": 2,
                "fairPrice": MAX_FAIR_PRICE + 1,
                "contractExpiration": "2025-02-29",
            }
        )

        with self.assertRaises(DataValidationError) as context:
            validate_prepared_data(self._valid_clubs(), players)

        message = str(context.exception)
        self.assertIn("finite non-negative", message)
        self.assertIn("must not exceed", message)
        self.assertIn("valid calendar date", message)

    def test_validation_reports_duplicate_logical_records(self):
        clubs = self._valid_clubs()
        players = self._valid_players()
        clubs.append({**clubs[0]})
        players.append({**players[0]})

        with self.assertRaises(DataValidationError) as context:
            validate_prepared_data(clubs, players)

        message = str(context.exception)
        self.assertIn("duplicates clubs[0]", message)
        self.assertIn("duplicates players[0]", message)

    @staticmethod
    def _valid_clubs() -> list[dict[str, object]]:
        return [
            {
                "seasonId": 862,
                "competitionName": "Premier League",
                "seasonName": "2024/2025",
                "clubId": 1255,
                "clubName": "Arsenal",
                "transferKpi": 22.7,
                "totalAssets": 1_132_451_000,
                "totalRevenues": 760_097_000,
            }
        ]

    @staticmethod
    def _valid_players() -> list[dict[str, object]]:
        return [
            {
                "playerId": 1,
                "seasonId": 862,
                "playerName": "Example Player",
                "seasonName": "2024/2025",
                "contractExpiration": "2028-06-30",
                "fairPrice": 65_000_000,
                "clubId": None,
            }
        ]

    @staticmethod
    def _write_csv(path: Path, rows: list[dict[str, str]]) -> None:
        with path.open("w", newline="", encoding="utf-8") as output:
            writer = csv.DictWriter(output, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)


if __name__ == "__main__":
    unittest.main()
