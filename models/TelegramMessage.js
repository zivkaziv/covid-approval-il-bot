// The message structure
// {
// 	update_id: 545208049,
// 	message: {
// 	  message_id: 369,
// 	  from: {
// 		id: 538184915,
// 		is_bot: false,
// 		first_name: 'Ziv',
// 		last_name: 'Kaziv',
// 		username: 'zivkaziv',
// 		language_code: 'he'
// 	  },
// 	  chat: {
// 		id: 538184915,
// 		first_name: 'Ziv',
// 		last_name: 'Kaziv',
// 		username: 'zivkaziv',
// 		type: 'private'
// 	  },
// 	  date: 1598704374,
// 	  text: 'ziv'
// 	}
//}

module.exports = class TelegramMessage {
	constructor(msg) {
		const { message } = msg;
		this.id = message.id;
		this.from = message.from;
		this.chat = message.chat;
		this.text = message.text;
		this.date = message.date;
	}

	getUserId() {
		return this.from.id;
    }
    getFirstName(){
        return this.from.first_name;
    }
    getLastName(){
        return this.from.last_name;
    }
    getUsername(){
        return this.from.username;
    }
    getLanguage(){
        return this.from.language_code;
    }
	getChatId() {
		return this.chat.id;
    }
    getText(){
        return this.text;
    }
};
