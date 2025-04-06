import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/addtask.css';
const handleLogout = () => {
  localStorage.removeItem('user_id');

  // 🔥 If using sockets:
  if (window.socket) {
    window.socket.disconnect(); // or socket.off("reminder") if you only want to remove one listener
  }

  // 🔥 If using reminder timers (like setTimeout), clear them here:
  if (window.reminderTimeout) {
    clearTimeout(window.reminderTimeout);
    window.reminderTimeout = null;
  }

  // Redirect to login
  window.location.href = '/login';
};


const AddTask = ({ setTasks }) => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');
  const [reminder, setReminder] = useState(''); // ✅ Added reminder state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories = ["Study", "Work/Projects", "Play", "Outing", "Leisure", "Household", "Personal", "Others"];

  const handleAddTask = async (e) => {
    e.preventDefault();

    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      alert("User not logged in. Please login first.");
      return;
    }

    if (!dueDate || !time) {
      alert("Please select a valid date and time.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!reminder || isNaN(reminder) || reminder < 1) {
      alert("Please enter a valid reminder time in minutes.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5123/tasks', {
        task_name: taskName,
        due_date: dueDate,   // ✅ Send date separately
        due_time: time,      // ✅ Send time separately
        category,
        reminder: parseInt(reminder),  // ✅ Sending reminder as an integer
        user_id: user_id.trim(),
      });

      if (res.status === 201) {
        setTasks(prevTasks => [...prevTasks, res.data]);
      }

      setTaskName('');
      setDueDate('');
      setTime('');
      setCategory('');
      setReminder(''); // ✅ Reset reminder after adding task
      setDropdownOpen(false);
    } catch (error) {
      alert("Failed to add task. Please try again.");
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
          required
        />
        <input
          type="date"
          className="add-task-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <input
          type="time"
          className="add-task-input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <input
          type="number"
          className="add-task-input"
          placeholder="Reminder (minutes before due)"
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          required
          min="1"
        />

        {/* ✅ Fixed Category Dropdown */}
        <div 
          className={`category-container ${dropdownOpen ? "active" : ""}`} 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="category-box">{category || "Select Category"}</div>
          {dropdownOpen && (
            <div className="category-options">
              {categories.map((cat) => (
                <div 
                  key={cat} 
                  className="category-option" 
                  onClick={() => { 
                    setCategory(cat);
                    setDropdownOpen(false);
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="add-task-button" type="submit">Add Task</button>
      </form>

      <button onClick={handleLogout} className="logout-link">Logout</button>

    </div>
  );
};

export default AddTask;
