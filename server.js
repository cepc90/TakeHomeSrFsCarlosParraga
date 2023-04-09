const express = require('express');
const cors = require('cors');
const Task = require("./Task");
const {existsSync} = require("fs");
const sqlite3 = require('sqlite3');

const pendingTasks = [];
const completedTasks = [];

const DB_PATH = './task_database.sqlite';
let db;
if (!existsSync(DB_PATH)) { // It will create it if it doesn't exist, so I have to create the connection after checking if it exists
  db = new sqlite3.Database(DB_PATH);
  db.run('CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, completedDate DATETIME, completed BOOLEAN);', function(err) {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Table created successfully.');

      saveTaskToDb('Run the code', function () {
        saveTaskToDb('Make the appointment', function () {
          saveTaskToDb('Play the game', function () {
            saveCompletedTaskToDb('Play with child', '2023-04-07 10:30', function () {
              saveCompletedTaskToDb('Go Easter Egg hunting', '2023-04-03 16:59', function () {
                saveCompletedTaskToDb('Have breakfast', '2023-03-25 17:25', function () {
                  loadTasksFromTheDatabase();
                });
              });
            });
          });
        });
      });

    }
  });
} else {
  db = new sqlite3.Database(DB_PATH);
  loadTasksFromTheDatabase();
}

function loadTasksFromTheDatabase() {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      throw err;
    }

    const tasks = rows.map(row => ({
      id: row.id,
      description: row.description,
      completedDate: row.completedDate,
      completed: Boolean(row.completed),
    }));

    for (const task of tasks) {
      if (task.completed) {
        completedTasks.push(task);
      } else {
        pendingTasks.push(task);
      }
    }
  });
}

function saveTaskToDb(description, callback) {
  db.run('INSERT INTO tasks (description, completedDate, completed) VALUES (?, NULL, 0)', [description], function(err) {
    if (err) {
      console.log('Error inserting task: ', err);
    } else {
      callback(db.lastID);
    }
  });
}

function saveCompletedTaskToDb(description, completedDate, callback) {
  db.run('INSERT INTO tasks (description, completedDate, completed) VALUES (?, ?, 1)', [description, completedDate], function(err) {
    if (err) {
      console.log('Error inserting task: ', err);
    } else {
      callback(db.lastID);
    }
  });
}

const app = express();
app.use(cors()); // Was added for

app.get('/api/completedTasks', (req, res) => {
  res.json(completedTasks);
});

app.get('/api/pendingTasks', (req, res) => {
  res.json(pendingTasks);
});

app.post('/api/task', (req, res) => {
  const { description } = req.body;
  saveTaskToDb(description, function (id) {
    const task = new Task(id, description, null, false);
    pendingTasks.push(task);
    res.status(201).send(`Task "${description}" created successfully`);
  });
});

app.use(express.static('public'));
app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
