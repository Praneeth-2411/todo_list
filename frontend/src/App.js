import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import socket from './socket';

import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchResult from './pages/SearchResult';
import SearchBar from './components/SearchBar';

const AppRoutes = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

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

  const fetchTasksAndTriggerReminders = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;

    try {
      const res = await axios.get(`http://localhost:5123/tasks/${user_id}`);
      setTasks(res.data);

      if (localStorage.getItem('justLoggedIn') === 'true') {
        socket.emit('trigger-reminders', { user_id, tasks: res.data });
        localStorage.removeItem('justLoggedIn');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const user_id = localStorage.getItem('user_id');
    const justLoggedIn = localStorage.getItem('justLoggedIn');

    if (currentPath === '/addtask' && user_id && justLoggedIn === 'true') {
      fetchTasksAndTriggerReminders();
    }
  }, [location.pathname]);

  useEffect(() => {
    const reminderHandler = ({ task_name, due_datetime }) => {
      console.log("Auto Reminder received:", task_name);

      const formattedTime = new Date(due_datetime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      showToast(`⏰ Reminder: "${task_name}" is due at ${formattedTime}`);
    };

    socket.off('reminder-toast');
    socket.on('reminder-toast', reminderHandler);

    return () => {
      socket.off('reminder-toast', reminderHandler);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
  };

  return (
    <>
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
    </>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
