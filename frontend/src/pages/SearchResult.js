import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/search.css';

const SearchResult = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({
    task_name: '',
    due_date: '',
    due_time: '',
    category: '',
    reminder: '',
    completed: false
  });

  const user_id = localStorage.getItem('user_id');
  const searchTerm = localStorage.getItem('searchTerm');
  const history = useHistory();

  useEffect(() => {
    if (searchTerm && user_id) {
      axios
        .get(`https://todolist-ioly.onrender.com/search/${user_id}/${encodeURIComponent(searchTerm)}`)
        .then((res) => setTasks(res.data))
        .catch((err) => console.error('❌ Error fetching search results:', err));
    }
  }, [searchTerm, user_id]);

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
  
    const localDate = new Date(task.due_datetime);
  
    setEditedTask({
      task_name: task.task_name || '',
      due_date: localDate.toLocaleDateString('en-CA'), 
      due_time: localDate.toTimeString().slice(0, 5),
      category: task.category || '',
      reminder: task.reminder?.toString() || '',
      completed: task.completed || false
    });
  };
  

  const combineDateTime = (dateStr, timeStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    return localDate.toISOString();
  };
  const format12HourTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };
  
  const handleSave = async (id) => {
    try {
      const due_date = document.querySelector(`#edit-date-${id}`)?.value || editedTask.due_date;
      const due_time = document.querySelector(`#edit-time-${id}`)?.value || editedTask.due_time;
  
      if (!due_date || !due_time) {
        toast.error("⚠️ Both date and time required");
        return;
      }
  
      const due_datetime = combineDateTime(due_date, due_time);
  
      const payload = {
        task_name: editedTask.task_name,
        category: editedTask.category,
        completed: editedTask.completed,
        reminder: editedTask.reminder ? parseInt(editedTask.reminder) : null,
        due_datetime
      };
  
      const response = await axios.put(`https://todolist-ioly.onrender.com/tasks/${id}`, payload);
  
      if (response.status === 200) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === id
              ? {
                  ...task,
                  ...payload,
                  due_time: format12HourTime(due_time)
                }
              : task
          )
        );
        toast.success("✅ Task updated!");
        setEditingTaskId(null);
      } else {
        toast.error("❌ Failed to update");
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      toast.error("❌ Error saving task");
    }
  };
  
  

  const handleCancel = () => {
    setEditingTaskId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://todolist-ioly.onrender.com/tasks/${id}`);
      setTasks(prev => prev.filter(task => task._id !== id));
      toast.success("🗑️ Task deleted");
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Error deleting task");
    }
  };

  const handleCompletedChange = async (id, currentStatus) => {
    try {
      const updated = !currentStatus;
      await axios.put(`https://todolist-ioly.onrender.com/tasks/${id}`, { completed: updated });
      setTasks(prev =>
        prev.map(task => task._id === id ? { ...task, completed: updated } : task)
      );
    } catch (err) {
      console.error("❌ Completion update error:", err);
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="search-container">
      <h2 className="search-heading">Search Results for "{searchTerm}"</h2>

      {pendingTasks.length > 0 && (
        <>
          <h3 className="pending-header">Pending Tasks</h3>
          <table className="search-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Category</th>
                <th>Due Date</th>
                <th>Time</th>
                <th>Reminder (mins)</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map(task => (
                <tr key={task._id} className="pending-task">
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
                          id={`edit-date-${task._id}`}
                          type="date"
                          value={editedTask.due_date}
                          onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          id={`edit-time-${task._id}`}
                          type="time"
                          value={editedTask.due_time}
                          onChange={(e) => setEditedTask({ ...editedTask, due_time: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={editedTask.reminder}
                          onChange={(e) => setEditedTask({ ...editedTask, reminder: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={editedTask.completed}
                          onChange={(e) => setEditedTask({ ...editedTask, completed: e.target.checked })}
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
                      <td>{new Date(task.due_datetime).toLocaleDateString('en-CA')}</td>

                      <td>{task.due_time}</td>
                      <td>{task.reminder}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleCompletedChange(task._id, task.completed)}
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
        </>
      )}

{completedTasks.length > 0 && (
  <>
    <h3 className="completed-header">Completed Tasks</h3>
    <table className="search-table">
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Category</th>
          <th>Due Date</th>
          <th>Time</th>
          <th>Completed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {completedTasks.map(task => (
          <tr key={task._id} className="completed-task">
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
                    id={`edit-date-${task._id}`}
                    type="date"
                    value={editedTask.due_date}
                    onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    id={`edit-time-${task._id}`}
                    type="time"
                    value={editedTask.due_time}
                    onChange={(e) => setEditedTask({ ...editedTask, due_time: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={editedTask.completed}
                    onChange={(e) => setEditedTask({ ...editedTask, completed: e.target.checked })}
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
                <td>{new Date(task.due_datetime).toLocaleDateString('en-CA')}</td>

                <td>{task.due_time}</td>

                <td>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleCompletedChange(task._id, task.completed)}
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
  </>
)}


      <button className="back-link" onClick={() => history.goBack()}>
        Back
      </button>
    </div>
  );
};

export default SearchResult;
