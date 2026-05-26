// src/components/index.ts

/**
 * 📦 Components Barrel File
 *
 * Centralized export file for all UI components.
 * Allows importing components from a single source rather than individual paths.
 *
 * Example usage:
 * ```ts
 * import { Sidebar, SongCard, Loader } from './components';
 * ```
 *
 * Exports:
 * - TopPlay
 * - Sidebar
 * - SongCard
 * - Searchbar
 * - ArtistCard
 * - DetailsHeader
 * - SongBar
 * - RelatedSongs
 * - MusicPlayer
 * - Loader
 * - Error
 *
 * Also exports types for potential TypeScript usage elsewhere.
 */

import Sidebar from './Sidebar';
import Searchbar from './Searchbar';
import SongCard from './SongCard';
import TopPlay from './TopPlay';
import ArtistCard from './ArtistCard';
import DetailsHeader from './DetailsHeader';
import SongBar from './SongBar';
import RelatedSongs from './RelatedSongs';
import MusicPlayer from './MusicPlayer';
import Loader from './Loader';
import Error from './Error';
import AddToPlaylist from './AddToPlaylist';
import Toasts from './Toasts';

export {
  TopPlay,
  Sidebar,
  SongCard,
  Searchbar,
  ArtistCard,
  DetailsHeader,
  SongBar,
  RelatedSongs,
  MusicPlayer,
  Loader,
  Error,
  AddToPlaylist,
  Toasts,
};

export type {
  /** Type for Sidebar component */
  Sidebar as SidebarType,

  /** Type for Searchbar component */
  Searchbar as SearchbarType,

  /** Type for SongCard component */
  SongCard as SongCardType,

  /** Type for TopPlay component */
  TopPlay as TopPlayType,

  /** Type for ArtistCard component */
  ArtistCard as ArtistCardType,

  /** Type for DetailsHeader component */
  DetailsHeader as DetailsHeaderType,

  /** Type for SongBar component */
  SongBar as SongBarType,

  /** Type for RelatedSongs component */
  RelatedSongs as RelatedSongsType,

  /** Type for MusicPlayer component */
  MusicPlayer as MusicPlayerType,

  /** Type for Loader component */
  Loader as LoaderType,

  /** Type for Error component */
  Error as ErrorType,

  /** Type for AddToPlaylist component */
  AddToPlaylist as AddToPlaylistType,

  /** Type for Toasts component */
  Toasts as ToastsType,
};
