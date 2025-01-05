package main

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	sqlite3 "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func DefaultDB(runtime string) DB {
	var err error
	dbpath := runtime + "/backend.db"

	db, err := sql.Open("sqlite3", dbpath)
	if err != nil {
		panic(err)
	}

	if _, err := db.Exec(USERTABLE); err != nil {
		panic(err)
	}
	if _, err := db.Exec(TRACKTABLE); err != nil {
		panic(err)
	}
	if _, err := db.Exec(LINKTABLE); err != nil {
		panic(err)
	}
	if _, err := db.Exec(ANIMATIONJOBTABLE); err != nil {
		panic(err)
	}
	if _, err := db.Exec(ANIMATIONTABLE); err != nil {
		panic(err)
	}

	return DB{db}
}

type DB struct {
	db *sql.DB
}

// ****************************************************************************************** Track
type Track struct {
	Name      string            `json:"name"`
	Image     string            `json:"image"`
	Links     map[string]string `json:"links"`
	Message   string            `json:"message"`
	Animation string            `json:"animation"`
	Display   string            `json:"display"`
	Colors    string            `json:"colors"`
}

const TRACKTABLE = `
CREATE TABLE IF NOT EXISTS tracks(
	name TEXT NOT NULL,
	image TEXT NOT NULL,
	message TEXT,
	animation TEXT NOT NULL,
	display TEXT NOT NULL,
	created INTEGER NOT NULL,
	colors TEXT,
	user_id INTEGER NOT NULL,
	FOREIGN KEY (user_id)
		REFERENCES users (rowid)
);
`

type TrackDB interface {
	GetTrack(user User) (track Track, ok bool)
	PutTrack(userId int64, track Track) (err error)
}

func (this DB) GetTrack(user User) (track Track, ok bool) {
	var trackid int
	query := `
	SELECT t.name, t.image, t.message, t.animation, t.display, t.colors, t.rowid 
	FROM users u 
	JOIN tracks t ON t.user_id = u.rowid 
	WHERE u.rowid = ? 
	ORDER BY created 
	DESC LIMIT 1;
	`
	err := this.db.QueryRow(query, user.Id).Scan(&track.Name, &track.Image, &track.Message, &track.Animation, &track.Display, &track.Colors, &trackid)
	if err == sql.ErrNoRows {
		return track, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}

	track.Links = map[string]string{}
	rows, err := this.db.Query("SELECT l.name, l.link FROM links l WHERE l.track_id = ?;", trackid)
	if err != nil {
		panic(err)
	}
	for rows.Next() {
		var name string
		var link string
		err := rows.Scan(&name, &link)
		if err == sql.ErrNoRows {
			return track, false
		} else if err != nil {
			// TODO: deal with this
			panic(err)
		}
		track.Links[name] = link
	}

	return track, true
}
func (this DB) PutTrack(userId int64, track Track) (err error) {
	res, err := this.db.Exec("INSERT INTO tracks VALUES (?, ?, ?, ?, ?, ?, ?, ?);", track.Name, track.Image, track.Message, track.Animation, track.Display, time.Now().Unix(), track.Colors, userId)
	if err != nil {
		return err
	}
	trackId, err := res.LastInsertId()
	if err != nil {
		return err
	}
	for name, link := range track.Links {
		_, err := this.db.Exec("INSERT INTO links VALUES (?, ?, ?);", name, link, trackId)
		if err != nil {
			return err
		}
	}
	return err
}

// ******************************************************************************************* Link
const LINKTABLE = `
CREATE TABLE IF NOT EXISTS links(
	name TEXT NOT NULL,
	link TEXT,
	track_id INTEGER NOT NULL,
	FOREIGN KEY (track_id)
		REFERENCES tracks (rowid)
);
`

// ******************************************************************************************* User
type User struct {
	Id        int64  `json:"id"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Artist    string `json:"artist"`
	Link      string `json:"link"`
	SpotifyId string `json:"spotifyId"`
}

const USERTABLE = `
CREATE TABLE IF NOT EXISTS users(
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	artist TEXT UNIQUE,
	link TEXT UNIQUE,
	spotifyId TEXT UNIQUE
);`

type UserDB interface {
	GetUser(id int64) (user User, err error)
	GetUserFromEmail(email string) (user User, ok bool)
	GetUserFromLink(artistlink string) (user User, ok bool)
	PutUser(user *User) (err error)
}

func (this DB) GetUser(id int64) (user User, err error) {
	user.Id = id
	err = this.db.QueryRow("SELECT * FROM users WHERE rowid = ?;", id).Scan(&user.Email, &user.Password, &user.Artist, &user.Link, &user.SpotifyId)
	return user, err
}

func (this DB) GetUserFromEmail(email string) (user User, ok bool) {
	err := this.db.QueryRow("SELECT *, rowid FROM users WHERE email = ?;", email).Scan(&user.Email, &user.Password, &user.Artist, &user.Link, &user.SpotifyId, &user.Id)
	if err == sql.ErrNoRows {
		return user, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}
	return user, true
}

func (this DB) PutUser(user *User) (err error) {
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return fmt.Errorf("Failed to hash password: %e", err)
	}
	if user.Artist == "" {
		_, err = this.db.Exec("INSERT INTO users VALUES (?,?,NULL,NULL);", user.Email, hashedPass)
	} else {
		_, err = this.db.Exec("INSERT INTO users VALUES (?,?,?,?,?);", user.Email, hashedPass, user.Artist, user.Link, user.SpotifyId)
	}
	return err
}

func (this DB) GetUserFromLink(artistlink string) (user User, ok bool) {

	err := this.db.QueryRow("SELECT *, rowid FROM users u WHERE u.link = ?;", artistlink).Scan(&user.Email, &user.Password, &user.Artist, &user.Link, &user.SpotifyId, &user.Id)
	if err == sql.ErrNoRows {
		return user, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}
	return user, true
}

// ************************************************************************************** Animation
type AnimationJob struct {
	UUID          uuid.UUID `json:"uuid"`
	UserId        int64     `json:"user_id"`
	Status        string    `json:"status"`
	ArtLink       string    `json:"art_link"`
	AnimationLink string    `json:"animation_link"`
	Prompt        string    `json:"prompt"`
}

func (a AnimationJob) String() string {
	output := ""
	output += fmt.Sprint("{\n")
	output += fmt.Sprintf("  \"UUID\": %s\n", a.UUID.String())
	output += fmt.Sprintf("  \"UserId\": %d\n", a.UserId)
	output += fmt.Sprintf("  \"Status\": %s\n", a.Status)
	output += fmt.Sprintf("  \"ArtLink\": %s\n", a.ArtLink)
	output += fmt.Sprintf("  \"AnimationLink\": %s\n", a.AnimationLink)
	output += fmt.Sprintf("  \"Prompt\": %s\n", a.Prompt)
	output += fmt.Sprint("}\n")
	return output
}

const ANIMATIONJOBTABLE = `
CREATE TABLE IF NOT EXISTS animation_jobs(
	uuid TEXT NOT NULL,
	user_id INTEGER NOT NULL,
	status TEXT NOT NULL,
	art_link TEXT NOT NULL,
	animation_link TEXT,
	prompt TEXT,
	FOREIGN KEY (user_id)
		REFERENCES users (rowid)
);`

type Animation struct {
	UUID          uuid.UUID `json:"uuid"`
	Prompt        string    `json:"prompt"`
	AnimationLink string    `json:"animation_link"`
	TrackId       int64     `json:"track_id"`
}

const ANIMATIONTABLE = `
CREATE TABLE IF NOT EXISTS backgrounds(
	uuid TEXT NOT NULL,
	prompt TEXT,
	animation_link TEXT,
	track_id INTEGER NOT NULL,
	FOREIGN KEY (track_id)
		REFERENCES tracks (rowid)
);`

type AnimationDB interface {
	AddJob(job AnimationJob) error
	UpdateJob(job AnimationJob) error
	DropJob(job AnimationJob) error
	GetJob(uuid uuid.UUID) (AnimationJob, error)

	GetAnimations(user User) ([]Animation, error)
}

func (this DB) AddJob(job AnimationJob) error {
	_, err := this.db.Exec("INSERT INTO animation_jobs VALUES (?,?,?,?,?,?);", job.UUID.String(), job.UserId, job.Status, job.ArtLink, job.AnimationLink, job.Prompt)
	return err
}

func (this DB) UpdateJob(job AnimationJob) error {
	query := `
	UPDATE animation_jobs
	SET status = $2, animation_link = $3
	WHERE uuid = $1;`
	_, err := this.db.Exec(query, job.UUID.String(), job.Status, job.AnimationLink)
	return err
}
func (db DB) DropJob(job AnimationJob) error { return nil }
func (this DB) GetJob(uuid uuid.UUID) (job AnimationJob, err error) {
	query := `
	SELECT user_id, status, art_link, animation_link, prompt
	FROM animation_jobs
	WHERE uuid = $1;`
	res := this.db.QueryRow(query, uuid.String())
	err = res.Scan(&job.UserId, &job.Status, &job.ArtLink, &job.AnimationLink, &job.Prompt)
	job.UUID = uuid
	return job, err
}

func (db DB) GetAnimations(user User) ([]Animation, error) { return []Animation{}, nil }

type DBErrType int

const (
	DbErrNotUnique DBErrType = iota
	DbErrUncategorized
)

type DBErr struct {
	Type    DBErrType
	Field   string
	Content error
}

func ParseDBError(err error) (dbErr DBErr) {
	return sqlite3ParseDBError(err.(sqlite3.Error))
}

func sqlite3ParseDBError(err sqlite3.Error) (dbErr DBErr) {
	dbErr.Content = err
	switch err.ExtendedCode {
	case sqlite3.ErrConstraintUnique:
		dbErr.Type = DbErrNotUnique
		errText := err.Error()
		fieldStart := strings.LastIndex(errText, ".") + 1
		if fieldStart == -1 {
			panic("unexpected sqlite error: " + errText)
		}
		dbErr.Field = errText[fieldStart:]
	default:
		dbErr.Type = DbErrUncategorized
	}
	return dbErr
}
