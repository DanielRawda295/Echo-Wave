// src/components/TopPlay.tsx

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PlayPause from './PlayPause';
import { playPause, setActiveSong } from '../redux/features/playerSlice';
import { useGetTopChartsQuery } from '../redux/services/MusicApi';

/** Artist object type */
type Artist = {
  adamid?: string;
};

/** Song image types */
type SongImages = {
  coverart?: string;
  background?: string;
};

/** Song object type */
export type Song = {
  key?: string;
  title?: string;
  subtitle?: string;
  images?: SongImages;
  artists?: Artist[];
  [key: string]: any;
};

/** Props for TopChartCard */
type TopChartCardProps = {
  song: Song;
  i: number;
  isPlaying: boolean;
  activeSong?: Song;
  handlePauseClick: () => void;
  handlePlayClick: () => void;
};

/** Single song card for TopPlay list */
const TopChartCard: React.FC<TopChartCardProps> = ({
  song,
  i,
  isPlaying,
  activeSong,
  handlePauseClick,
  handlePlayClick,
}) => (
  <div
    className={`w-full flex flex-row items-center hover:bg-[#4c426e] ${
      activeSong?.title === song?.title ? 'bg-[#4c426e]' : 'bg-transparent'
    } py-2 p-4 rounded-lg cursor-pointer mb-2`}
  >
    <h3 className="font-bold text-base text-white mr-3">{i + 1}.</h3>
    <div className="flex-1 flex flex-row justify-between items-center">
      <img
        className="h-14 w-14 sm:h-20 sm:w-20 rounded-lg"
        src={song?.images?.coverart || song?.artworkUrl100 || ''}
        alt={song?.title || 'No Title'}
      />
      <div className="min-w-0 flex-1 flex flex-col justify-center mx-3">
        <Link to={`/songs/${song.key || song.trackId}`}>
          <p className="truncate text-base sm:text-xl font-bold text-white">
            {song?.title || song?.trackName || 'Unknown Song'}
          </p>
        </Link>
        <Link to={`/artists/${song?.artists?.[0]?.adamid || song?.artistId || ''}`}>
          <p className="truncate text-sm sm:text-base text-gray-300 mt-1">
            {song?.subtitle || song?.artistName || 'Unknown Artist'}
          </p>
        </Link>
      </div>
    </div>
    <PlayPause
      isPlaying={isPlaying}
      activeSong={activeSong}
      song={song}
      handlePause={handlePauseClick}
      handlePlay={handlePlayClick}
    />
  </div>
);

/** TopPlay Component */
const TopPlay: React.FC = () => {
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state: any) => state.player);
  const { data } = useGetTopChartsQuery();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const topPlays = data?.slice(0, 5) || [];

  /** Pause playback */
  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  /** Play selected song */
  const handlePlayClick = (song: Song, i: number) => {
    dispatch(setActiveSong({ song, data, i }));
    dispatch(playPause(true));
  };

  return (
    <div
      ref={divRef}
      className="xl:ml-6 ml-0 xl:mb-0 mb-6 flex-1 xl:max-w-[500px] max-w-full flex flex-col"
    >
      {/* Top Charts Section */}
      <div className="w-full flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-white font-bold text-2xl">Top Charts</h2>
          <Link to="/top-charts">
            <p className="text-gray-300 text-base cursor-pointer">See more</p>
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {topPlays.map((song, i) => (
            <TopChartCard
              key={song.key || song.trackId || i}
              song={song}
              i={i}
              isPlaying={isPlaying}
              activeSong={activeSong}
              handlePauseClick={handlePauseClick}
              handlePlayClick={() => handlePlayClick(song, i)}
            />
          ))}
        </div>
      </div>

      {/* Top Artists Section */}
      <div className="w-full flex flex-col mt-8">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-white font-bold text-2xl">Top Artists</h2>
          <Link to="/top-artists">
            <p className="text-gray-300 text-base cursor-pointer">See more</p>
          </Link>
        </div>

        <div className="flex flex-row gap-4 mt-4 overflow-x-auto">
          {topPlays.slice(0, 6).map((song, i) => {
            const artistId = song.artists?.[0]?.adamid;
            const background = song.images?.background || song.artworkUrl100 || song.images?.coverart;

            return (
              <div
                key={song.key || song.trackId || i}
                className="shrink-0 w-20 h-20 shadow-lg rounded-full animate-slideright"
              >
                <Link to={`/artists/${artistId}`}>
                  <img
                    src={background}
                    alt={song.title || 'Artist'}
                    className="rounded-full w-full h-full object-cover"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopPlay;
