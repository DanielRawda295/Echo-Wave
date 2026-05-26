// src/components/DetailsHeader.tsx

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Artist attributes structure.
 */
type ArtistAttributes = {
  /** Artist's name. */
  name?: string;

  /** Artist's artwork information. */
  artwork?: {
    /** URL for the artist's artwork image. */
    url?: string;
  };

  /** List of artist's genre names. */
  genreNames?: string[];
};

/**
 * Artist data structure containing attributes.
 */
type ArtistData = {
  /** Optional attributes of the artist. */
  attributes?: ArtistAttributes;
};

/**
 * Song image information.
 */
type SongImages = {
  /** URL for song cover art. */
  coverart?: string;
};

/**
 * Song data structure.
 */
type SongData = {
  /** Song title. */
  title?: string;

  /** Song subtitle or artist name. */
  subtitle?: string;

  /** Song images (cover art). */
  images?: SongImages;

  /** List of associated artists. */
  artists?: { adamid?: string }[];

  /** Song genre information. */
  genres?: {
    /** Primary genre of the song. */
    primary?: string;
  };
};

/**
 * Props for the DetailsHeader component.
 */
type DetailsHeaderProps = {
  /** Optional artist ID to determine whether to display artist or song details. */
  artistId?: string;

  /** Optional artist data object. */
  artistData?: ArtistData;

  /** Optional song data object. */
  songData?: SongData;
};

/**
 * 🎵 DetailsHeader Component
 *
 * Displays a header section for song or artist details.
 * Features:
 * - Artist or song cover image display with fallback
 * - Song title or artist name
 * - Artist link to detail page if available
 * - Primary genre or artist genres
 */
const DetailsHeader: React.FC<DetailsHeaderProps> = ({
  artistId,
  artistData,
  songData,
}) => (
  <div className="relative w-full flex flex-col">
    {/** Gradient background for header */}
    <div className="w-full bg-linear-to-l from-transparent to-black sm:h-48 h-28" />

    {/** Main content: image and text */}
    <div className="absolute inset-0 flex items-center">
      {/**
       * Profile / cover image
       * - Displays artist artwork if artistId is present
       * - Fallback to song cover art or default image
       * - Rounded, bordered, and shadowed for UI consistency
       */}
      <img
        alt="profile"
        src={
          artistId
            ? artistData?.attributes?.artwork?.url ||
              songData?.images?.coverart ||
              '/default-artist.png'
            : songData?.images?.coverart
        }
        className="sm:w-48 w-28 sm:h-48 h-28 rounded-full object-cover border-2 shadow-xl shadow-black"
      />

      {/** Title and additional details */}
      <div className="ml-5">
        {/**
         * Artist name or song title
         * - Bold text with responsive sizing
         * - Fallback text if name/title is missing
         */}
        <p className="font-bold sm:text-3xl text-xl text-white">
          {artistId ? artistData?.attributes?.name || 'Unknown Artist' : songData?.title}
        </p>

        {/**
         * Song subtitle as clickable link to artist page
         * - Only displayed when artistId is not present
         */}
        {!artistId && songData?.subtitle && (
          <Link to={`/artists/${songData?.artists?.[0]?.adamid}`}>
            <p className="text-base text-gray-400 mt-2">{songData.subtitle}</p>
          </Link>
        )}

        {/**
         * Primary genre or artist genre
         * - Displays first genre from list
         * - Fallback text if unavailable
         */}
        <p className="text-base text-gray-400 mt-2">
          {artistId
            ? artistData?.attributes?.genreNames?.[0] || 'Various Genres'
            : songData?.genres?.primary}
        </p>
      </div>
    </div>

    {/** Spacer div to prevent content overlap */}
    <div className="w-full sm:h-44 h-24" />
  </div>
);

export default DetailsHeader;
