// src/components/MusicPlayer/VolumeBar.tsx

import React from 'react';
import {
  BsFillVolumeUpFill,
  BsVolumeDownFill,
  BsFillVolumeMuteFill,
} from 'react-icons/bs';

/**
 * Props for the VolumeBar component.
 * Handles volume control logic and visual state representation.
 */
type VolumeBarProps = {
  /** Current volume level (0–1 range typically). */
  value: number;

  /** Minimum volume value allowed (usually 0). */
  min: number;

  /** Maximum volume value allowed (usually 1). */
  max: number;

  /** Updates the volume level when user interacts with icons. */
  setVolume: (volume: number) => void;

  /** Triggered when user drags the range slider to change volume. */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * 🔊 VolumeBar Component
 *
 * Provides interactive volume control functionality for the music player.
 * It includes:
 * - Dynamic volume icon updates (mute, low, medium)
 * - A slider for granular volume adjustments
 * - Clickable icons to instantly mute or unmute sound
 *
 * **Responsive behavior:**
 * - Hidden on smaller screens (`hidden lg:flex`)
 * - Visible and aligned to the right on large devices
 *
 * @component
 * @example
 * ```tsx
 * <VolumeBar
 *   value={volume}
 *   min={0}
 *   max={1}
 *   setVolume={setVolume}
 *   onChange={handleVolumeChange}
 * />
 * ```
 */
const VolumeBar: React.FC<VolumeBarProps> = ({
  value,
  min,
  max,
  onChange,
  setVolume,
}) => (
  <div className="hidden lg:flex flex-1 items-center justify-end">
    {/**
     * Volume Up Icon
     *
     * Displayed when the volume is between 0.5 and 1.
     * Clicking it instantly mutes the audio by setting volume to 0.
     */}
    {value <= 1 && value > 0.5 && (
      <BsFillVolumeUpFill size={25} color="#FFF" onClick={() => setVolume(0)} />
    )}

    {/**
     * Volume Down Icon
     *
     * Displayed when the volume is between 0 and 0.5.
     * Clicking it also mutes the audio completely.
     */}
    {value <= 0.5 && value > 0 && (
      <BsVolumeDownFill size={25} color="#FFF" onClick={() => setVolume(0)} />
    )}

    {/**
     * Volume Mute Icon
     *
     * Displayed when the volume is exactly 0 (muted).
     * Clicking it restores the volume to maximum (1).
     */}
    {value === 0 && (
      <BsFillVolumeMuteFill size={25} color="#FFF" onClick={() => setVolume(1)} />
    )}

    {/**
     * Volume Slider
     *
     * Allows fine-grained volume adjustment between min and max values.
     * Uses step 0.01 for smooth transitions.
     * Adjusts width based on screen size for responsive design.
     */}
    <input
      type="range"
      step={0.01}
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      className="2xl:w-40 lg:w-32 md:w-32 h-1 ml-2"
    />
  </div>
);

export default VolumeBar;
