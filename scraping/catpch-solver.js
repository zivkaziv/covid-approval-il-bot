const axios = require("axios");
const https = require("https");

function rdn(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

async function solve(page) {
	try {
		await page.waitForFunction(() => {
			const iframe = document.querySelector('iframe[src*="api2/anchor"]');
			if (!iframe) return false;

			return !!iframe.contentWindow.document.querySelector("#recaptcha-anchor");
		});

		let frames = await page.frames();
		const recaptchaFrame = frames.find((frame) =>
			frame.url().includes("api2/anchor")
		);

		const checkbox = await recaptchaFrame.$("#recaptcha-anchor");
		await checkbox.click({ delay: rdn(30, 150) });

		await page.waitForFunction(() => {
			const iframe = document.querySelector('iframe[src*="api2/bframe"]');
			if (!iframe) return false;

			const audioMode = iframe.contentWindow.document.querySelector(
				"#recaptcha-image-button"
			);

			const img = iframe.contentWindow.document.querySelector(
				".rc-image-tile-wrapper img"
			);
			return (img && img.complete) || audioMode;
		});

		frames = await page.frames();
		const imageFrame = frames.find((frame) =>
			frame.url().includes("api2/bframe")
		);
		// in case we are already in audio challange don't try to press the audio button
		const audioResponse = await imageFrame.$("#audio-response");
		if (!audioResponse) {
			const audioButton = await imageFrame.$('#recaptcha-audio-button')
			await audioButton.click({ delay: rdn(30, 150) });
		}

		const weAreblockedElement = await recaptchaFrame.$('.rc-doscaptcha-body-text'); 
		if(weAreblockedElement){
			throw('Huston we have a problem - blocked');
		}

		const element = await recaptchaFrame.$(".rc-doscaptcha-header-text");
		await page.waitForFunction(() => {
			const iframe = document.querySelector('iframe[src*="api2/bframe"]');
			if (!iframe) return false;

			return !!iframe.contentWindow.document.querySelector(
				"audio"
			);
		});

		const audioLink = await page.evaluate(() => {
			const iframe = document.querySelector('iframe[src*="api2/bframe"]');
			return iframe.contentWindow.document.querySelector(
				"audio"
			).src;
		});

		if(!audioLink){
			throw('Failed to get audiolink');
		}
		console.log(`audioLink is ${audioLink}`);
		const audioBytes = await page.evaluate((audioLink) => {
			return (async () => {
				const response = await window.fetch(audioLink);
				const buffer = await response.arrayBuffer();
				return Array.from(new Uint8Array(buffer));
			})();
		}, audioLink);

		const httsAgent = new https.Agent({ rejectUnauthorized: false });
		const response = await axios({
			httsAgent,
			method: "post",
			url: "https://api.wit.ai/speech?v=20170307",
			data: new Uint8Array(audioBytes).buffer,
			headers: {
				Authorization: "Bearer JVHWCNWJLWLGN6MFALYLHAPKUFHMNTAC",
				"Content-Type": "audio/mpeg3",
			},
		});

		const audioTranscript = response.data._text.trim();
		console.log(`Transcrption ${audioTranscript}`);
		if (audioTranscript === "") {
			return {
				error: true,
				errorMessage: "Couldn't solve the captcha",
			};
		}
		const input = await imageFrame.$("#audio-response");
		await input.click({ delay: rdn(30, 150) });
		await input.type(audioTranscript, { delay: rdn(30, 75) });

		const verifyButton = await imageFrame.$("#recaptcha-verify-button");
		await verifyButton.click({ delay: rdn(30, 150) });

		await page.waitForFunction(() => {
			const iframe = document.querySelector('iframe[src*="api2/anchor"]');
			if (!iframe) return false;


			return !!iframe.contentWindow.document.querySelector(
				'#recaptcha-anchor[aria-checked="true"]'
			);
		});

		return page.evaluate(
			() => document.getElementById("g-recaptcha-response").value
		);
	} catch (e) {
		console.log(e);
		return {
			error: true,
			errorMessage: "I got blocked... Please try again later",
		};
	}
}

module.exports = solve;
