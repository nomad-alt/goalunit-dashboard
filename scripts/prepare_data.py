#!/usr/bin/env python3
"""Prepare the supplied Goalunit CSV files for the TypeScript frontend."""

import argparse
import csv
import math
import re
from collections.abc import Iterable
from datetime import date
from pathlib import Path

MAX_FAIR_PRICE = 1_000_000_000
SEASON_PATTERN = re.compile(r"^(\d{4})/(\d{4})$")
ISO_DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")

CLUB_FIELDS = (
    "seasonId",
    "competitionName",
    "seasonName",
    "clubId",
    "clubName",
    "transferkpi",
    "totalAssets",
    "totalRevenues",
)
PLAYER_FIELDS = (
    "playerId",
    "seasonId",
    "playerName",
    "seasonName",
    "contractExpiration",
    "fairPrice",
)


class DataValidationError(ValueError):
    """Raised when prepared Goalunit records do not satisfy the data contract."""

    def __init__(self, issues: Iterable[str]) -> None:
        self.issues = list(issues)
        details = "\n".join(f"- {issue}" for issue in self.issues)
        super().__init__(f"Prepared data validation failed:\n{details}")


def clean(value: str | None) -> str | None:
    value = (value or "").strip()
    return value or None


def number(value: str | None, integer: bool = False) -> int | float | None:
    value = clean(value)
    if value is None:
        return None
    parsed = float(value)
    if integer and math.isfinite(parsed) and parsed.is_integer():
        return int(parsed)
    return parsed


def read_csv(path: Path, fields: tuple[str, ...]) -> list[dict[str, str | None]]:
    with path.open(newline="", encoding="utf-8-sig") as source:
        return [
            {field: clean(row.get(field)) for field in fields}
            for row in csv.DictReader(source)
        ]


def prepare_clubs(path: Path) -> list[dict[str, object]]:
    records = []
    seen: set[tuple[str | None, str | None]] = set()
    for row in read_csv(path, CLUB_FIELDS):
        key = (row["seasonId"], row["clubId"])
        if key in seen:
            continue
        seen.add(key)
        records.append(
            {
                "seasonId": number(row["seasonId"], integer=True),
                "competitionName": row["competitionName"],
                "seasonName": row["seasonName"],
                "clubId": number(row["clubId"], integer=True),
                "clubName": row["clubName"],
                "transferKpi": number(row["transferkpi"]),
                "totalAssets": number(row["totalAssets"], integer=True),
                "totalRevenues": number(row["totalRevenues"], integer=True),
            }
        )
    return records


def prepare_players(path: Path) -> list[dict[str, object]]:
    records: dict[tuple[int | float | None, int | float | None], dict[str, object]] = {}
    for row in read_csv(path, PLAYER_FIELDS):
        player_id = number(row["playerId"], integer=True)
        season_id = number(row["seasonId"], integer=True)
        key = (player_id, season_id)
        record = {
            "playerId": player_id,
            "seasonId": season_id,
            "playerName": row["playerName"],
            "seasonName": row["seasonName"],
            "contractExpiration": row["contractExpiration"],
            "fairPrice": number(row["fairPrice"]),
            "clubId": None,
        }
        current = records.get(key)
        if current is None or (record["fairPrice"] or 0) > (current["fairPrice"] or 0):
            records[key] = record
    return sorted(
        records.values(),
        key=lambda player: (-(player["fairPrice"] or 0), player["playerName"] or ""),
    )


def _record_label(kind: str, index: int) -> str:
    return f"{kind}[{index}]"


def _validate_required_id(
    record: dict[str, object], field: str, label: str, issues: list[str]
) -> None:
    value = record.get(field)
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        issues.append(f"{label}.{field} must be a positive integer (got {value!r})")


def _validate_season(value: object, label: str, issues: list[str]) -> None:
    match = SEASON_PATTERN.fullmatch(value) if isinstance(value, str) else None
    if match is None or int(match.group(2)) != int(match.group(1)) + 1:
        issues.append(
            f"{label}.seasonName must use consecutive YYYY/YYYY years (got {value!r})"
        )


def _validate_non_negative_number(
    record: dict[str, object], field: str, label: str, issues: list[str]
) -> None:
    value = record.get(field)
    if value is None:
        return
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        or value < 0
    ):
        issues.append(
            f"{label}.{field} must be a finite non-negative number (got {value!r})"
        )


def _validate_contract_date(value: object, label: str, issues: list[str]) -> None:
    if value is None:
        return
    if not isinstance(value, str) or ISO_DATE_PATTERN.fullmatch(value) is None:
        issues.append(
            f"{label}.contractExpiration must be an ISO date in YYYY-MM-DD format (got {value!r})"
        )
        return
    try:
        date.fromisoformat(value)
    except ValueError:
        issues.append(
            f"{label}.contractExpiration is not a valid calendar date (got {value!r})"
        )


def validate_prepared_data(
    clubs: list[dict[str, object]], players: list[dict[str, object]]
) -> None:
    """Validate normalized records before emitting TypeScript output."""

    issues: list[str] = []
    club_keys: dict[tuple[object, object], int] = {}
    for index, club in enumerate(clubs):
        label = _record_label("clubs", index)
        _validate_required_id(club, "clubId", label, issues)
        _validate_required_id(club, "seasonId", label, issues)
        _validate_season(club.get("seasonName"), label, issues)
        _validate_non_negative_number(club, "totalAssets", label, issues)
        _validate_non_negative_number(club, "totalRevenues", label, issues)
        key = (club.get("clubId"), club.get("seasonId"))
        if key in club_keys:
            issues.append(
                f"{label} duplicates clubs[{club_keys[key]}] for clubId/seasonId {key!r}"
            )
        else:
            club_keys[key] = index

    player_keys: dict[tuple[object, object], int] = {}
    for index, player in enumerate(players):
        label = _record_label("players", index)
        _validate_required_id(player, "playerId", label, issues)
        _validate_required_id(player, "seasonId", label, issues)
        _validate_season(player.get("seasonName"), label, issues)
        _validate_non_negative_number(player, "fairPrice", label, issues)
        fair_price = player.get("fairPrice")
        if (
            isinstance(fair_price, (int, float))
            and not isinstance(fair_price, bool)
            and math.isfinite(fair_price)
            and fair_price > MAX_FAIR_PRICE
        ):
            issues.append(
                f"{label}.fairPrice must not exceed {MAX_FAIR_PRICE} (got {fair_price!r})"
            )
        _validate_contract_date(player.get("contractExpiration"), label, issues)
        key = (player.get("playerId"), player.get("seasonId"))
        if key in player_keys:
            issues.append(
                f"{label} duplicates players[{player_keys[key]}] for playerId/seasonId {key!r}"
            )
        else:
            player_keys[key] = index

    if issues:
        raise DataValidationError(issues)


def ts(value: object) -> str:
    if value is None:
        return "null"
    if isinstance(value, str):
        return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return str(value)


def write_typescript(
    output: Path, clubs: list[dict[str, object]], players: list[dict[str, object]]
) -> None:
    lines = [
        "// Generated by scripts/prepare_data.py. Do not edit manually.",
        "",
        "export type PreparedClub = {",
        "  seasonId: number",
        "  competitionName: string | null",
        "  seasonName: string",
        "  clubId: number",
        "  clubName: string | null",
        "  transferKpi: number | null",
        "  totalAssets: number | null",
        "  totalRevenues: number | null",
        "}",
        "",
        "export type PreparedPlayer = {",
        "  playerId: number",
        "  seasonId: number",
        "  playerName: string | null",
        "  seasonName: string",
        "  contractExpiration: string | null",
        "  fairPrice: number | null",
        "  clubId: number | null",
        "}",
        "",
        "export const clubs: PreparedClub[] = ",
    ]
    lines.append(json_like(clubs) + ";")
    lines.extend(["", "export const players: PreparedPlayer[] = "])
    lines.append(json_like(players) + ";")
    lines.append("")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def json_like(records: list[dict[str, object]]) -> str:
    rows = []
    for record in records:
        fields = ", ".join(f"{key}: {ts(value)}" for key, value in record.items())
        rows.append("  { " + fields + " }")
    return "[\n" + ",\n".join(rows) + "\n]"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--clubs", type=Path, required=True, help="Path to clubs.csv")
    parser.add_argument(
        "--players", type=Path, required=True, help="Path to players.csv"
    )
    parser.add_argument(
        "--output", type=Path, default=Path("src/data/goalunitData.generated.ts")
    )
    args = parser.parse_args()
    clubs = prepare_clubs(args.clubs)
    players = prepare_players(args.players)
    validate_prepared_data(clubs, players)
    write_typescript(args.output, clubs, players)
    print(
        f"Prepared {len(clubs)} club records and {len(players)} player records -> {args.output}"
    )
    print(
        "Note: players.csv has no clubId column; generated player clubId values are null."
    )


if __name__ == "__main__":
    main()
