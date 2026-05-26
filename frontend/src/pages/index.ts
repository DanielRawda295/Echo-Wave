// src/pages/index.ts

/**
 * Pages Module Barrel Export
 * 
 * This file serves as a central export hub for all page components in the application.
 * Using barrel exports provides a clean, organized way to import pages throughout the application
 * while maintaining a single source of truth for page component availability.
 * 
 * Purpose:
 * - Simplify imports across the application
 * - Provide a centralized registry of all available pages
 * - Enable easy maintenance and refactoring of page components
 * - Support tree-shaking by allowing selective imports
 * 
 * @module pages
 */

/**
 * Page Component Imports
 * 
 * Each import brings in a specific page component that represents
 * a major route or feature area within the EchoWave application.
 */

/**
 * Discover Page
 * 
 * Main music discovery hub featuring genre-based music exploration
 * and dynamic genre filtering capabilities.
 */
import Discover from './Discover';

/**
 * TopArtists Page
 * 
 * Displays the most popular artists based on current charts and trends.
 * Provides navigation to individual artist detail pages.
 */
import TopArtists from './TopArtists';

/**
 * ArtistDetails Page
 * 
 * Comprehensive artist profile page showing artist information,
 * top songs, and metadata with integrated music playback.
 */
import ArtistDetails from './ArtistDetails';

/**
 * SongDetails Page
 * 
 * Detailed song information page featuring song metadata,
 * lyrics (if available), and related song recommendations.
 */
import SongDetails from './SongDetails';

/**
 * Search Page
 * 
 * Global search interface for finding songs, artists, and albums
 * across the entire music catalog with real-time results.
 */
import Search from './Search';

/**
 * TopCharts Page
 * 
 * Displays current popular songs and trending music charts
 * from various categories and time periods.
 */
import TopCharts from './TopCharts';

/**
 * AroundYou Page
 * 
 * Location-based music discovery page that shows popular songs
 * trending in the user's geographic region using IP geolocation.
 */
import AroundYou from './AroundYou';
import Favorites from './Favorites';
import Account from './Account';
import Playlists from './Playlists';
import PlaylistDetails from './PlaylistDetails';
import RecentlyPlayed from './RecentlyPlayed';
import UploadSong from './UploadSong';
import Community from './Community';
import MyUploads from './MyUploads';

/**
 * Barrel Exports
 * 
 * Exports all page components as named exports for convenient
 * import throughout the application. This pattern enables:
 * 
 * - Clean import statements: import { Discover, Search } from '../pages'
 * - IDE autocomplete support for available pages
 * - Easy refactoring without updating multiple import statements
 * - Clear visibility of all available page components
 */
export {
  Discover,        // Music discovery with genre filtering
  Search,          // Global search functionality
  TopArtists,      // Popular artists listing
  ArtistDetails,   // Individual artist profiles
  SongDetails,     // Detailed song information
  TopCharts,       // Popular music charts
  AroundYou,       // Location-based music discovery
  Favorites,       // Liked songs stored locally
  Account,         // User account settings
  Playlists,       // User-created playlists
  PlaylistDetails, // Single playlist view
  RecentlyPlayed,  // Listening history
  UploadSong,      // Publish a song
  Community,       // Browse user uploads
  MyUploads,       // Creator management
};

/**
 * Usage Examples:
 * 
 * @example
 * // In App.tsx routing configuration
 * import {
 *   Discover,
 *   Search,
 *   TopArtists,
 *   ArtistDetails,
 *   SongDetails,
 *   TopCharts,
 *   AroundYou,
 * } from './pages';
 * 
 * @example
 * // Selective imports for better tree-shaking
 * import { Discover, Search } from './pages';
 * 
 * @example
 * // In component files that need specific pages
 * import { ArtistDetails, SongDetails } from '../pages';
 */

/**
 * Architecture Benefits:
 * 
 * 1. **Maintainability**: All page imports managed in one location
 * 2. **Consistency**: Uniform import patterns across the application
 * 3. **Refactoring Safety**: Component renaming only affects this file
 * 4. **Documentation**: Centralized documentation for all pages
 * 5. **Team Collaboration**: Clear visibility of available components
 */

/**
 * Page Component Categories:
 * 
 * Discovery & Exploration:
 * - Discover: Genre-based music discovery
 * - AroundYou: Location-based discovery
 * - TopCharts: Popular music trends
 * 
 * Search & Navigation:
 * - Search: Global music search
 * - TopArtists: Artist discovery
 * 
 * Detail Views:
 * - ArtistDetails: Comprehensive artist profiles
 * - SongDetails: Detailed song information
 */

/**
 * Routing Integration:
 * 
 * These page components are integrated with React Router in App.tsx:
 * 
 * @example
 * // App.tsx routing configuration
 * <Routes>
 *   <Route path="/" element={<Discover />} />
 *   <Route path="/search/:searchTerm" element={<Search />} />
 *   <Route path="/top-artists" element={<TopArtists />} />
 *   <Route path="/artists/:id" element={<ArtistDetails />} />
 *   <Route path="/songs/:songid" element={<SongDetails />} />
 *   <Route path="/top-charts" element={<TopCharts />} />
 *   <Route path="/around-you" element={<AroundYou />} />
 * </Routes>
 */

/**
 * Future Page Additions:
 * 
 * Additional pages that could be added to this export:
 * 
 * @example
 * // User profile and social features
 * import UserProfile from './UserProfile';
 * import PlaylistDetails from './PlaylistDetails';
 * import SocialFeed from './SocialFeed';
 * 
 * // Enhanced discovery features
 * import NewReleases from './NewReleases';
 * import MoodRadio from './MoodRadio';
 * import GenreDetails from './GenreDetails';
 * 
 * // Utility and settings pages
 * import Settings from './Settings';
 * import Notifications from './Notifications';
 */

/**
 * Type Safety:
 * 
 * Each exported component is a properly typed React Functional Component
 * with consistent prop patterns and TypeScript support throughout.
 * 
 * @example
 * // Type definition for page components
 * interface PageComponent extends React.FC {
 *   // Common props pattern across pages
 * }
 */

/**
 * Testing Strategy:
 * 
 * This barrel export file itself doesn't require testing, but enables:
 * - Easy mocking of page components in tests
 * - Clean import patterns in test files
 * - Simplified test setup and teardown
 * - Consistent component access across test suites
 */

/**
 * Build Optimization:
 * 
 * The barrel export pattern works well with modern bundlers:
 * - Webpack: Supports tree-shaking for unused exports
 * - Vite: Efficient code splitting and lazy loading
 * - Rollup: Optimal bundle size through export analysis
 * 
 * This ensures that only the actually used page components are included
 * in the final production bundle.
 */
