const { scrape } = require("./scraping/scrape");
const fs = require("fs");

const requestExecuter = async (textSender, photoSender, username, password) => {
	textSender("מכין את ההצהרה");

	// Check if we already have file with today's approval
	try {
		const todayDate = new Date().toISOString().slice(0, 10);
		if (fs.existsSync(`./${todayDate}.png`)) {
			await photoSender(`${todayDate}.png`);
			return {
				success: {},
			};
		}
	} catch (e) {}

	const response = await scrape(username, password);
	if (!response.file) {
		await textSender(message);
		return {
			failed: {},
		};
	} else if (response.error) {
		await photoSender(`1.png`);
		await photoSender(`2.png`);
	} else {
		await photoSender(`${response.file}.png`);
		return {
			success: {},
		};
	}
};

module.exports = {
	requestExecuter,
};
