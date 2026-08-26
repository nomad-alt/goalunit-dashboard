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

Endpoints:

- `GET /health`
- `GET /api/clubs?season=2024%2F2025`
- `GET /api/clubs/1255/overview?season=2024%2F2025`
- `GET /api/players?clubId=1255&season=2024%2F2025`
- `GET /api/contract-risks?clubId=1255&season=2024%2F2025&years=2`

The list endpoints can be called without filters. `season` must be a consecutive
`YYYY/YYYY` value when supplied. Contract risk uses a two-year window by default;
`years` accepts values from 1 to 10.

The overview query joins players through `player_club_assignments`, whose composite key is `(player_id, season_id)`. This keeps club membership explicit instead of guessing from player names.
