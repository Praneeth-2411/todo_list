require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const Task = require('./models/Task');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const origins=[
  "http://localhost:3000/","https://doneandanddusted.onrender.com"
]
const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors({  origin: origins, methods: "GET,PUT,POST,DELETE" }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const convertISTtoUTC = (dateStr, timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  let date = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00.000+05:30`);
  return new Date(date.toISOString());
};

const convertUTCtoIST = (utcDate) => {
  let date = new Date(utcDate);
  date.setTime(date.getTime() + (5.5 * 60 * 60 * 1000));

  const formattedDate = date.toISOString().split("T")[0];

  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let period = 'AM';

  if (hours >= 12) {
    period = 'PM';
    if (hours > 12) hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  return { date: formattedDate, time: formattedTime };
};

// -------------------- Task Endpoints -------------------- //

app.post('/tasks', async (req, res) => {
  try {
    console.log("🔵 Received request to add task:", req.body);
    const { task_name, due_date, due_time, category, completed = false, user_id, reminder } = req.body;

    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    const userExists = await User.findById(user_id);
    if (!userExists) return res.status(400).json({ error: 'Invalid user_id: No such user exists' });

    if (!due_date || !due_time) return res.status(400).json({ error: 'Both date and time are required' });

    const parsedDueDate = convertISTtoUTC(due_date, due_time);
    const newTask = new Task({ task_name, due_datetime: parsedDueDate, category, completed, user_id, reminder });

    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error('❌ Error adding task:', error);
    res.status(500).json({ error: 'Error adding task' });
  }
});

app.get('/tasks/:user_id', async (req, res) => {
  try {
    console.log(`🔍 Fetching tasks for user ${req.params.user_id}`);
    const tasks = await Task.find({ user_id: req.params.user_id });

    const formattedTasks = tasks.map(task => {
      const { date, time } = convertUTCtoIST(task.due_datetime);
      return { ...task.toObject(), due_date: date, due_time: time };
    });

    res.json(formattedTasks);
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

app.get('/search/:user_id/:query', async (req, res) => {
  try {
    const { user_id, query } = req.params;

    if (!user_id || !query.trim()) {
      return res.status(400).json({ error: 'User ID and query are required' });
    }

    const regex = new RegExp(query.trim(), 'i');

    const tasks = await Task.find({
      user_id,
      task_name: { $regex: regex }
    });

    const formattedTasks = tasks.map(task => {
      const { date, time } = convertUTCtoIST(task.due_datetime);
      return { ...task.toObject(), due_date: date, due_time: time };
    });

    res.json(formattedTasks);
  } catch (error) {
    console.error('❌ Error searching tasks:', error);
    res.status(500).json({ error: 'Error searching tasks' });
  }
});


app.put('/tasks/:id', async (req, res) => {
  try {
    console.log(`📝 Update request for task ${req.params.id}:`, req.body);
    const { task_name, date, time, due_datetime, category, reminder, completed } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (task_name !== undefined) task.task_name = task_name;
    if (category !== undefined) task.category = category;
    if (reminder !== undefined) task.reminder = reminder;
    if (completed !== undefined) task.completed = completed;

    // Smart update: prefer due_datetime, else build it from date + time
    if (due_datetime) {
      task.due_datetime = new Date(due_datetime);
    } else if (date && time) {
      task.due_datetime = convertISTtoUTC(date, time);
    }

    await task.save();
    triggeredReminders.delete(task._id.toString());


    res.json(task);
  } catch (error) {
    console.error("❌ Error updating task:", error);
    res.status(500).json({ error: "Error updating task" });
  }
});



app.delete('/tasks/:id', async (req, res) => {
  try {
    console.log(`🗑 Deleting task ${req.params.id}`);
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    await Task.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({ error: "Error deleting task" });
  }
});

// ------------------ Socket.io Reminder Logic ------------------ //

const triggeredReminders = new Map(); // taskId ➝ reminderTime
const userSocketMap = new Map();      // userId ➝ socket

// 🔁 This runs every 60 seconds to auto-send reminders
setInterval(async () => {
  const now = new Date();
  const tasks = await Task.find({ completed: false, reminder: { $ne: null } });

  tasks.forEach(task => {
    const reminderTime = new Date(task.due_datetime.getTime() - task.reminder * 60000);
    const taskId = task._id.toString();
    const userId = task.user_id.toString();
    const userSocket = userSocketMap.get(userId);
    const lastTriggered = triggeredReminders.get(taskId);

    // Only send if:
    // - Time is in valid window
    // - Reminder not sent for this version of task
    // - User is online
    if (
      now >= reminderTime &&
      now <= task.due_datetime &&
      (!lastTriggered || lastTriggered.getTime() !== reminderTime.getTime()) &&
      userSocket
    ) {
      userSocket.emit('reminder-toast', {
        task_name: task.task_name,
        due_datetime: task.due_datetime,
      });

      triggeredReminders.set(taskId, reminderTime);
      console.log(`✅ (Auto) Reminder sent for task: ${task.task_name}`);
    }
  });

  // Clean up stale triggers (task no longer exists or due time passed)
  for (const [taskId, _] of triggeredReminders) {
    const task = tasks.find(t => t._id.toString() === taskId);
    if (!task || task.completed || new Date(task.due_datetime) < now) {
      triggeredReminders.delete(taskId);
    }
  }
}, 60000);

// Socket connection
io.on('connection', (socket) => {
  console.log('🟢 User connected to socket');

  // Map user to socket when they log in
  socket.on('trigger-reminders', async ({ user_id }) => {
    const userIdStr = user_id.toString();
    userSocketMap.set(userIdStr, socket);

    const now = new Date();
    const tasks = await Task.find({ user_id, completed: false, reminder: { $ne: null } });

    tasks.forEach(task => {
      const reminderTime = new Date(task.due_datetime.getTime() - task.reminder * 60000);
      const taskId = task._id.toString();
      const lastTriggered = triggeredReminders.get(taskId);

      if (
        now >= reminderTime &&
        now <= task.due_datetime &&
        (!lastTriggered || lastTriggered.getTime() !== reminderTime.getTime())
      ) {
        socket.emit('reminder-toast', {
          task_name: task.task_name,
          due_datetime: task.due_datetime,
        });

        triggeredReminders.set(taskId, reminderTime);
        console.log(`✅ (Login) Reminder sent for task: ${task.task_name}`);
      }
    });
  });

  // Handle disconnects: cleanup socket mapping
  socket.on('disconnect', () => {
    for (const [userId, sock] of userSocketMap.entries()) {
      if (sock === socket) {
        userSocketMap.delete(userId);
        console.log(`🔌 Disconnected: Removed socket for user ${userId}`);
        break;
      }
    }
  });
});



// ------------------- Auth ------------------- //

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🟢 Signup attempt:", username);

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10); // salt rounds = 10
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    console.log("✅ Signup successful for:", newUser.username);
    res.status(201).json({ message: 'Signup successful', user_id: newUser._id });
  } catch (error) {
    console.error("❌ Error during signup:", error);
    res.status(500).json({ error: "Internal server error during signup" });
  }
});


app.post('/login', async (req, res) => {
  try {
    console.log("🔑 Login attempt:", req.body.username);
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log("❌ Invalid login attempt");
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    console.log("✅ Login successful for:", user.username);
    res.status(200).json({ message: 'Login successful', user_id: user._id });
  } catch (error) {
    console.error('❌ Error logging in user:', error);
    res.status(500).json({ error: 'Error logging in user' });
  }
});


// ------------------- Server Start ------------------- //

const port = 5123;
server.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
