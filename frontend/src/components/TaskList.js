import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:5167/tasks');
        setTasks(res.data);
      } catch (error) {
        console.error(error);
        alert('Error fetching tasks');
      }
    };

    fetchTasks();
  }, []);
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5167/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id)); // Remove task from UI
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };
  const toggleTaskCompletion = async (taskId, currentStatus) => {
  try {
    const response = await axios.put(`http://localhost:5167/tasks/${taskId}`, {
      completed: !currentStatus
    });

    if (response.status === 200) {
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      ));
    }
  } catch (error) {
    console.error('Error updating the task:', error);
  }
};

  

return (
  <div className="task-list">
    <h2>Pending Tasks</h2>
    <table>
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Due Date</th>
          <th>Category</th>
          <th>Completed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {incompleteTasks.map((task) => (
          <tr key={task.id}>
            <td>{task.task_name}</td>
            <td>{new Date(task.due_date).toLocaleDateString()}</td>
            <td>{task.category}</td>
            <td>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id, task.completed)}
              />
            </td>
            <td>
              <button className="delete" onClick={() => handleDelete(task.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2>Completed Tasks</h2>
    <table>
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Due Date</th>
          <th>Category</th>
          <th>Completed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {completedTasks.map((task) => (
          <tr key={task.id}>
            <td>{task.task_name}</td>
            <td>{new Date(task.due_date).toLocaleDateString()}</td>
            <td>{task.category}</td>
            <td>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id, task.completed)}
              />
            </td>
            <td>
              <button className="delete" onClick={() => handleDelete(task.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};
export default TaskList;
