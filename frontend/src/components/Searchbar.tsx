// src/components/Searchbar.tsx

import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

/**
 * 🔍 Searchbar Component
 *
 * Provides a search input for navigating to search results pages.
 * Features:
 * - Controlled input for search term
 * - Submit via Enter key to navigate
 * - Accessible label for screen readers
 * - Styled for dark-themed UI with icon integration
 *
 * @component
 * @returns {JSX.Element} Search input form
 */
const Searchbar: React.FC = () => {
  /** Navigation hook for redirecting to search results */
  const navigate = useNavigate();

  /** State to track the current search term */
  const [searchTerm, setSearchTerm] = useState<string>('');

  /**
   * Form submit handler
   * - Prevents default form submission
   * - Navigates to `/search/:searchTerm` if input is non-empty
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${searchTerm}`);
    }
  };

  /**
   * Input change handler
   * - Updates local state with current input value
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="p-2 text-gray-400 focus-within:text-gray-600"
    >
      {/** Screen reader only label */}
      <label htmlFor="search-field" className="sr-only">
        Search all files
      </label>

      {/** Input container with search icon */}
      <div className="flex flex-row justify-start items-center">
        <FiSearch aria-hidden="true" className="w-5 h-5 ml-4" />
        <input
          name="search-field"
          autoComplete="off"
          id="search-field"
          className="flex-1 bg-transparent border-none placeholder-gray-500 outline-none text-base text-white p-4"
          placeholder="Search"
          type="search"
          value={searchTerm}
          onChange={handleChange}
        />
      </div>
    </form>
  );
};

export default Searchbar;
