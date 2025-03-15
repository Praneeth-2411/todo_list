import React, { useState } from 'react';
import axios from 'axios';

const AddTask = () => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const task = { task_name: taskName, due_date: dueDate, category };

    try {
      await axios.post('http://localhost:5123/tasks', task);
      alert('Task added');
      setTaskName('');
      setDueDate('');
      setCategory('');
    } catch (error) {
      console.error(error);
      alert('Error adding task');
    }
  };

  return (
    <div className="add-task">
      <form onSubmit={handleSubmit}>
        <h2>Add Task</h2>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Task Name"
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          required
        />
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default AddTask;

