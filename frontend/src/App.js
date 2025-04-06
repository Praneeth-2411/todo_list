import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchResult from './pages/SearchResult';
import SearchBar from './components/SearchBar';

const socket = io('http://localhost:5123'); // 🧠 Socket.IO client

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const fetchTasksAndTriggerReminders = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;

    try {
      const res = await axios.get(`http://localhost:5123/tasks/${user_id}`);
      setTasks(res.data);

      // Emit only if fresh login
      if (localStorage.getItem('justLoggedIn') === 'true') {
        socket.emit('trigger-reminders', { user_id, tasks: res.data });
        localStorage.removeItem('justLoggedIn'); // ⚠️ Clear the flag after emitting
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // 🧠 Watch for location changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    const user_id = localStorage.getItem('user_id');
    const justLoggedIn = localStorage.getItem('justLoggedIn');

    // Only trigger if path is /addtask AND user has freshly logged in
    if (currentPath === '/addtask' && user_id && justLoggedIn === 'true') {
      fetchTasksAndTriggerReminders();
    }
  }, [window.location.pathname]);

  // ⚡ Listen for reminders if user is on /addtask
  useEffect(() => {
    const currentPath = window.location.pathname;
    const user_id = localStorage.getItem('user_id');
    if (!user_id || currentPath !== '/addtask') return;

    socket.on('reminder-toast', ({ task_name, due_datetime }) => {
      const toastMessage = `⏰ Reminder: "${task_name}" is due at ${new Date(
        due_datetime
      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      showToast(toastMessage);
    });

    return () => {
      socket.off('reminder-toast');
    };
  }, [window.location.pathname]);

  const showToast = (message) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
  };

  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <Switch>
          <Route path="/" exact>
            <Home toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
          </Route>

          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />

          <Route path="/addtask" exact>
            <div className="content-container">
              <SearchBar setSearchTerm={setSearchTerm} />
              <TaskList tasks={tasks} setTasks={setTasks} />
              <AddTask setTasks={setTasks} />
            </div>
          </Route>

          <Route path="/searchresults">
            <SearchResult searchTerm={searchTerm} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
