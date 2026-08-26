package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"
)

const clubColumns = `club_id, club_image_url, competition_name, season_name, club_name, transfer_kpi, total_assets, total_revenues`
const playerColumns = `p.player_id, p.season_id, a.club_id, p.player_name, p.season_name, COALESCE(p.fair_price, 0), COALESCE(p.contract_expiration::text, ''), p.age, p.position, p.nationality`

type postgresStore struct{ db *sql.DB }

func (store postgresStore) clubs(ctx context.Context, season string) ([]club, error) {
	query := `SELECT ` + clubColumns + ` FROM clubs`
	args := []any{}
	if season != "" {
		query += ` WHERE season_name = $1`
		args = append(args, season)
	}
	query += ` ORDER BY season_name, club_name`
	rows, err := store.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanClubs(rows)
}

func (store postgresStore) players(ctx context.Context, filter playerFilter) ([]player, error) {
	query, args := filteredPlayerQuery(filter)
	query += ` ORDER BY p.fair_price DESC NULLS LAST, p.player_name`
	rows, err := store.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPlayers(rows)
}

func (store postgresStore) contractRisks(ctx context.Context, filter contractRiskFilter) ([]player, error) {
	query, args := filteredPlayerQuery(filter.playerFilter)
	placeholder := len(args) + 1
	query += fmt.Sprintf(` AND p.contract_expiration IS NOT NULL
		AND EXTRACT(YEAR FROM p.contract_expiration) <= split_part(p.season_name, '/', 2)::integer + $%d`, placeholder)
	args = append(args, filter.Years)
	query += ` ORDER BY p.contract_expiration, p.fair_price DESC NULLS LAST`
	rows, err := store.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPlayers(rows)
}

func (store postgresStore) events(ctx context.Context, filter eventFilter) ([]eventRecord, error) {
	query := `SELECT event_id, match_id, season_id, season_name, date_utc::text, club_id,
		player_id, player_name, event_number, sequence_index, period_id, game_time_seconds,
		action_type, action, result, start_x, start_y, end_x, end_y, shot_xg,
		pass_receiver_player_id, pass_receiver_name
		FROM events WHERE 1 = 1`
	args := []any{}
	appendFilter := func(condition string, value any) {
		args = append(args, value)
		query += fmt.Sprintf(" AND "+condition, len(args))
	}
	if filter.ClubID != nil {
		appendFilter("club_id = $%d", *filter.ClubID)
	}
	if filter.MatchID != nil {
		appendFilter("match_id = $%d", *filter.MatchID)
	}
	if filter.PlayerID != nil {
		appendFilter("player_id = $%d", *filter.PlayerID)
	}
	if filter.Season != "" {
		appendFilter("season_name = $%d", filter.Season)
	}
	if filter.ActionType != "" {
		appendFilter("action_type = $%d", filter.ActionType)
	}
	if filter.BeforeEventID != nil {
		appendFilter("event_id < $%d", *filter.BeforeEventID)
	}
	args = append(args, filter.Limit)
	query += fmt.Sprintf(" ORDER BY event_id DESC LIMIT $%d", len(args))

	rows, err := store.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []eventRecord{}
	for rows.Next() {
		var record eventRecord
		if err := rows.Scan(
			&record.EventID, &record.MatchID, &record.SeasonID, &record.SeasonName,
			&record.DateUTC, &record.ClubID, &record.PlayerID, &record.PlayerName,
			&record.EventNumber, &record.SequenceIndex, &record.PeriodID, &record.GameTimeSeconds,
			&record.ActionType, &record.Action, &record.Result, &record.StartX, &record.StartY,
			&record.EndX, &record.EndY, &record.ShotXG, &record.PassReceiverPlayerID,
			&record.PassReceiverName,
		); err != nil {
			return nil, err
		}
		result = append(result, record)
	}
	return result, rows.Err()
}

func filteredPlayerQuery(filter playerFilter) (string, []any) {
	query := `SELECT ` + playerColumns + `
		FROM players p
		JOIN player_club_assignments a ON a.player_id = p.player_id AND a.season_id = p.season_id
		WHERE 1 = 1`
	args := []any{}
	if filter.ClubID != nil {
		args = append(args, *filter.ClubID)
		query += fmt.Sprintf(` AND a.club_id = $%d`, len(args))
	}
	if filter.Season != "" {
		args = append(args, filter.Season)
		query += fmt.Sprintf(` AND p.season_name = $%d`, len(args))
	}
	return query, args
}

func (store postgresStore) overview(ctx context.Context, clubID int, season string) (clubOverview, error) {
	result := clubOverview{SeasonClubs: []club{}, Players: []player{}, ExpiringPlayers: []player{}}
	if err := store.db.QueryRowContext(ctx, `SELECT `+clubColumns+` FROM clubs WHERE club_id = $1 AND season_name = $2`, clubID, season).Scan(
		&result.Club.ClubID, &result.Club.ClubImageURL, &result.Club.CompetitionName, &result.Club.SeasonName,
		&result.Club.ClubName, &result.Club.TransferKPI, &result.Club.TotalAssets, &result.Club.TotalRevenues,
	); err != nil {
		return result, err
	}

	var err error
	result.SeasonClubs, err = store.clubs(ctx, season)
	if err != nil {
		return result, err
	}
	result.Players, err = store.players(ctx, playerFilter{ClubID: &clubID, Season: season})
	if err != nil {
		return result, err
	}
	if len(result.Players) > 0 {
		result.TopPlayer = &result.Players[0]
	}
	for _, record := range result.SeasonClubs {
		result.AverageTransferKPI += record.TransferKPI
	}
	if len(result.SeasonClubs) > 0 {
		result.AverageTransferKPI /= float64(len(result.SeasonClubs))
	}
	result.TransferKPIDelta = result.Club.TransferKPI - result.AverageTransferKPI
	if result.Club.TotalAssets != 0 {
		result.RevenueToAssetsRatio = float64(result.Club.TotalRevenues) / float64(result.Club.TotalAssets) * 100
	}
	result.ContractsExpiringSoon, result.ExpiringPlayers = contractRisk(result.Players, result.Club.SeasonName)
	result.YearOverYearKPI = store.previousKPI(ctx, result.Club)
	result.Insight = insight(result)
	return result, nil
}

func scanClubs(rows *sql.Rows) ([]club, error) {
	result := []club{}
	for rows.Next() {
		var record club
		if err := rows.Scan(&record.ClubID, &record.ClubImageURL, &record.CompetitionName, &record.SeasonName, &record.ClubName, &record.TransferKPI, &record.TotalAssets, &record.TotalRevenues); err != nil {
			return nil, err
		}
		result = append(result, record)
	}
	return result, rows.Err()
}

func scanPlayers(rows *sql.Rows) ([]player, error) {
	result := []player{}
	for rows.Next() {
		var record player
		if err := rows.Scan(&record.PlayerID, &record.SeasonID, &record.ClubID, &record.PlayerName, &record.SeasonName, &record.FairPrice, &record.ContractExpiration, &record.Age, &record.Position, &record.Nationality); err != nil {
			return nil, err
		}
		result = append(result, record)
	}
	return result, rows.Err()
}

func contractRisk(players []player, season string) (int, []player) {
	endYear := seasonEndYear(season) + 2
	expiring := []player{}
	for _, record := range players {
		if year := yearFromDate(record.ContractExpiration); year > 0 && year <= endYear {
			expiring = append(expiring, record)
		}
	}
	return len(expiring), expiring
}

func (store postgresStore) previousKPI(ctx context.Context, current club) *float64 {
	previousSeason := fmt.Sprintf("%d/%d", seasonStartYear(current.SeasonName)-1, seasonEndYear(current.SeasonName)-1)
	var value float64
	if err := store.db.QueryRowContext(ctx, `SELECT transfer_kpi FROM clubs WHERE club_id = $1 AND season_name = $2`, current.ClubID, previousSeason).Scan(&value); err != nil {
		return nil
	}
	delta := current.TransferKPI - value
	return &delta
}

func insight(overview clubOverview) string {
	if len(overview.SeasonClubs) == 0 {
		return "No comparison data is available for this season."
	}
	highest, lowest := overview.SeasonClubs[0], overview.SeasonClubs[0]
	for _, record := range overview.SeasonClubs[1:] {
		if record.TransferKPI > highest.TransferKPI {
			highest = record
		}
		if record.TransferKPI < lowest.TransferKPI {
			lowest = record
		}
	}
	deltaPercent := 0.0
	if overview.AverageTransferKPI != 0 {
		deltaPercent = overview.TransferKPIDelta / overview.AverageTransferKPI * 100
	}
	direction := "above"
	if overview.TransferKPIDelta < 0 {
		direction = "below"
	}
	return fmt.Sprintf("%s's Transfer KPI is %.1f points %s the sample average (%.1f%%). Highest: %s (%.1f); lowest: %s (%.1f).", overview.Club.ClubName, math.Abs(overview.TransferKPIDelta), direction, math.Abs(deltaPercent), highest.ClubName, highest.TransferKPI, lowest.ClubName, lowest.TransferKPI)
}

func seasonStartYear(season string) int {
	var year int
	fmt.Sscanf(season, "%d", &year)
	return year
}

func seasonEndYear(season string) int {
	parts := strings.Split(season, "/")
	if len(parts) != 2 {
		return 0
	}
	var year int
	fmt.Sscanf(parts[1], "%d", &year)
	return year
}

func yearFromDate(value string) int {
	if len(value) < 4 {
		return 0
	}
	var year int
	fmt.Sscanf(value[:4], "%d", &year)
	return year
}
