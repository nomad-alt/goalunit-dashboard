package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

type club struct {
	ClubID          int     `json:"clubId"`
	ClubImageURL    string  `json:"clubImageUrl"`
	CompetitionName string  `json:"competitionName"`
	SeasonName      string  `json:"seasonName"`
	ClubName        string  `json:"clubName"`
	TransferKPI     float64 `json:"transferKpi"`
	TotalAssets     int64   `json:"totalAssets"`
	TotalRevenues   int64   `json:"totalRevenues"`
}

type player struct {
	PlayerID           int     `json:"playerId"`
	SeasonID           int     `json:"seasonId"`
	ClubID             int     `json:"clubId"`
	PlayerName         string  `json:"playerName"`
	SeasonName         string  `json:"seasonName"`
	FairPrice          float64 `json:"fairPrice"`
	ContractExpiration string  `json:"contractExpiration"`
	Age                int     `json:"age"`
	Position           string  `json:"position"`
	Nationality        string  `json:"nationality"`
}

type clubOverview struct {
	Club                  club     `json:"club"`
	SeasonClubs           []club   `json:"seasonClubs"`
	Players               []player `json:"players"`
	TopPlayer             *player  `json:"topPlayer"`
	AverageTransferKPI    float64  `json:"averageTransferKpi"`
	TransferKPIDelta      float64  `json:"transferKpiDelta"`
	Insight               string   `json:"insight"`
	ContractsExpiringSoon int      `json:"contractsExpiringSoon"`
	ExpiringPlayers       []player `json:"expiringPlayers"`
	RevenueToAssetsRatio  float64  `json:"revenueToAssetsRatio"`
	YearOverYearKPI       *float64 `json:"yearOverYearKpi"`
}

type playerFilter struct {
	ClubID *int
	Season string
}

type contractRiskFilter struct {
	playerFilter
	Years int
}

type eventRecord struct {
	EventID              int64    `json:"eventId"`
	MatchID              int      `json:"matchId"`
	SeasonID             int      `json:"seasonId"`
	SeasonName           string   `json:"seasonName"`
	DateUTC              string   `json:"dateUtc"`
	ClubID               int      `json:"clubId"`
	PlayerID             int      `json:"playerId"`
	PlayerName           string   `json:"playerName"`
	EventNumber          int      `json:"eventNumber"`
	SequenceIndex        int      `json:"sequenceIndex"`
	PeriodID             int      `json:"periodId"`
	GameTimeSeconds      float64  `json:"gameTimeSeconds"`
	ActionType           string   `json:"actionType"`
	Action               string   `json:"action"`
	Result               string   `json:"result"`
	StartX               *float64 `json:"startX"`
	StartY               *float64 `json:"startY"`
	EndX                 *float64 `json:"endX"`
	EndY                 *float64 `json:"endY"`
	ShotXG               *float64 `json:"shotXg"`
	PassReceiverPlayerID *int     `json:"passReceiverPlayerId"`
	PassReceiverName     string   `json:"passReceiverName"`
}

type eventFilter struct {
	ClubID        *int
	MatchID       *int
	PlayerID      *int
	Season        string
	ActionType    string
	BeforeEventID *int64
	Limit         int
}

type dataStore interface {
	clubs(context.Context, string) ([]club, error)
	players(context.Context, playerFilter) ([]player, error)
	contractRisks(context.Context, contractRiskFilter) ([]player, error)
	events(context.Context, eventFilter) ([]eventRecord, error)
	overview(context.Context, int, string) (clubOverview, error)
}

type server struct {
	store  dataStore
	logger *log.Logger
}

func (s server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("GET /api/clubs", s.listClubs)
	mux.HandleFunc("GET /api/clubs/{clubId}/overview", s.clubOverview)
	mux.HandleFunc("GET /api/players", s.listPlayers)
	mux.HandleFunc("GET /api/contract-risks", s.listContractRisks)
	mux.HandleFunc("GET /api/events", s.listEvents)
	return cors(mux, os.Getenv("ALLOWED_ORIGINS"))
}

func (s server) listClubs(w http.ResponseWriter, r *http.Request) {
	season := strings.TrimSpace(r.URL.Query().Get("season"))
	if season != "" && !validSeason(season) {
		writeError(w, http.StatusBadRequest, "season must use YYYY/YYYY format")
		return
	}
	clubs, err := s.store.clubs(r.Context(), season)
	if err != nil {
		s.internalError(w, "list clubs", err)
		return
	}
	writeJSON(w, http.StatusOK, clubs)
}

func (s server) clubOverview(w http.ResponseWriter, r *http.Request) {
	clubID, err := positiveInt(r.PathValue("clubId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "clubId must be a positive integer")
		return
	}
	season := strings.TrimSpace(r.URL.Query().Get("season"))
	if !validSeason(season) {
		writeError(w, http.StatusBadRequest, "season must use YYYY/YYYY format")
		return
	}

	result, err := s.store.overview(r.Context(), clubID, season)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "club was not found for that season")
		return
	}
	if err != nil {
		s.internalError(w, "load club overview", err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s server) listPlayers(w http.ResponseWriter, r *http.Request) {
	filter, ok := parsePlayerFilter(w, r)
	if !ok {
		return
	}
	players, err := s.store.players(r.Context(), filter)
	if err != nil {
		s.internalError(w, "list players", err)
		return
	}
	writeJSON(w, http.StatusOK, players)
}

func (s server) listContractRisks(w http.ResponseWriter, r *http.Request) {
	filter, ok := parsePlayerFilter(w, r)
	if !ok {
		return
	}
	years := 2
	if raw := r.URL.Query().Get("years"); raw != "" {
		parsed, err := positiveInt(raw)
		if err != nil || parsed > 10 {
			writeError(w, http.StatusBadRequest, "years must be between 1 and 10")
			return
		}
		years = parsed
	}
	risks, err := s.store.contractRisks(r.Context(), contractRiskFilter{playerFilter: filter, Years: years})
	if err != nil {
		s.internalError(w, "list contract risks", err)
		return
	}
	writeJSON(w, http.StatusOK, risks)
}

func (s server) listEvents(w http.ResponseWriter, r *http.Request) {
	filter := eventFilter{
		Season:     strings.TrimSpace(r.URL.Query().Get("season")),
		ActionType: strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("actionType"))),
		Limit:      100,
	}
	if filter.Season != "" && !validSeason(filter.Season) {
		writeError(w, http.StatusBadRequest, "season must use YYYY/YYYY format")
		return
	}
	var ok bool
	if filter.ClubID, ok = optionalPositiveInt(w, r.URL.Query().Get("clubId"), "clubId"); !ok {
		return
	}
	if filter.MatchID, ok = optionalPositiveInt(w, r.URL.Query().Get("matchId"), "matchId"); !ok {
		return
	}
	if filter.PlayerID, ok = optionalPositiveInt(w, r.URL.Query().Get("playerId"), "playerId"); !ok {
		return
	}
	if filter.ClubID == nil && filter.MatchID == nil && filter.PlayerID == nil {
		writeError(w, http.StatusBadRequest, "one of clubId, matchId, or playerId is required")
		return
	}
	if raw := r.URL.Query().Get("limit"); raw != "" {
		limit, err := positiveInt(raw)
		if err != nil || limit > 500 {
			writeError(w, http.StatusBadRequest, "limit must be between 1 and 500")
			return
		}
		filter.Limit = limit
	}
	if raw := r.URL.Query().Get("beforeEventId"); raw != "" {
		value, err := strconv.ParseInt(raw, 10, 64)
		if err != nil || value <= 0 {
			writeError(w, http.StatusBadRequest, "beforeEventId must be a positive integer")
			return
		}
		filter.BeforeEventID = &value
	}

	events, err := s.store.events(r.Context(), filter)
	if err != nil {
		s.internalError(w, "list events", err)
		return
	}
	writeJSON(w, http.StatusOK, events)
}

func optionalPositiveInt(w http.ResponseWriter, raw, field string) (*int, bool) {
	if raw == "" {
		return nil, true
	}
	value, err := positiveInt(raw)
	if err != nil {
		writeError(w, http.StatusBadRequest, field+" must be a positive integer")
		return nil, false
	}
	return &value, true
}

func cors(next http.Handler, configuredOrigins string) http.Handler {
	allowed := map[string]bool{}
	for _, origin := range strings.Split(configuredOrigins, ",") {
		if origin = strings.TrimSpace(origin); origin != "" {
			allowed[origin] = true
		}
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && allowed[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		}
		if r.Method == http.MethodOptions {
			if origin == "" || !allowed[origin] {
				writeError(w, http.StatusForbidden, "origin is not allowed")
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func parsePlayerFilter(w http.ResponseWriter, r *http.Request) (playerFilter, bool) {
	filter := playerFilter{Season: strings.TrimSpace(r.URL.Query().Get("season"))}
	if filter.Season != "" && !validSeason(filter.Season) {
		writeError(w, http.StatusBadRequest, "season must use YYYY/YYYY format")
		return filter, false
	}
	if raw := r.URL.Query().Get("clubId"); raw != "" {
		clubID, err := positiveInt(raw)
		if err != nil {
			writeError(w, http.StatusBadRequest, "clubId must be a positive integer")
			return filter, false
		}
		filter.ClubID = &clubID
	}
	return filter, true
}

func positiveInt(value string) (int, error) {
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return 0, errors.New("not a positive integer")
	}
	return parsed, nil
}

func validSeason(value string) bool {
	if len(value) != 9 || value[4] != '/' {
		return false
	}
	start, startErr := strconv.Atoi(value[:4])
	end, endErr := strconv.Atoi(value[5:])
	return startErr == nil && endErr == nil && end == start+1
}

func (s server) internalError(w http.ResponseWriter, operation string, err error) {
	if s.logger != nil {
		s.logger.Printf("%s: %v", operation, err)
	}
	writeError(w, http.StatusInternalServerError, "internal server error")
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("connect to database: %v", err)
	}

	service := server{store: postgresStore{db: db}, logger: log.Default()}
	httpServer := &http.Server{
		Addr:              ":" + port(),
		Handler:           service.routes(),
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Printf("Goalunit API listening on %s", httpServer.Addr)
	log.Fatal(httpServer.ListenAndServe())
}

func port() string {
	if value := os.Getenv("PORT"); value != "" {
		return value
	}
	return "8080"
}
