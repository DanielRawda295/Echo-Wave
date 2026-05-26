// src/components/SongBar.tsx
/* eslint-disable no-nested-ternary */

import React from 'react';
import { Link } from 'react-router-dom';
import PlayPause from './PlayPause';

/**
 * Attributes for a song from API or database
 */
type SongAttributes = {
  /** Song name */
  name?: string;

  /** Artwork object with optional URL */
  artwork?: { url?: string };

  /** Album name */
  albumName?: string;
};

/** Song image properties */
type SongImages = {
  coverart?: string;
};

/** Song type representing a single track */
type Song = {
  key?: string;
  title?: string;
  subtitle?: string;
  attributes?: SongAttributes;
  images?: SongImages;
  [key: string]: any; // for other dynamic properties
};

/** Props for SongBar component */
type SongBarProps = {
  /** Song data to render */
  song: Song;

  /** Index in the song list */
  i: number;

  /** Optional artist ID for conditional rendering */
  artistId?: string;

  /** Whether the song is currently playing */
  isPlaying: boolean;

  /** The active song being played */
  activeSong?: Song;

  /** Callback to pause playback */
  handlePauseClick: () => void;

  /** Callback to play a specific song */
  handlePlayClick: (song: Song, i: number) => void;
};

/**
 * SongBar Component
 *
 * Renders a single song entry in a list with:
 * - Index number
 * - Song artwork
 * - Title and subtitle (or album name)
 * - Play/Pause button (if not in artist view)
 * - Highlighting if the song is currently active
 */
const SongBar: React.FC<SongBarProps> = ({
  song,
  i,
  artistId,
  isPlaying,
  activeSong,
  handlePauseClick,
  handlePlayClick,
}) => (
  <div
    className={`w-full flex flex-row items-center hover:bg-[#4c426e] ${
      activeSong?.title === song?.title ? 'bg-[#4c426e]' : 'bg-transparent'
    } py-2 p-4 rounded-lg cursor-pointer mb-2`}
    onClick={
      artistId
        ? () => {
            handlePlayClick(song, i);
          }
        : undefined
    }
  >
    {/** Song index */}
    <h3 className="font-bold text-base text-white mr-3">{i + 1}.</h3>

    {/** Artwork and song details */}
    <div className="flex-1 flex flex-row justify-between items-center">
      <img
        className="w-20 h-20 rounded-lg"
        src={
          artistId
            ? song?.attributes?.artwork?.url?.replace('{w}', '125').replace('{h}', '125')
            : song?.images?.coverart
        }
        alt={song?.title}
      />

      <div className="flex-1 flex flex-col justify-center mx-3">
        {/** Song title with link if not artist view */}
        {!artistId ? (
          <Link to={`/songs/${song.key}`}>
            <p className="text-xl font-bold text-white">{song?.title}</p>
          </Link>
        ) : (
          <p className="text-xl font-bold text-white">{song?.attributes?.name || song?.title}</p>
        )}

        {/** Song subtitle or album name */}
        <p className="text-base text-gray-300 mt-1">
          {artistId ? song?.attributes?.albumName : song?.subtitle}
        </p>
      </div>
    </div>

    <PlayPause
      isPlaying={isPlaying}
      activeSong={activeSong}
      song={song}
      handlePause={handlePauseClick}
      handlePlay={() => handlePlayClick(song, i)}
    />
  </div>
);

export default SongBar;
