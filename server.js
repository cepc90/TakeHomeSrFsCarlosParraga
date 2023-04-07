const http = require('http');
const express = require('express');
const fs = require('fs');

let indexHtml;

fs.readFile('hello.html', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    indexHtml = data;
  }
});

const app = express();
app.get('/', (req, res) => {
  if (indexHtml) {
    res.send(indexHtml);
  } else {
    res.status(500).send('Error: Unable to render HTML file');
  }
});

app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
