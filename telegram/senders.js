const { bot } = require("./bot");

const photoSender = (chatIds) => async (photoToSend) => {
	for (let chatId of chatIds) {
		bot.sendPhoto(chatId, photoToSend);
	}
};

const textSender = (chatIds) => async (text) => {
	for (let chatId of chatIds) {
		bot.sendMessage(chatId, text);
	}
};

module.exports = {
	textSender,
	photoSender,
};
