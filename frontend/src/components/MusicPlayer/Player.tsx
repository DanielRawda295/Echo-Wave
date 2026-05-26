// src/components/MusicPlayer/Player.tsx

import React, { useRef, useEffect } from 'react';

/**
 * Represents the structure of a song object used by the Player component.
 * It can support both iTunes (`previewUrl`) and Deezer (`hub.actions`) data structures.
 */
type Song = {
  previewUrl?: string;
  hub?: {
    actions?: { uri?: string }[];
  };
};

/**
 * Props for the Player component.
 */
type PlayerProps = {
  /** The currently active song object to be played. */
  activeSong: Song | null;

  /** Indicates whether the song should currently be playing. */
  isPlaying: boolean;

  /** The audio volume level (range: 0.0 to 1.0). */
  volume: number;

  /** The current playback position (in seconds). */
  seekTime: number;

  /** Whether the audio should repeat when finished. */
  repeat: boolean;

  /** Callback function triggered when the audio playback ends. */
  onEnded: () => void;

  /** Callback function triggered periodically during playback (used for progress tracking). */
  onTimeUpdate: (event: React.SyntheticEvent<HTMLAudioElement, Event>) => void;

  /** Callback function triggered when audio metadata is loaded (e.g., duration). */
  onLoadedData: (event: React.SyntheticEvent<HTMLAudioElement, Event>) => void;
};

/**
 * 🎵 Player Component
 * 
 * This component manages the audio element responsible for playing back the active song.
 * It handles:
 * - Play/Pause control based on `isPlaying`
 * - Volume adjustment
 * - Seeking (jumping to a specific playback time)
 * - Repeat looping
 * - Emitting callbacks for progress updates and when playback ends
 * 
 * The component supports both iTunes and Deezer API response structures.
 */
const Player: React.FC<PlayerProps> = ({
  activeSong,
  isPlaying,
  volume,
  seekTime,
  repeat,
  onEnded,
  onTimeUpdate,
  onLoadedData,
}) => {
  // Reference to the <audio> element in the DOM
  const ref = useRef<HTMLAudioElement>(null);

  /**
   * Handles play/pause state when the song or play status changes.
   * Automatically plays or pauses the audio.
   */
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    if (isPlaying) {
      // Attempt to play the audio, handling browser autoplay restrictions
      audio.play().catch((err) => console.warn('Autoplay blocked:', err));
    } else {
      audio.pause();
    }
  }, [isPlaying, activeSong]);

  /**
   * Updates the audio element’s volume whenever the `volume` prop changes.
   */
  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume;
    }
  }, [volume]);

  /**
   * Seeks to a specific time in the song whenever `seekTime` changes.
   */
  useEffect(() => {
    if (ref.current) {
      ref.current.currentTime = seekTime;
    }
  }, [seekTime]);

  /**
   * Determines the correct audio source.
   * Uses iTunes `previewUrl` if available, otherwise falls back to Deezer’s `hub.actions` URI.
   */
  const audioSrc = activeSong?.previewUrl || activeSong?.hub?.actions?.[1]?.uri;

  // If no valid audio source is available, render nothing.
  if (!audioSrc) return null;

  return (
    <audio
      ref={ref}
      src={audioSrc}
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
    />
  );
};

export default Player;
