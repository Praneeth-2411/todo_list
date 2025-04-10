import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';
import '../styles/tasklist.css';

const API_URL = "http://localhost:5123";

const TaskList = ({ tasks, setTasks }) => {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) return;
      try {
        const res = await axios.get(`${API_URL}/tasks/${user_id}`);
        setTasks(res.data);
        console.log('[FETCH] Tasks loaded:', res.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [setTasks]);

  useEffect(() => {
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('🔌 Connected to socket');
    });

    socket.on('triggerReminder', ({ task_name }) => {
      toast.info(`⏰ Reminder: ${task_name} is due soon!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light"
      });
      console.log('[REMINDER] Triggered for task:', task_name);
    });

    return () => socket.disconnect();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
      console.log('[DELETE] Task deleted:', id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    if (editingTaskId) return;
    try {
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, { completed: !currentStatus });
      if (response.status === 200) {
        setTasks(prevTasks => prevTasks.map(task =>
          task._id === taskId ? { ...task, completed: !currentStatus } : task
        ));
        console.log('[TOGGLE] Task status updated:', taskId, '=>', !currentStatus);
      }
    } catch (error) {
      console.error('Error updating the task:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    const dueDate = new Date(task.due_datetime);
    const time = dueDate.toTimeString().slice(0, 5);
    const date = dueDate.toLocaleDateString('en-CA');
  
    setEditedTask(prev => ({
      ...prev,
      [task._id]: {
        task_name: task.task_name,
        due_date: date,
        due_time: time,
        category: task.category,
        reminder: task.reminder || '',
      }
    }));
  
    console.log('[EDIT] Editing task:', task);
  };
  

  const handleSave = async (taskId) => {
    const edited = editedTask[taskId];
    if (!edited) {
      toast.error("No changes detected.");
      return;
    }

    const updatedTask = {
      task_name: edited.task_name,
      category: edited.category,
      date: edited.due_date,
      time: edited.due_time,
      reminder: Number(edited.reminder),
    };

    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, updatedTask);

      const updatedTasks = tasks.map(task =>
        task._id === taskId
          ? {
              ...task,
              ...edited,
              due_datetime: new Date(`${edited.due_date}T${edited.due_time}`)
            }
          : task
      );

      setTasks(updatedTasks);
      toast.success('Task updated!');
      setEditingTaskId(null);
      setEditedTask({});
    } catch (error) {
      toast.error('Error updating task.');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditingTaskId(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.due_datetime) - new Date(b.due_datetime));
  const pendingTasks = sortedTasks.filter(task => !task.completed);
  const completedTasks = sortedTasks.filter(task => task.completed);

  const renderTaskRow = (task, isCompletedSection) => (
    <motion.tr key={task._id} className={isCompletedSection ? "completed-task" : "pending-task"}>
      {editingTaskId === task._id ? (
        <>
          <td>
            <input
              type="text"
              value={editedTask[task._id]?.task_name || ''}
              onChange={(e) =>
                setEditedTask(prev => ({
                  ...prev,
                  [task._id]: { ...prev[task._id], task_name: e.target.value }
                }))
              }
            />
          </td>
          <td>
            <input
              type="date"
              value={editedTask[task._id]?.due_date || ''}
              onChange={(e) =>
                setEditedTask(prev => ({
                  ...prev,
                  [task._id]: { ...prev[task._id], due_date: e.target.value }
                }))
              }
            />
          </td>
          <td>
            <input
              type="time"
              value={editedTask[task._id]?.due_time || ''}
              onChange={(e) =>
                setEditedTask(prev => ({
                  ...prev,
                  [task._id]: { ...prev[task._id], due_time: e.target.value }
                }))
              }
            />
          </td>
          <td>
            <select
              value={editedTask[task._id]?.category || ''}
              onChange={(e) =>
                setEditedTask(prev => ({
                  ...prev,
                  [task._id]: { ...prev[task._id], category: e.target.value }
                }))
              }
            >
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
  
          {!isCompletedSection && (
            <td>
              <input
                type="number"
                value={editedTask[task._id]?.reminder || ''}
                onChange={(e) =>
                  setEditedTask(prev => ({
                    ...prev,
                    [task._id]: { ...prev[task._id], reminder: e.target.value }
                  }))
                }
              />
            </td>
          )}
  
          <td>
            <input type="checkbox" checked={task.completed} disabled className="checkbox-not-allowed" />
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

          {!isCompletedSection && (
            <td>{task.reminder ? `${task.reminder} minutes before` : "No Reminder"}</td>
          )}
  
          <td>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task._id, task.completed)}
              disabled={editingTaskId !== null}
            />
          </td>
          <td>
            <button onClick={() => handleEditClick(task)}>Edit</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </td>
        </>
      )}
    </motion.tr>
  );
  
  
  return (
    <div className="task-list-container">
      <h2>Pending Tasks</h2>
      <table className="task-table">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Category</th>
            <th>Reminder Time</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{pendingTasks.map(task => renderTaskRow(task, false))}</tbody>
      </table>
      <h2>Completed Tasks</h2>
      <table className="task-table completed">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Category</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{completedTasks.map(task => renderTaskRow(task, true))}</tbody>
      </table>
    </div>
  );
};

export default TaskList;
