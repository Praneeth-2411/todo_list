import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('darkMode', newMode);
  };

  return (
    <div className="home-container">
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <h2>Welcome to DONE & DUSTED</h2>
      <p>Your personal task manager</p>
      <div className="auth-buttons">
        <Link to="/signup">
          <button className="auth-btn">Sign Up</button>
        </Link>
        <Link to="/login">
          <button className="auth-btn">Log In</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;

