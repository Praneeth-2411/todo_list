import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import axios from 'axios';

import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchResult from './pages/SearchResult';
import SearchBar from './components/SearchBar'; // ✅ Import SearchBar

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ✅ Store search term globally

  useEffect(() => {
    const fetchTasks = async () => {
      const user_id = localStorage.getItem('user_id'); // ✅ Get user_id from localStorage
      if (!user_id) return;

      try {
        const res = await axios.get(`http://localhost:5123/tasks/${user_id}`); // ✅ MongoDB API call
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
          <Route path="/addtask" exact>
            <SearchBar setSearchTerm={setSearchTerm} />         
            <AddTask setTasks={setTasks} />
            <TaskList tasks={tasks} setTasks={setTasks} />
          </Route>

          <Route path="/searchresults">
            <SearchResult searchTerm={searchTerm} /> {/* ✅ Pass search term */}
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
