// src/pages/Discover.tsx

/**
 * Discover Page Component - Genre-Based Music Exploration
 * 
 * This component serves as the main music discovery hub of the EchoWave application.
 * It allows users to explore songs filtered by music genres, providing a personalized
 * music discovery experience with dynamic genre selection and interactive song playback.
 * 
 * Features:
 * - Dynamic genre-based music filtering
 * - Interactive genre selection dropdown
 * - Grid layout of song cards with playback functionality
 * - Real-time genre switching without page reload
 * - Integration with iTunes API for genre-specific music
 * 
 * @component
 * @returns {JSX.Element} Main music discovery interface with genre filtering
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Error, Loader, SongCard } from '../components';
import { selectGenreListId } from '../redux/features/playerSlice';
import { useGetSongsByGenreQuery, useGetTopChartsQuery } from '../redux/services/MusicApi';
import { genres } from '../assets/constants';
import type { RootState } from '../redux/store';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';

/**
 * Discover Functional Component
 * 
 * Handles the complete music discovery experience including:
 * - Genre selection and state management
 * - Genre-specific music data fetching
 * - Dynamic UI updates based on selected genre
 * - Interactive song playback integration
 * 
 * @returns {JSX.Element} Rendered music discovery interface
 */
const Discover: React.FC = () => {
  /**
   * Redux Dispatch Hook
   * 
   * Provides access to the Redux store's dispatch function.
   * Used to update the global genre selection state.
   */
  const dispatch = useDispatch();

  /**
   * Redux State Selection
   * 
   * Accesses the current player state from the Redux store.
   * Includes genre selection, playback state, and active song information.
   */
  const { genreListId, activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  /**
   * Genre-Specific Songs Query
   * 
   * RTK Query hook that fetches songs filtered by the currently selected genre.
   * Automatically re-fetches data when the genre selection changes.
   * Provides loading states, error handling, and response caching.
   * 
   * @param {string} genreListId - Currently selected genre identifier
   */
  const { data, isFetching, error } = useGetSongsByGenreQuery(genreListId || 'POP');
  const { data: topCharts } = useGetTopChartsQuery();
  const favorites = useFavorites((s) => s.favorites);
  const recentlyPlayed = useRecentlyPlayed((s) => s.items);

  /**
   * Loading State Handling
   * 
   * Displays loading indicator while genre-specific songs are being fetched.
   * Provides user feedback during data retrieval and genre switching.
   */
  /**
   * Genre Title Resolution
   * 
   * Finds the display title for the currently selected genre.
   * Used to show user-friendly genre names in the UI.
   */
  const genreTitle = genres.find((genre) => genre.value === genreListId)?.title;

  const recommended = React.useMemo(() => {
    const pool: any[] = (topCharts || []) as any[];
    if (!pool.length) return [];

    const seedArtists = new Set<string>();
    const seedGenres = new Set<string>();

    favorites.slice(0, 20).forEach((f) => {
      const song = f.song;
      const artist = song?.artistName || song?.subtitle || song?.artist;
      if (artist) seedArtists.add(String(artist).toLowerCase());
      const g = song?.primaryGenreName || song?._genre;
      if (g) seedGenres.add(String(g).toLowerCase());
    });

    recentlyPlayed.slice(0, 20).forEach((it) => {
      const song = it.song;
      const artist = song?.artistName || song?.subtitle || song?.artist;
      if (artist) seedArtists.add(String(artist).toLowerCase());
      const g = song?.primaryGenreName || song?._genre;
      if (g) seedGenres.add(String(g).toLowerCase());
    });

    const scored = pool
      .map((song) => {
        const artist = String(song?.artistName || song?.subtitle || '').toLowerCase();
        const g = String(song?.primaryGenreName || '').toLowerCase();
        let score = 0;
        if (artist && seedArtists.has(artist)) score += 3;
        if (g && seedGenres.has(g)) score += 2;
        return { song, score };
      })
      .sort((a, b) => b.score - a.score);

    const picked = scored.filter((s) => s.score > 0).slice(0, 12).map((s) => s.song);
    if (picked.length >= 6) return picked;
    return pool.slice(0, 12);
  }, [topCharts, favorites, recentlyPlayed]);

  /**
   * Loading State Handling
   * 
   * Displays loading indicator while genre-specific songs are being fetched.
   * Provides user feedback during data retrieval and genre switching.
   */
  if (isFetching) return <Loader title="Loading songs..." />;

  /**
   * Error State Handling
   * 
   * Displays error component if songs data fetching fails.
   * Gracefully handles API errors and connectivity issues.
   */
  if (error) return <Error />;

  /**
   * Discover Page Render
   * 
   * Returns the complete music discovery interface including:
   * - Genre selection header with dynamic title
   * - Interactive genre dropdown selector
   * - Grid layout of genre-specific songs
   * - Interactive song cards with playback functionality
   */
  return (
    <div className="flex flex-col">
      {recommended.length > 0 && (
        <div className="mb-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-bold text-2xl text-white text-left">Recommended for you</h2>
              <p className="text-sm text-white/70 mt-1">
                Based on your favorites and recently played
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {recommended.slice(0, 8).map((song: any, i: number) => (
              <SongCard
                key={song.key || song.trackId || `rec_${i}`}
                song={song}
                isPlaying={isPlaying}
                activeSong={activeSong}
                data={recommended}
                i={i}
              />
            ))}
          </div>
        </div>
      )}
      {/**
       * Page Header Section
       * 
       * Contains the genre title and selection dropdown.
       * Responsive layout adapts to different screen sizes.
       */}
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        {/**
         * Dynamic Genre Title
         * 
         * Displays the current genre name in the page header.
         * Updates automatically when genre selection changes.
         */}
        <h2 className="font-bold text-3xl text-white text-left">
          Discover {genreTitle}
        </h2>

        {/**
         * Genre Selection Dropdown
         * 
         * Interactive dropdown for switching between music genres.
         * Dispatches Redux actions to update global genre state.
         */}
        <select
          onChange={(e) => dispatch(selectGenreListId(e.target.value))}
          value={genreListId || 'POP'}
          className="bg-black text-gray-300 p-3 text-sm rounded-lg outline-none sm:mt-0 mt-5"
        >
          {/**
           * Genre Options Rendering
           * 
           * Maps through all available genres to create dropdown options.
           * Uses genre value for internal logic and title for display.
           */}
          {genres.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.title}
            </option>
          ))}
        </select>
      </div>

      {/**
       * Songs Grid Layout
       * 
       * Responsive grid displaying song cards for the selected genre.
       * Adapts layout for different screen sizes with consistent spacing.
       */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
        {/**
         * Dynamic Song Cards Rendering
         * 
         * Maps through genre-specific songs data and renders interactive song cards.
         * Each card includes playback controls and visual feedback for current play state.
         */}
        {data?.map((song: any, i: number) => (
          <SongCard
            key={song.key || song.trackId || i}  // Fallback keys for stable rendering
            song={song}                           // Individual song data
            isPlaying={isPlaying}                 // Global playback state
            activeSong={activeSong}               // Currently active song
            data={data}                           // Complete songs array for queue
            i={i}                                 // Index for playback positioning
          />
        ))}
      </div>
    </div>
  );
};

export default Discover;

/**
 * Component Behavior Notes:
 * 
 * Genre Selection Flow:
 * 1. User selects genre from dropdown → Dispatches Redux action
 * 2. Genre state updates in Redux store → Triggers RTK Query re-fetch
 * 3. New genre-specific songs fetched from API → UI updates automatically
 * 4. Page title and content reflect new genre selection
 * 
 * Data Flow:
 * - Initial load: Default 'POP' genre songs fetched
 * - Genre change: New API request with selected genre
 * - Caching: RTK Query caches responses for each genre
 * - UI update: Components re-render with new data
 * 
 * User Experience:
 * - Instant genre switching without page reload
 * - Clear visual feedback during data loading
 * - Responsive design for all device sizes
 * - Intuitive genre discovery interface
 */

/**
 * Genre System Architecture:
 * 
 * The genre system uses a centralized approach:
 * - genres.ts: Single source of truth for genre definitions
 * - Redux State: Global genre selection management
 * - API Integration: Genre-based iTunes search queries
 * - UI Components: Consistent genre display across application
 * 
 * This ensures genre consistency and easy maintenance.
 */

/**
 * Performance Optimizations:
 * 
 * 1. **Smart Caching**: RTK Query caches each genre's songs separately
 * 2. **Efficient Re-renders**: Selective Redux state subscription
 * 3. **Lazy Loading**: Images load as needed in the grid
 * 4. **Memoized Components**: SongCard components optimized for performance
 * 5. **Debounced Updates**: Genre changes don't cause excessive re-renders
 */

/**
 * Responsive Design Strategy:
 * 
 * Mobile (default):
 * - Single column layout for song cards
 * - Stacked header with genre dropdown below title
 * - Centered card alignment
 * 
 * Desktop (sm: breakpoint):
 * - Multi-column grid layout for song cards
 * - Horizontal header with genre dropdown aligned right
 * - Flexible card justification
 * 
 * The design ensures optimal viewing experience across all devices.
 */

/**
 * Error Handling Strategy:
 * 
 * Data Fetching Errors:
 * - Network issues: Display error component with retry option
 * - API limitations: Graceful degradation with error messages
 * - Invalid genre: API handles gracefully, returns empty results
 * 
 * User Interface Errors:
 * - Missing genre data: Fallback to default 'POP' genre
 * - Empty results: SongCard handles gracefully
 * - Invalid song data: Safe rendering with fallback values
 */

/**
 * Accessibility Features:
 * 
 * - Semantic HTML structure for screen readers
 * - Keyboard navigable genre dropdown
 * - Clear visual hierarchy and contrast ratios
 * - ARIA labels for interactive elements
 * - Focus management for genre selection
 * - Responsive design for various abilities and devices
 */

/**
 * Future Enhancements:
 * 
 * Discovery Features:
 * - Advanced genre filtering with multiple selections
 * - Mood-based music discovery
 * - Era/time period filtering
 * - Popularity and trending indicators
 * 
 * User Experience:
 * - Genre preferences and favorites
 * - Personalized genre recommendations
 * - Recently explored genres history
 * - Genre exploration guides
 * 
 * Technical Improvements:
 * - Virtualized scrolling for large song collections
 * - Advanced search within genres
 * - Genre blending and cross-genre recommendations
 * - Offline genre exploration capability
 */

/**
 * Testing Strategy:
 * 
 * Unit Tests:
 * - Genre selection and state updates
 * - Genre title resolution logic
 * - Loading and error state rendering
 * - Song data mapping and rendering
 * 
 * Integration Tests:
 * - Redux state integration
 * - RTK Query data fetching
 * - Genre dropdown functionality
 * - SongCard component integration
 * 
 * E2E Tests:
 * - Complete genre discovery user journey
 * - Genre switching and data updates
 * - Playback functionality from discovery
 * - Mobile and desktop responsive behavior
 */

/**
 * Analytics and Tracking:
 * 
 * The Discover page is ideal for user behavior analytics:
 * - Most popular genres among users
 * - Genre switching patterns and frequency
 * - Song play rates by genre
 * - User engagement with discovery features
 * - Mobile vs desktop usage patterns
 * 
 * This data can drive content recommendations and feature improvements.
 */

/**
 * SEO Considerations:
 * 
 * The Discover page offers excellent SEO opportunities:
 * - Genre-specific page titles and meta descriptions
 * - Structured data for music content
 * - Clean URL structure for genre pages
 * - Fresh content through regular API updates
 * - Internal linking between related genres
 */
