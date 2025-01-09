package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type SubscriptionHandler struct {
	db SubscriptionDB
}

func (s *SubscriptionHandler) WithDB(db SubscriptionDB) *SubscriptionHandler {
	s.db = db
	return s
}

func GetSubscriptionHandler(config Config) (s *SubscriptionHandler) {
	return &SubscriptionHandler{}
}

func (s SubscriptionHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var sub Subscription

	switch req.Method {
	case http.MethodPost:
		body, err := io.ReadAll(req.Body)
		if err != nil {
			http.Error(res, fmt.Sprintf("Failed to read body of request: %s", err), http.StatusInternalServerError)
			return
		}
		if err := json.Unmarshal(body, &sub); err != nil {
			http.Error(res, fmt.Sprintf("Malformed data: %s", err), http.StatusBadRequest)
			return
		}
		if sub.Email == "" {
			http.Error(res, "Email unset", http.StatusBadRequest)
			return
		}
		if sub.Link == "" {
			http.Error(res, "Artist Link unset", http.StatusBadRequest)
			return
		}
		user, ok := s.db.GetUserFromLink(sub.Link)
		if !ok {
			http.Error(res, "Not found artist", http.StatusNotFound)
		}
		sub.ArtistId = user.Id

		err = s.db.AddSubscription(sub)
		if err != nil {
			http.Error(res, err.Error(), http.StatusInternalServerError)
		}

	default:
		http.Error(res, fmt.Sprintf("Method %s not allowed on /subscriptions", req.Method), http.StatusMethodNotAllowed)
	}

}
