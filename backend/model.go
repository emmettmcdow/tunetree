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

func InitDB() {
	var err error
	db, err = sql.Open("sqlite3", DBFILE)
	if err != nil {
		panic(err)
	}

	if _, err := db.Exec(USERTABLE); err != nil {
		panic(err)
	}
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
