require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


const Task = require('./models/Task');
const User = require('./models/User');

const app = express();
app.use(cors({ origin: "http://localhost:3000", methods: "GET,PUT,POST,DELETE" }));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

//  Add a new task for a user
app.post('/tasks', async (req, res) => {
  try {
    const { task_name, due_date, category, completed = false, user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const userExists = await User.findById(user_id);
    if (!userExists) {
      return res.status(400).json({ error: 'Invalid user_id: No such user exists' });
    }
    const newTask = new Task({ task_name, due_date, category, completed, user_id });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Error adding task' });
  }
});

//  Fetch tasks for a specific user
app.get('/tasks/:user_id', async (req, res) => {
  try {
    const tasks = await Task.find({ user_id: req.params.user_id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

//  Delete a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await Task.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: "Error deleting task" });
  }
});


//  Update task completion status
app.put('/tasks/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed field must be a boolean' });
    }

    const task = await Task.findOne({ _id: req.params.id });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.completed = completed;
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: "Error updating task" });
  }
});


//  Signup user
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User signed up successfully', user_id: newUser._id });
  } catch (error) {
    res.status(500).json({ error: 'Error signing up user' });
  }
});

//  Login user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful', user_id: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in user' });
  }
});

//  Delete user account
app.post('/delete-user', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    await Task.deleteMany({ user_id: user._id });
    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting account' });
  }
});

app.post('/search', async (req, res) => {
  console.log("Search Request Received:", req.body); // ✅ Log request
  const { searchTerm, user_id } = req.body;
  if (!searchTerm || !user_id) {
    return res.status(400).json({ error: 'Search term and user ID are required' });
  }
  
  try {
    const tasks = await Task.find({
      user_id,
      task_name: { $regex: searchTerm, $options: 'i' },
    });

    console.log("Search Results:", tasks); // ✅ Log found tasks
    res.json(tasks);
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({ error: 'Error searching tasks' });
  }
});



//  Start the server
const port = process.env.PORT || 5123;
app.listen(port, () => {
  console.log(`Backend is running on port ${port}`);
});
