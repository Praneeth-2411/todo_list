import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/tasklist.css';

const TaskList = ({ tasks, setTasks }) => {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({ task_name: '', date: '', time: '', category: '', completed: false });

  useEffect(() => {
    const fetchTasks = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        console.error('User not logged in');
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5123/tasks/${user_id}`);
        setTasks(res.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Error fetching tasks');
      }
    };

    fetchTasks();
  }, [setTasks]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5123/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    if (editingTaskId) return; // ✅ Prevent toggling when editing
    try {
      const response = await axios.put(`http://localhost:5123/tasks/${taskId}`, { completed: !currentStatus });

      if (response.status === 200) {
        setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? { ...task, completed: !currentStatus } : task));
      }
    } catch (error) {
      console.error('Error updating the task:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    const dueDate = new Date(task.due_datetime);
    const time = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    setEditedTask({
      task_name: task.task_name,
      date: dueDate.toISOString().split('T')[0],
      time: time,
      category: task.category,
      completed: task.completed
    });
  };

  const handleSave = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5123/tasks/edit/${id}`, editedTask);
      if (response.status === 200) {
        setTasks(prevTasks => prevTasks.map(task => task._id === id ? response.data : task));
        setEditingTaskId(null);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task');
    }
  };

  const handleCancel = () => {
    setEditingTaskId(null);
  };

  // ✅ Sorting pending & completed tasks by due date (ascending order)
  const sortedPendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.due_datetime) - new Date(b.due_datetime));

  const sortedCompletedTasks = tasks
    .filter(task => task.completed)
    .sort((a, b) => new Date(a.due_datetime) - new Date(b.due_datetime));

  const renderTaskRow = (task) => (
    editingTaskId === task._id ? (
      <>
        <td><input type="text" value={editedTask.task_name} onChange={(e) => setEditedTask({ ...editedTask, task_name: e.target.value })} /></td>
        <td><input type="date" value={editedTask.date} onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })} /></td>
        <td><input type="time" value={editedTask.time} onChange={(e) => setEditedTask({ ...editedTask, time: e.target.value })} /></td>
        <td>
          <select value={editedTask.category} onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}>
            <option value="Study">Study</option>
            <option value="Work/Projects">Work/Projects</option>
            <option value="Play">Play</option>
            <option value="Outing">Outing</option>
            <option value="Leisure">Leisure</option>
            <option value="Household">Household</option>
            <option value="Personal">Personal</option>
            <option value="Others">Others</option>
          </select>
        </td>
        <td>
          <input
            type="checkbox"
            checked={editedTask.completed}
            disabled={true} // ✅ Checkbox disabled when editing
            className="checkbox-not-allowed"
          />
        </td>
        <td>
          <button onClick={() => handleSave(task._id)}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </td>
      </>
    ) : (
      <>
        <td>{task.task_name}</td>
        <td>{new Date(task.due_datetime).toLocaleDateString()}</td>
        <td>{new Date(task.due_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
        <td>{task.category}</td>
        <td>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task._id, task.completed)}
            disabled={editingTaskId === task._id} // ✅ Disable while editing
            className={editingTaskId === task._id ? "checkbox-not-allowed" : ""}
          />
        </td>
        <td>
          <button onClick={() => handleEditClick(task)}>Edit</button>
          <button onClick={() => handleDelete(task._id)}>Delete</button>
        </td>
      </>
    )
  );

  return (
    <div className="task-list-container">
      {sortedPendingTasks.length > 0 && (
        <>
          <h2 className="task-list-heading1">Pending Tasks</h2>
          <table className="task-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Due Date</th>
                <th>Time</th>
                <th>Category</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sortedPendingTasks.map(task => (
                  <motion.tr key={task._id} className="pending-task">
                    {renderTaskRow(task)}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </>
      )}

      {sortedCompletedTasks.length > 0 && (
        <>
          <h2 className="task-list-heading2">Completed Tasks</h2>
          <table className="task-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Due Date</th>
                <th>Time</th>
                <th>Category</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sortedCompletedTasks.map(task => (
                  <motion.tr key={task._id} className="completed-task">
                    {renderTaskRow(task)}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default TaskList;
