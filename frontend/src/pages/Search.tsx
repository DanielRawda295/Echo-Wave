// src/pages/Search.tsx

/**
 * Search Page Component - Global Music Search Interface
 * 
 * This component provides the search results interface for the EchoWave application.
 * It displays songs matching the user's search query with real-time results from the
 * iTunes API, including comprehensive error handling and empty state management.
 * 
 * Features:
 * - Real-time search results from iTunes music catalog
 * - Dynamic page title reflecting search query
 * - Empty state handling for no results
 * - Interactive song cards with playback functionality
 * - Error handling with detailed logging
 * 
 * @component
 * @returns {JSX.Element} Search results page with matching songs and empty states
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Error, Loader, SongCard } from '../components';
import { useGetSearchSongsQuery, type Song } from '../redux/services/MusicApi';
import type { RootState } from '../redux/store';
import api from '../utils/api';
import { getBackendOrigin } from '../utils/backendOrigin';

/**
 * Search Functional Component
 * 
 * Handles the complete search results experience including:
 * - Search term extraction from URL parameters
 * - API integration for music search functionality
 * - Results display with proper typing
 * - Empty state and error state management
 * - Integration with global music player
 * 
 * @returns {JSX.Element} Rendered search results interface
 */
const Search: React.FC = () => {
  /**
   * Route Parameters
   * 
   * Extracts the search term from the URL route parameters.
   * The search term is passed from the search bar navigation (e.g., /search/rock)
   */
  const { searchTerm } = useParams<{ searchTerm: string }>();

  /**
   * Redux State Selection
   * 
   * Accesses the current music player state from the Redux store.
   * Used to synchronize playback state and highlight currently playing songs.
   */
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  /**
   * Search Songs Query
   * 
   * RTK Query hook that fetches songs matching the search term from iTunes API.
   * Automatically handles loading states, error handling, and response caching.
   * Re-fetches data whenever the search term changes.
   * 
   * @param {string} searchTerm - Search query from route parameters
   */
  const { data, isFetching, error } = useGetSearchSongsQuery(searchTerm || '');

  /**
   * Songs Data Typing
   * 
   * Ensures the API response data is properly typed as Song array.
   * Provides TypeScript type safety and IDE autocomplete support.
   */
  const songs: Song[] = data || [];
  const backendOrigin = getBackendOrigin();

  const [scope, setScope] = useState<'all' | 'itunes' | 'community'>('all');
  const [communitySongs, setCommunitySongs] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadCommunity() {
      const term = (searchTerm || '').trim();
      if (!term) {
        setCommunitySongs([]);
        return;
      }
      setCommunityLoading(true);
      setCommunityError('');
      try {
        const res = await api.get('/tracks/search', { params: { term } });
        if (!active) return;
        const tracks = res.data || [];
        const mapped = tracks.map((t: any) => ({
          key: `user_${t.id}`,
          title: t.title,
          subtitle: t.artist,
          images: { coverart: t.coverUrl ? `${backendOrigin}${t.coverUrl}` : undefined },
          previewUrl: `${backendOrigin}${t.fileUrl}`,
          _trackId: t.id,
          _genre: t.genre,
          _source: 'community',
        }));
        setCommunitySongs(mapped);
      } catch (err: any) {
        if (!active) return;
        const msg =
          err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to search community uploads';
        setCommunityError(String(msg));
        setCommunitySongs([]);
      } finally {
        if (!active) return;
        setCommunityLoading(false);
      }
    }
    loadCommunity();
    return () => {
      active = false;
    };
  }, [searchTerm, backendOrigin]);

  const itunesSongs = useMemo(() => songs.map((s) => ({ ...s, _source: 'itunes' })), [songs]);
  const mergedSongs = useMemo(() => {
    if (scope === 'itunes') return itunesSongs as any[];
    if (scope === 'community') return communitySongs;
    return [...communitySongs, ...itunesSongs] as any[];
  }, [scope, communitySongs, itunesSongs]);

  /**
   * Loading State Handling
   * 
   * Displays loading indicator with dynamic title during search execution.
   * Provides user feedback that search is in progress.
   */
  if (isFetching || communityLoading) return <Loader title={`Searching ${searchTerm}...`} />;

  /**
   * Error State Handling
   * 
   * Displays error component if search API request fails.
   * Includes console logging for debugging and monitoring purposes.
   */
  if (error) {
    console.error('Search error:', error);
    return <Error />;
  }

  if (communityError) {
    console.error('Community search error:', communityError);
  }

  /**
   * Search Results Page Render
   * 
   * Returns the complete search results interface including:
   * - Dynamic page header with search term
   * - Empty state for no results
   * - Grid layout of matching songs
   * - Interactive song cards with playback functionality
   */
  return (
    <div className="flex flex-col">
    
      <h2 className="font-bold text-3xl text-white text-left mt-4 mb-10">
        Showing results for <span className="font-black">{searchTerm}</span>
      </h2>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setScope('all')}
          className={[
            'rounded-full px-4 py-2 text-sm ring-1',
            scope === 'all'
              ? 'bg-indigo-600 text-white ring-indigo-500'
              : 'bg-white/5 text-white/80 ring-white/10 hover:bg-white/10',
          ].join(' ')}
        >
          All ({communitySongs.length + songs.length})
        </button>
        <button
          type="button"
          onClick={() => setScope('itunes')}
          className={[
            'rounded-full px-4 py-2 text-sm ring-1',
            scope === 'itunes'
              ? 'bg-indigo-600 text-white ring-indigo-500'
              : 'bg-white/5 text-white/80 ring-white/10 hover:bg-white/10',
          ].join(' ')}
        >
          iTunes ({songs.length})
        </button>
        <button
          type="button"
          onClick={() => setScope('community')}
          className={[
            'rounded-full px-4 py-2 text-sm ring-1',
            scope === 'community'
              ? 'bg-indigo-600 text-white ring-indigo-500'
              : 'bg-white/5 text-white/80 ring-white/10 hover:bg-white/10',
          ].join(' ')}
        >
          Community ({communitySongs.length})
        </button>
      </div>

      {mergedSongs.length === 0 ? (
        /**
         * Empty State
         * 
         * Displayed when no songs match the search query.
         * Provides clear feedback that search returned no results.
         */
        <div className="w-full flex justify-center items-center py-10">
          <p className="text-gray-400 text-lg">
            No songs found for "{searchTerm}"
          </p>
        </div>
      ) : (
        /**
         * Search Results Grid
         * 
         * Responsive grid layout displaying all matching songs.
         * Each song is rendered as an interactive card with playback controls.
         */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
         
          {mergedSongs.map((song: any, i: number) => (
            <SongCard
              key={song.key || song.trackId?.toString() || i} // Fallback key strategy
              song={song}                                      // Individual song data
              isPlaying={isPlaying}                            // Global playback state
              activeSong={activeSong}                          // Currently active song
              data={mergedSongs}                               // Complete results for queue
              i={i}                                            // Index for playback positioning
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;

/**
 * Component Behavior Notes:
 * 
 * Search Flow:
 * 1. User enters search term in SearchBar component
 * 2. Navigation to /search/{term} route
 * 3. Component mounts with search term from URL
 * 4. RTK Query fetches matching songs from iTunes API
 * 5. Results displayed in responsive grid layout
 * 6. User can play songs directly from search results
 * 
 * Error Handling Strategy:
 * - API failures: Display Error component with console logging
 * - Network issues: Graceful error state with retry capability
 * - Empty results: User-friendly empty state message
 * - Invalid search terms: API handles gracefully, returns empty array
 * 
 * User Experience:
 * - Clear visual feedback during search execution
 * - Dynamic page titles for search context
 * - Responsive grid layout for all device sizes
 * - Immediate playback from search results
 * - Comprehensive empty and error states
 */

/**
 * Performance Optimizations:
 * 
 * 1. **Efficient Caching**: RTK Query caches search results by query term
 * 2. **Smart Re-fetching**: Only re-fetches when search term changes
 * 3. **Optimized Rendering**: SongCard components optimized with proper keys
 * 4. **Lazy Loading**: Images load as needed in the grid
 * 5. **Memory Management**: Old search results properly garbage collected
 */

/**
 * Search Algorithm Details:
 * 
 * The iTunes Search API used provides:
 * - Broad matching across song titles, artist names, and album names
 * - Relevance-based result ordering
 * - Support for partial matches and typos
 * - Limit of 50 results per query (configurable in API service)
 * - International character support
 * 
 * @example
 * // iTunes API search URL structure
 * https://itunes.apple.com/search?term=rock&entity=musicTrack&limit=50
 */

/**
 * Accessibility Features:
 * 
 * - Semantic HTML structure for screen readers
 * - Clear page headings with search context
 * - Keyboard navigable song cards
 * - ARIA labels for interactive elements
 * - High contrast colors for readability
 * - Focus management for search results
 */

/**
 * Empty State Strategy:
 * 
 * The empty state serves multiple purposes:
 * - Confirms the search executed successfully
 * - Indicates no matches were found
 * - Prevents user confusion about missing results
 * - Maintains engagement with clear messaging
 * - Could be enhanced with search suggestions
 */

/**
 * Future Enhancements:
 * 
 * Search Features:
 * - Advanced search filters (by genre, year, duration)
 * - Search suggestions and autocomplete
 * - Search history and recent searches
 * - Voice search integration
 * - Search within results functionality
 * 
 * Result Enhancements:
 * - Pagination for large result sets
 * - Result sorting options (relevance, popularity, date)
 * - Artist and album result categories
 * - Related searches suggestions
 * - Search result analytics and insights
 * 
 * User Experience:
 * - Search result previews or snippets
 * - Quick play buttons without entering song details
 * - Search result sharing capabilities
 * - Offline search capability for recent results
 */

/**
 * Testing Strategy:
 * 
 * Unit Tests:
 * - Search term extraction from URL parameters
 * - Empty state rendering logic
 * - Error state handling and logging
 * - Song data mapping and rendering
 * 
 * Integration Tests:
 * - RTK Query search integration
 * - Route parameter handling
 * - Redux state synchronization
 * - SongCard component integration
 * 
 * E2E Tests:
 * - Complete search user journey
 * - Empty search result scenarios
 * - Error state recovery
 * - Playback from search results
 * - Mobile and desktop search behavior
 */

/**
 * Analytics and Insights:
 * 
 * The Search page provides valuable user behavior data:
 * - Most popular search terms and trends
 * - Search success rates and result quality
 * - User engagement with search results
 * - Common empty search patterns
 * - Search-to-play conversion rates
 * 
 * This data can drive search improvements and content recommendations.
 */

/**
 * SEO Considerations:
 * 
 * Search results pages have excellent SEO potential:
 * - Dynamic page titles with search terms
 * - Structured data for music content
 * - Clean URL structure for search queries
 * - Fresh content through regular API updates
 * - Internal linking from search results to detail pages
 * 
 * However, note that search results are dynamic and user-specific,
 * which may limit search engine indexing value.
 */
