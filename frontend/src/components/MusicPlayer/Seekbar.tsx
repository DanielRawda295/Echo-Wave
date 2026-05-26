// src/components/MusicPlayer/Seekbar.tsx

import React from 'react';

/**
 * Props for the Seekbar component.
 */
type SeekbarProps = {
  /** The current playback position in seconds. */
  value: number;

  /** The minimum seek value (usually 0). */
  min: number;

  /** The maximum seek value (usually the duration of the song in seconds). */
  max: number;

  /** The current app time, used for skip forward/backward functionality. */
  appTime: number;

  /** Function to set the seek time when user clicks skip or drags the slider. */
  setSeekTime: (time: number) => void;

  /** Callback triggered when the user interacts with the range input. */
  onInput: (e: React.FormEvent<HTMLInputElement>) => void;
};

/**
 * 🎚️ Seekbar Component
 * 
 * This component provides a horizontal seek bar for audio playback control.
 * It displays the current time, total duration, and allows skipping forward/backward.
 * 
 * Features:
 * - Displays elapsed time (`value`) and total time (`max`) in MM:SS format
 * - Allows user to drag the range input to seek
 * - Includes ±5 second skip buttons (visible on large screens)
 */
const Seekbar: React.FC<SeekbarProps> = ({
  value,
  min,
  max,
  onInput,
  setSeekTime,
  appTime,
}) => {
  /**
   * Converts a time in seconds to a `MM:SS` format.
   * Example: 125 → "2:05"
   */
  const getTime = (time: number) =>
    `${Math.floor(time / 60)}:${(`0${Math.floor(time % 60)}`).slice(-2)}`;

  return (
    <div className="hidden sm:flex flex-row items-center">
      {/* Skip backward 5 seconds */}
      <button
        type="button"
        onClick={() => setSeekTime(appTime - 5)}
        className="hidden lg:mr-4 lg:block text-white"
      >
        -
      </button>

      {/* Display current playback time */}
      <p className="text-white">{value === 0 ? '0:00' : getTime(value)}</p>

      {/* Range slider for seeking through the track */}
      <input
        type="range"
        step={1}
        value={value}
        min={min}
        max={max}
        onInput={onInput}
        className="md:block w-24 md:w-56 2xl:w-96 h-1 mx-4 2xl:mx-6 rounded-lg"
      />

      {/* Display total track duration */}
      <p className="text-white">{max === 0 ? '0:00' : getTime(max)}</p>

      {/* Skip forward 5 seconds */}
      <button
        type="button"
        onClick={() => setSeekTime(appTime + 5)}
        className="hidden lg:ml-4 lg:block text-white"
      >
        +
      </button>
    </div>
  );
};

export default Seekbar;
