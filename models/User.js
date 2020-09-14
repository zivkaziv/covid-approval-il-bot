const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
	username: {
		type: String,
	},
	password: {
		type: String,
	},
	telegramId: {
		type: String,
		required: true,
		index: true,
	},
	chatId: {
		type: [String],
		required: true,
	},
});

module.exports = User = mongoose.model("users", UserSchema);
