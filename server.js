const fs = require('fs');
const express = require('express');
const https = require('https');

module.exports = () => {

	const app = express();
	const port = 5555;

	app.use(express.static(__dirname + '/static'));

	const options = {
		key: fs.readFileSync(`${__dirname}/ssl/key.pem`),
		cert: fs.readFileSync(`${__dirname}/ssl/cert.pem`)
	};

	const server = https.createServer(options, app);
	server.listen(port, () => {
		console.log(`listening on port ${port}`);
	});
};
