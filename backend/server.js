require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors({ origin: "http://localhost:3000", methods: "GET,PUT,POST,DELETE" }));

app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database!');
  }
});


app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching tasks');
    } else {
      res.json(results);
    }
  });
});


app.post('/tasks', (req, res) => {
  const { task_name, due_date, category, completed = false } = req.body;
  db.query(
    'INSERT INTO tasks (task_name, due_date, category, completed) VALUES (?, ?, ?, ?)',
    [task_name, due_date, category, completed],
    (err, result) => {
      if (err) {
        res.status(500).send('Error adding task');
      } else {
        res.status(201).send('Task added');
      }
    }
  );
});


app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
    if (err) {
      res.status(500).send('Error deleting task');
    } else {
      
      db.query('ALTER TABLE tasks AUTO_INCREMENT = 1', (err) => {
        if (err) {
          console.error('Error resetting auto increment:', err);
          res.status(500).send('Error resetting auto increment');
        } else {
          res.status(200).send('Task deleted and ID reset');
        }
      });
    }
  });
});
app.put('/tasks/:id', (req, res) => {
  const taskID = req.params.id;
  const { completed } = req.body;

  db.query(
    'UPDATE tasks SET completed = ? WHERE id = ?',
    [completed, taskID],
    (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Error updating task');
      } else {
        res.status(200).send('Task updated successfully');
      }
    }
  );
});



app.listen(5123, () => {
  console.log('Backend is running on port 5123');
});