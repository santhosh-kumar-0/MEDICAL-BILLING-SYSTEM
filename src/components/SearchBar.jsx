import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  filters = [],
  suggestions = [],
  debounceDelay = 300,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(query, activeFilters);
      }
    }, debounceDelay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, activeFilters, onSearch, debounceDelay]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowFilters(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.label || suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch(suggestion.label || suggestion, activeFilters);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, activeFilters);
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch('', activeFilters);
    }
  };

  const toggleFilter = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === value ? null : value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== null);

  const searchVariants = {
    focused: {
      scale: 1.02,
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
      transition: { duration: 0.2 }
    },
    unfocused: {
      scale: 1,
      boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  const suggestionsVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  const suggestionItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div ref={searchRef} className={`search-bar ${className}`}>
      <motion.div
        className="search-container"
        variants={searchVariants}
        animate={isFocused ? 'focused' : 'unfocused'}
      >
        {/* Search Icon */}
        <motion.div
          className="search-icon"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSearch}
        >
          <FaSearch />
        </motion.div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(query.length > 0 && suggestions.length > 0);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="search-input"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              className="search-clear"
              onClick={clearSearch}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Filter Button */}
        {filters.length > 0 && (
          <motion.button
            className={`search-filter ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaFilter />
            {hasActiveFilters && <span className="filter-indicator" />}
          </motion.button>
        )}
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            className="search-suggestions"
            variants={suggestionsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                variants={suggestionItemVariants}
                onClick={() => handleSuggestionClick(suggestion)}
                whileHover={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
              >
                {suggestion.icon && (
                  <span className="suggestion-icon">{suggestion.icon}</span>
                )}
                <span className="suggestion-text">
                  {suggestion.label || suggestion}
                </span>
                {suggestion.description && (
                  <span className="suggestion-description">
                    {suggestion.description}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Dropdown */}
      <AnimatePresence>
        {showFilters && filters.length > 0 && (
          <motion.div
            className="search-filters"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="filters-header">
              <span>Filters</span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="clear-filters">
                  Clear All
                </button>
              )}
            </div>
            <div className="filters-content">
              {filters.map((filter) => (
                <div key={filter.key} className="filter-group">
                  <label className="filter-label">{filter.label}</label>
                  <div className="filter-options">
                    {filter.options.map((option) => (
                      <button
                        key={option.value}
                        className={`filter-option ${
                          activeFilters[filter.key] === option.value ? 'active' : ''
                        }`}
                        onClick={() => toggleFilter(filter.key, option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
