const User = require("./models/User");
const { requestExecuter } = require("./request-executer");
const { photoSender, textSender } = require("./telegram/senders");
const e = require("express");

const handle = async (message) => {
	const chatId = message.getChatId();
	const user = await User.findOne({ chatId });
	if (user) {
		await requestExecuter(
			textSender(user.chatId),
			photoSender(user.chatId),
			user.username,
			user.password
		);
	} else {
		textSender(chatId)(`Sorry... I can't find you`);
	}
};

module.exports = {
	handle,
};
