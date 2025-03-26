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

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <Route path="/" exact component={Home} />
          
          {/* ✅ Updated /addtask Route to ensure correct order */}
          <Route path="/addtask" exact>
            <div className="content-container">
              {/* 🔍 Search Bar at the Top */}
              <SearchBar setSearchTerm={setSearchTerm} />

              {/* ✅ Task List (Pending & Completed) in the middle */}
              <TaskList tasks={tasks} setTasks={setTasks} />

              {/* 📝 Add Task at the Bottom */}
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
