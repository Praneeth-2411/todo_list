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

// ✅ Fixed Search Route: Now uses `POST` instead of `GET`
app.post('/search', (req, res) => {
  const { searchTerm, user_id } = req.body;
  
  if (!searchTerm || !user_id) {
    return res.status(400).json({ error: 'Search term and user ID are required' });
  }

  const searchQuery = `%${searchTerm}%`;
  db.query(
    'SELECT * FROM tasks WHERE task_name LIKE ? AND user_id = ?',
    [searchQuery, user_id],
    (err, results) => {
      if (err) {
        console.error('Error searching tasks:', err);
        return res.status(500).json({ error: 'Error searching tasks' });
      }
      res.json(results);
    }
  );
});

// ✅ Fetch tasks for a specific user
app.get('/tasks/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.query('SELECT * FROM tasks WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Error fetching tasks' });
    }
    res.json(results);
  });
});

// ✅ Ensure user_id exists before adding a task
app.post('/tasks', (req, res) => {
  const { task_name, due_date, category, completed = false, user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  db.query('SELECT id FROM users WHERE id = ?', [user_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid user_id: No such user exists' });
    }

    db.query(
      'INSERT INTO tasks (task_name, due_date, category, completed, user_id) VALUES (?, ?, ?, ?, ?)',
      [task_name, due_date, category, completed, user_id],
      (err, result) => {
        if (err) {
          console.error('Error adding task:', err);
          return res.status(500).json({ error: 'Error adding task' });
        }
        res.status(201).json({
          id: result.insertId,
          task_name,
          due_date,
          category,
          completed,
          user_id,
        });
      }
    );
  });
});

// ✅ Properly delete a task without resetting AUTO_INCREMENT
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ error: 'Error deleting task' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

// ✅ Update task completion status safely
app.put('/tasks/:id', (req, res) => {
  const taskID = req.params.id;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed field must be a boolean' });
  }

  db.query(
    'UPDATE tasks SET completed = ? WHERE id = ?',
    [completed, taskID],
    (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ error: 'Error updating task' });
      }
      res.status(200).json({ message: 'Task updated successfully' });
    }
  );
});

// ✅ Return user_id on successful signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err, result) => {
      if (err) {
        console.error('Error signing up user:', err);
        return res.status(500).json({ error: 'Error signing up user' });
      }
      res.status(201).json({ message: 'User signed up successfully', user_id: result.insertId });
    }
  );
});

// ✅ Return user_id on successful login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', user_id: user.id });
  });
});

// Start the server
app.listen(5123, () => {
  console.log('Backend is running on port 5123');
});
