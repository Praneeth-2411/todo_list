import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/search.css';

const SearchResult = () => {
  const [tasks, setTasks] = useState([]);
  const user_id = localStorage.getItem('user_id');
  const searchTerm = localStorage.getItem('searchTerm');

  useEffect(() => {
    if (searchTerm && user_id) {
      axios.post('http://localhost:5123/search', { searchTerm, user_id })
        .then((res) => setTasks(res.data))
        .catch((err) => console.error('Error fetching search results:', err));
    }
  }, [searchTerm, user_id]);

  return (
    <div className="search-container">
      <h2 className="search-heading">Search Results for "{searchTerm}"</h2>

      {tasks.length > 0 ? (
        <table className="search-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Category</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id} className={task.completed ? 'Completed-task' : 'p\Pending-task'}>
                <td>{task.task_name}</td>
                <td>{task.category}</td>
                <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Due Date"}</td>
                <td>{task.completed ? "Completed" : "Pending"}</td>
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

