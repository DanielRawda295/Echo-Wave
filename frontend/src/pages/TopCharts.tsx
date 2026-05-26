// src/pages/TopCharts.tsx

/**
 * TopCharts Page Component - Discover the Most Popular Songs
 *
 * This component displays the current top-charting songs based on music trends.
 * It integrates directly with the `useGetTopChartsQuery` hook to fetch real-time
 * data and render it in an interactive, card-based layout.
 *
 * Features:
 * - Fetches and displays trending top songs
 * - Displays individual song cards with artwork and metadata
 * - Handles loading and error states gracefully
 * - Integrates with the Redux player state for song playback control
 * - Responsive design for different screen sizes
 *
 * @component
 * @returns {JSX.Element} The complete Top Charts discovery page
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Error, Loader, SongCard } from '../components';
import { useGetTopChartsQuery } from '../redux/services/MusicApi';

/**
 * TopCharts Functional Component
 *
 * This component fetches the most popular songs and renders them
 * in a visually appealing layout using the `SongCard` component.
 * It connects to the Redux store to manage playback states
 * and utilizes RTK Query for data fetching and caching.
 *
 * @returns {JSX.Element} Rendered interface of Top Chart songs
 */
const TopCharts: React.FC = () => {
  /**
   * Top Charts Data Fetching
   *
   * RTK Query hook that requests current top songs from the Music API.
   * Provides built-in state management for loading and error handling.
   * Returns song data array for further mapping and display.
   */
  const { data, isFetching, error } = useGetTopChartsQuery();

  /**
   * Player State Access
   *
   * Retrieves active song and playback status from the Redux store.
   * This allows highlighting and synchronizing song cards with the
   * currently playing track.
   */
  const { activeSong, isPlaying } = useSelector((state: any) => state.player);

  /**
   * Loading State Handling
   *
   * Displays a loader animation while data is being fetched.
   * Provides user feedback and prevents empty screen flashes.
   */
  if (isFetching) return <Loader title="Loading Top Charts" />;

  /**
   * Error State Handling
   *
   * Displays an error component if the API request fails or
   * there is a network issue. Prevents application crashes.
   */
  if (error) return <Error />;

  /**
   * Top Charts Rendering
   *
   * Displays the title and dynamically generates song cards
   * from the fetched data. Each card contains song details such as
   * cover art, artist name, and playback controls.
   *
   * Layout:
   * - Responsive flexbox with wrapping
   * - Consistent spacing between cards
   * - Adaptive alignment for mobile and desktop
   */
  return (
    <div className="flex flex-col">
      {/**
       * Page Header
       *
       * Indicates the purpose of the page clearly with a bold title.
       * Uses consistent typography to match the app’s design system.
       */}
      <h2 className="font-bold text-3xl text-white text-left mt-4 mb-10">
        Discover Top Charts
      </h2>

      {/**
       * Songs Grid Layout
       *
       * Flexible grid that adapts to various screen sizes.
       * Uses Tailwind’s utility classes for consistent spacing.
       */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
        {/**
         * Dynamic Song Cards Rendering
         *
         * Iterates through each song in the fetched top charts data.
         * Each song is passed into a `SongCard` component that handles
         * display, styling, and interactivity.
         */}
        {data?.map((song: any, i: number) => (
          <SongCard
            key={song.key || song.trackId || i} // Ensures stable React key
            song={song}                         // Current song data
            isPlaying={isPlaying}               // Redux player playback state
            activeSong={activeSong}             // Currently active song
            data={data}                         // Full top chart dataset
            i={i}                               // Song index in the list
          />
        ))}
      </div>
    </div>
  );
};

export default TopCharts;

/**
 * Component Behavior Notes:
 *
 * Data Flow:
 * 1. Fetches top chart songs from Music API
 * 2. Handles loading and error states
 * 3. Retrieves playback state from Redux
 * 4. Renders a responsive grid of song cards
 * 5. Enables song interaction and playback control
 *
 * State Management:
 * - Data fetching handled via RTK Query
 * - Playback state handled via Redux
 * - Error and loading states handled locally
 *
 * User Experience:
 * - Immediate feedback on data loading
 * - Consistent layout across devices
 * - Interactive song cards with play/pause indicators
 *
 * Performance:
 * - Efficient rendering with React key optimization
 * - Cached API responses via RTK Query
 * - Minimal re-rendering using Redux selectors
 *
 * Accessibility:
 * - Semantic HTML elements for screen readers
 * - Clear visual hierarchy
 * - Responsive typography and spacing
 *
 * Future Enhancements:
 * - Sorting by region or genre
 * - Pagination or infinite scrolling
 * - Integration with personalized recommendations
 * - Hover previews or quick-play options
 *
 * Testing Strategy:
 * - Unit tests for data fetching and component rendering
 * - Integration tests for Redux and RTK Query behavior
 * - E2E tests for complete user flow (loading → playback)
 *
 * SEO Considerations:
 * - Frequently updated content improves search relevance
 * - Structured data for song metadata could be added later
 * - Internal linking to song or artist detail pages boosts discoverability
 */
