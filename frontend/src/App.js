import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import axios from 'axios';

import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchResult from './pages/SearchResult';
import SearchBar from './components/SearchBar';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchTasks = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) return;

      try {
        const res = await axios.get(`http://localhost:5123/tasks/${user_id}`);
        setTasks(res.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
  };

  return (
    <Router>
      <div className="App">
        <Switch>
          {/* ✅ Home Page with Dark Mode Toggle */}
          <Route path="/" exact>
            <Home toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
          </Route>

          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />

          {/* ✅ Task Page */}
          <Route path="/addtask" exact>
            <div className="content-container">
              {/* 🔍 Search Bar */}
              <SearchBar setSearchTerm={setSearchTerm} />

              {/* ✅ Task List */}
              <TaskList tasks={tasks} setTasks={setTasks} />

              {/* 📝 Add Task */}
              <AddTask setTasks={setTasks} />
            </div>
          </Route>

          {/* ✅ Search Results Page */}
          <Route path="/searchresults">
            <SearchResult searchTerm={searchTerm} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
