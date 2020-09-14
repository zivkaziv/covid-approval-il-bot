const TeleBot = require("telebot");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TeleBot(botToken);

module.exports = {
	bot,
};
