const express = require('express');
const path = require('path');

const port = process.env.PORT || 8000;
const publicPath = '/';

const app = express();

app.use(publicPath, express.static('client'));

app.listen(port, function () {
  console.log(`App listening on: http://localhost:${port}`);
});
