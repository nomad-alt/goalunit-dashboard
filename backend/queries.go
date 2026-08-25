package main

import (
	"database/sql"
	"fmt"
	"math"
	"strings"
)

func loadOverview(db *sql.DB, clubID int, season string) (clubOverview, error) {
	result := clubOverview{
		SeasonClubs: []club{},
		Players: []player{},
		ExpiringPlayers: []player{},
	}
	if err := db.QueryRow(`SELECT club_id, club_image_url, competition_name, season_name, club_name, transfer_kpi, total_assets, total_revenues FROM clubs WHERE club_id = $1 AND season_name = $2`, clubID, season).Scan(&result.Club.ClubID, &result.Club.ClubImageURL, &result.Club.CompetitionName, &result.Club.SeasonName, &result.Club.ClubName, &result.Club.TransferKPI, &result.Club.TotalAssets, &result.Club.TotalRevenues); err != nil { return result, err }
	rows, err := db.Query(`SELECT club_id, club_image_url, competition_name, season_name, club_name, transfer_kpi, total_assets, total_revenues FROM clubs WHERE season_name = $1 ORDER BY club_id`, season)
	if err != nil { return result, err }
	defer rows.Close()
	for rows.Next() { var record club; if err := rows.Scan(&record.ClubID, &record.ClubImageURL, &record.CompetitionName, &record.SeasonName, &record.ClubName, &record.TransferKPI, &record.TotalAssets, &record.TotalRevenues); err != nil { return result, err }; result.SeasonClubs = append(result.SeasonClubs, record) }
	playersRows, err := db.Query(`SELECT p.player_id, p.season_id, a.club_id, p.player_name, p.season_name, COALESCE(p.fair_price, 0), COALESCE(p.contract_expiration::text, '') FROM players p JOIN player_club_assignments a ON a.player_id = p.player_id AND a.season_id = p.season_id WHERE a.club_id = $1 AND p.season_name = $2 ORDER BY p.fair_price DESC`, clubID, season)
	if err != nil { return result, err }
	defer playersRows.Close()
	for playersRows.Next() { var record player; if err := playersRows.Scan(&record.PlayerID, &record.SeasonID, &record.ClubID, &record.PlayerName, &record.SeasonName, &record.FairPrice, &record.ContractExpiration); err != nil { return result, err }; result.Players = append(result.Players, record) }
	if err := playersRows.Err(); err != nil { return result, err }
	if len(result.Players) > 0 { result.TopPlayer = &result.Players[0] }
	for _, record := range result.SeasonClubs { result.AverageTransferKPI += record.TransferKPI }
	if len(result.SeasonClubs) > 0 { result.AverageTransferKPI /= float64(len(result.SeasonClubs)) }
	result.TransferKPIDelta = result.Club.TransferKPI - result.AverageTransferKPI
	result.RevenueToAssetsRatio = float64(result.Club.TotalRevenues) / float64(result.Club.TotalAssets) * 100
	result.ContractsExpiringSoon, result.ExpiringPlayers = contractRisk(result.Players, result.Club.SeasonName)
	result.YearOverYearKPI = previousKPI(db, result.Club)
	result.Insight = insight(result)
	return result, nil
}

func contractRisk(players []player, season string) (int, []player) {
	endYear := seasonEndYear(season) + 2
	expiring := []player{}
	for _, record := range players { if year := yearFromDate(record.ContractExpiration); year > 0 && year <= endYear { expiring = append(expiring, record) } }
	return len(expiring), expiring
}

func previousKPI(db *sql.DB, current club) *float64 {
	previousSeason := fmt.Sprintf("%d/%d", seasonStartYear(current.SeasonName)-1, seasonEndYear(current.SeasonName)-1)
	var value float64
	if err := db.QueryRow(`SELECT transfer_kpi FROM clubs WHERE club_id = $1 AND season_name = $2`, current.ClubID, previousSeason).Scan(&value); err != nil { return nil }
	delta := current.TransferKPI - value
	return &delta
}

func insight(overview clubOverview) string {
	highest, lowest := overview.SeasonClubs[0], overview.SeasonClubs[0]
	for _, record := range overview.SeasonClubs[1:] { if record.TransferKPI > highest.TransferKPI { highest = record }; if record.TransferKPI < lowest.TransferKPI { lowest = record } }
	deltaPercent := 0.0
	if overview.AverageTransferKPI != 0 { deltaPercent = overview.TransferKPIDelta / overview.AverageTransferKPI * 100 }
	direction := "above"; if overview.TransferKPIDelta < 0 { direction = "below" }
	return fmt.Sprintf("%s's Transfer KPI is %.1f points %s the sample average (%.1f%%). Highest: %s (%.1f); lowest: %s (%.1f).", overview.Club.ClubName, math.Abs(overview.TransferKPIDelta), direction, math.Abs(deltaPercent), highest.ClubName, highest.TransferKPI, lowest.ClubName, lowest.TransferKPI)
}

func seasonStartYear(season string) int { var year int; fmt.Sscanf(season, "%d", &year); return year }
func seasonEndYear(season string) int { parts := strings.Split(season, "/"); if len(parts) != 2 { return 0 }; var year int; fmt.Sscanf(parts[1], "%d", &year); return year }
func yearFromDate(value string) int { if len(value) < 4 { return 0 }; var year int; fmt.Sscanf(value[:4], "%d", &year); return year }