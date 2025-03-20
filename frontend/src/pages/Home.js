import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
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
