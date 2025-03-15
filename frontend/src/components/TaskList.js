import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const TaskList = ({ tasks, setTasks }) => { 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:5123/tasks');
        setTasks(res.data);
      } catch (error) {
        console.error(error);
        alert('Error fetching tasks');
      }
    };

    fetchTasks();
  }, [tasks]); 

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5123/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const response = await axios.put(`http://localhost:5123/tasks/${taskId}`, {
        completed: !currentStatus
      });

      if (response.status === 200) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, completed: !currentStatus } : task
          )
        );
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
          <AnimatePresence>
            {incompleteTasks.map((task) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
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
                  <motion.button
                    className="delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
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
          <AnimatePresence>
            {completedTasks.map((task) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
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
                  <motion.button
                    className="delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
