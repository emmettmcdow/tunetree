package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type TrackUserDB interface {
	TrackDB
	UserDB
}

type TrackHandler struct {
	config Config
	db     TrackUserDB
}

func GetTrackHandler(config Config) *TrackHandler {
	return &TrackHandler{config: config}
}

func (t *TrackHandler) WithDB(db TrackUserDB) *TrackHandler {
	t.db = db
	return t
}

type thPayload struct {
	Track      Track  `json:"track"`
	ArtistName string `json:"artistName"`
}

func (t *TrackHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	jwtMiddleware(t.trackHandler)(res, req)
}

func (t *TrackHandler) trackHandler(res http.ResponseWriter, req *http.Request) {
	artistlink := req.PathValue("artistlink")
	if artistlink == "" {
		http.Error(res, "No artist name specified", http.StatusNotFound)
		return
	}

	switch req.Method {
	case "GET":
		artist, ok := t.db.GetUserFromLink(artistlink)
		if !ok {
			http.Error(res, "No artist associated with that link", http.StatusNotFound)
			return
		}
		track, ok := t.db.GetTrack(artist)
		if !ok {
			http.Error(res, "No track associated with that artist", http.StatusNotFound)
			return
		}

		res.Header().Set("Content-Type", "application/json")
		payload := thPayload{Track: track, ArtistName: artist.Artist}
		json.NewEncoder(res).Encode(payload)
	case "POST":
		var track Track
		// TODO: validate email = artistname etc here
		id, ok := req.Context().Value("id").(int64)
		if !ok {
			http.Error(res, "Invalid token", http.StatusUnauthorized)
			return
		}
		user, err := t.db.GetUser(id)
		if err == sql.ErrNoRows {
			http.Error(res, fmt.Sprintf("User with ID %s not found", id), http.StatusNotFound)
		} else if err != nil {
			panic(err)
		}
		role := req.Context().Value("role")
		if role == nil || role == "USER" {
			http.Error(res, "Invalid token", http.StatusUnauthorized)
			return
		}
		if getRole(user) != "ARTIST" {
			http.Error(res, "Logged in user is not the requested user", http.StatusUnauthorized)
			return
		}

		body, err := io.ReadAll(req.Body)
		if err != nil {
			http.Error(res, fmt.Sprintf("Failed to read body of request: %s", err), http.StatusInternalServerError)
			return
		}
		if err := json.Unmarshal(body, &track); err != nil {
			http.Error(res, fmt.Sprintf("Malformed data: %s", err), http.StatusBadRequest)
			return
		}
		track.Colors = strings.Join(getColorPalette(track.Image)[:], ";")
		if err = t.db.PutTrack(id, track); err != nil {
			// TODO: error handling?
			http.Error(res, fmt.Sprintf("Failed to save track: %s", err), http.StatusInternalServerError)
			return
		}
	default:
		http.Error(res, fmt.Sprintf("%s on /track not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
}
