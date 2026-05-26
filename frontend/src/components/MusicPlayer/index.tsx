import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { nextSong, prevSong, playPause, setActiveSong } from '../../redux/features/playerSlice';
import Controls from './Controls';
import Player from './Player';
import Seekbar from './Seekbar';
import Track from './Track';
import VolumeBar from './VolumeBar';
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed';
import api from '../../utils/api';

type RootState = {
  player: {
    activeSong?: any;
    currentSongs: any[];
    currentIndex: number;
    isActive: boolean;
    isPlaying: boolean;
  };
};

const MusicPlayer: React.FC = () => {
  const { activeSong, currentSongs, currentIndex, isActive, isPlaying } = useSelector(
    (state: RootState) => state.player
  );
  const addRecentlyPlayed = useRecentlyPlayed((s) => s.add);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [appTime, setAppTime] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentSongs.length) dispatch(playPause(true));
  }, [currentIndex]);

  useEffect(() => {
    if (!isActive || !activeSong) return;
    addRecentlyPlayed(activeSong);
  }, [activeSong, isActive, addRecentlyPlayed]);

  useEffect(() => {
    const trackId = (activeSong as any)?._trackId;
    if (!isActive || !trackId) return;
    api.get(`/tracks/${trackId}/stream`).catch(() => {});
  }, [activeSong, isActive]);

  const queueItems = useMemo(() => {
    const items = (currentSongs || []).map((s: any) => (s?.track ? s.track : s));
    return items;
  }, [currentSongs]);

  const handlePlayPause = () => {
    if (!isActive) return;
    dispatch(playPause(!isPlaying));
  };

  const handleNextSong = () => {
    dispatch(playPause(false));
    if (!shuffle) {
      dispatch(nextSong((currentIndex + 1) % currentSongs.length));
    } else {
      dispatch(nextSong(Math.floor(Math.random() * currentSongs.length)));
    }
  };

  const handlePrevSong = () => {
    if (currentIndex === 0) {
      dispatch(prevSong(currentSongs.length - 1));
    } else if (shuffle) {
      dispatch(prevSong(Math.floor(Math.random() * currentSongs.length)));
    } else {
      dispatch(prevSong(currentIndex - 1));
    }
  };

  return (
    <>
      {showQueue && (
        <div className="fixed inset-0 z-55 bg-black/50" onClick={() => setShowQueue(false)}>
          <div
            className="absolute bottom-20 right-4 w-[380px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 bg-[#0b0b18]/95 p-4 text-white shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Up next</div>
                <div className="text-xs text-white/70">
                  {queueItems.length ? `${queueItems.length} in queue` : 'No queue'}
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                onClick={() => setShowQueue(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-3 max-h-[360px] overflow-y-auto">
              {queueItems.map((song: any, idx: number) => {
                const isNow = idx === currentIndex;
                return (
                  <button
                    key={song?.key || song?.trackId || `${idx}`}
                    type="button"
                    className={[
                      'w-full rounded-xl p-2 text-left hover:bg-white/10',
                      isNow ? 'bg-white/10' : 'bg-transparent',
                    ].join(' ')}
                    onClick={() => {
                      dispatch(setActiveSong({ song, data: currentSongs, i: idx }));
                      dispatch(playPause(true));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-white/10">
                        {song?.images?.coverart || song?.artworkUrl100 ? (
                          <img
                            src={song?.images?.coverart || song?.artworkUrl100}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {song?.title || song?.trackName || 'Unknown title'}
                          {isNow ? <span className="ml-2 text-xs text-indigo-300">Now</span> : null}
                        </div>
                        <div className="truncate text-xs text-white/70">
                          {song?.subtitle || song?.artistName || ''}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 w-full bg-black z-50 flex items-center justify-between sm:px-12 px-8 py-2">
        <Track isPlaying={isPlaying} isActive={isActive} activeSong={activeSong} />

        <div className="flex-1 flex flex-col items-center justify-center">
          <Controls
            isPlaying={isPlaying}
            repeat={repeat}
            setRepeat={setRepeat}
            shuffle={shuffle}
            setShuffle={setShuffle}
            currentSongs={currentSongs}
            handlePlayPause={handlePlayPause}
            handlePrevSong={handlePrevSong}
            handleNextSong={handleNextSong}
            onToggleQueue={() => setShowQueue((v) => !v)}
          />

          <Seekbar
            value={appTime}
            min={0}
            max={duration}
            onInput={(event) => setSeekTime(Number(event.currentTarget.value))}
            setSeekTime={setSeekTime}
            appTime={appTime}
          />

          <Player
            activeSong={activeSong}
            volume={volume}
            isPlaying={isPlaying}
            seekTime={seekTime}
            repeat={repeat}
            onEnded={handleNextSong}
            onTimeUpdate={(event) => setAppTime(event.currentTarget.currentTime)}
            onLoadedData={(event) => setDuration(event.currentTarget.duration)}
          />
        </div>

        <VolumeBar
          value={volume}
          min={0}
          max={1}
          onChange={(event) => setVolume(Number(event.currentTarget.value))}
          setVolume={setVolume}
        />
      </div>
    </>
);

};

export default MusicPlayer;
