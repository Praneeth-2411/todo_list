import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/search.css';

const SearchBar = () => {
  const [term, setTerm] = useState('');

  const handleSearch = () => {
    if (term.trim()) {
      localStorage.setItem('searchTerm', term);
    } else {
      localStorage.removeItem('searchTerm');
    }
  };
  

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search tasks..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <Link to="/searchresults" className="search-button" onClick={handleSearch}>
        Search
      </Link>
    </div>
  );
};

export default SearchBar;
