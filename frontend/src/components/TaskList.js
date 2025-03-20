import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/tasklist.css';

const TaskList = ({ tasks, setTasks }) => {
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
    try {
      const response = await axios.put(`http://localhost:5123/tasks/${taskId}`, {
        completed: !currentStatus
      });

      if (response.status === 200) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId ? { ...task, completed: !currentStatus } : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating the task:', error);
    }
  };

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="task-list-container">
      {/* Pending Tasks Section - Only displays if there are pending tasks */}
      {incompleteTasks.length > 0 && (
        <>
          <h2 className="task-list-heading1">Pending Tasks</h2>
          <table className="task-table">
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
                {incompleteTasks.map(task => (
                  <motion.tr
                    key={task._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="pending-task"
                  >
                    <td>{task.task_name}</td>
                    <td>{new Date(task.due_date).toLocaleDateString()}</td>
                    <td>{task.category}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task._id, task.completed)}
                      />
                    </td>
                    <td>
                      <motion.button
                        className="delete"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </>
      )}

      {/* Completed Tasks Section - Only displays if there are completed tasks */}
      {completedTasks.length > 0 && (
        <>
          <h2 className="task-list-heading2">Completed Tasks</h2>
          <table className="task-table">
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
                {completedTasks.map(task => (
                  <motion.tr
                    key={task._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="completed-task"
                  >
                    <td>{task.task_name}</td>
                    <td>{new Date(task.due_date).toLocaleDateString()}</td>
                    <td>{task.category}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task._id, task.completed)}
                      />
                    </td>
                    <td>
                      <motion.button
                        className="delete"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </motion.button>
                    </td>
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
