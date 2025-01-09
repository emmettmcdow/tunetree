package main

import (
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type Telegram struct {
	ID  int64
	Bot *tgbotapi.BotAPI
}

func NewTelegram(chatId int64, token string) *Telegram {
	t := &Telegram{ID: chatId}
	bot, err := tgbotapi.NewBotAPI(token)
	t.Bot = bot
	if err != nil {
		panic(err)
	}
	return t
}

func (t *Telegram) Send(message string) (err error) {
	msg := tgbotapi.NewMessage(t.ID, message)

	// Optional: Enable markdown parsing
	// msg.ParseMode = "Markdown"

	// Send the message
	_, err = t.Bot.Send(msg)
	return err
}
