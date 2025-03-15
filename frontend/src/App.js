import './App.css';
import React from 'react';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';

const App = () => {
  return (
    <div className="App">
      <h1>To-Do List</h1>
      <AddTask />
      <TaskList />
    </div>
  );
};

export default App;
