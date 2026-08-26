CREATE TABLE IF NOT EXISTS clubs (
  club_id INTEGER NOT NULL,
  competition_name TEXT NOT NULL,
  season_name TEXT NOT NULL,
  club_name TEXT NOT NULL,
  club_image_url TEXT NOT NULL,
  transfer_kpi NUMERIC NOT NULL,
  total_assets BIGINT NOT NULL,
  total_revenues BIGINT NOT NULL,
  PRIMARY KEY (club_id, season_name)
);

CREATE TABLE IF NOT EXISTS players (
  player_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  season_name TEXT NOT NULL,
  player_name TEXT NOT NULL,
  fair_price NUMERIC,
  contract_expiration DATE,
  age INTEGER NOT NULL,
  position TEXT NOT NULL,
  nationality TEXT NOT NULL,
  PRIMARY KEY (player_id, season_id)
);

-- Keep schema.sql safe to re-apply to databases created by the earlier prototype.
ALTER TABLE players ADD COLUMN IF NOT EXISTS age INTEGER NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT '';
ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality TEXT NOT NULL DEFAULT '';
ALTER TABLE players ALTER COLUMN age DROP DEFAULT;
ALTER TABLE players ALTER COLUMN position DROP DEFAULT;
ALTER TABLE players ALTER COLUMN nationality DROP DEFAULT;

CREATE TABLE IF NOT EXISTS player_club_assignments (
  player_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  season_name TEXT NOT NULL,
  club_id INTEGER NOT NULL,
  PRIMARY KEY (player_id, season_id),
  FOREIGN KEY (player_id, season_id) REFERENCES players (player_id, season_id),
  FOREIGN KEY (club_id, season_name) REFERENCES clubs (club_id, season_name)
);
