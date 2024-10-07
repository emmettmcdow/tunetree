package main

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"strings"
	"sync"
	"syscall"
	"time"
)

type RateLimiter struct {
	handler http.Handler
}

// TODO
func (r RateLimiter) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	r.handler.ServeHTTP(res, req)
}

func NewRateLimiter(handler http.Handler) http.Handler {
	return &RateLimiter{handler}
}

type Cors struct {
	handler http.Handler
}

func (r Cors) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	headers := res.Header()
	headers.Add("Access-Control-Allow-Origin", "http://localhost:3000")
	headers.Add("Access-Control-Allow-Credentials", "true")
	headers.Add("Vary", "Access-Control-Request-Method")
	headers.Add("Vary", "Access-Control-Request-Headers")
	headers.Add("Access-Control-Allow-Headers", "Content-Type, Origin, Accept, Authorization")
	headers.Add("Access-Control-Allow-Methods", "GET, POST,OPTIONS")
	if req.Method == "OPTIONS" {
		res.WriteHeader(http.StatusOK)
		return
	} else {
		r.handler.ServeHTTP(res, req)
	}
}

func NewCors(handler http.Handler) http.Handler {
	return &Cors{handler}
}

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func NewLoggingResponseWriter(w http.ResponseWriter) *loggingResponseWriter {
	// WriteHeader(int) is not called if our response implicitly returns 200 OK, so
	// we default to that status code.
	return &loggingResponseWriter{w, http.StatusOK}
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

type Logger struct {
	handler http.Handler
	log     *slog.Logger
}

func (l Logger) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	ctxId := uuid.New().String()
	ctx := context.WithValue(req.Context(), "ctxId", ctxId)

	lrw := NewLoggingResponseWriter(res)

	l.log.Info("Request", "method", req.Method, "endpoint", req.URL.Path, "ctxId", ctxId)
	l.handler.ServeHTTP(lrw, req.WithContext(ctx))
	l.log.Info("Response", "status", lrw.statusCode, "ctxId", ctxId)
}

func NewLogger(handler http.Handler) http.Handler {
	jsonHandler := slog.NewJSONHandler(os.Stderr, nil)
	log := slog.New(jsonHandler)
	return &Logger{handler: handler, log: log}
}

func jwtMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract the token from the Authorization header
		tokenString := extractToken(r)

		if tokenString == "" {
			next.ServeHTTP(w, r)
			return
		}

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verify the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			// Return the secret key used to sign the token
			return getSecret(), nil
		})

		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		// Check if the token is valid
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Token is valid, you can access claims here
			// For example: userID := claims["user_id"].(string)
			issuer := claims["iss"].(string) // Issuer
			if issuer != "tunetree" {
				next.ServeHTTP(w, r)
				return
			}
			expiration := int64(claims["exp"].(float64))
			now := time.Now().Unix()
			if expiration < now {
				next.ServeHTTP(w, r)
				return
			}
			role := claims["aud"].(string)       // Audience (user role)
			id := int64(claims["sub"].(float64)) // Subject (user identifier)
			ctx := context.WithValue(r.Context(), "role", role)
			ctx = context.WithValue(ctx, "id", id)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}
	}
}

func extractToken(r *http.Request) string {
	bearerToken := r.Header.Get("Authorization")
	strArr := strings.Split(bearerToken, " ")
	if len(strArr) == 2 {
		return strArr[1]
	}

	// If we got here, it wasn't set as a header.
	token, err := r.Cookie("token")
	if err != nil {
		return ""
	}

	return token.Value
}

func trackHandler(res http.ResponseWriter, req *http.Request) {
	artistname := strings.ReplaceAll(req.PathValue("artistname"), "+", " ")
	if artistname == "" {
		http.Error(res, "No artist name specified", http.StatusNotFound)
		return
	}

	switch req.Method {
	case "GET":
		track, ok := GetTrack(artistname)
		if !ok {
			http.Error(res, "No track associated with that artist", http.StatusNotFound)
			return
		}

		res.Header().Set("Content-Type", "application/json")
		json.NewEncoder(res).Encode(track)
	case "POST":
		var track Track
		// TODO: validate email = artistname etc here
		id, ok := req.Context().Value("id").(int64)
		if !ok {
			http.Error(res, "invalid token", http.StatusUnauthorized)
			return
		}
		user, ok := GetUser(id)
		if !ok {
			http.Error(res, "Failed to read body of request", http.StatusNotFound)
			return
		}
		role := req.Context().Value("role")
		if role == nil || role == "USER" {
			http.Error(res, "invalid token", http.StatusUnauthorized)
			return
		}
		if getRole(user) != "ARTIST" ||
			user.Artist != artistname {
			http.Error(res, "Logged in user != requested user", http.StatusUnauthorized)
			return
		}

		body, err := io.ReadAll(req.Body)
		if err != nil {
			http.Error(res, "Failed to read body of request", http.StatusInternalServerError)
			return
		}
		if err := json.Unmarshal(body, &track); err != nil {
			http.Error(res, "Malformed data", http.StatusInternalServerError)
			return
		}
		if err = PutTrack(id, track); err != nil {
			// TODO: error handling?
			http.Error(res, fmt.Sprintf("Failed to save track: %s", err), http.StatusInternalServerError)
			return
		}
	default:
		http.Error(res, fmt.Sprintf("%s on /track not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
}

func signupHandler(res http.ResponseWriter, req *http.Request) {
	var user User

	// Check if it is post
	if req.Method != "POST" {
		http.Error(res, fmt.Sprintf("%s on /signup not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
	body, err := io.ReadAll(req.Body)
	if err != nil {
		http.Error(res, "Failed to read body of request", http.StatusInternalServerError)
		return
	}
	// Check if there is a username and password
	if err := json.Unmarshal(body, &user); err != nil {
		http.Error(res, "Failed to parse body of request", http.StatusInternalServerError)
		return
	}

	// MAKE SURE TO UPDATE THIS ON FRONTEND IF YOU CHANGE THIS
	if !validPassword(user.Password) {
		http.Error(res, "Password invalid", http.StatusBadRequest)
		return
	}
	emailRegex := `^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$`
	if match, err := regexp.Match(emailRegex, []byte(user.Email)); err == nil && !match {
		http.Error(res, "Email invalid", http.StatusBadRequest)
		return
	} else if err != nil {
		http.Error(res, fmt.Sprintf("Failed to parse email: %s", err), http.StatusInternalServerError)
		return
	}
	if user.Artist == "" {
		http.Error(res, "Artist name invalid", http.StatusBadRequest)
		return
	}

	// Add to DB
	if err := PutUser(&user); err != nil {
		http.Error(res, fmt.Sprintf("Failed to add user: %s", err), http.StatusInternalServerError)
		return
	}

	return
}

func validPassword(password string) bool {
	/* Rules:
	 *   - All characters must be between 33 and 126 ascii inclusive
	 *   - Password must be between 8-64 characters
	 *   - One number
	 *   - One Special
	 *   - One Caps
	 */

	caps := false
	special := false
	number := false

	if len(password) < 8 || len(password) > 64 {
		return false
	}
	for _, code := range password {
		if code < 33 || code > 126 {
			return false
		}
		if code > 47 && code < 58 {
			number = true
		}
		if (code > 32 && code < 48) || (code > 57 && code < 65) || (code > 90 && code < 97) || (code > 122 && code < 127) {
			special = true
		}
		if code > 64 && code < 91 {
			caps = true
		}
	}
	return caps && special && number
}

func getRole(user User) string {
	if user.Artist == "" {
		return "USER"
	} else {
		return "ARTIST"
	}
}

func getSecret() (secret []byte) {
	secret = []byte(os.Getenv("JWT_SECRET"))
	if secret == nil {
		panic("JWT_SECRET not set")
	}
	return secret
}

func generateToken(user User) (token string, err error) {
	secret := getSecret()
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.Id,                          // Subject (user identifier)
		"iss": "tunetree",                       // Issuer
		"aud": getRole(user),                    // Audience (user role)
		"exp": time.Now().Add(time.Hour).Unix(), // Expiration time
		"iat": time.Now().Unix(),                // Issued at
	})

	token, err = jwtToken.SignedString(secret)
	if err != nil {
		return "", err
	}

	return token, err
}

func loginHandler(res http.ResponseWriter, req *http.Request) {
	var user User

	// Check if it is post
	if req.Method != "POST" {
		http.Error(res, fmt.Sprintf("%s on /login not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
	body, err := io.ReadAll(req.Body)
	if err != nil {
		http.Error(res, "Failed to read body of request", http.StatusInternalServerError)
		return
	}
	// Check if there is a username and password
	if err := json.Unmarshal(body, &user); err != nil {
		http.Error(res, "Failed to parse body of request", http.StatusInternalServerError)
		return
	}

	user2, ok := GetUserFromEmail(user.Email)
	if !ok {
		// TODO: is this the case for DB failures?
		http.Error(res, fmt.Sprintf("Username/Password incorrect"), http.StatusUnauthorized)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user2.Password), []byte(user.Password))
	if err != nil {
		http.Error(res, fmt.Sprintf("Username/Password incorrect"), http.StatusUnauthorized)
		return
	}

	// Shake dat ass jwt-y
	token, err := generateToken(user2)
	if err != nil {
		http.Error(res, fmt.Sprintf("Failed to generate token"), http.StatusInternalServerError)
	}
	responseBody := map[string]string{"token": token, "Artist": user2.Artist, "Email": user2.Email, "SpotifyId": user2.SpotifyId}
	json.NewEncoder(res).Encode(responseBody)
	return
}

type SpotifyHandler struct {
	clientId string
	secret   string
	apiKey   string
	expiry   time.Time
}

func getEnv(key string) (value string) {
	dotenv, err := godotenv.Read(".env")
	if err != nil {
		panic(err)
	}

	value = os.Getenv(key)
	if value == "" {
		value = dotenv[key]
	}
	return value
}

// TODO turn the dotenv into a helper function
func GetSpotifyHandler() (s SpotifyHandler) {
	clientId := getEnv("SPOTIFY_CLIENT_ID")
	secret := getEnv("SPOTIFY_SECRET")
	if secret == "" || clientId == "" {
		panic("SPOTIFY_CLIENT_ID or SPOTIFY_SECRET unset")
	}

	s = SpotifyHandler{clientId: clientId, secret: secret}
	s.ApiKey()

	return s
}

type KeyResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
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

func server(wg *sync.WaitGroup, port int, tlsEnabled bool) (s *http.Server) {
	var config *tls.Config

	InitDB()

	m := http.NewServeMux()
	if tlsEnabled {
		cert, err := tls.LoadX509KeyPair("server.pem", "server.key")
		if err != nil {
			fmt.Printf("Failed to load certificate keypair: %s\n", err)
		}
		config = &tls.Config{Certificates: []tls.Certificate{cert}}
	}

	address := fmt.Sprintf(":%d", port)
	m.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("healthy"))
		if err != nil {
			fmt.Printf("Failed to write response: %s", err)
		}
	})
	m.HandleFunc("/login/", loginHandler)
	m.HandleFunc("/signup/", signupHandler)
	m.HandleFunc("/track/{artistname}/", jwtMiddleware(trackHandler))
	m.Handle("/external/", GetSpotifyHandler())

	s = &http.Server{Addr: address, Handler: NewLogger(NewCors(m)), TLSConfig: config}
	go func() {
		defer wg.Done()
		if err := s.ListenAndServe(); err != http.ErrServerClosed {
			fmt.Printf("ListenAndServe failed: %s\n", err)
		}
	}()
	// Block until server is ready
	healthClient := http.DefaultClient
	for i := 0; i < 5; i += 1 {
		res, err := healthClient.Get("http://" + "127.0.0.1" + address + "/health")
		if err != nil {
			time.Sleep(5 * time.Second)
			continue
		}
		if res.StatusCode == 200 {
			fmt.Printf("Server listening on %s\n", address)
			return s
		}
		time.Sleep(5 * time.Second)
	}

	fmt.Printf("Health check failed")
	return nil
}

func main() {
	wg := &sync.WaitGroup{}
	wg.Add(1)
	server := server(wg, 81, false)

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		timeout, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		defer func() {
			err := server.Shutdown(timeout)
			if err != nil {
				fmt.Printf("Failed to shutdown server: %s\n", err)
			}
		}()
		for sig := range c {
			if sig == syscall.SIGINT {
				fmt.Println("Recieved keyboard interrupt. Shutting down server.")
				break
			}
		}
	}()

	wg.Wait()
}
