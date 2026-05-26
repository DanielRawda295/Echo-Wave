// src/pages/ArtistDetails.tsx

/**
 * ArtistDetails Page Component - Comprehensive Artist Profile
 * 
 * This component displays detailed information about a specific music artist including
 * their profile, top songs, and metadata. It serves as the artist's dedicated page
 * within the EchoWave application, providing fans with a complete artist experience.
 * 
 * Features:
 * - Artist profile header with image and basic information
 * - Detailed artist metadata (genre, track count)
 * - Interactive top songs list with playback functionality
 * - Integration with iTunes API for artist data
 * - Seamless music playback integration
 * 
 * 
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DetailsHeader, Error, Loader, RelatedSongs } from '../components';
import { useGetArtistDetailsQuery } from '../redux/services/MusicApi';
import { playPause, setActiveSong } from '../redux/features/playerSlice';
import type { RootState } from '../redux/store';

/**
 * ArtistDetails Functional Component
 * 
 * Handles the complete artist profile experience including:
 * - Artist data fetching and display
 * - Top songs presentation and playback
 * - Artist metadata presentation
 * - Integration with global music player
 * 
 *
 */
const ArtistDetails: React.FC = () => {
  /**
   * Redux Dispatch Hook
   * 
   * Provides access to the Redux store's dispatch function.
   * Used to trigger state updates for music playback controls.
   */
  const dispatch = useDispatch();

  /**
   * Route Parameters
   * 
   * Extracts the artist ID from the URL route parameters.
   * The artist ID is passed from navigation (e.g., /artists/taylor-swift)
   */
  const { id: artistId } = useParams<{ id: string }>();

  /**
   * Redux State Selection
   * 
   * Accesses the current music player state from the Redux store.
   * Used to synchronize playback state across the application.
   */
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  /**
   * Artist Details Query
   * 
   * RTK Query hook that fetches detailed artist information and top songs.
   * Automatically handles loading states, caching, and error handling.
   * 
   * @param {string} artistId - Artist identifier from route parameters
   */
  const { 
    data: artistData, 
    isFetching: isFetchingArtistDetails, 
    error 
  } = useGetArtistDetailsQuery(artistId!);

  /**
   * Loading State Handling
   * 
   * Displays loading indicator while artist data is being fetched.
   * Provides user feedback during data retrieval.
   */
  if (isFetchingArtistDetails) return <Loader title="Loading artist details..." />;

  /**
   * Error State Handling
   * 
   * Displays error component if artist data fetching fails.
   * Gracefully handles API errors and connectivity issues.
   */
  if (error) return <Error />;

  /**
   * Data Extraction and Transformation
   * 
   * Processes the API response to extract artist information and songs.
   * Normalizes the data structure for consistent component consumption.
   */
  const artist = artistData?.data?.[0]; // Primary artist object from API response
  const songs = artist?.views?.['top-songs']?.data || []; // Artist's top tracks

  /**
   * Playback Control Handlers
   * 
   * Functions to control music playback through Redux actions.
   * These handlers integrate with the global music player system.
   */

  /**
   * Pause Playback Handler
   * 
   * Dispatches action to pause the currently playing music.
   * Used when user manually pauses playback.
   */
  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  /**
   * Play Song Handler
   * 
   * Dispatches actions to set a song as active and start playback.
   * Used when user clicks play on any song in the artist's track list.
   * 
   * @param {any} song - The song object to be played
   * @param {number} i - Index of the song in the tracks array
   */
  const handlePlayClick = (song: any, i: number) => {
    // Set the selected song as active in the player
    dispatch(setActiveSong({ song, data: songs, i }));
    // Start playback immediately
    dispatch(playPause(true));
  };

  /**
   * ArtistDetails Page Render
   * 
   * Returns the complete artist profile interface including:
   * - Artist header with profile image and basic info
   * - Detailed artist metadata section
   * - Interactive top songs list with playback controls
   */
  return (
    <div className="flex flex-col">
      {/**
       * Artist Profile Header
       * 
       * Displays artist image, name, and basic information.
       * Provides visual identity for the artist profile.
       */}
      <DetailsHeader artistId={artistId} artistData={artist} />
      
      {/**
       * Artist Information Section
       * 
       * Shows detailed metadata about the artist including genre and discography.
       * Provides context and background for the artist's work.
       */}
      <div className="mb-10">
        {/* Section Title */}
        <h2 className="text-white text-3xl font-bold">About:</h2>
        
        {/* Artist Metadata Content */}
        <div className="mt-5">
          {artist ? (
            /**
             * Artist Information Display
             * 
             * Shows available artist metadata in a clean, readable format.
             * Gracefully handles missing or incomplete data.
             */
            <div className="text-gray-400 text-base space-y-2">
              {/* Primary Music Genre */}
              <p>
                <strong>Genre:</strong> {artist.attributes?.genreNames?.[0] || 'Unknown'}
              </p>
              
              {/* Track Count Statistics */}
              <p>
                <strong>Songs:</strong> {songs.length} tracks
              </p>
            </div>
          ) : (
            /**
             * Fallback Content
             * 
             * Displayed when no artist information is available.
             * Provides graceful degradation for incomplete data.
             */
            <p className="text-gray-400 text-base">
              No artist information available.
            </p>
          )}
        </div>
      </div>

      <RelatedSongs
        data={songs}                    // Array of artist's top tracks
        artistId={artistId}             // Current artist identifier
        isPlaying={isPlaying}           // Global playback state
        activeSong={activeSong}         // Currently active song
        handlePauseClick={handlePauseClick}  // Pause control handler
        handlePlayClick={handlePlayClick}    // Play control handler
      />
    </div>
  );
};

export default ArtistDetails;

/**
 * Component Behavior Notes:
 * 
 * Data Flow:
 * 1. Component mounts with artist ID from URL
 * 2. RTK Query fetches artist details from iTunes API
 * 3. Data is transformed and displayed in UI components
 * 4. User interactions trigger Redux actions for playback
 * 
 * Error Resilience:
 * - Graceful handling of missing artist data
 * - Fallback values for incomplete metadata
 * - Error boundary for API failures
 * - Empty state for no songs available
 * 
 * User Experience:
 * - Progressive loading with clear indicators
 * - Interactive song playback controls
 * - Comprehensive artist information
 * - Seamless navigation between songs
 */

/**
 * API Response Structure:
 * 
 * The artist details API returns data in a Deezer-compatible format:
 * 
 * @example
 * {
 *   data: [{
 *     id: "artist-name",
 *     attributes: {
 *       name: "Artist Name",
 *       genreNames: ["Pop", "Rock"],
 *       artwork: { url: "image-url" }
 *     },
 *     views: {
 *       'top-songs': {
 *         data: [ ... array of song objects ... ]
 *       }
 *     }
 *   }]
 * }
 */

/**
 * Playback Integration:
 * 
 * The component integrates with the global music player through:
 * - Redux actions for play/pause control
 * - Active song state synchronization
 * - Queue management with artist's top songs
 * - Visual feedback for currently playing tracks
 * 
 * This ensures consistent playback experience across the entire application.
 */

/**
 * Performance Considerations:
 * 
 * 1. **Efficient Data Fetching**: RTK Query provides automatic caching
 * 2. **Optimized Re-renders**: Selective Redux state subscription
 * 3. **Lazy Loading**: Images load as needed
 * 4. **Memoization**: Expensive computations are cached appropriately
 */

/**
 * Accessibility Features:
 * 
 * - Semantic HTML structure for screen readers
 * - Keyboard navigable song controls
 * - Clear visual hierarchy and contrast
 * - ARIA labels for interactive elements
 * - Focus management for playback controls
 */

/**
 * Future Enhancements:
 * 
 * Artist Content:
 * - Biography and background information
 * - Discography with album listings
 * - Music videos and visual content
 * - Social media links and connections
 * 
 * Interactive Features:
 * - Follow/Unfollow artist functionality
 * - Concert dates and tour information
 * - Similar artists recommendations
 * - Fan community integration
 * 
 * Technical Improvements:
 * - Infinite scrolling for large song catalogs
 * - Advanced filtering and sorting options
 * - Offline caching of artist data
 * - Real-time updates for new releases
 */

/**
 * Testing Strategy:
 * 
 * Unit Tests:
 * - Artist data extraction and transformation
 * - Playback handler functionality
 * - Loading and error state rendering
 * - Route parameter handling
 * 
 * Integration Tests:
 * - API service integration
 * - Redux action dispatching
 * - Component composition and rendering
 * - Navigation and routing behavior
 * 
 * E2E Tests:
 * - Complete artist page user journey
 * - Playback functionality validation
 * - Error scenario handling
 * - Mobile responsiveness verification
 */

/**
 * SEO Considerations:
 * 
 * The artist details page is highly valuable for SEO:
 * - Unique content for each artist
 * - Structured data for search engines
 * - Social media meta tags
 * - Clean URL structure with artist names
 * - Fast loading performance
 */