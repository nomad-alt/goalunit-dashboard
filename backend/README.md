# Goalunit API

Small Go HTTP service for the dashboard's PostgreSQL-backed data boundary.

## Configuration

Set `DATABASE_URL` to a PostgreSQL connection string. The service listens on `PORT` or `8080` by default.

```bash
export DATABASE_URL='postgres://localhost/goalunit?sslmode=disable'
go run .
```

Apply the schema before starting the service:

```bash
psql "$DATABASE_URL" -f schema.sql
```

Load the prototype records after applying the schema:

```bash
psql "$DATABASE_URL" -f seed.sql
```

Import the queryable subset of the large event export with PostgreSQL `COPY`:

```bash
go run ./cmd/import-events --events /path/to/events.csv --replace
```

The importer streams the CSV and does not load the full file into memory.

Endpoints:

- `GET /health`
- `GET /api/clubs?season=2024%2F2025`
- `GET /api/clubs/1255/overview?season=2024%2F2025`
- `GET /api/players?clubId=1255&season=2024%2F2025`
- `GET /api/contract-risks?clubId=1255&season=2024%2F2025&years=2`
- `GET /api/events?clubId=1255&season=2024%2F2025&actionType=SHOT&limit=100`

The list endpoints can be called without filters. `season` must be a consecutive
`YYYY/YYYY` value when supplied. Contract risk uses a two-year window by default;
`years` accepts values from 1 to 10.

Raw-event requests require at least one of `clubId`, `matchId`, or `playerId`.
They accept optional `season`, `actionType`, `beforeEventId`, and `limit`
parameters; `limit` defaults to 100 and is capped at 500.

For a separately deployed API, configure both sides:

```bash
# Go service
export ALLOWED_ORIGINS='https://goalunit-dashboard.vercel.app'

# Vercel frontend build
VITE_API_BASE_URL='https://your-go-api.example.com/api'
```

The overview query joins players through `player_club_assignments`, whose composite key is `(player_id, season_id)`. This keeps club membership explicit instead of guessing from player names.
