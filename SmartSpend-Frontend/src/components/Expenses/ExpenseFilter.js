import React from 'react';
import { Search } from 'lucide-react';

const ExpenseFilter = ({ filters, setFilters, categories }) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate || filters.search;

  return (
    <div className="filter-bar">
      <div className="filter-grid">
        <div className="form-group">
          <label htmlFor="search">
            <Search size={16} style={{ display: 'inline', marginRight: '5px' }} />
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search expenses..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">From Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">To Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button 
            onClick={clearFilters} 
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilter;