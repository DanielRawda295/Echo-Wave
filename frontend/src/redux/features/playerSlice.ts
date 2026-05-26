// src/redux/features/playerSlice.ts

/**
 * Redux Player Slice - Music Player State Management
 * 
 * This slice manages the global state for the music player functionality.
 * It handles song playback, queue management, and player controls across
 * the entire application.
 * 
 * Features Managed:
 * - Current playing song and playback state
 * - Song queue and navigation
 * - Play/pause controls
 * - Genre selection for music discovery
 * 
 * @module playerSlice
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Track Type Definition
 * 
 * Represents a music track with optional properties for compatibility
 * with different API response structures (Deezer, iTunes, etc.)
 */
type Track = {
  title?: string;                    // Song title
  subtitle?: string;                 // Artist name(s)
  images?: {
    coverart?: string;              // Album/song cover image URL
    background?: string;            // Background image URL
  };
  artists?: { adamid?: string }[];  // Array of artist IDs
  hub?: { actions?: { uri?: string }[] }; // Deezer-specific audio source
  [key: string]: any;               // Flexible property for API variations
};

/**
 * Player State Interface
 * 
 * Defines the structure of the music player's global state
 */
type PlayerState = {
  currentSongs: Track[];    // Array of tracks in current playlist/queue
  currentIndex: number;     // Index of currently playing song in currentSongs
  isActive: boolean;        // Whether player is active (has a song loaded)
  isPlaying: boolean;       // Whether audio is currently playing
  activeSong?: Track;       // Currently selected/playing track
  genreListId: string;      // Currently selected genre for discovery
};

/**
 * Initial Player State
 * 
 * Default values when the application starts or when no music is playing
 */
const initialState: PlayerState = {
  currentSongs: [],         // Empty song queue
  currentIndex: 0,          // Start at first song
  isActive: false,          // Player not active initially
  isPlaying: false,         // Audio not playing initially
  activeSong: undefined,    // No song selected
  genreListId: '',          // No genre selected
};

/**
 * Player Slice Creation
 * 
 * Defines reducers for managing music player state changes
 */
const playerSlice = createSlice({
  name: 'player',          // Slice name used in Redux DevTools
  initialState,            // Initial state defined above
  reducers: {
    /**
     * setActiveSong - Set the currently active song and initialize queue
     * 
     * This is the primary action for starting playback. It handles different
     * data structures from various API responses and normalizes them.
     * 
     * @param state - Current player state
     * @param action - Payload containing song data, track list, and index
     * @param action.payload.song - The track to set as active
     * @param action.payload.data - The source data containing track list
     * @param action.payload.i - Index of the song in the track list
     */
    setActiveSong: (
      state,
      action: PayloadAction<{ song: Track; data: any; i: number }>
    ) => {
      // Set the active song from payload
      state.activeSong = action.payload.song;

      // Handle different API response structures for track list
      if (action.payload?.data?.tracks?.hits) {
        // Deezer API structure: data.tracks.hits[].track
        state.currentSongs = action.payload.data.tracks.hits;
      } else if (action.payload?.data?.properties) {
        // Alternative API structure: data.tracks[]
        state.currentSongs = action.payload?.data?.tracks;
      } else {
        // Direct array structure or iTunes API: data[]
        state.currentSongs = action.payload.data;
      }

      // Set current index and activate player
      state.currentIndex = action.payload.i;
      state.isActive = true;
    },

    /**
     * nextSong - Navigate to the next song in the queue
     * 
     * Handles different track structures and updates the active song
     * 
     * @param state - Current player state
     * @param action - Payload containing the next song index
     */
    nextSong: (state, action: PayloadAction<number>) => {
      // Handle different track object structures
      if (state.currentSongs[action.payload]?.track) {
        // Nested track structure (Deezer): songs[].track
        state.activeSong = state.currentSongs[action.payload]?.track;
      } else {
        // Direct track structure (iTunes): songs[]
        state.activeSong = state.currentSongs[action.payload];
      }

      // Update index and ensure player is active
      state.currentIndex = action.payload;
      state.isActive = true;
    },

    /**
     * prevSong - Navigate to the previous song in the queue
     * 
     * Similar to nextSong but for previous navigation
     * 
     * @param state - Current player state
     * @param action - Payload containing the previous song index
     */
    prevSong: (state, action: PayloadAction<number>) => {
      // Handle different track object structures
      if (state.currentSongs[action.payload]?.track) {
        // Nested track structure (Deezer)
        state.activeSong = state.currentSongs[action.payload]?.track;
      } else {
        // Direct track structure (iTunes)
        state.activeSong = state.currentSongs[action.payload];
      }

      // Update index and ensure player is active
      state.currentIndex = action.payload;
      state.isActive = true;
    },

    /**
     * playPause - Toggle play/pause state
     * 
     * Simple reducer to control playback state without changing current song
     * 
     * @param state - Current player state
     * @param action - Payload containing boolean play state
     */
    playPause: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },

    /**
     * selectGenreListId - Set the currently selected genre
     * 
     * Used for genre-based music discovery and filtering
     * 
     * @param state - Current player state
     * @param action - Payload containing genre ID string
     */
    selectGenreListId: (state, action: PayloadAction<string>) => {
      state.genreListId = action.payload;
    },
  },
});

/**
 * Action Export
 * 
 * These actions can be dispatched from any component to control the player
 */
export const { 
  setActiveSong,     // Start playing a new song
  nextSong,          // Skip to next song
  prevSong,          // Go to previous song  
  playPause,         // Toggle play/pause
  selectGenreListId  // Change genre filter
} = playerSlice.actions;

/**
 * Reducer Export
 * 
 * The slice reducer is combined in the main store configuration
 */
export default playerSlice.reducer;