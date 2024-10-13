package main

import (
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
	"time"
)

const DBFILE string = "backend.db"

var db *sql.DB

type User struct {
	Id        int64
	Email     string
	Password  string
	Artist    string
	Link      string
	SpotifyId string
}

const USERTABLE = `
CREATE TABLE IF NOT EXISTS users(
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	artist TEXT UNIQUE,
	path TEXT UNIQUE,
	spotifyId TEXT UNIQUE
);
`

type Track struct {
	Name    string            `json:"name"`
	Image   string            `json:"image"`
	Links   map[string]string `json:"links"`
	Message string            `json:"message"`
}

const TRACKTABLE = `
CREATE TABLE IF NOT EXISTS tracks(
	name TEXT NOT NULL,
	image TEXT NOT NULL,
	message TEXT,
	created INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	FOREIGN KEY (user_id)
		REFERENCES users (rowid)
);
`

const LINKTABLE = `
CREATE TABLE IF NOT EXISTS links(
	name TEXT NOT NULL,
	link TEXT,
	track_id INTEGER NOT NULL,
	FOREIGN KEY (track_id)
		REFERENCES tracks (rowid)
);
`

func InitDB() {
	var err error
	db, err = sql.Open("sqlite3", DBFILE)
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
}

func GetUserFromLink(artistlink string) (user User, ok bool) {
	err := db.QueryRow("SELECT *, rowid FROM users u WHERE u.path = ?;", artistlink).Scan(&user.Email, &user.Password, &user.Artist, &user.Link, &user.SpotifyId, &user.Id)
	if err == sql.ErrNoRows {
		return user, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}
	return user, true
}

func GetTrack(user User) (track Track, ok bool) {
	var trackid int
	err := db.QueryRow("SELECT t.name, t.image, t.message, t.rowid FROM users u JOIN tracks t ON t.user_id = u.rowid WHERE u.rowid = ? ORDER BY created DESC LIMIT 1;", user.Id).Scan(&track.Name, &track.Image, &track.Message, &trackid)
	if err == sql.ErrNoRows {
		return track, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}

	track.Links = map[string]string{}
	rows, err := db.Query("SELECT l.name, l.link FROM links l WHERE l.track_id = ?;", trackid)
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

func PutTrack(userId int64, track Track) (err error) {
	res, err := db.Exec("INSERT INTO tracks VALUES (?, ?, ?, ?, ?);", track.Name, track.Image, track.Message, time.Now().Unix(), userId)
	if err != nil {
		return err
	}
	trackId, err := res.LastInsertId()
	if err != nil {
		return err
	}
	for name, link := range track.Links {
		_, err := db.Exec("INSERT INTO links VALUES (?, ?, ?);", name, link, trackId)
		if err != nil {
			return err
		}
	}
	return err
}

func GetUser(id int64) (user User, ok bool) {
	user.Id = id
	err := db.QueryRow("SELECT * FROM users WHERE rowid = ?;", id).Scan(&user.Email, &user.Password, &user.Artist, &user.Link, &user.SpotifyId)
	if err == sql.ErrNoRows {
		return user, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}
	return user, true
}

func GetUserFromEmail(email string) (user User, ok bool) {
	err := db.QueryRow("SELECT *, rowid FROM users WHERE email = ?;", email).Scan(&user.Email, &user.Password, &user.Artist, &user.Link, &user.SpotifyId, &user.Id)
	if err == sql.ErrNoRows {
		return user, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}
	return user, true
}

func PutUser(user *User) (err error) {
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return fmt.Errorf("Failed to hash password: %e", err)
	}
	if user.Artist == "" {
		_, err = db.Exec("INSERT INTO users VALUES (?,?,NULL,NULL);", user.Email, hashedPass)
	} else {
		_, err = db.Exec("INSERT INTO users VALUES (?,?,?,?,?);", user.Email, hashedPass, user.Artist, user.Link, user.SpotifyId)
	}
	return err
}
