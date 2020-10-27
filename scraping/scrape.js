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
		await page.waitForSelector('input[value="מילוי הצהרת בריאות מקוונת"]');
		// Press fill parent approval
		await page.click('input[value="מילוי הצהרת בריאות מקוונת"]');

		// Login page
		await page.waitForSelector("#HIN_USERID");
		// Fill username
		await page.type("#HIN_USERID", username);
		// Fill password
		await page.type("#Ecom_Password", password);
		// Submit
		await page.click(".submit.user-pass-submit");

		// Header
		await page.waitForSelector("h1.page-title.title");
		await page.waitFor(2000);

		// Is already approved
		const isNotExists = await page.$('.ng-star-inserted input[value="מילוי הצהרת בריאות"]');
		if (isNotExists) {
			// Approval
			await page.click('input[value="מילוי הצהרת בריאות"]');
			await page.waitForSelector('input[value="אישור"]');
			await page.click('input[value="אישור"]');
			await page.waitFor(3000);
			// Refresh the page to make sure it's signed
			await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
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
		return {
			error: "faild",
		};
	}
};

module.exports = {
	scrape,
};
