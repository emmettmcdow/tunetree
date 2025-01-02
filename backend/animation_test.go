package main

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"reflect"
	"sort"
	"strings"
	"testing"

	"github.com/google/uuid"
)

func printStructFieldsAlphabetically(s interface{}) string {
	// Get type information using reflection
	t := reflect.TypeOf(s)

	// Get all field names
	var fields []string
	for i := 0; i < t.NumField(); i++ {
		fields = append(fields, t.Field(i).Name)
	}

	// Sort fields alphabetically
	sort.Strings(fields)

	// Convert struct to map using JSON
	var m map[string]interface{}
	b, _ := json.Marshal(s)
	json.Unmarshal(b, &m)

	// Print fields in alphabetical order
	output := ""
	for _, field := range fields {
		output += fmt.Sprintf("  \"%s\": %v\n", field, m[field])
	}

	return output
}

// ***************************************************************************************** TestDB
type TestAnimationDB struct {
	jobs       map[string]AnimationJob
	animations map[int64][]Animation
}

func (t *TestAnimationDB) AddJob(job AnimationJob) bool {
	t.jobs[job.UUID.String()] = job
	return true
}
func (t *TestAnimationDB) UpdateJob(job AnimationJob) bool {
	if _, ok := t.jobs[job.UUID.String()]; !ok {
		return false
	}
	return t.AddJob(job)
}
func (t *TestAnimationDB) DropJob(job AnimationJob) (ok bool) {
	if _, ok := t.jobs[job.UUID.String()]; !ok {
		return false
	}
	delete(t.jobs, job.UUID.String())
	return true
}
func (t *TestAnimationDB) GetJob(inID uuid.UUID) (AnimationJob, bool) {
	job, ok := t.jobs[inID.String()]
	return job, ok
}
func (t *TestAnimationDB) GetAnimations(user User) ([]Animation, bool) {
	anims, ok := t.animations[user.Id]
	return anims, ok
}

// *************************************************************************************** TestUUID
type TestUUID struct {
	curr uint64
}

func (d *TestUUID) New() uuid.UUID {
	out := d.FromInt(d.curr)
	d.curr = d.curr + 1
	return out
}

func (d *TestUUID) FromInt(num uint64) uuid.UUID {
	byteSlice := make([]byte, 16)
	binary.BigEndian.PutUint32(byteSlice, uint32(num))
	out, err := uuid.FromBytes(byteSlice)
	if err != nil {
		panic(err)
	}

	return out
}

// ************************************************************************************* TestClient
type TestClient struct {
	Curr *http.Response
	Err  error
}

func (c *TestClient) Do(req *http.Request) (*http.Response, error) {
	return c.Curr, c.Err
}

type ExternalResponse struct {
	Code int
	Body string
	Err  error
}

// ************************************************************************************** Constants
const REPLICATE_WEBHOOK_SUCCESS = `
{
  "completed_at": "2024-12-16T20:50:50.663249Z",
  "created_at": "2024-12-16T20:45:31.621000Z",
  "data_removed": false,
  "error": null,
  "id": "r59ecv8ccnrga0ckt4w9qsz71r",
  "input": {
    "prompt": "a man is talking angrily",
    "prompt_optimizer": true,
    "first_frame_image": "https://replicate.delivery/pbxt/M9jlcXgeaypBr2yQYGf9JXgxUCJWRt8ODUDvt90UWPUsQBXC/back-to-the-future.png"
  },
  "logs": "Moderating content...\nModeration complete in 0.30sec\nRunning prediction... \nInitializing video generation with prompt: a man is talking angrily\nUsing model: video-01-live2d\nImage size: 88.3KB\nGenerating video...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nGenerated video in 316.3sec\nRetrieving video...\nDownloading 699264 bytes\nDownloaded 0.67MB in 2.16sec",
  "metrics": {
    "predict_time": 319.032752861,
    "total_time": 319.042249
  },
  "output": "https://replicate.delivery/czjl/sbnhNsfxliTKUaSGhr5C2gfLQzfVY2eiIRn7YB9J927pKRuPB/tmp0t22y4g9.output.mp4",
  "started_at": "2024-12-16T20:45:31.630497Z",
  "status": "succeeded",
  "urls": {
    "stream": "https://stream.replicate.com/v1/files/fddq-mkv7daeugubinmxdntb55at2ibis4h4pd7cuh65wbfwca4gnvw7a",
    "get": "https://api.replicate.com/v1/predictions/r59ecv8ccnrga0ckt4w9qsz71r",
    "cancel": "https://api.replicate.com/v1/predictions/r59ecv8ccnrga0ckt4w9qsz71r/cancel"
  },
  "version": "359b9915544a2a60a4687304f58669a9af7fad1e92cc5943a197f6139b6d7ecb"
}
`
const REPLICATE_WEBHOOK_FAILED = `
{
  "completed_at": "2024-12-16T20:50:50.663249Z",
  "created_at": "2024-12-16T20:45:31.621000Z",
  "data_removed": false,
  "error": null,
  "id": "r59ecv8ccnrga0ckt4w9qsz71r",
  "input": {
    "prompt": "a man is talking angrily",
    "prompt_optimizer": true,
    "first_frame_image": "https://replicate.delivery/pbxt/M9jlcXgeaypBr2yQYGf9JXgxUCJWRt8ODUDvt90UWPUsQBXC/back-to-the-future.png"
  },
  "logs": "Moderating content...\nModeration complete in 0.30sec\nRunning prediction... \nInitializing video generation with prompt: a man is talking angrily\nUsing model: video-01-live2d\nImage size: 88.3KB\nGenerating video...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nGenerated video in 316.3sec\nRetrieving video...\nDownloading 699264 bytes\nDownloaded 0.67MB in 2.16sec",
  "metrics": {
    "predict_time": 319.032752861,
    "total_time": 319.042249
  },
  "started_at": "2024-12-16T20:45:31.630497Z",
  "status": "failed",
  "version": "359b9915544a2a60a4687304f58669a9af7fad1e92cc5943a197f6139b6d7ecb"
}
`
const REPLICATE_WEBHOOK_QUEUED = `
{
  "completed_at": "2024-12-16T20:50:50.663249Z",
  "created_at": "2024-12-16T20:45:31.621000Z",
  "data_removed": false,
  "error": null,
  "id": "r59ecv8ccnrga0ckt4w9qsz71r",
  "input": {
    "prompt": "a man is talking angrily",
    "prompt_optimizer": true,
    "first_frame_image": "https://replicate.delivery/pbxt/M9jlcXgeaypBr2yQYGf9JXgxUCJWRt8ODUDvt90UWPUsQBXC/back-to-the-future.png"
  },
  "logs": "Moderating content...\nModeration complete in 0.30sec\nRunning prediction... \nInitializing video generation with prompt: a man is talking angrily\nUsing model: video-01-live2d\nImage size: 88.3KB\nGenerating video...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nStill generating...\nGenerated video in 316.3sec\nRetrieving video...\nDownloading 699264 bytes\nDownloaded 0.67MB in 2.16sec",
  "metrics": {
    "predict_time": 319.032752861,
    "total_time": 319.042249
  },
  "started_at": "2024-12-16T20:45:31.630497Z",
  "status": "starting",
  "version": "359b9915544a2a60a4687304f58669a9af7fad1e92cc5943a197f6139b6d7ecb"
}
`

func TestAnimationJobHandler(t *testing.T) {
	uuid2 := TestUUID{curr: 1}
	tests := []struct {
		name             string
		method           string
		path             string
		body             interface{}
		externalResponse ExternalResponse
		expectedStatus   int
		expectedBody     interface{}
	}{
		{
			name:   "Queue Basic 1",
			method: http.MethodPost,
			path:   "/animation/new/",
			body: AnimationJob{
				Prompt:  "prompt1",
				ArtLink: "x.com/artlink1",
				UserId:  1,
			},
			externalResponse: ExternalResponse{
				Body: REPLICATE_WEBHOOK_QUEUED,
				Code: http.StatusOK,
			},
			expectedStatus: http.StatusOK,
			expectedBody: AnimationJob{
				AnimationLink: "",
				ArtLink:       "x.com/artlink1",
				Prompt:        "prompt1",
				Status:        "queued",
				UserId:        1,
				UUID:          uuid2.New(),
			},
		},
		{
			name:   "Queue Basic 2",
			method: http.MethodPost,
			path:   "/animation/new/",
			body: AnimationJob{
				Prompt:  "prompt2",
				ArtLink: "x.com/artlink2",
				UserId:  1,
			},
			externalResponse: ExternalResponse{
				Body: REPLICATE_WEBHOOK_QUEUED,
				Code: http.StatusOK,
			},
			expectedStatus: http.StatusOK,
			expectedBody: AnimationJob{
				AnimationLink: "",
				ArtLink:       "x.com/artlink2",
				Prompt:        "prompt2",
				Status:        "queued",
				UserId:        1,
				UUID:          uuid2.New(),
			},
		},
		{
			name:           "Status Incomplete 1",
			method:         http.MethodGet,
			path:           fmt.Sprintf("/animation/status/%s/", uuid2.FromInt(1)),
			body:           AnimationJob{},
			expectedStatus: http.StatusOK,
			expectedBody: AnimationJob{
				AnimationLink: "",
				ArtLink:       "x.com/artlink1",
				Prompt:        "prompt1",
				Status:        "queued",
				UserId:        1,
				UUID:          uuid2.FromInt(1),
			},
		},
		{
			name:   "Webhook Response 1",
			method: http.MethodPost,
			path:   fmt.Sprintf("/animation/status/%s/", uuid2.FromInt(1)),
			body:   REPLICATE_WEBHOOK_SUCCESS,
			externalResponse: ExternalResponse{
				Body: "foobar",
				Code: http.StatusOK,
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Status Complete 1",
			method:         http.MethodGet,
			path:           fmt.Sprintf("/animation/status/%s/", uuid2.FromInt(1)),
			body:           AnimationJob{},
			expectedStatus: http.StatusOK,
			expectedBody: AnimationJob{
				AnimationLink: "https://replicate.delivery/czjl/sbnhNsfxliTKUaSGhr5C2gfLQzfVY2eiIRn7YB9J927pKRuPB/tmp0t22y4g9.output.mp4",
				ArtLink:       "x.com/artlink1",
				Prompt:        "prompt1",
				Status:        "succeeded",
				UserId:        1,
				UUID:          uuid2.FromInt(1),
			},
		},
		{
			name:           "Status Incomplete 2",
			method:         http.MethodGet,
			path:           fmt.Sprintf("/animation/status/%s/", uuid2.FromInt(2)),
			body:           AnimationJob{},
			expectedStatus: http.StatusOK,
			expectedBody: AnimationJob{
				AnimationLink: "",
				ArtLink:       "x.com/artlink2",
				Prompt:        "prompt2",
				Status:        "queued",
				UserId:        1,
				UUID:          uuid2.FromInt(2),
			},
		},
		{
			name:           "Webhook Response 2",
			method:         http.MethodPost,
			path:           fmt.Sprintf("/animation/status/%s/", uuid2.FromInt(2)),
			body:           REPLICATE_WEBHOOK_FAILED,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Status Failed 2",
			method:         http.MethodGet,
			path:           fmt.Sprintf("/animation/status/%s/", uuid2.FromInt(2)),
			body:           AnimationJob{},
			expectedStatus: http.StatusOK,
			expectedBody: AnimationJob{
				AnimationLink: "",
				ArtLink:       "x.com/artlink2",
				Prompt:        "prompt2",
				Status:        "failed",
				UserId:        1,
				UUID:          uuid2.FromInt(2),
			},
		},
		{
			name:           "File Get 1",
			method:         http.MethodGet,
			path:           fmt.Sprintf("/animation/file/%s/", uuid2.FromInt(1)),
			body:           AnimationJob{},
			expectedStatus: http.StatusOK,
			expectedBody:   "foobar",
		},
	}

	db := TestAnimationDB{
		jobs:       map[string]AnimationJob{},
		animations: map[int64][]Animation{},
	}
	idGen := TestUUID{curr: 1}
	testClient := TestClient{}
	handler := GetAnimationHandler(Config{
		runtime: t.TempDir(),
	}).WithDB(&db).WithUUID(&idGen).WithClient(&testClient)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a new request
			var reqBody []byte
			var err error
			switch tt.body.(type) {
			case AnimationJob:
				if tt.body != (AnimationJob{}) {
					reqBody, err = json.Marshal(tt.body)
					if err != nil {
						t.Fatalf("Failed to marshal request body: %v", err)
					}
				}
			case string:
				// This is a replicate webhook response
				reqBody = []byte(tt.body.(string))
			default:
			}

			req := httptest.NewRequest(tt.method, tt.path, bytes.NewBuffer(reqBody))
			req.Header.Set("Content-Type", "application/json")

			// Prep the response
			testClient.Err = tt.externalResponse.Err
			testClient.Curr = &http.Response{
				StatusCode: tt.externalResponse.Code,
				Body:       io.NopCloser(strings.NewReader(tt.externalResponse.Body)),
			}

			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			switch tt.expectedBody.(type) {
			case AnimationJob:
				// TODO
				if tt.expectedBody != (AnimationJob{}) {
					var got AnimationJob
					if err := json.NewDecoder(w.Body).Decode(&got); err != nil {
						t.Fatalf("Failed to decode response body: %v", err)
					}

					expString := tt.expectedBody.(AnimationJob).String()
					gotString := got.String()

					if expString != gotString {
						t.Errorf("Expected body:\n%s\n got\n%s", expString, gotString)
						return
					}
				}
			case string:
				want := tt.expectedBody.(string)
				got := w.Body.String()
				if want != got {
					t.Errorf("Expected body:\n%s\n got\n%s", want, got)
					return
				}
			}
		})
	}
}
