// src/components/RelatedSongs.tsx

import React from 'react';
import SongBar from './SongBar';

/**
 * Represents a song object.
 */
type Song = {
  /** Unique song key */
  key?: string;

  /** Song title */
  title?: string;

  /** Song subtitle or artist name */
  subtitle?: string;

  /** Song cover images */
  images?: {
    coverart?: string;
  };

  /** Associated artists */
  artists?: {
    adamid?: string;
  }[];

  /** Any other dynamic properties */
  [key: string]: any;
};

/**
 * Props for the RelatedSongs component.
 */
type RelatedSongsProps = {
  /** Array of related songs */
  data?: Song[];

  /** Optional artist ID for context */
  artistId?: string;

  /** Playback state */
  isPlaying: boolean;

  /** Currently active song */
  activeSong?: Song;

  /** Callback for pause action */
  handlePauseClick: () => void;

  /** Callback for play action */
  handlePlayClick: (song: Song, i: number) => void;
};

/**
 * 🎶 RelatedSongs Component
 *
 * Displays a list of songs related to the current song or artist.
 * Features:
 * - Title indicating related songs
 * - Iterates through song data and renders SongBar components
 * - Handles play and pause functionality for each song
 * - Uses stable keys combining artistId, song key, and index
 *
 * @component
 * @param {RelatedSongsProps} props - Component props
 * @returns {JSX.Element} List of related songs with interactive playback
 */
const RelatedSongs: React.FC<RelatedSongsProps> = ({
  data,
  artistId,
  isPlaying,
  activeSong,
  handlePauseClick,
  handlePlayClick,
}) => (
  <div className="flex flex-col">
    {/** Section title */}
    <h1 className="font-bold text-3xl text-white">Related Songs:</h1>

    {/** List of related songs */}
    <div className="mt-6 w-full flex flex-col">
      {data?.map((song, i) => (
        <SongBar
          key={`${artistId}-${song.key}-${i}`} // Stable unique key
          song={song}
          i={i}
          artistId={artistId}
          isPlaying={isPlaying}
          activeSong={activeSong}
          handlePauseClick={handlePauseClick}
          handlePlayClick={() => handlePlayClick(song, i)}
        />
      ))}
    </div>
  </div>
);

export default RelatedSongs;
