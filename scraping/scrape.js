const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const solve = require("./catpch-solver");

const chromeOptions = {
	headless: true,
	defaultViewport: null,
	slowMo: 10,
	args: ["--incognito", "--no-sandbox", "--single-process", "--no-zygote"],
};

const handleLogin = async (page, username, password) => {
	// enter directly to login page
	console.log(`${username} - enter to login page`);
	// Login page
	await page.waitForSelector('fieldset input[tabindex="1"]');
	await page.waitFor(3000);
	// Fill username
	await page.type('fieldset input[tabindex="1"]', username);
	console.log(`${username} -fill user name - ${username}`);
	// Fill password
	await page.type('input[tabindex="2"]', password);
	console.log(`${username} -fill password - ${password}`);
	// Submit
	await page.waitFor(3000);
	// await page.keyboard.press('Enter');
	await page.click('button[tabindex="3"]');
	console.log(`${username} - submit form`);
};

const scrape = async (username, password) => {
	console.log(`${username} - Start sraping`);
	puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch(chromeOptions);
	try {
		console.log(`${username} - puppeteer.launch`);
		const pages = await browser.pages();
		const page = pages[0];

		console.log(`${username} - browser.newPage`);
		// await page.setDefaultNavigationTimeout(0);
		await page.goto(
			"https://parents.education.gov.il/prhnet/parents/rights-obligations-regulations/health-statement-kindergarden?utm_source=sms"
		);
		await page.waitForSelector(".page-title.title");
		console.log(`${username} - open website`);
		await page.click(".page-title.title");
		console.log(`${username} - clicked title`);
		await page.waitForSelector('input[value="מילוי הצהרת בריאות מקוונת"]');
		// Press fill parent approval
		await page.click('input[value="מילוי הצהרת בריאות מקוונת"]');
		console.log(`${username} - clicked fill health statment`);

		await handleLogin(page, username, password);

		// In case we reidrected back to the login. try again
		if (page.url().indexOf("lgn") > 0) {
			await handleLogin(page, username, password);
		}

		// Header
		await page.waitForSelector("h1.page-title.title");
		await page.waitFor(2000);
		console.log(`${username} - logged in`);

		// Is already approved
		const isNotExists = await page.$(
			'.ng-star-inserted input[value="מילוי הצהרת בריאות"]'
		);
		let fullPage = false;
		if (isNotExists) {
			// Approval
			await page.click('input[value="מילוי הצהרת בריאות"]');
			await page.waitForSelector('input[value="אישור"]');
			await page.click('input[value="אישור"]');
			await page.waitFor(3000);
			// Scroll to top
			await page.evaluate(() => {
				window.document.documentElement.scrollTop = 0;
			});
			fullPage = true;
			// Refresh the page to make sure it's signed
			// await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
		}

		const todayDate = new Date().toISOString().slice(0, 10);
		await page.screenshot({ path: `${todayDate}.png`, fullPage });
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
