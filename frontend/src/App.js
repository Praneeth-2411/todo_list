import './styles/addtask.css';
import './styles/tasklist.css';
import './styles/home.css';
import './styles/signup.css';
import './styles/login.css';
import React, { useState, useEffect } from 'react';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';  // New Home page

const App = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:5123/tasks');
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
            <AddTask setTasks={setTasks} />
            <TaskList tasks={tasks} setTasks={setTasks} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
