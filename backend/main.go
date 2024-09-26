package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

func trackHandler(res http.ResponseWriter, req *http.Request) {
	// Check if it is post
	if req.Method != "GET" {
		http.Error(res, fmt.Sprintf("%s on /track not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
	artistname := req.PathValue("artistname")
	if artistname == "" {
		http.Error(res, "No artist name specified", http.StatusNotFound)
		return
	}

	track, ok := GetTrack(artistname)
	if !ok {
		http.Error(res, "No track associated with that artist", http.StatusNotFound)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	json.NewEncoder(res).Encode(track)
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

	// TODO: Check if username is valid
	// TODO: Check if password is valid
	// Add to DB
	if err := AddUser(&user); err != nil {
		http.Error(res, fmt.Sprintf("Failed to add user: %s", err), http.StatusInternalServerError)
		return
	}

	return
}

func getRole(user User) string {
	if user.Artist == "" {
		return "USER"
	} else {
		return "ARTIST"
	}
}

func generateToken(user User) (token string, err error) {
	secret := []byte(os.Getenv("JWT_SECRET"))
	// TODO: is this correct?
	if secret == nil {
		panic("JWT_SECRET not set")
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.Email,                       // Subject (user identifier)
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

	user2, ok := GetUser(user.Email)
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
	token, err := generateToken(user)
	if err != nil {
		http.Error(res, fmt.Sprintf("Failed to generate token"), http.StatusInternalServerError)
	}
	tokenCookie := http.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(time.Hour),
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(res, &tokenCookie)

	return
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
	s = &http.Server{Addr: address, Handler: m, TLSConfig: config}

	m.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("healthy"))
		if err != nil {
			fmt.Printf("Failed to write response: %s", err)
		}
	})
	m.HandleFunc("/login/", loginHandler)
	m.HandleFunc("/signup/", signupHandler)
	m.HandleFunc("/track/{artistname}", trackHandler)

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
	server := server(wg, 80, false)

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
