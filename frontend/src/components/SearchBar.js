import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/search.css';

const SearchBar = ({ setSearchTerm }) => {
  const [term, setTerm] = useState('');

  const handleSearch = () => {
    if (term.trim()) {
      setSearchTerm(term); // ✅ Store search term in state
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={(e) => e.preventDefault()}> {/* Prevents page refresh */}
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

      </form>
    </div>
  );
};

export default SearchBar;
