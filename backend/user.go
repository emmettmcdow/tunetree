package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type UserHandler struct {
	config Config
	db     UserDB
}

func GetUserHandler(config Config) *UserHandler {
	return &UserHandler{config: config}
}

func (t *UserHandler) WithDB(db UserDB) *UserHandler {
	t.db = db
	return t
}

func (t *UserHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	jwtMiddleware(t.userHandler)(res, req)
}

func (t *UserHandler) userHandler(res http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet {
		http.Error(res, fmt.Sprintf("Method %s not allowed!", req.Method), http.StatusBadRequest)
	}

	userId := req.PathValue("userId")
	if userId == "" {
		http.Error(res, "No artist name specified", http.StatusNotFound)
		return
	}
	idInt, err := strconv.Atoi(userId)
	if err != nil {
		http.Error(res, fmt.Sprintf("Bad user ID: %s", userId), http.StatusBadRequest)
	}
	// TODO: is this a bug? LOL if we get more than 2^32 users hahaha
	user, err := t.db.GetUser(int64(idInt))
	if err == sql.ErrNoRows {
		http.Error(res, fmt.Sprintf("User with ID %s not found", userId), http.StatusNotFound)
	} else if err != nil {
		panic(err)
	}
	user.Password = ""
	// Extra paranoid!
	if user.Password != "" {
		panic("Password is still set!")
	}
	json.NewEncoder(res).Encode(user)
}
