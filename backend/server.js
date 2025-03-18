require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

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
        const newTask = {
          id: result.insertId,
          task_name,
          due_date,
          category,
          completed,
        };
        res.status(201).json(newTask); 
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

// Signup Route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err, result) => {
      if (err) {
        res.status(500).send('Error signing up user');
      } else {
        res.status(201).send('User signed up successfully');
      }
    }
  );
});

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send('Invalid username or password');
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid username or password');
    }

    res.status(200).send('Login successful');
  });
});

app.listen(5123, () => {
  console.log('Backend is running on port 5123');
});
