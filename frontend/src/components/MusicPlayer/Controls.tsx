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
  <div className="flex items-center justify-around md:w-36 lg:w-52 2xl:w-80">
    {/**
     * Repeat Button
     *
     * Toggles the repeat mode of the player.
     * The icon color changes to red when active.
     */}
    <BsArrowRepeat
      size={20}
      color={repeat ? 'red' : 'white'}
      onClick={() => setRepeat((prev) => !prev)}
      className="hidden sm:block cursor-pointer"
    />

    {/**
     * Previous Song Button
     *
     * Allows users to navigate to the previous track.
     * Only visible when there are songs in the playlist.
     */}
    {currentSongs?.length && (
      <MdSkipPrevious
        size={30}
        color="#FFF"
        className="cursor-pointer"
        onClick={handlePrevSong}
      />
    )}

    {/**
     * Play/Pause Button
     *
     * Displays a play icon when paused and a pause icon when playing.
     * Central main control for playback state management.
     */}
    {isPlaying ? (
      <BsFillPauseFill
        size={45}
        color="#FFF"
        onClick={handlePlayPause}
        className="cursor-pointer"
      />
    ) : (
      <BsFillPlayFill
        size={45}
        color="#FFF"
        onClick={handlePlayPause}
        className="cursor-pointer"
      />
    )}

    {/**
     * Next Song Button
     *
     * Allows users to skip to the next track in the playlist.
     * Only visible when there are songs available.
     */}
    {currentSongs?.length && (
      <MdSkipNext
        size={30}
        color="#FFF"
        className="cursor-pointer"
        onClick={handleNextSong}
      />
    )}

    {/**
     * Shuffle Button
     *
     * Enables or disables shuffle playback mode.
     * The icon turns red when shuffle is active.
     */}
    <BsShuffle
      size={20}
      color={shuffle ? 'red' : 'white'}
      onClick={() => setShuffle((prev) => !prev)}
      className="hidden sm:block cursor-pointer"
    />

    {onToggleQueue && (
      <button
        type="button"
        className="hidden sm:inline-flex items-center justify-center rounded-lg p-1 text-white/90 hover:bg-white/10"
        onClick={onToggleQueue}
        aria-label="Up next queue"
        title="Up next"
      >
        <FiList size={20} />
      </button>
    )}
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
