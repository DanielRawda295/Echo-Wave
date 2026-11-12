// src/components/MusicPlayer/Track.tsx

import React from 'react';

/**
 * Represents the structure of a song object displayed in the Track component.
 * Contains optional title, subtitle, and cover art image.
 * Additional dynamic properties may also be included.
 */
type Song = {
  /** The song title. */
  title?: string;

  /** The artist or subtitle (e.g., performer name). */
  subtitle?: string;

  /** Object containing song image URLs such as cover art. */
  images?: {
    /** URL of the cover art image. */
    coverart?: string;
  };

  /** Allows for any additional dynamic song data properties. */
  [key: string]: any;
};

/**
 * Props for the Track component.
 */
type TrackProps = {
  /** Indicates whether a song is currently playing. */
  isPlaying: boolean;

  /** Indicates whether this track is the currently active one. */
  isActive: boolean;

  /** The currently active song object, if available. */
  activeSong?: Song;
};

/**
 * 🎵 Track Component
 *
 * Displays information about the currently active song in the music player.
 * It shows:
 * - The song’s cover art (spinning when active and playing)
 * - The song title and artist/subtitle
 * - Fallback messages if no active song is selected
 *
 * Used in the music player UI to give the user visual feedback about the current track.
 */
const Track: React.FC<TrackProps> = ({ isPlaying, isActive, activeSong }) => (
  <div className="flex min-w-0 flex-1 items-center justify-start gap-3">
    {/* Cover Art Image — spins if the song is active and playing */}
    <div
      className={`${
        isPlaying && isActive ? 'animate-[spin_3s_linear_infinite]' : ''
      } h-11 w-11 shrink-0 sm:h-14 sm:w-14`}
    >
      <img
        src={activeSong?.images?.coverart}
        alt="cover art"
        className="h-full w-full rounded-lg object-cover"
      />
    </div>

    {/* Song Title and Subtitle (or fallback text if unavailable) */}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-white sm:text-base">
        {activeSong?.title ?? 'No active Song'}
      </p>
      <p className="truncate text-xs text-gray-400 sm:text-sm">
        {activeSong?.subtitle ?? 'No active Song'}
      </p>
    </div>
  </div>
);

export default Track;
