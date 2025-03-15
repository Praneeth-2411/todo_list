require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
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

// Fetch all tasks
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching tasks');
    } else {
      res.json(results);
    }
  });
});

// Add a new task
app.post('/tasks', (req, res) => {
  const { task_name, due_date, category } = req.body;
  db.query(
    'INSERT INTO tasks (task_name, due_date, category) VALUES (?, ?, ?)',
    [task_name, due_date, category],
    (err, result) => {
      if (err) {
        res.status(500).send('Error adding task');
      } else {
        res.status(201).send('Task added');
      }
    }
  );
});

// Delete a task and reset the AUTO_INCREMENT
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
    if (err) {
      res.status(500).send('Error deleting task');
    } else {
      // Reset the AUTO_INCREMENT after deletion
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

app.listen(5123, () => {
  console.log('Backend is running on port 5123');
});
