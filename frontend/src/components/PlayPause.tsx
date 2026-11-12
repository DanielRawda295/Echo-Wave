// src/components/PlayPause.tsx

import React from 'react';
import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa';

/**
 * Represents a song object.
 */
type Song = {
  /** Title of the song */
  title?: string;
};

/**
 * Props for the PlayPause component.
 */
type PlayPauseProps = {
  /** Whether a song is currently playing */
  isPlaying: boolean;

  /** Currently active song */
  activeSong?: Song;

  /** Song associated with this PlayPause button */
  song: Song;

  /** Callback to pause the song */
  handlePause: () => void;

  /** Callback to play the song */
  handlePlay: () => void;
};

/**
 * ▶️⏸ PlayPause Component
 *
 * Renders a play or pause icon depending on the current song state.
 * - Displays pause icon if the song is currently playing and active.
 * - Displays play icon otherwise.
 * - Handles click events to play or pause the song.
 *
 * @component
 * @param {PlayPauseProps} props - Component props
 * @returns {JSX.Element} Play or pause icon button
 */
const PlayPause: React.FC<PlayPauseProps> = ({
  isPlaying,
  activeSong,
  song,
  handlePause,
  handlePlay,
}) => (
  <button type="button" aria-label={`${isPlaying && activeSong?.title === song.title ? 'Pause' : 'Play'} ${song.title || 'track'}`}
    onClick={isPlaying && activeSong?.title === song.title ? handlePause : handlePlay}
    className="flex h-11 w-11 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-indigo-400">
    {isPlaying && activeSong?.title === song.title
      ? <FaPauseCircle size={35} aria-hidden="true" />
      : <FaPlayCircle size={35} aria-hidden="true" />}
  </button>
);

export default PlayPause;
