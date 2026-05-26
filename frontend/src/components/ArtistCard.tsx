// src/components/ArtistCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Represents the structure of an artist object.
 */
type Artist = {
  /** The artist’s unique ID (optional). */
  adamid?: string;
};

/**
 * Represents the structure of a track object for artist display.
 */
type Track = {
  /** Artist or song subtitle (used to extract main artist name). */
  subtitle?: string;

  /** Image information for the track or artist. */
  images?: {
    /** URL to the cover art image. */
    coverart?: string;
  };

  /** List of associated artists (optional). */
  artists?: Artist[];
};

/**
 * Props for the ArtistCard component.
 */
type ArtistCardProps = {
  /** Track object containing artist information and images. */
  track: Track;
};

/**
 * 🎨 ArtistCard Component
 *
 * Displays a card for a single artist with cover art and artist name.
 * Clicking the card navigates to a dynamic artist page.
 */
const ArtistCard: React.FC<ArtistCardProps> = ({ track }) => {
  // React Router navigation hook
  const navigate = useNavigate();

  /**
   * Handles click event on the artist card.
   * - Extracts main artist name from subtitle
   * - Navigates to `/artists/<artistName>` page
   */
  const handleClick = () => {
    const artistName = track?.subtitle?.split('&')[0]?.split('feat.')[0]?.trim();
    if (artistName) {
      navigate(`/artists/${encodeURIComponent(artistName)}`);
    }
  };

  return (
    <div
      className="flex w-full max-w-[280px] flex-col p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer"
      onClick={handleClick}
    >
      {/**
       * Artist Cover Art Image
       * - Displays rounded image
       * - Fills card width and fixed height
       */}
      <img
        alt="artist_img"
        src={track?.images?.coverart}
        className="w-full aspect-square rounded-lg object-cover"
      />

      {/**
       * Artist Name
       * - Extracts main artist from subtitle
       * - Truncated for long names
       * - Centered text
       */}
      <p className="mt-4 font-semibold text-lg text-white truncate text-center">
        {track?.subtitle?.split('&')[0]?.split('feat.')[0]?.trim()}
      </p>
    </div>
  );
};

export default ArtistCard;
