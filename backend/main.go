package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

type Config struct {
	runtime     string
	frontendUrl string
	thisUrl     string

	spotifyClientId string
	spotifySecret   string

	replicateApiToken string
	replicateEndpoint string
}

// TODO: get rid of the global
var config Config

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
	headers.Add("Access-Control-Allow-Origin", config.frontendUrl)
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

func getEnv(key string) (value string) {
	value = os.Getenv(key)
	if value == "" {
		dotenv, err := godotenv.Read(config.runtime + ".env")
		if err != nil {
			dotenv = map[string]string{}
		}
		value = dotenv[key]
	}
	return value
}

type KeyResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
}

func server(wg *sync.WaitGroup, port int, runtime string) (s *http.Server) {

	db := DefaultDB(runtime)

	m := http.NewServeMux()

	address := fmt.Sprintf(":%d", port)
	m.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("healthy"))
		if err != nil {
			fmt.Printf("Failed to write response: %s", err)
		}
	})
	// TODO: refactor login and signup to be part of the user handler
	m.Handle("/login/", GetLoginHandler(config).WithDB(db))
	m.Handle("/signup/", GetSignupHandler(config).WithDB(db))
	m.Handle("/track/{artistlink}/", GetTrackHandler(config).WithDB(db))
	m.Handle("/external/", GetSpotifyHandler(config))
	m.Handle("/user/{userId}/", GetUserHandler(config).WithDB(db))

	animHandler := GetAnimationHandler(config).WithDB(db)
	m.Handle("/animation/status/{uuid}/", animHandler)
	m.Handle("/animation/new/", animHandler)
	m.Handle("/animation/file/{uuid}/", animHandler)

	s = &http.Server{Addr: address, Handler: NewLogger(NewCors(m))}
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

	runtime := getEnv("RUNTIME")
	if runtime == "" {
		runtime = "./"
	}
	frontendUrl := getEnv("FRONTEND_URL")
	if frontendUrl == "" {
		frontendUrl = "http://localhost:3000"
	}
	thisUrl := getEnv("THIS_URL")
	if thisUrl == "" {
		thisUrl = "http://localhost:81"
	}

	clientId := getEnv("SPOTIFY_CLIENT_ID")
	secret := getEnv("SPOTIFY_SECRET")
	if secret == "" || clientId == "" {
		panic("SPOTIFY_CLIENT_ID or SPOTIFY_SECRET unset")
	}
	replicateApiToken := getEnv("REPLICATE_API_TOKEN")
	if replicateApiToken == "" {
		fmt.Printf("WARNING: REPLICATE_API_TOKEN unset\n")
		replicateApiToken = "TEST_TOKEN"
		fmt.Printf("WARNING: Setting to %s\n", replicateApiToken)
	}

	replicateEndpoint := getEnv("REPLICATE_ENDPOINT")
	if replicateEndpoint == "" {
		replicateEndpoint = REPLICATE_FAKE_ENDPOINT
		fmt.Printf("WARNING: REPLICATE_ENDPOINT unset\n")
		fmt.Printf("WARNING: Setting to %s\n", replicateEndpoint)
	}

	config = Config{
		runtime:           runtime,
		frontendUrl:       frontendUrl,
		spotifyClientId:   clientId,
		spotifySecret:     secret,
		replicateApiToken: replicateApiToken,
		replicateEndpoint: replicateEndpoint,
	}

	wg := &sync.WaitGroup{}
	wg.Add(1)
	server := server(wg, 81, config.runtime)

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
