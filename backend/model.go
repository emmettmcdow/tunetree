package main

import (
	"database/sql"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

var db sql.DB

type User struct {
	email    string
	password string
	artist   string
}

const USERTABLE = `
CREATE TABLE IF NOT EXIST users(
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	artist TEXT UNIQUE
);
`

func GetUser(email string) (user User, err error) {
	return user, err
}

func AddUser(user *User) (err error) {
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.password), 10)
	if err != nil {
		return fmt.Errorf("Failed to hash password: %e", err)
	}
	if user.artist == "" {
		_, err = db.Exec("INSERT INTO users (?,?,NULL);", user.email, hashedPass)
	} else {
		_, err = db.Exec("INSERT INTO users (?,?,?);", user.email, hashedPass, user.artist)
	}
	return err
}
