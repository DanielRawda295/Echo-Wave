// src/components/SongCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import PlayPause from './PlayPause';
import { playPause, setActiveSong } from '../redux/features/playerSlice';
import { useFavorites } from '../hooks/useFavorites';
import AddToPlaylist from './AddToPlaylist';
import { useToasts } from '../hooks/useToasts';

/** Artist object with optional ID */
type Artist = {
  adamid?: string;
};

/** Song image object */
type SongImages = {
  coverart?: string;
};

/** Song object representing a track */
type Song = {
  key?: string;
  title?: string;
  subtitle?: string;
  images?: SongImages;
  artists?: Artist[];
  previewUrl?: string; // Audio preview URL
  [key: string]: any; // For other dynamic properties
};

/** Props for the SongCard component */
type SongCardProps = {
  /** Song to display */
  song: Song;

  /** Whether a song is currently playing */
  isPlaying: boolean;

  /** Currently active song */
  activeSong?: Song;

  /** List of songs for context */
  data: Song[];

  /** Index of the song in the list */
  i: number;
};

/**
 * SongCard Component
 *
 * Renders a single song card with:
 * - Cover art
 * - Play/Pause overlay button
 * - Song title and link
 * - Artist name and link
 * - Handles play and pause dispatch to Redux store
 */
const SongCard: React.FC<SongCardProps> = ({ song, isPlaying, activeSong, data, i }) => {
  const dispatch = useDispatch();
  const isFavorite = useFavorites((s) => s.isFavorite(song, i));
  const toggleFavorite = useFavorites((s) => s.toggleFavorite);
  const toast = useToasts((s) => s.push);

  /** Pause current song */
  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  /** Play selected song */
  const handlePlayClick = () => {
    const playableSong = {
      ...song,
      key: song.key || `${song.trackId || i}`,
      previewUrl: song.previewUrl || '', // Use iTunes previewUrl if available
    };

    dispatch(setActiveSong({ song: playableSong, data, i }));
    dispatch(playPause(true));
  };

  return (
    <div className="flex w-full max-w-[280px] flex-col p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer">
      {/** Song cover art with Play/Pause overlay */}
      <div className="relative w-full aspect-square group">
        <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
          <AddToPlaylist song={song} index={i} />
          <button
            type="button"
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full',
              'bg-black/50 text-white backdrop-blur hover:bg-black/70',
            ].join(' ')}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(song, i);
              toast(isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaHeart className="text-pink-400" /> : <FaRegHeart />}
          </button>
        </div>
        <div
          className={`absolute inset-0 justify-center items-center bg-black bg-opacity-50 group-hover:flex ${
            activeSong?.title === song.title ? 'flex bg-black bg-opacity-70' : 'hidden'
          }`}
        >
          <PlayPause
            isPlaying={isPlaying}
            activeSong={activeSong}
            song={song}
            handlePause={handlePauseClick}
            handlePlay={handlePlayClick}
          />
        </div>
        <img 
          alt="song_img" 
          src={song.images?.coverart || song.artworkUrl100} 
          className="h-full w-full rounded-lg object-cover" 
        />
      </div>

      {/** Song title and artist links */}
      <div className="mt-4 flex flex-col">
        <p className="font-semibold text-lg text-white truncate">
          <Link to={`/songs/${song.key || song.trackId}`}>
            {song.title || song.trackName}
          </Link>
        </p>
        <p className="text-sm truncate text-gray-300 mt-1">
          <Link to={song.artists ? `/artists/${song.artists[0]?.adamid || song.artistId}` : '/top-artists'}>
            {song.subtitle || song.artistName}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SongCard;
