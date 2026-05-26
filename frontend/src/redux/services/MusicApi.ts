// src/redux/services/MusicApi.ts

/**
 * Music API Service - iTunes API Integration via RTK Query
 * 
 * This file defines all API endpoints for interacting with the iTunes Music API.
 * It uses Redux Toolkit Query (RTK Query) for efficient data fetching, caching,
 * and state management.
 * 
 * Features:
 * - Top charts and popular music
 * - Genre-based music discovery
 * - Country-specific music trends
 * - Song and artist search
 * - Detailed song and artist information
 * - Automatic response transformation for app compatibility
 * 
 * @module MusicApi
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Song Interface
 * 
 * Represents a music track with properties from iTunes API and
 * additional properties for compatibility with existing components.
 * This interface bridges iTunes API data with our app's component expectations.
 */
export interface Song {
  // Core iTunes API properties
  trackId: number;                    // Unique iTunes track identifier
  trackName: string;                  // Official song title
  artistName: string;                 // Performing artist name
  collectionName: string;             // Album name
  previewUrl: string;                 // 30-second audio preview URL
  artworkUrl100: string;              // 100x100 pixel album art
  artworkUrl60: string;               // 60x60 pixel album art (smaller)
  trackTimeMillis: number;            // Song duration in milliseconds
  primaryGenreName: string;           // Main music genre
  country: string;                    // Release country
  releaseDate: string;                // ISO release date string
  
  // Compatibility properties for existing components
  key?: string;                       // Unique identifier for React keys
  title?: string;                     // Alternative title property
  subtitle?: string;                  // Artist name (alternative)
  images?: {
    coverart?: string;                // Album art URL (compatibility)
    background?: string;              // Background image URL
  };
  artists?: { adamid?: string }[];    // Artist IDs array (Deezer compatibility)
  hub?: { actions?: { uri?: string }[] }; // Audio source (Deezer compatibility)
}

/**
 * Artist Interface
 * 
 * Represents artist information from iTunes API
 */
export interface Artist {
  artistId: number;                   // Unique iTunes artist identifier
  artistName: string;                 // Artist display name
  primaryGenreName: string;           // Artist's primary genre
}

/**
 * iTunes API Response Interface
 * 
 * Standard response structure from iTunes Search API
 */
export interface iTunesResponse {
  resultCount: number;                // Number of results returned
  results: any[];                     // Array of result objects (songs/artists)
}

/**
 * Music API Configuration
 * 
 * RTK Query API slice definition with endpoints for all music-related operations
 */
export const musicApi = createApi({
  reducerPath: 'musicApi',            // Redux store slice name
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://itunes.apple.com', // iTunes API base URL
  }),
  endpoints: (builder) => ({
    /**
     * Get Top Charts - Popular Music
     * 
     * Fetches currently popular songs globally from iTunes charts
     * Uses 'pop' as default search term to get trending music
     * 
     * @endpoint GET /search?term=pop&entity=musicTrack&limit=50
     * @returns {Song[]} Array of popular songs
     */
    getTopCharts: builder.query<Song[], void>({
      query: () => '/search?term=pop&entity=musicTrack&limit=50',
      transformResponse: (response: iTunesResponse) => {
        // Transform iTunes API response to match our Song interface
        return response.results.map((track: any) => ({
          ...track, // Spread original iTunes track data
          key: track.trackId?.toString(), // Convert numeric ID to string key
          title: track.trackName,         // Map trackName to title
          subtitle: track.artistName,     // Map artistName to subtitle
          images: {
            coverart: track.artworkUrl100, // Use 100x100 art as cover
            background: track.artworkUrl100, // Same image for background
          },
          artists: [{ adamid: track.artistId?.toString() }], // Create artists array
        }));
      },
    }),

    /**
     * Get Songs by Genre - Genre-based Discovery
     * 
     * Fetches songs filtered by specific music genre
     * Used for genre-based music discovery on Discover page
     * 
     * @param {string} genre - Music genre to filter by (pop, rock, jazz, etc.)
     * @endpoint GET /search?term={genre}&entity=musicTrack&limit=50
     * @returns {Song[]} Array of songs in specified genre
     */
    getSongsByGenre: builder.query<Song[], string>({
      query: (genre) => `/search?term=${genre}&entity=musicTrack&limit=50`,
      transformResponse: (response: iTunesResponse) => {
        return response.results.map((track: any) => ({
          ...track,
          key: track.trackId?.toString(),
          title: track.trackName,
          subtitle: track.artistName,
          images: {
            coverart: track.artworkUrl100,
            background: track.artworkUrl100,
          },
          artists: [{ adamid: track.artistId?.toString() }],
        }));
      },
    }),

    /**
     * Get Songs by Country - Regional Music
     * 
     * Fetches popular songs specific to a country
     * Used for "Around You" feature showing local trends
     * 
     * @param {string} countryCode - ISO country code (US, GB, FR, etc.)
     * @endpoint GET /search?term=top&country={countryCode}&entity=musicTrack&limit=50
     * @returns {Song[]} Array of popular songs in specified country
     */
    getSongsByCountry: builder.query<Song[], string>({
      query: (countryCode) => `/search?term=top&country=${countryCode}&entity=musicTrack&limit=50`,
      transformResponse: (response: iTunesResponse) => {
        return response.results.map((track: any) => ({
          ...track,
          key: track.trackId?.toString(),
          title: track.trackName,
          subtitle: track.artistName,
          images: {
            coverart: track.artworkUrl100,
            background: track.artworkUrl100,
          },
          artists: [{ adamid: track.artistId?.toString() }],
        }));
      },
    }),

    /**
     * Search Songs - Global Search
     * 
     * Searches iTunes music catalog by search term
     * Supports song titles, artist names, album names
     * 
     * @param {string} term - Search query string
     * @endpoint GET /search?term={term}&entity=musicTrack&limit=50
     * @returns {Song[]} Array of matching songs
     */
    getSearchSongs: builder.query<Song[], string>({
      query: (term) => `/search?term=${term}&entity=musicTrack&limit=50`,
      transformResponse: (response: iTunesResponse) => {
        return response.results.map((track: any) => ({
          ...track,
          key: track.trackId?.toString(),
          title: track.trackName,
          subtitle: track.artistName,
          images: {
            coverart: track.artworkUrl100,
            background: track.artworkUrl100,
          },
          artists: [{ adamid: track.artistId?.toString() }],
        }));
      },
    }),

    /**
     * Get Song Details - Individual Song Information
     * 
     * Fetches detailed information about a specific song
     * Used for Song Details page with comprehensive track info
     * 
     * @param {string} songId - iTunes track ID
     * @endpoint GET /lookup?id={songId}
     * @returns {Song} Detailed song information
     */
    getSongDetails: builder.query<Song, string>({
      query: (songId) => `/lookup?id=${songId}`,
      transformResponse: (response: iTunesResponse) => {
        const track = response.results[0]; // Lookup returns single track
        return {
          ...track,
          key: track.trackId?.toString(),
          title: track.trackName,
          subtitle: track.artistName,
          images: {
            coverart: track.artworkUrl100,
            background: track.artworkUrl100,
          },
          artists: [{ adamid: track.artistId?.toString() }],
        };
      },
    }),

    /**
     * Get Artist Details - Artist Profile and Discography
     * 
     * Fetches artist information and their top songs
     * Uses search endpoint since iTunes doesn't have dedicated artist lookup
     * Filters results to show only songs by the specified artist
     * 
     * @param {string} artistName - Artist name to search for
     * @endpoint GET /search?term={artistName}&entity=musicTrack&limit=50
     * @returns {Object} Artist data with top songs in Deezer-compatible format
     */
    getArtistDetails: builder.query<any, string>({
      query: (artistName) => `/search?term=${encodeURIComponent(artistName)}&entity=musicTrack&limit=50`,
      transformResponse: (response: iTunesResponse, _meta, artistName) => {
        const songs = response.results || [];
        
        // Handle case where no songs found for artist
        if (songs.length === 0) {
          return {
            data: [{
              attributes: {
                name: artistName,
                genreNames: ['Unknown'],
              }
            }],
            songs: []
          };
        }

        // Extract unique artists from search results
        const uniqueArtists = new Map();
        songs.forEach(song => {
          if (song.artistName && !uniqueArtists.has(song.artistName)) {
            uniqueArtists.set(song.artistName, {
              name: song.artistName,
              genre: song.primaryGenreName
            });
          }
        });

        // Use first artist found as the primary artist
        const firstArtist = Array.from(uniqueArtists.values())[0];
        // Filter songs to only include tracks by the primary artist
        const artistSongs = songs.filter(song => song.artistName === firstArtist?.name);

        // Return data in Deezer-compatible format for component consistency
        return {
          data: [{
            id: artistName,
            attributes: {
              name: firstArtist?.name || artistName,
              genreNames: [firstArtist?.genre || songs[0]?.primaryGenreName || 'Unknown'],
              artwork: {
                url: songs[0]?.artworkUrl100?.replace('100x100', '500x500') // Higher res image
              }
            },
            views: {
              'top-songs': {
                data: artistSongs.map((track: any) => ({
                  ...track,
                  key: track.trackId?.toString(),
                  title: track.trackName,
                  subtitle: track.artistName,
                  images: {
                    coverart: track.artworkUrl100,
                    background: track.artworkUrl100,
                  },
                  attributes: {
                    name: track.trackName,
                    albumName: track.collectionName,
                    artwork: {
                      url: track.artworkUrl100?.replace('100x100', '500x500')
                    }
                  }
                }))
              }
            }
          }]
        };
      },
    }),
  }),
});

/**
 * Auto-generated React Hooks
 * 
 * RTK Query automatically generates custom hooks for each endpoint
 * These hooks handle loading states, error handling, and data caching
 */
export const {
  useGetTopChartsQuery,        // Hook for top charts data
  useGetSongsByGenreQuery,     // Hook for genre-based songs
  useGetSongsByCountryQuery,   // Hook for country-specific songs
  useGetSearchSongsQuery,      // Hook for search results
  useGetSongDetailsQuery,      // Hook for individual song details
  useGetArtistDetailsQuery,    // Hook for artist information
} = musicApi;