// src/components/Error.tsx

import React from 'react';

/**
 * ❌ Error Component
 *
 * Displays a generic error message to the user.
 * Typically used when data fetching fails or an unexpected error occurs.
 *
 * Features:
 * - Centered error message on the page
 * - Bold and prominent text for visibility
 *
 * @component
 * @returns {JSX.Element} Error message interface
 */
const Error: React.FC = () => (
  <div className="w-full flex justify-center items-center">
    {/**
     * Error Message
     * - Bold, large, white text
     * - Provides user-friendly feedback
     */}
    <h1 className="font-bold text-2xl text-white">
      Something went wrong. Please try again
    </h1>
  </div>
);

export default Error;
