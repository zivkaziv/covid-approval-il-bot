const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const telegramBot = require("./telegram/telegram-bot");
const TelegramMessage = require("./models/TelegramMessage");
const { handle } = require("./message-handler");
 
telegramBot.start();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connectionString =
	process.env.MONGO_URI ||
	"mongodb://root:rootpassword@localhost:27017/covidapprovals?authSource=admin";

mongoose.connect(connectionString, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true,
});

app.post("/messages/:token", async (req, res) => {
	try {
		console.log(req.body);
		const telegramMessage = new TelegramMessage(req.body);
		await handle(telegramMessage);
		res.status(200).send();
	} catch (e) {
		console.error(e);
		res.status(200).send();
	}
});

app.get("/send-approval/:id", async (req, res) => {
	const { requestExecuter } = require("./request-executer");
    const User = require("./models/User");
    const { photoSender, textSender } = require("./telegram/senders");

    const username = req.params.id;
	const user = await User.findOne({ username });
    if (user) {
		await requestExecuter(
			textSender(user.chatId),
			photoSender(user.chatId),
			user.username,
			user.password
		);
		res.status(200).send();
	} else {
		console.error(`User with username ${username} wasn't found in the DB`);
		res.status(404).send();
	}
})

app.get("/admin/:name", function (req, res) {
	res.sendFile(path.join(__dirname + `/public/admin/${req.params.name}.html`));
});

const PORT = process.env.PORT || 8082;
const server = app.listen(PORT, () => {
	const host = server.address().address;
	const port = server.address().port;

	console.log("covid approvals bot is listening at http://%s:%s", host, port);
});
