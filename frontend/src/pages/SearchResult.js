import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/search.css';

const SearchResult = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({ task_name: '', date: '', time: '', category: '' });
  const user_id = localStorage.getItem('user_id');
  const searchTerm = localStorage.getItem('searchTerm');

  useEffect(() => {
    if (searchTerm && user_id) {
      axios.post('http://localhost:5123/search', { searchTerm, user_id })
        .then((res) => setTasks(res.data))
        .catch((err) => console.error('Error fetching search results:', err));
    }
  }, [searchTerm, user_id]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5123/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
    } catch (error) {
      alert('Error deleting task');
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    const dueDate = new Date(task.due_datetime);
    const time = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setEditedTask({
      task_name: task.task_name,
      date: dueDate.toLocaleDateString('en-GB'),
      time: time,
      category: task.category,
    });
  };

  const handleSave = async (id) => {
    try {
      const convertedDate = convertToISODate(editedTask.date);
      const updatedDueDate = new Date(convertedDate);
      const [hours, minutes] = editedTask.time.split(':');
      updatedDueDate.setHours(hours);
      updatedDueDate.setMinutes(minutes);

      const response = await axios.put(`http://localhost:5123/tasks/edit/${id}`, {
        task_name: editedTask.task_name,
        date: convertedDate,
        time: editedTask.time,
        category: editedTask.category,
      });

      if (response.status === 200) {
        setTasks(prevTasks => prevTasks.map(task => task._id === id ? response.data : task));
        setEditingTaskId(null);
      }
    } catch (error) {
      alert('Error saving task');
    }
  };

  const handleCancel = () => {
    setEditingTaskId(null);
  };

  const convertToISODate = (date) => {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  };

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.due_datetime) - new Date(b.due_datetime));

  return (
    <div className="search-container">
      <h2 className="search-heading">Search Results for "{searchTerm}"</h2>

      {sortedTasks.length > 0 ? (
        <table className="search-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Category</th>
              <th>Due Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map(task => (
              <tr key={task._id} className={task.completed ? 'completed-task' : 'pending-task'}>
                {editingTaskId === task._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editedTask.task_name}
                        onChange={(e) => setEditedTask({ ...editedTask, task_name: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        value={editedTask.category}
                        onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
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
                    <td>
                      <input
                        type="date"
                        value={editedTask.date}
                        onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={editedTask.time}
                        onChange={(e) => setEditedTask({ ...editedTask, time: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled // ✅ Checkbox is uneditable in edit mode
                        style={{ cursor: 'not-allowed', opacity: 0.5 }}
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
                    <td>{task.category}</td>
                    <td>{new Date(task.due_datetime).toLocaleDateString()}</td>
                    <td>{new Date(task.due_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          axios.put(`http://localhost:5123/tasks/${task._id}`, { completed: !task.completed })
                            .then(res => {
                              setTasks(prevTasks => prevTasks.map(t => (t._id === task._id ? res.data : t)));
                            })
                            .catch(err => console.error('Error updating task status:', err));
                        }}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleEditClick(task)}>Edit</button>
                      <button onClick={() => handleDelete(task._id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No tasks found.</p>
      )}

      <Link to="/addtask" className="back-link">Back to Add Task</Link>
    </div>
  );
};

export default SearchResult;
