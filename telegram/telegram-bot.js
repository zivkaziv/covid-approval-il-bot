const TelegramMessage = require("../models/TelegramMessage");
const { handle } = require("../message-handler");
const { bot } = require("./bot");

const start = () => {
	bot.on("text", async (message) => {
		console.log(message);
		const telegramMessage = new TelegramMessage({ message });
		await handle(telegramMessage);
	});
	bot.start();
};

module.exports = {
	start,
};
