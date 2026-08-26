package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

type fakeStore struct {
	clubRecords   []club
	playerRecords []player
	overviewValue clubOverview
	overviewErr   error
	clubSeason    string
	playerFilter  playerFilter
	riskFilter    contractRiskFilter
	eventFilter   eventFilter
}

func (store *fakeStore) clubs(_ context.Context, season string) ([]club, error) {
	store.clubSeason = season
	return store.clubRecords, nil
}

func (store *fakeStore) players(_ context.Context, filter playerFilter) ([]player, error) {
	store.playerFilter = filter
	return store.playerRecords, nil
}

func (store *fakeStore) contractRisks(_ context.Context, filter contractRiskFilter) ([]player, error) {
	store.riskFilter = filter
	return store.playerRecords, nil
}

func (store *fakeStore) events(_ context.Context, filter eventFilter) ([]eventRecord, error) {
	store.eventFilter = filter
	return []eventRecord{{EventID: 1, MatchID: 10, ClubID: 1255, ActionType: "SHOT"}}, nil
}

func (store *fakeStore) overview(_ context.Context, _ int, _ string) (clubOverview, error) {
	return store.overviewValue, store.overviewErr
}

func TestRequestedEndpoints(t *testing.T) {
	arsenal := club{ClubID: 1255, ClubName: "Arsenal", SeasonName: "2024/2025"}
	saka := player{PlayerID: 385494, ClubID: 1255, PlayerName: "Bukayo Saka", SeasonName: "2024/2025"}
	store := &fakeStore{
		clubRecords:   []club{arsenal},
		playerRecords: []player{saka},
		overviewValue: clubOverview{Club: arsenal, SeasonClubs: []club{arsenal}, Players: []player{saka}, ExpiringPlayers: []player{}},
	}
	handler := server{store: store}.routes()

	tests := []struct {
		name string
		url  string
	}{
		{name: "clubs", url: "/api/clubs?season=2024%2F2025"},
		{name: "overview", url: "/api/clubs/1255/overview?season=2024%2F2025"},
		{name: "players", url: "/api/players?clubId=1255&season=2024%2F2025"},
		{name: "contract risks", url: "/api/contract-risks?clubId=1255&season=2024%2F2025"},
		{name: "events", url: "/api/events?clubId=1255&season=2024%2F2025&actionType=shot"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, test.url, nil))
			if response.Code != http.StatusOK {
				t.Fatalf("expected 200, got %d: %s", response.Code, response.Body.String())
			}
			if contentType := response.Header().Get("Content-Type"); contentType != "application/json; charset=utf-8" {
				t.Fatalf("unexpected content type %q", contentType)
			}
		})
	}

	if store.clubSeason != "2024/2025" {
		t.Fatalf("clubs received season %q", store.clubSeason)
	}
	if store.playerFilter.ClubID == nil || *store.playerFilter.ClubID != 1255 {
		t.Fatal("players did not receive the club filter")
	}
	if store.riskFilter.Years != 2 {
		t.Fatalf("expected default risk window of 2, got %d", store.riskFilter.Years)
	}
	if store.eventFilter.ClubID == nil || *store.eventFilter.ClubID != 1255 || store.eventFilter.ActionType != "SHOT" {
		t.Fatal("events did not receive the expected filters")
	}
}

func TestOverviewNotFound(t *testing.T) {
	handler := server{store: &fakeStore{overviewErr: sql.ErrNoRows}}.routes()
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/clubs/9999/overview?season=2024%2F2025", nil))

	if response.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", response.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["error"] == "" {
		t.Fatal("expected a JSON error message")
	}
}

func TestInvalidFilters(t *testing.T) {
	handler := server{store: &fakeStore{}}.routes()
	for _, url := range []string{
		"/api/clubs?season=2024",
		"/api/clubs/nope/overview?season=2024%2F2025",
		"/api/players?clubId=-1",
		"/api/contract-risks?years=11",
		"/api/events?season=2024%2F2025",
		"/api/events?clubId=1255&limit=501",
	} {
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, url, nil))
		if response.Code != http.StatusBadRequest {
			t.Errorf("%s: expected 400, got %d", url, response.Code)
		}
	}
}

func TestCORSAllowsConfiguredFrontend(t *testing.T) {
	handler := cors(server{store: &fakeStore{}}.routes(), "https://goalunit-dashboard.vercel.app")
	request := httptest.NewRequest(http.MethodGet, "/api/clubs", nil)
	request.Header.Set("Origin", "https://goalunit-dashboard.vercel.app")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if origin := response.Header().Get("Access-Control-Allow-Origin"); origin != "https://goalunit-dashboard.vercel.app" {
		t.Fatalf("unexpected allowed origin %q", origin)
	}
}

func TestMethodNotAllowed(t *testing.T) {
	handler := server{store: &fakeStore{}}.routes()
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/players", nil))
	if response.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", response.Code)
	}
}

func TestValidSeason(t *testing.T) {
	for _, season := range []string{"2023/2024", "2024/2025"} {
		if !validSeason(season) {
			t.Errorf("expected %q to be valid", season)
		}
	}
	for _, season := range []string{"", "2024", "2024-2025", "2024/2026", "abcd/efgh"} {
		if validSeason(season) {
			t.Errorf("expected %q to be invalid", season)
		}
	}
}
