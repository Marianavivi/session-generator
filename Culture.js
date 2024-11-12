const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
const server = require('./qr');
const code = require('./pair');
require('events').EventEmitter.defaultMaxListeners = 500;

// Setting up body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/qr', server);
app.use('/code', code);

// Serve the HTML files
app.use('/pair', async (req, res, next) => {
  res.sendFile(__path + '/pair.html');
});
app.use('/', async (req, res, next) => {
  res.sendFile(__path + '/main.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`
Don't Forget To Give a Star

Server running on http://localhost:${PORT}`);
});

module.exports = app;
