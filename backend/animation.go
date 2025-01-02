package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

type AnimationHandler struct {
	apiKey  string
	thisURL string
	db      AnimationDB
	client  HttpClient
	idGen   IDGen
	storage string
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
	a.storage = config.runtime + "/animations"
	return a
}

func (a AnimationHandler) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	m := http.NewServeMux()
	m.HandleFunc("/animation/status/{uuid}/", a.ServeStatus)
	m.HandleFunc("/animation/new/", a.ServeNew)
	m.HandleFunc("/animation/file/{uuid}/", a.ServeFile)

	rateLimitedMux := NewRateLimiter(m)

	rateLimitedMux.ServeHTTP(res, req)
}

func (a AnimationHandler) ServeStatus(res http.ResponseWriter, req *http.Request) {
	inputUUID := req.PathValue("uuid")
	if inputUUID == "" {
		http.Error(res, "No artist name specified", http.StatusBadRequest)
		return
	}
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
	switch req.Method {
	case "GET":
		if job.Status == "succeeded" || job.Status == "failed" {
			if ok := a.db.DropJob(job); !ok {
				http.Error(res, "Unknown db error", http.StatusInternalServerError)
				return
			}
		}
		json.NewEncoder(res).Encode(job)
		return
	case "POST":
		var bod webhookResponse
		body, err := io.ReadAll(req.Body)
		if err != nil {
			http.Error(res, fmt.Sprintf("Failed to read body of request: %s", err), http.StatusInternalServerError)
			return
		}
		if err := json.Unmarshal(body, &bod); err != nil {
			http.Error(res, fmt.Sprintf("Malformed data: %s", err), http.StatusBadRequest)
			return
		}
		job.Status = bod.Status
		job.AnimationLink = bod.Output

		if ok := a.db.UpdateJob(job); !ok {
			http.Error(res, "Failed to update job", http.StatusInternalServerError)
		}
		if job.Status == "succeeded" {
			if err := a.CommitJob(job); err != nil {
				http.Error(res, fmt.Sprintf("Failed to download animation: %s", err), http.StatusInternalServerError)
			}
		}
		return

	default:
		http.Error(res, fmt.Sprintf("%s on /animation/status/ not allowed", req.Method), http.StatusMethodNotAllowed)
		return
	}
}

func (a AnimationHandler) animationFilePath(uuid string) string {
	return filepath.Join(a.storage, uuid+".mp4")
}

func (a AnimationHandler) ServeFile(res http.ResponseWriter, req *http.Request) {
	inputUUID := req.PathValue("uuid")
	if inputUUID == "" {
		http.Error(res, "No artist name specified", http.StatusBadRequest)
		return
	}
	path := a.animationFilePath(inputUUID)
	http.ServeFile(res, req, path)
}

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

func (a AnimationHandler) downloadAnimation(anim AnimationJob, w io.Writer) error {
	req, err := http.NewRequest(http.MethodGet, anim.AnimationLink, http.NoBody)
	if err != nil {
		return fmt.Errorf("Failed to create animation download request: %s", err)
	}
	res, err := a.client.Do(req)
	if err != nil {
		return fmt.Errorf("Failed to make animation download request: %s", err)
	}

	if _, err := io.Copy(w, res.Body); err != nil {
		return fmt.Errorf("Failed to write animation to buffer: %s", err)
	}

	return nil
}

func (a AnimationHandler) saveAnimation(anim AnimationJob, r io.Reader) error {
	path := a.animationFilePath(anim.UUID.String())
	if err := os.MkdirAll(a.storage, 0755); err != nil {
		return fmt.Errorf("Failed to create animation directory: %s", err)
	}

	// Create the file
	file, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("Failed to create file %s: %s", path, err)
	}
	defer file.Close()

	if _, err := io.Copy(file, r); err != nil {
		return fmt.Errorf("Failed to write file %s: %s", path, err)
	}
	return nil
}

func (a AnimationHandler) CommitJob(anim AnimationJob) error {
	buf := bytes.NewBuffer(nil)
	if err := a.downloadAnimation(anim, buf); err != nil {
		return err
	}
	if err := a.saveAnimation(anim, buf); err != nil {
		return err
	}
	return nil
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
type webhookResponse struct {
	Output string `json:"output"`
	Status string `json:"status"`
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
