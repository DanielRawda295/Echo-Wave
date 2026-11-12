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
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
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
      role="search"
      className="shrink-0 px-4 py-3 text-gray-400 sm:px-6"
    >
      {/** Screen reader only label */}
      <label htmlFor="search-field" className="sr-only">
        Search songs and artists
      </label>

      {/** Input container with search icon */}
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-indigo-400">
        <FiSearch aria-hidden="true" className="h-5 w-5 shrink-0" />
        <input
          name="search-field"
          autoComplete="off"
          id="search-field"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-white placeholder-gray-400 outline-none"
          placeholder="Search songs or artists"
          type="search"
          value={searchTerm}
          onChange={handleChange}
        />
      </div>
    </form>
  );
};

export default Searchbar;
