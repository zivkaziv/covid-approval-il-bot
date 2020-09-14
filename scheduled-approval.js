(async () => {
	// const telegramBot = require("./telegram/telegram-bot");
	const mongoose = require("mongoose");

	const connectionString =
		process.env.MONGO_URI ||
		"mongodb://root:rootpassword@localhost:27017/covidapprovals?authSource=admin";

	mongoose.connect(connectionString, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
    });
    
    const { requestExecuter } = require("./request-executer");
    const User = require("./models/User");
    const { photoSender, textSender } = require("./telegram/senders");

    const username = process.argv.slice(2)[0];
	const user = await User.findOne({ username });
    if (user) {
		await requestExecuter(
			textSender(user.chatId),
			photoSender(user.chatId),
			user.username,
			user.password
		);
	} else {
		console.error(`User with username ${username} wasn't found in the DB`);
	}
})();
