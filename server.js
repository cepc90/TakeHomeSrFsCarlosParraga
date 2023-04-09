const express = require('express');
const cors = require('cors');
const Task = require("./Task");
const moment = require('moment-timezone');

function dat(string) {
  return moment.tz(string, 'Canada/Eastern').toDate();
}

const pendingTasks = [
  new Task(1, 'Run the code', null, false),
  new Task(3, 'Make the appointment', null, false),
  new Task(4, 'Play the game', null, false),
];

const completedTasks = [
  new Task(2, 'Play with child', dat('2023-04-07 10:30'), true),
  new Task(5, 'Go Easter Egg hunting', dat('2023-04-03 16:59'), true),
  new Task(6, 'Have breakfast', dat('2023-03-25 17:25'), true),
];


const app = express();
app.use(cors()); // Was added for

app.get('/api/completedTasks', (req, res) => {
  res.json(completedTasks);
});

app.get('/api/pendingTasks', (req, res) => {
  res.json(pendingTasks);
});

app.use(express.static('public'));
app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
