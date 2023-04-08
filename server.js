const http = require('http');
const express = require('express');
const fs = require('fs');

const app = express();
app.get('/', (req, res) => {
  fs.readFile('index.html', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error: Unable to render HTML file');
    } else {
      res.send(data);
    }
  });
});

app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
