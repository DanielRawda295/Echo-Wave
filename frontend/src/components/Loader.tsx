// src/components/Loader.tsx

import React from 'react';
import { loader } from '../assets';

/**
 * Props for the Loader component.
 */
type LoaderProps = {
  /** Optional title to display below the loader image. Defaults to 'Loading'. */
  title?: string;
};

/**
 * ⏳ Loader Component
 *
 * Displays a loading indicator with an optional title.
 * Typically used during data fetching or processing states.
 *
 * Features:
 * - Centered loader image
 * - Optional title with default fallback
 * - Responsive and visually prominent
 *
 * @component
 * @param {LoaderProps} props - Component props
 * @returns {JSX.Element} Loading interface
 */
const Loader: React.FC<LoaderProps> = ({ title }) => (
  <div className="w-full flex justify-center items-center flex-col">
    {/**
     * Loader Image
     * - Fixed width and height
     * - Object containment ensures proper scaling
     */}
    <img src={loader} alt="loader" className="w-32 h-32 object-contain" />

    {/**
     * Loader Title
     * - Displays custom title or default 'Loading'
     * - Bold and large text for visibility
     */}
    <h1 className="font-bold text-2xl text-white mt-2">{title || 'Loading'}</h1>
  </div>
);

export default Loader;
