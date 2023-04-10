const express = require('express');
const cors = require('cors');
const Task = require("./Task");
const {existsSync} = require("fs");
const sqlite3 = require('sqlite3');

let pendingTasks = [];
let completedTasks = [];

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

function loadTasksFromTheDatabase(callback) {
  db.all('SELECT * FROM tasks WHERE completed = 0 ORDER BY description ASC', [], (err, rows) => {
    if (err) {
      throw err;
    }
    pendingTasks = queryResultToTaskList(rows);
    db.all('SELECT * FROM tasks WHERE completed = 1 ORDER BY completedDate DESC LIMIT 10', [], (err, rows) => {
      if (err) {
        throw err;
      }
      completedTasks = queryResultToTaskList(rows);
      // Completed tasks need to be sorted AFTER they are returned, since I must only display the 10 that were completed more recently
      completedTasks = completedTasks.sort((a, b) => {
        if (a.description < b.description) {
          return -1;
        }
        if (a.description > b.description) {
          return 1;
        }
        return 0;
      });
      if (callback != null) {
        callback();
      }
    });
  });
}

function queryResultToTaskList(rows) {
  return rows.map(row => ({
    id: row.id,
    description: row.description,
    completedDate: row.completedDate,
    completed: Boolean(row.completed),
  }));
}

function markTaskAsCompleted(id, callback) {
  console.log("Marking " + id + " as completed");
  const now = new Date().toISOString();
  db.run('UPDATE tasks SET completedDate = ?, completed = 1 WHERE id = ?', [now, id], function(err) {
    if (err) {
      console.log('Error updating task: ', err);
    } else {
      if (callback != null) {
        callback();
      }
    }
  });
}

function markTaskAsPending(id, callback) {
  console.log("Marking " + id + " as pending");
  db.run('UPDATE tasks SET completedDate = NULL, completed = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      console.log('Error updating task: ', err);
    } else {
      if (callback != null) {
        callback();
      }
    }
  });
}

function saveTaskToDb(description, callback) {
  db.run('INSERT INTO tasks (description, completedDate, completed) VALUES (?, NULL, 0)', [description], function(err) {
    if (err) {
      console.log('Error inserting task: ', err);
    } else {
      if (callback != null) {
        callback(db.lastID);
      }
    }
  });
}

function saveCompletedTaskToDb(description, completedDate, callback) {
  db.run('INSERT INTO tasks (description, completedDate, completed) VALUES (?, ?, 1)', [description, completedDate], function(err) {
    if (err) {
      console.log('Error inserting task: ', err);
    } else {
      if (callback != null) {
        callback(db.lastID);
      }
    }
  });
}

function deleteAllTasks(callback) {
  db.run('DELETE FROM tasks', function(err) {
    if (err) {
      console.log('Error deleting all tasks task: ', err);
    } else {
      if (callback != null) {
        callback(db.lastID);
      }
    }
  });
}


const app = express();
app.use(express.json());
app.use(cors()); // Was added for

app.get('/api/completedTasks', (req, res) => {
  res.json(completedTasks);
});

app.get('/api/pendingTasks', (req, res) => {
  res.json(pendingTasks);
});

app.get('/api/deleteAllTasks', (req, res) => {
  deleteAllTasks(function () {
    loadTasksFromTheDatabase(function () {
      res.status(204).send();
    });
  });
});

app.post('/api/task', (req, res) => {
  const description = req.body.description;
  saveTaskToDb(description, function (id) {
    loadTasksFromTheDatabase(function () {
      res.status(201).send(`Task "${description}" created successfully`);
    });
  });
});

app.put('/api/task/markAsCompleted', (req, res) => {
  const id = req.body.id;
  markTaskAsCompleted(id, function () {
    loadTasksFromTheDatabase(function () {
      res.status(204).send();
    });
  });
});

app.put('/api/task/markAsPending', (req, res) => {
  const id = req.body.id;
  markTaskAsPending(id, function () {
    loadTasksFromTheDatabase(function (){
      res.status(204).send();
    });
  });
});

app.use(express.static('public'));
app.listen(8080, () => {
  console.log('Server listening on port 8080');
});
