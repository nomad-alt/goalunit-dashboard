package main

import (
	"database/sql"
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/lib/pq"
)

var columns = []string{
	"eventId", "matchId", "competitionId", "seasonId", "seasonName", "dateutc",
	"clubId", "playerId", "playerName", "eventNumber", "sequenceIndex", "periodId",
	"gameTimeInSec", "actionType", "action", "result", "startAdjCoordinatesX",
	"startAdjCoordinatesY", "endAdjCoordinatesX", "endAdjCoordinatesY", "SHOT_XG",
	"passReceiverPlayerId", "passReceiverPlayerName",
}

func main() {
	eventsPath := flag.String("events", "", "path to events.csv")
	replace := flag.Bool("replace", false, "truncate existing event rows before importing")
	flag.Parse()
	if *eventsPath == "" {
		log.Fatal("--events is required")
	}
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	source, err := os.Open(*eventsPath)
	if err != nil {
		log.Fatal(err)
	}
	defer source.Close()
	reader := csv.NewReader(source)
	reader.ReuseRecord = true
	header, err := reader.Read()
	if err != nil {
		log.Fatal(err)
	}
	indexes := map[string]int{}
	for index, name := range header {
		indexes[name] = index
	}
	for _, name := range columns {
		if _, ok := indexes[name]; !ok {
			log.Fatalf("events CSV is missing required column %q", name)
		}
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	defer tx.Rollback()
	if *replace {
		if _, err := tx.Exec(`TRUNCATE TABLE events`); err != nil {
			log.Fatal(err)
		}
	}
	statement, err := tx.Prepare(pq.CopyIn(
		"events", "event_id", "match_id", "competition_id", "season_id", "season_name",
		"date_utc", "club_id", "player_id", "player_name", "event_number",
		"sequence_index", "period_id", "game_time_seconds", "action_type", "action",
		"result", "start_x", "start_y", "end_x", "end_y", "shot_xg",
		"pass_receiver_player_id", "pass_receiver_name",
	))
	if err != nil {
		log.Fatal(err)
	}

	count := 0
	for {
		row, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("read row %d: %v", count+2, err)
		}
		values, err := valuesFor(row, indexes)
		if err != nil {
			log.Fatalf("parse row %d: %v", count+2, err)
		}
		if _, err := statement.Exec(values...); err != nil {
			log.Fatalf("copy row %d: %v", count+2, err)
		}
		count++
		if count%500_000 == 0 {
			log.Printf("queued %d event rows", count)
		}
	}
	if _, err := statement.Exec(); err != nil {
		log.Fatal(err)
	}
	if err := statement.Close(); err != nil {
		log.Fatal(err)
	}
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	log.Printf("imported %d event rows", count)
}

func valuesFor(row []string, indexes map[string]int) ([]any, error) {
	value := func(name string) string { return strings.TrimSpace(row[indexes[name]]) }
	requiredInt := func(name string) (int64, error) {
		parsed, err := strconv.ParseInt(value(name), 10, 64)
		if err != nil {
			return 0, fmt.Errorf("%s: %w", name, err)
		}
		return parsed, nil
	}
	eventID, err := requiredInt("eventId")
	if err != nil {
		return nil, err
	}
	matchID, err := requiredInt("matchId")
	if err != nil {
		return nil, err
	}
	competitionID, err := requiredInt("competitionId")
	if err != nil {
		return nil, err
	}
	seasonID, err := requiredInt("seasonId")
	if err != nil {
		return nil, err
	}
	clubID, err := requiredInt("clubId")
	if err != nil {
		return nil, err
	}
	playerID, err := requiredInt("playerId")
	if err != nil {
		return nil, err
	}
	eventNumber, err := requiredInt("eventNumber")
	if err != nil {
		return nil, err
	}
	sequenceIndex, err := requiredInt("sequenceIndex")
	if err != nil {
		return nil, err
	}
	periodID, err := requiredInt("periodId")
	if err != nil {
		return nil, err
	}
	gameTime, err := requiredFloat(value("gameTimeInSec"), "gameTimeInSec")
	if err != nil {
		return nil, err
	}

	return []any{
		eventID, matchID, competitionID, seasonID, value("seasonName"), value("dateutc"),
		clubID, playerID, value("playerName"), eventNumber, sequenceIndex, periodID,
		gameTime, value("actionType"), value("action"), value("result"),
		nullableFloat(value("startAdjCoordinatesX")), nullableFloat(value("startAdjCoordinatesY")),
		nullableFloat(value("endAdjCoordinatesX")), nullableFloat(value("endAdjCoordinatesY")),
		nullableFloat(value("SHOT_XG")), nullableInt(value("passReceiverPlayerId")),
		value("passReceiverPlayerName"),
	}, nil
}

func requiredFloat(value, field string) (float64, error) {
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", field, err)
	}
	return parsed, nil
}

func nullableFloat(value string) any {
	if value == "" {
		return nil
	}
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return nil
	}
	return parsed
}

func nullableInt(value string) any {
	if value == "" {
		return nil
	}
	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return nil
	}
	return parsed
}
