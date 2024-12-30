package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type SpotifyHandler struct {
	clientId string
	secret   string
	apiKey   string
	expiry   time.Time
}

// TODO turn the dotenv into a helper function
func GetSpotifyHandler(config Config) (s SpotifyHandler) {
	s = SpotifyHandler{clientId: config.spotifyClientId, secret: config.spotifySecret}
	s.ApiKey()
	return s
}

func (s *SpotifyHandler) ApiKey() string {
	if s.expiry.Unix() > time.Now().Unix() {
		return s.apiKey
	}
	url := "https://accounts.spotify.com/api/token"
	body := []byte(fmt.Sprintf(`grant_type=client_credentials&client_id=%s&client_secret=%s`, s.clientId, s.secret))

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		panic(err)
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		bodyBytes, _ := io.ReadAll(res.Body)
		fmt.Println(string(bodyBytes))
		panic("API KEY NOT SUCCESSFUL")
	}

	resJson := &KeyResponse{}
	err = json.NewDecoder(res.Body).Decode(resJson)
	if err != nil {
		panic(err)
	}
	s.apiKey = resJson.AccessToken
	s.expiry = time.Now().Add(time.Duration(resJson.ExpiresIn) * time.Second)

	return s.apiKey

}

type SpotifySearchHandler struct {
	parent SpotifyHandler
}

var ALLOWED_TYPES = map[string]bool{"artist": true}

func (s SpotifySearchHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	// Check if it is GET
	if req.Method != "GET" {
		http.Error(res, fmt.Sprintf("%s on /external/search not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}

	term := req.URL.Query().Get("term")
	rtype := req.URL.Query().Get("type")
	if term == "" || rtype == "" {
		http.Error(res, "term or type not specified", http.StatusBadRequest)
		return
	}
	if _, ok := ALLOWED_TYPES[rtype]; !ok {
		http.Error(res, fmt.Sprintf("%s not a valid search type", rtype), http.StatusBadRequest)
		return
	}

	key := s.parent.ApiKey()
	url := "https://api.spotify.com/v1/search"
	req, err := http.NewRequest("GET", url, http.NoBody)
	if err != nil {
		panic(err)
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", key))
	q := req.URL.Query()
	q.Add("q", term)
	q.Add("type", rtype)
	q.Add("market", "US")
	q.Add("limit", "1")
	req.URL.RawQuery = q.Encode()

	client := &http.Client{}
	spotifyResponse, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer spotifyResponse.Body.Close()

	if spotifyResponse.StatusCode != 200 {
		bodyBytes, _ := io.ReadAll(spotifyResponse.Body)
		http.Error(res, string(bodyBytes), http.StatusNotFound)
	}

	io.Copy(res, spotifyResponse.Body)
}

type SpotifyAlbumHandler struct {
	parent SpotifyHandler
}

func (s SpotifyAlbumHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	// Check if it is GET
	if req.Method != "GET" {
		http.Error(res, fmt.Sprintf("%s on /external/search not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}

	albumId := req.URL.Query().Get("albumId")
	if albumId == "" {
		http.Error(res, "albumId not specified", http.StatusBadRequest)
		return
	}

	key := s.parent.ApiKey()
	url := "https://api.spotify.com/v1/albums"
	req, err := http.NewRequest("GET", url, http.NoBody)
	if err != nil {
		panic(err)
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", key))
	q := req.URL.Query()
	q.Add("ids", albumId)
	q.Add("market", "US")
	req.URL.RawQuery = q.Encode()
	client := &http.Client{}
	spotifyResponse, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer spotifyResponse.Body.Close()

	if spotifyResponse.StatusCode != 200 {
		panic("API KEY NOT SUCCESSFUL")
	}

	io.Copy(res, spotifyResponse.Body)
}

func (s SpotifyHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	m := http.NewServeMux()
	m.Handle("/external/search", SpotifySearchHandler{parent: s})
	m.Handle("/external/albums", SpotifyAlbumHandler{parent: s})

	rateLimitedMux := NewRateLimiter(m)

	rateLimitedMux.ServeHTTP(res, req)
}
