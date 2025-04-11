import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://todolist-ioly.onrender.com/signup', { username, password });
      alert('User signed up successfully');
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <Link to="/" className="signup-back-button">← Back</Link>

      <div className="signup-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>
      <p className="sauth-quote">"People's dreams never END!"</p>
      <p className="sauth">- Marshall D. Teach</p>
    </div>
  );
};

export default Signup;

