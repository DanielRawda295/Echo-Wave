// src/types.ts

/**
 * Application Type Definitions
 * 
 * This file contains centralized TypeScript interface definitions for the application.
 * It provides type safety and consistency across components, API responses, and state management.
 * 
 * Purpose:
 * - Define core data structures used throughout the application
 * - Ensure type consistency between different data sources (iTunes API, components, state)
 * - Provide IntelliSense and compile-time error checking
 * - Document the expected shape of data objects
 * 
 * @module types
 */

/**
 * Song Interface - Core Music Track Definition
 * 
 * This interface defines the structure for song/track objects throughout the application.
 * It combines properties from multiple sources (iTunes API, component expectations, Deezer compatibility)
 * into a unified type that works across all parts of the application.
 * 
 * The interface supports:
 * - iTunes API response data
 * - Component prop expectations
 * - Redux state management
 * - Cross-compatibility between different data sources
 * 
 * @interface Song
 */
export interface Song {
  /**
   * Unique Identifier
   * 
   * Primary key for React rendering and internal tracking.
   * Used for:
   * - React key prop in lists (.map() operations)
   * - Song identification in state management
   * - Navigation routing parameters
   * 
   * @type {string}
   * @required
   */
  key: string;

  /**
   * Song Title
   * 
   * The official name of the song as displayed to users.
   * Used in:
   * - Song cards and player display
   * - Search results
   * - Page titles and headers
   * 
   * @type {string}
   * @required
   */
  title: string;

  /**
   * Artist Name(s)
   * 
   * The performing artist(s) for the song.
   * May include featured artists and collaborations.
   * Used in:
   * - Song attribution display
   * - Artist page navigation
   * - Search and filtering
   * 
   * @type {string}
   * @required
   */
  subtitle: string;

  /**
   * Image Assets
   * 
   * Optional collection of images associated with the song.
   * Supports different image types and sizes for various UI contexts.
   * 
   * @type {Object}
   * @optional
   */
  images?: {
    /**
     * Cover Art Image URL
     * 
     * Primary image representing the song, typically album art.
     * Used in:
     * - Song cards
     * - Music player
     * - Thumbnail displays
     * 
     * @type {string}
     * @optional
     */
    coverart?: string;

    /**
     * Background Image URL
     * 
     * Larger image used for background displays or detailed views.
     * Used in:
     * - Artist pages
     * - Song detail pages
     * - Full-screen displays
     * 
     * @type {string}
     * @optional
     */
    background?: string;
  };

  /**
   * Artist Information
   * 
   * Array of artist objects containing identification data.
   * Supports multiple artists for collaborations and featured performances.
   * Maintains compatibility with Deezer API structure.
   * 
   * @type {Array<{ adamid: string }>}
   * @optional
   */
  artists?: { 
    /**
     * Artist Identifier
     * 
     * Unique identifier for the artist, compatible with Deezer's ID system.
     * Used for:
     * - Artist page navigation
     * - Related artist lookups
     * - Cross-platform artist identification
     * 
     * @type {string}
     */
    adamid: string 
  }[];

  /**
   * Content Sections
   * 
   * Optional structured content blocks for song details.
   * Typically used for lyrics, credits, or additional information.
   * 
   * @type {Array<{ type: string; text: string[] }>}
   * @optional
   */
  sections?: { 
    /**
     * Section Type
     * 
     * Identifies the type of content in this section.
     * Examples: 'lyrics', 'credits', 'description'
     * 
     * @type {string}
     */
    type: string; 
    
    /**
     * Text Content
     * 
     * Array of text lines or paragraphs for the section.
     * Used for formatted content display.
     * 
     * @type {string[]}
     */
    text: string[] 
  }[];

  // iTunes API Specific Properties
  // These properties come directly from iTunes API responses
  // and are mapped to the standard Song interface in API transformers

  /**
   * iTunes Track Identifier
   * 
   * Unique numeric identifier from iTunes API.
   * Used for:
   * - Direct iTunes API lookups
   * - Song identification in iTunes catalog
   * - Fallback for key generation
   * 
   * @type {number}
   * @optional
   */
  trackId?: number;

  /**
   * iTunes Track Name
   * 
   * Official song title from iTunes API.
   * Used as fallback for title property.
   * 
   * @type {string}
   * @optional
   */
  trackName?: string;

  /**
   * iTunes Artist Name
   * 
   * Official artist name from iTunes API.
   * Used as fallback for subtitle property.
   * 
   * @type {string}
   * @optional
   */
  artistName?: string;

  /**
   * Audio Preview URL
   * 
   * Direct URL to 30-second song preview from iTunes.
   * Used for:
   * - Music playback
   * - Audio streaming
   * - Preview functionality
   * 
   * @type {string}
   * @optional
   */
  previewUrl?: string;

  /**
   * Artwork URL (100x100 pixels)
   * 
   * Standard-sized album artwork from iTunes.
   * Used as fallback for images.coverart property.
   * 
   * @type {string}
   * @optional
   */
  artworkUrl100?: string;
}

/**
 * Usage Examples:
 * 
 * @example
 * // Component props using Song type
 * interface SongCardProps {
 *   song: Song;
 *   isPlaying: boolean;
 *   onPlay: (song: Song) => void;
 * }
 * 
 * @example
 * // API response typing
 * const getSongDetails = async (id: string): Promise<Song> => {
 *   const response = await api.get(`/songs/${id}`);
 *   return response.data;
 * };
 * 
 * @example
 * // Redux state with Song type
 * interface PlayerState {
 *   activeSong?: Song;
 *   currentSongs: Song[];
 *   // ... other properties
 * }
 * 
 * @example
 * // Type guard for Song objects
 * const isSong = (obj: any): obj is Song => {
 *   return obj && typeof obj.key === 'string' && 
 *          typeof obj.title === 'string' && 
 *          typeof obj.subtitle === 'string';
 * };
 */

/**
 * Design Rationale:
 * 
 * 1. **Unified Interface**: Combines properties from multiple sources into one consistent type
 * 2. **Optional Properties**: Flexible enough to handle partial data from different APIs
 * 3. **Backward Compatibility**: Maintains support for existing component expectations
 * 4. **Future Proof**: Structure allows for easy extension with new properties
 * 5. **Documentation**: Each property includes detailed usage context
 */

/**
 * Data Flow Integration:
 * 
 * iTunes API Response → API Transformer → Song Interface → Components
 * 
 * @example
 * // API transformation from iTunes to Song
 * const transformITunesTrack = (track: any): Song => ({
 *   key: track.trackId?.toString() || '',
 *   title: track.trackName || '',
 *   subtitle: track.artistName || '',
 *   images: {
 *     coverart: track.artworkUrl100,
 *     background: track.artworkUrl100,
 *   },
 *   artists: track.artistId ? [{ adamid: track.artistId.toString() }] : undefined,
 *   // iTunes specific properties preserved
 *   trackId: track.trackId,
 *   trackName: track.trackName,
 *   artistName: track.artistName,
 *   previewUrl: track.previewUrl,
 *   artworkUrl100: track.artworkUrl100,
 * });
 */

/**
 * Future Enhancements:
 * 
 * Additional properties that could be added:
 * 
 * @example
 * export interface EnhancedSong extends Song {
 *   duration?: number;           // Song duration in seconds
 *   album?: string;              // Album name
 *   releaseDate?: string;        // ISO release date
 *   genre?: string;              // Primary genre
 *   popularity?: number;         // Popularity score (0-100)
 *   explicit?: boolean;          // Explicit content flag
 *   previewStart?: number;       // Preview start time in seconds
 *   previewDuration?: number;    // Preview duration in seconds
 * }
 */

/**
 * Type Safety Benefits:
 * 
 * 1. **Compile-time Errors**: Catch property mismatches before runtime
 * 2. **IntelliSense**: IDE autocomplete for Song properties
 * 3. **Refactoring Safety**: Easy to update properties across entire codebase
 * 4. **Documentation**: Self-documenting code with property descriptions
 * 5. **Team Consistency**: Ensures all developers use the same data structure
 */