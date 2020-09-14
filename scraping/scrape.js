const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const solve = require("./catpch-solver");

const chromeOptions = {
	headless: true,
	defaultViewport: null,
	slowMo: 10,
	args: [
		"--incognito",
		"--no-sandbox",
		// "--disable-setuid-sandbox",
		// '--user-data-dir="/tmp/chromium"',
		// "--disable-web-security",
		// "--disable-features=site-per-process",
		"--single-process",
		"--no-zygote",
	],
};

const scrape = async (username, password) => {
	console.log(`${username} - Start sraping`);
	puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch(chromeOptions);
	try {
		console.log(`${username} - puppeteer.launch`);
		const page = await browser.newPage();
		console.log(`${username} - browser.newPage`);
		// await page.setDefaultNavigationTimeout(0);
		await page.goto(
			"https://parents.education.gov.il/prhnet/parents/rights-obligations-regulations/health-statement-kindergarden?utm_source=sms"
		);
		console.log(`${username} - open website`);
		await page.waitFor(3500);
		// Press fill parent approval
		await page.click('input[value="מילוי הצהרת בריאות מקוונת"]');
		await page.waitFor(2000);

		// Fill username
		await page.type("#HIN_USERID", username);
		// Fill password
		await page.type("#Ecom_Password", password);
		// Submit
		await page.click(".submit.user-pass-submit");
		await page.waitFor(2000);

		// Is already approved
		const isExists = await page.$(".fa-check-circle");
		if (!isExists) {
			// Approval
			await page.click('input[value="מילוי הצהרת בריאות"]');
			await page.waitFor(2000);
			await page.click('input[value="אישור"]');
		}

		const todayDate = new Date().toISOString().slice(0, 10);
		await page.screenshot({ path: `${todayDate}.png` });
		console.log(`${username} - taking screenshot`);
		await browser.close();
		return {
			file: todayDate,
		};
	} catch (e) {
		console.error(e);
		await browser.close();
	}
};

module.exports = {
	scrape,
};
