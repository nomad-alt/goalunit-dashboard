package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

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
	PlayerID          int     `json:"playerId"`
	SeasonID          int     `json:"seasonId"`
	ClubID            int     `json:"clubId"`
	PlayerName        string  `json:"playerName"`
	SeasonName        string  `json:"seasonName"`
	FairPrice         float64 `json:"fairPrice"`
	ContractExpiration string `json:"contractExpiration"`
}

type clubOverview struct {
	Club                  club    `json:"club"`
	SeasonClubs           []club  `json:"seasonClubs"`
	Players               []player `json:"players"`
	TopPlayer             *player `json:"topPlayer"`
	AverageTransferKPI    float64 `json:"averageTransferKpi"`
	TransferKPIDelta      float64 `json:"transferKpiDelta"`
	Insight               string  `json:"insight"`
	ContractsExpiringSoon int     `json:"contractsExpiringSoon"`
	ExpiringPlayers       []player `json:"expiringPlayers"`
	RevenueToAssetsRatio  float64 `json:"revenueToAssetsRatio"`
	YearOverYearKPI       *float64 `json:"yearOverYearKpi"`
}

type server struct{ db *sql.DB }

func (s server) overview(w http.ResponseWriter, request *http.Request) {
	clubID, err := strconv.Atoi(request.URL.Query().Get("clubId"))
	if err != nil { http.Error(w, "clubId is required", http.StatusBadRequest); return }
	season := request.URL.Query().Get("season")
	if season == "" { http.Error(w, "season is required", http.StatusBadRequest); return }

	result, err := loadOverview(s.db, clubID, season)
	if err != nil { log.Printf("load overview: %v", err); http.Error(w, "unable to load overview", http.StatusInternalServerError); return }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" { log.Fatal("DATABASE_URL is required") }
	db, err := sql.Open("postgres", databaseURL)
	if err != nil { log.Fatal(err) }
	defer db.Close()
	s := server{db: db}
	http.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })
	http.HandleFunc("/api/club-overview", s.overview)
	log.Fatal(http.ListenAndServe(":"+port(), nil))
}

func port() string { if value := os.Getenv("PORT"); value != "" { return value }; return "8080" }