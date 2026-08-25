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
  PRIMARY KEY (player_id, season_id)
);

CREATE TABLE IF NOT EXISTS player_club_assignments (
  player_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  season_name TEXT NOT NULL,
  club_id INTEGER NOT NULL,
  PRIMARY KEY (player_id, season_id),
  FOREIGN KEY (player_id, season_id) REFERENCES players (player_id, season_id),
  FOREIGN KEY (club_id, season_name) REFERENCES clubs (club_id, season_name)
);