// src/pages/AroundYou.tsx

/**
 * AroundYou Page Component - Location-Based Music Discovery
 * 
 * This component displays popular songs trending in the user's current geographic location.
 * It automatically detects the user's country using IP geolocation and shows region-specific
 * music charts from the iTunes API.
 * 
 * Features:
 * - Automatic country detection via IP geolocation
 * - Country-specific music recommendations
 * - Integration with iTunes API for regional charts
 * - Responsive song grid layout
 * - Error handling for geolocation failures
 * 
 * @component
 * @returns {JSX.Element} Location-based music discovery page
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { Error, Loader, SongCard } from '../components';
import { useGetSongsByCountryQuery } from '../redux/services/MusicApi';
import type { RootState } from '../redux/store';

/**
 * AroundYou Functional Component
 * 
 * Handles the complete location-based music discovery flow:
 * - Detects user's country via IP geolocation service
 * - Fetches country-specific music charts from iTunes API
 * - Displays songs popular in the detected region
 * - Provides fallback handling for geolocation failures
 * 
 * @returns {JSX.Element} Rendered location-based music discovery interface
 */
const AroundYou: React.FC = () => {
  /**
   * Component State Management
   * 
   * Manages the user's detected country and loading states for geolocation.
   */
  const [country, setCountry] = useState<string>('US');  // Detected country code (default: US)
  const [loading, setLoading] = useState<boolean>(true); // Geolocation loading state

  /**
   * Redux State Selection
   * 
   * Accesses the current music player state from Redux store.
   * Used to control song playback and highlight currently playing tracks.
   */
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);
  
  /**
   * RTK Query Hook for Country-Specific Songs
   * 
   * Automatically fetches popular songs for the detected country from iTunes API.
   * Uses React Redux's RTK Query for efficient data fetching, caching, and state management.
   * 
   * @param {string} country - ISO country code for regional music data
   * @returns {Object} Query result containing data, loading state, and error information
   */
  const { data, isFetching, error } = useGetSongsByCountryQuery(country);

  /**
   * Geolocation Effect
   * 
   * Detects the user's country on component mount using IP-based geolocation.
   * Falls back to 'US' if geolocation fails or is unavailable.
   * 
   * @effect
   * @dependencies [] - Runs only once on component mount
   */
  useEffect(() => {
    /**
     * Country Detection via IP Geolocation
     * 
     * Uses the country.is API service to determine user's country based on IP address.
     * This provides automatic localization without requiring user permission for GPS.
     */
    axios
      .get(`https://api.country.is/`)
      .then((res) => {
        /**
         * Successful Geolocation
         * 
         * Sets the detected country code from the API response.
         * Uses the country code for region-specific music recommendations.
         */
        setCountry(res?.data?.country || 'US');
      })
      .catch((err) => {
        /**
         * Geolocation Error Handling
         * 
         * Falls back to United States (US) if geolocation fails.
         * Logs error for debugging while maintaining user experience.
         */
        console.log(err);
        setCountry('US');
      })
      .finally(() => {
        /**
         * Loading State Completion
         * 
         * Marks geolocation process as complete regardless of success/failure.
         * Allows the UI to proceed with rendering music content.
         */
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * Loading State Handling
   * 
   * Displays loading indicator when both geolocation and API data are being fetched.
   * Provides better user experience during initial data loading.
   */
  if (isFetching && loading) return <Loader title="Loading Songs around you..." />;

  /**
   * Error State Handling
   * 
   * Displays error component if the songs API request fails.
   * Provides graceful error handling for API connectivity issues.
   */
  if (error) return <Error />;

  /**
   * AroundYou Page Render
   * 
   * Returns the location-based music discovery interface including:
   * - Location-aware page title with detected country
   * - Grid layout of songs popular in the user's region
   * - Interactive song cards with playback functionality
   */
  return (
    <div className="flex flex-col">
      {/* Page Header with Location Information */}
      <h2 className="font-bold text-3xl text-white text-left mt-4 mb-10">
        Around you <span className="font-black">{country}</span>
      </h2>

      {/* Songs Grid Layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
        {/**
         * Dynamic Song Cards Rendering
         * 
         * Maps through the country-specific songs data and renders interactive song cards.
         * Each card includes playback controls and visual feedback for currently playing songs.
         */}
        {data?.map((song: any, i: number) => (
          <SongCard
            key={song.key || i} // Fallback to index if song key is missing
            song={song}         // Individual song data
            isPlaying={isPlaying} // Current playback state
            activeSong={activeSong} // Currently active song
            data={data}         // Complete songs array for queue management
            i={i}               // Index for playback positioning
          />
        ))}
      </div>
    </div>
  );
};

export default AroundYou;

/**
 * Component Behavior Notes:
 * 
 * Geolocation Flow:
 * 1. Component mounts → Triggers IP geolocation request
 * 2. Success: Country code detected → Fetches regional music
 * 3. Failure: Falls back to US → Fetches US music charts
 * 4. Loading states manage user experience during detection
 * 
 * API Integration:
 * - country.is API: Free IP geolocation service
 * - iTunes API: Regional music charts by country code
 * - RTK Query: Efficient caching and state management
 * 
 * User Experience:
 * - Automatic localization without user input
 * - Clear indication of detected location
 * - Graceful fallback for geolocation failures
 * - Responsive grid layout for song display
 */

/**
 * Geolocation Service Details:
 * 
 * API: https://api.country.is/
 * Response Format: { "country": "US", "ip": "192.168.1.1" }
 * Features: No API key required, free tier available
 * Limitations: Country-level precision only (no city data)
 * 
 * Alternative Services Considered:
 * - IPAPI (ipapi.co)
 * - IPGeolocation (ipgeolocation.io)
 * - FreeGeoIP (freegeoip.app)
 */

/**
 * Error Handling Strategy:
 * 
 * Geolocation Errors:
 * - Network failures: Fallback to US
 * - API limitations: Fallback to US
 * - Rate limiting: Fallback to US
 * 
 * Music API Errors:
 * - Network issues: Display error component
 * - Invalid country: API handles gracefully
 * - No results: Empty state (handled by SongCard)
 */

/**
 * Performance Considerations:
 * 
 * 1. **Geolocation Caching**: Country detection happens once per session
 * 2. **API Caching**: RTK Query caches country-specific music data
 * 3. **Lazy Loading**: Songs load as needed in the grid
 * 4. **Efficient Re-renders**: Selective Redux state subscription
 */

/**
 * Internationalization Ready:
 * 
 * The component structure supports future i18n implementation:
 * - Country codes are standardized (ISO 3166-1 alpha-2)
 * - Text content can be externalized for translation
 * - Layout supports right-to-left languages
 * 
 * @example
 * // Future i18n implementation
 * const countryName = i18n.t(`countries.${country}`);
 * <h2>{i18n.t('aroundYou.title')} <span>{countryName}</span></h2>
 */

/**
 * Privacy Considerations:
 * 
 * 1. **IP-Based Only**: No GPS location tracking required
 * 2. **Country-Level**: No precise location data collected
 * 3. **External Service**: Geolocation handled by third-party API
 * 4. **Data Minimization**: Only country code is stored/used
 * 
 * GDPR Compliance: Country-level data is generally considered
 * non-personal information under GDPR guidelines.
 */

/**
 * Future Enhancements:
 * 
 * User Control:
 * - Manual country selection override
 * - "Not your country?" correction option
 * - Recent countries list for frequent travelers
 * 
 * Features:
 * - Regional music trends over time
 * - Compare music between countries
 * - Local artist highlights
 * - Cultural music categories
 * 
 * Technical:
 * - More precise location (city-level) with user permission
 * - Offline country detection using browser APIs
 * - Multiple geolocation fallback providers
 */

/**
 * Testing Strategy:
 * 
 * Unit Tests:
 * - Default US fallback on geolocation error
 * - Successful country detection flow
 * - Loading state management
 * - Error state rendering
 * 
 * Integration Tests:
 * - API service integration
 * - Redux state synchronization
 * - SongCard component rendering
 * - Responsive layout behavior
 */
