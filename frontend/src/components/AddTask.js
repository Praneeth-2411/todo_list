import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../styles/addtask.css';

const AddTask = ({ setTasks }) => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    const user_id = parseInt(localStorage.getItem('user_id'), 10); // Convert to integer

    if (!user_id) {
      console.error('User not logged in');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5123/tasks', {
        task_name: taskName,
        due_date: dueDate,
        category,
        user_id, // Include user_id in request
      });
      if (res.status === 201) {
        setTasks(prevTasks => [...prevTasks, res.data]);
      }
      setTaskName('');
      setDueDate('');
      setCategory('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="add-task-container">
      <h2>Add New Task</h2>
      <form className="add-task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          className="add-task-input"
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="date"
          className="add-task-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <input
          type="text"
          className="add-task-input"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button className="add-task-button" type="submit">Add Task</button>
      </form>
      <Link to="/login" className="logout-link">Logout</Link>
    </div>
  );
};

export default AddTask;
