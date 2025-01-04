package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

// ***************************************************************************************** Signup

type SignupHandler struct {
	config Config
	db     UserDB
}

func GetSignupHandler(config Config) *SignupHandler {
	return &SignupHandler{config: config}
}

func (s *SignupHandler) WithDB(db UserDB) *SignupHandler {
	s.db = db
	return s
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

func (s *SignupHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	s.signupHandler(res, req)
}

func (s *SignupHandler) signupHandler(res http.ResponseWriter, req *http.Request) {
	var user User

	// Check if it is post
	if req.Method != "POST" {
		http.Error(res, fmt.Sprintf("%s on /signup not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
	body, err := io.ReadAll(req.Body)
	if err != nil {
		http.Error(res, fmt.Sprintf("Failed to read body of request: %s", err), http.StatusInternalServerError)
		return
	}
	// Check if there is a username and password
	if err := json.Unmarshal(body, &user); err != nil {
		http.Error(res, fmt.Sprintf("Malformed data: %s", err), http.StatusBadRequest)
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
	if err := s.db.PutUser(&user); err != nil {
		dbErr := ParseDBError(err)
		switch dbErr.Type {
		case DbErrNotUnique:
			http.Error(res, fmt.Sprintf("User with %s already exists", dbErr.Field), http.StatusBadRequest)
		default:
			http.Error(res, fmt.Sprintf("Something has gone critically wrong: %s", dbErr.Content), http.StatusInternalServerError)
		}
	}

	return
}

// ****************************************************************************************** Login

type LoginHandler struct {
	config Config
	db     UserDB
}

func GetLoginHandler(config Config) *LoginHandler {
	return &LoginHandler{config: config}
}

func (l *LoginHandler) WithDB(db UserDB) *LoginHandler {
	l.db = db
	return l
}

func (l *LoginHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	l.loginHandler(res, req)
}

func (l *LoginHandler) loginHandler(res http.ResponseWriter, req *http.Request) {
	var user User

	// Check if it is post
	if req.Method != "POST" {
		http.Error(res, fmt.Sprintf("%s on /login not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
	body, err := io.ReadAll(req.Body)
	if err != nil {
		http.Error(res, fmt.Sprintf("Failed to read body of request: %s", err), http.StatusInternalServerError)
		return
	}
	// Check if there is a username and password
	if err := json.Unmarshal(body, &user); err != nil {
		http.Error(res, fmt.Sprintf("Malformed data: %s", err), http.StatusBadRequest)
		return
	}

	user2, ok := l.db.GetUserFromEmail(user.Email)
	if !ok {
		http.Error(res, "Username/Password incorrect", http.StatusUnauthorized)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user2.Password), []byte(user.Password))
	if err != nil {
		http.Error(res, "Username/Password incorrect", http.StatusUnauthorized)
		return
	}

	// Shake dat ass jwt-y
	token, err := generateToken(user2)
	if err != nil {
		http.Error(res, fmt.Sprintf("Failed to generate token: %s", err), http.StatusInternalServerError)
	}
	responseBody := struct {
		Token string
		Id    string
	}{Token: token, Id: fmt.Sprintf("%d", user2.Id)}
	json.NewEncoder(res).Encode(responseBody)
	return
}
