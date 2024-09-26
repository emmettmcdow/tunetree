package main

import (
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

const DBFILE string = "backend.db"

var db *sql.DB

type User struct {
	Email    string
	Password string
	Artist   string
}

const USERTABLE = `
CREATE TABLE IF NOT EXISTS users(
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	artist TEXT UNIQUE
);
`

type Track struct {
	Name    string
	Image   []byte
	Links   []Link
	Message string
}

const TRACKTABLE = `
CREATE TABLE IF NOT EXISTS tracks(
	name TEXT NOT NULL,
	image TEXT NOT NULL,
	message TEXT,
	artist_id INTEGER NOT NULL,
	FOREIGN KEY (artist_id)
		REFERENCES users (rowid)
);
`

type Link struct {
	Name string
	Link string
}

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

func GetTrack(artistname string) (track Track, ok bool) {
	var trackid int
	err := db.QueryRow("SELECT t.name, t.image, t.message, t.rowid FROM users u JOIN tracks t ON t.user_id = u.rowid WHERE u.artist = ?;", artistname).Scan(&track.Name, &track.Image, &track.Message, trackid)
	if err == sql.ErrNoRows {
		return track, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}

	rows, _ := db.Query("SELECT t.name, t.image, t.message, t.rowid FROM users u JOIN tracks t ON t.user_id = u.rowid WHERE u.artist = ?;", artistname)
	for rows.Next() {
		var link Link
		err := rows.Scan(&link.Name, &link.Link)
		if err == sql.ErrNoRows {
			return track, false
		} else if err != nil {
			// TODO: deal with this
			panic(err)
		}
		track.Links = append(track.Links, link)
	}

	return track, true
}

func GetUser(email string) (user User, ok bool) {
	err := db.QueryRow("SELECT * FROM users WHERE email = ?;", email).Scan(&user.Email, &user.Password, &user.Email)
	if err == sql.ErrNoRows {
		return user, false
	} else if err != nil {
		// TODO: deal with this
		panic(err)
	}
	return user, true
}

func AddUser(user *User) (err error) {
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return fmt.Errorf("Failed to hash password: %e", err)
	}
	if user.Artist == "" {
		_, err = db.Exec("INSERT INTO users VALUES (?,?,NULL);", user.Email, hashedPass)
	} else {
		_, err = db.Exec("INSERT INTO users VALUES (?,?,?);", user.Email, hashedPass, user.Artist)
	}
	return err
}
