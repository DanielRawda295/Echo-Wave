// src/components/Controls.tsx

/**
 * Controls Component - Music Player Playback Controls
 *
 * This component provides interactive playback controls for the music player,
 * allowing users to manage song playback actions such as play, pause, skip,
 * repeat, and shuffle. It is a core component of the player interface, offering
 * both functionality and visual feedback for user interactions.
 *
 * Features:
 * - Play and pause functionality with dynamic icons
 * - Skip to next or previous song controls
 * - Toggleable repeat and shuffle modes
 * - Responsive layout with adaptive design
 * - Conditional rendering based on available songs
 *
 * @component
 * @param {ControlsProps} props - Props for playback controls configuration
 * @returns {JSX.Element} A set of interactive playback controls
 */

import React from 'react';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import {
  BsArrowRepeat,
  BsFillPauseFill,
  BsFillPlayFill,
  BsShuffle,
} from 'react-icons/bs';
import { FiList } from 'react-icons/fi';

/**
 * ControlsProps Type Definition
 *
 * Defines the props accepted by the Controls component for managing playback.
 * Includes state variables and callback handlers for all interactive elements.
 */
type ControlsProps = {
  /** Indicates whether a song is currently playing */
  isPlaying: boolean;

  /** Repeat mode toggle status */
  repeat: boolean;

  /** Setter function for repeat mode */
  setRepeat: React.Dispatch<React.SetStateAction<boolean>>;

  /** Shuffle mode toggle status */
  shuffle: boolean;

  /** Setter function for shuffle mode */
  setShuffle: React.Dispatch<React.SetStateAction<boolean>>;

  /** Array of currently loaded songs */
  currentSongs: any[]; // Replace `any` with your Song type if defined elsewhere

  /** Function to handle play/pause toggle */
  handlePlayPause: () => void;

  /** Function to handle switching to previous song */
  handlePrevSong: () => void;

  /** Function to handle switching to next song */
  handleNextSong: () => void;

  /** Toggle queue/up-next panel */
  onToggleQueue?: () => void;
};

/**
 * Controls Functional Component
 *
 * Renders the main playback control buttons for the music player.
 * Each button triggers a specific playback-related action
 * such as skipping, toggling playback state, or enabling modes.
 *
 * Layout is responsive and centers controls horizontally.
 *
 * @returns {JSX.Element} The rendered playback controls
 */
const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  repeat,
  setRepeat,
  shuffle,
  setShuffle,
  currentSongs,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  onToggleQueue,
}) => (
  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
    <button type="button" aria-label="Repeat" aria-pressed={repeat} onClick={() => setRepeat(prev => !prev)} className="hidden h-11 w-9 items-center justify-center rounded-lg text-white sm:inline-flex"><BsArrowRepeat size={20} color={repeat ? '#a5b4fc' : 'white'} /></button>
    <button type="button" aria-label="Previous song" disabled={!currentSongs?.length} onClick={handlePrevSong} className="flex h-11 w-10 items-center justify-center rounded-lg text-white disabled:opacity-40"><MdSkipPrevious size={28} /></button>
    <button type="button" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={handlePlayPause} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#151321]">{isPlaying ? <BsFillPauseFill size={30} /> : <BsFillPlayFill size={30} />}</button>
    <button type="button" aria-label="Next song" disabled={!currentSongs?.length} onClick={handleNextSong} className="flex h-11 w-10 items-center justify-center rounded-lg text-white disabled:opacity-40"><MdSkipNext size={28} /></button>
    <button type="button" aria-label="Shuffle" aria-pressed={shuffle} onClick={() => setShuffle(prev => !prev)} className="hidden h-11 w-9 items-center justify-center rounded-lg text-white sm:inline-flex"><BsShuffle size={18} color={shuffle ? '#a5b4fc' : 'white'} /></button>
    {onToggleQueue && <button type="button" onClick={onToggleQueue} aria-label="Up next queue" className="hidden h-11 w-9 items-center justify-center rounded-lg text-white sm:inline-flex"><FiList size={20} /></button>}
  </div>
);

export default Controls;

/**
 * Component Behavior Notes:
 *
 * Button Actions:
 * - **Repeat**: Toggles looping of the current tracklist
 * - **Previous**: Moves to the previous song if available
 * - **Play/Pause**: Toggles between playback and pause states
 * - **Next**: Advances to the next song in the tracklist
 * - **Shuffle**: Randomizes the order of song playback
 *
 * Design & Layout:
 * - Horizontally centered controls
 * - Icons dynamically change based on active state
 * - Hidden shuffle/repeat on smaller screens for cleaner layout
 *
 * Performance:
 * - Stateless presentation with functional updates for toggles
 * - Minimal re-rendering due to isolated prop-based updates
 *
 * Accessibility:
 * - Keyboard accessible (through button roles if added)
 * - High contrast icons for clear visual distinction
 *
 * Future Enhancements:
 * - Add tooltips for each control button
 * - Include keyboard shortcuts for quick control access
 * - Animate icon transitions for better feedback
 * - Introduce disabled state handling for unavailable actions
 *
 * Testing Strategy:
 * - Unit tests for toggle functions (repeat, shuffle)
 * - Integration tests for play/pause behavior
 * - Snapshot tests for responsive design consistency
 */
