package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
)

type AnimationHandler struct {
	apiKey  string
	thisURL string
	db      AnimationDB
	client  HttpClient
	idGen   IDGen
}

type IDGen interface {
	New() uuid.UUID
}

type DefaultUUID struct{}

func (d DefaultUUID) New() uuid.UUID {
	return uuid.New()
}

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

func (a *AnimationHandler) WithDB(db AnimationDB) *AnimationHandler {
	a.db = db
	return a
}

func (a *AnimationHandler) WithClient(client HttpClient) *AnimationHandler {
	a.client = client
	return a
}

func (a *AnimationHandler) WithUUID(idGen IDGen) *AnimationHandler {
	a.idGen = idGen
	return a
}

func GetAnimationHandler(config Config) (a *AnimationHandler) {
	a = &AnimationHandler{apiKey: config.replicateApiToken, thisURL: config.thisUrl}
	a.idGen = DefaultUUID{}
	a.client = &http.Client{}
	return a
}

func (a AnimationHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	m := http.NewServeMux()
	m.HandleFunc("/animation/status/{uuid}/", a.ServeStatus)
	m.HandleFunc("/animation/new/", a.ServeNew)
	m.HandleFunc("/animation/file/{uuid}/", a.Serve)

	rateLimitedMux := NewRateLimiter(m)

	rateLimitedMux.ServeHTTP(res, req)
}

func (a AnimationHandler) ServeStatus(res http.ResponseWriter, req *http.Request) {
	inputUUID := req.PathValue("uuid")
	if inputUUID == "" {
		http.Error(res, "No artist name specified", http.StatusBadRequest)
		return
	}
	switch req.Method {
	case "GET":
		newid, err := uuid.Parse(inputUUID)
		if err != nil {
			http.Error(res, "Malformed uuid", http.StatusBadRequest)
			return
		}
		job, ok := a.db.GetJob(newid)
		if !ok {
			http.Error(res, "Could not find job", http.StatusNotFound)
			return
		}
		json.NewEncoder(res).Encode(job)
		return
	default:
		http.Error(res, fmt.Sprintf("%s on /animation/new/ not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
}

func (a AnimationHandler) Serve(res http.ResponseWriter, req *http.Request) {}

// TODO: switch errors to json
func (a AnimationHandler) ServeNew(res http.ResponseWriter, req *http.Request) {
	var job AnimationJob

	if req.Method != "POST" {
		http.Error(res, fmt.Sprintf("%s on /animation/new/ not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(req.Body)
	if err != nil {
		http.Error(res, fmt.Sprintf("Failed to read body of request: %s", err), http.StatusInternalServerError)
		return
	}
	if err := json.Unmarshal(body, &job); err != nil {
		http.Error(res, fmt.Sprintf("Malformed data: %s", err), http.StatusBadRequest)
		return
	}

	job.UUID = a.idGen.New()
	job.Status = "queued"
	ok := a.db.AddJob(job)
	if !ok {
		http.Error(res, "Failed to queue animation generation job", http.StatusInternalServerError)
	}

	bgReq := bgRequest(a.apiKey, a.thisURL, job.UUID.String(), job.ArtLink, job.Prompt)
	_, err = a.client.Do(bgReq)
	if err != nil {
		panic(err)
	}

	json.NewEncoder(res).Encode(job)
}

func (a AnimationHandler) bgRequest(backgroundId, imageLink, prompt string) (req *http.Request) {
	// TODO: Check if photo already exists
	// Queue
	var sBody backgroundPayload = backgroundPayload{
		Model:               "minimax/video-01-live",
		Webhook:             fmt.Sprintf("%s/background/%s", a.thisURL, backgroundId),
		WebhookEventsFilter: []string{"completed"},
		Input: promptPayload{
			Prompt:          prompt,
			FirstImageFrame: imageLink,
		},
	}
	bodyString, err := json.Marshal(sBody)
	if err != nil {
		panic(err)
	}
	body := bytes.NewBuffer(bodyString)

	url := "https://api.replicate.com/v1/predictions"
	req, err = http.NewRequest("POST", url, body)
	if err != nil {
		panic(err)
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", a.apiKey))
	req.Header.Add("Content-Type", "application/json")

	return req
}

// ************************************************************************************** Replicate
type backgroundPayload struct {
	Model               string        `json:"model"`
	Webhook             string        `json:"webhook"`
	WebhookEventsFilter []string      `json:"webhook_events_filter"`
	Input               promptPayload `json:"input"`
}
type promptPayload struct {
	Prompt          string `json:"prompt"`
	FirstImageFrame string `json:"first_image_frame"`
}

func bgRequest(apiKey, thisURL, backgroundId, imageLink, prompt string) (req *http.Request) {
	// Check if photo already exists
	// Queue
	var sBody backgroundPayload = backgroundPayload{
		Model:               "minimax/video-01-live",
		Webhook:             fmt.Sprintf("%s/background/%s", thisURL, backgroundId),
		WebhookEventsFilter: []string{"completed"},
		Input: promptPayload{
			Prompt:          prompt,
			FirstImageFrame: imageLink,
		},
	}
	bodyString, err := json.Marshal(sBody)
	if err != nil {
		panic(err)
	}
	body := bytes.NewBuffer(bodyString)

	url := "https://api.replicate.com/v1/predictions"
	req, err = http.NewRequest("POST", url, body)
	if err != nil {
		panic(err)
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	req.Header.Add("Content-Type", "application/json")

	return req
}
