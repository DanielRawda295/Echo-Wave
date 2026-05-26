// src/pages/SongDetails.tsx

/**
 * SongDetails Page Component - Comprehensive Song Information Hub
 * 
 * This component provides detailed information about a specific song, including
 * metadata, audio previews, and related song recommendations. It serves as the
 * central hub for song information and discovery within the EchoWave application.
 * 
 * Features:
 * - Detailed song metadata and information display
 * - Related songs recommendations from top charts
 * - Integrated music playback functionality
 * - Data transformation for component compatibility
 * - Comprehensive error and loading state handling
 * 
 * @component
 * @returns {JSX.Element} Complete song information page with metadata and recommendations
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DetailsHeader, Error, Loader, RelatedSongs } from '../components';
import { setActiveSong, playPause } from '../redux/features/playerSlice';
import { useGetSongDetailsQuery, useGetTopChartsQuery } from '../redux/services/MusicApi';
import type { RootState } from '../redux/store';
import { useToasts } from '../hooks/useToasts';
import api from '../utils/api';
import { getBackendOrigin } from '../utils/backendOrigin';
import AddToPlaylist from '../components/AddToPlaylist';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

/**
 * SongDetails Functional Component
 * 
 * Handles the complete song information experience including:
 * - Song data fetching and transformation
 * - Related songs recommendations
 * - Playback control integration
 * - Data normalization for component compatibility
 * - Comprehensive error state management
 * 
 * @returns {JSX.Element} Rendered song details interface
 */
const SongDetails: React.FC = () => {
  /**
   * Redux Dispatch Hook
   * 
   * Provides access to the Redux store's dispatch function.
   * Used to trigger playback controls and song state updates.
   */
  const dispatch = useDispatch();
  const toast = useToasts((s) => s.push);

  /**
   * Route Parameters
   * 
   * Extracts the song ID from the URL route parameters.
   * The song ID is passed from navigation (e.g., /songs/123456789)
   */
  const { songid } = useParams<{ songid: string }>();
  const isCommunity = Boolean(songid && songid.startsWith('user_'));
  const communityId = useMemo(() => {
    if (!songid || !songid.startsWith('user_')) return null;
    const n = Number(songid.replace('user_', ''));
    return Number.isFinite(n) ? n : null;
  }, [songid]);
  const backendOrigin = getBackendOrigin();

  /**
   * Redux State Selection
   * 
   * Accesses the current music player state from the Redux store.
   * Used to synchronize playback state and highlight currently playing songs.
   */
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  /**
   * Song Details Query
   * 
   * RTK Query hook that fetches detailed information about the specific song.
   * Uses the song ID from route parameters to retrieve song metadata.
   */
  const { 
    data: songData, 
    isFetching: isFetchingSongDetails, 
    error: songError 
  } = useGetSongDetailsQuery(songid!, { skip: isCommunity });

  const [communityTrack, setCommunityTrack] = useState<any>(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<any>(null);
  const [likeInfo, setLikeInfo] = useState<{ likeCount: number; liked: boolean }>({
    likeCount: 0,
    liked: false,
  });
  const [comments, setComments] = useState<any[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!isCommunity || !communityId) return;
      setCommunityLoading(true);
      setCommunityError(null);
      try {
        const res = await api.get(`/tracks/${communityId}`);
        if (!active) return;
        setCommunityTrack(res.data);

        // Load likes + comments
        try {
          const likeRes = await api.get(`/tracks/${communityId}/like`);
          if (active) setLikeInfo({ likeCount: likeRes.data.likeCount, liked: likeRes.data.liked });
        } catch {
          // ignore
        }

        try {
          const commentsRes = await api.get(`/tracks/${communityId}/comments`);
          if (active) setComments(commentsRes.data || []);
        } catch {
          // ignore
        }
      } catch (err: any) {
        if (!active) return;
        setCommunityError(err);
      } finally {
        if (!active) return;
        setCommunityLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [isCommunity, communityId]);

  /**
   * Related Songs Query
   * 
   * RTK Query hook that fetches top charts to use as related song recommendations.
   * Since iTunes API doesn't provide direct "related songs" endpoint,
   * top charts serve as contextual recommendations.
   */
  const { 
    data: relatedSongsData, 
    isFetching: isFetchingRelated, 
    error: relatedError 
  } = useGetTopChartsQuery();

  /**
   * Combined Loading State Handling
   * 
   * Displays loading indicator while both song details and related songs are being fetched.
   * Ensures complete data availability before rendering the full interface.
   */
  if (isFetchingRelated || isFetchingSongDetails || communityLoading) {
    return <Loader title="Loading song details..." />;
  }

  /**
   * Combined Error State Handling
   * 
   * Displays error component if either song details or related songs fetching fails.
   * Provides graceful error handling for partial data failures.
   */
  if ((!isCommunity && songError) || relatedError || (isCommunity && communityError)) return <Error />;

  if (isCommunity && communityTrack) {
    const song = {
      key: `user_${communityTrack.id}`,
      title: communityTrack.title,
      subtitle: communityTrack.artist,
      images: {
        coverart: communityTrack.coverUrl ? `${backendOrigin}${communityTrack.coverUrl}` : undefined,
      },
      previewUrl: `${backendOrigin}${communityTrack.fileUrl}`,
    };

    return (
      <div className="flex flex-col">
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                toast('Song link copied', 'success');
              } catch {
                toast('Could not copy link', 'error');
              }
            }}
          >
            Copy link
          </button>
          <div className="flex items-center gap-2">
            <AddToPlaylist song={song} index={0} />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
              onClick={async () => {
                try {
                  const res = await api.post(`/tracks/${communityId}/like`);
                  setLikeInfo({ likeCount: res.data.likeCount, liked: res.data.liked });
                } catch (err: any) {
                  const msg =
                    err?.response?.data?.message?.message ||
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to like';
                  toast(String(msg), 'error');
                }
              }}
              aria-label={likeInfo.liked ? 'Unlike' : 'Like'}
            >
              {likeInfo.liked ? <FaHeart className="text-pink-400" /> : <FaRegHeart />}
              {likeInfo.likeCount}
            </button>
            <button
              type="button"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
              onClick={() => {
                dispatch(setActiveSong({ song, data: [song], i: 0 }));
                dispatch(playPause(true));
              }}
            >
              Play
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-xl bg-white/10">
              {song.images.coverart ? (
                <img src={song.images.coverart} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="truncate text-2xl font-bold text-white">{song.title}</div>
              <div className="truncate text-sm text-white/70">{song.subtitle}</div>
              {communityTrack.genre ? (
                <div className="mt-1 text-xs text-white/60">Genre: {communityTrack.genre}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="font-bold text-3xl text-white">Comments</h1>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex gap-2">
              <input
                className="h-10 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Write a comment…"
              />
              <button
                type="button"
                className="h-10 rounded-xl bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                disabled={commentLoading || !commentDraft.trim()}
                onClick={async () => {
                  if (!communityId) return;
                  setCommentLoading(true);
                  try {
                    const res = await api.post(`/tracks/${communityId}/comments`, {
                      text: commentDraft.trim(),
                    });
                    setComments((prev) => [res.data, ...prev]);
                    setCommentDraft('');
                    toast('Comment posted', 'success');
                  } catch (err: any) {
                    const msg =
                      err?.response?.data?.message?.message ||
                      err?.response?.data?.message ||
                      err?.message ||
                      'Failed to post comment';
                    toast(String(msg), 'error');
                  } finally {
                    setCommentLoading(false);
                  }
                }}
              >
                Post
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {comments.length === 0 ? (
              <div className="text-sm text-white/70">No comments yet.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">
                    {c.user?.username || c.user?.email || 'User'}
                  </div>
                  <div className="mt-1 text-sm text-white/80">{c.text}</div>
                  <div className="mt-2 text-xs text-white/50">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Playback Control Handlers
   * 
   * Functions to control music playback through Redux actions.
   * These handlers integrate with the global music player system.
   */

  /**
   * Play Song Handler
   * 
   * Dispatches actions to set a song as active and start playback.
   * Uses 'any' type to avoid TypeScript conflicts with different song data structures.
   * 
   * @param {any} song - The song object to be played
   * @param {number} i - Index of the song in the related songs array
   */
  const handlePlayClick = (song: any, i: number) => {
    // Set the selected song as active in the player
    dispatch(setActiveSong({ song, data: relatedSongsData || [], i }));
    // Start playback immediately
    dispatch(playPause(true));
  };

  /**
   * Pause Playback Handler
   * 
   * Dispatches action to pause the currently playing music.
   * Used when user manually pauses playback from related songs.
   */
  const handlePauseClick = () => dispatch(playPause(false));

  /**
   * Data Transformation for DetailsHeader
   * 
   * Normalizes song data from iTunes API format to component-compatible structure.
   * Ensures consistent data shape for the DetailsHeader component.
   */
  const transformedSongData = songData ? {
    key: songData.key || songData.trackId?.toString() || '',                    // Unique identifier
    title: songData.title || songData.trackName || 'Unknown Title',            // Song title
    subtitle: songData.subtitle || songData.artistName || '',                  // Artist name
    images: songData.images || {                                               // Image assets
      coverart: songData.artworkUrl100,                                        // Album artwork
      background: songData.artworkUrl100,                                      // Background image
    },
    artists: songData.artists || [{ adamid: songData.trackId?.toString() }],   // Artist information
  } : undefined;

  /**
   * Related Songs Transformation
   * 
   * Processes top charts data into related songs format with proper typing.
   * Limits to 10 songs and ensures data compatibility with RelatedSongs component.
   */
  const transformedRelatedSongs = (relatedSongsData || [])
    .slice(0, 10)  // Limit to 10 related songs for better UX
    .map((song: any) => ({
      key: song.key || song.trackId?.toString() || Math.random().toString(),   // Stable React key
      title: song.title || song.trackName || 'Unknown Title',                  // Song title
      subtitle: song.subtitle || song.artistName || '',                        // Artist name
      images: song.images || {                                                 // Image assets
        coverart: song.artworkUrl100,
        background: song.artworkUrl100,
      },
      artists: song.artists || [{ adamid: song.artistId?.toString() }],        // Artist information
      attributes: {                                                            // Deezer-compatible attributes
        name: song.title || song.trackName,                                    // Song name
        albumName: song.collectionName,                                        // Album name
        artwork: {
          url: song.artworkUrl100?.replace('100x100', '500x500')               // High-res artwork
        }
      }
    }));

  /**
   * Artist ID Extraction
   * 
   * Extracts the artist ID from the transformed song data.
   * Used for navigation and context in the RelatedSongs component.
   */
  const artistId = transformedSongData?.artists?.[0]?.adamid;

  /**
   * SongDetails Page Render
   * 
   * Returns the complete song information interface including:
   * - Song header with basic information and artwork
   * - Detailed metadata section with song information
   * - Related songs recommendations with playback controls
   */
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              toast('Song link copied', 'success');
            } catch {
              toast('Could not copy link', 'error');
            }
          }}
        >
          Copy link
        </button>
        <a
          className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          href={`https://www.google.com/search?q=${encodeURIComponent(
            `${songData?.trackName || songData?.title || ''} ${songData?.artistName || songData?.subtitle || ''} lyrics`
          )}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => toast('Opening lyrics search…', 'info')}
        >
          Find lyrics
        </a>
      </div>
      {/**
       * Song Header Section
       * 
       * Displays song artwork, title, and basic information.
       * Provides visual identity for the song.
       */}
      <DetailsHeader songData={transformedSongData} />

      {/**
       * Song Information Section
       * 
       * Shows detailed metadata about the song including artist, album, and technical details.
       * Provides comprehensive context for the song.
       */}
      <div className="mb-10">
        {/* Section Title */}
        <h2 className="text-white text-3xl font-bold">Song Information:</h2>
        
        {/* Song Metadata Content */}
        <div className="mt-5">
          {songData ? (
            /**
             * Song Information Display
             * 
             * Shows available song metadata in a clean, readable format.
             * Includes artist, album, genre, release date, and duration.
             */
            <div className="text-gray-400 text-base space-y-2">
              {/* Performing Artist */}
              <p>
                <strong>Artist:</strong> {songData.artistName || songData.subtitle}
              </p>
              
              {/* Album Information */}
              <p>
                <strong>Album:</strong> {songData.collectionName || 'Unknown Album'}
              </p>
              
              {/* Music Genre */}
              <p>
                <strong>Genre:</strong> {songData.primaryGenreName || 'Unknown Genre'}
              </p>
              
              {/* Release Date (Year Only) */}
              <p>
                <strong>Release Date:</strong> {
                  songData.releaseDate ? 
                  new Date(songData.releaseDate).getFullYear() : 
                  'Unknown'
                }
              </p>
              
              {/* Song Duration (Formatted) */}
              <p>
                <strong>Duration:</strong> {
                  songData.trackTimeMillis ? 
                  `${Math.floor(songData.trackTimeMillis / 60000)}:${((songData.trackTimeMillis % 60000) / 1000).toFixed(0).padStart(2, '0')}` : 
                  'Unknown'
                }
              </p>
            </div>
          ) : (
            /**
             * Fallback Content
             * 
             * Displayed when no song information is available.
             * Provides graceful degradation for incomplete data.
             */
            <p className="text-gray-400 text-base">
              Sorry, no song information found!
            </p>
          )}
        </div>
      </div>

     
      <RelatedSongs
        data={transformedRelatedSongs}          // Array of related song recommendations
        artistId={artistId}                     // Current song's artist identifier
        isPlaying={isPlaying}                   // Global playback state
        activeSong={activeSong}                 // Currently active song
        handlePauseClick={handlePauseClick}     // Pause control handler
        handlePlayClick={handlePlayClick}       // Play control handler
      />
    </div>
  );
};

export default SongDetails;

/**
 * Component Behavior Notes:
 * 
 * Data Flow:
 * 1. Component mounts with song ID from URL
 * 2. Parallel API requests for song details and top charts
 * 3. Data transformation for component compatibility
 * 4. UI rendering with comprehensive song information
 * 5. User interactions trigger playback through Redux
 * 
 * Data Transformation Strategy:
 * - Normalizes iTunes API data to component-expected formats
 * - Provides fallback values for missing data
 * - Ensures consistent data structures across the application
 * - Maintains type safety while handling API variations
 * 
 * User Experience:
 * - Comprehensive song information in organized sections
 * - Contextual song recommendations for discovery
 * - Seamless playback integration
 * - Graceful handling of missing or incomplete data
 */

/**
 * API Integration Details:
 * 
 * Song Details API:
 * - Endpoint: /lookup?id={songId}
 * - Returns: Detailed song metadata from iTunes
 * - Includes: Title, artist, album, genre, duration, release date
 * 
 * Related Songs Strategy:
 * - Uses top charts as proxy for related songs
 * - iTunes API doesn't provide direct "related songs" endpoint
 * - Top charts provide contextually relevant recommendations
 * - Future: Could implement custom recommendation algorithm
 */

/**
 * Performance Considerations:
 * 
 * 1. **Parallel Data Fetching**: Song details and related songs fetched simultaneously
 * 2. **Efficient Caching**: RTK Query caches both API responses
 * 3. **Data Limiting**: Related songs limited to 10 for optimal performance
 * 4. **Lazy Loading**: Images load as needed in both sections
 * 5. **Memoized Transformations**: Data processing optimized for re-renders
 */

/**
 * Error Handling Strategy:
 * 
 * Combined Error States:
 * - Both APIs must succeed for full page rendering
 * - Single API failure shows error component
 * - Console logging for debugging and monitoring
 * - User-friendly error messages
 * 
 * Data Resilience:
 * - Fallback values for missing song data
 * - Graceful degradation for incomplete information
 * - Safe data access with optional chaining
 * - Robust key generation for React rendering
 */

/**
 * Type Safety Approach:
 * 
 * The component uses strategic 'any' typing to:
 * - Handle API data structure variations
 * - Avoid complex type mapping overhead
 * - Maintain development velocity
 * - Ensure runtime functionality
 * 
 * Future improvement: Implement proper type guards and transformers
 */

/**
 * Future Enhancements:
 * 
 * Song Information:
 * - Lyrics integration from third-party APIs
 * - Music video embeddings
 * - User reviews and ratings
 * - Song credits and contributor information
 * 
 * Related Songs:
 * - True related songs algorithm based on audio features
 * - User listening history-based recommendations
 * - Collaborative filtering recommendations
 * - Mood and context-based suggestions
 * 
 * Interactive Features:
 * - Add to playlist functionality
 * - Song sharing capabilities
 * - Song radio station generation
 * - Social features (comments, likes)
 */

/**
 * Testing Strategy:
 * 
 * Unit Tests:
 * - Data transformation logic validation
 * - Route parameter handling
 * - Playback handler functionality
 * - Error state rendering
 * 
 * Integration Tests:
 * - API service integration
 * - Redux action dispatching
 * - Component composition rendering
 * - Data flow validation
 * 
 * E2E Tests:
 * - Complete song details user journey
 * - Playback from song details page
 * - Navigation to related songs
 * - Error scenario handling
 */

/**
 * Analytics and Insights:
 * 
 * The SongDetails page provides valuable engagement data:
 * - Most viewed songs and artist pages
 * - Song-to-related-song navigation patterns
 * - Playback conversion rates from detail pages
 * - User engagement with song metadata
 * - Popular related song recommendations
 * 
 * This data can drive content recommendations and feature improvements.
 */

/**
 * SEO Considerations:
 * 
 * Song detail pages have excellent SEO potential:
 * - Unique content for each song with rich metadata
 * - Structured data for music content (Schema.org)
 * - Clean URL structure with song identifiers
 * - Internal linking to artist pages and related songs
 * - Social media meta tags for song sharing
 */
